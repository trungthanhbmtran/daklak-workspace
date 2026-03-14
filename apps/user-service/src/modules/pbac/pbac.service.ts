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
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  async createRole(data: { code: string; name: string; description?: string; permissionIds?: number[] }) {
    const existing = await this.prisma.role.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new RpcException({ message: 'Mã vai trò đã tồn tại', code: GRPC.ALREADY_EXISTS });
    }

    return this.prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        permissions: {
          connect: data.permissionIds?.map((id) => ({ id })) || [],
        },
      },
    });
  }

  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        _count: { select: { users: true, permissions: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOneRole(id: number) {
    return this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
  }

  async updateRole(id: number, data: { name?: string; description?: string; permissionIds?: number[] }) {
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissionIds ? {
          set: data.permissionIds.map((pid) => ({ id: pid })),
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
        message: 'Không thể xóa vai trò đang có người sử dụng. Hãy gỡ user ra trước.',
        code: GRPC.FAILED_PRECONDITION,
      });
    }
    return this.prisma.role.delete({ where: { id } });
  }

  async getPermissionMatrix() {
    return this.prisma.resource.findMany({
      include: {
        permissions: { orderBy: { action: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createResource(data: { code: string; name: string }) {
    const existing = await this.prisma.resource.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new RpcException({ message: 'Mã tài nguyên đã tồn tại', code: GRPC.ALREADY_EXISTS });
    }
    return this.prisma.resource.create({
      data: { code: data.code, name: data.name },
    });
  }

  async updateResource(id: number, data: { code?: string; name?: string }) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });
    if (!resource) return null;
    if (data.code !== undefined) {
      const existing = await this.prisma.resource.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) {
        throw new RpcException({ message: 'Mã tài nguyên đã tồn tại', code: GRPC.ALREADY_EXISTS });
      }
    }
    return this.prisma.resource.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
      },
    });
  }

  async deleteResource(id: number) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!resource) return false;
    if (resource.permissions.length > 0) {
      throw new RpcException({
        message: 'Không thể xóa tài nguyên đang có quyền. Hãy xóa các quyền trước.',
        code: GRPC.FAILED_PRECONDITION,
      });
    }
    await this.prisma.resource.delete({ where: { id } });
    return true;
  }

  async createPermission(data: { resourceId: number; action: string }) {
    const resource = await this.prisma.resource.findUnique({ where: { id: data.resourceId } });
    if (!resource) {
      throw new RpcException({ message: 'Tài nguyên không tồn tại', code: GRPC.FAILED_PRECONDITION });
    }
    const action = (data.action || '').trim().toUpperCase();
    if (!action) {
      throw new RpcException({ message: 'Action không được để trống', code: GRPC.FAILED_PRECONDITION });
    }
    const existing = await this.prisma.permission.findUnique({
      where: { action_resourceId: { action, resourceId: data.resourceId } },
    });
    if (existing) {
      throw new RpcException({ message: 'Quyền này đã tồn tại', code: GRPC.ALREADY_EXISTS });
    }
    return this.prisma.permission.create({
      data: { action, resourceId: data.resourceId },
    });
  }

  async deletePermission(id: number) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) return false;
    await this.prisma.permission.delete({ where: { id } });
    return true;
  }
}
