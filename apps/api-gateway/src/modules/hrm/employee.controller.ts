import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeController implements OnModuleInit {
  private employeeService: any;
  private orgService: any;
  private catService: any;

  // Cache for dictionaries to optimize API speed
  private dictCache: { data: any; expiresAt: number } | null = null;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
  ) {}

  onModuleInit() {
    this.employeeService = this.client.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
    this.catService = this.catClient.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  private async fetchDictionaries() {
    if (this.dictCache && this.dictCache.expiresAt > Date.now()) {
      return this.dictCache.data;
    }
    try {
      const results = await Promise.allSettled([
        firstValueFrom(this.orgService.ListJobTitles({})),
        firstValueFrom(this.orgService.GetOrganizations({})),
        firstValueFrom(this.catService.GetAllCategories({})),
      ]);

      const jobTitlesRes: any =
        results[0].status === 'fulfilled' ? results[0].value : { data: [] };
      const orgRes: any =
        results[1].status === 'fulfilled' ? results[1].value : { nodes: [] };
      const catRes: any =
        results[2].status === 'fulfilled' ? results[2].value : { data: [] };

      const jtMap: Record<string, any> = {};
      (jobTitlesRes?.data || []).forEach((jt: any) => {
        jtMap[jt.id] = {
          name: jt.name,
          code: jt.code,
          monitoredUnitIds: jt.monitoredUnitIds || [],
          domainId: jt.domainId || null,
          category: jt.category || '',
        };
      });

      const catMap: Record<string, any> = {};
      (catRes?.data || []).forEach((c: any) => {
        catMap[c.id] = { name: c.name, code: c.code };
      });

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

      const data = { jtMap, unitMap, catMap };
      this.dictCache = {
        data,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      };

      return data;
    } catch (_error) {
      return { jtMap: {}, unitMap: {}, catMap: {} };
    }
  }

  private enrichEmployee(
    emp: any,
    jtMap: Record<string, any>,
    unitMap: Record<string, any>,
    catMap: Record<string, any>,
  ) {
    if (!emp) return emp;
    const lookup = (map: Record<string, any>, id?: number) =>
      id && id > 0
        ? map[id as any] || { name: '', code: '' }
        : { name: '', code: '' };

    return {
      ...emp,
      department: {
        id: emp.departmentId,
        ...lookup(unitMap, emp.departmentId),
      },
      jobTitle: { id: emp.jobTitleId, ...lookup(jtMap, emp.jobTitleId) },
      civilServantRank: {
        id: emp.civilServantRankId,
        ...lookup(catMap, emp.civilServantRankId),
      },
      partyTitle: { id: emp.partyTitleId, ...lookup(jtMap, emp.partyTitleId) },
    };
  }

  @Get()
  async list(@Query() query: any, @Req() request: any) {
    const req = { ...query };
    if (req.page) req.page = parseInt(req.page);
    if (req.pageSize) req.pageSize = parseInt(req.pageSize);
    if (req.departmentId) req.departmentId = parseInt(req.departmentId);
    if (req.civilServantRankId)
      req.civilServantRankId = parseInt(req.civilServantRankId);
    if (req.partyTitleId) req.partyTitleId = parseInt(req.partyTitleId);

    const user = request.user;
    if (user) {
      req.callerEmail = user.email;
      req.callerUnitId = user.unitId;
      req.callerJobCode = user.jobTitleCode;
      req.callerEmployeeCode = user.employeeCode || user.username;
      req.callerUserId = user.id;
    }

    if (req.assignableOnly === 'true' || req.assignableOnly === true)
      req.assignableOnly = true;
    if (req.crossDepartment === 'true' || req.crossDepartment === true)
      req.crossDepartment = true;

    const isAdmin = user?.permissionsFlatten?.includes('HRM_EMPLOYEE:MANAGE');

    // GỌI TRỰC TIẾP MICROSERVICE (GetDescendants) thay vì Gateway Aggregation & Tính toán
    if (req.callerUnitId && !isAdmin) {
      const callerUnitId = parseInt(req.callerUnitId, 10);
      try {
        const descRes: any = await firstValueFrom(
          this.orgService.GetDescendants({ id: callerUnitId }),
        );
        req.descendantUnitIds = descRes.ids || [];
      } catch (e) {
        req.descendantUnitIds = [];
      }
      req.excludeEmployeeCode = req.callerEmployeeCode;
    }

    const dicts = await this.fetchDictionaries();

    const res: any = await firstValueFrom(
      this.employeeService.ListEmployees(req),
    ).catch((e: any) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });

    if (res && res.data) {
      res.data = res.data.map((e: any) =>
        this.enrichEmployee(e, dicts.jtMap, dicts.unitMap, dicts.catMap),
      );
    }

    if (res) {
      res.meta = res.meta || {};
      const perms = user?.permissionsFlatten || [];
      const allowedActions: string[] = [];

      if (perms.includes('HRM_EMPLOYEE:CREATE')) allowedActions.push('CREATE');
      if (perms.includes('HRM_EMPLOYEE:UPDATE')) allowedActions.push('EDIT');
      if (perms.includes('HRM_EMPLOYEE:DELETE')) allowedActions.push('DELETE');

      res.meta.allowedActions = allowedActions;
    }

    return res;
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const [res, dicts]: [any, any] = await Promise.all([
      firstValueFrom(
        this.employeeService.GetEmployee({ id: parseInt(id) }),
      ).catch((e: any) => {
        console.error('RPC Call Failed', e.message);
        return null;
      }),
      this.fetchDictionaries(),
    ]);

    if (res && res.data) {
      res.data = this.enrichEmployee(
        res.data,
        dicts.jtMap,
        dicts.unitMap,
        dicts.catMap,
      );
    }
    return res;
  }

  @Post()
  async create(@Body() body: any) {
    const [res, dicts]: [any, any] = await Promise.all([
      firstValueFrom(this.employeeService.CreateEmployee(body)).catch(
        (e: any) => {
          console.error('RPC Call Failed', e.message);
          return null;
        },
      ),
      this.fetchDictionaries(),
    ]);

    if (res && res.data) {
      res.data = this.enrichEmployee(
        res.data,
        dicts.jtMap,
        dicts.unitMap,
        dicts.catMap,
      );
    }
    return res;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const payload = { ...body, id: parseInt(id) };
    const [res, dicts]: [any, any] = await Promise.all([
      firstValueFrom(this.employeeService.UpdateEmployee(payload)).catch(
        (e: any) => {
          console.error('RPC Call Failed', e.message);
          return null;
        },
      ),
      this.fetchDictionaries(),
    ]);

    if (res && res.data) {
      res.data = this.enrichEmployee(
        res.data,
        dicts.jtMap,
        dicts.unitMap,
        dicts.catMap,
      );
    }
    return res;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return firstValueFrom(
      this.employeeService.DeleteEmployee({ id: parseInt(id) }),
    ).catch((e: any) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
