import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async findAll(query: any) {
    const where: any = {};
    if (query.search) {
      where.systemName = { contains: query.search };
    }

    const data = await this.prisma.integrationConfig.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      message: 'Thành công',
      data: data.map((item) => ({
        ...item,
        configData: JSON.stringify(item.configData),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }

  async create(data: any) {
    let configData = {};
    try {
      configData = JSON.parse(data.configData);
    } catch (e) {}

    const config = await this.prisma.integrationConfig.create({
      data: {
        systemName: data.systemName,
        integrationCode: data.integrationCode,
        configData: configData,
        isActive: true,
      },
    });

    return {
      success: true,
      message: 'Tạo mã liên thông thành công',
      data: {
        ...config,
        configData: JSON.stringify(config.configData),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      },
    };
  }

  async update(data: any) {
    let configData = {};
    try {
      if (data.configData) configData = JSON.parse(data.configData);
    } catch (e) {}

    const config = await this.prisma.integrationConfig.update({
      where: { id: data.id },
      data: {
        systemName: data.systemName,
        integrationCode: data.integrationCode,
        ...(data.configData ? { configData } : {}),
      },
    });

    return {
      success: true,
      message: 'Cập nhật mã liên thông thành công',
      data: {
        ...config,
        configData: JSON.stringify(config.configData),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      },
    };
  }

  async delete(id: number) {
    await this.prisma.integrationConfig.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Đã xóa mã liên thông',
    };
  }

  async toggleActive(id: number, isActive: boolean) {
    const config = await this.prisma.integrationConfig.update({
      where: { id },
      data: { isActive },
    });

    return {
      success: true,
      message: isActive ? 'Đã bật mã liên thông' : 'Đã tắt mã liên thông',
      data: {
        ...config,
        configData: JSON.stringify(config.configData),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      },
    };
  }

  async syncDocuments(data: any) {
    const serviceCode = data.configId || 'LGSP_QUAN_LY_VAN_BAN';
    this.logger.log(`Syncing documents for integration: ${serviceCode}`);

    const config = await this.prisma.integrationConfig.findFirst({
      where: { integrationCode: serviceCode, isActive: true },
    });

    if (!config) {
      return {
        success: false,
        message: `Không tìm thấy cấu hình liên thông cho mã: ${serviceCode}`,
        data: [],
      };
    }

    const configData: any = config.configData || {};
    const endpoint = configData.apiUrl || 'https://mock.lgsp.gov.vn/api';
    const token = configData.apiToken || 'mock-token';

    try {
      const response = (await firstValueFrom(
        this.httpService.get(`${endpoint}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      )) as any;

      return {
        success: true,
        message: 'Đồng bộ văn bản thành công',
        data: response.data || [],
      };
    } catch (error: any) {
      this.logger.error(`Error syncing documents: ${error.message}`);
      return {
        success: false,
        message: 'Lỗi khi đồng bộ văn bản liên thông',
        data: [],
      };
    }
  }

  async sendDocument(data: any) {
    const serviceCode = data.serviceCode || 'LGSP_QUAN_LY_VAN_BAN';
    this.logger.log(
      `Sending document to integration (${serviceCode}): ${data.title}`,
    );

    const config = await this.prisma.integrationConfig.findFirst({
      where: { integrationCode: serviceCode, isActive: true },
    });

    if (!config) {
      return {
        success: false,
        message: `Không tìm thấy cấu hình liên thông cho mã: ${serviceCode}`,
        data: null,
      };
    }

    const configData: any = config.configData || {};
    const endpoint = configData.apiUrl || 'https://mock.lgsp.gov.vn/api';
    const token = configData.apiToken || 'mock-token';

    try {
      const response = (await firstValueFrom(
        this.httpService.post(`${endpoint}/documents/send`, data, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      )) as any;

      return {
        success: true,
        message: 'Gửi văn bản thành công',
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(`Error sending document: ${error.message}`);
      return {
        success: false,
        message: 'Lỗi khi gửi văn bản liên thông',
        data: null,
      };
    }
  }
}
