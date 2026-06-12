import { Injectable, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const GRPC = { ALREADY_EXISTS: 6, FAILED_PRECONDITION: 9 } as const;

@Injectable()
export class PbacService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async createRole(data: {
    code: string;
    name: string;
    description?: string;
    policies?: { resourceId: number; action: string; effect: string; conditions?: any }[];
  }) {
    const existing = await this.prisma.role.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new RpcException({
        message: 'Mã vai trò đã tồn tại',
        code: GRPC.ALREADY_EXISTS,
      });
    }

    return this.prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        policies: {
          create: data.policies?.map(p => ({
            resourceId: p.resourceId,
            action: p.action,
            effect: p.effect || 'ALLOW',
            conditions: p.conditions || {},
          })) || [],
        },
      },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        _count: { select: { users: true, policies: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOneRole(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: { policies: { include: { resource: true } } },
    });
  }

  async updateRole(
    id: number,
    data: { name?: string; description?: string; policies?: { resourceId: number; action: string; effect: string; conditions?: any }[] },
  ) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        policies: data.policies ? {
          deleteMany: {},
          create: data.policies.map(p => ({
            resourceId: p.resourceId,
            action: p.action,
            effect: p.effect || 'ALLOW',
            conditions: p.conditions || {},
          }))
        } : undefined,
      },
    });
  }

  async deleteRole(id: number) {
    const countUsers = await this.prisma.user.count({
      where: { roles: { some: { id } } },
    });
    if (countUsers > 0) {
      throw new RpcException({
        message:
          'Không thể xóa vai trò đang có người sử dụng. Hãy gỡ user ra trước.',
        code: GRPC.FAILED_PRECONDITION,
      });
    }
    return this.prisma.role.delete({ where: { id } });
  }

  async getResources() {
    return this.prisma.resource.findMany({ orderBy: { code: 'asc' } });
  }

  async createResource(data: { code: string; name: string; serviceCode?: string }) {
    const existing = await this.prisma.resource.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new RpcException({
        message: 'Mã tài nguyên đã tồn tại',
        code: GRPC.ALREADY_EXISTS,
      });
    }
    return this.prisma.resource.create({
      data: { code: data.code, name: data.name, serviceCode: data.serviceCode },
    });
  }

  async updateResource(id: number, data: { code?: string; name?: string; serviceCode?: string }) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) return null;
    if (data.code !== undefined) {
      const existing = await this.prisma.resource.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new RpcException({
          message: 'Mã tài nguyên đã tồn tại',
          code: GRPC.ALREADY_EXISTS,
        });
      }
    }
    return this.prisma.resource.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.serviceCode !== undefined && { serviceCode: data.serviceCode }),
      },
    });
  }

  async deleteResource(id: number) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: { policies: true },
    });
    if (!resource) return false;
    if (resource.policies.length > 0) {
      throw new RpcException({
        message:
          'Không thể xóa tài nguyên đang có policy. Hãy xóa các policy trước.',
        code: GRPC.FAILED_PRECONDITION,
      });
    }
    await this.prisma.resource.delete({ where: { id } });
    return true;
  }
}
