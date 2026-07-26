import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TemplatesService } from './templates.service';

@Controller()
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) { }

  @GrpcMethod('ReportService', 'CreateTemplate')
  async createTemplate(data: { payload: string }) {
    const body = data.payload ? JSON.parse(data.payload) : {};
    const res = await this.templatesService.createTemplate(body);
    return { success: true, data: JSON.stringify(res) };
  }

  @GrpcMethod('ReportService', 'GetAllTemplates')
  async getAllTemplates() {
    const res = await this.templatesService.getAllTemplates();
    return { success: true, data: JSON.stringify(res) };
  }

  @GrpcMethod('ReportService', 'GetAllWidgets')
  async getAllWidgets() {
    const res = await this.templatesService.getAllWidgets();
    return { success: true, data: JSON.stringify(res) };
  }

  @GrpcMethod('ReportService', 'GetTemplateById')
  async getTemplateById(data: { payload: string }) {
    const body = data.payload ? JSON.parse(data.payload) : {};
    const res = await this.templatesService.getTemplateById(+body.id);
    return { success: true, data: JSON.stringify(res) };
  }

  @GrpcMethod('ReportService', 'UpdateTemplate')
  async updateTemplate(data: { payload: string }) {
    const body = data.payload ? JSON.parse(data.payload) : {};
    const id = body.id;
    delete body.id;
    const res = await this.templatesService.updateTemplate(+id, body);
    return { success: true, data: JSON.stringify(res) };
  }

  @GrpcMethod('ReportService', 'DeleteTemplate')
  async deleteTemplate(data: { payload: string }) {
    const body = data.payload ? JSON.parse(data.payload) : {};
    const res = await this.templatesService.deleteTemplate(+body.id);
    return { success: true, data: JSON.stringify(res) };
  }
}
