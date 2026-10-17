import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class PbacService {
  constructor(private prisma: PrismaService) {}

  /**
   * Parse policy conditions TRƯỚC khi vào $transaction — parse lỗi → RpcException InvalidArgument.
   */
  private parseConditionsSafe(
    raw: unknown,
    context: string,
  ): Record<string, unknown> | undefined {
    if (raw === undefined || raw === null || raw === '') return undefined;
    if (typeof raw !== 'string') return raw as Record<string, unknown>;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: `Field "conditions" (${context}) is not valid JSON`,
      });
    }
  }

  async createUserGroup(data: any) {
    const exists = await this.prisma.userGroup.findUnique({
      where: { name: data.name },
    });
    if (exists) {
      throw new RpcException({
        code: GrpcStatus.ALREADY_EXISTS,
        message: 'Tên nhóm quyền đã tồn tại',
      });
    }

    // Validate + parse conditions trước khi mở transaction (chống JSON.parse crash trong tx)
    const policyInputs = (data.policies ?? []).map((p: any) => ({
      resourceId: p.resourceId ?? p.resource_id,
      action: p.action,
      effect: p.effect || 'ALLOW',
      conditions: this.parseConditionsSafe(p.conditions, 'user group policy'),
    }));

    const created = await this.prisma.$transaction(async (tx) => {
      const ug = await tx.userGroup.create({
        data: { name: data.name },
      });

      if (policyInputs.length > 0) {
        await tx.userGroup.update({
          where: { id: ug.id },
          data: {
            policies: {
              create: policyInputs,
            },
          },
        });
      }
      return ug;
    });
    return created;
  }

  async findAllUserGroups() {
    const groups = await this.prisma.userGroup.findMany({
      include: {
        _count: {
          select: {
            UserToUserGroup: true,
            policies: true,
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return {
      userGroups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: '', // Legacy support
        usersCount: g._count.UserToUserGroup,
        policiesCount: g._count.policies,
        // Also add underscore versions for grpc
        users_count: g._count.UserToUserGroup,
        policies_count: g._count.policies,
      })),
    };
  }

  async findOneUserGroup(id: number) {
    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      include: {
        policies: {
          include: { resource: true },
        },
      },
    });
    if (!group) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Không tìm thấy nhóm quyền',
      });
    }

    return {
      id: group.id,
      name: group.name,
      description: '',
      policies: group.policies.map((p) => ({
        id: p.id,
        resourceId: p.resourceId,
        resource_id: p.resourceId,
        resourceCode: p.resource?.code ?? '',
        resource_code: p.resource?.code ?? '',
        action: p.action,
        effect: p.effect,
        conditions: p.conditions ? JSON.stringify(p.conditions) : '',
        resource: p.resource,
      })),
    };
  }

  async updateUserGroup(id: number, data: any) {
    // Validate + parse conditions trước khi mở transaction (chống JSON.parse crash giữa tx)
    const newPolicies = Array.isArray(data.policies)
      ? data.policies.map((p: any) => ({
          resourceId: p.resourceId ?? p.resource_id,
          action: p.action,
          effect: p.effect || 'ALLOW',
          conditions: this.parseConditionsSafe(
            p.conditions,
            'user group policy',
          ),
        }))
      : [];

    // Transaction to update policies
    return this.prisma.$transaction(async (tx) => {
      let group = await tx.userGroup.findUnique({
        where: { id },
        include: { policies: true },
      });
      if (!group)
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Not found',
        });

      if (data.name && data.name !== group.name) {
        group = await tx.userGroup.update({
          where: { id },
          data: { name: data.name },
          include: { policies: true },
        });
      }

      if (data.policies) {
        // Find existing policies connected to this userGroup
        const existingPolicyIds = group.policies.map((p) => p.id);

        // Disconnect existing policies
        await tx.userGroup.update({
          where: { id },
          data: {
            policies: {
              disconnect: existingPolicyIds.map((pid) => ({ id: pid })),
            },
          },
        });

        // Gom nhóm toàn bộ policies lại để batch insert trong 1 query duy nhất (Xóa bỏ N+1 query lặp qua từng await; đã parse conditions an toàn TRƯỚC tx)
        if (newPolicies.length > 0) {
          await tx.userGroup.update({
            where: { id },
            data: {
              policies: {
                create: newPolicies,
              },
            },
          });
        }
      }
      return group;
    });
  }

  async deleteUserGroup(id: number) {
    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      include: {
        _count: { select: { UserToUserGroup: true } },
      },
    });

    if (!group)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Not found',
      });
    if (group._count.UserToUserGroup > 0) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: 'Đang có người dùng thuộc nhóm này',
      });
    }

    await this.prisma.userGroup.delete({ where: { id } });
    return { success: true };
  }

  async getResources() {
    const resources = await this.prisma.resource.findMany({
      orderBy: { code: 'asc' },
    });
    return { resources };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createResource(_data: any) {
    return Promise.resolve(null);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateResource(_id: number, _data: any) {
    return Promise.resolve(null);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteResource(_id: number) {
    return Promise.resolve(null);
  }
}
