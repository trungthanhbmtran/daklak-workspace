/** Internal-account defaults; tune against the agency's approved security policy. */
export const AUTH_DEFAULTS = { accessSeconds: 900, absoluteSeconds: 28800, idleSeconds: 1800, failureLimit: 5, failureWindowSeconds: 900 } as const;
export interface RefreshSession { userId: number; sessionId: string; expiresAt: number }
export function positiveSeconds(value: unknown, fallback: number): number {
  const text = String(value ?? fallback);
  const match = /^(\d+)(s|m|h|d)?$/i.exec(text);
  const multiplier = ({ s: 1, m: 60, h: 3600, d: 86400 } as Record<string, number>)[(match?.[2] || 's').toLowerCase()];
  const seconds = Number(match?.[1]) * multiplier;
  if (!Number.isSafeInteger(seconds) || seconds <= 0) throw new Error('Invalid authentication duration');
  return seconds;
}
// Redis TIME is authoritative; idle renewal never extends the absolute session deadline.
// Both gateway and issuer execute the same atomic check, including password-reset revocation.
export const TOUCH_AUTH_SESSION = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end
local s = cjson.decode(raw)
local now = tonumber(redis.call('TIME')[1])
local version = tonumber(redis.call('GET', KEYS[2]) or '0')
if tostring(s.userId) ~= ARGV[1] or s.version ~= version or s.expiresAt <= now then
  redis.call('DEL', KEYS[1])
  return 0
end
redis.call('EXPIRE', KEYS[1], math.min(tonumber(ARGV[2]), s.expiresAt - now))
return 1
`;

