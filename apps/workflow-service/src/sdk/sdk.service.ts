import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import axios from 'axios';

@Injectable()
export class DynamicSdkService {
  private readonly logger = new Logger(DynamicSdkService.name);

  constructor(private readonly prisma: PrismaService) {}

  async executeIntegration(connectionCode: string, payload: any): Promise<any> {
    const connection = await this.prisma.integrationConnection.findUnique({
      where: { code: connectionCode },
    });

    if (!connection) {
      throw new Error(`Integration connection ${connectionCode} not found`);
    }

    if (!connection.isActive) {
      throw new Error(`Integration connection ${connectionCode} is disabled`);
    }

    try {
      this.logger.log(
        `Executing dynamic integration for ${connectionCode} to ${connection.baseUrl}`,
      );

      const response = await axios({
        method: 'POST', // Assuming POST for now, could be dynamic
        url: connection.baseUrl,
        headers: (connection.headers as Record<string, string>) || {
          'Content-Type': 'application/json',
        },
        data: payload,
        // [P2 #28] axios hot path bắt buộc có timeout — không treo vòng lặp engine chờ response vô hạn
        timeout: 10000,
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errorMessage = err?.message ?? String(error);
      this.logger.error(
        `Failed to execute integration ${connectionCode}: ${errorMessage}`,
      );
      // [P2 #28] Re-raise kèm context (connectionCode) — caller không mất dấu vết nguồn gốc lỗi
      if (err) {
        err.message = `Integration ${connectionCode} call failed: ${errorMessage}`;
      }
      throw error;
    }
  }
}
