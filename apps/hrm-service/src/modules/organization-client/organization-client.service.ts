import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

// ─── gRPC contract types (phản ánh organization.proto) ────────────────────────
interface JobTitleItem {
  id: number;
  code: string;
  name: string;
}

interface OrganizationUnitNode {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  parentId?: number;
  children?: OrganizationUnitNode[];
}

interface ListJobTitlesResponse {
  items: JobTitleItem[];
}

interface GetFullTreeResponse {
  nodes: OrganizationUnitNode[];
}

// ─── Cache ────────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

/**
 * OrganizationClientService
 *
 * Gọi user-service (OrganizationService) qua gRPC native API (@grpc/grpc-js)
 * để lấy tên đơn vị (organization_units) và chức danh (job_titles).
 *
 * Không dùng NestJS ClientsModule để tránh circular dependency trong NestJS 11.
 * Kết quả được cache in-memory TTL 5 phút.
 */
@Injectable()
export class OrganizationClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrganizationClientService.name);

  private stub: any = null;

  // Cache
  private jobTitleCache: CacheEntry<Map<number, { name: string; code: string }>> | null = null;
  private unitCache: CacheEntry<Map<number, { name: string; code: string }>> | null = null;

  onModuleInit() {
    try {
      const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', 'protos');
      const protoPath = join(protoRoot, 'users', 'organization.proto');
      const userServiceAddr = process.env.USER_SERVICE_ADDR ?? 'user-service:50051';

      const packageDef = protoLoader.loadSync(protoPath, {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        includeDirs: [protoRoot],
      });

      const grpcObject = grpc.loadPackageDefinition(packageDef) as any;
      const OrganizationService = grpcObject?.organization?.OrganizationService;

      if (!OrganizationService) {
        this.logger.warn('OrganizationService not found in proto — enrichment disabled');
        return;
      }

      this.stub = new OrganizationService(
        userServiceAddr,
        grpc.credentials.createInsecure(),
        { 'grpc.enable_retries': 1, 'grpc.service_config': JSON.stringify({ retryPolicy: { maxAttempts: 3, initialBackoff: '0.5s', maxBackoff: '5s', backoffMultiplier: 2, retryableStatusCodes: ['UNAVAILABLE'] } }) },
      );
      this.logger.log(`OrganizationClientService connected to ${userServiceAddr}`);
    } catch (err) {
      this.logger.warn('OrganizationClientService init failed — enrichment disabled', err);
    }
  }

  onModuleDestroy() {
    if (this.stub) {
      grpc.closeClient(this.stub);
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** Map<id, {name,code}> của tất cả chức danh/ngạch/đảng */
  async getJobTitleMap(): Promise<Map<number, { name: string; code: string }>> {
    if (this.jobTitleCache && Date.now() < this.jobTitleCache.expiresAt) {
      return this.jobTitleCache.data;
    }
    if (!this.stub) return new Map();
    try {
      const res = await this.callGrpc<ListJobTitlesResponse>('listJobTitles', {});
      const map = new Map<number, { name: string; code: string }>(
        (res.items ?? []).map((jt) => [jt.id, { name: jt.name ?? '', code: jt.code ?? '' }]),
      );
      this.jobTitleCache = { data: map, expiresAt: Date.now() + CACHE_TTL_MS };
      this.logger.debug(`JobTitle cache refreshed: ${map.size} entries`);
      return map;
    } catch (err) {
      this.logger.warn('getJobTitleMap failed', err);
      return this.jobTitleCache?.data ?? new Map();
    }
  }

  /** Map<id, {name,code}> của tất cả đơn vị tổ chức */
  async getUnitMap(): Promise<Map<number, { name: string; code: string }>> {
    if (this.unitCache && Date.now() < this.unitCache.expiresAt) {
      return this.unitCache.data;
    }
    if (!this.stub) return new Map();
    try {
      const res = await this.callGrpc<GetFullTreeResponse>('getFullTree', {});
      const map = new Map<number, { name: string; code: string }>();
      this.flattenNodes(res.nodes ?? [], map);
      this.unitCache = { data: map, expiresAt: Date.now() + CACHE_TTL_MS };
      this.logger.debug(`Unit cache refreshed: ${map.size} entries`);
      return map;
    } catch (err) {
      this.logger.warn('getUnitMap failed', err);
      return this.unitCache?.data ?? new Map();
    }
  }

  invalidateCache() {
    this.jobTitleCache = null;
    this.unitCache = null;
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private callGrpc<T>(method: string, request: object): Promise<T> {
    return new Promise((resolve, reject) => {
      this.stub[method](request, (err: Error | null, response: T) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  private flattenNodes(
    nodes: OrganizationUnitNode[],
    map: Map<number, { name: string; code: string }>,
  ) {
    for (const n of nodes) {
      if (n.id) map.set(n.id, { name: n.name ?? '', code: n.code ?? '' });
      if (n.children?.length) this.flattenNodes(n.children, map);
    }
  }
}
