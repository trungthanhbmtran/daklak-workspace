import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import type { PrismaClient as PrismaClientType } from '../src/generated/prisma/client';
import { DEFAULT_KPI_FORM_TEMPLATES, getTemplateXmlContent } from '../src/modules/kpi-evaluations/kpi-template-xml.util';

let PrismaClient: typeof PrismaClientType;
try {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = require('../src/generated/prisma/client').PrismaClient;
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const mariadbUrl = dbUrl.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function syncTemplates() {
  console.log(`Bắt đầu đồng bộ ${DEFAULT_KPI_FORM_TEMPLATES.length} Biểu mẫu XML KPI vào CSDL...`);

  for (const def of DEFAULT_KPI_FORM_TEMPLATES) {
    const xml = getTemplateXmlContent(def.formCode);
    const xmlSize = Buffer.byteLength(xml, 'utf8');

    await prisma.kpiFormTemplate.upsert({
      where: { formCode: def.formCode },
      update: {
        name: def.name,
        description: def.description,
        category: def.category,
        targetRole: def.targetRole,
        schemaVersion: def.schemaVersion || '1.0',
        templateFileId: def.fileName,
        xmlContent: xml,
        status: 'PUBLISHED',
        version: 1,
        organizationId: 'DEFAULT',
      },
      create: {
        formCode: def.formCode,
        name: def.name,
        description: def.description,
        category: def.category,
        targetRole: def.targetRole,
        schemaVersion: def.schemaVersion || '1.0',
        templateFileId: def.fileName,
        xmlContent: xml,
        status: 'PUBLISHED',
        version: 1,
        organizationId: 'DEFAULT',
      },
    });

    await prisma.kpiFormTemplateVersion.upsert({
      where: {
        formCode_version: {
          formCode: def.formCode,
          version: 1,
        },
      },
      update: {
        xmlContent: xml,
        status: 'PUBLISHED',
        publishedBy: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        publishedAt: new Date(),
      },
      create: {
        formCode: def.formCode,
        version: 1,
        xmlContent: xml,
        status: 'PUBLISHED',
        publishedBy: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
        publishedAt: new Date(),
      },
    });

    console.log(`  ✓ Đã đồng bộ [${def.formCode}] (${(xmlSize / 1024).toFixed(1)} KB): ${def.name}`);
  }

  console.log('✅ Hoàn tất đồng bộ 100% Biểu mẫu XML KPI vào CSDL!');
}

syncTemplates()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Lỗi khi đồng bộ biểu mẫu:', e);
    prisma.$disconnect();
    process.exit(1);
  });
