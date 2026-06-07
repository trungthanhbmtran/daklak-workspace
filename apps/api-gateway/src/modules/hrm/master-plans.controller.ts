import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Inject,
  OnModuleInit,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('HRM - Master Plans')
@ApiBearerAuth('JWT-auth')
@Controller('admin/hrm/master-plans')
@UseGuards(JwtAuthGuard)
export class MasterPlansController implements OnModuleInit {
  private masterPlanService: any;
  private orgService: any;

  // Cache org tree to avoid repeated gRPC calls
  private unitMapCache: {
    data: Record<number, any>;
    expiresAt: number;
  } | null = null;

  constructor(
    @Inject('MASTER_PLAN_PACKAGE') private client: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
  ) {}

  onModuleInit() {
    this.masterPlanService = this.client.getService('MasterPlanService');
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
  }

  /** Lấy unitMap từ org tree, có cache 5 phút */
  private async getUnitMap(): Promise<Record<number, any>> {
    if (this.unitMapCache && this.unitMapCache.expiresAt > Date.now()) {
      return this.unitMapCache.data;
    }
    try {
      const treeRes: any = await firstValueFrom(
        this.orgService.GetFullTree({}),
      );
      const unitMap: Record<number, any> = {};
      const flatten = (nodes: any[]) => {
        for (const n of nodes) {
          const nId = parseInt(n.id, 10);
          if (nId)
            unitMap[nId] = {
              id: nId,
              parentId: n.parentId ? parseInt(n.parentId, 10) : null,
            };
          if (n.children?.length) flatten(n.children);
        }
      };
      flatten(treeRes?.nodes || []);
      this.unitMapCache = {
        data: unitMap,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
      return unitMap;
    } catch {
      return {};
    }
  }

  /** Trả về danh sách unitId từ đơn vị hiện tại lên đến root (bao gồm chính nó) */
  private getAncestorUnitIds(
    unitMap: Record<number, any>,
    unitId: number,
  ): number[] {
    const ids: number[] = [];
    let current = unitMap[unitId];
    if (current) ids.push(unitId);
    while (current?.parentId) {
      ids.push(current.parentId);
      current = unitMap[current.parentId];
    }
    return ids;
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('departmentId') reqDepartmentId?: string,
  ) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('PLAN:MANAGE');
    const isLeader =
      user?.roles?.some((r: any) => {
        const code = typeof r === 'string' ? r : r.code;
        return code?.includes('LEADER') || code?.includes('MANAGER');
      }) || false;

    // Tính chuỗi đơn vị cha của user để kiểm tra kế hoạch được tạo bởi đơn vị cấp trên
    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    return firstValueFrom(
      this.masterPlanService.FindAll({
        type,
        status,
        departmentId: reqDepartmentId
          ? parseInt(reqDepartmentId, 10)
          : undefined,
        currentUserCode: user?.employeeCode || user?.username,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds, // Danh sách đơn vị cha để lọc kế hoạch cấp trên
        isLeader,
      }),
    );
  }

  @Get('advanced/historical-feasibility')
  async getHistoricalFeasibility(
    @Query('type') type: string,
    @Query('title') title: string,
    @Query('durationDays') durationDays: string,
  ) {
    return firstValueFrom(
      this.masterPlanService.GetHistoricalFeasibility({
        type,
        title,
        durationDays: parseInt(durationDays || '0', 10),
      }),
    );
  }

  @Get(':id')
  async findById(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    const isAdmin = user?.permissionsFlatten?.includes('PLAN:MANAGE');
    const isLeader =
      user?.roles?.some((r: any) => {
        const code = typeof r === 'string' ? r : r.code;
        return code?.includes('LEADER') || code?.includes('MANAGER');
      }) || false;

    let callerAncestorUnitIds: number[] = [];
    if (!isAdmin && user?.unitId) {
      const unitMap = await this.getUnitMap();
      callerAncestorUnitIds = this.getAncestorUnitIds(
        unitMap,
        parseInt(user.unitId, 10),
      );
    }

    return firstValueFrom(
      this.masterPlanService.FindById({
        id: parseInt(id, 10),
        currentUserCode: user?.employeeCode || user?.username,
        isAdmin,
        currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        callerAncestorUnitIds,
        isLeader,
      }),
    );
  }

  @Post('ai-generate')
  async generateFromAi(@Body('text') text: string) {
    // Giả lập độ trễ AI
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Hardcode mock data for demonstration
    const mockPlan = {
      title: 'Triển khai CĐS ngành Y Tế Đắk Lắk',
      objective: 'Đưa 100% hồ sơ bệnh án lên nền tảng số hóa trong năm 2026.',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tasks: [
        {
          title: 'Khảo sát hiện trạng bệnh án điện tử',
          description:
            'Làm việc với các bệnh viện tuyến tỉnh để rà soát hạ tầng server.',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          assigneeCode: 'E001', // Trưởng phòng CNTT
        },
        {
          title: 'Đào tạo sử dụng phần mềm quản lý',
          description: 'Mở lớp tập huấn cho 500 y bác sĩ.',
          priority: 'MEDIUM',
          dueDate: new Date(
            Date.now() + 14 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          assigneeCode: 'E002',
        },
        {
          title: 'Ban hành quy chế an toàn dữ liệu',
          description: 'Dự thảo và xin chữ ký Sở Y Tế.',
          priority: 'URGENT',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          assigneeCode: 'E003',
        },
      ],
    };

    return {
      success: true,
      data: mockPlan,
      message: 'AI đã phân tích và đề xuất thành công',
    };
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    body.createdByCode =
      req.user?.employeeCode || req.user?.username || 'system';
    if (req.user?.unitId) {
      body.departmentId = parseInt(req.user.unitId, 10);
    }
    return firstValueFrom(this.masterPlanService.Create(body));
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    body.updatedByCode =
      req.user?.employeeCode || req.user?.username || 'system';
    return firstValueFrom(
      this.masterPlanService.Update({ id: parseInt(id, 10), ...body }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.masterPlanService.Delete({ id: parseInt(id, 10) }),
    );
  }
}
