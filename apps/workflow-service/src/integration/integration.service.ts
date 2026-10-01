import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import axios from 'axios';

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

const mapToPrisma = (payload: any) => {
  return {
    ...payload,
    authConfig: parseJsonField(payload.authConfig) ?? {},
    headers: parseJsonField(payload.headers) ?? {},
    endpoints: parseJsonField(payload.endpoints) ?? [],
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
    endpoints: typeof data.endpoints === 'string' ? data.endpoints : JSON.stringify(parsedEndpoints),
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

  async execute(idOrCode: string, payload: any) {
    // payload có thể chứa: endpointPath, method, params, body, headers
    let conn = await this.prisma.integrationConnection.findUnique({
      where: { id: idOrCode },
    });

    // Fallback: nếu không tìm thấy theo ID, tìm theo Code
    if (!conn) {
      conn = await this.prisma.integrationConnection.findFirst({
        where: { code: idOrCode, isActive: true },
      });
    }

    if (!conn) {
      throw new NotFoundException(`Integration Connection ${idOrCode} not found or inactive`);
    }

    const authConfig: any = parseJsonField(conn.authConfig) || {};
    const baseHeaders: any = parseJsonField(conn.headers) || {};
    const endpoints: any[] = parseJsonField(conn.endpoints) || [];

    // Tìm kiếm cấu hình endpoint trong CSDL
    let targetEndpoint: any = null;
    if (payload.endpointId) {
      targetEndpoint = endpoints.find((e: any) => e.id === payload.endpointId);
    } else if (payload.endpointPath) {
      targetEndpoint = endpoints.find((e: any) => e.path === payload.endpointPath);
    }
    
    // Nếu không chỉ định, lấy mặc định endpoint đầu tiên (rất hữu ích khi integration chỉ có 1 endpoint)
    if (!targetEndpoint && endpoints.length > 0 && !payload.endpointId && !payload.endpointPath) {
      targetEndpoint = endpoints[0];
    }

    const endpointPath = targetEndpoint?.path || payload.endpointPath || '';
    const executeMethod = targetEndpoint?.method || payload.method || 'GET';

    const cleanBaseUrl = conn.baseUrl.replace(/\/$/, '');
    const cleanEndpointPath = endpointPath.startsWith('/') ? endpointPath : (endpointPath ? `/${endpointPath}` : '');
    let finalUrl = `${cleanBaseUrl}${cleanEndpointPath}`;

    // Replace path variables like {key} or :key if params exist
    const params = payload.params || {};
    for (const key of Object.keys(params)) {
      if (finalUrl.includes(`{${key}}`)) {
        finalUrl = finalUrl.replace(`{${key}}`, encodeURIComponent(params[key]));
        delete params[key];
      } else if (finalUrl.includes(`:${key}`)) {
        finalUrl = finalUrl.replace(`:${key}`, encodeURIComponent(params[key]));
        delete params[key];
      }
    }

    const headers = { ...baseHeaders, ...(payload.headers || {}) };

    if (conn.authType === 'Bearer' && authConfig.token) {
      headers['Authorization'] = `Bearer ${authConfig.token}`;
    } else if (conn.authType === 'Basic' && authConfig.username && authConfig.password) {
      const basicAuth = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    } else if (conn.authType === 'API_KEY' && authConfig.apiKey && authConfig.keyName) {
      if (authConfig.keyLocation === 'header') {
        headers[authConfig.keyName] = authConfig.apiKey;
      } else if (authConfig.keyLocation === 'query') {
        params[authConfig.keyName] = authConfig.apiKey;
      }
    }

    try {
      const response = await axios({
        method: executeMethod,
        url: finalUrl,
        headers,
        params,
        data: payload.body,
        timeout: 15000,
      });

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
    } catch (error: any) {
      Logger.error(`Execute Integration Failed: ${error.message}`, error.stack, 'IntegrationService');
      throw new BadRequestException({
        success: false,
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        error: error.response?.data?.message || error.message || 'Lỗi khi gọi API external',
        data: error.response?.data,
      });
    }
  }
}
