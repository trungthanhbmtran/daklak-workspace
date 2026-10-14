import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../src/generated/prisma/client';
import { seedUserGroups } from './seeds/04-pbac.seed';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Bắt đầu đồng bộ và cập nhật phân quyền PBAC thực tế...');
  
  // 1. Chạy seedUserGroups chuẩn hóa
  await seedUserGroups(prisma);

  // 2. Đồng bộ các nhóm quyền đặc thù Ban Tổ chức Tỉnh ủy nếu đã tồn tại
  const allResources = await prisma.resource.findMany();
  const getResource = (code: string) => allResources.find((r) => r.code === code);

  const ensurePolicies = async (groupName: string, mapping: Record<string, string[]>) => {
    const group = await prisma.userGroup.findUnique({ where: { name: groupName } });
    if (!group) return;

    for (const [resCode, actions] of Object.entries(mapping)) {
      const res = getResource(resCode);
      if (!res) continue;

      for (const action of actions) {
        const existing = await prisma.policy.findFirst({
          where: {
            resourceId: res.id,
            action,
            userGroups: { some: { id: group.id } },
          },
        });

        if (!existing) {
          await prisma.policy.create({
            data: {
              resourceId: res.id,
              action,
              effect: 'ALLOW',
              userGroups: { connect: [{ id: group.id }] },
            },
          });
        }
      }
    }
    console.log(`  ✓ Đã cập nhật quyền chuẩn cho nhóm: [${groupName}]`);
  };

  // Lãnh đạo Ban Tổ chức Tỉnh ủy
  await ensurePolicies('Lãnh đạo Ban Tổ chức Tỉnh ủy', {
    TASK: ['*'],
    HRM_EMPLOYEE: ['VIEW'],
    REPORT: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'EXPORT'],
    DOCUMENT: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'],
    DOC_INCOMING: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'],
    DOC_OUTGOING: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'],
    DOC_INTERNAL: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'],
    DOC_PUBLISH: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'PUBLISH'],
    PLAN: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'],
    MEETING: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE'],
    WORKFLOW: ['VIEW', 'EXECUTE', 'APPROVE'],
    ORGANIZATION: ['VIEW'],
    CATEGORY: ['VIEW'],
  });

  // Lãnh đạo Phòng - BTCTU
  await ensurePolicies('Lãnh đạo Phòng - BTCTU', {
    TASK: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN', 'REASSIGN', 'EVALUATE'],
    HRM_EMPLOYEE: ['VIEW'],
    REPORT: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'],
    DOCUMENT: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'],
    DOC_INCOMING: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'],
    DOC_OUTGOING: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'],
    DOC_INTERNAL: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'],
    DOC_DRAFT: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'ASSIGN'],
    PLAN: ['VIEW', 'CREATE', 'UPDATE'],
    MEETING: ['VIEW', 'CREATE', 'UPDATE'],
    WORKFLOW: ['VIEW', 'EXECUTE'],
    ORGANIZATION: ['VIEW'],
    CATEGORY: ['VIEW'],
  });

  // Chuyên viên Tổ chức đảng, đảng viên - BTCTU
  await ensurePolicies('Chuyên viên Tổ chức đảng, đảng viên - BTCTU', {
    TASK: ['VIEW', 'CREATE', 'UPDATE'],
    HRM_EMPLOYEE: ['VIEW'],
    REPORT: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'],
    DOCUMENT: ['VIEW', 'CREATE', 'UPDATE'],
    DOC_DRAFT: ['VIEW', 'CREATE', 'UPDATE'],
    DOC_INCOMING: ['VIEW'],
    DOC_OUTGOING: ['VIEW'],
    DOC_INTERNAL: ['VIEW'],
    WORKFLOW: ['VIEW', 'EXECUTE'],
    PLAN: ['VIEW'],
    MEETING: ['VIEW'],
    ORGANIZATION: ['VIEW'],
    CATEGORY: ['VIEW'],
  });

  // Chuyên viên Tổ chức cán bộ - BTCTU
  await ensurePolicies('Chuyên viên Tổ chức cán bộ - BTCTU', {
    TASK: ['VIEW', 'CREATE', 'UPDATE'],
    HRM_EMPLOYEE: ['VIEW', 'CREATE', 'UPDATE'],
    REPORT: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'],
    DOCUMENT: ['VIEW', 'CREATE', 'UPDATE'],
    DOC_DRAFT: ['VIEW', 'CREATE', 'UPDATE'],
    DOC_INCOMING: ['VIEW'],
    DOC_OUTGOING: ['VIEW'],
    DOC_INTERNAL: ['VIEW'],
    WORKFLOW: ['VIEW', 'EXECUTE'],
    PLAN: ['VIEW'],
    MEETING: ['VIEW'],
    ORGANIZATION: ['VIEW'],
    CATEGORY: ['VIEW'],
  });

  // Cán bộ Bảo vệ chính trị nội bộ - BTCTU
  await ensurePolicies('Cán bộ Bảo vệ chính trị nội bộ - BTCTU', {
    TASK: ['VIEW', 'CREATE', 'UPDATE'],
    HRM_EMPLOYEE: ['VIEW'],
    REPORT: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'],
    DOCUMENT: ['VIEW', 'CREATE', 'UPDATE'],
    DOC_DRAFT: ['VIEW', 'CREATE', 'UPDATE'],
    DOC_INCOMING: ['VIEW'],
    DOC_OUTGOING: ['VIEW'],
    DOC_INTERNAL: ['VIEW'],
    WORKFLOW: ['VIEW', 'EXECUTE'],
    PLAN: ['VIEW'],
    MEETING: ['VIEW'],
    ORGANIZATION: ['VIEW'],
    CATEGORY: ['VIEW'],
  });

  // Văn thư - Lưu trữ - Kế toán - BTCTU
  await ensurePolicies('Văn thư - Lưu trữ - Kế toán - BTCTU', {
    DOCUMENT: ['*'],
    DOC_INCOMING: ['*'],
    DOC_OUTGOING: ['*'],
    DOC_INTERNAL: ['*'],
    DOC_DRAFT: ['*'],
    DOC_PUBLISH: ['*'],
    DOC_CATEGORIES: ['*'],
    MEETING: ['VIEW', 'CREATE', 'UPDATE'],
    TASK: ['VIEW', 'CREATE', 'UPDATE'],
    REPORT: ['VIEW', 'CREATE', 'EXPORT'],
    HRM_EMPLOYEE: ['VIEW'],
    ORGANIZATION: ['VIEW'],
    CATEGORY: ['VIEW'],
  });

  // Quản trị CNTT & ATTT - BTCTU
  await ensurePolicies('Quản trị CNTT & ATTT - BTCTU', {
    USER: ['*'],
    ROLE: ['*'],
    RESOURCE: ['*'],
    ORGANIZATION: ['*'],
    CATEGORY: ['*'],
    MENU: ['*'],
    HRM_EMPLOYEE: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'],
    TASK: ['VIEW', 'CREATE', 'UPDATE'],
    REPORT: ['VIEW', 'EXPORT'],
    SYSTEM: ['VIEW', 'UPDATE'],
  });

  console.log('✅ Hoàn thành 100% đồng bộ phân quyền PBAC thực tế.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
