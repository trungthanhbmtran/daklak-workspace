export interface SsoProvider {
  id: string;
  label: string;
  issuer: string;
  clientId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
  callbackUrl: string;
  clientSecretRef: string;
  tokenAuthMethod?: 'client_secret_basic' | 'client_secret_post';
  endpointOrigins?: string[];
  requiredAcr?: string;
  requiredAmr?: string[];
}
export function loadSsoProviders(
  value = process.env.SSO_PROVIDERS_JSON,
): SsoProvider[] {
  if (!value?.trim()) return [];
  const providers: unknown = JSON.parse(value);
  if (!Array.isArray(providers) || providers.length > 10)
    throw new Error('Invalid SSO providers');
  const ids = new Set<string>();
  for (const item of providers) {
    const p = item as SsoProvider;
    if (
      !p ||
      !/^[a-z0-9_-]{1,40}$/.test(p.id) ||
      ids.has(p.id) ||
      typeof p.label !== 'string' ||
      !p.label.trim() ||
      p.label.length > 100 ||
      typeof p.clientId !== 'string' ||
      !p.clientId ||
      !/^[A-Z][A-Z0-9_]{1,100}$/.test(p.clientSecretRef) ||
      (p.tokenAuthMethod &&
        !['client_secret_basic', 'client_secret_post'].includes(
          p.tokenAuthMethod,
        ))
    )
      throw new Error('Invalid SSO provider');
    ids.add(p.id);
    const issuer = new URL(p.issuer);
    const origins = new Set([issuer.origin, ...(p.endpointOrigins || [])]);
    for (const address of [
      p.issuer,
      p.authorizationEndpoint,
      p.tokenEndpoint,
      p.jwksUri,
      p.callbackUrl,
      ...(p.endpointOrigins || []),
    ]) {
      const url = new URL(address);
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.hash ||
        url.search
      )
        throw new Error(
          'SSO endpoints require HTTPS without credentials, query or fragment',
        );
    }
    for (const address of [p.authorizationEndpoint, p.tokenEndpoint, p.jwksUri])
      if (!origins.has(new URL(address).origin))
        throw new Error('SSO endpoint origin must be approved');
    if (
      p.requiredAmr &&
      (!Array.isArray(p.requiredAmr) ||
        p.requiredAmr.some((x) => typeof x !== 'string'))
    )
      throw new Error('Invalid SSO assurance policy');
  }
  return providers as SsoProvider[];
}
