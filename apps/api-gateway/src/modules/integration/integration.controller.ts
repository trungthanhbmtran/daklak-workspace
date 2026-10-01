import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Inject } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Controller('admin/integration-upstreams')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class IntegrationController {
  private grpcService: any;

  constructor(
    private readonly registryService: RegistryService,
    @Inject(MICROSERVICES.INTEGRATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.grpcService = this.client.getService(MICROSERVICES.INTEGRATION.SERVICE);
  }

  @Get('status')
  async getStatus() {
    return {
      success: true,
      ready: this.registryService.checkReady(),
    };
  }

  @Post()
  @RequirePermissions('INTEGRATION:MANAGE')
  async create(@Body() dto: any, @Req() req: any) {
    const payload = { ...dto, callerUserId: req.user.id.toString() };
    const res = await firstValueFrom(this.grpcService.CreateUpstream(payload));
    return { success: true, data: res };
  }

  @Get()
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getAll() {
    const res = (await firstValueFrom(this.grpcService.GetAllUpstreams({}))) as any;
    return { success: true, data: res.data || [] };
  }

  @Get(':id')
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getById(@Param('id') id: string) {
    const res = await firstValueFrom(this.grpcService.GetUpstreamById({ id }));
    return { success: true, data: res };
  }

  @Put(':id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async update(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const payload = { id, data: dto, callerUserId: req.user.id.toString() };
    const res = await firstValueFrom(this.grpcService.UpdateUpstream(payload));
    return { success: true, data: res };
  }

  @Delete(':id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async delete(@Param('id') id: string, @Req() req: any) {
    const payload = { id, callerUserId: req.user.id.toString() };
    const res = await firstValueFrom(this.grpcService.DeleteUpstream(payload));
    return { success: true, data: res };
  }
}
