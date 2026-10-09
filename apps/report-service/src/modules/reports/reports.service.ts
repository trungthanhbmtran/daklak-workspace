import { Injectable, OnModuleInit, Inject, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { executeTable } from './table-engine';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name);
  private orgGrpcService: any;
  private taskGrpcService: any;
  private docGrpcService: any;
  private apiGrpcService: any;

  constructor(
    @Inject('USER_SERVICE') private userClient: ClientGrpc,
    @Inject('TASK_SERVICE') private taskClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private docClient: ClientGrpc,
    @Inject('API_MANAGEMENT_SERVICE') private apiClient: ClientGrpc,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.orgGrpcService = this.userClient.getService<any>('OrganizationService');
    this.taskGrpcService = this.taskClient.getService<any>('TaskService');
    this.docGrpcService = this.docClient.getService<any>('DocumentService');
    this.apiGrpcService = this.apiClient.getService<any>('ApiManagementService');
  }

  async getStaffingReport(unitId: number) {
    const res = (await firstValueFrom(
      this.orgGrpcService.GetStaffingReport({ unitId }),
    )) as any;

    return {
      success: true,
      data: res.data || [],
      message: 'Báo cáo định biên nhân sự',
    };
  }

  async getEmployeeQualityReport(payloadStr: string, _userDataStr: string) {
    try {
      const payload = payloadStr ? JSON.parse(payloadStr) : {};
      const docWeight = typeof payload.docWeight === 'number' ? payload.docWeight : 0.4;
      const taskWeight = typeof payload.taskWeight === 'number' ? payload.taskWeight : 0.6;
      const delayPenalty = typeof payload.delayPenalty === 'number' ? payload.delayPenalty : 2;

      // 1. Fetch real tasks from task service
      let taskList: any[] = [];
      try {
        const taskRes: any = await firstValueFrom(
          this.taskGrpcService.ListTasks({ page: 1, limit: 10000 }),
        );
        taskList = taskRes?.data || [];
      } catch (err) {
        this.logger.warn('Could not fetch tasks for employee quality report:', err);
      }

      // 2. Fetch real documents from document service
      let docList: any[] = [];
      try {
        const docRes: any = await firstValueFrom(
          this.docGrpcService.ListDocuments({ page: 1, limit: 10000 }),
        );
        docList = docRes?.data || [];
      } catch (err) {
        this.logger.warn('Could not fetch documents for employee quality report:', err);
      }

      // 3. Aggregate metrics dynamically per employee
      const employeeMap = new Map<
        string,
        {
          employeeCode: string;
          employeeName: string;
          departmentName: string;
          docCount: number;
          taskCount: number;
          delayedTasks: number;
        }
      >();

      const nowTime = Date.now();

      // Aggregate task contributions
      for (const task of taskList) {
        const participants = task.participants || [];
        const isDone = task.status === 'COMPLETED' || task.status === 'DONE';
        const taskDue = task.dueDate ? new Date(task.dueDate).getTime() : null;
        const isDelayed = !isDone && taskDue && nowTime > taskDue;

        for (const p of participants) {
          if (p.employeeCode) {
            if (!employeeMap.has(p.employeeCode)) {
              employeeMap.set(p.employeeCode, {
                employeeCode: p.employeeCode,
                employeeName: p.fullName || p.employeeCode,
                departmentName: p.departmentName || 'Chưa phân công',
                docCount: 0,
                taskCount: 0,
                delayedTasks: 0,
              });
            }
            const emp = employeeMap.get(p.employeeCode)!;
            if (isDone) emp.taskCount++;
            if (isDelayed) emp.delayedTasks++;
          }
        }
      }

      // Aggregate document contributions (e.g. by creator or signer)
      for (const doc of docList) {
        const code = doc.creatorCode || doc.signerId || 'SYSTEM';
        if (code && code !== 'SYSTEM') {
          if (!employeeMap.has(code)) {
            employeeMap.set(code, {
              employeeCode: code,
              employeeName: doc.signerName || code,
              departmentName: 'Chưa phân công',
              docCount: 0,
              taskCount: 0,
              delayedTasks: 0,
            });
          }
          const emp = employeeMap.get(code)!;
          emp.docCount++;
        }
      }

      // Dynamic calculation of quality scores
      const rows = Array.from(employeeMap.values()).map((emp) => {
        const rawScore =
          emp.docCount * docWeight +
          emp.taskCount * taskWeight -
          emp.delayedTasks * delayPenalty;
        const qualityScore = Math.max(0, Number(rawScore.toFixed(1)));
        return {
          employeeCode: emp.employeeCode,
          employeeName: emp.employeeName,
          departmentName: emp.departmentName,
          docCount: emp.docCount,
          taskCount: emp.taskCount,
          delayedTasks: emp.delayedTasks,
          qualityScore,
        };
      });

      // 4. Nếu có cấu hình bảng động (TableConfig), chuyển qua TableEngine xử lý
      if (payload.config && payload.config.version === 1) {
        const tableResult = executeTable({ items: rows }, payload.config);
        return {
          success: true,
          message: 'Báo cáo chất lượng nhân sự (Table Engine)',
          data: JSON.stringify(tableResult),
        };
      }

      // Trả về mảng phẳng các bản ghi cho ChartRenderer
      return {
        success: true,
        message: 'Đã tổng hợp dữ liệu chất lượng nhân sự thực tế',
        data: JSON.stringify(rows),
      };
    } catch (error: any) {
      this.logger.error('Error generating employee quality report:', error);
      return {
        success: false,
        message: 'Lỗi tạo báo cáo chất lượng nhân sự',
        data: JSON.stringify([]),
      };
    }
  }

  async getReportCatalog(payloadStr: string, _userDataStr: string) {
    try {
      // Fetch dynamic catalog from Prisma ReportDataSource table
      const sources = await this.prisma.reportDataSource.findMany({
        select: {
          code: true,
          name: true,
          upstream: true,
          path: true,
          fields: true,
        },
      });

      // If DB is empty, provide fallback defaults or just empty array
      const dbCatalog = sources.length > 0 ? sources.map(s => ({
        endpoint: s.code, // Alias for frontend compatibility
        upstream: s.upstream,
        path: s.path,
        name: s.name,
        fields: s.fields
      })) : [
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

      // Fetch from API Manager to sync external sources
      let apiCatalog: any[] = [];
      try {
        if (this.apiGrpcService) {
          const apiRes = await firstValueFrom(
            this.apiGrpcService.ListConnections({ limit: 1000, offset: 0 })
          ) as any;
          if (apiRes && apiRes.data) {
            for (const conn of apiRes.data) {
              if (!conn.enabled) continue;
              for (const ep of conn.endpoints) {
                if (ep.method === 'GET' || ep.method === 'get') {
                  let fields: string[] = [];
                  if (ep.schema) {
                    try {
                      const parsed = JSON.parse(ep.schema);
                      if (parsed && typeof parsed === 'object') {
                        fields = Object.keys(parsed);
                      }
                    } catch(e) {}
                  }
                  apiCatalog.push({
                    endpoint: `${conn.code}|${ep.pathTemplate}`,
                    upstream: conn.code,
                    path: ep.pathTemplate,
                    name: `[Liên thông API] ${conn.displayName || conn.code} - ${ep.pathTemplate}`,
                    fields: fields
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        this.logger.warn('Could not sync catalog with API Manager:', err);
      }

      const catalog = [...dbCatalog, ...apiCatalog];

      return {
        success: true,
        message: 'Lấy danh mục dữ liệu thành công',
        data: JSON.stringify(catalog),
      };
    } catch (error: any) {
      this.logger.error('Error fetching report catalog:', error);
      return {
        success: false,
        message: 'Lỗi lấy danh mục dữ liệu',
        data: JSON.stringify([]),
      };
    }
  }
}
