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
      // Giữ tối đa 10 snapshots mới nhất để tránh phình bảng
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
    if (latest && latest.data) {
      const snapshotData = { ...(latest.data as any) };
      snapshotData.totalTasks = (snapshotData.totalTasks || 0) + 1;
      snapshotData.inTime = (snapshotData.inTime || 0) + 1;
      await this.saveSnapshot('HRM_TASK_STATS', snapshotData);
    }
  }

  async handleTaskStateChanged(data: any) {
    this.logger.log(`[CQRS Event] task.state_changed received: ${data.status}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'HRM_TASK_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && latest.data) {
      const snapshotData = { ...(latest.data as any) };
      const isCompleted = data.status === 'COMPLETED' || data.status === 'DONE';
      if (isCompleted) {
        snapshotData.completedTasks = (snapshotData.completedTasks || 0) + 1;
        if (snapshotData.inProgressTasks > 0) snapshotData.inProgressTasks -= 1;
        if (data.dueDate) {
          const due = new Date(data.dueDate).getTime();
          const completedAt = data.completedAt ? new Date(data.completedAt).getTime() : Date.now();
          if (completedAt > due) {
            snapshotData.doneOverdue = (snapshotData.doneOverdue || 0) + 1;
          } else {
            snapshotData.doneInTime = (snapshotData.doneInTime || 0) + 1;
          }
        } else {
          snapshotData.doneInTime = (snapshotData.doneInTime || 0) + 1;
        }
      }
      await this.saveSnapshot('HRM_TASK_STATS', snapshotData);
    }
  }

  async handlePostPublished(data: any) {
    this.logger.log(`[CQRS Event] post.published received for post ${data.id}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'POST_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && latest.data) {
      const snapshotData = { ...(latest.data as any) };
      snapshotData.total = (snapshotData.total || 0) + 1;
      snapshotData.published = (snapshotData.published || 0) + 1;
      await this.saveSnapshot('POST_STATS', snapshotData);
    }
  }

  async handleDocumentCreated(data: any) {
    this.logger.log(`[CQRS Event] document.created received for document ${data.id}`);
    const latest = await this.prisma.statisticsSnapshot.findFirst({
      where: { dataSourceCode: 'DOC_STATS' },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest && latest.data) {
      const snapshotData = { ...(latest.data as any) };
      if (data.isIncoming) {
        snapshotData.incomingTotal = (snapshotData.incomingTotal || 0) + 1;
        snapshotData.incomingPending = (snapshotData.incomingPending || 0) + 1;
      } else {
        snapshotData.outgoingTotal = (snapshotData.outgoingTotal || 0) + 1;
      }
      await this.saveSnapshot('DOC_STATS', snapshotData);
    }
  }

  // =========================================================================
  // QUERY / READ METHODS (CQRS READ-MODEL FIRST -> FALLBACK VIA gRPC)
  // =========================================================================

  async getTaskStatistics(filter: any, user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;

      // 1. Kiểm tra CQRS Read-Model Snapshot (O(1) complexity, không gọi gRPC)
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'HRM_TASK_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && cached.data) {
          // Nếu snapshot chưa quá 10 phút, trả về ngay lập tức
          const ageMinutes = (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            return {
              success: true,
              message: 'Lấy thống kê thành công (từ CQRS Read-Model)',
              data: cached.data as any,
            };
          }
        }
      }

      // 2. Fallback / Cold start / Specific Filter: Lấy và tổng hợp dữ liệu
      const listReq = { ...filter, page: 1, limit: 100000 };
      const res: any = await firstValueFrom(this.taskService.ListTasks(listReq, metadata));
      const allTasks = res?.data || [];

      const nowTime = new Date().setHours(0, 0, 0, 0);

      let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;
      let totalTasks = 0, completedTasks = 0, inProgressTasks = 0, overdueTasks = 0;

      const individualMap: Record<string, any> = {};
      const departmentMap: Record<string, any> = {};

      for (const row of allTasks) {
        totalTasks++;

        const taskDueTime = row.dueDate ? new Date(row.dueDate).setHours(0,0,0,0) : null;
        const isDone = row.status === 'COMPLETED' || row.status === 'DONE';

        if (isDone) completedTasks++;
        else if (row.status === 'IN_PROGRESS' || row.status === 'ASSIGNED') inProgressTasks++;

        if (!isDone && taskDueTime && nowTime > taskDueTime) overdueTasks++;

        if (isDone) {
          const completedTime = row.createdAt ? new Date(row.createdAt).setHours(0,0,0,0) : nowTime;
          if (taskDueTime && completedTime > taskDueTime) doneOverdue++;
          else doneInTime++;
        } else {
          if (!taskDueTime) { inTime++; }
          else {
            const diff = Math.round((taskDueTime - nowTime) / 86400000);
            if (diff < 0) overdue++;
            else if (diff <= 3) warning++;
            else inTime++;
          }
        }

        if (row.participants && row.participants.length > 0) {
          for (const p of row.participants) {
            if (p.role === 'ASSIGNEE') {
              const empCode = p.employeeCode || 'Chưa phân công';
              const deptId = p.departmentId || 'unknown';

              if (!individualMap[empCode]) individualMap[empCode] = { name: empCode, completed: 0, inTime: 0, completedOverdue: 0, overdue: 0, total: 0 };
              if (!departmentMap[deptId]) departmentMap[deptId] = { name: deptId, completed: 0, inTime: 0, completedOverdue: 0, overdue: 0, total: 0 };

              individualMap[empCode].total++;
              departmentMap[deptId].total++;

              if (isDone) {
                const completedTime = row.createdAt ? new Date(row.createdAt).setHours(0,0,0,0) : nowTime;
                if (taskDueTime && completedTime > taskDueTime) {
                  individualMap[empCode].completedOverdue++;
                  departmentMap[deptId].completedOverdue++;
                } else {
                  individualMap[empCode].completed++;
                  departmentMap[deptId].completed++;
                }
              } else {
                if (taskDueTime && nowTime > taskDueTime) {
                  individualMap[empCode].overdue++;
                  departmentMap[deptId].overdue++;
                } else {
                  individualMap[empCode].inTime++;
                  departmentMap[deptId].inTime++;
                }
              }
            }
          }
        }
      }

      const individualStats = Object.values(individualMap).sort((a: any, b: any) => b.total - a.total).slice(0, 10);
      const deptStatsRaw = Object.values(departmentMap).sort((a: any, b: any) => b.total - a.total).slice(0, 10);

      let unitMap: Record<number, any> = {};
      try { unitMap = await this.getUnitMap(); } catch (e) {}

      const departmentStats = deptStatsRaw.map((s: any) => {
        const dId = parseInt(s.name, 10);
        return { ...s, name: (!isNaN(dId) && unitMap[dId]) ? unitMap[dId].name : 'Chưa phân công bộ phận' };
      });

      const responseData = {
        overdue,
        warning,
        inTime,
        doneInTime,
        doneOverdue,
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        individualStats,
        departmentStats,
      };

      // 3. Cập nhật CQRS Snapshot cho các lần gọi sau
      if (isGenericQuery) {
        await this.saveSnapshot('HRM_TASK_STATS', responseData);
      }

      return {
        success: true,
        message: 'Lấy thống kê thành công',
        data: responseData,
      };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Lỗi lấy thống kê nhiệm vụ');
    }
  }

  async getPostStatistics(filter: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'POST_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && cached.data) {
          const ageMinutes = (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            return { success: true, message: 'Lấy thống kê bài viết thành công (từ CQRS Read-Model)', data: cached.data as any };
          }
        }
      }

      const listReq = { ...filter, page: 1, limit: 100000 };
      const res: any = await firstValueFrom(this.postService.ListPosts(listReq, metadata));
      const allPosts = res?.data || [];

      let total = 0, published = 0, draft = 0, pending = 0, reviewing = 0, rejected = 0, totalViews = 0;

      for (const row of allPosts) {
        total++;
        totalViews += Number(row.viewCount || 0);
        if (row.status === 'PUBLISHED') published++;
        else if (row.status === 'DRAFT') draft++;
        else if (row.status === 'PENDING') pending++;
        else if (row.status === 'REVIEWING') reviewing++;
        else if (row.status === 'REJECTED') rejected++;
      }
      const responseData = {
        total,
        published,
        draft,
        pending,
        reviewing,
        rejected,
        totalViews,
        byStatus: [
          { status: 'PUBLISHED', count: published },
          { status: 'DRAFT', count: draft },
          { status: 'PENDING', count: pending },
          { status: 'REVIEWING', count: reviewing },
          { status: 'REJECTED', count: rejected },
        ],
      };

      if (isGenericQuery) {
        await this.saveSnapshot('POST_STATS', responseData);
      }

      return { success: true, message: 'Lấy thống kê bài viết thành công', data: responseData };
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Lỗi lấy thống kê bài viết');
    }
  }

  async getKpiStatistics(filter: any, user: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'KPI_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && cached.data) {
          const ageMinutes = (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            return { success: true, message: 'Lấy thống kê KPI thành công (từ CQRS Read-Model)', data: cached.data as any };
          }
        }
      }

      const listReq = { ...filter, page: 1, limit: 100000 };
      const res: any = await firstValueFrom(this.kpiService.FindEvaluations(listReq, metadata));
      const allEvals = res?.data || [];

      let totalScore = 0;
      const unitStats = new Map();

      for (const row of allEvals) {
        const score = Number(row.totalScore || 0);
        const deptId = row.employee?.departmentId || 0;

        totalScore += score;

        if (!unitStats.has(deptId)) unitStats.set(deptId, { count: 0, totalScore: 0 });
        const st = unitStats.get(deptId);
        st.count++;
        st.totalScore += score;
      }

      const companyAvgScore = allEvals.length > 0 ? totalScore / allEvals.length : 0;
      let unitMap: Record<number, any> = {};
      try { unitMap = await this.getUnitMap(); } catch (e) {}

      const statsByUnit = Array.from(unitStats.entries()).map(([deptId, st]) => {
        return {
          departmentId: deptId,
          departmentName: unitMap[deptId] ? unitMap[deptId].name : 'Chưa xác định',
          count: st.count,
          avgScore: st.count > 0 ? st.totalScore / st.count : 0,
        };
      });

      const responseData = { totalEvaluations: allEvals.length, companyAvgScore, statsByUnit };

      if (isGenericQuery) {
        await this.saveSnapshot('KPI_STATS', responseData);
      }

      return { success: true, message: 'Lấy thống kê KPI thành công', data: responseData };
    } catch (e) {
      throw new InternalServerErrorException('Lỗi lấy thống kê KPI');
    }
  }

  async getDocumentStatistics(filter: any, metadata: Metadata) {
    try {
      const isGenericQuery = !filter || Object.keys(filter).length === 0;
      if (isGenericQuery) {
        const cached = await this.prisma.statisticsSnapshot.findFirst({
          where: { dataSourceCode: 'DOC_STATS' },
          orderBy: { recordedAt: 'desc' },
        });
        if (cached && cached.data) {
          const ageMinutes = (Date.now() - new Date(cached.recordedAt).getTime()) / 60000;
          if (ageMinutes < 10) {
            return {
              success: true,
              message: 'Lấy thống kê văn bản thành công (từ CQRS Read-Model)',
              data: cached.data as any,
            };
          }
        }
      }

      const res: any = await firstValueFrom(
        this.documentService.ListDocuments({ page: 1, limit: 100000, ...filter }, metadata),
      );
      const allDocs = res?.data || [];

      let incomingTotal = 0, incomingPending = 0, incomingLate = 0, outgoingTotal = 0, urgentTotal = 0;
      const now = new Date().getTime();

      for (const doc of allDocs) {
        if (doc.isIncoming) {
          incomingTotal++;
          if (doc.status === 'PROCESSING') {
            incomingPending++;
            if (doc.processingDeadline) {
              const deadline = new Date(doc.processingDeadline).getTime();
              if (deadline < now) incomingLate++;
            }
          }
        } else {
          outgoingTotal++;
        }

        if (doc.status === 'PROCESSING' && (doc.urgency === 'URGENT' || doc.urgency === 'FLASH')) {
          urgentTotal++;
        }
      }

      const responseData = { incomingTotal, incomingPending, incomingLate, outgoingTotal, urgentTotal };

      if (isGenericQuery) {
        await this.saveSnapshot('DOC_STATS', responseData);
      }

      return {
        success: true,
        message: 'Lấy thống kê văn bản thành công',
        data: responseData,
      };
    } catch (e) {
      throw new InternalServerErrorException('Lỗi lấy thống kê văn bản');
    }
  }
}
