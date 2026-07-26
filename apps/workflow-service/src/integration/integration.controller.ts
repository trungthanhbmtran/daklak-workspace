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

// Parse JSON field an toàn
const parseJsonField = (val: any): any => {
  if (!val) return null;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return null; }
  }
  return val;
};

// Map gRPC request (strings) sang Prisma DTO (objects)
const mapToPrisma = (payload: any) => {
  return {
    ...payload,
    authConfig: parseJsonField(payload.authConfig) ?? {},
    headers: parseJsonField(payload.headers) ?? {},
    metadata: parseJsonField(payload.metadata) ?? {},
  };
};

// Map Prisma record sang gRPC-safe response (với authConfig, headers, metadata là string)
const mapIntegrationResponse = (data: any) => {
  if (!data) return null;
  const parsedEndpoints = parseJsonField(data.endpoints) ?? [];
  return {
    ...data,
    authConfig: JSON.stringify(parseJsonField(data.authConfig) ?? {}),
    headers: JSON.stringify(parseJsonField(data.headers) ?? {}),
    endpoints: parsedEndpoints, // endpoints vẫn là repeated message
    metadata: JSON.stringify(parseJsonField(data.metadata) ?? {}),
    createdAt: data.createdAt?.toISOString?.() ?? data.createdAt ?? '',
    updatedAt: data.updatedAt?.toISOString?.() ?? data.updatedAt ?? '',
  };
};

@Controller('workflow/integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) { }

  // ==========================================
  // HTTP REST ENDPOINTS
  // ==========================================

  @Post()
  async createRest(@Body() createDto: CreateIntegrationDto) {
    const data = await this.integrationService.create(createDto);
    return { success: true, data: mapIntegrationResponse(data) || {}, meta: {}, message: 'Created successfully' };
  }

  @Get()
  async findAllRest(@Query('search') search?: string) {
    const data = await this.integrationService.findAll(search);
    return { success: true, data: data.map(mapIntegrationResponse), meta: {}, message: 'OK' };
  }

  @Get(':id')
  async findOneRest(@Param('id') id: string) {
    const data = await this.integrationService.findOne(id);
    return { success: true, data: mapIntegrationResponse(data) || {}, meta: {}, message: 'OK' };
  }

  @Put(':id')
  async updateRest(
    @Param('id') id: string,
    @Body() updateDto: UpdateIntegrationDto,
  ) {
    const data = await this.integrationService.update(id, updateDto);
    return { success: true, data: mapIntegrationResponse(data) || {}, meta: {}, message: 'Updated successfully' };
  }

  @Delete(':id')
  async removeRest(@Param('id') id: string) {
    await this.integrationService.remove(id);
    return { success: true, data: {}, meta: {}, message: 'Deleted successfully' };
  }

  // ==========================================
  // GRPC ENDPOINTS
  // ==========================================

  @GrpcMethod('WorkflowService', 'CreateIntegration')
  async createGrpc(@Payload() payload: CreateIntegrationDto) {
    const createData = mapToPrisma(payload);
    const data = await this.integrationService.create(createData);
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
    const updateData = mapToPrisma(updateDto);
    const data = await this.integrationService.update(id, updateData);
    return mapIntegrationResponse(data);
  }

  @GrpcMethod('WorkflowService', 'DeleteIntegration')
  async removeGrpc(@Payload() payload: { id: string }) {
    await this.integrationService.remove(payload.id);
    return { success: true, message: 'Deleted successfully' };
  }
}
