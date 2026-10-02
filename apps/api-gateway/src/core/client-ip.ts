import { isIP } from 'net';
import type { Request } from 'express';

// Configure Express once; callers must never parse forwarded headers themselves.
export function trustedProxyAddresses(value?: string): false | string[] {
  if (!value?.trim()) return false;
  const addresses = value.split(',').map((entry) => entry.trim());
  if (addresses.length > 32)
    throw new Error('Too many TRUSTED_PROXY_CIDRS entries');
  for (const entry of addresses) {
    const [address, prefix, extra] = entry.split('/');
    const family = isIP(address);
    if (
      !family ||
      extra !== undefined ||
      (prefix !== undefined &&
        (!/^\d+$/.test(prefix) ||
          Number(prefix) < 1 ||
          Number(prefix) > (family === 4 ? 32 : 128)))
    ) {
      throw new Error(
        'TRUSTED_PROXY_CIDRS must contain explicit IP addresses or CIDRs; trusting every client is forbidden',
      );
    }
  }
  return [...new Set(addresses)];
}

export function clientIp(
  request: Pick<Partial<Request>, 'ip' | 'socket'>,
): string {
  const ip = request.ip || request.socket?.remoteAddress || 'unknown';
  return ip.startsWith('::ffff:') && isIP(ip.slice(7)) === 4 ? ip.slice(7) : ip;
}
