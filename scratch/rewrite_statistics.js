const fs = require('fs');
const path = require('path');

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

@Injectable()
export class StatisticsService implements OnModuleInit {
  private orgService: any;

  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_SERVICE') private readonly orgClient: any,
  ) {}

  onModuleInit() {
    this.orgService = this.orgClient.getService('OrganizationService');
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
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    let assigneeCondition = '';
    let assignerCondition = '';
    
    let finalAssigneeCode = filter.assigneeCode;
    let finalAssignerCode = filter.assignerCode;

    if (filter.role === 'ASSIGNEE' && user) finalAssigneeCode = user.employeeCode;
    else if (filter.role === 'OWNER' && user) finalAssignerCode = user.employeeCode;

    let conditions = [\`t.isDeleted = 0\`];
    
    if (finalAssigneeCode && finalAssigneeCode !== 'UNASSIGNED') {
       conditions.push(\`p.employeeCode = '\${finalAssigneeCode}' AND p.participantRole = 'ASSIGNEE'\`);
    } else if (finalAssigneeCode === 'UNASSIGNED') {
       conditions.push(\`NOT EXISTS (SELECT 1 FROM admin_hrm.task_participant p2 WHERE p2.taskId = t.id AND p2.participantRole = 'ASSIGNEE')\`);
    }
    
    if (finalAssignerCode) {
       conditions.push(\`p.employeeCode = '\${finalAssignerCode}' AND p.participantRole = 'OWNER'\`);
    }

    if (filter.departmentId && filter.departmentId !== 'undefined') {
       conditions.push(\`e.departmentId = \${parseInt(filter.departmentId, 10)}\`);
    }

    const whereClause = conditions.join(' AND ');

    try {
      const rows: any[] = await this.prisma.$queryRawUnsafe(\`
        SELECT t.id, t.status, t.isCompleted, t.dueDate, t.completedAt, t.updatedAt, 
               p.participantRole, p.employeeCode, e.departmentId
        FROM admin_hrm.task t
        LEFT JOIN admin_hrm.task_participant p ON t.id = p.taskId AND p.participantRole IN ('ASSIGNEE', 'OWNER')
        LEFT JOIN admin_hrm.employee e ON p.employeeCode = e.employeeCode
        WHERE \${whereClause}
      \`);

      const nowTime = new Date().setHours(0, 0, 0, 0);
      
      let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;
      let totalTasks = 0, completedTasks = 0, inProgressTasks = 0, overdueTasks = 0;
      
      const taskMap = new Map();
      const individualMap = {};
      const departmentMap = {};

      for (const row of rows) {
        if (!taskMap.has(row.id)) {
           taskMap.set(row.id, true);
           totalTasks++;
           
           const taskDueTime = row.dueDate ? new Date(row.dueDate).setHours(0,0,0,0) : null;
           const isDone = row.isCompleted || row.status === 'COMPLETED' || row.status === 'DONE';
           
           if (isDone) completedTasks++;
           else if (row.status === 'IN_PROGRESS' || row.status === 'ASSIGNED') inProgressTasks++;
           
           if (!isDone && taskDueTime && nowTime > taskDueTime) overdueTasks++;
           
           if (isDone) {
             const completedTime = row.completedAt ? new Date(row.completedAt).setHours(0,0,0,0) : (row.updatedAt ? new Date(row.updatedAt).setHours(0,0,0,0) : nowTime);
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
        }
        
        // Populate maps
        if (row.participantRole && row.employeeCode) {
           const empCode = row.employeeCode;
           const deptId = row.departmentId || 'unknown';
           
           if (!individualMap[empCode]) individualMap[empCode] = { name: empCode, completed: 0, inTime: 0, completedOverdue: 0, overdue: 0, total: 0 };
           if (!departmentMap[deptId]) departmentMap[deptId] = { name: deptId, completed: 0, inTime: 0, completedOverdue: 0, overdue: 0, total: 0 };
           
           const isDone = row.isCompleted || row.status === 'COMPLETED' || row.status === 'DONE';
           const taskDueTime = row.dueDate ? new Date(row.dueDate).setHours(0,0,0,0) : null;
           
           individualMap[empCode].total++;
           departmentMap[deptId].total++;
           
           if (isDone) {
             const completedTime = row.completedAt ? new Date(row.completedAt).setHours(0,0,0,0) : (row.updatedAt ? new Date(row.updatedAt).setHours(0,0,0,0) : nowTime);
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
             }
           }
        }
      }

      const individualStats = Object.values(individualMap).sort((a: any, b: any) => b.total - a.total).slice(0, 10);
      const deptStatsRaw = Object.values(departmentMap).sort((a: any, b: any) => b.total - a.total).slice(0, 10);
      
      let unitMap = {};
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
      let cond = \`isDeleted = 0\`;
      if (filter.categoryId) cond += \` AND categoryId = '\${filter.categoryId}'\`;
      if (filter.authorId) cond += \` AND authorId = '\${filter.authorId}'\`;

      const rows: any[] = await this.prisma.$queryRawUnsafe(\`
        SELECT status, COUNT(*) as c, SUM(viewCount) as s 
        FROM admin_posts.post 
        WHERE \${cond} 
        GROUP BY status
      \`);

      let total = 0, published = 0, draft = 0, pending = 0, reviewing = 0, rejected = 0, totalViews = 0;
      for (const row of rows) {
        const count = Number(row.c);
        total += count;
        totalViews += Number(row.s || 0);
        if (row.status === 'PUBLISHED') published += count;
        else if (row.status === 'DRAFT') draft += count;
        else if (row.status === 'PENDING') pending += count;
        else if (row.status === 'REVIEWING') reviewing += count;
        else if (row.status === 'REJECTED') rejected += count;
      }
      return { success: true, message: 'Lấy thống kê bài viết thành công', data: { total, published, draft, pending, reviewing, rejected, totalViews, byStatus: [{ status: 'PUBLISHED', count: published }, { status: 'DRAFT', count: draft }, { status: 'PENDING', count: pending }, { status: 'REVIEWING', count: reviewing }, { status: 'REJECTED', count: rejected }] } };
    } catch(e) {
      console.error(e);
      throw new InternalServerErrorException('Lỗi lấy thống kê bài viết');
    }
  }

  async getKpiStatistics(filter: any, user: any, metadata: Metadata) {
    try {
      const periodId = filter?.periodId ? Number(filter.periodId) : undefined;
      const rows: any[] = await this.prisma.$queryRawUnsafe(\`
        SELECT e.totalScore, emp.departmentId 
        FROM admin_hrm.kpi_evaluation e 
        LEFT JOIN admin_hrm.employee emp ON e.employeeCode = emp.employeeCode
        \${periodId ? \`WHERE e.periodId = \${periodId}\` : ''}
      \`);

      let totalScore = 0;
      const unitStats = new Map();

      for (const row of rows) {
        const score = Number(row.totalScore || 0);
        const deptId = row.departmentId || 0;
        totalScore += score;
        
        if (!unitStats.has(deptId)) unitStats.set(deptId, { count: 0, totalScore: 0 });
        const st = unitStats.get(deptId);
        st.count++;
        st.totalScore += score;
      }
      
      const companyAvgScore = rows.length > 0 ? totalScore / rows.length : 0;
      let unitMap = {};
      try { unitMap = await this.getUnitMap(); } catch (e) {}

      const statsByUnit = Array.from(unitStats.entries()).map(([deptId, st]) => {
        return {
           departmentId: deptId,
           departmentName: unitMap[deptId] ? unitMap[deptId].name : 'Chưa xác định',
           count: st.count,
           avgScore: st.count > 0 ? st.totalScore / st.count : 0
        };
      });

      return { success: true, message: 'Lấy thống kê KPI thành công', data: { totalEvaluations: rows.length, companyAvgScore, statsByUnit } };
    } catch(e) {
      throw new InternalServerErrorException('Lỗi lấy thống kê KPI');
    }
  }

  async getDocumentStatistics(filter: any, metadata: Metadata) {
    try {
      const incomingTotal: any[] = await this.prisma.$queryRawUnsafe(\`SELECT COUNT(*) as c FROM admin_document.document WHERE isIncoming = 1 AND isDeleted = 0\`);
      const incomingPending: any[] = await this.prisma.$queryRawUnsafe(\`SELECT COUNT(*) as c FROM admin_document.document WHERE isIncoming = 1 AND status = 'PROCESSING' AND isDeleted = 0\`);
      const incomingLate: any[] = await this.prisma.$queryRawUnsafe(\`SELECT COUNT(*) as c FROM admin_document.document WHERE isIncoming = 1 AND status = 'PROCESSING' AND processingDeadline < NOW() AND isDeleted = 0\`);
      const outgoingTotal: any[] = await this.prisma.$queryRawUnsafe(\`SELECT COUNT(*) as c FROM admin_document.document WHERE isIncoming = 0 AND isDeleted = 0\`);
      const urgentTotal: any[] = await this.prisma.$queryRawUnsafe(\`SELECT COUNT(*) as c FROM admin_document.document WHERE status = 'PROCESSING' AND urgency IN ('URGENT', 'FLASH') AND isDeleted = 0\`);

      return {
        success: true,
        message: 'Lấy thống kê văn bản thành công',
        data: {
          incomingTotal: Number(incomingTotal[0].c),
          incomingPending: Number(incomingPending[0].c),
          incomingLate: Number(incomingLate[0].c),
          outgoingTotal: Number(outgoingTotal[0].c),
          urgentTotal: Number(urgentTotal[0].c)
        }
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
console.log("Rewrote statistics.service.ts");
