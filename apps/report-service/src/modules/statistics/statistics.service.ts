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
        skip: 10,
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
        status: data.status || 'PENDING_ACCEPTANCE',
        priority: data.priority || 'MEDIUM',
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
            status: data.status || r.status,
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
          return { ...r, status: 'PUBLISHED' };
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
      rows.unshift({
        id: data.id,
        documentNumber: data.documentNumber || `VB-${data.id}`,
        abstract: data.abstract || '',
        status: data.status || 'PROCESSING',
        isIncoming: data.isIncoming ? 'Văn bản đến' : 'Văn bản đi',
        urgency: data.urgency || 'NORMAL',
        securityLevel: data.securityLevel || 'NORMAL',
        pageCount: Number(data.pageCount || 1),
        isLate: 'Đúng hạn',
        issueDate: new Date().toISOString().split('T')[0],
        deadlineDate: data.processingDeadline ? String(data.processingDeadline).split('T')[0] : '',
      });
      await this.saveSnapshot('DOC_STATS', rows);
    }
  }

  // =========================================================================
  // DYNAMIC DATASET QUERY METHODS (FLAT ROWS FOR CHARTS & TABLE ENGINE)
  // =========================================================================

  async getTaskStatistics(filter: any, _user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;

      // 1. Check CQRS Read-Model Snapshot
      let rows: any[] | null = null;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'HRM_TASK_STATS' },
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

      // 2. Fetch via gRPC if no cached flat dataset
      if (!rows) {
        const listReq = { ...filter, page: 1, limit: 10000 };
        delete listReq.config;
        delete listReq.format;

        const res: any = await firstValueFrom(
          this.taskService.ListTasks(listReq, metadata),
        );
        const allTasks = res?.data || [];
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
          const deptId = t.departmentId || t.plan?.departmentId || 0;
          const deptName =
            (unitMap[deptId] ? unitMap[deptId].name : null) || 'Chưa phân công';
          const mainAssignee = t.participants?.find(
            (p: any) => p.role === 'ASSIGNEE',
          );
          const assigneeCode =
            mainAssignee?.employeeCode || t.assigneeCode || 'Chưa giao';
          const assigneeName =
            mainAssignee?.fullName || t.assigneeName || assigneeCode;

          return {
            id: t.id,
            title: t.title || `Nhiệm vụ #${t.id}`,
            status: t.status,
            priority: t.priority || 'MEDIUM',
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

      // 3. Xử lý qua TableEngine nếu có TableConfig
      if (filter?.config && filter.config.version === 1) {
        const tableResult = executeTable({ items: rows }, filter.config);
        return {
          success: true,
          message: 'Báo cáo nhiệm vụ (Table Engine)',
          data: tableResult,
        };
      }

      // 4. Trả về mảng bản ghi phẳng (Flat Dataset) cho ChartRenderer / Dynamic Builder
      return {
        success: true,
        message: 'Lấy dữ liệu nhiệm vụ động thành công',
        data: rows,
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
        const listReq = { ...filter, page: 1, limit: 10000 };
        delete listReq.config;
        delete listReq.format;

        const res: any = await firstValueFrom(
          this.postService.ListPosts(listReq, metadata),
        );
        const allPosts = res?.data || [];

        rows = allPosts.map((p: any) => ({
          id: p.id,
          title: p.title || '',
          status: p.status,
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
        const listReq = { ...filter, page: 1, limit: 10000 };
        delete listReq.config;
        delete listReq.format;

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
            status: ev.status || 'SUBMITTED',
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
        const listReq = { ...filter, page: 1, limit: 10000 };
        delete listReq.config;
        delete listReq.format;

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

          return {
            id: doc.id,
            documentNumber: doc.documentNumber || `VB-${doc.id}`,
            abstract: doc.abstract || '',
            status: doc.status,
            isIncoming,
            urgency: doc.urgency || 'NORMAL',
            securityLevel: doc.securityLevel || 'NORMAL',
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
}
