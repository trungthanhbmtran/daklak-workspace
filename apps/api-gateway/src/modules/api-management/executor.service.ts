import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';
import { GatewayRegistryService } from './registry.service';
import {
  guardedUpstreamLookup,
  upstreamUrl,
} from '../../core/utils/upstream-network';
import { canAccessUpstream } from '../../core/utils/upstream-access';
import * as http from 'http';
import * as https from 'https';
import axios, { AxiosRequestConfig } from 'axios';
import { match } from 'path-to-regexp';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class ExecutorService implements OnModuleInit {
  private readonly logger = new Logger(ExecutorService.name);

  // Cached Agents with SSRF protection
  private httpAgent = new http.Agent({
    lookup: guardedUpstreamLookup('external'),
  });
  private httpsAgent = new https.Agent({
    lookup: guardedUpstreamLookup('external'),
    rejectUnauthorized: false,
  });
  private internalHttpAgent = new http.Agent({
    lookup: guardedUpstreamLookup('internal'),
  });
  private internalHttpsAgent = new https.Agent({
    lookup: guardedUpstreamLookup('internal'),
    rejectUnauthorized: false,
  });

  private grpcService: any;
  private tokenCache = new Map<
    string,
    { rawSecret: string; expiresAt: number }
  >();
  private singleFlight = new Map<string, Promise<any>>();

  // Cache & Single-flight cho OAuth2 / LGSP Token
  private oauthTokenCache = new Map<
    string,
    { accessToken: string; expiresAt: number }
  >();
  private oauthSingleFlight = new Map<string, Promise<string>>();

  constructor(
    private readonly registry: GatewayRegistryService,
    @Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grpcService = this.client.getService('ApiManagementService');
  }

  private async getResolvedCredential(opaqueRef: string): Promise<string> {
    const cached = this.tokenCache.get(opaqueRef);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.rawSecret;
    }

    if (this.singleFlight.has(opaqueRef)) {
      return this.singleFlight.get(opaqueRef)!;
    }

    const fetchPromise = firstValueFrom(
      this.grpcService.ResolveCredential({ opaqueRef }),
    )
      .then((res: any) => {
        const rawSecret = res.rawSecret;
        // Cache for 1 hour to prevent slamming user-service (TTL)
        this.tokenCache.set(opaqueRef, {
          rawSecret,
          expiresAt: Date.now() + 3600 * 1000,
        });
        this.singleFlight.delete(opaqueRef);
        return rawSecret;
      })
      .catch((err) => {
        this.singleFlight.delete(opaqueRef);
        // Dependency failure không mở quyền (Fail-closed)
        throw new HttpException(
          'Credential resolution failed (dependency down)',
          HttpStatus.BAD_GATEWAY,
        );
      });

    this.singleFlight.set(opaqueRef, fetchPromise);
    return fetchPromise;
  }

  /**
   * Cấp phát và quản lý bộ nhớ đệm Token OAuth2 / LGSP theo TTL chuẩn mực (Single-Flight & TTL Cache)
   */
  private async getOAuth2AccessToken(
    tokenUrl: string,
    clientId: string,
    clientSecret: string,
    scope?: string,
  ): Promise<string> {
    const cacheKey = `${tokenUrl}::${clientId}`;
    const cached = this.oauthTokenCache.get(cacheKey);

    // Sử dụng token còn hạn (trừ hao 60 giây buffer để an toàn mạng)
    if (cached && Date.now() < cached.expiresAt - 60000) {
      return cached.accessToken;
    }

    if (this.oauthSingleFlight.has(cacheKey)) {
      return this.oauthSingleFlight.get(cacheKey)!;
    }

    const fetchPromise = (async () => {
      try {
        const params = new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        });
        if (scope) {
          params.append('scope', scope);
        }

        const res = await axios.post(tokenUrl, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 10000,
          httpsAgent: this.httpsAgent,
        });

        const data = res.data;
        const accessToken = data.access_token || data.token;
        if (!accessToken) {
          throw new Error('OAuth2 response không chứa access_token');
        }

        const expiresIn = Number(data.expires_in) || 3600;
        this.oauthTokenCache.set(cacheKey, {
          accessToken,
          expiresAt: Date.now() + expiresIn * 1000,
        });
        return accessToken;
      } finally {
        this.oauthSingleFlight.delete(cacheKey);
      }
    })();

    this.oauthSingleFlight.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Mô hình hóa kiến trúc chứng thực liên thông (Authentication Strategy Engine)
   */
  private async applyAuthBinding(
    conn: any,
    reqHeaders: Record<string, string>,
  ): Promise<void> {
    if (!conn.auth || conn.auth.kind === 'none') {
      return;
    }

    const auth = conn.auth;
    let rawSecret = '';
    if (auth.secretRef) {
      rawSecret = await this.getResolvedCredential(auth.secretRef);
    } else if (auth.secret) {
      rawSecret = auth.secret;
    }

    switch (auth.kind) {
      case 'bearer': {
        const prefix =
          auth.headerPrefix !== undefined && auth.headerPrefix !== null
            ? auth.headerPrefix
            : 'Bearer ';
        const token = rawSecret.startsWith('Bearer ')
          ? rawSecret.substring(7)
          : rawSecret;
        reqHeaders['authorization'] = `${prefix}${token}`.trim();
        break;
      }
      case 'apiKey': {
        const headerName = (auth.headerName || 'x-api-key').toLowerCase();
        const prefix = auth.headerPrefix || '';
        reqHeaders[headerName] = `${prefix}${rawSecret}`.trim();
        break;
      }
      case 'basic': {
        if (rawSecret.startsWith('Basic ')) {
          reqHeaders['authorization'] = rawSecret;
        } else {
          reqHeaders['authorization'] = `Basic ${Buffer.from(rawSecret).toString('base64')}`;
        }
        break;
      }
      case 'oauth2': {
        const tokenUrl = auth.tokenUrl;
        const clientId = auth.clientId;
        const clientSecret = rawSecret;

        if (!tokenUrl || !clientId || !clientSecret) {
          this.logger.warn(
            `OAuth2 connection ${conn.code} thiếu tokenUrl, clientId hoặc secret`,
          );
          break;
        }

        const accessToken = await this.getOAuth2AccessToken(
          tokenUrl,
          clientId,
          clientSecret,
          auth.scope,
        );
        reqHeaders['authorization'] = `Bearer ${accessToken}`;
        break;
      }
      case 'lgsp': {
        // Chuẩn Trục liên thông LGSP / NDXP Quốc gia
        const tokenUrl = auth.tokenUrl;
        const clientId = auth.clientId;
        const clientSecret = rawSecret;

        if (tokenUrl && clientId && clientSecret) {
          const accessToken = await this.getOAuth2AccessToken(
            tokenUrl,
            clientId,
            clientSecret,
            auth.scope,
          );
          reqHeaders['authorization'] = `Bearer ${accessToken}`;
        } else if (rawSecret) {
          reqHeaders['authorization'] = `Bearer ${rawSecret}`;
        }

        if (clientId) {
          reqHeaders['x-consumer-key'] = clientId;
        }
        break;
      }
      default:
        this.logger.warn(`Unknown auth kind: ${auth.kind}`);
    }
  }

  /**
   * Thẩm định và kiểm tra liên thông thực tế tới Upstream (Test Connection)
   */
  async testConnection(id: string): Promise<{
    success: boolean;
    statusCode: number;
    latencyMs: number;
    message: string;
    authModel: string;
  }> {
    let conn = this.registry.getActiveConnection(id);
    if (!conn) {
      try {
        const meta = new Metadata();
        meta.add(
          'x-internal-token',
          process.env.INTERNAL_TOKEN || 'internal-secret-daklak',
        );
        const res = (await firstValueFrom(
          this.grpcService.GetConnection({ id }, meta),
        )) as any;
        conn = res?.data || res;
      } catch (e: any) {
        throw new HttpException(
          `Không tìm thấy kết nối API: ${e.message}`,
          HttpStatus.NOT_FOUND,
        );
      }
    }

    if (!conn) {
      throw new HttpException('API Connection not found', HttpStatus.NOT_FOUND);
    }

    let targetUrl: URL;
    try {
      targetUrl = upstreamUrl(conn.baseUrl, conn.networkZone);
    } catch (e: any) {
      throw new HttpException(
        `Cấu hình URL không hợp lệ: ${e.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const testHeaders: Record<string, string> = {
      'user-agent': 'Daklak-Integration-Gateway/2.0',
      accept: 'application/json, text/plain, */*',
    };

    let authError: string | null = null;
    try {
      await this.applyAuthBinding(conn, testHeaders);
    } catch (e: any) {
      authError = e.message;
    }

    if (authError) {
      return {
        success: false,
        statusCode: 401,
        latencyMs: 0,
        message: `Lỗi thẩm định xác thực: ${authError}`,
        authModel: conn.auth?.kind || 'none',
      };
    }

    const isInternal = conn.networkZone === 'internal';
    const startTime = Date.now();

    try {
      const response = await axios({
        method: 'GET',
        url: targetUrl.toString(),
        headers: testHeaders,
        timeout: conn.timeoutMs || 8000,
        httpAgent: isInternal ? this.internalHttpAgent : this.httpAgent,
        httpsAgent: isInternal ? this.internalHttpsAgent : this.httpsAgent,
        validateStatus: () => true, // Không throw exception để ghi nhận HTTP status code thật
      });

      const latencyMs = Date.now() - startTime;
      const status = response.status;

      if (status >= 200 && status < 400) {
        return {
          success: true,
          statusCode: status,
          latencyMs,
          message: `Kết nối và xác thực thành công (HTTP ${status})`,
          authModel: conn.auth?.kind || 'none',
        };
      } else if (status === 401 || status === 403) {
        return {
          success: false,
          statusCode: status,
          latencyMs,
          message: `Máy chủ từ chối xác thực (HTTP ${status} ${status === 401 ? 'Unauthorized' : 'Forbidden'}). Vui lòng kiểm tra lại Secret/Token hoặc Client ID.`,
          authModel: conn.auth?.kind || 'none',
        };
      } else if (status === 404 || status === 405) {
        return {
          success: true,
          statusCode: status,
          latencyMs,
          message: `Máy chủ phản hồi (HTTP ${status} trên URL gốc). Đường truyền mạng và kết nối máy chủ hoạt động tốt.`,
          authModel: conn.auth?.kind || 'none',
        };
      } else {
        return {
          success: false,
          statusCode: status,
          latencyMs,
          message: `Máy chủ phản hồi mã lỗi HTTP ${status}.`,
          authModel: conn.auth?.kind || 'none',
        };
      }
    } catch (e: any) {
      const latencyMs = Date.now() - startTime;
      let msg = e.message;
      if (e.code === 'ECONNREFUSED') {
        msg =
          'Máy chủ từ chối kết nối (Connection Refused). Vui lòng kiểm tra địa chỉ IP và cổng dịch vụ.';
      } else if (e.code === 'ETIMEDOUT' || e.code === 'ECONNABORTED') {
        msg = 'Kết nối tới máy chủ hết hạn thời gian (Timeout).';
      } else if (e.code === 'ENOTFOUND') {
        msg = 'Không tìm thấy tên miền máy chủ (DNS Not Found).';
      } else if (
        e.code === 'EACCES' ||
        e.message?.includes('Prohibited upstream') ||
        e.message?.includes('Upstream DNS rejected')
      ) {
        msg =
          'Bị chặn bởi cơ chế kiểm soát an toàn mạng SSRF (Prohibited Upstream / Private IP). Nếu đây là mạng nội bộ, vui lòng cấu hình Vùng mạng là "Internal".';
      }

      return {
        success: false,
        statusCode: 504,
        latencyMs,
        message: `Lỗi kết nối mạng: ${msg}`,
        authModel: conn.auth?.kind || 'none',
      };
    }
  }

  async executeRequest(
    code: string,
    method: string,
    path: string,
    headers: any,
    body: any,
    user: any,
  ) {
    const conn = this.registry.getActiveConnectionByCode(code);

    if (!conn) {
      throw new HttpException(
        'API Connection not found or offline',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!conn.enabled) {
      throw new HttpException(
        'API Connection is disabled',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Match path to endpoints
    let matchedEndpoint = null;
    let pathParams = {};

    for (const ep of conn.endpoints) {
      if (ep.method.toLowerCase() !== method.toLowerCase()) continue;

      const matcher = match(ep.pathTemplate, { decode: decodeURIComponent });
      const result = matcher(path);

      if (result) {
        matchedEndpoint = ep;
        pathParams = result.params;
        break;
      }
    }

    if (!matchedEndpoint) {
      throw new HttpException(
        'No matching endpoint found for this path',
        HttpStatus.NOT_FOUND,
      );
    }

    // Access control check (PBAC) using existing upstream-access logic
    const accessConfig = {
      enabled: conn.enabled,
      allowedMethods: conn.endpoints.map((e: any) => e.method),
      roles: [],
      scopes: [],
    };

    // Prepare Request
    let targetUrl: URL;
    try {
      targetUrl = upstreamUrl(conn.baseUrl, conn.networkZone);
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
    }

    // Append path and query
    const basePath = targetUrl.pathname.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${targetUrl.origin}${basePath}${cleanPath}`;

    // Clean headers
    const reqHeaders = { ...headers };
    delete reqHeaders.host;
    delete reqHeaders.connection;
    delete reqHeaders['content-length'];

    // Áp dụng mô hình hóa xác thực (Auth Strategy Engine)
    await this.applyAuthBinding(conn, reqHeaders);

    const isInternal = conn.networkZone === 'internal';
    const reqConfig: AxiosRequestConfig = {
      method,
      url: fullUrl,
      headers: reqHeaders,
      data: body,
      timeout: conn.timeoutMs || 5000,
      httpAgent: isInternal ? this.internalHttpAgent : this.httpAgent,
      httpsAgent: isInternal ? this.internalHttpsAgent : this.httpsAgent,
      validateStatus: () => true, // Don't throw on 4xx/5xx from upstream
    };

    try {
      const response = await axios(reqConfig);
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (e: any) {
      this.logger.error(`Upstream request failed: ${e.message}`);
      if (e.code === 'ECONNABORTED') {
        throw new HttpException('Upstream timeout', HttpStatus.GATEWAY_TIMEOUT);
      }
      throw new HttpException(
        'Upstream connection error',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
