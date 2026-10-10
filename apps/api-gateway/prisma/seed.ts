import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
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
    { name: 'chat-service', url: 'http://chat-service:50061', description: 'Chat Service' },
    { name: 'report-service', url: 'http://report-service:50062', description: 'Report Service' },
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
    { path: '/api/v1/external/chat/*', stripPath: true, serviceName: 'chat-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
    { path: '/api/v1/external/reports/*', stripPath: true, serviceName: 'report-service', methods: 'GET,POST,PUT,DELETE,PATCH' },
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

  // 4. Seed 1 API Key for Demo (Cá»•ng DVC Quá»‘c gia)
  const existingKey = await prisma.apiKey.findFirst();
  if (!existingKey) {
    const dvcKey = 'dvc-quoc-gia-demo-key-' + crypto.randomBytes(8).toString('hex');
    await prisma.apiKey.create({
      data: {
        name: 'Cá»•ng Dá»‹ch Vá»¥ CÃ´ng Quá»‘c Gia (Demo)',
        key: dvcKey,
        description: 'API Key dÃ¹ng Ä‘á»ƒ Ä‘á»“ng bá»™ há»“ sÆ¡ thá»­ nghiá»‡m',
        isActive: true,
      }
    });
  }

  
  // 5. Seed Real Internal Routes Extracted from API Gateway Controllers
  const realRoutes = [
    { path: '/api/v1/admin/ai/generate', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/ai/execute', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/ai/jobs/:jobId', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/ai/models', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/integration/services', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/integration/services', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/integration/services/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/integration/services/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/integration/routes', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/integration/routes', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/integration/routes/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/integration/routes/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/integration/apikeys', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/integration/apikeys', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/integration/apikeys/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/integration/apikeys/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/interactions/comments', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/interactions/comments/:id/status', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/interactions/comments/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/interactions/questions', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/interactions/questions/:id/answer', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/interactions/questions/:id', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/interactions/feedbacks', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/interactions/feedbacks/:id/status', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/portal-configs/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/portal-configs/upsert', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/portal-configs/batch-upsert', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/portal-menus/quick-setup', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/portal-menus/:id', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/portal-menus/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/portal-menus/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/public/interactions/questions', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/public/interactions/questions', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/public/portal-menus/tree', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/translate/jobs/:jobId', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/ai-assistants/:id', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/ai-assistants/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/ai-assistants/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/ai-assistants/:id/knowledge-sources', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/ai-assistants/knowledge-sources/:sourceId', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/ai-assistants/:id/chat', stripPath: false, serviceName: 'core-service', methods: 'POST' },
    { path: '/api/v1/admin/categories/groups', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/categories/groups/:code', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/categories/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/categories/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/integrations/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/integrations/:id/active', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/integrations/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/menus/tree', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/menus/me', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/menus/hub', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/menus/sidebar', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/menus/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/menus/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/policys/:id', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/policys/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/policys/:id', stripPath: false, serviceName: 'core-service', methods: 'DELETE' },
    { path: '/api/v1/admin/resources/permission-matrix', stripPath: false, serviceName: 'core-service', methods: 'GET' },
    { path: '/api/v1/admin/resources/:id', stripPath: false, serviceName: 'core-service', methods: 'PUT' },
    { path: '/api/v1/admin/api-management/connections/:id', stripPath: false, serviceName: 'api-gateway', methods: 'GET' },
    { path: '/api/v1/admin/api-management/connections/:id', stripPath: false, serviceName: 'api-gateway', methods: 'PUT' },
    { path: '/api/v1/admin/api-management/connections/:id', stripPath: false, serviceName: 'api-gateway', methods: 'DELETE' },
    { path: '/api/v1/admin/api-management/connections/:id/disable', stripPath: false, serviceName: 'api-gateway', methods: 'PUT' },
    { path: '/api/v1/admin/api-management/connections/:id/endpoints', stripPath: false, serviceName: 'api-gateway', methods: 'POST' },
    { path: '/api/v1/admin/api-management/connections/endpoints/:endpointId', stripPath: false, serviceName: 'api-gateway', methods: 'PUT' },
    { path: '/api/v1/admin/api-management/connections/endpoints/:endpointId', stripPath: false, serviceName: 'api-gateway', methods: 'DELETE' },
    { path: '/api/v1/admin/api-management/connections/publish', stripPath: false, serviceName: 'api-gateway', methods: 'POST' },
    { path: '/api/v1/admin/api-management/connections/import/upload', stripPath: false, serviceName: 'api-gateway', methods: 'POST' },
    { path: '/api/v1/admin/api-management/connections/import/commit', stripPath: false, serviceName: 'api-gateway', methods: 'POST' },
    { path: '/api/v1/admin/api-management/partners/:id/keys', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/api-management/partners/keys/:keyId/revoke', stripPath: false, serviceName: 'user-service', methods: 'PUT' },
    { path: '/api/v1/admin/auth/login', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/auth/refresh', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/auth/logout', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/auth/me', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/auth/sso/providers', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/auth/sso/:id/start', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/auth/sso/:id/callback', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/unit-types', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/tree', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/job-titles', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/unit-types/:id/job-templates', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/unit-types/:id/job-templates', stripPath: false, serviceName: 'user-service', methods: 'PUT' },
    { path: '/api/v1/admin/organizations/job-titles/:id', stripPath: false, serviceName: 'user-service', methods: 'PUT' },
    { path: '/api/v1/admin/organizations/code/:code', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/detail/:identifier', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/:id', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/:id', stripPath: false, serviceName: 'user-service', methods: 'PUT' },
    { path: '/api/v1/admin/organizations/:id', stripPath: false, serviceName: 'user-service', methods: 'DELETE' },
    { path: '/api/v1/admin/organizations/:id/scope', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/:id/scope', stripPath: false, serviceName: 'user-service', methods: 'PUT' },
    { path: '/api/v1/admin/organizations/:id/subtree', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/staffing', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/organizations/:id/staffing-report', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/organizations/staffing-slots', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/users/:id', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/users/:id/policies', stripPath: false, serviceName: 'user-service', methods: 'GET' },
    { path: '/api/v1/admin/users/:id/assign-position', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/users/:id/active', stripPath: false, serviceName: 'user-service', methods: 'PATCH' },
    { path: '/api/v1/admin/users/:id/assign-user-groups', stripPath: false, serviceName: 'user-service', methods: 'POST' },
    { path: '/api/v1/admin/users/:id', stripPath: false, serviceName: 'user-service', methods: 'PUT' },
    { path: '/api/v1/admin/users/:id', stripPath: false, serviceName: 'user-service', methods: 'DELETE' },
    { path: '/api/v1/admin/chat/conversation', stripPath: false, serviceName: 'chat-service', methods: 'POST' },
    { path: '/api/v1/admin/chat/conversation/:id', stripPath: false, serviceName: 'chat-service', methods: 'GET' },
    { path: '/api/v1/admin/chat/conversation/:id/messages', stripPath: false, serviceName: 'chat-service', methods: 'GET' },
    { path: '/api/v1/admin/chat/message', stripPath: false, serviceName: 'chat-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/consultations/public-comments', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/consultations/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/consultations/:id/responses', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/consultations/:id/responses', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/consultations/:id/public-comments', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/consultations/public-comments/:id/moderate', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/categories/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/categories/:id', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/categories/:id', stripPath: false, serviceName: 'document-service', methods: 'DELETE' },
    { path: '/api/v1/admin/documents/procedures/list', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/procedures/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/procedures', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/procedures/:id', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/procedures/:id', stripPath: false, serviceName: 'document-service', methods: 'DELETE' },
    { path: '/api/v1/admin/documents/dossiers/list', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/dossiers/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/dossiers', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/dossiers/:id', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/dossiers/:id', stripPath: false, serviceName: 'document-service', methods: 'DELETE' },
    { path: '/api/v1/admin/documents/cabinet', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/cabinet', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/cabinet/:id', stripPath: false, serviceName: 'document-service', methods: 'DELETE' },
    { path: '/api/v1/admin/documents/dossiers/:id/components', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/dossiers/components/:compId', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/dossiers/from-template', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/dossiers/create-blank', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/dossiers/:id/components', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/:id', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/extract', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/admin/documents/:id/logs', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/:id', stripPath: false, serviceName: 'document-service', methods: 'DELETE' },
    { path: '/api/v1/admin/documents/minutes/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/documents/minutes/:id', stripPath: false, serviceName: 'document-service', methods: 'PUT' },
    { path: '/api/v1/admin/documents/minutes/:id', stripPath: false, serviceName: 'document-service', methods: 'DELETE' },
    { path: '/api/v1/public/documents/consultations/:id/comments', stripPath: false, serviceName: 'document-service', methods: 'POST' },
    { path: '/api/v1/public/documents/procedures', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/public/documents/procedures/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/public/documents/dossiers/:code', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/public/documents/:id', stripPath: false, serviceName: 'document-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/employees/:id', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/employees/:id', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/employees/:id', stripPath: false, serviceName: 'hrm-service', methods: 'DELETE' },
    { path: '/api/v1/admin/hrm/master-plans/:id', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/master-plans/:id', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/rank-quotas/:rankCode', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/task-templates/bulk', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/task-templates/:id', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/task-templates/:id', stripPath: false, serviceName: 'hrm-service', methods: 'DELETE' },
    { path: '/api/v1/admin/hrm/tasks/kpi/variables', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/tasks/kpi/global-settings', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/tasks/kpi/global-settings', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/tasks/:id/extend', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/tasks/:id/status', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/tasks/:id/respond', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/tasks/:id/assign', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/tasks/:id/breakdown', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/tasks/:id/coordinate', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/tasks/:id/subtasks', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/tasks/:id/history', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/tasks/:id/steps', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/tasks/:id/steps', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/tasks/:id/steps/:stepId', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/tasks/:id/attend', stripPath: false, serviceName: 'hrm-service', methods: 'POST' },
    { path: '/api/v1/admin/hrm/tasks/:id/attendance-stats', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/hrm/tasks/:id', stripPath: false, serviceName: 'hrm-service', methods: 'PUT' },
    { path: '/api/v1/admin/hrm/tasks/:id', stripPath: false, serviceName: 'hrm-service', methods: 'GET' },
    { path: '/api/v1/admin/media/download/:id', stripPath: false, serviceName: 'media-service', methods: 'GET' },
    { path: '/api/v1/admin/media/request-upload', stripPath: false, serviceName: 'media-service', methods: 'POST' },
    { path: '/api/v1/admin/media/confirm-upload', stripPath: false, serviceName: 'media-service', methods: 'POST' },
    { path: '/api/v1/admin/media/init-multipart-upload', stripPath: false, serviceName: 'media-service', methods: 'POST' },
    { path: '/api/v1/admin/media/get-multipart-urls', stripPath: false, serviceName: 'media-service', methods: 'POST' },
    { path: '/api/v1/admin/media/complete-multipart-upload', stripPath: false, serviceName: 'media-service', methods: 'POST' },
    { path: '/api/v1/admin/media/:id', stripPath: false, serviceName: 'media-service', methods: 'GET' },
    { path: '/api/v1/admin/notifications/read-all', stripPath: false, serviceName: 'notification-service', methods: 'PATCH' },
    { path: '/api/v1/admin/notifications/:id/read', stripPath: false, serviceName: 'notification-service', methods: 'PATCH' },
    { path: '/api/v1/admin/banners/:id', stripPath: false, serviceName: 'posts-service', methods: 'GET' },
    { path: '/api/v1/admin/banners/:id', stripPath: false, serviceName: 'posts-service', methods: 'PUT' },
    { path: '/api/v1/admin/banners/:id', stripPath: false, serviceName: 'posts-service', methods: 'DELETE' },
    { path: '/api/v1/admin/posts/categories/:id', stripPath: false, serviceName: 'posts-service', methods: 'GET' },
    { path: '/api/v1/admin/posts/categories/:id', stripPath: false, serviceName: 'posts-service', methods: 'PUT' },
    { path: '/api/v1/admin/posts/categories/:id', stripPath: false, serviceName: 'posts-service', methods: 'DELETE' },
    { path: '/api/v1/admin/posts/:id', stripPath: false, serviceName: 'posts-service', methods: 'GET' },
    { path: '/api/v1/admin/posts/:id', stripPath: false, serviceName: 'posts-service', methods: 'PUT' },
    { path: '/api/v1/admin/posts/:id', stripPath: false, serviceName: 'posts-service', methods: 'DELETE' },
    { path: '/api/v1/admin/posts/:id/submit', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/posts/:id/review', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/posts/:id/approve', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/posts/:id/reject', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/posts/:id/publish', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/posts/:id/unpublish', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/posts/:id/history', stripPath: false, serviceName: 'posts-service', methods: 'GET' },
    { path: '/api/v1/public/posts/slug/:slug', stripPath: false, serviceName: 'posts-service', methods: 'GET' },
    { path: '/api/v1/public/posts/:id', stripPath: false, serviceName: 'posts-service', methods: 'GET' },
    { path: '/api/v1/public/posts/:id/view', stripPath: false, serviceName: 'posts-service', methods: 'POST' },
    { path: '/api/v1/admin/reports/table/sources', stripPath: false, serviceName: 'report-service', methods: 'POST' },
    { path: '/api/v1/admin/reports/table/preview', stripPath: false, serviceName: 'report-service', methods: 'POST' },
    { path: '/api/v1/admin/reports/templates', stripPath: false, serviceName: 'report-service', methods: 'POST' },
    { path: '/api/v1/admin/reports/templates', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/templates/widgets', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/templates/:id', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/templates/:id', stripPath: false, serviceName: 'report-service', methods: 'PUT' },
    { path: '/api/v1/admin/reports/templates/:id', stripPath: false, serviceName: 'report-service', methods: 'DELETE' },
    { path: '/api/v1/admin/reports/tasks', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/posts', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/kpis', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/documents', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/employee-quality', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/definitions', stripPath: false, serviceName: 'report-service', methods: 'POST' },
    { path: '/api/v1/admin/reports/definitions', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/catalog', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/definitions/:id', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/runs', stripPath: false, serviceName: 'report-service', methods: 'POST' },
    { path: '/api/v1/admin/reports/runs/:id/status', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/runs/:runId/snapshot', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/dashboard-stats', stripPath: false, serviceName: 'report-service', methods: 'GET' },
    { path: '/api/v1/admin/reports/document/generate', stripPath: false, serviceName: 'report-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/catalog/process-types', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/catalog/process-types', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/catalog/process-types/:code', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/bindings', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/bindings', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/bindings/:id', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/bindings/:id/deactivate', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/instances/start-by-type', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/instances/:instanceId/action', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/services', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/triggers', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/modules', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/org-roles', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/:id', stripPath: false, serviceName: 'workflow-service', methods: 'PUT' },
    { path: '/api/v1/admin/workflow/instances/:instanceId/resume/:nodeId', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/instances', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/instances/:id', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/instances/:instanceId/logs', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/:id', stripPath: false, serviceName: 'workflow-service', methods: 'GET' },
    { path: '/api/v1/admin/workflow/:id', stripPath: false, serviceName: 'workflow-service', methods: 'DELETE' },
    { path: '/api/v1/admin/workflow/:id/publish', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/:id/apply-module', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
    { path: '/api/v1/admin/workflow/:id/start', stripPath: false, serviceName: 'workflow-service', methods: 'POST' },
  ];


  for (const r of realRoutes) {
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
