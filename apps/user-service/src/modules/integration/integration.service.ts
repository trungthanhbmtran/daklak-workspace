import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: any) {
    const where: any = {};
    if (query.search) {
      where.systemName = { contains: query.search };
    }

    const data = await this.prisma.integrationConfig.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      message: 'Thành công',
      data: data.map(item => ({
        ...item,
        configData: JSON.stringify(item.configData),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      }))
    };
  }

  async create(data: any) {
    let configData = {};
    try {
      configData = JSON.parse(data.configData);
    } catch(e) {}

    const config = await this.prisma.integrationConfig.create({
      data: {
        systemName: data.systemName,
        integrationCode: data.integrationCode,
        configData: configData,
        isActive: true,
      }
    });

    return {
      success: true,
      message: 'Tạo mã liên thông thành công',
      data: {
        ...config,
        configData: JSON.stringify(config.configData),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      }
    };
  }

  async update(data: any) {
    let configData = {};
    try {
      if (data.configData) configData = JSON.parse(data.configData);
    } catch(e) {}

    const config = await this.prisma.integrationConfig.update({
      where: { id: data.id },
      data: {
        systemName: data.systemName,
        integrationCode: data.integrationCode,
        ...(data.configData ? { configData } : {})
      }
    });

    return {
      success: true,
      message: 'Cập nhật mã liên thông thành công',
      data: {
        ...config,
        configData: JSON.stringify(config.configData),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      }
    };
  }

  async delete(id: number) {
    await this.prisma.integrationConfig.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Đã xóa mã liên thông'
    };
  }

  async toggleActive(id: number, isActive: boolean) {
    const config = await this.prisma.integrationConfig.update({
      where: { id },
      data: { isActive }
    });

    return {
      success: true,
      message: isActive ? 'Đã bật mã liên thông' : 'Đã tắt mã liên thông',
      data: {
        ...config,
        configData: JSON.stringify(config.configData),
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      }
    };
  }
}
