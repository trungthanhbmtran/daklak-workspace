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

@ApiTags('HRM')
@Controller('admin/hrm/employees')
@UseGuards(JwtAuthGuard)
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
  ) { }

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
          category: jt.category || ''
        };
      });

      const catMap: Record<string, any> = {};
      (catRes?.data || []).forEach((c: any) => {
        catMap[c.id] = { name: c.name, code: c.code };
      });

      const unitMap: Record<string, any> = {};
      const flattenNodes = (nodes: any[]) => {
        for (const n of nodes) {
          if (n.id) {
            unitMap[n.id] = { 
              name: n.name, 
              code: n.code,
              domainIds: n.domainIds || []
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
    } catch (error) {
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

  @Get()
  async list(@Query() query: any, @Req() request: any) {
    const req = { ...query };
    if (req.page) req.page = parseInt(req.page);
    if (req.pageSize) req.pageSize = parseInt(req.pageSize);
    if (req.departmentId) req.departmentId = parseInt(req.departmentId);
    // Nhận thêm params từ client
    if (req.civilServantRankId)
      req.civilServantRankId = parseInt(req.civilServantRankId);
    if (req.partyTitleId) req.partyTitleId = parseInt(req.partyTitleId);

    // Truyền ngữ cảnh người dùng hiện tại (PBAC)
    const user = request.user;
    if (user) {
      req.callerEmail = user.email;
      req.callerUnitId = user.unitId;
      req.callerJobCode = user.jobTitleCode;
    }
    
    // Convert boolean flag
    if (req.assignableOnly === 'true' || req.assignableOnly === true) {
      req.assignableOnly = true;
    }

    const [res, dicts]: [any, any] = await Promise.all([
      firstValueFrom(this.employeeService.ListEmployees(req)),
      this.fetchDictionaries(),
    ]);

    if (res && res.data) {
      res.data = res.data.map((e: any) =>
        this.enrichEmployee(e, dicts.jtMap, dicts.unitMap, dicts.catMap),
      );

      // NATIVE PBAC: Áp dụng lọc dữ liệu tự động theo JWT token để đảm bảo bảo mật
      const isAdmin = user?.roles?.includes('ADMIN') || user?.role === 'ADMIN' || user?.username === 'admin';

      if (!isAdmin && req.callerUnitId) {
        const callerUnitCode = dicts.unitMap[req.callerUnitId]?.code;
        
        // Lấy category của người gọi API dựa vào job code
        const callerJt: any = Object.values(dicts.jtMap).find((jt: any) => jt.code === req.callerJobCode);
        const isCallerLeader = callerJt && ['EXECUTIVE', 'MANAGER'].includes(callerJt.category);

        if (callerUnitCode) {
          const callerLevel = callerUnitCode.split('.').length;

          res.data = res.data.filter((emp: any) => {
            // Loại bỏ chính mình nếu đang dùng cờ giao việc (nếu frontend vẫn truyền)
            if (req.assignableOnly && emp.email === req.callerEmail) return false;
            
            const targetUnitCode = emp.department?.code;
            if (!targetUnitCode) return false;

            const targetLevel = targetUnitCode.split('.').length;
            const isTargetLeader = ['EXECUTIVE', 'MANAGER'].includes(emp.jobTitle?.category);

            // Cho phép thấy chính mình (nếu không phải trường hợp assignableOnly)
            if (emp.email === req.callerEmail) return true;

            if (isCallerLeader) {
              // 1. Cấp trên thấy: Lãnh đạo cấp dưới trực tiếp (Level + 1)
              if (targetLevel === callerLevel + 1 && targetUnitCode.startsWith(callerUnitCode) && isTargetLeader) {
                return true;
              }
              // 2. Lãnh đạo thấy: Nhân viên trong cùng đơn vị
              if (targetUnitCode === callerUnitCode && !isTargetLeader) {
                return true;
              }
            } else {
              // Nhân viên thường: Chỉ thấy người trong cùng đơn vị
              if (targetUnitCode === callerUnitCode) {
                return true;
              }
            }

            return false;
          });
        } else {
          // Không có mã đơn vị, chỉ thấy chính mình
          res.data = res.data.filter((emp: any) => emp.email === req.callerEmail);
        }
      }
    }
    return res;
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const [res, dicts]: [any, any] = await Promise.all([
      firstValueFrom(this.employeeService.GetEmployee({ id: parseInt(id) })),
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
      firstValueFrom(this.employeeService.CreateEmployee(body)),
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
      firstValueFrom(this.employeeService.UpdateEmployee(payload)),
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
    );
  }
}
