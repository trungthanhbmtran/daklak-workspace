import { Injectable, Inject, OnModuleInit , InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { Role } from '../../common/decorators/roles.decorator';

@Injectable()
export class KpisService implements OnModuleInit {
  private kpiService: any;
  private orgService: any;
  private employeeService: any;

  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    @Inject(MICROSERVICES.KPI.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly empClient: any,
  ) {}

  onModuleInit() {
    this.kpiService = this.client.getService(MICROSERVICES.KPI.SERVICE);
    this.orgService = this.orgClient.getService(MICROSERVICES.ORGANIZATION.SERVICE);
    this.employeeService = this.empClient.getService(MICROSERVICES.EMPLOYEE.SERVICE);
  }

  // Gateway Aggregation: Chỉ dùng để map departmentName
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
        if (nId) {
          unitMap[nId] = {
            id: nId,
            name: n.name,
            code: n.code,
          };
        }
      });

      this.unitMapCache = {
        data: unitMap,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return unitMap;
    } catch {
      return {};
    }
  }

  async findPeriods() {
    return firstValueFrom(this.kpiService.FindPeriods({})).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async createPeriod(body: any) {
    return firstValueFrom(this.kpiService.CreatePeriod(body)).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async findCriteria(user: any, page?: string, limit?: string) {
    const userRoles = user?.roles || [];
    const checkRole = (roleCode: string) =>
      userRoles.some((r: any) => r === roleCode || r?.code === roleCode);
    const hasGlobalAccess = checkRole(Role.ADMIN) || checkRole(Role.SUPER_ADMIN);
    const res: any = await firstValueFrom(
      this.kpiService.FindCriteria({
        isAdmin: hasGlobalAccess,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 0,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });

    if (res) {
      res.meta = res.meta || {};
      const perms = user?.permissionsFlatten || [];
      const allowedActions: string[] = [];

      if (perms.includes('KPI:CREATE') || hasGlobalAccess)
        allowedActions.push('CREATE');
      if (perms.includes('KPI:UPDATE') || hasGlobalAccess)
        allowedActions.push('EDIT');
      if (perms.includes('KPI:DELETE') || hasGlobalAccess)
        allowedActions.push('DELETE');

      res.meta.allowedActions = allowedActions;
    }
    return res;
  }

  async createCriterion(body: any) {
    return firstValueFrom(this.kpiService.CreateCriterion(body)).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async updateCriterion(id: string, body: any) {
    return firstValueFrom(
      this.kpiService.UpdateCriterion({ id: Number(id), ...body }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async deleteCriterion(id: string) {
    return firstValueFrom(
      this.kpiService.DeleteCriterion({ id: Number(id) }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async createEvaluation(user: any, body: any) {
    if (user) {
      body.evaluatorCode = user.employeeCode || user.username;
    }
    return firstValueFrom(this.kpiService.CreateEvaluation(body)).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async findEvaluations(user: any, employeeCode: string) {
    const callerCode = user?.employeeCode || user?.username;
    const isFetchingOwn = !employeeCode || employeeCode === callerCode;
    const targetCode = employeeCode || callerCode;
    const isAdmin = user?.permissionsFlatten?.includes('KPI:MANAGE');

    let callerDescendantUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const callerUnitId = parseInt(user.unitId, 10);
      try {
        const descRes: any = await firstValueFrom(
          this.orgService.GetDescendants({ id: callerUnitId }),
        );
        callerDescendantUnitIds = descRes.ids || [];
      } catch (e) {
        callerDescendantUnitIds = [];
      }
    }

    return firstValueFrom(
      this.kpiService.FindEvaluations({
        employeeCode: targetCode,
        currentEmployeeCode: callerCode,
        isAdmin,
        isFetchingOwn,
        callerDescendantUnitIds,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async getDashboardStats(user: any, periodId: string) {
    const isAdmin =
      user?.permissionsFlatten?.includes('KPI:MANAGE') ||
      user?.roles?.some((r: any) => r === Role.ADMIN || r?.code === Role.ADMIN);

    let callerDescendantUnitIds: number[] = [];
    let unitMap: Record<number, any> = {};

    try {
      unitMap = await this.getUnitMap();
    } catch (e) {
      console.error('Failed to get unit map', e);
    }

    if (!isAdmin && user?.unitId) {
      const callerUnitId = parseInt(user.unitId, 10);
      try {
        const descRes: any = await firstValueFrom(
          this.orgService.GetDescendants({ id: callerUnitId }),
        );
        callerDescendantUnitIds = descRes.ids || [];
      } catch (e) {
        callerDescendantUnitIds = [];
      }
    }

    const res: any = await firstValueFrom(
      this.kpiService.GetEvaluationStats({
        periodId,
        isAdmin,
        callerDescendantUnitIds,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });

    if (res?.success && res.data?.statsByUnit) {
      const mappedStats = res.data.statsByUnit.map((s: any) => {
        let name = 'Chưa xác định';
        if (s.departmentId && unitMap[s.departmentId]) {
          name = unitMap[s.departmentId].name;
        }
        return {
          ...s,
          departmentName: name,
        };
      });
      res.data.statsByUnit = mappedStats;
    }

    return res;
  }

  async calculatePersonalKpi(user: any, body: { periodId: number; employeeCode?: string; staffingSlotId?: number }) {
    const targetCode = body.employeeCode || user?.employeeCode || user?.username;

    return firstValueFrom(
      this.kpiService.CalculatePersonalKpi({
        periodId: Number(body.periodId),
        employeeCode: targetCode,
        staffingSlotId: body.staffingSlotId ? Number(body.staffingSlotId) : undefined,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async getEvaluationDetail(id: string) {
    return firstValueFrom(
      this.kpiService.GetEvaluationDetail({ id: Number(id) }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async submitSelfScore(id: string, body: any) {
    return firstValueFrom(
      this.kpiService.SubmitEvaluation({
        id: Number(id),
        data: JSON.stringify(body),
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  async approveEvaluation(user: any, id: string, body: any) {
    const reviewerCode = user?.employeeCode || user?.username;
    return firstValueFrom(
      this.kpiService.ApproveEvaluation({
        id: Number(id),
        data: JSON.stringify(body),
        reviewerCode,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }
}
