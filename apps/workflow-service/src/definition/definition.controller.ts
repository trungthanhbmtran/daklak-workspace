import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { DefinitionService, CreateDefinitionDto } from './definition.service';

@Controller('workflow/processes')
export class DefinitionController {
  constructor(private readonly definitionService: DefinitionService) {}

  @Post()
  async createProcess(@Body() dto: CreateDefinitionDto) {
    const result = await this.definitionService.createProcess(dto);
    return {
      success: true,
      data: result,
      message: 'Process definition created successfully',
    };
  }

  @Get()
  async findAll() {
    const data = await this.definitionService.getProcesses();
    return { success: true, data, message: 'OK' };
  }

  @Get(':code/graph')
  async getGraph(@Param('code') code: string) {
    const def = await this.definitionService.getDefinition(code);
    return {
      success: true,
      data: def.versions[0].graph,
      message: 'OK',
    };
  }
}
