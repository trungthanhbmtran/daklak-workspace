import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
  Inject,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import * as jwt from 'jsonwebtoken';
import { firstValueFrom, timeout, type Observable } from 'rxjs';
import { AUTH_JWT } from '../../../../../shared/core/auth-session';
import type { AuthState } from '../../../../../shared/security/gateway-context';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { RedisService } from '../../core/redis/redis.service';
import { MICROSERVICES } from '../../core/constants/services';

interface AuthStateRpc {
  GetAuthState(input: { id: number; sessionId: string }): Observable<AuthState>;
}
interface CacheEntry {
  data: Record<string, any>;
  expireAt: number;
}

@Injectable()
export class TokenValidatorService implements OnModuleInit {
  private grpc!: AuthStateRpc;
  private readonly logger = new Logger(TokenValidatorService.name);
  private readonly sessionCache = new Map<string, CacheEntry>();
  constructor(
    private readonly redisService: RedisService,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly client: ClientGrpc,
    private readonly issuer: TokenIssuerService,
  ) {}
  onModuleInit() {
    this.grpc = this.client.getService<AuthStateRpc>(
      MICROSERVICES.USER.SERVICE,
    );
  }

  public async getUserSession(
    userId: string | number,
    authVersion?: number,
  ): Promise<Record<string, any>> {
    const key = String(userId);
    const cached = this.sessionCache.get(key);
    if (
      cached &&
      cached.expireAt > Date.now() &&
      (authVersion === undefined || cached.data.authVersion === authVersion)
    ) {
      this.sessionCache.delete(key);
      this.sessionCache.set(key, cached);
      return cached.data;
    }
    const raw = await this.redisService.get('user_session:' + key);
    if (!raw) return {};
    const data = JSON.parse(raw) as Record<string, any>;
    if (this.sessionCache.size >= 1000) {
      const oldest = this.sessionCache.keys().next().value;
      if (oldest) this.sessionCache.delete(oldest);
    }
    this.sessionCache.set(key, { data, expireAt: Date.now() + 30000 });
    return data;
  }
  public invalidateSessionCache(userId: string | number) {
    this.sessionCache.delete(String(userId));
  }

  public async verifyToken(
    token: string,
    ipAddress?: string,
    renewActivity = true,
  ): Promise<Record<string, any>> {
    let decoded: jwt.JwtPayload;
    try {
      const value = jwt.verify(
        token,
        this.issuer.getPublicKeyDetails().publicKey,
        {
          algorithms: ['RS256'],
          issuer: AUTH_JWT.issuer,
          audience: AUTH_JWT.audience,
        },
      );
      if (typeof value === 'string') throw new Error('Invalid payload');
      decoded = value;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new UnauthorizedException('ACCESS_TOKEN_EXPIRED');
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }
    if (
      !decoded.sub ||
      !/^[1-9]\d*$/.test(decoded.sub) ||
      Number(decoded.sub) > 2147483647 ||
      typeof decoded.sid !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(decoded.sid) ||
      typeof decoded.jti !== 'string' ||
      typeof decoded.exp !== 'number' ||
      !Number.isSafeInteger(decoded.authVersion) ||
      decoded.authVersion < 0
    )
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');

    let state: AuthState,
      profile: Record<string, any>,
      active: boolean,
      revoked: string | null;
    try {
      [state, profile, active, revoked] = await Promise.all([
        firstValueFrom(
          this.grpc
            .GetAuthState({ id: Number(decoded.sub), sessionId: decoded.sid })
            .pipe(timeout(5000)),
        ),
        this.getUserSession(decoded.sub, decoded.authVersion as number),
        this.redisService.touchAuthSession(
          decoded.sid,
          decoded.sub,
          decoded.authVersion as number,
          renewActivity,
        ),
        this.redisService.get('denylist:' + decoded.jti),
      ]);
    } catch {
      this.logger.warn(
        JSON.stringify({
          event: 'AUTH_DEPENDENCY_UNAVAILABLE',
          ip: ipAddress ?? 'unknown',
        }),
      );
      throw new ServiceUnavailableException(
        'Dịch vụ xác thực tạm thời không khả dụng',
      );
    }
    if (
      !state.isActive ||
      !state.sessionActive ||
      state.userId !== Number(decoded.sub) ||
      state.authVersion !== decoded.authVersion ||
      !active ||
      revoked
    )
      throw new UnauthorizedException(
        'Phiên đăng nhập đã hết hạn hoặc bị thu hồi',
      );
    if (
      !Object.keys(profile).length ||
      profile.authVersion !== decoded.authVersion
    )
      throw new UnauthorizedException('Phiên đăng nhập cần được làm mới');
    return { ...profile, ...decoded, id: Number(decoded.sub) };
  }
}
