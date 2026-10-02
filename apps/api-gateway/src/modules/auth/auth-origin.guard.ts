import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Reject cross-origin browser auth writes; server/mobile calls without Origin remain supported. */
@Injectable()
export class AuthOriginGuard implements CanActivate {
  private readonly trustedOrigins = (process.env.AUTH_TRUSTED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => new URL(value).origin);
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const origin = req.headers.origin;
    if (!origin) return true;
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new ForbiddenException('Nguồn yêu cầu xác thực không hợp lệ');
    }
    if (!['http:', 'https:'].includes(parsed.protocol))
      throw new ForbiddenException('Nguồn yêu cầu xác thực không hợp lệ');
    const allowed = this.trustedOrigins.length
      ? this.trustedOrigins.includes(parsed.origin)
      : parsed.host === req.headers.host;
    if (!allowed)
      throw new ForbiddenException('Nguồn yêu cầu xác thực không được phép');
    return true;
  }
}
