import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
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
  @RequirePermissions('API_GATEWAY:MANAGE', 'API_GATEWAY:READ')
  async getServices() {
    const data = await this.service.getServices();
    return { data };
  }

  @Post('services')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async createService(@Body() dto: any) {
    const data = await this.service.createService(dto);
    return { data };
  }

  @Put('services/:id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async updateService(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.updateService(id, dto);
    return { data };
  }

  @Delete('services/:id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async deleteService(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteService(id);
    return { };
  }

  // Routes
  @Get('routes')
  @RequirePermissions('API_GATEWAY:MANAGE', 'API_GATEWAY:READ')
  async getRoutes() {
    const data = await this.service.getRoutes();
    return { data };
  }

  @Post('routes')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async createRoute(@Body() dto: any) {
    const data = await this.service.createRoute(dto);
    return { data };
  }

  @Put('routes/:id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async updateRoute(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.updateRoute(id, dto);
    return { data };
  }

  @Delete('routes/:id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async deleteRoute(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteRoute(id);
    return { };
  }

  // ApiKeys
  @Get('apikeys')
  @RequirePermissions('API_GATEWAY:MANAGE', 'API_GATEWAY:READ')
  async getApiKeys() {
    const data = await this.service.getApiKeys();
    return { data };
  }

  @Post('apikeys')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async createApiKey(@Body() dto: any) {
    const data = await this.service.createApiKey(dto);
    return { data };
  }

  @Put('apikeys/:id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async updateApiKey(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    const data = await this.service.updateApiKey(id, dto);
    return { data };
  }

  @Delete('apikeys/:id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async deleteApiKey(@Param('id', ParseIntPipe) id: number) {
    await this.service.deleteApiKey(id);
    return { };
  }

  // Settings
  @Get('settings')
  @RequirePermissions('API_GATEWAY:MANAGE', 'API_GATEWAY:READ')
  async getSettings() {
    const data = await this.service.getSettings();
    return { data };
  }

  @Put('settings')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async updateSettings(@Body() dto: any) {
    const data = await this.service.updateSettings(dto);
    return { data };
  }
}
