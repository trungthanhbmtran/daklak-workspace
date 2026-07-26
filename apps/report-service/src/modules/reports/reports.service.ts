import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReportsService implements OnModuleInit {
  private orgGrpcService: any;

  constructor(@Inject('USER_SERVICE') private client: ClientGrpc) {}

  onModuleInit() {
    this.orgGrpcService = this.client.getService<any>('OrganizationService');
  }

  async getStaffingReport(unitId: number) {
    // Gọi user-service để lấy data
    const res = (await firstValueFrom(
      this.orgGrpcService.GetStaffingReport({ unitId }),
    )) as any;

    // Xử lý, tổng hợp hoặc cache dữ liệu ở đây (theo chuẩn heavy_task nếu cần)
    return {
      success: true,
      data: res.data || [],
      message: 'Báo cáo định biên nhân sự',
    };
  }
}
