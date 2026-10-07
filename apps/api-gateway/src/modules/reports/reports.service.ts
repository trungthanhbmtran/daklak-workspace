import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { Metadata } from '@grpc/grpc-js';
import { timeout } from 'rxjs';

@Injectable()
export class ReportsService implements OnModuleInit {
  private reportService: any;

  constructor(
    @Inject(MICROSERVICES.REPORT.SYMBOL) private readonly reportClient: any,
  ) {}

  onModuleInit() {
    this.reportService = this.reportClient.getService(
      MICROSERVICES.REPORT.SERVICE,
    );
  }

  private async callGrpc(
    method: string,
    payloadObj: any,
    user?: any,
    authHeader?: string,
  ) {
    const payload = payloadObj ? JSON.stringify(payloadObj) : '{}';
    const userData = user ? JSON.stringify(user) : '';

    const meta = new Metadata();
    if (authHeader) {
      meta.add('authorization', authHeader);
    }

    return firstValueFrom(
      this.reportService[method]({ payload, userData }, meta),
    ).catch((e) => {
      if (e.code === 3)
        throw new BadRequestException(
          e.details || 'Cấu hình báo cáo không hợp lệ',
        );
      console.error(`RPC Call Failed [${method}]`, e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Report Service');
    });
  }

  private parseResponse(res: any) {
    return {
      success: res.success,
      data: res.data ? JSON.parse(res.data) : null,
    };
  }

  async executeTable(data: unknown, config: unknown, user: unknown) {
    const res = await firstValueFrom(
      this.reportService
        .ExecuteTable({
          payload: JSON.stringify({ data, config }),
          userData: JSON.stringify(user),
        })
        .pipe(timeout(10000)),
    ).catch((error: { code?: number; details?: string }) => {
      if (error.code === 3)
        throw new BadRequestException(
          error.details || 'Cấu hình bảng không hợp lệ',
        );
      throw new InternalServerErrorException('Không thể xử lý bảng báo cáo');
    });
    return this.parseResponse(res);
  }

  // Templates & Widgets
  async createTemplate(body: any) {
    return this.parseResponse(await this.callGrpc('CreateTemplate', body));
  }

  async getAllTemplates(query: any) {
    return this.parseResponse(await this.callGrpc('GetAllTemplates', query));
  }

  async getTemplateById(id: string, query: any) {
    return this.parseResponse(
      await this.callGrpc('GetTemplateById', { id, ...query }),
    );
  }

  async updateTemplate(id: string, body: any) {
    return this.parseResponse(
      await this.callGrpc('UpdateTemplate', { id, ...body }),
    );
  }

  async deleteTemplate(id: string) {
    return this.parseResponse(await this.callGrpc('DeleteTemplate', { id }));
  }

  async getAllWidgets(query: any) {
    return this.parseResponse(await this.callGrpc('GetAllWidgets', query));
  }

  // Stats
  async getTaskStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetTaskStats', query, user, authHeader),
    );
  }

  async getPostStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetPostStats', query, user, authHeader),
    );
  }

  async getKpiStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetKpiStats', query, user, authHeader),
    );
  }

  async getDocumentStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetDocumentStats', query, user, authHeader),
    );
  }

  async getEmployeeQualityReport(query: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetEmployeeQualityReport', query, user, authHeader),
    );
  }

  // --- V2 Dynamic Report Designer ---

  async createReportDefinition(body: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('CreateReportDefinition', body, user, authHeader),
    );
  }

  async getReportDefinitions(query: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetReportDefinitions', query, user, authHeader),
    );
  }

  async getReportCatalog(user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetReportCatalog', {}, user, authHeader),
    );
  }

  async getReportDefinitionById(id: string, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetReportDefinitionById', { id }, user, authHeader),
    );
  }

  async runReport(body: any, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('RunReport', body, user, authHeader),
    );
  }

  async getReportRunStatus(id: string, user: any, authHeader: string) {
    return this.parseResponse(
      await this.callGrpc('GetReportRunStatus', { id }, user, authHeader),
    );
  }

  async getDatasetSnapshot(
    runId: string,
    query: any,
    user: any,
    authHeader: string,
  ) {
    return this.parseResponse(
      await this.callGrpc(
        'GetDatasetSnapshot',
        { runId, ...query },
        user,
        authHeader,
      ),
    );
  }
}
