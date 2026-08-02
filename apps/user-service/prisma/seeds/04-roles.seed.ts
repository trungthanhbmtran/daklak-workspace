import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedRoles(prisma: PrismaClient) {

  const _resources = await prisma.resource.findMany();
  const resources: Record<string, any> = {};
  for (const r of _resources) resources[r.code] = r;


  
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {
      name: 'Super Administrator',
    },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {
      name: 'Quản trị viên hệ thống',
    },
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên hệ thống',
    },
  });

  const orgAdminRole = await prisma.role.upsert({
    where: { code: 'ORG_ADMIN' },
    update: {
      name: 'Quản trị viên đơn vị',
    },
    create: {
      code: 'ORG_ADMIN',
      name: 'Quản trị viên đơn vị',
    },
  });

  // Gán đầy đủ policies cho ADMIN role
  // Policy<->Role là many-to-many nên phải dùng findFirst/create + role.update connect
  const adminResourceCodes = [
    'SYSTEM', 'USER', 'ROLE', 'RESOURCE', 'MENU', 'ORGANIZATION', 'CATEGORY', 'NOTIFICATION', 'API_GATEWAY',
    'DOCUMENT', 'DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_DRAFT', 'DOC_TEMPLATE', 'DOC_PUBLISH', 'DOC_PROCESSING', 'DOC_TRANSPARENCY', 'DOC_CONSULTATION', 'DOC_MINUTES', 'DOC_CATEGORIES',
    'HRM_EMPLOYEE',
    'POST', 'POST_CATEGORY', 'BANNER', 'PORTAL_MENU', 'CITIZEN_INTERACTION',
    'INTEGRATION', 'TASK', 'PROJECT', 'PLAN', 'WORKFLOW', 'OBJECTIVE', 'KPI', 'REPORT'
  ];
  const adminActions = ['READ', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'PUBLISH', 'APPROVE'];
  const adminPolicyIds: number[] = [];
  for (const resCode of adminResourceCodes) {
    const resId = resources[resCode]?.id;
    if (!resId) continue;
    for (const action of adminActions) {
      let policy = await prisma.policy.findFirst({ where: { resourceId: resId, action, effect: 'ALLOW' } });
      if (!policy) {
        policy = await prisma.policy.create({ data: { resourceId: resId, action, effect: 'ALLOW' } });
      }
      adminPolicyIds.push(policy.id);
    }
  }
  if (adminPolicyIds.length > 0) {
    await prisma.role.update({
      where: { id: adminRole.id },
      data: { policies: { connect: adminPolicyIds.map(id => ({ id })) } },
    });
  }

  // Gán policies cho ORG_ADMIN (Giới hạn trong đơn vị)
  const orgAdminPolicyIds: number[] = [];
  for (const resCode of adminResourceCodes) {
    const resId = resources[resCode]?.id;
    if (!resId) continue;
    for (const action of adminActions) {
      let policy = await prisma.policy.findFirst({
        where: { resourceId: resId, action, effect: 'ALLOW', conditions: { equals: { expression: 'targetUser.unitCode STARTSWITH user.unitCode' } } }
      });
      if (!policy) {
        policy = await prisma.policy.create({
          data: { resourceId: resId, action, effect: 'ALLOW', conditions: { expression: 'targetUser.unitCode STARTSWITH user.unitCode' } }
        });
      }
      orgAdminPolicyIds.push(policy.id);
    }
  }
  if (orgAdminPolicyIds.length > 0) {
    await prisma.role.update({
      where: { id: orgAdminRole.id },
      data: { policies: { connect: orgAdminPolicyIds.map(id => ({ id })) } },
    });
  }

  // --- CMS ROLES ---
  const cmsRoles = [
    {
      code: 'AUTHOR',
      name: 'Biên tập viên',
      permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW'],
    },
    {
      code: 'REVIEWER',
      name: 'Thẩm định & Phê duyệt',
      permissions: ['READ', 'VIEW', 'UPDATE', 'APPROVE', 'REJECT'],
    },
    {
      code: 'PUBLISHER',
      name: 'Cán bộ xuất bản',
      permissions: ['READ', 'VIEW', 'PUBLISH'],
    },
  ];

  const workflowAppRoles = [
    {
      code: 'TASK:MANAGE',
      name: 'Quản lý toàn bộ công việc',
      resource: 'TASK',
      permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE'],
    },
    {
      code: 'TASK:APPROVE',
      name: 'Phê duyệt công việc',
      resource: 'TASK',
      permissions: ['READ', 'UPDATE', 'VIEW', 'APPROVE'],
    },
    {
      code: 'TASK:EDIT',
      name: 'Chỉnh sửa công việc',
      resource: 'TASK',
      permissions: ['READ', 'UPDATE', 'VIEW'],
    },
    {
      code: 'TASK:DELETE',
      name: 'Xóa công việc',
      resource: 'TASK',
      permissions: ['READ', 'DELETE'],
    },
    {
      code: 'TASK:EXECUTE',
      name: 'Thực thi công việc',
      resource: 'TASK',
      permissions: ['READ', 'UPDATE', 'VIEW'],
    },
    {
      code: 'TASK:*',
      name: 'Toàn quyền công việc (Wildcard)',
      resource: 'TASK',
      permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE'],
    }
  ];

  const roleMap: Record<string, any> = {
    SUPER_ADMIN: superAdminRole,
    ADMIN: adminRole,
    ORG_ADMIN: orgAdminRole,
  };

  const cmsResources = ['POST', 'POST_CATEGORY', 'BANNER', 'PORTAL_MENU', 'CITIZEN_INTERACTION'];
  for (const r of cmsRoles) {
    const rolePoliciesData: { resourceId: number; action: string; effect: string; conditions?: any }[] = [];
    for (const resCode of cmsResources) {
      const resId = resources[resCode]?.id;
      if (!resId) continue;
      for (const action of r.permissions) {
        let conditionString = '';
        if (r.code === 'AUTHOR' && ['UPDATE', 'DELETE'].includes(action)) {
          conditionString = 'resource.createdBy == currentUserId'; // Người tạo
        } else if (r.code === 'REVIEWER' && ['UPDATE', 'APPROVE', 'REJECT'].includes(action)) {
          conditionString = 'user.positionLevel >= 3'; // Chức vụ / Phòng ban
        }

        rolePoliciesData.push({
          resourceId: resId,
          action: action === 'REJECT' ? 'UPDATE' : action,
          effect: 'ALLOW',
          conditions: conditionString ? { expression: conditionString } : null
        });
      }
    }

    const createdRole = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: {
        code: r.code,
        name: r.name,
        policies: { create: rolePoliciesData },
      },
    });
    roleMap[r.code] = createdRole;
  }

  // --- Seed Workflow App Roles ---
  for (const r of workflowAppRoles) {
    const rolePoliciesData: { resourceId: number; action: string; effect: string }[] = [];
    const resId = resources[r.resource]?.id;
    if (resId) {
      for (const action of r.permissions) {
        rolePoliciesData.push({
          resourceId: resId,
          action: action,
          effect: 'ALLOW'
        });
      }
    }

    const createdRole = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: {
        code: r.code,
        name: r.name,
        policies: { create: rolePoliciesData },
      },
    });
    roleMap[r.code] = createdRole;
  }

  // NOTE: LEADER / MANAGER / STAFF roles được định nghĩa trong PBAC Engine (bên dưới)
  // Không seed riêng ở đây để tránh bị overwrite và mất điều kiện PBAC


  
}
