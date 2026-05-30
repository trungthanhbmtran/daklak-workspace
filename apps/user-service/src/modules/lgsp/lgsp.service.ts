import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class LgspService {
  private readonly logger = new Logger(LgspService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) { }

  async syncDocuments(data: any) {
    const serviceCode = data.configId || 'LGSP_QUAN_LY_VAN_BAN';
    this.logger.log(`Syncing documents from LGSP for service: ${serviceCode}`);

    const config = await this.prisma.integrationConfig.findFirst({
      where: { integrationCode: serviceCode, isActive: true }
    });

    if (!config) {
      return { success: false, message: `Không tìm thấy cấu hình liên thông cho mã: ${serviceCode}`, data: [] };
    }

    const configData: any = config.configData || {};
    const endpoint = configData.apiUrl || 'https://mock.lgsp.gov.vn/api';
    const token = configData.apiToken || 'mock-token';

    try {
      const response = (await firstValueFrom(
        this.httpService.get(`${endpoint}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      )) as any;

      return {
        success: true,
        message: 'Đồng bộ văn bản thành công',
        data: response.data || []
      };
    } catch (error: any) {
      this.logger.error(`Error syncing LGSP documents: ${error.message}`);
      return { success: false, message: 'Lỗi khi đồng bộ văn bản liên thông', data: [] };
    }
  }

  async sendDocument(data: any) {
    const serviceCode = data.serviceCode || 'LGSP_QUAN_LY_VAN_BAN';
    this.logger.log(`Sending document to LGSP (${serviceCode}): ${data.title}`);

    const config = await this.prisma.integrationConfig.findFirst({
      where: { integrationCode: serviceCode, isActive: true }
    });

    if (!config) {
      return { success: false, message: `Không tìm thấy cấu hình liên thông cho mã: ${serviceCode}`, data: null };
    }

    const configData: any = config.configData || {};
    const endpoint = configData.apiUrl || 'https://mock.lgsp.gov.vn/api';
    const token = configData.apiToken || 'mock-token';

    try {
      const response = (await firstValueFrom(
        this.httpService.post(`${endpoint}/documents/send`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
      )) as any;

      return {
        success: true,
        message: 'Gửi văn bản thành công',
        data: response.data
      };
    } catch (error: any) {
      this.logger.error(`Error sending document to LGSP: ${error.message}`);
      return { success: false, message: 'Lỗi khi gửi văn bản liên thông', data: null };
    }
  }
}
