import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { ReportsService } from './reports.service';
import { ReportSourceService } from './report-source.service';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService, private readonly sources: ReportSourceService) {}

  @Post('table/sources')
  @RequirePermissions('INTEGRATION:READ', 'INTEGRATION:MANAGE')
  tableSources(@Req() req: any) {
    return { success: true, data: this.sources.list(req.user) };
  }

  @Post('table/preview')
  @RequirePermissions('INTEGRATION:READ', 'INTEGRATION:MANAGE')
  async previewTable(@Body() body: { source?: unknown; config?: unknown }, @Req() req: any) {
    const data = await this.sources.fetch(body?.source, req.user);
    return this.reportsService.executeTable(data, body?.config, req.user);
  }

  @Post('templates')
  async createTemplate(@Body() body: any) {
    return this.reportsService.createTemplate(body);
  }

  @Get('templates')
  async getAllTemplates(@Req() req: any) {
    return this.reportsService.getAllTemplates(req.query);
  }

  @Get('templates/widgets')
  async getAllWidgets(@Req() req: any) {
    return this.reportsService.getAllWidgets(req.query);
  }

  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string, @Req() req: any) {
    return this.reportsService.getTemplateById(id, req.query);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    return this.reportsService.updateTemplate(id, body);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.reportsService.deleteTemplate(id);
  }

  @Get('tasks')
  async getTaskStats(@Req() req: any) {
    return this.reportsService.getTaskStats(
      req.query,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('posts')
  async getPostStats(@Req() req: any) {
    return this.reportsService.getPostStats(
      req.query,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('kpis')
  async getKpiStats(@Req() req: any) {
    return this.reportsService.getKpiStats(
      req.query,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('documents')
  async getDocumentStats(@Req() req: any) {
    return this.reportsService.getDocumentStats(
      req.query,
      req.user,
      req.headers.authorization,
    );
  }
}

