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

@ApiTags('HRM - Master Plans')
@ApiBearerAuth('JWT-auth')
@Controller('admin/hrm/master-plans')
@UseGuards(JwtAuthGuard)
export class MasterPlansController implements OnModuleInit {
  private masterPlanService: any;

  constructor(@Inject('MASTER_PLAN_PACKAGE') private client: any) {}

  onModuleInit() {
    this.masterPlanService = this.client.getService('MasterPlanService');
  }

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return firstValueFrom(this.masterPlanService.FindAll({ type, status }));
  }

  @Get('advanced/historical-feasibility')
  async getHistoricalFeasibility(
    @Query('type') type: string,
    @Query('title') title: string,
    @Query('durationDays') durationDays: string,
  ) {
    const data = (await firstValueFrom(
      this.masterPlanService.GetHistoricalFeasibility({
        type,
        title,
        durationDays: parseInt(durationDays || '0', 10),
      }),
    )) as any;
    return data;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = (await firstValueFrom(
      this.masterPlanService.FindById({ id: parseInt(id, 10) }),
    )) as any;
    return { status: 'success', data };
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
      status: 'success',
      data: mockPlan,
      message: 'AI đã phân tích và đề xuất thành công',
    };
  }

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    // Inject mã người tạo từ JWT token
    body.createdByCode = req.user?.employeeCode || req.user?.username || 'system';
    const data = (await firstValueFrom(
      this.masterPlanService.Create(body),
    )) as any;
    return { status: 'success', data, message: 'Tạo Kế hoạch thành công' };
  }

  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    // Inject mã người cập nhật từ JWT token
    body.updatedByCode = req.user?.employeeCode || req.user?.username || 'system';
    const data = (await firstValueFrom(
      this.masterPlanService.Update({ id: parseInt(id, 10), ...body }),
    )) as any;
    return { status: 'success', data, message: 'Cập nhật Kế hoạch thành công' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = (await firstValueFrom(
      this.masterPlanService.Delete({ id: parseInt(id, 10) }),
    )) as any;
    return { status: 'success', data, message: 'Xóa Kế hoạch thành công' };
  }
}
