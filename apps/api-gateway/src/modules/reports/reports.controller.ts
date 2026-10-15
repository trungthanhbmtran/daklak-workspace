import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { ReportsService } from './reports.service';
import { ReportSourceService } from './report-source.service';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly sources: ReportSourceService,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getDelegationToken(req: any) {
    if (!req?.user) return req?.headers?.authorization || '';
    return (
      'Bearer ' +
      this.issuer.signDelegation(req.user, {
        requestId: randomUUID(),
        ipAddress: clientIp(req),
      })
    );
  }

  @Post('table/sources')
  @RequirePermissions(
    'INTEGRATION:VIEW',
    'INTEGRATION:READ',
    'INTEGRATION:MANAGE',
    'REPORT:VIEW',
    'REPORT:READ',
    'REPORT:MANAGE',
  )
  tableSources(@Req() req: any) {
    return { data: this.sources.list(req.user) };
  }

  @Post('table/preview')
  @RequirePermissions(
    'INTEGRATION:VIEW',
    'INTEGRATION:READ',
    'INTEGRATION:MANAGE',
    'REPORT:VIEW',
    'REPORT:READ',
    'REPORT:MANAGE',
  )
  async previewTable(
    @Body() body: { source?: unknown; config?: unknown },
    @Req() req: any,
  ) {
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
  async getTemplateById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reportsService.getTemplateById(String(id), req.query);
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reportsService.updateTemplate(String(id), body);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.deleteTemplate(String(id));
  }

  @Get('templates/:id/assignments')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getReportAssignments(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.reportsService.getReportAssignments(
      id,
      req.user,
      req.headers.authorization,
    );
  }

  @Post('templates/:id/assignments')
  @RequirePermissions('REPORT:MANAGE')
  async assignReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.reportsService.assignReport(
      { templateId: id, ...body },
      req.user,
      req.headers.authorization,
    );
  }

  @Delete('templates/:id/assignments')
  @RequirePermissions('REPORT:MANAGE')
  async unassignReport(
    @Param('id', ParseIntPipe) id: number,
    @Query('assigneeType') assigneeType: string,
    @Query('assigneeId') assigneeId: string,
    @Req() req: any,
  ) {
    return this.reportsService.unassignReport(
      { templateId: id, assigneeType, assigneeId },
      req.user,
      req.headers.authorization,
    );
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

  @Get('employee-quality')
  async getEmployeeQualityReport(@Req() req: any) {
    return this.reportsService.getEmployeeQualityReport(
      req.query,
      req.user,
      req.headers.authorization,
    );
  }

  // --- V2 Dynamic Report Designer ---

  @Post('definitions')
  @RequirePermissions('REPORT:MANAGE')
  async createReportDefinition(@Body() body: any, @Req() req: any) {
    return this.reportsService.createReportDefinition(
      body,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('definitions')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getReportDefinitions(@Req() req: any) {
    return this.reportsService.getReportDefinitions(
      req.query,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('catalog')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getReportCatalog(@Req() req: any) {
    return this.reportsService.getReportCatalog(
      req.user,
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
  }

  @Get('definitions/:id')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getReportDefinitionById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.reportsService.getReportDefinitionById(
      id,
      req.user,
      req.headers.authorization,
    );
  }

  @Post('runs')
  @RequirePermissions(
    'REPORT:EXECUTE',
    'REPORT:CREATE',
    'REPORT:VIEW',
    'REPORT:READ',
    'REPORT:MANAGE',
  )
  async runReport(@Body() body: any, @Req() req: any) {
    return this.reportsService.runReport(
      body,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('runs/:id/status')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getReportRunStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.reportsService.getReportRunStatus(
      id,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('runs/:runId/snapshot')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getDatasetSnapshot(
    @Param('runId', ParseIntPipe) runId: number,
    @Req() req: any,
  ) {
    return this.reportsService.getDatasetSnapshot(
      runId,
      req.query,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('dashboard-stats')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async getReportDashboardStats(@Req() req: any) {
    return this.reportsService.getReportDashboardStats(
      req.user,
      req.headers.authorization,
    );
  }

  @Post('document/generate')
  async generateDocument(@Body() body: any, @Req() req: any) {
    return this.reportsService.generateDocument(
      body,
      req.user,
      req.headers.authorization,
    );
  }

  @Get('runs/:runId/export')
  @RequirePermissions('REPORT:VIEW', 'REPORT:READ', 'REPORT:MANAGE')
  async exportReportRun(
    @Param('runId', ParseIntPipe) runId: number,
    @Query() query: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const rawResult: any = await this.reportsService.exportReportRun(
      runId,
      query,
      req.user,
      req.headers.authorization,
    );

    const result =
      typeof rawResult === 'string'
        ? JSON.parse(rawResult)
        : rawResult?.data
        ? typeof rawResult.data === 'string'
          ? JSON.parse(rawResult.data)
          : rawResult.data
        : rawResult;

    const format = String(query.format || result?.format || 'excel').toLowerCase();
    const isDoc = ['html', 'pdf', 'decision', 'decision_html', 'mau05'].includes(format);
    const fileName =
      result?.fileName ||
      `Bao_Cao_${runId}.${isDoc ? 'html' : 'csv'}`;
    const base64Content = result?.base64Content;

    if (!base64Content) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Không tìm thấy nội dung xuất dữ liệu báo cáo',
      });
    }

    const buffer = Buffer.from(base64Content, 'base64');

    if (isDoc) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      return res.send(buffer);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.send(buffer);
  }
}
