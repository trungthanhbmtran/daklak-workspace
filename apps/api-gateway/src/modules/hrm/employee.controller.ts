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
          domainId: jt.domainId || null
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

      return { jtMap, unitMap, catMap };
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

      // PBAC Task Assignment Filtering (Server-Side) based on Unit Code hierarchy
      if (req.assignableOnly && req.callerUnitId) {
        const callerUnitCode = dicts.unitMap[req.callerUnitId]?.code;
        const leaderJobCodes = [
          'CHU_TICH', 'PHO_CHU_TICH',
          'GIAM_DOC', 'PHO_GIAM_DOC',
          'TRUONG_PHONG', 'PHO_PHONG',
          'CHANH_VAN_PHONG', 'PHO_CHANH_VAN_PHONG'
        ];
        
        // Kiểm tra xem người gọi API có thuộc nhóm lãnh đạo quản lý không
        const isCallerLeader = leaderJobCodes.includes(req.callerJobCode || '');

        if (callerUnitCode && isCallerLeader) {
          const callerLevel = callerUnitCode.split('.').length;

          res.data = res.data.filter((emp: any) => {
            // Không giao việc cho chính mình
            if (emp.email === req.callerEmail) return false;
            
            const targetUnitCode = emp.department?.code;
            if (!targetUnitCode) return false;

            const targetLevel = targetUnitCode.split('.').length;
            const targetJobCode = emp.jobTitle?.code || 'CHUYEN_VIEN';
            const isTargetLeader = leaderJobCodes.includes(targetJobCode);

            // 1. Cấp trên giao việc cho Lãnh đạo cấp dưới trực tiếp (Level + 1)
            // Ví dụ: Lãnh đạo Sở -> Lãnh đạo Phòng/Trung tâm, Lãnh đạo Trung tâm -> Lãnh đạo Phòng thuộc Trung tâm
            if (targetLevel === callerLevel + 1 && targetUnitCode.startsWith(callerUnitCode) && isTargetLeader) {
              return true;
            }
            
            // 2. Lãnh đạo giao việc cho Chuyên viên / Nhân viên trong cùng đơn vị
            // Ví dụ: Lãnh đạo Phòng -> Chuyên viên, Lãnh đạo Phòng thuộc Trung tâm -> Chuyên viên
            if (targetUnitCode === callerUnitCode && !isTargetLeader) {
              return true;
            }

            return false;
          });
        } else {
          // Nếu không phải lãnh đạo hoặc không có mã đơn vị, trả về danh sách rỗng (không có quyền giao việc)
          res.data = [];
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
