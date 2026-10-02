import * as dns from 'dns/promises';
import { RegistryService } from './registry.service';

jest.mock('dns/promises', () => ({ resolve: jest.fn(), lookup: jest.fn() }));

describe('Registry SSRF regression', () => {
  const registry = new RegistryService({} as never);
  const check = (baseUrl: string, type = 'external') =>
    (registry as unknown as { checkSsrf: (config: { baseUrl: string; type: string }) => Promise<void> }).checkSsrf({ baseUrl, type });
  beforeEach(() => {
    (dns.resolve as jest.Mock).mockResolvedValue([]);
    (dns.lookup as jest.Mock).mockResolvedValue([{ address: '203.0.113.2', family: 4 }]);
  });
  it.each(['https://[::1]', 'https://[fd00::1]', 'https://[fe80::1]', 'https://[::ffff:127.0.0.1]'])(
    'rejects prohibited IPv6 destination %s', async (url) => {
      await expect(check(url)).rejects.toThrow();
    },
  );
  it('fails closed when DNS is unavailable', async () => {
    (dns.resolve as jest.Mock).mockRejectedValue(new Error('DNS offline'));
    (dns.lookup as jest.Mock).mockRejectedValue(new Error('DNS offline'));
    await expect(check('https://agency.example')).rejects.toThrow();
  });
  it('requires HTTPS at the external boundary', async () => {
    await expect(check('http://agency.example')).rejects.toThrow();
  });
});

