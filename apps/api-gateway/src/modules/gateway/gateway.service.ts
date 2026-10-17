import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const API_KEY_LIST_SELECT = {
  id: true,
  name: true,
  key: true,
  description: true,
  isActive: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Danh sách chỉ trả về key đã che; key đầy đủ chỉ xuất hiện trong response tạo mới.
function maskApiKey(key: string): string {
  if (!key) return '';
  return key.length <= 8 ? '********' : `${'*'.repeat(8)}${key.slice(-4)}`;
}

@Injectable()
export class GatewayConfigService {
  constructor(private prisma: PrismaService) {}

  // GatewayService
  async getServices() {
    return this.prisma.gatewayService.findMany({
      include: { routes: { select: { id: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createService(data: any) {
    return this.prisma.gatewayService.create({ data });
  }

  async updateService(id: number, data: any) {
    return this.prisma.gatewayService.update({
      where: { id },
      data,
    });
  }

  async deleteService(id: number) {
    return this.prisma.gatewayService.delete({ where: { id } });
  }

  // GatewayRoute
  async getRoutes() {
    return this.prisma.gatewayRoute.findMany({
      include: { service: { select: { id: true, name: true, url: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRoute(data: any) {
    return this.prisma.gatewayRoute.create({ data });
  }

  async updateRoute(id: number, data: any) {
    return this.prisma.gatewayRoute.update({
      where: { id },
      data,
    });
  }

  async deleteRoute(id: number) {
    return this.prisma.gatewayRoute.delete({ where: { id } });
  }

  // ApiKey
  async getApiKeys() {
    const keys = await this.prisma.apiKey.findMany({
      select: API_KEY_LIST_SELECT,
      orderBy: { createdAt: 'desc' },
    });
    return keys.map((k) => ({ ...k, key: maskApiKey(k.key) }));
  }

  async createApiKey(data: any) {
    if (data.expiresAt && typeof data.expiresAt === 'string') {
      data.expiresAt = new Date(data.expiresAt);
    }
    return this.prisma.apiKey.create({ data });
  }

  async updateApiKey(id: number, data: any) {
    if (data.expiresAt && typeof data.expiresAt === 'string') {
      data.expiresAt = new Date(data.expiresAt);
    }
    const updated = await this.prisma.apiKey.update({
      where: { id },
      data,
      select: API_KEY_LIST_SELECT,
    });
    return { ...updated, key: maskApiKey(updated.key) };
  }

  async deleteApiKey(id: number) {
    return this.prisma.apiKey.delete({ where: { id } });
  }

  // Settings
  async getSettings() {
    let settings = await this.prisma.gatewaySetting.findFirst();
    if (!settings) {
      settings = await this.prisma.gatewaySetting.create({ data: {} });
    }
    return settings;
  }

  async updateSettings(data: any) {
    const settings = await this.getSettings();
    return this.prisma.gatewaySetting.update({
      where: { id: settings.id },
      data,
    });
  }
}
