export interface UpstreamConfig {
  name: string;
  type: string;
  baseUrl: string;
  allowedPaths: string[];
  allowedMethods: string[];
  auth: any;
  timeoutMs: number;
  retry: any;
  cacheTtlSec: number;
  rateLimit: any;
  rateLimitWindow?: number;
  roles: string[];
  scopes: string[];
  version: number;
  enabled?: boolean;
}

export interface UpstreamCaller {
  id?: number;
  sub?: string;
  unitId?: string | number;
  roles?: string[];
  permissionsFlatten?: string[];
}

export function canAccessUpstream(
  config: UpstreamConfig,
  user: UpstreamCaller,
  method: string,
): boolean {
  if (config.enabled === false || !config.allowedMethods?.includes(method))
    return false;
  const permissions = new Set(
    Array.isArray(user.permissionsFlatten) ? user.permissionsFlatten : [],
  );
  if (config.scopes?.some((scope) => !permissions.has(scope))) return false;
  // Keep existing restrictions while legacy role-based configurations are migrated to PBAC scopes.
  const legacySubjects = new Set(Array.isArray(user.roles) ? user.roles : []);
  return (
    !config.roles?.length ||
    config.roles.some((subject) => legacySubjects.has(subject))
  );
}

export function allowedUpstreamPath(path: string, paths: string[]): boolean {
  if (path.length > 2048 || /%2f|%5c/i.test(path)) return false;
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return false;
  }
  if (
    !decoded.startsWith('/') ||
    /[%\\?#\s\p{Cc}]/u.test(decoded) ||
    decoded.includes('//') ||
    decoded.split('/').some((part) => part === '.' || part === '..')
  )
    return false;
  return paths.some((pattern) =>
    pattern.endsWith('/*')
      ? decoded.startsWith(pattern.slice(0, -1))
      : pattern === decoded,
  );
}
