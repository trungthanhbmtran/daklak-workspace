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

  async getEmployeeQualityReport(payloadStr: string, userDataStr: string) {
    // 1. Phân tích payload / userData
    // const payload = payloadStr ? JSON.parse(payloadStr) : {};
    
    // 2. [SOURCE A] Giả lập gọi gRPC sang Document Service (API Quản lý văn bản)
    // Thực tế sẽ dùng: const docs = await firstValueFrom(this.docGrpcService.GetEmployeeDocumentStats({}));
    const mockDocumentApiData = [
      { employeeCode: "NV001", documentProcessed: 120 },
      { employeeCode: "NV002", documentProcessed: 85 },
      { employeeCode: "NV003", documentProcessed: 150 },
    ];

    // 3. [SOURCE B] Giả lập gọi gRPC/DB sang HRM/Task Service (Database Quản lý công việc)
    // Thực tế sẽ dùng: const tasks = await firstValueFrom(this.taskGrpcService.GetEmployeeTaskStats({}));
    const mockTaskDbData = [
      { employeeCode: "NV001", fullName: "Nguyễn Văn A", tasksCompleted: 45, delayedTasks: 2 },
      { employeeCode: "NV002", fullName: "Trần Thị B", tasksCompleted: 60, delayedTasks: 0 },
      { employeeCode: "NV003", fullName: "Lê Văn C", tasksCompleted: 30, delayedTasks: 5 },
    ];

    // 4. [AGGREGATION] Giao cắt (JOIN) và tính toán logic nghiệp vụ
    // Yêu cầu: (Văn bản xử lý * 0.4) + (Task hoàn thành * 0.6) - (Trễ hạn * 2) = Điểm chất lượng
    const aggregatedData = mockTaskDbData.map(task => {
      const doc = mockDocumentApiData.find(d => d.employeeCode === task.employeeCode);
      const docsCount = doc?.documentProcessed || 0;
      
      const rawScore = (docsCount * 0.4) + (task.tasksCompleted * 0.6) - (task.delayedTasks * 2);
      const qualityScore = Math.max(0, Number(rawScore.toFixed(1))); // Không lấy điểm âm

      return {
        employeeName: task.fullName,
        docCount: docsCount,
        taskCount: task.tasksCompleted,
        delayedTasks: task.delayedTasks,
        qualityScore: qualityScore
      };
    });

    // 5. [FORMAT] Trả về 1 mảng JSON phẳng cho Frontend ChartRenderer
    return {
      success: true,
      message: 'Đã tổng hợp dữ liệu đánh giá chất lượng cá nhân',
      data: JSON.stringify(aggregatedData)
    };
  }
}
