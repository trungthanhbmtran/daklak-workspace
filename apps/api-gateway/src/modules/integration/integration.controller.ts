import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Controller('admin/integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('services')
  async getServices() {
    return this.integrationService.getServices();
  }

  @Post('services')
  async createService(@Body() data: any) {
    return this.integrationService.createService(data);
  }

  @Put('services/:id')
  async updateService(@Param('id') id: string, @Body() data: any) {
    return this.integrationService.updateService(id, data);
  }

  @Delete('services/:id')
  async deleteService(@Param('id') id: string) {
    return this.integrationService.deleteService(id);
  }

  @Get('routes')
  async getRoutes() {
    return this.integrationService.getRoutes();
  }

  @Post('routes')
  async createRoute(@Body() data: any) {
    return this.integrationService.createRoute(data);
  }

  @Put('routes/:id')
  async updateRoute(@Param('id') id: string, @Body() data: any) {
    return this.integrationService.updateRoute(id, data);
  }

  @Delete('routes/:id')
  async deleteRoute(@Param('id') id: string) {
    return this.integrationService.deleteRoute(id);
  }

  @Get('apikeys')
  async getApiKeys() {
    return this.integrationService.getApiKeys();
  }

  @Post('apikeys')
  async createApiKey(@Body() data: any) {
    return this.integrationService.createApiKey(data);
  }

  @Put('apikeys/:id')
  async updateApiKey(@Param('id') id: string, @Body() data: any) {
    return this.integrationService.updateApiKey(id, data);
  }

  @Delete('apikeys/:id')
  async deleteApiKey(@Param('id') id: string) {
    return this.integrationService.deleteApiKey(id);
  }
}
