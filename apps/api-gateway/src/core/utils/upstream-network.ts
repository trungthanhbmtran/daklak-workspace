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

export function assertUpstreamAddress(address: string, type: string = 'external'): void {
  const zone = (type || 'external').toLowerCase();
  const family = isIP(address);
  if (!family || !['internal', 'external'].includes(zone))
    throw new Error('Invalid upstream network destination');
  const kind = family === 4 ? 'ipv4' : 'ipv6';
  if (
    forbidden.check(address, kind) ||
    (zone === 'external' &&
      (privateV4.check(address, kind) ||
        (family === 6 && !globalV6.check(address, 'ipv6'))))
  )
    throw new Error('Prohibited upstream network destination');
}

export function upstreamUrl(baseUrl: string, type: string = 'external'): URL {
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('Base URL không được để trống');
  }

  let url: URL;
  try {
    url = new URL(baseUrl.trim());
  } catch {
    throw new Error('Định dạng URL không hợp lệ');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Giao thức URL phải là http:// hoặc https://');
  }

  if (url.username || url.password) {
    throw new Error('URL không được chứa tài khoản hoặc mật khẩu');
  }

  if (url.hash) {
    throw new Error('URL không được chứa mã phân đoạn hash (#)');
  }

  const zone = (type || 'external').toLowerCase();
  if (!['internal', 'external'].includes(zone)) {
    throw new Error('Vùng mạng không hợp lệ (phải là internal hoặc external)');
  }

  if (
    process.env.REQUIRE_HTTPS_EXTERNAL === 'true' &&
    zone === 'external' &&
    url.protocol !== 'https:'
  ) {
    throw new Error('Vùng mạng external yêu cầu HTTPS');
  }

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
