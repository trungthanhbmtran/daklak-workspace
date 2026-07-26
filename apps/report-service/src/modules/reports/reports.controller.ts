import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @GrpcMethod('ReportService', 'GetStaffingReport')
  async getStaffingReport(data: { unitId: number }) {
    return this.reportsService.getStaffingReport(data.unitId);
  }
}
