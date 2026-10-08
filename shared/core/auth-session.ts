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
  issuer: "daklak-api-gateway",
  internalAudience: "daklak-internal-services",
  audience: "daklak-api-gateway",
  algorithm: "RS256",
} as const;

export interface RefreshSession {
  userId: number;
  sessionId: string;
  /** Epoch SECONDS (phải cùng đơn vị với Redis TIME trong script Lua) */
  expiresAt: number;
  authVersion: number;
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

/* -------------------------------------------------------------------------- */
/* Parsers                                                                     */
/* -------------------------------------------------------------------------- */

const DURATION_RE = /^(\d+)([smhd])?$/i;
const INTEGER_RE = /^\d+$/;
const UNIT_SECONDS = { s: 1, m: 60, h: 3600, d: 86400 } as const;
type Unit = keyof typeof UNIT_SECONDS;

/** Parse "900", "15m", "8h", "1d" -> số giây (số nguyên dương, an toàn). */
export function positiveSeconds(
  value: unknown,
  fallback: number,
  name = "duration",
): number {
  const match = DURATION_RE.exec(String(value ?? fallback).trim());
  if (!match) {
    throw new Error(`Invalid authentication duration for ${name}: expected <n>[s|m|h|d]`);
  }
  const unit = (match[2]?.toLowerCase() ?? "s") as Unit;
  const seconds = Number(match[1]) * UNIT_SECONDS[unit];
  if (!Number.isSafeInteger(seconds) || seconds <= 0) {
    throw new Error(`Invalid authentication duration for ${name}: must be a positive integer`);
  }
  return seconds;
}

export function positiveInteger(
  value: unknown,
  fallback: number,
  name = "count",
): number {
  const text = String(value ?? fallback).trim();
  const number = Number(text);
  if (!INTEGER_RE.test(text) || !Number.isSafeInteger(number) || number <= 0) {
    throw new Error(`Invalid authentication count for ${name}: must be a positive integer`);
  }
  return number;
}

function strictBoolean(value: unknown, name: string, fallback: boolean): boolean {
  if (value == null) return fallback;
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new Error(`${name} must be true or false`);
}

/* -------------------------------------------------------------------------- */
/* Policy                                                                      */
/* -------------------------------------------------------------------------- */

export function getAuthPolicy(
  read: AuthConfigReader = (key) => process.env[key],
): AuthPolicy {
  const policy: AuthPolicy = {
    accessSeconds: positiveSeconds(
      read("AUTH_ACCESS_TTL_SECONDS"),
      AUTH_DEFAULTS.accessSeconds,
      "AUTH_ACCESS_TTL_SECONDS",
    ),
    absoluteSeconds: positiveSeconds(
      read("AUTH_SESSION_MAX_SECONDS"),
      AUTH_DEFAULTS.absoluteSeconds,
      "AUTH_SESSION_MAX_SECONDS",
    ),
    idleSeconds: positiveSeconds(
      read("AUTH_IDLE_TIMEOUT_SECONDS"),
      AUTH_DEFAULTS.idleSeconds,
      "AUTH_IDLE_TIMEOUT_SECONDS",
    ),
    failureLimit: positiveInteger(
      read("AUTH_LOGIN_FAILURE_LIMIT"),
      AUTH_DEFAULTS.failureLimit,
      "AUTH_LOGIN_FAILURE_LIMIT",
    ),
    failureWindowSeconds: positiveSeconds(
      read("AUTH_LOGIN_FAILURE_WINDOW_SECONDS"),
      AUTH_DEFAULTS.failureWindowSeconds,
      "AUTH_LOGIN_FAILURE_WINDOW_SECONDS",
    ),
    // Đọc + validate một lần duy nhất (code cũ đọc 2 lần)
    secureCookie: strictBoolean(read("AUTH_COOKIE_SECURE"), "AUTH_COOKIE_SECURE", false),
  };

  if (
    policy.accessSeconds > policy.absoluteSeconds ||
    policy.idleSeconds > policy.absoluteSeconds
  ) {
    throw new Error("Access/idle duration must not exceed maximum session duration");
  }

  return Object.freeze(policy);
}

/* -------------------------------------------------------------------------- */
/* Redis Lua                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Redis TIME is authoritative; activity renewal never extends the absolute deadline.
 * The same atomic check enforces idle timeout, logout and password-reset revocation.
 *
 * KEYS[1] = session key        (JSON: { userId, version, expiresAt(epoch s) })
 * KEYS[2] = auth-version key   (cùng hash slot với KEYS[1] nếu dùng Redis Cluster,
 *                               vd: auth:{<userId>}:session:<id> và auth:{<userId>}:version)
 * ARGV[1] = userId
 * ARGV[2] = idle TTL (seconds)
 * ARGV[3] = expected version   (optional, '' = bỏ qua)
 * ARGV[4] = renew flag         (optional, mặc định renew; '0' = chỉ kiểm tra)
 *
 * Trả về 1 = hợp lệ, 0 = không hợp lệ (session đã bị xoá).
 */
export const TOUCH_AUTH_SESSION = `
local raw = redis.call('GET', KEYS[1])
if not raw then return 0 end

local ok, s = pcall(cjson.decode, raw)
if not ok or type(s) ~= 'table' then
  redis.call('DEL', KEYS[1])
  return 0
end

local now = tonumber(redis.call('TIME')[1])
local current = tonumber(redis.call('GET', KEYS[2]) or '0') or 0
local expectedVersion = nil
if ARGV[3] ~= nil and ARGV[3] ~= '' then
  expectedVersion = tonumber(ARGV[3])
end
local expiresAt = tonumber(s.expiresAt)

if tostring(s.userId) ~= ARGV[1]
  or tonumber(s.version) ~= current
  or (ARGV[3] ~= nil and ARGV[3] ~= '' and expectedVersion ~= current)
  or expiresAt == nil
  or expiresAt <= now then
  redis.call('DEL', KEYS[1])
  return 0
end

local renew = ARGV[4] == nil or ARGV[4] == '' or tonumber(ARGV[4]) == 1
local idle = tonumber(ARGV[2])
if renew and idle and idle > 0 then
  redis.call('EXPIRE', KEYS[1], math.floor(math.min(idle, expiresAt - now)))
end
return 1
`;