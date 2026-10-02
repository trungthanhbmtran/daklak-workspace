/** Deployment defaults for internal accounts; the agency can approve stricter values. */
export const AUTH_DEFAULTS = {
  accessSeconds: 900,
  absoluteSeconds: 28800,
  idleSeconds: 1800,
  failureLimit: 5,
  failureWindowSeconds: 900,
  loginIdentifierMaxLength: 254,
  passwordMinLength: 12,
  passwordMaxBytes: 72,
} as const;
export const AUTH_JWT = {
  issuer: "daklak-user-service",
  audience: "daklak-api-gateway",
  algorithm: "RS256",
} as const;
export interface RefreshSession {
  userId: number;
  sessionId: string;
  expiresAt: number;
}
export interface AuthPolicy {
  accessSeconds: number;
  absoluteSeconds: number;
  idleSeconds: number;
  failureLimit: number;
  failureWindowSeconds: number;
  secureCookie: boolean;
}
export type AuthConfigReader = (key: string) => unknown;
export function positiveSeconds(value: unknown, fallback: number): number {
  const match = /^(\d+)(s|m|h|d)?$/i.exec(String(value ?? fallback).trim());
  const scale = ({ s: 1, m: 60, h: 3600, d: 86400 } as Record<string, number>)[
    (match?.[2] || "s").toLowerCase()
  ];
  const seconds = Number(match?.[1]) * scale;
  if (!Number.isSafeInteger(seconds) || seconds <= 0)
    throw new Error("Invalid authentication duration");
  return seconds;
}
export function positiveInteger(value: unknown, fallback: number): number {
  const text = String(value ?? fallback).trim();
  const number = Number(text);
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(number) || number <= 0) throw new Error("Invalid authentication count");
  return number;
}
export function getAuthPolicy(
  read: AuthConfigReader = (key) => process.env[key],
): AuthPolicy {
  const policy = {
    accessSeconds: positiveSeconds(
      read("AUTH_ACCESS_TTL_SECONDS"),
      AUTH_DEFAULTS.accessSeconds,
    ),
    absoluteSeconds: positiveSeconds(
      read("AUTH_SESSION_MAX_SECONDS"),
      AUTH_DEFAULTS.absoluteSeconds,
    ),
    idleSeconds: positiveSeconds(
      read("AUTH_IDLE_TIMEOUT_SECONDS"),
      AUTH_DEFAULTS.idleSeconds,
    ),
    failureLimit: positiveInteger(
      read("AUTH_LOGIN_FAILURE_LIMIT"),
      AUTH_DEFAULTS.failureLimit,
    ),
    failureWindowSeconds: positiveSeconds(
      read("AUTH_LOGIN_FAILURE_WINDOW_SECONDS"),
      AUTH_DEFAULTS.failureWindowSeconds,
    ),
    secureCookie: read("AUTH_COOKIE_SECURE") === "true",
  };
  if (
    policy.accessSeconds > policy.absoluteSeconds ||
    policy.idleSeconds > policy.absoluteSeconds
  ) {
    throw new Error(
      "Access/idle duration must not exceed maximum session duration",
    );
  }
  const secure = read("AUTH_COOKIE_SECURE");
  if (secure != null && secure !== "true" && secure !== "false")
    throw new Error("AUTH_COOKIE_SECURE must be true or false");
  return policy;
}
// Redis TIME is authoritative; activity renewal never extends the absolute deadline.
// The same atomic check enforces idle timeout, logout and password-reset revocation.
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
