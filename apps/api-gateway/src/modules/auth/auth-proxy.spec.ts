import { NextRequest } from '../../../../admin_khcn/node_modules/next/server';
import { proxy } from '../../../../admin_khcn/proxy';
import { serverApiBase } from '../../../../admin_khcn/lib/server-api-url';

describe('Next session route boundaries', () => {
  function request(path: string, cookie = '') {
    return new NextRequest('http://example.test/admin' + path, {
      headers: { cookie },
      nextConfig: { basePath: '/admin' },
    });
  }
  it('keeps login reachable with an expired access cookie', async () => {
    const response = await proxy(request('/login', 'accessToken=expired'));
    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });
  it('does not treat the legacy session cookie as a valid access token', async () => {
    const response = await proxy(request('/hub', 'session=legacy'));
    expect(new URL(response.headers.get('location')!).pathname).toBe(
      '/admin/login',
    );
  });
  it('restores the session when only the refresh cookie remains', async () => {
    const response = await proxy(request('/hub', 'refreshToken=valid'));
    const url = new URL(response.headers.get('location')!);
    expect(url.pathname).toBe('/admin/session/refresh');
    expect(url.searchParams.get('callbackUrl')).toBe('/hub');
  });
  it('allows the recovery route even without an access cookie', async () => {
    const response = await proxy(
      request('/session/refresh', 'refreshToken=valid'),
    );
    expect(response.headers.get('location')).toBeNull();
  });
  it('forwards protected paths for server-side authorization', async () => {
    const response = await proxy(request('/hub', 'accessToken=present'));
    expect(response.headers.get('x-middleware-request-x-pathname')).toBe(
      '/hub',
    );
  });
  it.each([
    'http://api:8080',
    'http://api:8080/',
    'http://api:8080/api/v1',
    'http://api:8080/api/v1/admin/',
  ])('normalizes internal API prefix exactly once: %s', (base) => {
    expect(serverApiBase(base)).toBe('http://api:8080/api/v1/admin');
  });
});
