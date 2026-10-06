const fs = require('fs');

const servicePath = 'C:/Users/Admin/Desktop/daklak-workspace/apps/report-service/src/modules/statistics/statistics.service.ts';

const newServiceContent = `import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class StatisticsService implements OnModuleInit {
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
      console.error('getUnitMap failed:', error);
      return {};
    }
  }

  async getTaskStatistics(filter: any, user: any, metadata: Metadata) {
    try {
      // Use gRPC to fetch all tasks matching the filter
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
        
        // Populate maps using participants array
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

      return {
        success: true,
        message: 'Lấy thống kê thành công',
        data: { overdue, warning, inTime, doneInTime, doneOverdue, totalTasks, completedTasks, inProgressTasks, overdueTasks, individualStats, departmentStats }
      };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Lỗi lấy thống kê nhiệm vụ');
    }
  }

  async getPostStatistics(filter: any, metadata: Metadata) {
    try {
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
      return { success: true, message: 'Lấy thống kê bài viết thành công', data: { total, published, draft, pending, reviewing, rejected, totalViews, byStatus: [{ status: 'PUBLISHED', count: published }, { status: 'DRAFT', count: draft }, { status: 'PENDING', count: pending }, { status: 'REVIEWING', count: reviewing }, { status: 'REJECTED', count: rejected }] } };
    } catch(e) {
      console.error(e);
      throw new InternalServerErrorException('Lỗi lấy thống kê bài viết');
    }
  }

  async getKpiStatistics(filter: any, user: any, metadata: Metadata) {
    try {
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
           avgScore: st.count > 0 ? st.totalScore / st.count : 0
        };
      });

      return { success: true, message: 'Lấy thống kê KPI thành công', data: { totalEvaluations: allEvals.length, companyAvgScore, statsByUnit } };
    } catch(e) {
      throw new InternalServerErrorException('Lỗi lấy thống kê KPI');
    }
  }

  async getDocumentStatistics(filter: any, metadata: Metadata) {
    try {
      const res: any = await firstValueFrom(this.documentService.ListDocuments({ page: 1, limit: 100000, ...filter }, metadata));
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

      return {
        success: true,
        message: 'Lấy thống kê văn bản thành công',
        data: { incomingTotal, incomingPending, incomingLate, outgoingTotal, urgentTotal }
      };
    } catch(e) {
      throw new InternalServerErrorException('Lỗi lấy thống kê văn bản');
    }
  }

  async recordTaskCompleted(data: any) {
    await this.prisma.statisticsSnapshot.create({
      data: {
        dataSourceCode: 'HRM_TASK_STATS',
        data: data,
      },
    });
  }
}
`;

fs.writeFileSync(servicePath, newServiceContent);
console.log("Rewrote statistics.service.ts using standard ORM via gRPC");
