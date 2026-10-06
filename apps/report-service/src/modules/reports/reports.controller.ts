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

  @GrpcMethod('ReportService', 'GetStaffingReport')
  async getStaffingReport(data: { unitId: number }) {
    return this.reportsService.getStaffingReport(data.unitId);
  }

  @GrpcMethod('ReportService', 'GetEmployeeQualityReport')
  async getEmployeeQualityReport(data: { payload: string; userData: string }) {
    return this.reportsService.getEmployeeQualityReport(data.payload, data.userData);
  }

  // --- V2: Dynamic Report Designer ---

  @GrpcMethod('ReportService', 'CreateReportDefinition')
  async createReportDefinition(data: { payload: string; userData: string }) {
    return { success: true, data: '{}', message: 'Tạo cấu hình báo cáo thành công (skeleton)' };
  }

  @GrpcMethod('ReportService', 'GetReportDefinitions')
  async getReportDefinitions(data: { payload: string; userData: string }) {
    return { success: true, data: '[]', message: 'Lấy danh sách cấu hình báo cáo thành công' };
  }

  @GrpcMethod('ReportService', 'GetReportDefinitionById')
  async getReportDefinitionById(data: { payload: string; userData: string }) {
    return { success: true, data: '{}', message: 'Lấy chi tiết cấu hình báo cáo thành công' };
  }

  @GrpcMethod('ReportService', 'GetReportCatalog')
  async getReportCatalog(data: { payload: string; userData: string }) {
    const mockCatalog = [
      {
        endpoint: 'HRM_TASK_STATS',
        name: 'Thống kê nhiệm vụ',
        fields: ['taskId', 'employeeId', 'status', 'hours'],
      },
      {
        endpoint: 'DOC_STATS',
        name: 'Thống kê văn bản',
        fields: ['docId', 'departmentId', 'type', 'issueDate'],
      },
    ];
    return { success: true, data: JSON.stringify(mockCatalog), message: 'Lấy danh mục dữ liệu thành công' };
  }

  @GrpcMethod('ReportService', 'RunReport')
  async runReport(data: { payload: string; userData: string }) {
    // 1. Fetch ReportDefinition
    // 2. ReportCompiler.compile(config)
    // 3. Create ReportRun record as QUEUED / RUNNING
    // 4. SourceExecutor.executePlan() (sync/async)
    return { success: true, data: '{"runId": 1}', message: 'Đã đưa báo cáo vào hàng đợi chạy' };
  }

  @GrpcMethod('ReportService', 'GetReportRunStatus')
  async getReportRunStatus(data: { payload: string; userData: string }) {
    return { success: true, data: '{"status": "QUEUED"}', message: 'Lấy trạng thái chạy thành công' };
  }

  @GrpcMethod('ReportService', 'GetDatasetSnapshot')
  async getDatasetSnapshot(data: { payload: string; userData: string }) {
    return { success: true, data: '{"schema": [], "data": []}', message: 'Lấy dữ liệu kết quả thành công' };
  }
}
