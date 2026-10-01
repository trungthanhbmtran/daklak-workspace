import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { IntegrationConfigService } from './integration-config.service';
import { CreateUpstreamDto, UpdateUpstreamDto } from './dto/upstream.dto';
// NOTE: Assuming there's a global/shared AuthGuard in user-service, we might mock it here
// import { AuthGuard } from '@/common/guards/auth.guard'; 

@Controller('admin/integration-upstreams')
// @UseGuards(AuthGuard) // To be integrated with existing guards (requires role admin)
export class IntegrationConfigController {
  constructor(private readonly service: IntegrationConfigService) {}

  @Post()
  async create(@Body() dto: CreateUpstreamDto, @Req() req: any) {
    const userId = req.user?.id || 'system-admin'; // Fallback for dev
    return this.service.createUpstream(dto, userId);
  }

  @Get()
  async getAll() {
    return this.service.getAllUpstreams();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getUpstreamById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUpstreamDto, @Req() req: any) {
    const userId = req.user?.id || 'system-admin';
    return this.service.updateUpstream(id, dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || 'system-admin';
    return this.service.deleteUpstream(id, userId);
  }
}
