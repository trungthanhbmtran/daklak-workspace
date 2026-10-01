import { Readable } from 'stream';
import { BadGatewayException, BadRequestException, ForbiddenException, PayloadTooLargeException } from '@nestjs/common';
import { allowedReportPath, canReadSource, ReportSourceService, validateTableSource } from './report-source.service';
import type { RegistryService, UpstreamConfig } from '../integration/registry.service';
import type { EnvSecretProvider } from '../integration/secrets/env-secret-provider.service';

const config: UpstreamConfig = { name: 'test', type: 'external', baseUrl: 'https://example.test', allowedPaths: ['/data', '/items/*'], allowedMethods: ['GET'], auth: { kind: 'none' }, timeoutMs: 1000, retry: {}, cacheTtlSec: 0, rateLimit: {}, roles: ['reader'], scopes: ['DATA:READ'], version: 1, enabled: true };
const caller = { id: 1, unitId: 2, roles: ['reader'], permissionsFlatten: ['DATA:READ'] };
const source = { upstream: 'test', path: '/data', params: {} };
describe('Report sources', () => {
  const fire = jest.fn(), getSecret = jest.fn();
  const registry = { checkReady: () => true, getUpstream: () => ({ config, breaker: { fire } }), getReportSourceConfigs: () => [config] };
  const service = new ReportSourceService(registry as unknown as RegistryService, { getSecret } as unknown as EnvSecretProvider);
  beforeEach(() => { fire.mockReset(); getSecret.mockReset(); });
  it('checks methods even when role requirements are empty', () => {
    expect(canReadSource({ ...config, roles: [], scopes: [], allowedMethods: ['POST'] }, caller)).toBe(false);
    expect(canReadSource(config, caller)).toBe(true);
    expect(canReadSource(config, { ...caller, permissionsFlatten: [] })).toBe(false);
    expect(canReadSource(config, { ...caller, roles: [] })).toBe(false);
  });
  it('matches registered paths with segment boundaries', () => {
    expect(allowedReportPath('/items/123', config.allowedPaths)).toBe(true);
    expect(allowedReportPath('/items-evil/123', config.allowedPaths)).toBe(false);
    expect(allowedReportPath('/data/other', config.allowedPaths)).toBe(false);
  });
  it.each(['https://evil.test', '//evil', '/data/../other', '/data%2fother', '/data?override=1', '/data#fragment', '/data\\other'])('rejects unsafe source path %s', path => {
    expect(() => validateTableSource({ ...source, path })).toThrow(BadRequestException);
  });
  it('requires scalar string query params', () => {
    expect(() => validateTableSource({ ...source, params: { page: 1 } })).toThrow();
    expect(() => validateTableSource({ ...source, params: [] })).toThrow();
  });
  it('returns only sanitized source options', () => {
    expect(service.list(caller)).toEqual([{ name: 'test', paths: ['/data', '/items/*'] }]);
    expect(service.list({ roles: [] })).toEqual([]);
  });
  it('checks access before calling upstream', async () => {
    await expect(service.fetch(source, { ...caller, roles: [] })).rejects.toThrow(ForbiddenException);
    await expect(service.fetch({ ...source, path: '/other' }, caller)).rejects.toThrow(ForbiddenException);
    expect(fire).not.toHaveBeenCalled();
  });
  it('fetches only from registry, encodes params and masks secrets/PII before RPC', async () => {
    fire.mockResolvedValue({ statusCode: 200, headers: {}, body: Readable.from([JSON.stringify({ data: [{ email: 'user@example.test', salary: 123, accessToken: 'secret', name: 'A' }] })]) });
    const data = await service.fetch({ ...source, params: { search: 'a&b' } }, caller);
    expect(data).toEqual({ data: [{ email: '***', salary: '***', name: 'A' }] });
    expect(fire.mock.calls[0][0]).toMatchObject({ method: 'GET', path: '/data?search=a%26b', headers: { 'x-unit-id': '2', 'x-user-id': '1' } });
    expect(fire.mock.calls[0][0].headers.authorization).toBeUndefined();
    expect(fire.mock.calls[0][0].headers.cookie).toBeUndefined();
  });
  it('allows authorized sensitive fields but always strips credentials', async () => {
    fire.mockResolvedValue({ statusCode: 200, headers: {}, body: Readable.from(['[{"email":"user@example.test","password":"secret"}]']) });
    expect(await service.fetch(source, { ...caller, permissionsFlatten: [...caller.permissionsFlatten, 'VIEW_SENSITIVE_DATA'] })).toEqual([{ email: 'user@example.test' }]);
  });
  it('rejects invalid JSON and source-declared errors', async () => {
    fire.mockResolvedValue({ statusCode: 200, headers: {}, body: Readable.from(['not json']) });
    await expect(service.fetch(source, caller)).rejects.toThrow(BadGatewayException);
    fire.mockResolvedValue({ statusCode: 200, headers: {}, body: Readable.from(['{"success":false}']) });
    await expect(service.fetch(source, caller)).rejects.toThrow(BadGatewayException);
  });
  it('does not follow upstream redirects or expose network errors', async () => {
    fire.mockResolvedValue({ statusCode: 302, headers: {}, body: Readable.from([]) });
    await expect(service.fetch(source, caller)).rejects.toThrow(BadGatewayException);
    fire.mockRejectedValue(new Error('private hostname and secret'));
    await expect(service.fetch(source, caller)).rejects.toThrow('Không thể lấy dữ liệu');
  });
  it('limits response bytes with and without content-length', async () => {
    fire.mockResolvedValue({ statusCode: 200, headers: { 'content-length': 3 * 1024 * 1024 }, body: Readable.from([]) });
    await expect(service.fetch(source, caller)).rejects.toThrow(PayloadTooLargeException);
    fire.mockResolvedValue({ statusCode: 200, headers: {}, body: Readable.from([Buffer.alloc(2 * 1024 * 1024 + 1)]) });
    await expect(service.fetch(source, caller)).rejects.toThrow(PayloadTooLargeException);
  });
});

