import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import * as grpc from '@grpc/grpc-js';

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  constructor(private readonly prisma: PrismaService) { }

  async findAll(search?: string) {
    const where = search
      ? { systemName: { contains: search } }
      : {};
    const configs = await this.prisma.integrationConfig.findMany({ where });

    return {
      success: true,
      message: 'Success',
      data: configs.map(c => ({
        id: c.id,
        systemName: c.systemName,
        integrationCode: c.integrationCode,
        configData: typeof c.configData === 'string' ? c.configData : JSON.stringify(c.configData),
        isActive: c.isActive,
        createdAt: c.createdAt ? c.createdAt.toISOString() : '',
        updatedAt: c.updatedAt ? c.updatedAt.toISOString() : '',
      })),
    };
  }

  async create(data: { systemName: string; integrationCode: string; configData: string }) {
    try {
      const parsedConfig = JSON.parse(data.configData || '{}');
      const config = await this.prisma.integrationConfig.create({
        data: {
          systemName: data.systemName,
          integrationCode: data.integrationCode,
          configData: parsedConfig,
          isActive: true,
        },
      });
      return {
        success: true,
        message: 'Tạo cấu hình thành công',
        data: {
          ...config,
          configData: JSON.stringify(config.configData),
          createdAt: config.createdAt ? config.createdAt.toISOString() : '',
          updatedAt: config.updatedAt ? config.updatedAt.toISOString() : '',
        },
      };
    } catch (error) {
      this.logger.error('Error creating integration:', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Lỗi khi tạo cấu hình',
      });
    }
  }

  async update(data: { id: number; systemName: string; integrationCode: string; configData: string }) {
    try {
      const parsedConfig = JSON.parse(data.configData || '{}');
      const config = await this.prisma.integrationConfig.update({
        where: { id: data.id },
        data: {
          systemName: data.systemName,
          integrationCode: data.integrationCode,
          configData: parsedConfig,
        },
      });
      return {
        success: true,
        message: 'Cập nhật cấu hình thành công',
        data: {
          ...config,
          configData: JSON.stringify(config.configData),
          createdAt: config.createdAt ? config.createdAt.toISOString() : '',
          updatedAt: config.updatedAt ? config.updatedAt.toISOString() : '',
        },
      };
    } catch (error) {
      this.logger.error('Error updating integration:', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Lỗi khi cập nhật cấu hình',
      });
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.integrationConfig.delete({ where: { id } });
      return { success: true, message: 'Xóa cấu hình thành công' };
    } catch (error) {
      this.logger.error('Error deleting integration:', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Lỗi khi xóa cấu hình',
      });
    }
  }

  async toggleActive(id: number, isActive: boolean) {
    try {
      const config = await this.prisma.integrationConfig.update({
        where: { id },
        data: { isActive },
      });
      return {
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: {
          ...config,
          configData: JSON.stringify(config.configData),
          createdAt: config.createdAt ? config.createdAt.toISOString() : '',
          updatedAt: config.updatedAt ? config.updatedAt.toISOString() : '',
        },
      };
    } catch (error) {
      this.logger.error('Error toggling integration:', error);
      throw new RpcException({
        code: grpc.status.INTERNAL,
        message: 'Lỗi khi cập nhật trạng thái',
      });
    }
  }
}
