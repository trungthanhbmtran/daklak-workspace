import { performance } from 'perf_hooks';
import { allowedUpstreamPath, canAccessUpstream } from './upstream-access';
import type { UpstreamConfig } from './registry.service';

describe('Canonical upstream access rules', () => {
  const config = {
    enabled: true,
    allowedPaths: ['/records/*'],
    allowedMethods: ['GET'],
    scopes: ['DATA:READ'],
    roles: [],
  } as unknown as UpstreamConfig;

  it.each([
    '/records/../private',
    '/records/%2e%2e/private',
    '/records/%252e%252e/private',
    '/records%2F..%2Fprivate',
    '/records/..%5cprivate',
    '/records//private',
    '/records/%00private',
    '/records/%',
    '//outside.example/records',
    '/records-private/list',
  ])('rejects ambiguous or unregistered path %s', (path) => {
    expect(allowedUpstreamPath(path, config.allowedPaths)).toBe(false);
  });
  it('matches registered paths without interpreting query parameters as path segments', () => {
    expect(allowedUpstreamPath('/records/list', config.allowedPaths)).toBe(
      true,
    );
    expect(allowedUpstreamPath('/health', ['/health'])).toBe(true);
    expect(allowedUpstreamPath('/health/private', ['/health'])).toBe(false);
    expect(allowedUpstreamPath('/records/list', [])).toBe(false);
  });
  it('requires every configured permission, method and enabled state', () => {
    const user = { permissionsFlatten: ['DATA:READ'] };
    expect(canAccessUpstream(config, user, 'GET')).toBe(true);
    expect(canAccessUpstream(config, { permissionsFlatten: [] }, 'GET')).toBe(
      false,
    );
    expect(canAccessUpstream(config, user, 'DELETE')).toBe(false);
    expect(canAccessUpstream({ ...config, enabled: false }, user, 'GET')).toBe(
      false,
    );
    expect(
      canAccessUpstream({ ...config, allowedMethods: [] }, user, 'GET'),
    ).toBe(false);
  });
  it('benchmarks configured authorization and path checks', () => {
    const user = {
      permissionsFlatten: Array.from({ length: 200 }, (_, n) => 'P' + n),
    };
    const measured = { ...config, scopes: ['P1', 'P199'] };
    for (let i = 0; i < 1000; i++) canAccessUpstream(measured, user, 'GET');
    const durations: number[] = [];
    for (let i = 0; i < 5000; i++) {
      const start = performance.now();
      const allowed =
        canAccessUpstream(measured, user, 'GET') &&
        allowedUpstreamPath('/records/list', config.allowedPaths);
      if (!allowed) throw new Error('Unexpected denied benchmark request');
      durations.push(performance.now() - start);
    }
    durations.sort((a, b) => a - b);
    console.info(
      'UPSTREAM_ACCESS_BENCHMARK',
      JSON.stringify({
        samples: durations.length,
        permissions: 200,
        medianMs: Number(durations[2500].toFixed(4)),
        p95Ms: Number(durations[4750].toFixed(4)),
        backend: 'in-process; no network or database',
      }),
    );
    expect(durations.every(Number.isFinite)).toBe(true);
  });
});
