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

  private unitMapCache: { data: Record<number, any>; expiresAt: number } | null = null;

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

  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now()) return this.unitMapCache.data;
    try {
      const treeRes: any = await firstValueFrom(this.orgService.GetFullTree({}));
      const unitMap: Record<number, any> = {};
      const flattenNodes = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId) {
            unitMap[nId] = {
              id: nId,
              parentId: n.parentId ? parseInt(n.parentId, 10) : null,
              isLeaf: n.isLeaf ?? (!(n.children?.length)),
              directChildIds: (n.children || []).map((c: any) => parseInt(c.id, 10)).filter(Boolean)
            };
          }
          if (n.children && n.children.length > 0) flattenNodes(n.children);
        }
      };
      flattenNodes(treeRes?.nodes || []);
      this.unitMapCache = { data: unitMap, expiresAt: Date.now() + 5 * 60 * 1000 };
      return unitMap;
    } catch { return {}; }
  }

  private getDescendantUnitIds(unitMap: Record<number, any>, unitId: number): Set<number> {
    const ids = new Set<number>();
    const dfs = (id: number) => {
      ids.add(id);
      const node = unitMap[id];
      if (node && node.directChildIds) {
        for (const childId of node.directChildIds) dfs(childId);
      }
    };
    dfs(unitId);
    return ids;
  }

  @Get('periods')
  async findPeriods() {
    return firstValueFrom(this.kpiService.FindPeriods({}));
  }

  @Post('periods')
  async createPeriod(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreatePeriod(body));
  }

  @Get('criteria')
  async findCriteria(@Req() req: any) {
    const userRoles = req.user?.roles || [];
    const isAdmin = userRoles.includes(Role.ADMIN) || userRoles.includes(Role.SUPER_ADMIN);
    const res: any = await firstValueFrom(this.kpiService.FindCriteria({ isAdmin }));
    return res;
  }

  @Post('criteria')
  @Roles(Role.ADMIN)
  async createCriterion(@Body() body: any) {
    return firstValueFrom(this.kpiService.CreateCriterion(body));
  }

  @Put('criteria/:id')
  @Roles(Role.ADMIN)
  async updateCriterion(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.kpiService.UpdateCriterion({ id: Number(id), ...body }));
  }

  @Delete('criteria/:id')
  @Roles(Role.ADMIN)
  async deleteCriterion(@Param('id') id: string) {
    return firstValueFrom(this.kpiService.DeleteCriterion({ id: Number(id) }));
  }

  @Post('evaluations')
  async createEvaluation(@Req() req: any, @Body() body: any) {
    if (req.user) {
      body.evaluatorCode = req.user.employeeCode || req.user.username;
    }
    return firstValueFrom(this.kpiService.CreateEvaluation(body));
  }

  @Get('evaluations')
  async findEvaluations(@Req() req: any, @Query('employeeCode') employeeCode: string) {
    const user = req.user;
    const callerCode = user?.employeeCode || user?.username;
    
    // Nếu employeeCode không được truyền, lấy của chính mình
    const isFetchingOwn = !employeeCode || employeeCode === callerCode;
    const targetCode = employeeCode || callerCode;

    const isAdmin = user?.roles?.includes('ADMIN') || user?.role === 'ADMIN' || user?.username === 'admin';

    let callerDescendantUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const callerUnitId = parseInt(user.unitId, 10);
      const unitMap = await this.getUnitMap();
      callerDescendantUnitIds = Array.from(this.getDescendantUnitIds(unitMap, callerUnitId));
    }

    return firstValueFrom(
      this.kpiService.FindEvaluations({
        employeeCode: targetCode,
        currentUserCode: callerCode,
        isAdmin,
        isFetchingOwn,
        callerDescendantUnitIds,
      }),
    );
  }
}
