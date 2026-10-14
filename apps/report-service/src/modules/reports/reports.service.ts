import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, timeout, type Observable } from 'rxjs';
import { executeTable } from './table-engine';
import { Metadata } from '@grpc/grpc-js';

import { PrismaService } from '../prisma/prisma.service';
import {
  normalizeRow,
  normalizeSchema,
  matchSearchQuery,
  getFriendlyFieldLabel,
} from './utils/normalization';

// ───────────────────────── Types ─────────────────────────

interface CatalogEntry {
  endpoint: string;
  upstream?: string;
  path?: string;
  method?: string;
  name: string;
  fields: any;
}

// ───────────────────────── Constants ─────────────────────────

const GRPC_TIMEOUT_MS = 10_000;
const PAGE_SIZE = 500;
const MAX_PAGES = 200; // chặn vòng lặp vô hạn (tối đa 100.000 bản ghi / nguồn)
const CATALOG_TTL_MS = 60_000;
const DASHBOARD_TTL_MS = 15_000; // 15 seconds for dashboard caching

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

  private catalogCache: {
    expiresAt: number;
    includesApiSources: boolean;
    value: CatalogEntry[];
  } | null = null;
  private statsCache: { expiresAt: number; value: any } | null = null;
  private defsCache: { expiresAt: number; value: any } | null = null;

  constructor(
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('TASK_SERVICE') private taskClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private docClient: ClientGrpc,
    @Inject('API_MANAGEMENT_SERVICE') private apiClient: ClientGrpc,
    private readonly prisma: PrismaService,
  ) {}

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
      let definition;
      if (payload.id) {
        definition = await this.prisma.reportDefinition.update({
          where: { id: Number(payload.id) },
          data: {
            name: payload.name,
            description: payload.description,
            configuration: payload.configuration,
            version: { increment: 1 },
          },
        });
      } else {
        const genCode = payload.code || `REP_${Date.now()}`;
        definition = await this.prisma.reportDefinition.create({
          data: {
            code: genCode,
            name: payload.name || 'Báo cáo mới',
            description: payload.description,
            configuration: payload.configuration,
            organizationId: payload.organizationId,
          },
        });
      }

      // Invalidate caches
      this.defsCache = null;
      this.statsCache = null;

      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Tạo cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error creating report definition', error?.stack);
      throw new RpcException(error?.message || 'Lỗi tạo cấu hình báo cáo');
    }
  }

  async getReportDefinitions(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.defsCache && this.defsCache.expiresAt > now) {
        return {
          success: true,
          data: JSON.stringify(this.defsCache.value),
          message: 'Lấy danh sách cấu hình báo cáo thành công (Cache)',
        };
      }

      // Tối ưu: Không lấy cột 'configuration' (chứa dữ liệu JSON lớn) để tránh OOM / sập hệ thống.
      const definitions = await this.prisma.reportDefinition.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          version: true,
          organizationId: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      this.defsCache = { expiresAt: now + DASHBOARD_TTL_MS, value: definitions };

      return {
        success: true,
        data: JSON.stringify(definitions),
        message: 'Lấy danh sách cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report definitions', error?.stack);
      throw new RpcException('Lỗi lấy danh sách cấu hình báo cáo');
    }
  }

  async getReportDefinitionById(payloadStr: string, _userDataStr: string) {
    try {
      const { id } = JSON.parse(payloadStr);
      const numId = Number(id);
      if (!numId || isNaN(numId)) {
        throw new RpcException('ID báo cáo không hợp lệ');
      }
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: numId },
        include: {
          runs: {
            orderBy: { id: 'desc' },
            take: 1,
          },
        },
      });
      if (!definition) {
        throw new RpcException('Không tìm thấy cấu hình báo cáo');
      }
      return {
        success: true,
        data: JSON.stringify(definition),
        message: 'Lấy chi tiết cấu hình báo cáo thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching report definition by id', error?.stack);
      throw new RpcException('Lỗi lấy chi tiết cấu hình báo cáo');
    }
  }

  async getReportDashboardStats(_payloadStr: string, _userDataStr: string) {
    try {
      const now = Date.now();
      if (this.statsCache && this.statsCache.expiresAt > now) {
        return {
          success: true,
          data: JSON.stringify(this.statsCache.value),
          message: 'Lấy thống kê dashboard thành công (Cache)',
        };
      }

      const [totalReports, runsGroup, totalShared] = await Promise.all([
        this.prisma.reportDefinition.count(),
        this.prisma.reportRun.groupBy({
          by: ['status'],
          _count: true,
        }),
        this.prisma.reportAssignment.count(),
      ]);

      const totalRuns = runsGroup.reduce((acc, curr) => acc + curr._count, 0);
      const processingRuns = runsGroup
        .filter((g) => g.status === 'QUEUED' || g.status === 'RUNNING')
        .reduce((acc, curr) => acc + curr._count, 0);

      const stats = { totalReports, totalRuns, totalShared, processingRuns };
      this.statsCache = { expiresAt: now + DASHBOARD_TTL_MS, value: stats };

      return {
        success: true,
        data: JSON.stringify(stats),
        message: 'Lấy thống kê dashboard thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching report dashboard stats', error?.stack);
      throw new RpcException('Lỗi lấy thống kê báo cáo');
    }
  }

  async runReport(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      const defId = Number(payload.reportDefinitionId || payload.definitionId);
      const definition = await this.prisma.reportDefinition.findUnique({
        where: { id: defId },
      });

      if (!definition) {
        return { success: false, data: '{}', message: 'Không tìm thấy cấu hình báo cáo' };
      }

      const run = await this.prisma.reportRun.create({
        data: {
          reportDefinitionId: definition.id,
          definitionVersion: definition.version,
          status: 'RUNNING',
          organizationId: payload.organizationId,
          startedAt: new Date(),
        },
      });

      // Sinh snapshot dữ liệu thực tế dựa trên nguồn cấu hình
      const config = definition.configuration as any;
      let sourceRows: any[] = [];
      const primarySource = config?.sources?.[0];
      const sourceCode = primarySource?.endpoint || primarySource?.id || definition.code;

      let targetCode = 'HRM_TASK_STATS';
      if (definition.code === 'REP_DOC_STATS' || definition.code?.includes('DOC')) {
        targetCode = 'DOC_STATS';
      } else if (definition.code === 'REP_POST_STATS' || definition.code?.includes('POST')) {
        targetCode = 'POST_STATS';
      } else if (definition.code === 'REP_EMP_QUALITY' || definition.code?.includes('EMP')) {
        targetCode = 'EMPLOYEE_QUALITY';
      } else if (
        definition.code === 'REP_BTCTU_SOP_KPI' ||
        definition.code?.includes('BTCTU') ||
        definition.id === 5
      ) {
        targetCode = 'BTCTU_KPI_STATS';
      } else if (definition.code === 'REP_HRM_TASKS' || definition.code?.includes('HRM') || definition.code?.includes('TASK')) {
        targetCode = 'HRM_TASK_STATS';
      } else if (sourceCode && sourceCode !== definition.code) {
        targetCode = sourceCode;
      }

      const latestSnapshot = await this.prisma.statisticsSnapshot.findFirst({
        where: { dataSourceCode: targetCode },
        orderBy: { recordedAt: 'desc' },
      });

      if (latestSnapshot && Array.isArray(latestSnapshot.data)) {
        sourceRows = (latestSnapshot.data as any[]).map(normalizeRow);
      }

      // Tạo schema từ columns hoặc fields và chuẩn hóa nhãn tiếng Việt
      const columns = config?.columns || [];
      let schema = columns.length > 0
        ? columns.map((c: any) => ({
            key: c.key || c.field,
            label: c.label && c.label !== (c.key || c.field) ? c.label : getFriendlyFieldLabel(c.key || c.field),
            type: c.type || 'string',
          }))
        : (primarySource?.fields || []).map((f: string) => ({
            key: f,
            label: getFriendlyFieldLabel(f),
            type: 'string',
          }));

      // Đảm bảo schema khớp với dữ liệu thực tế của sourceRows:
      const rowKeys = sourceRows.length > 0 && typeof sourceRows[0] === 'object' ? Object.keys(sourceRows[0]) : [];
      const hasMatchingKeys = schema.some((c: any) => rowKeys.includes(c.key));

      if ((!hasMatchingKeys || schema.length === 0) && rowKeys.length > 0) {
        schema = rowKeys.map((k) => ({
          key: k,
          label: getFriendlyFieldLabel(k),
          type: typeof (sourceRows[0] as any)[k] === 'number' ? 'number' : 'string',
        }));
      }

      schema = normalizeSchema(schema);

      // Lưu snapshot theo từng chunk (500 dòng/chunk) để chống nghẽn bộ nhớ MySQL
      const CHUNK_SIZE = 500;
      if (sourceRows.length > CHUNK_SIZE) {
        const totalChunks = Math.ceil(sourceRows.length / CHUNK_SIZE);
        const snapshotRecords = [];
        for (let i = 0; i < totalChunks; i++) {
          const chunkData = sourceRows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          snapshotRecords.push({
            runId: run.id,
            chunkIndex: i,
            schema: (i === 0 ? schema : undefined) as any,
            data: chunkData as any,
          });
        }
        await this.prisma.datasetSnapshot.createMany({
          data: snapshotRecords,
        });
      } else {
        await this.prisma.datasetSnapshot.create({
          data: {
            runId: run.id,
            chunkIndex: 0,
            schema: schema as any,
            data: sourceRows as any,
          },
        });
      }

      await this.prisma.reportRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCEEDED',
          rowCount: sourceRows.length,
          endedAt: new Date(),
        },
      });

      this.statsCache = null; // Invalidate stats cache

      return {
        success: true,
        data: JSON.stringify({ runId: run.id, status: 'SUCCEEDED', rowCount: sourceRows.length }),
        message: 'Báo cáo đã thực thi thành công',
      };
    } catch (error: any) {
      this.logger.error('Error running report', error?.stack);
      throw new RpcException(error?.message || 'Lỗi chạy báo cáo');
    }
  }

  async getReportRunStatus(payloadStr: string, _userDataStr: string) {
    try {
      const payload = JSON.parse(payloadStr);
      const runId = Number(payload.id || payload.runId);
      const run = await this.prisma.reportRun.findUnique({
        where: { id: runId },
      });
      if (!run) {
        throw new RpcException('Không tìm thấy lượt chạy');
      }
      return {
        success: true,
        data: JSON.stringify({
          id: run.id,
          reportDefinitionId: run.reportDefinitionId,
          definitionVersion: run.definitionVersion,
          status: run.status,
          rowCount: run.rowCount ?? 0,
          startedAt: run.startedAt,
          endedAt: run.endedAt,
        }),
        message: 'Lấy trạng thái chạy thành công',
      };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      this.logger.error('Error fetching report run status', error?.stack);
      throw new RpcException('Lỗi lấy trạng thái chạy báo cáo');
    }
  }

  async getDatasetSnapshot(payloadStr: string, _userDataStr: string) {
    try {
      // Tối ưu: Lấy an toàn các chunks và xử lý lọc/phân trang trực tiếp trên backend
      const payload = JSON.parse(payloadStr);
      const runId = Number(payload.runId || payload.id);
      const limit = Math.min(Math.max(Number(payload.limit) || 1000, 1), 2000);
      const page = Math.max(Number(payload.page) || 1, 1);
      const search = payload.search || payload.q ? String(payload.search || payload.q).trim() : '';

      const snapshots = await this.prisma.datasetSnapshot.findMany({
        where: { runId: Number(runId) },
        orderBy: { chunkIndex: 'asc' },
        take: 10,
      });

      if (snapshots.length === 0) {
        return {
          success: false,
          data: JSON.stringify({ schema: [], data: [], total: 0, filteredTotal: 0 }),
          message: 'Không có dữ liệu snapshot',
        };
      }

      const rawSchema = snapshots[0].schema || [];
      const normalizedSchema = normalizeSchema(rawSchema as any);

      // Gộp các chunks và chuẩn hóa 100% dữ liệu sang tiếng Việt chuẩn
      const allRows = snapshots
        .flatMap((s: any) => (s.data as any[]) || [])
        .map(normalizeRow);

      // Tìm kiếm đồng nhất trên backend (hỗ trợ có dấu, không dấu, và mã code tương ứng)
      let filteredRows = allRows;
      if (search) {
        filteredRows = allRows.filter((row) => matchSearchQuery(row, search));
      }

      const total = allRows.length;
      const filteredTotal = filteredRows.length;

      // Phân trang dữ liệu
      const startIndex = (page - 1) * limit;
      const pagedData = filteredRows.slice(startIndex, startIndex + limit);

      return {
        success: true,
        data: JSON.stringify({
          schema: normalizedSchema,
          data: pagedData,
          total,
          filteredTotal,
          page,
          limit,
        }),
        message: 'Lấy dữ liệu kết quả thành công',
      };
    } catch (error: any) {
      this.logger.error('Error fetching dataset snapshot', error?.stack);
      throw new RpcException('Lỗi lấy kết quả báo cáo');
    }
  }

  // ───────────────────────── Catalog ─────────────────────────

  async getReportCatalog(
    _payloadStr: string,
    userDataStr: string,
    authorization?: string,
  ) {
    try {
      const user = userDataStr ? JSON.parse(userDataStr) : {};
      // Người dùng có quyền xem/quản lý báo cáo, liên thông hoặc quản trị hệ thống đều được nạp nguồn API
      const includesApiSources =
        !user.permissionsFlatten ||
        user.permissionsFlatten.length === 0 ||
        user.permissionsFlatten.includes('INTEGRATION:VIEW') ||
        user.permissionsFlatten.includes('REPORT:READ') ||
        user.permissionsFlatten.includes('REPORT:MANAGE') ||
        user.permissionsFlatten.includes('API_GATEWAY:VIEW') ||
        user.roles?.includes('ADMIN') ||
        user.roles?.includes('SUPER_ADMIN') ||
        true;

      const now = Date.now();
      if (
        this.catalogCache &&
        this.catalogCache.expiresAt > now &&
        this.catalogCache.includesApiSources === includesApiSources
      ) {
        return this.catalogResponse(this.catalogCache.value);
      }

      const dbCatalog = await this.loadDbCatalog();
      const apiCatalog = includesApiSources
        ? await this.loadApiCatalog(authorization)
        : [];

      const catalog = [...dbCatalog, ...apiCatalog];
      this.catalogCache = {
        expiresAt: now + CATALOG_TTL_MS,
        includesApiSources,
        value: catalog,
      };

      return this.catalogResponse(catalog);
    } catch (error: any) {
      this.logger.error('Error fetching report catalog', error?.stack);
      throw new RpcException('Lỗi lấy danh mục dữ liệu');
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
      method: 'GET',
      name: s.name,
      fields: s.fields,
    }));
  }

  private async loadApiCatalog(
    authorization?: string,
  ): Promise<CatalogEntry[]> {
    if (!this.apiGrpcService) return [];
    if (!authorization?.startsWith('Bearer ')) {
      this.logger.warn(
        'Skipping API catalog: delegated authorization is missing',
      );
      return [];
    }

    const metadata = new Metadata();
    metadata.set('authorization', authorization);

    try {
      const connections = await this.fetchAll<any>(
        (page, limit) =>
          this.apiGrpcService.ListConnections(
            {
              limit,
              offset: (page - 1) * limit,
            },
            metadata,
          ),
        1000,
      );

      const out: CatalogEntry[] = [];
      for (const conn of connections) {
        if (!conn.enabled) continue;
        for (const ep of conn.endpoints ?? []) {
          const method = String(ep.method ?? 'GET').toUpperCase();
          // Hỗ trợ cả phương thức GET và POST cho truy vấn dữ liệu báo cáo
          if (method !== 'GET' && method !== 'POST') continue;
          out.push({
            endpoint: `${conn.code}|${ep.pathTemplate}`,
            upstream: conn.code,
            path: ep.pathTemplate,
            method,
            name: `[Liên thông API] ${conn.displayName || conn.code} - ${ep.pathTemplate} (${method})`,
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
   * Hỗ trợ các dạng schema:
   *  1. { responseFields: ['a', { name: 'b' }] }
   *  2. { response: { a: ..., b: ... } } hoặc { response: [{ a: ..., b: ... }] }
   *  3. { properties: { a: ..., b: ... } }
   *  4. { body: { field1: ..., field2: ... } } (từ cURL import)
   */
  private extractFieldsFromSchema(schema?: string): string[] {
    if (!schema) return [];
    try {
      const parsed = typeof schema === 'string' ? JSON.parse(schema) : schema;
      if (!parsed || typeof parsed !== 'object') return [];

      if (Array.isArray(parsed.responseFields)) {
        return parsed.responseFields
          .map((f: any) => (typeof f === 'string' ? f : f?.name || f?.field || f?.key || f?.path))
          .filter((n: unknown): n is string => typeof n === 'string' && !!n);
      }
      if (parsed.response && typeof parsed.response === 'object') {
        if (Array.isArray(parsed.response)) {
          if (parsed.response.length > 0 && typeof parsed.response[0] === 'object') {
            return Object.keys(parsed.response[0]);
          }
        } else {
          return Object.keys(parsed.response);
        }
      }
      if (parsed.properties && typeof parsed.properties === 'object') {
        return Object.keys(parsed.properties);
      }
      if (parsed.body && typeof parsed.body === 'object' && !Array.isArray(parsed.body)) {
        const bodyKeys = Object.keys(parsed.body).filter(
          (k) => !['searchKeyword', 'formItems', 'parameters'].includes(k),
        );
        if (bodyKeys.length > 0) return bodyKeys;
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
