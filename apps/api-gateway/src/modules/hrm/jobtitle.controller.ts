import { Controller, Get, Put, Body, Param, Query, Inject, UseGuards, OnModuleInit, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('HRM')
@Controller('admin/hrm/job-titles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class JobTitleController implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.orgService = this.client.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách chức danh (user-service, unitId tùy chọn)' })
  async list(@Query() query: any) {
    const unitId = query.unitId != null && query.unitId !== '' ? parseInt(query.unitId, 10) : undefined;
    const res = await firstValueFrom(this.orgService.ListJobTitles({ unitId: Number.isNaN(unitId as number) ? undefined : unitId }));
    const items = (res as any).items ?? [];
    return { data: items, items };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết chức danh (lấy từ danh sách user-service)' })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const res = await firstValueFrom(this.orgService.ListJobTitles({}));
    const items = (res as any).items ?? [];
    const found = items.find((j: any) => j.id === id);
    if (!found) throw new NotFoundException('Không tìm thấy chức danh');
    return found;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật chức danh (lĩnh vực, theo dõi đơn vị, khu vực - user-service)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const payload = {
      id,
      domainId: body.domainId,
      geographicAreaId: body.geographicAreaId,
      monitoredUnitIds: body.monitoredUnitIds ?? body.monitored_unit_ids,
    };
    return firstValueFrom(this.orgService.UpdateJobTitle(payload));
  }
}
