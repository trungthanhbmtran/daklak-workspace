jest.mock('../../../../admin_khcn/node_modules/next/headers', () => ({
  cookies: jest.fn(),
}));
import { cookies } from '../../../../admin_khcn/node_modules/next/headers';
import { serverFetch } from '../../../../admin_khcn/lib/serverFetch';

describe('Authenticated server fetch', () => {
  const gateway = 'https://gateway.example.test/api/v1/admin';
  let fetchMock: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.spyOn(global, 'fetch');
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.replaceProperty(process, 'env', {
      ...process.env,
      INTERNAL_API_URL: gateway,
    });
    (cookies as jest.Mock).mockResolvedValue({
      getAll: () => [{ name: 'accessToken', value: 'test-cookie' }],
    });
  });
  afterEach(() => jest.restoreAllMocks());
  it('preserves the request cookie and never caches authenticated data', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [7] }),
    });
    await expect(serverFetch('/menus/me')).resolves.toEqual({ data: [7] });
    expect(fetchMock).toHaveBeenCalledWith(gateway + '/menus/me', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        Cookie: 'accessToken=test-cookie',
      },
    });
  });
  it('propagates Next.js request context signals without a network retry', async () => {
    const signal = new Error('request-context-signal');
    (cookies as jest.Mock).mockRejectedValue(signal);
    await expect(serverFetch('/menus/me')).rejects.toBe(signal);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
  it('does not send credentials to localhost when the configured gateway is unavailable', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    await expect(serverFetch('/menus/me')).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(gateway + '/menus/me');
    expect(console.error).toHaveBeenCalledWith(
      '[serverFetch] Gateway request unavailable',
    );
  });
  it('does not turn an unauthorized API response into a successful empty response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 });
    await expect(serverFetch('/menus/me')).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
