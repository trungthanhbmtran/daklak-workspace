import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Prisma } from '@generated/client';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) { }

  @Get()
  getGatewayConfigs() {
    return this.gatewayService.getGatewayConfigs();
  }

  @Get(':id')
  getGatewayConfigById(@Param('id') id: string) {
    return this.gatewayService.getGatewayConfigById(id);
  }

  @Post()
  createGatewayConfig(@Body() data: Prisma.GatewayConfigCreateInput) {
    return this.gatewayService.createGatewayConfig(data);
  }

  @Patch(':id')
  updateGatewayConfig(@Param('id') id: string, @Body() data: Prisma.GatewayConfigUpdateInput) {
    return this.gatewayService.updateGatewayConfig(id, data);
  }

  @Delete(':id')
  deleteGatewayConfig(@Param('id') id: string) {
    return this.gatewayService.deleteGatewayConfig(id);
  }

  @Post(':id/routes')
  addRoute(@Param('id') id: string, @Body() data: Prisma.GatewayRouteCreateWithoutGatewayInput) {
    return this.gatewayService.addRoute(id, data);
  }

  @Patch('routes/:routeId')
  updateRoute(@Param('routeId') routeId: string, @Body() data: Prisma.GatewayRouteUpdateInput) {
    return this.gatewayService.updateRoute(routeId, data);
  }

  @Delete('routes/:routeId')
  deleteRoute(@Param('routeId') routeId: string) {
    return this.gatewayService.deleteRoute(routeId);
  }
}
