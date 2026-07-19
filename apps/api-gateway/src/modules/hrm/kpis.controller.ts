import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Role, Roles } from '../../common/decorators/roles.decorator';

@ApiTags('HRM - KPIs')
@Controller('admin/hrm/kpis')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth('JWT-auth')
export class KpisController implements OnModuleInit {
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
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.employeeService = this.empClient.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
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

  @Get('periods')
  async findPeriods() {
    return firstValueFrom(this.kpiService.FindPeriods({})).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('periods')
  async createPeriod(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreatePeriod(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('criteria')
  async findCriteria(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userRoles = req.user?.roles || [];
    const checkRole = (roleCode: string) =>
      userRoles.some((r: any) => r === roleCode || r?.code === roleCode);
    const hasGlobalAccess =
      checkRole(Role.ADMIN) || checkRole(Role.SUPER_ADMIN);
    const res: any = await firstValueFrom(
          this.kpiService.FindCriteria({ 
            isAdmin: hasGlobalAccess,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 0,
          }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });

    if (res) {
      res.meta = res.meta || {};
      const perms = req.user?.permissionsFlatten || [];
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

  @Post('criteria')
  @Roles(Role.ADMIN)
  async createCriterion(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreateCriterion(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Put('criteria/:id')
  @Roles(Role.ADMIN)
  async updateCriterion(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
          this.kpiService.UpdateCriterion({ id: Number(id), ...body }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Delete('criteria/:id')
  @Roles(Role.ADMIN)
  async deleteCriterion(@Param('id') id: string) {
    return firstValueFrom(this.kpiService.DeleteCriterion({ id: Number(id) })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('evaluations')
  async createEvaluation(@Req() req: any, @Body() body: any) {
    if (req.user) {
      body.evaluatorCode = req.user.employeeCode || req.user.username;
    }
    return firstValueFrom(this.kpiService.CreateEvaluation(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('evaluations')
  async findEvaluations(
    @Req() req: any,
    @Query('employeeCode') employeeCode: string,
  ) {
    const user = req.user;
    const callerCode = user?.employeeCode || user?.username;

    // Nếu employeeCode không được truyền, lấy của chính mình
    const isFetchingOwn = !employeeCode || employeeCode === callerCode;
    const targetCode = employeeCode || callerCode;

    const isAdmin = user?.permissionsFlatten?.includes('KPI:MANAGE');

    let callerDescendantUnitIds: number[] = [];
    
    // GỌI TRỰC TIẾP MICROSERVICE (GetDescendants) thay vì tính toán DFS trong API Gateway
    if (!isAdmin && user?.unitId) {
      const callerUnitId = parseInt(user.unitId, 10);
      try {
        const descRes: any = await firstValueFrom(this.orgService.GetDescendants({ id: callerUnitId }));
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
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('dashboard-stats')
  async getDashboardStats(@Req() req: any, @Query('periodId') periodId: string) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('KPI:MANAGE') || user?.roles?.some((r: any) => r === Role.ADMIN || r?.code === Role.ADMIN);

    let callerDescendantUnitIds: number[] = [];
    let unitMap: Record<number, any> = {};

    try {
      unitMap = await this.getUnitMap();
    } catch (e) {
      console.error('Failed to get unit map', e);
    }

    // GỌI TRỰC TIẾP MICROSERVICE (GetDescendants) thay vì tính toán DFS trong API Gateway
    if (!isAdmin && user?.unitId) {
      const callerUnitId = parseInt(user.unitId, 10);
      try {
        const descRes: any = await firstValueFrom(this.orgService.GetDescendants({ id: callerUnitId }));
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
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });

    if (res?.success && res.data?.statsByUnit) {
      // Map departmentId to departmentName
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

  @Post('evaluations/calculate-personal')
  async calculatePersonalKpi(@Req() req: any, @Body() body: { periodId: number, employeeCode?: string, staffingSlotId?: number }) {
    const user = req.user;
    const targetCode = body.employeeCode || user?.employeeCode || user?.username;
    
    return firstValueFrom(
          this.kpiService.CalculatePersonalKpi({
            periodId: Number(body.periodId),
            employeeCode: targetCode,
            staffingSlotId: body.staffingSlotId ? Number(body.staffingSlotId) : undefined
          })
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('evaluations/:id')
  async getEvaluationDetail(@Param('id') id: string) {
    return firstValueFrom(this.kpiService.GetEvaluationDetail({ id: Number(id) })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('evaluations/:id/submit')
  async submitSelfScore(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.kpiService.SubmitEvaluation({
          id: Number(id),
          data: JSON.stringify(body)
        })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('evaluations/:id/approve')
  async approveEvaluation(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    const user = req.user;
    const reviewerCode = user?.employeeCode || user?.username;
    return firstValueFrom(this.kpiService.ApproveEvaluation({
          id: Number(id),
          data: JSON.stringify(body),
          reviewerCode
        })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }
}
