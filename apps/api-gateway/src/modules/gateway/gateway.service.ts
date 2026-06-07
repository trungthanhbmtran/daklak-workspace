import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class GatewayService {
  constructor(private prisma: PrismaService) { }

  // ==========================================
  // GATEWAY CONFIG
  // ==========================================

  async getGatewayConfigs() {
    return this.prisma.gatewayConfig.findMany({
      include: {
        routes: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getGatewayConfigById(id: string) {
    const config = await this.prisma.gatewayConfig.findUnique({
      where: { id },
      include: {
        routes: {
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!config) throw new NotFoundException('Gateway config not found');
    return config;
  }

  async createGatewayConfig(data: any) {
    return this.prisma.gatewayConfig.create({
      data,
    });
  }

  async updateGatewayConfig(id: string, data: any) {
    return this.prisma.gatewayConfig.update({
      where: { id },
      data,
    });
  }

  async deleteGatewayConfig(id: string) {
    return this.prisma.gatewayConfig.delete({
      where: { id },
    });
  }

  // ==========================================
  // GATEWAY ROUTES
  // ==========================================

  async addRoute(gatewayId: string, data: any) {
    return this.prisma.gatewayRoute.create({
      data: {
        ...data,
        gateway: {
          connect: { id: gatewayId },
        },
      },
    });
  }

  async updateRoute(routeId: string, data: any) {
    return this.prisma.gatewayRoute.update({
      where: { id: routeId },
      data,
    });
  }

  async deleteRoute(routeId: string) {
    return this.prisma.gatewayRoute.delete({
      where: { id: routeId },
    });
  }
}
