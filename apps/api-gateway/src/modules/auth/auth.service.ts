import {
  Injectable,
  Inject,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom, timeout, TimeoutError, type Observable } from 'rxjs';
import type { Request, Response } from 'express';
import { MICROSERVICES } from '../../core/constants/services';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import type { AuthState } from '../../../../../shared/security/gateway-context';
import { clientIp } from '../../core/client-ip';
import { randomUUID, createHash } from 'crypto';
import {
  AUTH_DEFAULTS,
  AUTH_JWT,
  getAuthPolicy,
} from '../../../../../shared/core/auth-session';
import { SSO_GRANT_AUDIENCE } from '../../../../../shared/security/sso-assertion';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import type { AuthTokens } from './auth-cookies';
import type { LoginDto, RefreshTokenDto } from './auth.dto';

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const TIMEOUT_MS = {
  auth: 10_000, // Login / Refresh / LoginSso
  profile: 10_000, // FindOne
  state: 5_000, // GetAuthState
  hrm: 5_000, // GetEmployeeByCode
  revoke: 5_000, // RevokeRefreshToken
} as const;

const MAX_INT32 = 2_147_483_647;
const MAX_REFRESH_TOKEN_LENGTH = 4096;
const MAX_SSO_CLAIM_LENGTH = 512;
const SSO_ASSERTION_TTL_SECONDS = 30;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Chỉ nhận x-request-id an toàn (tránh log injection / id quá dài)
const REQUEST_ID_RE = /^[A-Za-z0-9._-]{8,64}$/;

/**
 * Whitelist field trả về cho /auth/me. KHÔNG spread nguyên object từ user service
 * để tránh vô tình lộ trường nội bộ. Chỉnh danh sách này theo nhu cầu frontend.
 */
const PROFILE_FIELDS = [
  'id',
  'username',
  'email',
  'employeeCode',
  'fullName',
  'avatarUrl',
  'phone',
] as const;

const MSG_INVALID_CREDENTIALS =
  'Thông tin đăng nhập không hợp lệ hoặc đã hết hạn';
const MSG_INVALID_LOGIN = 'Tên đăng nhập hoặc mật khẩu không hợp lệ';
const MSG_INVALID_SESSION = 'Phiên đăng nhập không hợp lệ';

/** Upstream trả grant sai định dạng -> lỗi phía upstream (502), không phải 503. */
class InvalidGrantError extends Error { }

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

// Method shapes follow shared/protos/users/user.proto and hrm/employee.proto.
interface UserProfile extends Record<string, unknown> {
  id: number;
  isActive?: boolean;
  employeeCode?: string;
  fullName?: string;
  avatarUrl?: string;
}
interface SessionGrant extends Omit<AuthTokens, 'accessToken'> {
  userId: number;
  sessionId: string;
  authVersion: number;
}
interface UserAuthGrpc {
  LoginSso(input: { assertion: string }): Observable<SessionGrant>;
  GetAuthState(input: { id: number; sessionId: string }): Observable<AuthState>;
  Login(data: {
    usernameOrEmail: string;
    password: string;
    ipAddress?: string;
    requestId?: string;
  }): Observable<SessionGrant>;
  Refresh(data: {
    refreshToken: string;
    ipAddress?: string;
    requestId?: string;
  }): Observable<SessionGrant>;
  RevokeRefreshToken(data: {
    refreshToken: string;
  }): Observable<{ success: boolean }>;
  FindOne(data: { id: number }): Observable<UserProfile | null>;
}
interface EmployeeProfile {
  fullName?: string;
  avatar?: string;
}
interface EmployeeGrpc {
  GetEmployeeByCode(data: {
    code: string;
  }): Observable<{ data?: EmployeeProfile }>;
}
export type AuthRequest = Pick<
  Partial<Request>,
  'cookies' | 'ip' | 'socket' | 'headers'
> & {
  user?: { id?: unknown };
};

/* -------------------------------------------------------------------------- */
/* Service                                                                     */
/* -------------------------------------------------------------------------- */

