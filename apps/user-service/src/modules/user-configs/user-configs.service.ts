import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class UserConfigsService {
  private readonly logger = new Logger(UserConfigsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserConfigs(userId: number) {
    const configs = await this.prisma.userConfig.findMany({
      where: { userId },
    });
    return configs.map(c => ({
      key: c.key,
      value: c.value,
    }));
  }

  async setUserConfig(userId: number, key: string, value: string) {
    try {
      const config = await this.prisma.userConfig.upsert({
        where: {
          userId_key: {
            userId,
            key,
          },
        },
        update: {
          value,
        },
        create: {
          userId,
          key,
          value,
        },
      });
      return {
        key: config.key,
        value: config.value,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error setting user config: ${error}`);
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Lỗi khi lưu cấu hình người dùng',
      });
    }
  }
}
