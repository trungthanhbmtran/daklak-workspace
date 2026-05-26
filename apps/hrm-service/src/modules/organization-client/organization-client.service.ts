import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { ORGANIZATION_GRPC_CLIENT } from './organization-client.module';

// ─── gRPC contract types (phản ánh organization.proto) ────────────────────────
interface JobTitleItem {
  id: number;
  code: string;
  name: string;
  category?: string;
  rank?: number;
  type?: string;
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

interface OrganizationTreeResponse {
  nodes: OrganizationUnitNode[];
}

interface IOrganizationGrpcService {
  ListJobTitles(req: { unitId?: number }): Observable<ListJobTitlesResponse>;
  GetFullTree(req: Record<string, never>): Observable<OrganizationTreeResponse>;
}

// ─── Cache entry ──────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

/**
 * OrganizationClientService
 *
 * Gọi user-service (OrganizationService) qua gRPC để lấy:
 *   - Danh sách chức danh (job_titles) — dùng cho jobTitle, civilServantRank, partyTitle
 *   - Cây tổ chức (organization_units) — dùng cho department
 *
 * Kết quả được cache in-memory với TTL 5 phút để tránh gọi lặp lại trên mỗi request.
 * Đây là pattern chuẩn trong large-scale microservices: service-to-service gRPC + local cache.
 */
@Injectable()
export class OrganizationClientService implements OnModuleInit {
  private readonly logger = new Logger(OrganizationClientService.name);
  private orgService!: IOrganizationGrpcService;

  // In-memory cache
  private jobTitleCache: CacheEntry<Map<number, { name: string; code: string }>> | null = null;
  private unitCache: CacheEntry<Map<number, { name: string; code: string }>> | null = null;

  constructor(
    @Inject(ORGANIZATION_GRPC_CLIENT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orgService = this.client.getService<IOrganizationGrpcService>(
      'OrganizationService',
    );
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Lấy Map<id, {name, code}> của tất cả chức danh từ user-service.
   * Dùng chung cho jobTitleId, civilServantRankId, partyTitleId vì
   * tất cả đều tham chiếu bảng job_titles.
   */
  async getJobTitleMap(): Promise<Map<number, { name: string; code: string }>> {
    if (this.jobTitleCache && Date.now() < this.jobTitleCache.expiresAt) {
      return this.jobTitleCache.data;
    }
    try {
      const res = await firstValueFrom(
        this.orgService.ListJobTitles({}),
      );
      const map = new Map<number, { name: string; code: string }>(
        (res.items ?? []).map((jt) => [jt.id, { name: jt.name ?? '', code: jt.code ?? '' }]),
      );
      this.jobTitleCache = { data: map, expiresAt: Date.now() + CACHE_TTL_MS };
      this.logger.debug(`JobTitle cache refreshed: ${map.size} entries`);
      return map;
    } catch (err) {
      this.logger.warn('Không thể lấy job titles từ user-service, trả Map rỗng', err);
      return this.jobTitleCache?.data ?? new Map();
    }
  }

  /**
   * Lấy Map<id, {name, code}> của tất cả đơn vị tổ chức từ user-service.
   */
  async getUnitMap(): Promise<Map<number, { name: string; code: string }>> {
    if (this.unitCache && Date.now() < this.unitCache.expiresAt) {
      return this.unitCache.data;
    }
    try {
      const res = await firstValueFrom(
        this.orgService.GetFullTree({}),
      );
      const map = new Map<number, { name: string; code: string }>();
      this.flattenNodes(res.nodes ?? [], map);
      this.unitCache = { data: map, expiresAt: Date.now() + CACHE_TTL_MS };
      this.logger.debug(`Unit cache refreshed: ${map.size} entries`);
      return map;
    } catch (err) {
      this.logger.warn('Không thể lấy organization tree từ user-service, trả Map rỗng', err);
      return this.unitCache?.data ?? new Map();
    }
  }

  /** Chủ động xóa cache khi cần invalidate (VD: sau khi user-service cập nhật dữ liệu) */
  invalidateCache() {
    this.jobTitleCache = null;
    this.unitCache = null;
    this.logger.debug('OrganizationClient cache invalidated');
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

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
