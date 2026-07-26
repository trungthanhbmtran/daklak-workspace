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

// Map response sang định dạng gRPC an toàn (biến object thành chuỗi JSON cho authConfig, headers, metadata)
const mapToGrpc = (data: any) => {
  if (!data) return null;
  return {
    ...data,
    authConfig: JSON.stringify(data.authConfig ?? {}),
    headers: JSON.stringify(data.headers ?? {}),
    metadata: JSON.stringify(data.metadata ?? {}),
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
    return this.integrationService.create(createDto);
  }

  @Get()
  async findAllRest(@Query('search') search?: string) {
    // Interceptor tự động bọc response thành { success: true, data: [...] }
    return this.integrationService.findAll(search);
  }

  @Get(':id')
  async findOneRest(@Param('id') id: string) {
    return this.integrationService.findOne(id);
  }

  @Put(':id')
  async updateRest(
    @Param('id') id: string,
    @Body() updateDto: UpdateIntegrationDto,
  ) {
    return this.integrationService.update(id, updateDto);
  }

  @Delete(':id')
  async removeRest(@Param('id') id: string) {
    await this.integrationService.remove(id);
    return {};
  }

  // ==========================================
  // GRPC ENDPOINTS
  // ==========================================

  @GrpcMethod('WorkflowService', 'CreateIntegration')
  async createGrpc(@Payload() payload: CreateIntegrationDto) {
    const data = await this.integrationService.create(payload);
    return mapToGrpc(data);
  }

  @GrpcMethod('WorkflowService', 'FindAllIntegrations')
  async findAllGrpc(@Payload() payload: { search?: string }) {
    const data = await this.integrationService.findAll(payload.search);
    return { data: data.map(mapToGrpc) };
  }

  @GrpcMethod('WorkflowService', 'FindOneIntegration')
  async findOneGrpc(@Payload() payload: { id: string }) {
    const data = await this.integrationService.findOne(payload.id);
    return mapToGrpc(data);
  }

  @GrpcMethod('WorkflowService', 'UpdateIntegration')
  async updateGrpc(@Payload() payload: UpdateIntegrationDto & { id: string }) {
    const { id, ...updateDto } = payload;
    const data = await this.integrationService.update(id, updateDto);
    return mapToGrpc(data);
  }

  @GrpcMethod('WorkflowService', 'DeleteIntegration')
  async removeGrpc(@Payload() payload: { id: string }) {
    await this.integrationService.remove(payload.id);
    return { success: true, message: 'Deleted successfully' };
  }
}
