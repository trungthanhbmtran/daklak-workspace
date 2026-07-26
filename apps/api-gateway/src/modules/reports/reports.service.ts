import { Injectable, Inject, OnModuleInit, InternalServerErrorException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class ReportsService implements OnModuleInit {
  private reportService: any;

  constructor(
    @Inject(MICROSERVICES.REPORT.SYMBOL) private readonly reportClient: any,
  ) {}

  onModuleInit() {
    this.reportService = this.reportClient.getService(MICROSERVICES.REPORT.SERVICE);
  }

  private async callGrpc(method: string, payloadObj: any, user?: any, authHeader?: string) {
    const payload = payloadObj ? JSON.stringify(payloadObj) : '{}';
    const userData = user ? JSON.stringify(user) : '';
    
    const meta = new (require('@grpc/grpc-js').Metadata)();
    if (authHeader) {
      meta.add('authorization', authHeader);
    }

    return firstValueFrom(this.reportService[method]({ payload, userData }, meta)).catch((e) => {
      console.error(`RPC Call Failed [${method}]`, e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Report Service');
    });
  }

  private parseResponse(res: any) {
    return { success: res.success, data: res.data ? JSON.parse(res.data) : null };
  }

  // Templates & Widgets
  async createTemplate(body: any) {
    return this.parseResponse(await this.callGrpc('CreateTemplate', body));
  }
  
  async getAllTemplates(query: any) {
    return this.parseResponse(await this.callGrpc('GetAllTemplates', query));
  }
  
  async getTemplateById(id: string, query: any) {
    return this.parseResponse(await this.callGrpc('GetTemplateById', { id, ...query }));
  }
  
  async updateTemplate(id: string, body: any) {
    return this.parseResponse(await this.callGrpc('UpdateTemplate', { id, ...body }));
  }
  
  async deleteTemplate(id: string) {
    return this.parseResponse(await this.callGrpc('DeleteTemplate', { id }));
  }
  
  async getAllWidgets(query: any) {
    return this.parseResponse(await this.callGrpc('GetAllWidgets', query));
  }

  // Stats
  async getTaskStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(await this.callGrpc('GetTaskStats', query, user, authHeader));
  }
  
  async getPostStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(await this.callGrpc('GetPostStats', query, user, authHeader));
  }
  
  async getKpiStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(await this.callGrpc('GetKpiStats', query, user, authHeader));
  }
  
  async getDocumentStats(query: any, user: any, authHeader: string) {
    return this.parseResponse(await this.callGrpc('GetDocumentStats', query, user, authHeader));
  }
}
