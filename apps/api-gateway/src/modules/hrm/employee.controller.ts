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

  /**
   * Lấy danh sách map của JobTitle và Unit từ user-service
   */
  private async fetchDictionaries() {
    if (this.dictCache && this.dictCache.expiresAt > Date.now()) {
      return this.dictCache.data;
    }
    try {
      const results = await Promise.allSettled([
        firstValueFrom(this.orgService.ListJobTitles({})),
        firstValueFrom(this.orgService.GetFullTree({})),
        firstValueFrom(this.catService.GetAllCategories({})),
      ]);

      const jobTitlesRes: any =
        results[0].status === 'fulfilled' ? results[0].value : { items: [] };
      const treeRes: any =
        results[1].status === 'fulfilled' ? results[1].value : { nodes: [] };
      const catRes: any =
        results[2].status === 'fulfilled' ? results[2].value : { data: [] };

      const jtMap: Record<string, any> = {};
      (jobTitlesRes?.items || []).forEach((jt: any) => {
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

      // unitMap: lưu thông tin node kèm isLeaf + directChildIds từ proto (không cần tự tính)
      const unitMap: Record<number, any> = {};
      const flattenNodes = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId) {
            unitMap[nId] = {
              id: nId, // BUG FIX: cần field id để filter descendantUnitIds
              name: n.name,
              code: n.code,
              parentId: n.parentId ? parseInt(n.parentId, 10) : null,
              domainIds: n.domainIds || [],
              isLeaf: n.isLeaf ?? !n.children?.length,
              depth: n.depth ?? 0,
              directChildIds: (n.children || [])
                .map((c: any) => parseInt(c.id, 10))
                .filter(Boolean),
            };
          }
          if (n.children?.length) flattenNodes(n.children);
        }
      };
      flattenNodes(treeRes?.nodes || []);

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

  /**
   * Ánh xạ thông tin chức danh, phòng ban vào nhân viên
   */
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

  /**
   * Lấy tất cả unitId cấp dưới (bao gồm cả chính nó) từ một unitId cho trước.
   * Duyệt theo mã đơn vị (code prefix) hoặc theo parentId.
   */
  private getDescendantUnitIds(
    unitMap: Record<number, any>,
    unitId: number,
  ): Set<number> {
    const callerUnit = unitMap[unitId];
    if (!callerUnit) return new Set();
    const callerCode: string = callerUnit.code || '';
    return new Set<number>(
      Object.values(unitMap)
        .filter(
          (u: any) =>
            u.code === callerCode || u.code.startsWith(callerCode + '.'),
        )
        .map((u: any) => u.id)
        .filter(Boolean),
    );
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

    // Truyền ngữ cảnh người dùng hiện tại từ access token (PBAC)
    const user = request.user;
    if (user) {
      req.callerEmail = user.email;
      req.callerUnitId = user.unitId;
      req.callerJobCode = user.jobTitleCode;
      req.callerEmployeeCode = user.employeeCode || user.username;
      req.callerUserId = user.id;
    }

    // Convert boolean flag
    if (req.assignableOnly === 'true' || req.assignableOnly === true)
      req.assignableOnly = true;
    if (req.crossDepartment === 'true' || req.crossDepartment === true)
      req.crossDepartment = true;

    const isAdmin = user?.permissionsFlatten?.includes('HRM_EMPLOYEE:MANAGE');
    let descendantUnitIdsArray: number[] = [];
    
    // Fetch dictionaries early to get unitMap for descendant calculation
    const dicts = await this.fetchDictionaries();

    if (req.callerUnitId && !isAdmin) {
      const callerUnitId = parseInt(req.callerUnitId, 10);
      const descendantUnitIds = this.getDescendantUnitIds(
        dicts.unitMap,
        callerUnitId,
      );
      descendantUnitIdsArray = Array.from(descendantUnitIds);
      
      req.descendantUnitIds = descendantUnitIdsArray;
      req.excludeEmployeeCode = req.callerEmployeeCode;
    }

    const res: any = await firstValueFrom(this.employeeService.ListEmployees(req)).catch(e => { console.error('RPC Call Failed', e.message); return null; });

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
      firstValueFrom(this.employeeService.GetEmployee({ id: parseInt(id) })).catch(e => { console.error('RPC Call Failed', e.message); return null; }),
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
      firstValueFrom(this.employeeService.CreateEmployee(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; }),
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
      firstValueFrom(this.employeeService.UpdateEmployee(payload)).catch(e => { console.error('RPC Call Failed', e.message); return null; }),
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
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }
}
