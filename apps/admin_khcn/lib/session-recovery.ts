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
/** One refresh for concurrent 401s; late old-token responses reuse the refreshed session. */
export function installSessionRecovery(
  client: AxiosInstance,
  transport: AxiosInstance,
  effects: { onExpired: () => void; onError: (error: AxiosError) => void },
) {
  let refresh: Promise<unknown> | null = null;
  let expired = false;
  let expiry: Promise<void> | null = null;
  let version = 0;
  client.interceptors.request.use((config) => {
    config._sessionVersion ??= version;
    return config;
  });
  function expire(): Promise<void> {
    if (expiry) return expiry;
    expired = true;
    // Finish cleanup before navigation so a late logout cannot clear a subsequent login.
    expiry = transport
      .post("/auth/logout", {}, { timeout: 5000 })
      .catch(() => undefined)
      .then(() => {
        effects.onExpired();
      });
    return expiry;
  }
  client.interceptors.response.use(
    (response) => {
      if (/\/auth\/login\/?$/.test((response.config.url || "").split("?")[0])) {
        expired = false;
        expiry = null;
        version++;
      }
      return response.data;
    },
    async (error: AxiosError) => {
      const config = error.config;
      if (error.response?.status !== 401) {
        effects.onError(error);
        return Promise.reject(error);
      }
      if (!config || config.skipSessionRecovery || isAuthEndpoint(config.url))
        return Promise.reject(error);
      if (expired) return Promise.reject(error);
      if (config._sessionRetried) {
        await expire();
        return Promise.reject(error);
      }
      config._sessionRetried = true;
      try {
        if ((config._sessionVersion ?? version) === version) {
          if (!refresh) {
            refresh = transport
              .post("/auth/refresh", {})
              .then(() => {
                version++;
              })
              .finally(() => {
                refresh = null;
              });
          }
          await refresh;
        }
      } catch (refreshError) {
        const status = (refreshError as AxiosError).response?.status;
        if (status === 401) await expire();
        else effects.onError(refreshError as AxiosError);
        return Promise.reject(refreshError);
      }
      config._sessionVersion = version;
      return client.request(config);
    },
  );
}
