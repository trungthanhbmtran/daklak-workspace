import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout, type Observable } from 'rxjs';
import { executeTable } from './table-engine';

import { PrismaService } from '../prisma/prisma.service';

// ───────────────────────── Types ─────────────────────────

interface CatalogEntry {
  endpoint: string;
  upstream?: string;
  path?: string;
  name: string;
  fields: any;
}

// ───────────────────────── Constants ─────────────────────────

const GRPC_TIMEOUT_MS = 10_000;
const PAGE_SIZE = 500;
const MAX_PAGES = 200; // chặn vòng lặp vô hạn (tối đa 100.000 bản ghi / nguồn)
const CATALOG_TTL_MS = 60_000;

const SCHEMA_META_KEYS = new Set([
  'name',
  'description',
  'parameters',
  'body',
  'responseFields',
]);

const FALLBACK_CATALOG: CatalogEntry[] = [
  {
    endpoint: 'HRM_TASK_STATS',
    name: 'Thống kê nhiệm vụ',
    fields: ['taskId', 'employeeId', 'status', 'hours'],
  },
  {
    endpoint: 'DOC_STATS',
    name: 'Thống kê văn bản',
    fields: ['docId', 'departmentId', 'type', 'issueDate'],
  },
];

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name);
  private orgGrpcService: any;
  private taskGrpcService: any;
  private docGrpcService: any;
  private apiGrpcService: any;

  private catalogCache: { expiresAt: number; value: CatalogEntry[] } | null =
    null;

  constructor(
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('TASK_SERVICE') private taskClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private docClient: ClientGrpc,
    @Inject('API_MANAGEMENT_SERVICE') private apiClient: ClientGrpc,
    private readonly prisma: PrismaService,
  ) { }

  onModuleInit() {
    this.orgGrpcService = this.userClient.getService<any>('OrganizationService');
    this.taskGrpcService = this.taskClient.getService<any>('TaskService');
    this.docGrpcService = this.docClient.getService<any>('DocumentService');
    this.apiGrpcService = this.apiClient.getService<any>('ApiManagementService');
  }

  // ───────────────────────── Dynamic Report Designer ─────────────────────────

  async createReportDefinition(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      const definition = await this.prisma.reportDefinition.create({
        data: {
          code: payload.code,
          name: payload.name,
          description: payload.description,
          configuration: payload.configuration,
          organizationId: payload.organizationId,
        },
      });
      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Tạo cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error creating report definition', error?.stack);
      return { success: false, data: '{}', message: error?.message || 'Lỗi tạo cấu hình báo cáo' };
    }
  }

  async getReportDefinitions(_payloadStr: string, _userDataStr: string) {
    try {
      const definitions = await this.prisma.reportDefinition.findMany({
        orderBy: { updatedAt: 'desc' },
      });
      return {
        success: true,
        data: JSON.stringify(definitions),
        message: 'Lấy danh sách cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report definitions', error?.stack);
      return { success: false, data: '[]', message: 'Lỗi lấy danh sách cấu hình báo cáo' };
    }
  }

  async getReportDefinitionById(payloadStr: string, _userDataStr: string) {
    try {
      const { id } = JSON.parse(payloadStr);
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: Number(id) },
      });
      if (!definition) {
        return { success: false, data: '{}', message: 'Không tìm thấy cấu hình báo cáo' };
      }
      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Lấy chi tiết cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report definition by id', error?.stack);
      return { success: false, data: '{}', message: 'Lỗi lấy chi tiết cấu hình báo cáo' };
    }
  }

  async runReport(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: Number(payload.reportDefinitionId) },
      });
      
      if (!definition) {
        return { success: false, data: '{}', message: 'Không tìm thấy cấu hình báo cáo' };
      }

      const run = await this.prisma.reportRun.create({
        data: {
          reportDefinitionId: definition.id,
          definitionVersion: definition.version,
          status: 'QUEUED',
          organizationId: payload.organizationId,
        },
      });

      return {
        success: true,
        data: JSON.stringify({ runId: run.id }),
        message: 'Đã đưa báo cáo vào hàng đợi chạy',
      };
    } catch (error: any) {
      this.logger.error('Error running report', error?.stack);
      return { success: false, data: '{}', message: 'Lỗi chạy báo cáo' };
    }
  }

  async getReportRunStatus(payloadStr: string, _userDataStr: string) {
    try {
      const { runId } = JSON.parse(payloadStr);
      const run = await this.prisma.reportRun.findUnique({
        where: { id: Number(runId) },
      });
      if (!run) {
        return { success: false, data: '{}', message: 'Không tìm thấy lượt chạy' };
      }
      return {
        success: true,
        data: JSON.stringify({ status: run.status }),
        message: 'Lấy trạng thái chạy thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report run status', error?.stack);
      return { success: false, data: '{}', message: 'Lỗi lấy trạng thái chạy báo cáo' };
    }
  }

  async getDatasetSnapshot(payloadStr: string, _userDataStr: string) {
    try {
      const { runId } = JSON.parse(payloadStr);
      const snapshots = await this.prisma.datasetSnapshot.findMany({
        where: { runId: Number(runId) },
        orderBy: { chunkIndex: 'asc' },
      });
      
      if (snapshots.length === 0) {
        return { success: false, data: JSON.stringify({ schema: [], data: [] }), message: 'Không có dữ liệu snapshot' };
      }
      
      const schema = snapshots[0].schema;
      const combinedData = snapshots.flatMap((s: any) => (s.data as any[]) || []);

      return {
        success: true,
        data: JSON.stringify({ schema, data: combinedData }),
        message: 'Lấy dữ liệu kết quả thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching dataset snapshot', error?.stack);
      return { success: false, data: JSON.stringify({ schema: [], data: [] }), message: 'Lỗi lấy kết quả báo cáo' };
    }
  }

  // ───────────────────────── Catalog ─────────────────────────

  async getReportCatalog(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.catalogCache && this.catalogCache.expiresAt > now) {
        return this.catalogResponse(this.catalogCache.value);
      }

      const [dbCatalog, apiCatalog] = await Promise.all([
        this.loadDbCatalog(),
        this.loadApiCatalog(),
      ]);

      const catalog = [...dbCatalog, ...apiCatalog];
      this.catalogCache = { expiresAt: now + CATALOG_TTL_MS, value: catalog };

      return this.catalogResponse(catalog);
    } catch (error: any) {
      this.logger.error('Error fetching report catalog', error?.stack);
      return {
        success: false,
        message: 'Lỗi lấy danh mục dữ liệu',
        data: JSON.stringify([]),
      };
    }
  }

  private catalogResponse(catalog: CatalogEntry[]) {
    return {
      success: true,
      message: 'Lấy danh mục dữ liệu thành công',
      data: JSON.stringify(catalog),
    };
  }

  private async loadDbCatalog(): Promise<CatalogEntry[]> {
    const sources = await this.prisma.reportDataSource.findMany({
      select: {
        code: true,
        name: true,
        upstream: true,
        path: true,
        fields: true,
      },
    });

    if (sources.length === 0) return FALLBACK_CATALOG;

    return sources.map((s) => ({
      endpoint: s.code, // Alias cho frontend
      upstream: s.upstream,
      path: s.path,
      name: s.name,
      fields: s.fields,
    }));
  }

  private async loadApiCatalog(): Promise<CatalogEntry[]> {
    if (!this.apiGrpcService) return [];

    try {
      const connections = await this.fetchAll<any>(
        (page, limit) =>
          this.apiGrpcService.ListConnections({
            limit,
            offset: (page - 1) * limit,
          }),
        1000,
      );

      const out: CatalogEntry[] = [];
      for (const conn of connections) {
        if (!conn.enabled) continue;
        for (const ep of conn.endpoints ?? []) {
          if (String(ep.method ?? '').toUpperCase() !== 'GET') continue;
          out.push({
            endpoint: `${conn.code}|${ep.pathTemplate}`,
            upstream: conn.code,
            path: ep.pathTemplate,
            name: `[Liên thông API] ${conn.displayName || conn.code} - ${ep.pathTemplate}`,
            fields: this.extractFieldsFromSchema(ep.schema),
          });
        }
      }
      return out;
    } catch (err: any) {
      // Nguồn bổ sung: lỗi thì vẫn trả catalog từ DB nhưng không cache kết quả thiếu
      this.logger.warn(`Could not sync catalog with API Manager: ${err?.message}`);
      this.catalogCache = null;
      return [];
    }
  }

  /**
   * Hỗ trợ 3 dạng schema:
   *  1. { responseFields: ['a', { name: 'b' }] }
   *  2. { response: { a: ..., b: ... } }
   *  3. { a: ..., b: ... } (bỏ các key meta)
   */
  private extractFieldsFromSchema(schema?: string): string[] {
    if (!schema) return [];
    try {
      const parsed = JSON.parse(schema);
      if (!parsed || typeof parsed !== 'object') return [];

      if (Array.isArray(parsed.responseFields)) {
        return parsed.responseFields
          .map((f: any) => (typeof f === 'string' ? f : f?.name))
          .filter((n: unknown): n is string => typeof n === 'string');
      }
      if (parsed.response && typeof parsed.response === 'object') {
        return Object.keys(parsed.response);
      }
      return Object.keys(parsed).filter((k) => !SCHEMA_META_KEYS.has(k));
    } catch (e: any) {
      this.logger.debug(`Invalid endpoint schema JSON: ${e?.message}`);
      return [];
    }
  }

  // ───────────────────────── Helpers ─────────────────────────

  /** Gọi gRPC có timeout. */
  private call<T = any>(obs: Observable<T>, ms = GRPC_TIMEOUT_MS): Promise<T> {
    return firstValueFrom(obs.pipe(timeout(ms)));
  }

  /** Lấy toàn bộ dữ liệu theo trang cho tới khi hết. */
  private async fetchAll<T>(
    makeCall: (page: number, limit: number) => Observable<any>,
    limit = PAGE_SIZE,
  ): Promise<T[]> {
    const out: T[] = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res: any = await this.call(makeCall(page, limit));
      const data: T[] = res?.data ?? [];
      out.push(...data);

      const total = typeof res?.total === 'number' ? res.total : undefined;
      if (data.length === 0) return out;
      if (total !== undefined ? out.length >= total : data.length < limit) {
        return out;
      }
    }
    throw new Error(
      `Vượt quá ${MAX_PAGES} trang khi lấy dữ liệu, có thể dữ liệu quá lớn hoặc phân trang lỗi`,
    );
  }
}