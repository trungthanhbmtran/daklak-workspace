jest.mock('../../../../admin_khcn/node_modules/next/headers', () => ({
  cookies: jest.fn(),
}));
import { cookies } from '../../../../admin_khcn/node_modules/next/headers';
import axios from '../../../../admin_khcn/node_modules/axios';
import { serverFetch } from '../../../../admin_khcn/lib/serverFetch';

describe('Authenticated server fetch', () => {
  const gateway = 'https://gateway.example.test/api/v1/admin';
  let axiosGetSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    axiosGetSpy = jest.spyOn(axios, 'get');
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
    axiosGetSpy.mockResolvedValue({
      data: { data: [7] },
      status: 200,
    });
    await expect(serverFetch('/menus/me')).resolves.toEqual({ data: [7] });
    expect(axiosGetSpy).toHaveBeenCalledWith(
      gateway + '/menus/me',
      expect.objectContaining({
        headers: {
          Accept: 'application/json',
          Cookie: 'accessToken=test-cookie',
        },
      })
    );
  });
  it('propagates Next.js request context signals without a network retry', async () => {
    const signal = new Error('request-context-signal');
    (cookies as jest.Mock).mockRejectedValue(signal);
    await expect(serverFetch('/menus/me')).rejects.toBe(signal);
    expect(axiosGetSpy).not.toHaveBeenCalled();
  });
  it('does not send credentials to localhost when the configured gateway is unavailable', async () => {
    axiosGetSpy.mockRejectedValue(new Error('offline'));
    await expect(serverFetch('/menus/me')).resolves.toBeNull();
    expect(axiosGetSpy).toHaveBeenCalledTimes(1);
    expect(axiosGetSpy.mock.calls[0][0]).toBe(gateway + '/menus/me');
  });
  it('does not turn an unauthorized API response into a successful empty response', async () => {
    axiosGetSpy.mockRejectedValue({ response: { status: 401 } });
    await expect(serverFetch('/menus/me')).resolves.toBeNull();
    expect(axiosGetSpy).toHaveBeenCalledTimes(1);
  });
});
