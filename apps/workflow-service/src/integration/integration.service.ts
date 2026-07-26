import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';

import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

// Parse JSON field an toàn
const parseJsonField = (val: any): any => {
  if (!val) return null;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  }
  return val;
};

// Map gRPC/REST request sang Prisma DTO
const mapToPrisma = (payload: any) => {
  return {
    ...payload,
    authConfig: parseJsonField(payload.authConfig) ?? {},
    headers: parseJsonField(payload.headers) ?? {},
    metadata: parseJsonField(payload.metadata) ?? {},
  };
};

// Map Prisma record sang response (chuẩn hoá Object thành string cho gRPC nếu cần, nhưng 
// hiện tại để REST trả về JSON object là tốt nhất, gRPC sẽ tự map)
const mapIntegrationResponse = (data: any) => {
  if (!data) return null;
  const parsedEndpoints = parseJsonField(data.endpoints) ?? [];
  return {
    ...data,
    // Trả về JSON object cho REST client dễ parse, nếu gRPC yêu cầu string thì sẽ được 
    // protobuf tự động encode/decode hoặc xử lý ở client.
    authConfig: parseJsonField(data.authConfig) ?? {},
    headers: parseJsonField(data.headers) ?? {},
    endpoints: parsedEndpoints,
    metadata: parseJsonField(data.metadata) ?? {},
    createdAt: data.createdAt?.toISOString?.() ?? data.createdAt ?? '',
    updatedAt: data.updatedAt?.toISOString?.() ?? data.updatedAt ?? '',
  };
};

@Injectable()
export class IntegrationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateIntegrationDto) {
    const createData = mapToPrisma(createDto);
    const data = await this.prisma.integrationConnection.create({
      data: createData,
    });
    return mapIntegrationResponse(data);
  }

  async findAll(search?: string) {
    const whereClause = search
      ? {
          OR: [{ name: { contains: search } }, { code: { contains: search } }],
        }
      : {};

    const data = await this.prisma.integrationConnection.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    
    return data.map(mapIntegrationResponse);
  }

  async findOne(id: string) {
    const conn = await this.prisma.integrationConnection.findUnique({
      where: { id },
    });
    if (!conn) throw new NotFoundException('Integration Connection not found');
    return mapIntegrationResponse(conn);
  }

  async update(id: string, updateDto: UpdateIntegrationDto) {
    const updateData = mapToPrisma(updateDto);
    const data = await this.prisma.integrationConnection.update({
      where: { id },
      data: updateData,
    });
    return mapIntegrationResponse(data);
  }

  async remove(id: string) {
    return this.prisma.integrationConnection.delete({ where: { id } });
  }
}
