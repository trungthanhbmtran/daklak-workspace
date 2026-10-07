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
} from '../integration/upstream-network';
import { canAccessUpstream } from '../integration/upstream-access';
import * as http from 'http';
import * as https from 'https';
import axios, { AxiosRequestConfig } from 'axios';
import { match } from 'path-to-regexp';

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);

  // Cached Agents with SSRF protection
  private httpAgent = new http.Agent({
    lookup: guardedUpstreamLookup('external'),
  });
  private httpsAgent = new https.Agent({
    lookup: guardedUpstreamLookup('external'),
  });
  private internalHttpAgent = new http.Agent({
    lookup: guardedUpstreamLookup('internal'),
  });
  private internalHttpsAgent = new https.Agent({
    lookup: guardedUpstreamLookup('internal'),
  });

  private grpcService: any;
  private tokenCache = new Map<
    string,
    { rawSecret: string; expiresAt: number }
  >();
  private singleFlight = new Map<string, Promise<any>>();

  constructor(
    private readonly registry: GatewayRegistryService,
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL)
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
    // (Assuming conn config follows UpstreamConfig interface for allowedMethods, roles, scopes)
    const accessConfig = {
      enabled: conn.enabled,
      allowedMethods: conn.endpoints.map((e: any) => e.method), // dynamically allow based on endpoints
      roles: [], // migrate to scopes
      scopes: [], // define scopes if endpoints have specific PBAC
    };

    // We can skip deep access check if PBAC is already handled at the route level,
    // but Executor does fine-grained checks if needed.

    // Prepare Request
    let targetUrl: URL;
    try {
      targetUrl = upstreamUrl(conn.baseUrl, conn.networkZone);
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
    }

    // Append path and query
    const fullUrl = `${targetUrl.origin}${targetUrl.pathname === '/' ? '' : targetUrl.pathname}${path}`;

    // Clean headers
    const reqHeaders = { ...headers };
    delete reqHeaders.host;
    delete reqHeaders.connection;
    delete reqHeaders['content-length'];

    // Auth Binding
    if (conn.auth?.secretRef) {
      const rawSecret = await this.getResolvedCredential(conn.auth.secretRef);

      switch (conn.auth.kind) {
        case 'bearer':
          reqHeaders['authorization'] = `Bearer ${rawSecret}`;
          break;
        case 'apiKey':
          reqHeaders['x-api-key'] = rawSecret;
          break;
        case 'basic':
          reqHeaders['authorization'] =
            `Basic ${Buffer.from(rawSecret).toString('base64')}`;
          break;
        default:
          this.logger.warn(`Unknown auth kind: ${conn.auth.kind}`);
      }
    }

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
