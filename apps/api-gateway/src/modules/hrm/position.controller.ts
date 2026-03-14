import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit, ParseIntPipe, NotFoundException, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('HRM')
@Controller('admin/hrm/positions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PositionController implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.orgService = this.client.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách định biên theo đơn vị (user-service GetStaffingReport)' })
  async list(@Query() query: any) {
    const departmentId = query.departmentId ?? query.department_id;
    const unitId = departmentId != null ? parseInt(String(departmentId), 10) : undefined;
    if (unitId == null || Number.isNaN(unitId)) {
      return { data: [], items: [] };
    }
    const res = await firstValueFrom(this.orgService.GetStaffingReport({ unitId }));
    const items = (res as any).items ?? [];
    return { data: items, items };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một định biên (tìm trong báo cáo đơn vị)' })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    // GetStaffingReport trả theo unitId; không có GetPosition(id). Trả 404 hoặc cần gọi report cho mọi unit.
    throw new NotFoundException('Lấy định biên theo id không được hỗ trợ; dùng GET /admin/hrm/positions?departmentId=<unitId>');
  }

  @Post()
  @ApiOperation({ summary: 'Thiết lập định biên (user-service SetStaffing)' })
  async create(@Body() body: any) {
    const unitId = body.unitId ?? body.unit_id ?? body.departmentId ?? body.department_id;
    const jobTitleId = body.jobTitleId ?? body.job_title_id;
    const quantity = body.quantity ?? body.quota ?? 1;
    if (!unitId || !jobTitleId) {
      throw new NotFoundException('unitId và jobTitleId là bắt buộc');
    }
    return firstValueFrom(
      this.orgService.SetStaffing({
        unitId: parseInt(String(unitId), 10),
        jobTitleId: parseInt(String(jobTitleId), 10),
        quantity: parseInt(String(quantity), 10) || 1,
      }),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định biên (user-service SetStaffing với unitId/jobTitleId từ body)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const unitId = body.unitId ?? body.unit_id ?? body.departmentId;
    const jobTitleId = body.jobTitleId ?? body.job_title_id;
    const quantity = body.quantity ?? body.quota;
    if (unitId == null || jobTitleId == null) {
      throw new NotFoundException('unitId và jobTitleId là bắt buộc để cập nhật định biên');
    }
    return firstValueFrom(
      this.orgService.SetStaffing({
        unitId: parseInt(String(unitId), 10),
        jobTitleId: parseInt(String(jobTitleId), 10),
        quantity: parseInt(String(quantity), 10) || 1,
      }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa định biên: chưa hỗ trợ; dùng organizations/staffing hoặc set quantity = 0' })
  async delete() {
    throw new NotImplementedException('Xóa định biên: dùng API admin/organizations/staffing hoặc set quantity = 0');
  }
}
