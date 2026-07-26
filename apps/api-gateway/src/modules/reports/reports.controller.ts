import { Controller, Get, Post, Body, Param, Put, Delete, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_REST_URL || 'http://report-service:3011';

@Controller('reports')
export class ReportsController {
  constructor(private readonly httpService: HttpService) {}

  private getForwardingConfig(req: any) {
    // Truyền JWT token và các thông tin user cơ bản qua header để report-service tự xử lý hoặc decode
    const headers: any = {};
    if (req.headers.authorization) {
      headers['authorization'] = req.headers.authorization;
    }
    // Gói gọn các thông tin phân quyền vào 1 header tuỳ chỉnh
    if (req.user) {
      headers['x-user-data'] = JSON.stringify(req.user);
    }
    return { headers };
  }

  @Post('templates')
  async createTemplate(@Body() body: any, @Req() req: any) {
    const res = await firstValueFrom(this.httpService.post(`${REPORT_SERVICE_URL}/reports/templates`, body, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Get('templates')
  async getAllTemplates(@Req() req: any) {
    const res = await firstValueFrom(this.httpService.get(`${REPORT_SERVICE_URL}/reports/templates`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string, @Req() req: any) {
    const res = await firstValueFrom(this.httpService.get(`${REPORT_SERVICE_URL}/reports/templates/${id}`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const res = await firstValueFrom(this.httpService.put(`${REPORT_SERVICE_URL}/reports/templates/${id}`, body, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string, @Req() req: any) {
    const res = await firstValueFrom(this.httpService.delete(`${REPORT_SERVICE_URL}/reports/templates/${id}`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Get('tasks')
  async getTaskStats(@Req() req: any) {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const res = await firstValueFrom(this.httpService.get(`${REPORT_SERVICE_URL}/tasks${queryString}`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Get('posts')
  async getPostStats(@Req() req: any) {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const res = await firstValueFrom(this.httpService.get(`${REPORT_SERVICE_URL}/posts${queryString}`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Get('kpis')
  async getKpiStats(@Req() req: any) {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const res = await firstValueFrom(this.httpService.get(`${REPORT_SERVICE_URL}/kpis${queryString}`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }

  @Get('documents')
  async getDocumentStats(@Req() req: any) {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const res = await firstValueFrom(this.httpService.get(`${REPORT_SERVICE_URL}/documents${queryString}`, this.getForwardingConfig(req)));
    return { success: true, data: res.data };
  }
}
