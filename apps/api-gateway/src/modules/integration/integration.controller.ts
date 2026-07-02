import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Controller('admin/integration')
export class IntegrationController {
  constructor(private readonly prisma: PrismaService) { }

  @Get('services')
  async getServices() {
    const data = await this.prisma.gatewayService.findMany({ include: { routes: true } });
    return { success: true, data };
  }

  @Post('services')
  async createService(@Body() data: any) {
    const { name, url, description, isActive, loadBalanceStrategy, useSsl, ignoreTlsVerify } = data;
    const service = await this.prisma.gatewayService.create({
      data: {
        name,
        url,
        description,
        loadBalanceStrategy: loadBalanceStrategy ?? 'ROUND_ROBIN',
        useSsl: useSsl ?? false,
        ignoreTlsVerify: ignoreTlsVerify ?? true,
        isActive: isActive ?? true
      }
    });
    return { success: true, data: service };
  }

  @Put('services/:id')
  async updateService(@Param('id') id: string, @Body() data: any) {
    const { name, url, description, isActive, loadBalanceStrategy, useSsl, ignoreTlsVerify } = data;
    const service = await this.prisma.gatewayService.update({
      where: { id: parseInt(id) },
      data: {
        name,
        url,
        description,
        loadBalanceStrategy,
        useSsl,
        ignoreTlsVerify,
        isActive
      }
    });
    return { success: true, data: service };
  }

  @Delete('services/:id')
  async deleteService(@Param('id') id: string) {
    await this.prisma.gatewayService.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }

  @Get('routes')
  async getRoutes() {
    const data = await this.prisma.gatewayRoute.findMany({ include: { service: true } });
    return { success: true, data };
  }

  @Post('routes')
  async createRoute(@Body() data: any) {
    const { path, stripPath, serviceId, methods, isActive } = data;
    const route = await this.prisma.gatewayRoute.create({
      data: { path, stripPath, serviceId: parseInt(serviceId), methods, isActive: isActive ?? true }
    });
    return { success: true, data: route };
  }

  @Put('routes/:id')
  async updateRoute(@Param('id') id: string, @Body() data: any) {
    const { path, stripPath, serviceId, methods, isActive } = data;
    const route = await this.prisma.gatewayRoute.update({
      where: { id: parseInt(id) },
      data: { path, stripPath, serviceId: serviceId ? parseInt(serviceId) : undefined, methods, isActive }
    });
    return { success: true, data: route };
  }

  @Delete('routes/:id')
  async deleteRoute(@Param('id') id: string) {
    await this.prisma.gatewayRoute.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }

  @Get('apikeys')
  async getApiKeys() {
    const data = await this.prisma.apiKey.findMany();
    return { success: true, data };
  }

  @Post('apikeys')
  async createApiKey(@Body() data: any) {
    const crypto = require('crypto');
    const key = crypto.randomBytes(32).toString('hex');
    const { name, description, isActive } = data;
    const apikey = await this.prisma.apiKey.create({
      data: { name, description, isActive: isActive ?? true, key }
    });
    return { success: true, data: apikey };
  }

  @Put('apikeys/:id')
  async updateApiKey(@Param('id') id: string, @Body() data: any) {
    const { name, description, isActive } = data;
    const apikey = await this.prisma.apiKey.update({
      where: { id: parseInt(id) },
      data: { name, description, isActive }
    });
    return { success: true, data: apikey };
  }

  @Delete('apikeys/:id')
  async deleteApiKey(@Param('id') id: string) {
    await this.prisma.apiKey.delete({ where: { id: parseInt(id) } });
    return { success: true };
  }
}
