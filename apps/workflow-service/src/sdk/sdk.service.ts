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
      });

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to execute integration ${connectionCode}: ${errorMessage}`,
      );
      throw error;
    }
  }
}
