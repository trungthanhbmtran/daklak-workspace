import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { IntegrationService } from './integration.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

// Helper for mapping to Response DTO format (as per standard)
const mapIntegrationResponse = (data: any) => {
  if (!data) return null;
  return {
    ...data,
    createdAt: data.createdAt?.toISOString(),
    updatedAt: data.updatedAt?.toISOString(),
  };
};

@Controller('workflow/integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  // ==========================================
  // HTTP REST ENDPOINTS
  // ==========================================

  @Post()
  async createRest(@Body() createDto: CreateIntegrationDto) {
    const data = await this.integrationService.create(createDto);
    return mapIntegrationResponse(data);
  }

  @Get()
  async findAllRest(@Query('search') search?: string) {
    const data = await this.integrationService.findAll(search);
    return { data: data.map(mapIntegrationResponse) };
  }

  @Get(':id')
  async findOneRest(@Param('id') id: string) {
    const data = await this.integrationService.findOne(id);
    return mapIntegrationResponse(data);
  }

  @Put(':id')
  async updateRest(
    @Param('id') id: string,
    @Body() updateDto: UpdateIntegrationDto,
  ) {
    const data = await this.integrationService.update(id, updateDto);
    return mapIntegrationResponse(data);
  }

  @Delete(':id')
  async removeRest(@Param('id') id: string) {
    await this.integrationService.remove(id);
    return { success: true, message: 'Deleted successfully' };
  }

  // ==========================================
  // GRPC ENDPOINTS
  // ==========================================

  @GrpcMethod('WorkflowService', 'CreateIntegration')
  async createGrpc(@Payload() payload: CreateIntegrationDto) {
    const data = await this.integrationService.create(payload);
    return mapIntegrationResponse(data);
  }

  @GrpcMethod('WorkflowService', 'FindAllIntegrations')
  async findAllGrpc(@Payload() payload: { search?: string }) {
    const data = await this.integrationService.findAll(payload.search);
    return { data: data.map(mapIntegrationResponse) };
  }

  @GrpcMethod('WorkflowService', 'FindOneIntegration')
  async findOneGrpc(@Payload() payload: { id: string }) {
    const data = await this.integrationService.findOne(payload.id);
    return mapIntegrationResponse(data);
  }

  @GrpcMethod('WorkflowService', 'UpdateIntegration')
  async updateGrpc(@Payload() payload: UpdateIntegrationDto & { id: string }) {
    const { id, ...updateDto } = payload;
    const data = await this.integrationService.update(id, updateDto);
    return mapIntegrationResponse(data);
  }

  @GrpcMethod('WorkflowService', 'DeleteIntegration')
  async removeGrpc(@Payload() payload: { id: string }) {
    await this.integrationService.remove(payload.id);
    return { success: true, message: 'Deleted successfully' };
  }
}