@Injectable()
export class AuthService implements OnModuleInit {
  private userGrpcService!: UserAuthGrpc;
  private employeeGrpcService!: EmployeeGrpc;
  private readonly logger = new Logger(AuthService.name);
  /** Fail-fast lúc khởi động nếu cấu hình AUTH_* sai. */
  private readonly policy = getAuthPolicy();

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: ClientGrpc,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL)
    private readonly employeeClient: ClientGrpc,
    private readonly issuer: TokenIssuerService,
  ) { }

  onModuleInit() {
    this.userGrpcService = this.userClient.getService<UserAuthGrpc>(
      MICROSERVICES.USER.SERVICE,
    );
    this.employeeGrpcService = this.employeeClient.getService<EmployeeGrpc>(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
  }

  /* ----------------------------- error handling ---------------------------- */

  private rpcCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;
    const code = (error as { code?: unknown }).code;
    return typeof code === 'number' ? code : undefined;
  }

  private isTransient(error: unknown): boolean {
    const code = this.rpcCode(error);
    return (
      error instanceof TimeoutError ||
      code === status.UNAVAILABLE ||
      code === status.DEADLINE_EXCEEDED
    );
  }

  private logFailure(
    operation: string,
    error: unknown,
    opts: { level?: 'warn' | 'error'; requestId?: string } = {},
  ) {
    // Internal messages may include request data; record only safe diagnostic fields.
    const line = JSON.stringify({
      operation,
      requestId: opts.requestId,
      grpcCode: this.rpcCode(error),
      reason:
        error instanceof TimeoutError
          ? 'timeout'
          : error instanceof InvalidGrantError
            ? 'invalid_grant'
            : 'service_error',
    });
    if (opts.level === 'error') this.logger.error(line);
    else this.logger.warn(line);
  }

  private authError(error: unknown): Error {
    if (error instanceof HttpException) return error;

    if (error instanceof InvalidGrantError) {
      this.logFailure('AUTH_INVALID_GRANT', error, { level: 'error' });
      return new BadGatewayException(
        'Dịch vụ xác thực trả về dữ liệu không hợp lệ.',
      );
    }

    const code = this.rpcCode(error);
    if (code === status.UNAUTHENTICATED)
      return new UnauthorizedException(MSG_INVALID_CREDENTIALS);
    if (code === status.ABORTED)
      return new ConflictException(
        'Phiên đang được làm mới. Vui lòng thử lại.',
      );
    if (code === status.RESOURCE_EXHAUSTED)
      return new HttpException(
        'Tạm thời không thể đăng nhập. Vui lòng thử lại sau.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    if (code === status.INVALID_ARGUMENT)
      return new BadRequestException(MSG_INVALID_LOGIN);

    // Tài khoản không tồn tại / bị khoá / thiếu quyền: trả CÙNG một thông báo 401
    // để không lộ trạng thái tài khoản, nhưng vẫn log mã gRPC cho vận hành.
    if (
      code === status.NOT_FOUND ||
      code === status.PERMISSION_DENIED ||
      code === status.FAILED_PRECONDITION
    ) {
      this.logFailure('AUTH_DENIED', error);
      return new UnauthorizedException(MSG_INVALID_CREDENTIALS);
    }

    this.logFailure('AUTH_SERVICE', error);
    if (code === status.DEADLINE_EXCEEDED || error instanceof TimeoutError)
      return new GatewayTimeoutException(
        'Dịch vụ xác thực phản hồi quá thời hạn. Vui lòng thử lại.',
      );
    return new ServiceUnavailableException(
      'Dịch vụ xác thực tạm thời không khả dụng. Vui lòng thử lại.',
    );
  }

  /* -------------------------------- helpers -------------------------------- */

  /** Dùng lại x-request-id (nếu hợp lệ) để truy vết xuyên service. */
  private requestId(req?: AuthRequest): string {
    const header = req?.headers?.['x-request-id'];
    const value = Array.isArray(header) ? header[0] : header;
    return typeof value === 'string' && REQUEST_ID_RE.test(value)
      ? value
      : randomUUID();
  }

  /** Chỉ dùng cho lời gọi idempotent (đọc / thu hồi): retry 1 lần khi lỗi tạm thời. */
  private async callWithRetry<T>(
    call: () => Observable<T>,
    ms: number,
  ): Promise<T> {
    try {
      return await firstValueFrom(call().pipe(timeout(ms)));
    } catch (error) {
      if (!this.isTransient(error)) throw error;
      return firstValueFrom(call().pipe(timeout(ms)));
    }
  }

  private assertValidGrant(grant: SessionGrant): void {
    if (
      !grant ||
      !Number.isFinite(grant.expiresIn) ||
      Math.floor(grant.expiresIn) < 1 ||
      !Number.isSafeInteger(grant.userId) ||
      grant.userId < 1 ||
      !Number.isSafeInteger(grant.authVersion) ||
      grant.authVersion < 0 ||
      typeof grant.sessionId !== 'string' ||
      !UUID_RE.test(grant.sessionId)
    ) {
      throw new InvalidGrantError('Invalid session grant');
    }
  }

  private async establishSession(
    res: Response,
    grant: SessionGrant,
    invalidMessage: string = MSG_INVALID_LOGIN,
  ) {
    this.assertValidGrant(grant);

    // GetAuthState là lời gọi đọc (idempotent) -> retry 1 lần để giảm nguy cơ
    // mất token vừa xoay vòng (Refresh) chỉ vì một lỗi mạng thoáng qua.
    const state = await this.callWithRetry(
      () =>
        this.userGrpcService.GetAuthState({
          id: grant.userId,
          sessionId: grant.sessionId,
        }),
      TIMEOUT_MS.state,
    );
    if (
      !state?.isActive ||
      !state.sessionActive ||
      state.userId !== grant.userId ||
      state.authVersion !== grant.authVersion
    )
      throw new UnauthorizedException(invalidMessage);

    // Không tin tuyệt đối upstream: chặn trên bởi chính sách của gateway.
    const ttl = Math.min(Math.floor(grant.expiresIn), this.policy.accessSeconds);

    const accessToken = this.issuer.signAccessToken(
      grant.userId,
      ttl,
      grant.sessionId,
      grant.authVersion,
    );
    // Tính sau khi ký để expiresAt không sớm hơn `exp` thật của token.
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

    // Xóa các cookie cũ ở các path khác (vd: /admin) để tránh bị đè (shadow) khi login lại
    clearAuthCookies(res);
    setAuthCookies(res, { ...grant, expiresIn: ttl, accessToken });
    return { expiresAt };
  }

  /* --------------------------------- login --------------------------------- */

  async login(body: LoginDto, res: Response, req?: AuthRequest) {
    const username =
      typeof body?.username === 'string' ? body.username.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const loginKey = username || email;
    if (
      !loginKey ||
      loginKey.length > AUTH_DEFAULTS.loginIdentifierMaxLength ||
      typeof body?.password !== 'string' ||
      !body.password.trim() ||
      Buffer.byteLength(body.password, 'utf8') > AUTH_DEFAULTS.passwordMaxBytes
    ) {
      throw new BadRequestException(
        'Vui lòng gửi username hoặc email kèm password hợp lệ để đăng nhập.',
      );
    }
    const requestId = this.requestId(req);
    try {
      const result = await firstValueFrom(
        this.userGrpcService
          .Login({
            usernameOrEmail: loginKey,
            password: body.password,
            ipAddress: clientIp(req ?? {}),
            requestId,
          })
          .pipe(timeout(TIMEOUT_MS.auth)),
      );
      return await this.establishSession(res, result);
    } catch (error) {
      throw this.authError(error);
    }
  }

  async loginSso(
    identity: { issuer: string; subject: string },
    res: Response,
    req: AuthRequest,
  ) {
    // Validate trước khi hash/ký: input sai không được thành lỗi 500 không log.
    const issuer = this.ssoClaim(identity?.issuer);
    const subject = this.ssoClaim(identity?.subject);
    const requestId = this.requestId(req);

    try {
      const now = Math.floor(Date.now() / 1000);
      const assertion = this.issuer.signToken({
        iss: AUTH_JWT.issuer,
        aud: SSO_GRANT_AUDIENCE,
        iat: now,
        exp: now + SSO_ASSERTION_TTL_SECONDS,
        jti: randomUUID(),
        issuerHash: createHash('sha256').update(issuer).digest('hex'),
        subjectHash: createHash('sha256').update(subject).digest('hex'),
        ipAddress: clientIp(req),
        requestId,
      });
      const grant = await firstValueFrom(
        this.userGrpcService
          .LoginSso({ assertion })
          .pipe(timeout(TIMEOUT_MS.auth)),
      );
      return await this.establishSession(res, grant);
    } catch (error) {
      throw this.authError(error);
    }
  }

  private ssoClaim(value: unknown): string {
    if (
      typeof value !== 'string' ||
      value.length === 0 ||
      value.length > MAX_SSO_CLAIM_LENGTH
    )
      throw new UnauthorizedException('Thông tin đăng nhập SSO không hợp lệ');
    return value; // không trim: hash phải khớp đúng giá trị gốc
  }

  /* --------------------------------- refresh -------------------------------- */

  /** `lenient`: bỏ qua token sai kiểu/quá dài thay vì ném lỗi (dùng cho logout). */
  private refreshToken(
    body: RefreshTokenDto | undefined,
    req: AuthRequest,
    lenient = false,
  ): string {
    const bodyToken: unknown = body?.refreshToken;
    if (bodyToken != null && typeof bodyToken !== 'string' && !lenient)
      throw new BadRequestException('refreshToken phải là chuỗi');

    const cookieToken: unknown = req.cookies?.refreshToken;
    const token =
      (typeof bodyToken === 'string' ? bodyToken.trim() : '') ||
      (typeof cookieToken === 'string' ? cookieToken.trim() : '');

    if (token.length > MAX_REFRESH_TOKEN_LENGTH) {
      if (lenient) return '';
      throw new UnauthorizedException(MSG_INVALID_CREDENTIALS);
    }
    return token;
  }

  async refresh(
    body: RefreshTokenDto | undefined,
    req: AuthRequest,
    res: Response,
  ) {
    const token = this.refreshToken(body, req);
    if (!token) throw new UnauthorizedException('Thiếu refreshToken');
    const requestId = this.requestId(req);
    try {
      const result = await firstValueFrom(
        this.userGrpcService
          .Refresh({
            refreshToken: token,
            ipAddress: clientIp(req),
            requestId,
          })
          .pipe(timeout(TIMEOUT_MS.auth)),
      );
      return await this.establishSession(res, result, MSG_INVALID_SESSION);
    } catch (error) {
      // A late failure must not clear a cookie created by a newer login/refresh.
      throw this.authError(error);
    }
  }

  /* --------------------------------- logout -------------------------------- */

  async logout(req: AuthRequest, res: Response, body?: RefreshTokenDto) {
    // Local logout succeeds after cookie cleanup; remote revocation is best effort.
    clearAuthCookies(res);
    const requestId = this.requestId(req);
    const token = this.refreshToken(body, req, true);
    if (token) {
      try {
        await this.callWithRetry(
          () => this.userGrpcService.RevokeRefreshToken({ refreshToken: token }),
          TIMEOUT_MS.revoke,
        );
      } catch (error) {
        // Thu hồi thất bại = token còn dùng được phía server -> mức error để cảnh báo.
        this.logFailure('LOGOUT_REVOCATION', error, {
          level: 'error',
          requestId,
        });
      }
    }
    return { };
  }

  /* ----------------------------------- me ---------------------------------- */

  private parseUserId(raw: unknown): number {
    const value =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string' && /^\d{1,10}$/.test(raw)
          ? Number(raw)
          : NaN;
    if (!Number.isSafeInteger(value) || value <= 0 || value > MAX_INT32)
      throw new UnauthorizedException(MSG_INVALID_SESSION);
    return value;
  }

  async me(req: AuthRequest) {
    const userId = this.parseUserId(req.user?.id);

    let user: UserProfile | null;
    try {
      user = await firstValueFrom(
        this.userGrpcService
          .FindOne({ id: userId })
          .pipe(timeout(TIMEOUT_MS.profile)),
      );
    } catch (error) {
      if (this.rpcCode(error) === status.NOT_FOUND)
        throw new UnauthorizedException(MSG_INVALID_SESSION);
      throw this.authError(error);
    }
    if (!user?.id || user.id !== userId || user.isActive === false)
      throw new UnauthorizedException(MSG_INVALID_SESSION);

    let hrm: EmployeeProfile | undefined;
    // Current user profile links HRM by employeeCode; no employeeId exists in UserResponse.
    if (user.employeeCode) {
      try {
        const response = await firstValueFrom(
          this.employeeGrpcService
            .GetEmployeeByCode({ code: user.employeeCode })
            .pipe(timeout(TIMEOUT_MS.hrm)),
        );
        hrm = response.data;
      } catch (error) {
        this.logFailure('GET_EMPLOYEE', error);
      }
    }

    const profile: Record<string, unknown> = {};
    for (const key of PROFILE_FIELDS) {
      if (user[key] !== undefined) profile[key] = user[key];
    }
    return {
      ...profile,
      fullName: hrm?.fullName || user.fullName,
      avatarUrl: hrm?.avatar || user.avatarUrl,
    };
  }
}