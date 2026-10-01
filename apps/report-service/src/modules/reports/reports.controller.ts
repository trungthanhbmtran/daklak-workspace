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
      const body = JSON.parse(data.payload) as { data: unknown; config: unknown };
      return { success: true, data: JSON.stringify(executeTable(body.data, body.config)) };
    } catch (error) {
      throw new RpcException({ code: 3, message: error instanceof Error ? error.message : 'Cấu hình bảng không hợp lệ' });
    }
  }

  @GrpcMethod('ReportService', 'GetStaffingReport')
  async getStaffingReport(data: { unitId: number }) {
    return this.reportsService.getStaffingReport(data.unitId);
  }
}

