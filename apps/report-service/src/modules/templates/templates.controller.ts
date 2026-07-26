import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TemplatesService } from './templates.service';

@Controller('reports/templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) { }

  @Post()
  async createTemplate(@Body() body: any) {
    return this.templatesService.createTemplate(body);
  }

  @Get()
  async getAllTemplates() {
    return this.templatesService.getAllTemplates();
  }

  @Get(':id')
  async getTemplateById(@Param('id') id: string) {
    return this.templatesService.getTemplateById(+id);
  }

  @Put(':id')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    return this.templatesService.updateTemplate(+id, body);
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templatesService.deleteTemplate(+id);
  }
}
