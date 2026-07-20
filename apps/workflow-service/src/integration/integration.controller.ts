import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Controller('workflow/integrations')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  async create(@Body() createDto: CreateIntegrationDto) {
    const data = await this.integrationService.create(createDto);
    return { success: true, data, message: 'Created successfully' };
  }

  @Get()
  async findAll() {
    const data = await this.integrationService.findAll();
    return { success: true, data, message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.integrationService.findOne(id);
    return { success: true, data, message: 'OK' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateIntegrationDto) {
    const data = await this.integrationService.update(id, updateDto);
    return { success: true, data, message: 'Updated successfully' };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.integrationService.remove(id);
    return { success: true, data, message: 'Deleted successfully' };
  }
}
