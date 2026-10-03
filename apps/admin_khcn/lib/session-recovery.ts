import type { AxiosError, AxiosInstance } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipSessionRecovery?: boolean;
    _sessionRetried?: boolean;
    _sessionVersion?: number;
  }
}
export function isAuthEndpoint(url = "") {
  return /\/auth\/(login|refresh|logout)\/?$/.test(url.split("?")[0]);
}

/** Keep login/logout ordered with refresh; never let an old request destroy a newer session. */
export function installSessionRecovery(
  client: AxiosInstance,
  transport: AxiosInstance,
  effects: { onExpired: () => void; onError: (error: AxiosError) => void },
) {
  let refresh: Promise<unknown> | null = null;
  let authentication: Promise<unknown> | null = null;
  let expired = false;
  let expiry: Promise<void> | null = null;
  let version = 0;
  client.interceptors.request.use((config) => {
    config._sessionVersion ??= version;
    return config;
  });

  async function serialize<T>(action: () => Promise<T>): Promise<T> {
    const previous = authentication;
    const work = (async () => {
      await previous?.catch(() => undefined);
      await refresh?.catch(() => undefined);
      await expiry;
      return action();
    })();
    authentication = work;
    try { return await work; }
    finally { if (authentication === work) authentication = null; }
  }

  async function expire(expectedVersion: number): Promise<void> {
    await authentication?.catch(() => undefined);
    if (expectedVersion !== version) return;
    if (expiry) return expiry;
    expired = true;
    expiry = transport.post("/auth/logout", {}, { timeout: 5000 })
      .catch(() => undefined)
      .then(() => { effects.onExpired(); });
    return expiry;
  }

  client.interceptors.response.use(
    response => {
      if (/\/auth\/login\/?$/.test((response.config.url || "").split("?")[0])) {
        expired = false; expiry = null; version++;
      }
      return response.data;
    },
    async (error: AxiosError) => {
      const config = error.config;
      if (error.response?.status !== 401) {
        if (!config?.skipSessionRecovery && !isAuthEndpoint(config?.url) && error.code !== "ERR_CANCELED") effects.onError(error);
        return Promise.reject(error);
      }
      if (!config || config.skipSessionRecovery || isAuthEndpoint(config.url)) return Promise.reject(error);
      await authentication?.catch(() => undefined);
      if (expired) return Promise.reject(error);
      const requestedVersion = config._sessionVersion ?? version;
      const replay = () => {
        config._sessionVersion = version;
        config._sessionRetried = true;
        return client.request(config);
      };
      if (requestedVersion !== version) return replay();
      if (config._sessionRetried) {
        await expire(requestedVersion);
        return Promise.reject(error);
      }
      config._sessionRetried = true;
      const recoveryVersion = version;
      try {
        if (!refresh) {
          refresh = transport.post("/auth/refresh", {})
            .then(() => { version++; })
            .finally(() => { refresh = null; });
        }
        await refresh;
        await authentication?.catch(() => undefined);
      } catch (refreshError) {
        await authentication?.catch(() => undefined);
        if (expired) return Promise.reject(error);
        if (recoveryVersion !== version) return replay();
        const status = (refreshError as AxiosError).response?.status;
        if (status === 409) {
          // Another browser tab may already have rotated the shared HttpOnly cookie.
          // A conflict cannot expire that tab's session or authorise using an old token.
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await transport.get("/auth/me", { timeout: 5000 });
            await authentication?.catch(() => undefined);
            if (expired) return Promise.reject(error);
            if (recoveryVersion === version) version++;
            return replay();
          } catch (meError) {
            const meStatus = (meError as AxiosError).response?.status;
            if (meStatus === 401) await expire(recoveryVersion);
          }
        } else if (status === 401) await expire(recoveryVersion);
        else effects.onError(refreshError as AxiosError);
        return Promise.reject(refreshError);
      }
      if (expired) return Promise.reject(error);
      return replay();
    },
  );

  return {
    login: <T>(action: () => Promise<T>) => serialize(action),
    logout: () => serialize(async () => {
      expired = true; version++;
      await transport.post("/auth/logout", {}, { timeout: 5000 });
    }),
  };
}
