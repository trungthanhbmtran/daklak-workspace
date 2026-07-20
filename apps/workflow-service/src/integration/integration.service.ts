import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

export interface CreateIntegrationDto {
  name: string;
  code: string;
  description?: string;
  protocol?: string;
  baseUrl: string;
  authType?: string;
  authConfig?: any;
  headers?: any;
  endpoints?: any;
  metadata?: any;
  isActive?: boolean;
}

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIntegrationDto) {
    return this.prisma.integrationConnection.create({ data });
  }

  async findAll() {
    return this.prisma.integrationConnection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const conn = await this.prisma.integrationConnection.findUnique({ where: { id } });
    if (!conn) throw new NotFoundException('Integration Connection not found');
    return conn;
  }

  async update(id: string, data: Partial<CreateIntegrationDto>) {
    return this.prisma.integrationConnection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.integrationConnection.delete({ where: { id } });
  }
}
