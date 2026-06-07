import { PrismaClient } from '../generated/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const url = process.env.DATABASE_URL as string;
const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  const configPath = path.join(process.cwd(), 'configs', 'api-permissions.json');
  if (fs.existsSync(configPath)) {
    console.log('Seeding API permissions from json...');
    const data = await fs.promises.readFile(configPath, 'utf8');
    const rules = JSON.parse(data);

    await prisma.apiPermission.deleteMany();

    for (const rule of rules) {
      await prisma.apiPermission.create({
        data: {
          path: rule.path,
          method: rule.method,
          permissions: rule.permissions,
        },
      });
    }
    console.log('API permissions seeded successfully.');
  } else {
    console.log('api-permissions.json not found, skipping seed.');
  }

  // Seed default service endpoints
  console.log('Seeding Service Endpoints...');
  const endpoints = [
    { serviceName: 'auth', endpoint: 'http://user-service:50051' },
    { serviceName: 'users', endpoint: 'http://user-service:50051' },
    { serviceName: 'hrm', endpoint: 'http://hrm-service:50052' },
    { serviceName: 'documents', endpoint: 'http://document-service:50056' },
    { serviceName: 'posts', endpoint: 'http://posts-service:50055' },
    { serviceName: 'media', endpoint: 'http://media-service:50054' },
    { serviceName: 'workflow', endpoint: 'http://workflow-service:50058' },
    { serviceName: 'translate', endpoint: 'http://translate-service:50053' },
    { serviceName: 'ai', endpoint: 'http://ai-service:50059' },
  ];

  await prisma.serviceEndpoint.deleteMany();
  for (const ep of endpoints) {
    await prisma.serviceEndpoint.create({
      data: {
        serviceName: ep.serviceName,
        endpoint: ep.endpoint,
        status: 'ACTIVE'
      }
    });
  }
  console.log('Service Endpoints seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
