import * as dns from 'dns/promises';
import type { LookupAddress, LookupOptions } from 'dns';
import { BlockList, isIP, type LookupFunction } from 'net';

const forbidden = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const)
  forbidden.addSubnet(address, prefix, 'ipv4');
for (const [address, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fe80::', 10],
  ['ff00::', 8],
] as const)
  forbidden.addSubnet(address, prefix, 'ipv6');
forbidden.addAddress('fd00:ec2::254', 'ipv6');

const privateV4 = new BlockList();
for (const [address, prefix] of [
  ['10.0.0.0', 8],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['100.64.0.0', 10],
  ['198.18.0.0', 15],
] as const)
  privateV4.addSubnet(address, prefix, 'ipv4');
const globalV6 = new BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');

export function assertUpstreamAddress(address: string, type: string): void {
  const family = isIP(address);
  if (!family || !['internal', 'external'].includes(type))
    throw new Error('Invalid upstream network destination');
  const kind = family === 4 ? 'ipv4' : 'ipv6';
  if (
    forbidden.check(address, kind) ||
    (type === 'external' &&
      (privateV4.check(address, kind) ||
        (family === 6 && !globalV6.check(address, 'ipv6'))))
  )
    throw new Error('Prohibited upstream network destination');
}

export function upstreamUrl(baseUrl: string, type: string): URL {
  const url = new URL(baseUrl);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash ||
    url.search ||
    url.pathname !== '/' ||
    !['internal', 'external'].includes(type)
  )
    throw new Error(
      'Upstream must be an HTTP(S) origin without credentials, query or path',
    );
  if (type === 'external' && url.protocol !== 'https:')
    throw new Error('External upstream requires HTTPS');
  return url;
}

async function resolveChecked(
  hostname: string,
  type: string,
  options: LookupOptions = {},
): Promise<LookupAddress[]> {
  const host = hostname.replace(/^\[|\]$/g, '');
  if (isIP(host)) {
    assertUpstreamAddress(host, type);
    return [{ address: host, family: isIP(host) }];
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const addresses = await Promise.race([
      dns.lookup(host, { ...options, all: true }),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error('Upstream DNS timeout')),
          5000,
        );
        timer.unref?.();
      }),
    ]);
    if (!addresses.length || addresses.length > 32)
      throw new Error('Invalid upstream DNS response');
    for (const item of addresses) assertUpstreamAddress(item.address, type);
    return addresses;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function checkUpstreamNetwork(
  baseUrl: string,
  type: string,
): Promise<void> {
  const url = upstreamUrl(baseUrl, type);
  await resolveChecked(url.hostname, type);
}

// Node connects to the addresses returned here, so DNS is not looked up again after validation.
export function guardedUpstreamLookup(type: string): LookupFunction {
  return (hostname, options, callback) => {
    resolveChecked(hostname, type, options).then(
      (addresses) =>
        options.all
          ? callback(null, addresses)
          : callback(null, addresses[0].address, addresses[0].family),
      () => {
        const error = Object.assign(new Error('Upstream DNS rejected'), {
          code: 'EACCES',
        });
        callback(error, '');
      },
    );
  };
}
