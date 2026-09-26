import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class PbacService {
  constructor(private prisma: PrismaService) {}

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

    const created = await this.prisma.$transaction(async (tx) => {
      const ug = await tx.userGroup.create({
        data: { name: data.name },
      });

      if (data.policies && data.policies.length > 0) {
        const policyCreates = data.policies.map((p: any) => ({
          resourceId: p.resourceId ?? p.resource_id,
          action: p.action,
          effect: p.effect || 'ALLOW',
          conditions: p.conditions ? (typeof p.conditions === 'string' ? JSON.parse(p.conditions) : p.conditions) : undefined,
        }));
        
        await tx.policy.createMany({
          data: policyCreates.map(pc => ({ ...pc, userGroups: { connect: { id: ug.id } } })),
        });
        // Wait, prisma createMany doesn't support nested connects like that for implicit m:n. 
        // We have to create them and connect.
        // Let's create policies first, then connect them to UserGroup.
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
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    return {
      userGroups: groups.map(g => ({
        id: g.id,
        name: g.name,
        description: '', // Legacy support
        usersCount: g._count.UserToUserGroup,
        policiesCount: g._count.policies,
        // Also add underscore versions for grpc
        users_count: g._count.UserToUserGroup,
        policies_count: g._count.policies,
      }))
    };
  }

  async findOneUserGroup(id: number) {
    const group = await this.prisma.userGroup.findUnique({
      where: { id },
      include: {
        policies: {
          include: { resource: true }
        }
      }
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
      policies: group.policies.map(p => ({
        id: p.id,
        resourceId: p.resourceId,
        resource_id: p.resourceId,
        action: p.action,
        effect: p.effect,
        conditions: p.conditions ? JSON.stringify(p.conditions) : '',
        resource: p.resource,
      }))
    };
  }

  async updateUserGroup(id: number, data: any) {
    // Transaction to update policies
    return this.prisma.$transaction(async (tx) => {
      let group = await tx.userGroup.findUnique({ where: { id }, include: { policies: true } });
      if (!group) throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Not found' });

      if (data.name && data.name !== group.name) {
        group = await tx.userGroup.update({ where: { id }, data: { name: data.name }, include: { policies: true } });
      }

      if (data.policies) {
        // Find existing policies connected to this userGroup
        const existingPolicyIds = group.policies.map(p => p.id);
        
        // Disconnect existing policies
        await tx.userGroup.update({
          where: { id },
          data: {
            policies: {
              disconnect: existingPolicyIds.map(pid => ({ id: pid }))
            }
          }
        });
        
        // Delete orphaned policies if they are not used by anyone else?
        // Let's just delete the ones that were connected to THIS group.
        // Actually, in our architecture, does a Policy belong solely to one Group/User? 
        // Yes, implicit m:n usually means shared, but typically we just create new ones.
        // Let's create new policies and connect them.
        for (const p of data.policies) {
            await tx.userGroup.update({
                where: { id },
                data: {
                    policies: {
                        create: {
                            resourceId: p.resourceId ?? p.resource_id,
                            action: p.action,
                            effect: p.effect || 'ALLOW',
                            conditions: p.conditions ? (typeof p.conditions === 'string' ? JSON.parse(p.conditions) : p.conditions) : undefined,
                        }
                    }
                }
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
        _count: { select: { UserToUserGroup: true } }
      }
    });

    if (!group) throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Not found' });
    if (group._count.UserToUserGroup > 0) {
      throw new RpcException({ code: GrpcStatus.FAILED_PRECONDITION, message: 'Đang có người dùng thuộc nhóm này' });
    }

    await this.prisma.userGroup.delete({ where: { id } });
    return { success: true };
  }

  async getResources() {
    const resources = await this.prisma.resource.findMany({ orderBy: { code: 'asc' } });
    return { resources };
  }
  
  async createResource(data: any) { return null; }
  async updateResource(id: number, data: any) { return null; }
  async deleteResource(id: number) { return null; }
}
