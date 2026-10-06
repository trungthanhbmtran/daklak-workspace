import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GatewayConfigService {
  constructor(private prisma: PrismaService) {}

  // GatewayService
  async getServices() {
    return this.prisma.gatewayService.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createService(data: any) {
    return this.prisma.gatewayService.create({ data });
  }

  async updateService(id: number, data: any) {
    return this.prisma.gatewayService.update({
      where: { id },
      data
    });
  }

  async deleteService(id: number) {
    return this.prisma.gatewayService.delete({ where: { id } });
  }

  // GatewayRoute
  async getRoutes() {
    return this.prisma.gatewayRoute.findMany({
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createRoute(data: any) {
    return this.prisma.gatewayRoute.create({ data });
  }

  async updateRoute(id: number, data: any) {
    return this.prisma.gatewayRoute.update({
      where: { id },
      data
    });
  }

  async deleteRoute(id: number) {
    return this.prisma.gatewayRoute.delete({ where: { id } });
  }

  // ApiKey
  async getApiKeys() {
    return this.prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
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
    return this.prisma.apiKey.update({
      where: { id },
      data
    });
  }

  async deleteApiKey(id: number) {
    return this.prisma.apiKey.delete({ where: { id } });
  }
}
