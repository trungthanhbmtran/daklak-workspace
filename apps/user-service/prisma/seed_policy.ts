import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../src/generated/prisma/client';

const dbUrl = process.env.DATABASE_URL;
const mariadbUrl = dbUrl!.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
    const resource = await prisma.resource.findUnique({ where: { code: 'WORKFLOW' } });
    if (!resource) throw new Error("Resource WORKFLOW not found");

    const group = await prisma.userGroup.findUnique({ where: { name: 'Lãnh đạo đơn vị' } });
    const groupId = group ? group.id : 1; // Fallback to System Admin if not found

    // Phân quyền Quản lý quy trình (WORKFLOW) cho các chức danh lãnh đạo
    const policy = await prisma.policy.create({
        data: {
            resourceId: resource.id,
            action: 'MANAGE',
            effect: 'ALLOW',
            conditions: {
                "jobTitle.code": {
                    "in": ["GIAM_DOC", "PHO_GIAM_DOC", "TRUONG_PHONG"]
                }
            },
            userGroups: {
                connect: [{ id: groupId }]
            }
        }
    });

    console.log("✅ Đã tạo Policy phân quyền Quản lý quy trình (WORKFLOW) theo chức danh:", policy);
}

main().catch(console.error).finally(() => prisma.$disconnect());
