import {
  Injectable,
  Inject,
  OnModuleInit,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
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
import { AUTH_JWT } from '../../../../../shared/core/auth-session';
import { SSO_GRANT_AUDIENCE } from '../../../../../shared/security/sso-assertion';
import { AUTH_DEFAULTS } from '../../../../../shared/core/auth-session';
import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import type { AuthTokens } from './auth-cookies';
import type { LoginDto, RefreshTokenDto } from './auth.dto';

// Method shapes follow shared/protos/users/user.proto and hrm/employee.proto.
interface UserProfile extends Record<string, unknown> {
  id: number;
  isActive?: boolean;
  employeeCode?: string;
  fullName?: string;
  avatarUrl?: string;
}
interface SessionGrant extends Omit<AuthTokens, 'accessToken'> {
  userId: number; sessionId: string; authVersion: number;
}
interface UserAuthGrpc {
  LoginSso(input: { assertion: string }): Observable<SessionGrant>;
  GetAuthState(input: { id: number; sessionId: string }): Observable<AuthState>;
  Login(data: {
    usernameOrEmail: string;
    password: string;
    ipAddress?: string; requestId?: string;
  }): Observable<SessionGrant>;
  Refresh(data: { refreshToken: string; ipAddress?: string; requestId?: string }): Observable<SessionGrant>;
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
export type AuthRequest = Pick<Partial<Request>, 'cookies' | 'ip' | 'socket'> & {
  user?: { id?: unknown };
};

@Injectable()
export class AuthService implements OnModuleInit {
  private userGrpcService!: UserAuthGrpc;
  private employeeGrpcService!: EmployeeGrpc;
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: ClientGrpc,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL)
    private readonly employeeClient: ClientGrpc,
    private readonly issuer: TokenIssuerService,
  ) {}
  onModuleInit() {
    this.userGrpcService = this.userClient.getService<UserAuthGrpc>(
      MICROSERVICES.USER.SERVICE,
    );
    this.employeeGrpcService = this.employeeClient.getService<EmployeeGrpc>(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
  }
  private rpcCode(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;
    const code = (error as { code?: unknown }).code;
    return typeof code === 'number' ? code : undefined;
  }
  private logFailure(operation: string, error: unknown) {
    // Internal messages may include request data; record only safe diagnostic fields.
    this.logger.warn(
      JSON.stringify({
        operation,
        grpcCode: this.rpcCode(error),
        reason: error instanceof TimeoutError ? 'timeout' : 'service_error',
      }),
    );
  }
  private authError(error: unknown): Error {
    if (error instanceof HttpException) return error;
    const code = this.rpcCode(error);
    if (code === status.UNAUTHENTICATED)
      return new UnauthorizedException(
        'Thông tin đăng nhập không hợp lệ hoặc đã hết hạn',
      );
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
      return new BadRequestException('Thông tin đăng nhập không hợp lệ');
    this.logFailure('AUTH_SERVICE', error);
    if (code === status.DEADLINE_EXCEEDED || error instanceof TimeoutError)
      return new GatewayTimeoutException(
        'Dịch vụ xác thực phản hồi quá thời hạn. Vui lòng thử lại.',
      );
    return new ServiceUnavailableException(
      'Dịch vụ xác thực tạm thời không khả dụng. Vui lòng thử lại.',
    );
  }
  private async establishSession(res: Response, result: SessionGrant) {
    const deadline =
      Number.isFinite(result?.expiresIn) && result.expiresIn > 0
        ? Date.now() + result.expiresIn * 1000
        : NaN;
    const date = new Date(deadline);
    if (!Number.isFinite(date.getTime()))
      throw new Error('Invalid authentication lifetime');
    const expiresAt = date.toISOString();
    if (!Number.isSafeInteger(result.userId) || result.userId < 1 ||
      !Number.isSafeInteger(result.authVersion) || result.authVersion < 0 ||
      typeof result.sessionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(result.sessionId))
      throw new Error('Invalid session grant');
    const state = await firstValueFrom(this.userGrpcService.GetAuthState({ id: result.userId, sessionId: result.sessionId }).pipe(timeout(5000)));
    if (!state.isActive || !state.sessionActive || state.userId !== result.userId || state.authVersion !== result.authVersion)
      throw new UnauthorizedException('Tên đăng nhập hoặc mật khẩu không hợp lệ');
    setAuthCookies(res, { ...result, accessToken: this.issuer.signAccessToken(result.userId, result.expiresIn, result.sessionId, result.authVersion) });
    return { expiresAt };
  }
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
    try {
      const result = await firstValueFrom(
        this.userGrpcService
          .Login({ usernameOrEmail: loginKey, password: body.password, ipAddress: clientIp(req ?? {}), requestId: randomUUID() })
          .pipe(timeout(10000)),
      );
      return await this.establishSession(res, result);
    } catch (error) {
      throw this.authError(error);
    }
  }
  async loginSso(identity: { issuer: string; subject: string }, res: Response, req: AuthRequest) {
    const now = Math.floor(Date.now() / 1000);
    const assertion = this.issuer.signToken({ iss: AUTH_JWT.issuer, aud: SSO_GRANT_AUDIENCE, iat: now, exp: now + 30, jti: randomUUID(),
      issuerHash: createHash('sha256').update(identity.issuer).digest('hex'), subjectHash: createHash('sha256').update(identity.subject).digest('hex'),
      ipAddress: clientIp(req), requestId: randomUUID() });
    try {
      const grant = await firstValueFrom(this.userGrpcService.LoginSso({ assertion }).pipe(timeout(10000)));
      return await this.establishSession(res, grant);
    } catch (error) { throw this.authError(error); }
  }

  private refreshToken(
    body: RefreshTokenDto | undefined,
    req: AuthRequest,
  ): string {
    if (body?.refreshToken != null && typeof body.refreshToken !== 'string')
      throw new BadRequestException('refreshToken phải là chuỗi');
    const cookieToken: unknown = req.cookies?.refreshToken;
    return (
      body?.refreshToken?.trim() ||
      (typeof cookieToken === 'string' ? cookieToken.trim() : '')
    );
  }
  async refresh(
    body: RefreshTokenDto | undefined,
    req: AuthRequest,
    res: Response,
  ) {
    const token = this.refreshToken(body, req);
    if (!token) throw new UnauthorizedException('Thiếu refreshToken');
    try {
      const result = await firstValueFrom(
        this.userGrpcService
          .Refresh({ refreshToken: token, ipAddress: clientIp(req), requestId: randomUUID() })
          .pipe(timeout(10000)),
      );
      return await this.establishSession(res, result);
    } catch (error) {
      // A late failure must not clear a cookie created by a newer login/refresh.
      throw this.authError(error);
    }
  }
  async logout(req: AuthRequest, res: Response, body?: RefreshTokenDto) {
    // Local logout succeeds after cookie cleanup; remote revocation is best effort.
    clearAuthCookies(res);
    const token = this.refreshToken(body, req);
    if (token) {
      try {
        await firstValueFrom(
          this.userGrpcService
            .RevokeRefreshToken({ refreshToken: token })
            .pipe(timeout(5000)),
        );
      } catch (error) {
        this.logFailure('LOGOUT_REVOCATION', error);
      }
    }
    return { success: true };
  }
  async me(req: AuthRequest) {
    const rawId = req.user?.id;
    const userId =
      typeof rawId === 'number' || typeof rawId === 'string'
        ? Number(rawId)
        : NaN;
    if (!Number.isSafeInteger(userId) || userId <= 0 || userId > 2147483647)
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    const user = await firstValueFrom(
      this.userGrpcService.FindOne({ id: userId }).pipe(timeout(10000)),
    ).catch((error: unknown) => {
      if (this.rpcCode(error) === status.NOT_FOUND)
        throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
      throw this.authError(error);
    });
    if (!user?.id || user.id !== userId || user.isActive === false)
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    let hrm: EmployeeProfile | undefined;
    // Current user profile links HRM by employeeCode; no employeeId exists in UserResponse.
    if (user.employeeCode) {
      try {
        const response = await firstValueFrom(
          this.employeeGrpcService
            .GetEmployeeByCode({ code: user.employeeCode })
            .pipe(timeout(5000)),
        );
        hrm = response.data;
      } catch (error) {
        this.logFailure('GET_EMPLOYEE', error);
      }
    }
    return {
      ...user,
      fullName: hrm?.fullName || user.fullName,
      avatarUrl: hrm?.avatar || user.avatarUrl,
    };
  }
}


