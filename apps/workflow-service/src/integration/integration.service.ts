import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateIntegrationDto) {
    return this.prisma.integrationConnection.create({ data });
  }

  async findAll(search?: string) {
    const whereClause = search
      ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
          ],
        }
      : {};
      
    return this.prisma.integrationConnection.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const conn = await this.prisma.integrationConnection.findUnique({
      where: { id },
    });
    if (!conn) throw new NotFoundException('Integration Connection not found');
    return conn;
  }

  async update(id: string, data: UpdateIntegrationDto) {
    return this.prisma.integrationConnection.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.integrationConnection.delete({ where: { id } });
  }
}
