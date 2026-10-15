import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { executeTable } from '../reports/table-engine';
import {
  translateStatus,
  translatePriority,
  URGENCY_VIETNAMESE_MAP,
  SECURITY_VIETNAMESE_MAP,
} from '../reports/utils/normalization';

@Injectable()
export class StatisticsService implements OnModuleInit {
  private readonly logger = new Logger(StatisticsService.name);
  private orgService: any;
  private taskService: any;
  private postService: any;
  private documentService: any;
  private kpiService: any;

  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_SERVICE') private readonly orgClient: ClientGrpc,
    @Inject('TASK_SERVICE') private readonly taskClient: ClientGrpc,
    @Inject('POST_SERVICE') private readonly postClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private readonly documentClient: ClientGrpc,
    @Inject('KPI_SERVICE') private readonly kpiClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orgService = this.orgClient.getService('OrganizationService');
    this.taskService = this.taskClient.getService('TaskService');
    this.postService = this.postClient.getService('PostService');
    this.documentService = this.documentClient.getService('DocumentService');
    this.kpiService = this.kpiClient.getService('KpiService');
  }

  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now())
      return this.unitMapCache.data;
    try {
      const orgRes: any = await firstValueFrom(
        this.orgService.GetOrganizations({}),
      );
      const unitMap: Record<number, any> = {};
      (orgRes?.nodes || []).forEach((n: any) => {
        const nId = parseInt(n.id, 10);
        if (nId) unitMap[nId] = { id: nId, name: n.name, code: n.code };
      });
      this.unitMapCache = {
        data: unitMap,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return unitMap;
    } catch (error) {
      this.logger.error('getUnitMap failed:', error);
      return {};
    }
  }

  // =========================================================================
  // CQRS / EVENT-SOURCING SNAPSHOT HANDLERS (WRITE-MODEL -> READ-MODEL)
  // =========================================================================

  private getSafeListReq(filter: any) {
    const safeLimit = Math.min(Math.max(Number(filter?.limit) || 1000, 1), 2000);
    const safePage = Math.max(Number(filter?.page) || 1, 1);
    const req = { ...filter, page: safePage, limit: safeLimit };
    delete req.config;
    delete req.format;
    return req;
  }

  private async saveSnapshot(dataSourceCode: string, data: any) {
    try {
      await this.prisma.statisticsSnapshot.create({
        data: {
          dataSourceCode,
          data,
        },
      });
      const oldSnapshots = await this.prisma.statisticsSnapshot.findMany({
        where: { dataSourceCode },
        orderBy: { recordedAt: 'desc' },
        skip: 5,
        select: { id: true },
      });
      if (oldSnapshots.length > 0) {
        await this.prisma.statisticsSnapshot.deleteMany({
          where: { id: { in: oldSnapshots.map((s) => s.id) } },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to save snapshot for ${dataSourceCode}:`, err);
    }
  }

  async recordTaskCompleted(data: any) {
    this.logger.log(`[CQRS Event] task.completed received for task ${data.taskId}`);
    await this.handleTaskStateChanged({ ...data, status: 'COMPLETED' });
  }

  async handleTaskCreated(data: any) {
    this.logger.log(`[CQRS Event] task.created received for task ${data.taskId}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'HRM_TASK_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && Array.isArray(latest.data)) {
      const rows = [...(latest.data as any[])];
      rows.unshift({
        id: data.taskId,
        title: data.title || `Nhiệm vụ #${data.taskId}`,
        status: translateStatus(data.status || 'PENDING_ACCEPTANCE'),
        priority: translatePriority(data.priority || 'MEDIUM'),
        progress: 0,
        departmentId: data.departmentId || 0,
        departmentName: 'Đang cập nhật',
        assigneeCode: data.assigneeCode || 'Chưa giao',
        assigneeName: data.assigneeName || 'Chưa giao',
        dueDate: data.dueDate ? String(data.dueDate).split('T')[0] : '',
        createdAt: new Date().toISOString().split('T')[0],
        isOverdue: 'Đúng hạn',
        isCompleted: 'Chưa hoàn thành',
      });
      await this.saveSnapshot('HRM_TASK_STATS', rows);
    }
  }

  async handleTaskStateChanged(data: any) {
    this.logger.log(`[CQRS Event] task.state_changed: task ${data.taskId} -> ${data.status}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'HRM_TASK_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && Array.isArray(latest.data)) {
      const rows = (latest.data as any[]).map((r) => {
        if (r.id === data.taskId) {
          const isDone = data.status === 'COMPLETED' || data.status === 'DONE';
          return {
            ...r,
            status: translateStatus(data.status || r.status),
            progress: isDone ? 100 : (data.progress ?? r.progress),
            isCompleted: isDone ? 'Hoàn thành' : 'Chưa hoàn thành',
          };
        }
        return r;
      });
      await this.saveSnapshot('HRM_TASK_STATS', rows);
    }
  }

  async handlePostPublished(data: any) {
    this.logger.log(`[CQRS Event] post.published received for post ${data.id}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'POST_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && Array.isArray(latest.data)) {
      const rows = (latest.data as any[]).map((r) => {
        if (r.id === data.id) {
          return { ...r, status: translateStatus('PUBLISHED') };
        }
        return r;
      });
      await this.saveSnapshot('POST_STATS', rows);
    }
  }

  async handleDocumentCreated(data: any) {
    this.logger.log(`[CQRS Event] document.created received for document ${data.id}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'DOC_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && Array.isArray(latest.data)) {
      const rows = [...(latest.data as any[])];
      const urg = String(data.urgency || 'NORMAL').toUpperCase();
      const sec = String(data.securityLevel || 'NORMAL').toUpperCase();
      rows.unshift({
        id: data.id,
        documentNumber: data.documentNumber || `VB-${data.id}`,
        abstract: data.abstract || '',
        status: translateStatus(data.status || 'PROCESSING'),
        isIncoming: data.isIncoming ? 'Văn bản đến' : 'Văn bản đi',
        urgency: URGENCY_VIETNAMESE_MAP[urg] || 'Bình thường',
        securityLevel: SECURITY_VIETNAMESE_MAP[sec] || 'Thường',
        pageCount: Number(data.pageCount || 1),
        isLate: 'Đúng hạn',
        issueDate: new Date().toISOString().split('T')[0],
        deadlineDate: data.processingDeadline ? String(data.processingDeadline).split('T')[0] : '',
      });
      await this.saveSnapshot('DOC_STATS', rows);
    }
  }

  private getInternalMeta(metadata?: Metadata): Metadata {
    const meta = metadata ? metadata.clone() : new Metadata();
    if (!meta.get('x-internal-token')?.length) {
      meta.set(
        'x-internal-token',
        process.env.INTERNAL_TOKEN || 'internal-secret-daklak',
      );
    }
    return meta;
  }

  // =========================================================================
  // DYNAMIC DATASET QUERY METHODS (FLAT ROWS FOR CHARTS & TABLE ENGINE)
  // =========================================================================

  async getTaskStatistics(filter: any, _user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;

      // 1. Check CQRS Read-Model Snapshot
      let rows: any[] = [];
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'HRM_TASK_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && Array.isArray(cached.data)) {
          const ageMinutes =
            (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 5) {
            rows = cached.data as any[];
          }
        }
      }

      // 2. Fetch via gRPC if no cached flat dataset
      if (rows.length === 0) {
        const listReq = this.getSafeListReq(filter);
        listReq.status = listReq.status || 'ALL';
        listReq.isAdmin = true;
        const callMeta = this.getInternalMeta(metadata);

        let allTasks: any[] = [];
        try {
          const res: any = await firstValueFrom(
            this.taskService.ListTasks(listReq, callMeta),
          );
          allTasks = res?.data || [];
        } catch (grpcErr: any) {
          this.logger.warn(
            `Failed to call taskService.ListTasks: ${grpcErr?.message}`,
          );
          const fallbackSnap = await this.prisma.statisticsSnapshot.findFirst({
            where: { dataSourceCode: 'HRM_TASK_STATS' },
            orderBy: { recordedAt: 'desc' },
          });
          if (fallbackSnap && Array.isArray(fallbackSnap.data)) {
            rows = fallbackSnap.data as any[];
          }
        }

        if (allTasks.length > 0) {
          const nowTime = Date.now();
          let unitMap: Record<number, any> = {};
          try {
            unitMap = await this.getUnitMap();
          } catch {
            // Fallback to empty unit map
          }

        rows = allTasks.map((t: any) => {
          const isDone = t.status === 'COMPLETED' || t.status === 'DONE';
          const taskDueTime = t.dueDate ? new Date(t.dueDate).getTime() : null;
          const isOverdue = !isDone && taskDueTime && nowTime > taskDueTime;
          const mainAssignee = t.participants?.find(
            (p: any) => p.role === 'ASSIGNEE',
          );
          const assigneeCode =
            mainAssignee?.employeeCode || t.assigneeCode || 'Chưa giao';
          const assigneeName =
            mainAssignee?.fullName || t.assigneeName || (assigneeCode !== 'Chưa giao' ? assigneeCode : 'Chưa giao');
          const deptId = t.departmentId || mainAssignee?.departmentId || t.plan?.departmentId || 0;
          const deptName =
            (unitMap[deptId] ? unitMap[deptId].name : null) ||
            (deptId === 0 || deptId === 2 ? 'Sở Khoa học và Công nghệ' : 'Chưa phân công');

          return {
            id: t.id,
            title: t.title || `Nhiệm vụ #${t.id}`,
            status: translateStatus(t.status),
            priority: translatePriority(t.priority || 'MEDIUM'),
            progress: Number(t.progress || (isDone ? 100 : 0)),
            departmentId: deptId,
            departmentName: deptName,
            assigneeCode,
            assigneeName,
            dueDate: t.dueDate
              ? new Date(t.dueDate).toISOString().split('T')[0]
              : '',
            createdAt: t.createdAt
              ? new Date(t.createdAt).toISOString().split('T')[0]
              : '',
            isOverdue: isOverdue ? 'Quá hạn' : 'Đúng hạn',
            isCompleted: isDone ? 'Hoàn thành' : 'Chưa hoàn thành',
          };
        });

          if (isGenericQuery) {
            await this.saveSnapshot('HRM_TASK_STATS', rows);
          }
        }
      }

      // 3. Xử lý qua TableEngine nếu có TableConfig
      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo nhiệm vụ (Table Engine)',
          data: tableResult,
        };
      }

      // 4. Tính toán bộ chỉ số tổng hợp cho Biểu đồ & Dashboard
      const taskRows = rows || [];
      const totalTasks = taskRows.length;
      const completedTasks = taskRows.filter(
        (r) =>
          r.status === 'Hoàn thành' ||
          r.isCompleted === 'Hoàn thành' ||
          Number(r.progress) === 100,
      ).length;
      const overdueTasks = taskRows.filter((r) => r.isOverdue === 'Quá hạn').length;
      const inProgressTasks = Math.max(0, totalTasks - completedTasks - overdueTasks);

      const deptMap = new Map<
        string,
        { completed: number; inTime: number; completedOverdue: number; overdue: number }
      >();
      for (const r of taskRows) {
        const dept = r.departmentName || 'Chưa phân công';
        if (!deptMap.has(dept)) {
          deptMap.set(dept, {
            completed: 0,
            inTime: 0,
            completedOverdue: 0,
            overdue: 0,
          });
        }
        const entry = deptMap.get(dept)!;
        const isDone =
          r.status === 'Hoàn thành' ||
          r.isCompleted === 'Hoàn thành' ||
          Number(r.progress) === 100;
        const isOverdue = r.isOverdue === 'Quá hạn';
        if (isDone) {
          if (isOverdue) entry.completedOverdue++;
          else entry.completed++;
        } else {
          if (isOverdue) entry.overdue++;
          else entry.inTime++;
        }
      }
      const departmentStats = Array.from(deptMap.entries()).map(([name, val]) => ({
        name,
        ...val,
      }));

      const userMap = new Map<
        string,
        { completed: number; inTime: number; completedOverdue: number; overdue: number }
      >();
      for (const r of taskRows) {
        const name = r.assigneeName || r.assigneeCode || 'Chưa giao';
        if (!userMap.has(name)) {
          userMap.set(name, {
            completed: 0,
            inTime: 0,
            completedOverdue: 0,
            overdue: 0,
          });
        }
        const entry = userMap.get(name)!;
        const isDone =
          r.status === 'Hoàn thành' ||
          r.isCompleted === 'Hoàn thành' ||
          Number(r.progress) === 100;
        const isOverdue = r.isOverdue === 'Quá hạn';
        if (isDone) {
          if (isOverdue) entry.completedOverdue++;
          else entry.completed++;
        } else {
          if (isOverdue) entry.overdue++;
          else entry.inTime++;
        }
      }
      const individualStats = Array.from(userMap.entries())
        .slice(0, 12)
        .map(([name, val]) => ({
          name,
          ...val,
        }));

      let excellent = 0;
      let good = 0;
      let fair = 0;
      let notCompleted = 0;
      for (const r of taskRows) {
        const isDone =
          r.status === 'Hoàn thành' ||
          r.isCompleted === 'Hoàn thành' ||
          Number(r.progress) === 100;
        const isOverdue = r.isOverdue === 'Quá hạn';
        if (isDone && !isOverdue) {
          if (Number(r.progress) >= 100) excellent++;
          else good++;
        } else if (isDone && isOverdue) {
          fair++;
        } else if (isOverdue) {
          notCompleted++;
        } else {
          good++;
        }
      }
      const kpiStats = [
        { name: 'Hoàn thành xuất sắc', value: excellent },
        { name: 'Hoàn thành tốt', value: good },
        { name: 'Hoàn thành', value: fair },
        { name: 'Quá hạn / Chưa đạt', value: notCompleted },
      ].filter((item) => item.value > 0);

      const dashboardPayload = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        departmentStats,
        individualStats,
        kpiStats,
        rows: taskRows,
        items: taskRows,
      };

      // Trả về cấu trúc tổng hợp tương thích cả ChartRenderer, Dynamic Builder và TaskDashboard
      return {
        success: true,
        message: 'Lấy dữ liệu nhiệm vụ động thành công',
        data: dashboardPayload,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê nhiệm vụ:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê nhiệm vụ');
    }
  }

  async getPostStatistics(filter: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;

      let rows: any[] | null = null;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'POST_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && Array.isArray(cached.data)) {
          const ageMinutes =
            (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            rows = cached.data as any[];
          }
        }
      }

      if (!rows) {
        const listReq = this.getSafeListReq(filter);

        const res: any = await firstValueFrom(
          this.postService.ListPosts(listReq, metadata),
        );
        const allPosts = res?.data || [];

        rows = allPosts.map((p: any) => ({
          id: p.id,
          title: p.title || '',
          status: translateStatus(p.status),
          categoryName: p.category || p.categoryName || 'Tin tức chung',
          authorName: p.authorName || p.authorId || 'Ban biên tập',
          viewCount: Number(p.viewCount || 0),
          isFeatured: p.isFeatured ? 'Nổi bật' : 'Bình thường',
          publishedDate: p.publishedAt
            ? new Date(p.publishedAt).toISOString().split('T')[0]
            : '',
          createdAt: p.createdAt
            ? new Date(p.createdAt).toISOString().split('T')[0]
            : '',
        }));

        if (isGenericQuery) {
          await this.saveSnapshot('POST_STATS', rows);
        }
      }

      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo bài viết (Table Engine)',
          data: tableResult,
        };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu bài viết động thành công',
        data: rows,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê bài viết:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê bài viết');
    }
  }

  async getKpiStatistics(filter: any, _user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;

      let rows: any[] | null = null;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'KPI_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && Array.isArray(cached.data)) {
          const ageMinutes =
            (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            rows = cached.data as any[];
          }
        }
      }

      if (!rows) {
        const listReq = this.getSafeListReq(filter);

        const res: any = await firstValueFrom(
          this.kpiService.FindEvaluations(listReq, metadata),
        );
        const allEvals = res?.data || [];

        let unitMap: Record<number, any> = {};
        try {
          unitMap = await this.getUnitMap();
        } catch {
          // Fallback to empty unit map
        }

        rows = allEvals.map((ev: any) => {
          const deptId = ev.employee?.departmentId || 0;
          const deptName =
            (unitMap[deptId] ? unitMap[deptId].name : null) || 'Chưa xác định';
          return {
            id: ev.id,
            employeeCode: ev.employeeCode || '',
            employeeName: ev.employee?.fullName || ev.employeeCode || '',
            departmentName: deptName,
            periodId: String(ev.periodId || ''),
            totalScore: Number(ev.totalScore || 0),
            status: translateStatus(ev.status || 'SUBMITTED'),
          };
        });

        if (isGenericQuery) {
          await this.saveSnapshot('KPI_STATS', rows);
        }
      }

      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo KPI (Table Engine)',
          data: tableResult,
        };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu KPI động thành công',
        data: rows,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê KPI:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê KPI');
    }
  }

  async getDocumentStatistics(filter: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;

      let rows: any[] | null = null;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'DOC_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && Array.isArray(cached.data)) {
          const ageMinutes =
            (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            rows = cached.data as any[];
          }
        }
      }

      if (!rows) {
        const listReq = this.getSafeListReq(filter);

        const res: any = await firstValueFrom(
          this.documentService.ListDocuments(listReq, metadata),
        );
        const allDocs = res?.data || [];
        const now = Date.now();

        rows = allDocs.map((doc: any) => {
          const isIncoming = doc.isIncoming ? 'Văn bản đến' : 'Văn bản đi';
          const deadline = doc.processingDeadline
            ? new Date(doc.processingDeadline).getTime()
            : null;
          const isLate =
            doc.status === 'PROCESSING' && deadline && deadline < now;
          const urg = String(doc.urgency || 'NORMAL').toUpperCase();
          const sec = String(doc.securityLevel || 'NORMAL').toUpperCase();

          return {
            id: doc.id,
            documentNumber: doc.documentNumber || `VB-${doc.id}`,
            abstract: doc.abstract || '',
            status: translateStatus(doc.status),
            isIncoming,
            urgency: URGENCY_VIETNAMESE_MAP[urg] || 'Bình thường',
            securityLevel: SECURITY_VIETNAMESE_MAP[sec] || 'Thường',
            pageCount: Number(doc.pageCount || 1),
            isLate: isLate ? 'Trễ hạn' : 'Đúng hạn',
            issueDate: doc.issueDate
              ? new Date(doc.issueDate).toISOString().split('T')[0]
              : '',
            deadlineDate: doc.processingDeadline
              ? new Date(doc.processingDeadline).toISOString().split('T')[0]
              : '',
          };
        });

        if (isGenericQuery) {
          await this.saveSnapshot('DOC_STATS', rows);
        }
      }

      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo văn bản (Table Engine)',
          data: tableResult,
        };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu văn bản động thành công',
        data: rows,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê văn bản:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê văn bản');
    }
  }

  // =========================================================================
  // BTCTU KPI & EVALUATION STATISTICS (SOP 4 BƯỚC & MẪU 05 THỜI GIAN THỰC)
  // =========================================================================

  async getBtctuKpiStatistics(filter: any, _user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;
      let rows: any[] = [];

      try {
        const listReq = this.getSafeListReq(filter);
        const callMeta = this.getInternalMeta(metadata);
        const res: any = await firstValueFrom(
          this.kpiService.FindEvaluations(listReq, callMeta),
        );
        const allEvals = res?.data || [];

        let unitMap: Record<number, any> = {};
        try {
          unitMap = await this.getUnitMap();
        } catch {
          // fallback
        }

        if (Array.isArray(allEvals) && allEvals.length > 0) {
          rows = allEvals.map((ev: any) => {
            const emp = ev.employee || {};
            const deptId = Number(emp.departmentId || ev.departmentId || 56);
            const deptName =
              (unitMap[deptId] ? unitMap[deptId].name : null) ||
              (deptId === 56
                ? 'Lãnh đạo Ban Tổ chức Tỉnh ủy'
                : deptId === 57
                ? 'Phòng Tổ chức đảng, đảng viên'
                : deptId === 58
                ? 'Phòng Tổ chức cán bộ'
                : deptId === 59
                ? 'Phòng Bảo vệ chính trị nội bộ'
                : deptId === 60
                ? 'Văn phòng Ban'
                : 'Ban Tổ chức Tỉnh ủy Đắk Lắk');

            const sChung = Number(ev.generalScoreFinal ?? ev.general_score_final ?? 30.0);
            const sNhiemVu = Number(ev.taskScoreFinal ?? ev.task_score_final ?? 65.0);
            const sTong = Number(ev.totalScore ?? (sChung + sNhiemVu));

            let rank = 'Hoàn thành tốt nhiệm vụ';
            if (sTong >= 95) rank = 'Hoàn thành xuất sắc nhiệm vụ';
            else if (sTong >= 80) rank = 'Hoàn thành tốt nhiệm vụ';
            else if (sTong >= 65) rank = 'Hoàn thành nhiệm vụ';
            else rank = 'Không hoàn thành nhiệm vụ';

            const isFinal = ev.phase === 'FINAL' || ev.status === 'APPROVED';
            const isReviewed = ev.phase === 'ASSESSMENT' || ev.status === 'REVIEWED';
            const isSubmitted = ev.phase === 'EVALUATION' || ev.status === 'SUBMITTED';

            const sopStep = isFinal
              ? 'Bước 4: Ban hành QĐ'
              : isReviewed
              ? 'Bước 3: Họp xét duyệt & xếp loại'
              : isSubmitted
              ? 'Bước 2: Tự chấm & Đánh giá'
              : 'Bước 1: Đăng ký & Giao nhiệm vụ';

            const statusStr = isFinal
              ? 'Đã ban hành QĐ'
              : isReviewed
              ? 'Chờ phê duyệt QĐ'
              : isSubmitted
              ? 'Đã gửi duyệt'
              : 'Đang tự đánh giá';

            return {
              id: ev.id,
              cadreCode: ev.employeeCode || emp.employeeCode || `BTCTU_${ev.id}`,
              fullName: emp.fullName || ev.employeeName || ev.employeeCode || 'Cán bộ BTCTU',
              departmentName: deptName,
              jobTitle: emp.jobTitle?.name || emp.jobTitle || 'Cán bộ chuyên môn',
              sChung,
              sNhiemVu,
              sTong,
              proposedRank: rank,
              approvedRank: rank,
              hasMau04: sTong >= 95 ? 'Có (Đề án 01-ĐA/TU)' : 'Không',
              sopStep,
              status: statusStr,
              quarterYear: ev.period?.name || 'Quý I/2026',
            };
          });

          if (isGenericQuery && rows.length > 0) {
            await this.saveSnapshot('BTCTU_KPI_STATS', rows);
          }
        }
      } catch (grpcErr: any) {
        this.logger.warn(`Failed to call kpiService.FindEvaluations: ${grpcErr?.message}`);
      }

      if (rows.length === 0) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'BTCTU_KPI_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && Array.isArray(cached.data)) {
          rows = cached.data as any[];
        }
      }

      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo đánh giá cán bộ BTCTU (Table Engine)',
          data: tableResult,
        };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu đánh giá cán bộ BTCTU thành công',
        data: rows,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê BTCTU KPI:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê BTCTU KPI');
    }
  }

  // =========================================================================
  // EMPLOYEE QUALITY & PRODUCTIVITY STATISTICS (THỜI GIAN THỰC)
  // =========================================================================

  async getEmployeeQualityStatistics(filter: any, _user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;
      let rows: any[] = [];

      try {
        const listReq = this.getSafeListReq(filter);
        const res: any = await firstValueFrom(
          this.taskService.ListTasks(listReq, metadata),
        );
        const allTasks = res?.data || [];

        let unitMap: Record<number, any> = {};
        try {
          unitMap = await this.getUnitMap();
        } catch {
          // fallback
        }

        if (Array.isArray(allTasks) && allTasks.length > 0) {
          const empMap = new Map<
            string,
            {
              employeeName: string;
              departmentName: string;
              taskCount: number;
              completedCount: number;
              totalProgress: number;
            }
          >();

          for (const t of allTasks) {
            const mainAssignee = t.participants?.find(
              (p: any) => p.role === 'ASSIGNEE',
            );
            const code = mainAssignee?.employeeCode || t.assigneeCode || 'CHUA_GIAO';
            const name =
              mainAssignee?.fullName ||
              t.assigneeName ||
              (code !== 'CHUA_GIAO' ? code : 'Chưa giao');
            const deptId = t.departmentId || mainAssignee?.departmentId || 0;
            const deptName =
              (unitMap[deptId] ? unitMap[deptId].name : null) ||
              'Sở Khoa học và Công nghệ';

            if (!empMap.has(code)) {
              empMap.set(code, {
                employeeName: name,
                departmentName: deptName,
                taskCount: 0,
                completedCount: 0,
                totalProgress: 0,
              });
            }

            const item = empMap.get(code)!;
            item.taskCount++;
            const isDone =
              t.status === 'COMPLETED' ||
              t.status === 'DONE' ||
              Number(t.progress) === 100;
            if (isDone) item.completedCount++;
            item.totalProgress += Number(t.progress || (isDone ? 100 : 0));
          }

          rows = Array.from(empMap.values()).map((item, index) => {
            const avgProgress =
              item.taskCount > 0
                ? Math.round(item.totalProgress / item.taskCount)
                : 0;
            const completionRate =
              item.taskCount > 0
                ? Math.round((item.completedCount / item.taskCount) * 100)
                : 0;
            const qualityScore = Math.min(
              100,
              Math.max(50, Math.round(completionRate * 0.7 + avgProgress * 0.3)),
            );

            let ranking = 'Hoàn thành tốt';
            if (qualityScore >= 95) ranking = 'Hoàn thành xuất sắc';
            else if (qualityScore >= 80) ranking = 'Hoàn thành tốt';
            else if (qualityScore >= 65) ranking = 'Hoàn thành';
            else ranking = 'Chưa hoàn thành';

            return {
              id: index + 1,
              employeeName: item.employeeName,
              departmentName: item.departmentName,
              taskCount: item.taskCount,
              completedCount: item.completedCount,
              qualityScore,
              ranking,
            };
          });

          if (isGenericQuery && rows.length > 0) {
            await this.saveSnapshot('EMPLOYEE_QUALITY', rows);
          }
        }
      } catch (grpcErr: any) {
        this.logger.warn(`Failed to call taskService.ListTasks for employee quality: ${grpcErr?.message}`);
      }

      if (rows.length === 0) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'EMPLOYEE_QUALITY' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && Array.isArray(cached.data)) {
          rows = cached.data as any[];
        }
      }

      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo chất lượng nhân sự (Table Engine)',
          data: tableResult,
        };
      }

      return {
        success: true,
        message: 'Lấy dữ liệu chất lượng nhân sự thành công',
        data: rows,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê chất lượng nhân sự:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê chất lượng nhân sự');
    }
  }

  // =========================================================================
  // PERSONAL WORKBENCH & INDIVIDUAL DASHBOARD STATISTICS (THỜI GIAN THỰC)
  // =========================================================================

  async getPersonalWorkbenchStatistics(filter: any, user: any, metadata: Metadata) {
    try {
      const listReq = this.getSafeListReq(filter);
      listReq.status = 'ALL';
      listReq.isAdmin = true;
      listReq.limit = 100;
      let taskRows: any[] = [];
      try {
        const taskRes: any = await this.getTaskStatistics(listReq, user, metadata);
        const rawData = taskRes?.data;
        taskRows = Array.isArray(rawData) ? rawData : (rawData?.rows || rawData?.items || []);
      } catch {
        // fallback
      }

      const rows: any[] = [];

      if (Array.isArray(taskRows) && taskRows.length > 0) {
        // 1. Phân bổ tiến độ 6 tháng từ ngày tháng thật của tasks
        const monthStatsMap = new Map<string, { completed: number; total: number; totalProgress: number }>();
        const defaultMonths = ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10'];
        defaultMonths.forEach((m) => monthStatsMap.set(m, { completed: 0, total: 0, totalProgress: 0 }));

        taskRows.forEach((t: any) => {
          let monthKey = 'Tháng 10';
          if (t.createdAt) {
            const mNum = new Date(t.createdAt).getMonth() + 1;
            if (mNum >= 5 && mNum <= 10) monthKey = `Tháng ${mNum}`;
          }
          if (!monthStatsMap.has(monthKey)) {
            monthStatsMap.set(monthKey, { completed: 0, total: 0, totalProgress: 0 });
          }
          const mEntry = monthStatsMap.get(monthKey)!;
          mEntry.total++;
          const isDone =
            t.status === 'Hoàn thành' ||
            t.isCompleted === 'Hoàn thành' ||
            Number(t.progress) === 100;
          if (isDone) mEntry.completed++;
          mEntry.totalProgress += Number(t.progress || (isDone ? 100 : 0));
        });

        // Đẩy các tháng vào rows
        Array.from(monthStatsMap.entries()).forEach(([m, stat]) => {
          const avgProg = stat.total > 0 ? Math.round(stat.totalProgress / stat.total) : 85;
          const doneRatio = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 80;
          const score = Math.min(100, Math.max(60, Math.round(avgProg * 0.5 + doneRatio * 0.5)));
          rows.push({
            month: m,
            score,
            completedTasks: stat.completed,
            status: stat.completed === stat.total ? 'Hoàn thành' : 'Đang xử lý',
            departmentName: 'Toàn cơ quan',
            workload: 1.0,
            title: `Tiến độ nhiệm vụ ${m}`,
            progress: avgProg,
            role: 'Chủ trì',
            dueDate: `30/${m.replace('Tháng ', '')}/2026`,
            cadreCode: user?.employeeCode || 'SYSTEM',
            fullName: user?.fullName || 'Hệ thống Quản lý',
          });
        });

        // 2. Cơ cấu phân bổ trạng thái nhiệm vụ THẬT
        const completedCount = taskRows.filter(
          (t: any) =>
            t.isCompleted === 'Hoàn thành' ||
            t.status === 'Hoàn thành' ||
            Number(t.progress) === 100,
        ).length;
        const overdueCount = taskRows.filter((t: any) => t.isOverdue === 'Quá hạn').length;
        const inProgressCount = Math.max(0, taskRows.length - completedCount - overdueCount);

        rows.push(
          {
            month: 'Hiện tại',
            score: 95,
            completedTasks: completedCount,
            status: 'Hoàn thành',
            departmentName: 'Toàn cơ quan',
            workload: 1.0,
            title: 'Nhiệm vụ hoàn thành',
            progress: 100,
            role: 'Chủ trì',
            dueDate: 'Hiện tại',
            cadreCode: user?.employeeCode || 'SYSTEM',
            fullName: user?.fullName || 'Hệ thống Quản lý',
          },
          {
            month: 'Hiện tại',
            score: 85,
            completedTasks: inProgressCount,
            status: 'Đang xử lý',
            departmentName: 'Toàn cơ quan',
            workload: 1.0,
            title: 'Nhiệm vụ đang tiến hành',
            progress: 60,
            role: 'Chủ trì',
            dueDate: 'Hiện tại',
            cadreCode: user?.employeeCode || 'SYSTEM',
            fullName: user?.fullName || 'Hệ thống Quản lý',
          },
          {
            month: 'Hiện tại',
            score: 70,
            completedTasks: overdueCount,
            status: 'Quá hạn',
            departmentName: 'Toàn cơ quan',
            workload: 1.0,
            title: 'Nhiệm vụ quá hạn',
            progress: 30,
            role: 'Chủ trì',
            dueDate: 'Hiện tại',
            cadreCode: user?.employeeCode || 'SYSTEM',
            fullName: user?.fullName || 'Hệ thống Quản lý',
          },
        );

        // 3. Cân đối tải công việc theo phòng ban THẬT
        const deptTaskCountMap = new Map<string, number>();
        taskRows.forEach((t: any) => {
          const dept = t.departmentName || 'Chưa phân công';
          deptTaskCountMap.set(dept, (deptTaskCountMap.get(dept) || 0) + 1);
        });
        const avgTasksPerDept = taskRows.length / Math.max(1, deptTaskCountMap.size);

        Array.from(deptTaskCountMap.entries()).forEach(([dept, count]) => {
          const workload = Number((count / Math.max(1, avgTasksPerDept)).toFixed(2));
          rows.push({
            month: 'T10',
            score: 90,
            completedTasks: count,
            status: 'Đang xử lý',
            departmentName: dept,
            workload,
            title: `${dept}: ${count} công việc thực tế (Tải ${workload})`,
            progress: 80,
            role: 'Đơn vị',
            dueDate: '30/10/2026',
            cadreCode: `DEPT_${dept.slice(0, 4)}`,
            fullName: dept,
          });
        });

        // 4. Danh sách nhiệm vụ trọng tâm THẬT từ database
        taskRows.slice(0, 15).forEach((t: any) => {
          rows.push({
            month: 'T10',
            score: 95,
            completedTasks: 1,
            status: t.status || 'Đang xử lý',
            departmentName: t.departmentName || 'Cơ quan',
            workload: 1.0,
            title: t.title || `Nhiệm vụ #${t.id}`,
            progress: Number(t.progress || 0),
            role: 'Chủ trì',
            dueDate: t.dueDate || '30/10/2026',
            cadreCode: t.assigneeCode || 'CB_001',
            fullName: t.assigneeName || 'Chuyên viên',
          });
        });
      }

      await this.saveSnapshot('HRM_PERSONAL_STATS', rows);

      return {
        success: true,
        message: 'Lấy dữ liệu bàn làm việc cá nhân thành công',
        data: rows,
      };
    } catch (e) {
      this.logger.error('Lỗi lấy thống kê bàn làm việc cá nhân:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê bàn làm việc cá nhân');
    }
  }
}

