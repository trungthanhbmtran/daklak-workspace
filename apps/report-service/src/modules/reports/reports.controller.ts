import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { executeTable } from './table-engine';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @GrpcMethod('ReportService', 'ExecuteTable')
  executeTable(data: { payload: string }) {
    try {
      const body = JSON.parse(data.payload) as {
        data: unknown;
        config: unknown;
      };
      return {
        success: true,
        data: JSON.stringify(executeTable(body.data, body.config)),
      };
    } catch (error) {
      throw new RpcException({
        code: 3,
        message:
          error instanceof Error ? error.message : 'Cấu hình bảng không hợp lệ',
      });
    }
  }



  // --- V2: Dynamic Report Designer ---

  @GrpcMethod('ReportService', 'CreateReportDefinition')
  async createReportDefinition(data: { payload: string; userData: string }) {
    return this.reportsService.createReportDefinition(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'GetReportDefinitions')
  async getReportDefinitions(data: { payload: string; userData: string }) {
    return this.reportsService.getReportDefinitions(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'GetReportDefinitionById')
  async getReportDefinitionById(data: { payload: string; userData: string }) {
    return this.reportsService.getReportDefinitionById(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'GetReportCatalog')
  async getReportCatalog(data: { payload: string; userData: string }) {
    return this.reportsService.getReportCatalog(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'RunReport')
  async runReport(data: { payload: string; userData: string }) {
    return this.reportsService.runReport(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'GetReportRunStatus')
  async getReportRunStatus(data: { payload: string; userData: string }) {
    return this.reportsService.getReportRunStatus(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'GetDatasetSnapshot')
  async getDatasetSnapshot(data: { payload: string; userData: string }) {
    return this.reportsService.getDatasetSnapshot(data.payload, data.userData);
  }

  @GrpcMethod('ReportService', 'GetReportDashboardStats')
  async getReportDashboardStats(data: { payload: string; userData: string }) {
    return this.reportsService.getReportDashboardStats(data.payload, data.userData);
  }
}
