import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { GatewayConfigService } from './gateway.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

// Note: The path remains 'admin/integration' because the frontend calls /integration/apikeys, 
// but it is now correctly grouped in the Gateway domain.
@Controller('admin/integration') 
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GatewayConfigController {
  constructor(private readonly service: GatewayConfigService) {}

  // Services
  @Get('services')
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getServices() {
    const data = await this.service.getServices();
    return { data };
  }

  @Post('services')
  @RequirePermissions('INTEGRATION:MANAGE')
  async createService(@Body() dto: any) {
    const data = await this.service.createService(dto);
    return { data };
  }

  @Put('services/:id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async updateService(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.updateService(id, dto);
    return { data };
  }

  @Delete('services/:id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async deleteService(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteService(id);
    return { success: true };
  }

  // Routes
  @Get('routes')
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getRoutes() {
    const data = await this.service.getRoutes();
    return { data };
  }

  @Post('routes')
  @RequirePermissions('INTEGRATION:MANAGE')
  async createRoute(@Body() dto: any) {
    const data = await this.service.createRoute(dto);
    return { data };
  }

  @Put('routes/:id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async updateRoute(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.updateRoute(id, dto);
    return { data };
  }

  @Delete('routes/:id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async deleteRoute(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteRoute(id);
    return { success: true };
  }

  // ApiKeys
  @Get('apikeys')
  @RequirePermissions('INTEGRATION:MANAGE', 'INTEGRATION:READ')
  async getApiKeys() {
    const data = await this.service.getApiKeys();
    return { data };
  }

  @Post('apikeys')
  @RequirePermissions('INTEGRATION:MANAGE')
  async createApiKey(@Body() dto: any) {
    const data = await this.service.createApiKey(dto);
    return { data };
  }

  @Put('apikeys/:id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async updateApiKey(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.updateApiKey(id, dto);
    return { data };
  }

  @Delete('apikeys/:id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async deleteApiKey(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteApiKey(id);
    return { success: true };
  }
}
