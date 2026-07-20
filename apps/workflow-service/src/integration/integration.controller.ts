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

@Controller('workflow/integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  @GrpcMethod('WorkflowService', 'CreateIntegration')
  async create(@Body() createDto: CreateIntegrationDto) {
    const data = await this.integrationService.create(createDto);
    // Return gRPC format (IntegrationResponse) when called via gRPC,
    // or REST format when called via HTTP.
    return {
      ...data,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    };
  }

  @Get()
  @GrpcMethod('WorkflowService', 'FindAllIntegrations')
  async findAll(
    @Query('search') search?: string,
    @Payload() payload?: { search?: string },
  ) {
    const searchTerm = payload?.search || search;
    const data = await this.integrationService.findAll(searchTerm);
    return {
      items: data.map((d) => ({
        ...d,
        createdAt: d.createdAt?.toISOString(),
        updatedAt: d.updatedAt?.toISOString(),
      })),
    };
  }

  @Get(':id')
  @GrpcMethod('WorkflowService', 'FindOneIntegration')
  async findOne(@Param('id') id: string | { id: string }) {
    const actualId = typeof id === 'object' ? id.id : id;
    const data = await this.integrationService.findOne(actualId);
    return {
      ...data,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    };
  }

  @Put(':id')
  @GrpcMethod('WorkflowService', 'UpdateIntegration')
  async update(
    @Param('id') id: string | { id: string },
    @Body() updateDto: UpdateIntegrationDto,
  ) {
    // If called via gRPC, payload contains both id and fields in updateDto
    const actualId = typeof id === 'object' ? id.id : id;
    const data = await this.integrationService.update(actualId, updateDto);
    return {
      ...data,
      createdAt: data.createdAt?.toISOString(),
      updatedAt: data.updatedAt?.toISOString(),
    };
  }

  @Delete(':id')
  @GrpcMethod('WorkflowService', 'DeleteIntegration')
  async remove(@Param('id') id: string | { id: string }) {
    const actualId = typeof id === 'object' ? id.id : id;
    await this.integrationService.remove(actualId);
    return { success: true, message: 'Deleted successfully' };
  }
}
