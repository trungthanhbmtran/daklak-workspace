import * as dns from 'dns/promises';
import {
  assertUpstreamAddress,
  guardedUpstreamLookup,
  checkUpstreamNetwork,
} from './upstream-network';

jest.mock('dns/promises', () => ({ lookup: jest.fn() }));

describe('Upstream socket destination validation', () => {
  it.each([
    '127.0.0.1',
    '0.0.0.0',
    '169.254.169.254',
    '::1',
    'fe80::1',
    'fd00:ec2::254',
    '::ffff:169.254.169.254',
  ])(
    'blocks metadata, loopback or link-local for every upstream: %s',
    (address) => {
      expect(() => assertUpstreamAddress(address, 'internal')).toThrow();
      expect(() => assertUpstreamAddress(address, 'external')).toThrow();
    },
  );
  it.each([
    '10.0.0.1',
    '192.168.1.1',
    '100.64.0.1',
    'fd00::1',
    '::ffff:10.0.0.1',
  ])('blocks private external destination %s', (address) => {
    expect(() => assertUpstreamAddress(address, 'external')).toThrow();
  });
  it('allows private service addresses only for registered internal origins', () => {
    expect(() => assertUpstreamAddress('10.0.0.1', 'internal')).not.toThrow();
    expect(() => assertUpstreamAddress('fd00::1', 'internal')).not.toThrow();
  });
  it('rejects DNS rebinding when opening the next socket', async () => {
    (dns.lookup as jest.Mock)
      .mockResolvedValueOnce([{ address: '8.8.8.8', family: 4 }])
      .mockResolvedValueOnce([{ address: '169.254.169.254', family: 4 }]);
    await checkUpstreamNetwork('https://agency.example', 'external');
    const error = await new Promise<unknown>((resolve) => {
      guardedUpstreamLookup('external')('agency.example', {}, (err) =>
        resolve(err),
      );
    });
    expect(error).toBeInstanceOf(Error);
  });
  it('returns exactly the vetted addresses used for the connection', async () => {
    (dns.lookup as jest.Mock).mockResolvedValue([
      { address: '2606:4700:4700::1111', family: 6 },
    ]);
    const result = await new Promise<unknown>((resolve, reject) => {
      guardedUpstreamLookup('external')(
        'agency.example',
        { all: true },
        (err, addresses) => {
          if (err) reject(err);
          else resolve(addresses);
        },
      );
    });
    expect(result).toEqual([{ address: '2606:4700:4700::1111', family: 6 }]);
  });
});
