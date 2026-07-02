import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Start seeding gateway configuration...');

  // 1. Seed Gateway Services (Upstreams)
  const services = [
    { name: 'user-service', url: 'http://user-service:50051', description: 'User & Auth Service' },
    { name: 'hrm-service', url: 'http://hrm-service:50052', description: 'HRM Service' },
    { name: 'workflow-service', url: 'http://workflow-service:50053', description: 'Workflow Engine Service' },
    { name: 'media-service', url: 'http://media-service:50054', description: 'Media Service' },
    { name: 'posts-service', url: 'http://posts-service:50055', description: 'Posts Service' },
    { name: 'document-service', url: 'http://document-service:50056', description: 'Document Service' },
    { name: 'translate-service', url: 'http://translate-service:50057', description: 'Translate Service' },
    { name: 'notification-service', url: 'http://notification-service:50059', description: 'Notification Service' },
  ];

  for (const s of services) {
    await prisma.gatewayService.upsert({
      where: { name: s.name },
      update: { url: s.url, description: s.description },
      create: s,
    });
  }

  // 2. Map Service Names to IDs
  const dbServices = await prisma.gatewayService.findMany();
  const serviceMap = new Map(dbServices.map((s) => [s.name, s.id]));

  // 3. Seed Gateway Routes
  const routes = [
    { path: '/api/v1/external/users/*', stripPath: true, serviceName: 'user-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/auth/*', stripPath: true, serviceName: 'user-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/hrm/*', stripPath: true, serviceName: 'hrm-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/workflow/*', stripPath: true, serviceName: 'workflow-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/media/*', stripPath: true, serviceName: 'media-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/posts/*', stripPath: true, serviceName: 'posts-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/documents/*', stripPath: true, serviceName: 'document-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/notifications/*', stripPath: true, serviceName: 'notification-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
  ];

  for (const r of routes) {
    const serviceId = serviceMap.get(r.serviceName);
    if (!serviceId) continue;

    await prisma.gatewayRoute.upsert({
      where: { path: r.path },
      update: { serviceId, stripPath: r.stripPath, methods: r.methods },
      create: {
        path: r.path,
        stripPath: r.stripPath,
        serviceId,
        methods: r.methods
      },
    });
  }

  // 4. Seed 1 API Key for Demo (Cổng DVC Quốc gia)
  const existingKey = await prisma.apiKey.findFirst();
  if (!existingKey) {
    const dvcKey = 'dvc-quoc-gia-demo-key-' + crypto.randomBytes(8).toString('hex');
    await prisma.apiKey.create({
      data: {
        name: 'Cổng Dịch Vụ Công Quốc Gia (Demo)',
        key: dvcKey,
        description: 'API Key dùng để đồng bộ hồ sơ thử nghiệm',
        isActive: true,
      }
    });
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
