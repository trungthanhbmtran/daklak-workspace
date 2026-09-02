import { Injectable, Inject, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class StatisticsService implements OnModuleInit {
  private taskService: any;
  private postService: any;
  private kpiService: any;
  private documentService: any;
  private orgService: any;

  private unitMapCache: { data: Record<number, any>; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('TASK_SERVICE') private readonly taskClient: any,
    @Inject('POST_SERVICE') private readonly postClient: any,
    @Inject('KPI_SERVICE') private readonly kpiClient: any,
    @Inject('DOCUMENT_SERVICE') private readonly documentClient: any,
    @Inject('USER_SERVICE') private readonly orgClient: any,
  ) {}

  onModuleInit() {
    this.taskService = this.taskClient.getService('TaskService');
    this.postService = this.postClient.getService('PostService');
    this.kpiService = this.kpiClient.getService('KpiService');
    this.documentService = this.documentClient.getService('DocumentService');
    this.orgService = this.orgClient.getService('OrganizationService');
  }
  async getTaskStatistics(filter: any, user: any, metadata: Metadata) {
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader = isAdmin || user?.permissionsFlatten?.includes('TASK.ASSIGN') || user?.permissionsFlatten?.includes('TASK.*');

    let finalAssigneeCode = filter.assigneeCode;
    let finalAssignerCode = filter.assignerCode;
    
    if (filter.role === 'ASSIGNEE' && user) finalAssigneeCode = user.employeeCode;
    else if (filter.role === 'OWNER' && user) finalAssignerCode = user.employeeCode;

    const requestPayload = {
      assigneeCode: finalAssigneeCode,
      assignerCode: finalAssignerCode,
      departmentId: filter.departmentId && filter.departmentId !== 'undefined' ? parseInt(filter.departmentId, 10) : undefined,
      planId: filter.planId && filter.planId !== 'undefined' ? parseInt(filter.planId, 10) : undefined,
      isSupervisor: filter.isSupervisor === 'true',
      status: filter.status,
      priority: filter.priority,
      search: filter.search,
      currentEmployeeCode: user?.employeeCode,
      isAdmin,
      isLeader,
      currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
      currentUserId: user?.id ? parseInt(user.id, 10) : undefined,
      role: filter.role,
    };

    const res: any = await firstValueFrom(this.taskService.GetTaskStats(requestPayload, metadata)).catch(e => {
      console.error('TaskService gRPC Error:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê nhiệm vụ');
    });

    if (res?.success && res.data?.departmentStats) {
      let unitMap: Record<number, any> = {};
      try { unitMap = await this.getUnitMap(); } catch (e) {}
      
      res.data.departmentStats = res.data.departmentStats.map((s: any) => {
        const deptId = parseInt(s.name, 10);
        if (!isNaN(deptId) && unitMap[deptId]) {
          return { ...s, name: unitMap[deptId].name };
        }
        return { ...s, name: isNaN(deptId) ? s.name : "Chưa phân công bộ phận" };
      });
    }

    return res;
  }

  async getPostStatistics(filter: any, metadata: Metadata) {
    return firstValueFrom(this.postService.GetPostStats(filter, metadata)).catch(e => {
      console.error('PostService gRPC Error:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê bài viết');
    });
  }

  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now()) return this.unitMapCache.data;
    try {
      const orgRes: any = await firstValueFrom(this.orgService.GetOrganizations({}));
      const unitMap: Record<number, any> = {};
      (orgRes?.nodes || []).forEach((n: any) => {
        const nId = parseInt(n.id, 10);
        if (nId) unitMap[nId] = { id: nId, name: n.name, code: n.code };
      });
      this.unitMapCache = { data: unitMap, expiresAt: Date.now() + 5 * 60 * 1000 };
      return unitMap;
    } catch {
      return {};
    }
  }

  async getKpiStatistics(filter: any, user: any, metadata: Metadata) {
    const isAdmin = user?.permissionsFlatten?.includes('KPI:MANAGE') || user?.roles?.some((r: any) => r === 'ADMIN' || r?.code === 'ADMIN');
    
    let callerDescendantUnitIds: number[] = [];
    let unitMap: Record<number, any> = {};
    try { unitMap = await this.getUnitMap(); } catch (e) {}

    if (!isAdmin && user?.unitId) {
      try {
        const descRes: any = await firstValueFrom(this.orgService.GetDescendants({ id: parseInt(user.unitId, 10) }));
        callerDescendantUnitIds = descRes.ids || [];
      } catch (e) {
        callerDescendantUnitIds = [];
      }
    }

    const res: any = await firstValueFrom(this.kpiService.GetEvaluationStats({
      periodId: filter.periodId,
      isAdmin,
      callerDescendantUnitIds,
    }, metadata)).catch((e) => {
      throw new InternalServerErrorException('Lỗi lấy thống kê KPI');
    });

    if (res?.success && res.data?.statsByUnit) {
      res.data.statsByUnit = res.data.statsByUnit.map((s: any) => ({
        ...s,
        departmentName: s.departmentId && unitMap[s.departmentId] ? unitMap[s.departmentId].name : 'Chưa xác định',
      }));
    }
    return res;
  }

  async getDocumentStatistics(filter: any, metadata: Metadata) {
    return firstValueFrom(this.documentService.GetStatistics(filter, metadata)).catch(e => {
      console.error('DocumentService gRPC Error:', e);
      throw new InternalServerErrorException('Lỗi lấy thống kê văn bản');
    });
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
