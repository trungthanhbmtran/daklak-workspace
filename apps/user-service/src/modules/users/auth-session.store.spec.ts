jest.mock('ioredis', () => ({ __esModule: true, default: jest.fn() }));
import Redis from 'ioredis';
import { AuthSessionStore } from './auth-session.store';

describe('Shared authentication Redis store', () => {
  const client = {
    on: jest.fn(),
    set: jest.fn(),
    eval: jest.fn(),
    del: jest.fn(),
    disconnect: jest.fn(),
  };
  let store: AuthSessionStore;
  beforeEach(() => {
    jest.clearAllMocks();
    (Redis as unknown as jest.Mock).mockImplementation(() => client);
    store = new AuthSessionStore({
      get: (_key: string, fallback: string) => fallback,
    } as any);
  });
  it('publishes raw JSON in the gateway namespace with seconds TTL and no credentials', async () => {
    await store.setSession(
      7,
      {
        id: 7,
        permissionsFlatten: ['MENU:READ'],
        accessToken: 'private',
        refreshToken: 'private',
      },
      3600,
    );
    expect(client.set).toHaveBeenCalledWith(
      'user_session:7',
      JSON.stringify({ id: 7, permissionsFlatten: ['MENU:READ'] }),
      'EX',
      3600,
    );
    await store.setRefresh('token', 7, 604800);
    expect(client.set).toHaveBeenCalledWith('refresh:token', '7', 'EX', 604800);
  });
  it('consumes refresh with one atomic Redis operation', async () => {
    client.eval.mockResolvedValueOnce('7').mockResolvedValueOnce(null);
    expect(await store.consumeRefresh('token')).toBe('7');
    expect(await store.consumeRefresh('token')).toBeNull();
    expect(client.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('DEL'"),
      1,
      'refresh:token',
    );
  });
  it('closes the connection on shutdown', () => {
    store.onModuleDestroy();
    expect(client.disconnect).toHaveBeenCalled();
  });
});
