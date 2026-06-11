import * as bcrypt from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-require-imports
let PrismaClient: any;
try {
  PrismaClient = require('@generated/prisma/client').PrismaClient;
} catch (e) {
  try {
    PrismaClient = require('../generated/prisma/client').PrismaClient;
  } catch (e2) {
    PrismaClient = require('@prisma/client').PrismaClient;
  }
}
import * as dotenv from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(url),
});

const DEFAULT_PASSWORD = 'Admin@123';

async function main() {
  console.log('≡ƒî▒ START COMPREHENSIVE E-GOV SEED');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ==========================================================
  // 1. RESOURCES
  // ==========================================================
  const resourcesData = [
    // System & Admin
    { code: 'SYSTEM', name: 'Hß╗ç thß╗æng', serviceCode: 'USER_SERVICE' },
    { code: 'USER', name: 'Quß║ún l├╜ Ng╞░ß╗¥i d├╣ng', serviceCode: 'USER_SERVICE' },
    { code: 'ROLE', name: 'Quß║ún l├╜ Vai tr├▓', serviceCode: 'USER_SERVICE' },
    { code: 'RESOURCE', name: 'Quß║ún l├╜ T├ái nguy├¬n', serviceCode: 'USER_SERVICE' },
    { code: 'MENU', name: 'Quß║ún l├╜ Menu', serviceCode: 'USER_SERVICE' },
    { code: 'ORGANIZATION', name: 'C├óy tß╗ò chß╗⌐c', serviceCode: 'USER_SERVICE' },
    { code: 'CATEGORY', name: 'Danh mß╗Ñc hß╗ç thß╗æng', serviceCode: 'USER_SERVICE' },
    { code: 'NOTIFICATION', name: 'Th├┤ng b├ío hß╗ç thß╗æng', serviceCode: 'USER_SERVICE' },

    // Document Management
    { code: 'DOCUMENT', name: 'Quß║ún l├╜ V─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_INCOMING', name: 'V─ân bß║ún ─æß║┐n', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_OUTGOING', name: 'V─ân bß║ún ─æi', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_INTERNAL', name: 'V─ân bß║ún nß╗Öi bß╗Ö', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_DRAFT', name: 'Dß╗▒ thß║úo v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_TEMPLATE', name: 'Biß╗âu mß║½u v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_PUBLISH', name: 'Ph├ít h├ánh v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_PROCESSING', name: 'Xß╗¡ l├╜ v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_TRANSPARENCY', name: 'C├┤ng khai v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_CONSULTATION', name: 'Lß║Ñy ├╜ kiß║┐n v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_MINUTES', name: 'Bi├¬n bß║ún cuß╗Öc hß╗ìp', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_CATEGORIES', name: 'Danh mß╗Ñc v─ân bß║ún', serviceCode: 'DOCUMENT_SERVICE' },

    // HRM
    { code: 'HRM_EMPLOYEE', name: 'Quß║ún l├╜ Nh├ón sß╗▒', serviceCode: 'HRM_SERVICE' },

    // CMS
    { code: 'POST', name: 'Quß║ún l├╜ B├ái viß║┐t', serviceCode: 'CONTENT_SERVICE' },
    { code: 'POST_CATEGORY', name: 'Quß║ún l├╜ Chuy├¬n mß╗Ñc', serviceCode: 'CONTENT_SERVICE' },
    { code: 'BANNER', name: 'Quß║ún l├╜ Banner & Quß║úng c├ío', serviceCode: 'CONTENT_SERVICE' },
    { code: 'PORTAL_MENU', name: 'Quß║ún l├╜ Portal Menu', serviceCode: 'CONTENT_SERVICE' },
    { code: 'CITIZEN_INTERACTION', name: 'T╞░╞íng t├íc c├┤ng d├ón', serviceCode: 'CONTENT_SERVICE' },

    // Integration & Workflow
    { code: 'INTEGRATION', name: 'Li├¬n th├┤ng hß╗ç thß╗æng', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'TASK', name: 'C├┤ng viß╗çc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'PROJECT', name: 'Dß╗▒ ├ín', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'PLAN', name: 'Kß║┐ hoß║ích c├┤ng t├íc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'WORKFLOW', name: 'Quy tr├¼nh c├┤ng viß╗çc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'OBJECTIVE', name: 'Mß╗Ñc ti├¬u', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'KPI', name: 'KPI', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'REPORT', name: 'B├ío c├ío', serviceCode: 'WORKFLOW_SERVICE' },
  ];

  const resources: Record<string, { id: number; code: string; name: string; serviceCode?: string | null }> = {};
  for (const res of resourcesData) {
    const created = await prisma.resource.upsert({
      where: { code: res.code },
      update: { name: res.name, serviceCode: res.serviceCode },
      create: {
        code: res.code,
        name: res.name,
        serviceCode: res.serviceCode,
      },
    });
    resources[res.code] = created;
  }

  // ==========================================================
  // 2. PERMISSIONS (CRUD for all)
  // ==========================================================
  const actions = [
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'VIEW',
    'APPROVE',
    'MANAGE',
    'ASSIGN',
    'PROCESS',
    'REJECT',
    'PUBLISH'
  ];
  for (const res of Object.values(resources)) {
    for (const action of actions) {
      // Logic constraint: SYSTEM only has VIEW/MANAGE
      if (res.code === 'SYSTEM' && !['VIEW', 'MANAGE'].includes(action))
        continue;

      await prisma.permission.upsert({
        where: { action_resourceId: { action, resourceId: res.id } },
        update: {},
        create: { action, resourceId: res.id },
      });
    }
  }

  // ==========================================================
  // 3. COMMON CATEGORIES (E-GOV STANDARD)
  // ==========================================================
  const categoriesData = [
    // --- SYSTEM & MANAGEMENT ---
    {
      group: 'STATUS',
      code: 'ACTIVE',
      order: 1,
      nameVi: 'Hoß║ít ─æß╗Öng',
      nameEn: 'Active',
    },
    {
      group: 'STATUS',
      code: 'INACTIVE',
      order: 2,
      nameVi: 'Ng╞░ng hoß║ít ─æß╗Öng',
      nameEn: 'Inactive',
    },
    {
      group: 'STATUS',
      code: 'PENDING',
      order: 3,
      nameVi: 'Chß╗¥ xß╗¡ l├╜',
      nameEn: 'Pending',
    },
    {
      group: 'STATUS',
      code: 'LOCKED',
      order: 4,
      nameVi: '─É├ú kh├│a',
      nameEn: 'Locked',
    },

    // --- TASK ROLES ---
    {
      group: 'TASK_ROLE',
      code: 'ASSIGNEE',
      order: 1,
      nameVi: 'Ng╞░ß╗¥i xß╗¡ l├╜ ch├¡nh',
      nameEn: 'Assignee',
    },
    {
      group: 'TASK_ROLE',
      code: 'OWNER',
      order: 2,
      nameVi: 'Ng╞░ß╗¥i giao viß╗çc',
      nameEn: 'Owner',
    },
    {
      group: 'TASK_ROLE',
      code: 'APPROVER',
      order: 3,
      nameVi: 'Ng╞░ß╗¥i theo d├╡i/Chß╗ë ─æß║ío',
      nameEn: 'Approver',
    },
    {
      group: 'TASK_ROLE',
      code: 'COORDINATOR',
      order: 4,
      nameVi: 'Ng╞░ß╗¥i phß╗æi hß╗úp',
      nameEn: 'Coordinator',
    },

    // --- TASK STATUS ---
    {
      group: 'TASK_STATUS',
      code: 'UNASSIGNED',
      order: 1,
      nameVi: 'Ch╞░a giao',
      nameEn: 'Unassigned',
    },
    {
      group: 'TASK_STATUS',
      code: 'PENDING',
      order: 2,
      nameVi: 'Chß╗¥ xß╗¡ l├╜',
      nameEn: 'Pending',
    },
    {
      group: 'TASK_STATUS',
      code: 'PROCESSING',
      order: 3,
      nameVi: '─Éang xß╗¡ l├╜',
      nameEn: 'Processing',
    },
    {
      group: 'TASK_STATUS',
      code: 'DONE',
      order: 4,
      nameVi: 'Ho├án th├ánh',
      nameEn: 'Done',
    },
    {
      group: 'TASK_STATUS',
      code: 'REJECTED',
      order: 5,
      nameVi: 'Tß╗½ chß╗æi',
      nameEn: 'Rejected',
    },
    {
      group: 'TASK_STATUS',
      code: 'RETURNED',
      order: 6,
      nameVi: 'Trß║ú lß║íi (Y├¬u cß║ºu l├ám lß║íi)',
      nameEn: 'Returned',
    },
    {
      group: 'TASK_STATUS',
      code: 'CANCELED',
      order: 7,
      nameVi: 'Hß╗ºy bß╗Å',
      nameEn: 'Canceled',
    },
    {
      group: 'TASK_STATUS',
      code: 'OVERDUE',
      order: 8,
      nameVi: 'Qu├í hß║ín',
      nameEn: 'Overdue',
    },

    {
      group: 'SYSTEM_ACTION',
      code: 'LOGIN',
      order: 1,
      nameVi: '─É─âng nhß║¡p',
      nameEn: 'Login',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'LOGOUT',
      order: 2,
      nameVi: '─É─âng xuß║Ñt',
      nameEn: 'Logout',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'CREATE',
      order: 3,
      nameVi: 'Tß║ío mß╗¢i',
      nameEn: 'Create',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'UPDATE',
      order: 4,
      nameVi: 'Cß║¡p nhß║¡t',
      nameEn: 'Update',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'DELETE',
      order: 5,
      nameVi: 'X├│a',
      nameEn: 'Delete',
    },

    {
      group: 'MICROSERVICE',
      code: 'USER_SERVICE',
      order: 1,
      nameVi: 'Dß╗ïch vß╗Ñ Ng╞░ß╗¥i d├╣ng',
      nameEn: 'User Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'HRM_SERVICE',
      order: 2,
      nameVi: 'Dß╗ïch vß╗Ñ Nh├ón sß╗▒',
      nameEn: 'HRM Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'DOCUMENT_SERVICE',
      order: 3,
      nameVi: 'Dß╗ïch vß╗Ñ V─ân bß║ún',
      nameEn: 'Document Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'POST_SERVICE',
      order: 4,
      nameVi: 'Dß╗ïch vß╗Ñ Nß╗Öi dung',
      nameEn: 'Content Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'WORKFLOW_SERVICE',
      order: 5,
      nameVi: 'Dß╗ïch vß╗Ñ Quy tr├¼nh',
      nameEn: 'Workflow Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'INTEGRATION_SERVICE',
      order: 6,
      nameVi: 'Dß╗ïch vß╗Ñ Li├¬n th├┤ng',
      nameEn: 'Integration Service',
    },

    // --- AI & TRANSLATION ---
    {
      group: 'AI_PROVIDER_TYPE',
      code: 'OPENAI',
      order: 1,
      nameVi: 'OpenAI (GPT)',
      nameEn: 'OpenAI (GPT)',
    },
    {
      group: 'AI_PROVIDER_TYPE',
      code: 'GEMINI',
      order: 2,
      nameVi: 'Google Gemini',
      nameEn: 'Google Gemini',
    },
    {
      group: 'AI_PROVIDER_TYPE',
      code: 'CLAUDE',
      order: 3,
      nameVi: 'Anthropic Claude',
      nameEn: 'Anthropic Claude',
    },
    {
      group: 'TRANSLATION_SERVICE_TYPE',
      code: 'GOOGLE',
      order: 1,
      nameVi: 'Google Translate API',
      nameEn: 'Google Translate API',
    },
    {
      group: 'TRANSLATION_SERVICE_TYPE',
      code: 'DEEPL',
      order: 2,
      nameVi: 'DeepL Pro',
      nameEn: 'DeepL Pro',
    },
    {
      group: 'TRANSLATION_SERVICE_TYPE',
      code: 'AI_ROUTER',
      order: 3,
      nameVi: 'D├╣ng chung hß╗ç thß╗æng AI Smart Router',
      nameEn: 'Use AI Smart Router',
    },

    // --- GEOGRAPHIC DATA ---
    {
      group: 'PROVINCE',
      code: '47',
      order: 1,
      nameVi: 'Tß╗ënh ─Éß║»k Lß║»k',
      nameEn: 'Dak Lak Province',
    },
    {
      group: 'PROVINCE',
      code: '01',
      order: 2,
      nameVi: 'Th├ánh phß╗æ H├á Nß╗Öi',
      nameEn: 'Hanoi City',
    },
    {
      group: 'PROVINCE',
      code: '79',
      order: 3,
      nameVi: 'Th├ánh phß╗æ Hß╗ô Ch├¡ Minh',
      nameEn: 'Ho Chi Minh City',
    },

    {
      group: 'GEO_AREA',
      code: '24001',
      order: 1,
      nameVi: 'Ph╞░ß╗¥ng Bu├┤n Ma Thuß╗Öt',
      nameEn: 'Buon Ma Thuot GEO_AREA',
    },

    // --- DOCUMENTS ---
    {
      group: 'DOCUMENT_TYPE',
      code: 'QUYET_DINH',
      order: 1,
      nameVi: 'Quyß║┐t ─æß╗ïnh',
      nameEn: 'Decision',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'NGHI_QUYET',
      order: 2,
      nameVi: 'Nghß╗ï quyß║┐t',
      nameEn: 'Resolution',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'CONG_VAN',
      order: 3,
      nameVi: 'C├┤ng v─ân',
      nameEn: 'Official Letter',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'TO_TRINH',
      order: 4,
      nameVi: 'Tß╗¥ tr├¼nh',
      nameEn: 'Proposal',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'BAO_CAO',
      order: 5,
      nameVi: 'B├ío c├ío',
      nameEn: 'Report',
    },

    {
      group: 'URGENCY_LEVEL',
      code: 'THUONG',
      order: 1,
      nameVi: 'Th╞░ß╗¥ng',
      nameEn: 'Normal',
    },
    {
      group: 'URGENCY_LEVEL',
      code: 'KHAN',
      order: 2,
      nameVi: 'Khß║⌐n',
      nameEn: 'Urgent',
    },
    {
      group: 'URGENCY_LEVEL',
      code: 'HOA_TOC',
      order: 3,
      nameVi: 'Hß╗Åa tß╗æc',
      nameEn: 'Express',
    },

    {
      group: 'SECURITY_LEVEL',
      code: 'THUONG',
      order: 1,
      nameVi: 'Th╞░ß╗¥ng',
      nameEn: 'Unclassified',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'MAT',
      order: 2,
      nameVi: 'Mß║¡t',
      nameEn: 'Confidential',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'TOI_MAT',
      order: 3,
      nameVi: 'Tß╗æi mß║¡t',
      nameEn: 'Secret',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'TUYET_MAT',
      order: 4,
      nameVi: 'Tuyß╗çt mß║¡t',
      nameEn: 'Top Secret',
    },

    // --- UNIT OF MEASURE (N─É 335/2025/N─É-CP) ---
    {
      group: 'UNIT',
      code: 'UNIT_HO_SO',
      order: 1,
      nameVi: 'Hß╗ô s╞í',
      nameEn: 'Dossier',
    },
    {
      group: 'UNIT',
      code: 'UNIT_BAO_CAO',
      order: 2,
      nameVi: 'B├ío c├ío',
      nameEn: 'Report',
    },
    {
      group: 'UNIT',
      code: 'UNIT_VAN_BAN',
      order: 3,
      nameVi: 'V─ân bß║ún',
      nameEn: 'Document',
    },
    {
      group: 'UNIT',
      code: 'UNIT_GIO_CONG',
      order: 4,
      nameVi: 'Giß╗¥ c├┤ng',
      nameEn: 'Man-hour',
    },
    {
      group: 'UNIT',
      code: 'UNIT_CHUYEN_DE',
      order: 5,
      nameVi: 'Chuy├¬n ─æß╗ü',
      nameEn: 'Thematic',
    },
    {
      group: 'UNIT',
      code: 'UNIT_LUOT',
      order: 6,
      nameVi: 'L╞░ß╗út',
      nameEn: 'Turn',
    },

    // --- CIVIL_SERVANT_RANK ---
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'SENIOR_SPECIALIST',
      order: 1,
      nameVi: 'Chuy├¬n vi├¬n Cao cß║Ñp',
      nameEn: 'Senior Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'PRINCIPAL_SPECIALIST',
      order: 2,
      nameVi: 'Chuy├¬n vi├¬n Ch├¡nh',
      nameEn: 'Principal Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'SPECIALIST',
      order: 3,
      nameVi: 'Chuy├¬n vi├¬n',
      nameEn: 'Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'OFFICER',
      order: 4,
      nameVi: 'C├ín sß╗▒',
      nameEn: 'Officer',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'STAFF',
      order: 5,
      nameVi: 'Nh├ón vi├¬n',
      nameEn: 'Staff',
    },

    // --- PUBLIC_EMPLOYEE_RANK ---
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_1',
      order: 1,
      nameVi: 'Vi├¬n chß╗⌐c Hß║íng I',
      nameEn: 'Grade I Public Employee',
    },
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_2',
      order: 2,
      nameVi: 'Vi├¬n chß╗⌐c Hß║íng II',
      nameEn: 'Grade II Public Employee',
    },
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_3',
      order: 3,
      nameVi: 'Vi├¬n chß╗⌐c Hß║íng III',
      nameEn: 'Grade III Public Employee',
    },
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_4',
      order: 4,
      nameVi: 'Vi├¬n chß╗⌐c Hß║íng IV',
      nameEn: 'Grade IV Public Employee',
    },

    // =========================
    // ─ÉIß╗ÇU H├ÇNH - H├ÇNH CH├ìNH
    // =========================

    // =========================
    // V─éN PH├ÆNG UBND
    // =========================

    { group: 'DOMAIN', code: 'VAN_PHONG_UBND', nameVi: 'V─ân ph├▓ng UBND' },
    {
      code: 'CHI_DAO_DIEU_HANH',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Chß╗ë ─æß║ío ─æiß╗üu h├ánh',
    },
    {
      group: 'DOMAIN',
      code: 'MOT_CUA',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Mß╗Öt cß╗¡a',
    },
    {
      code: 'KIEM_SOAT_TTHC',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Kiß╗âm so├ít TTHC',
    },

    // =========================
    // Sß╗₧ Nß╗ÿI Vß╗ñ
    // =========================

    { group: 'DOMAIN', code: 'SO_NOI_VU', nameVi: 'Sß╗ƒ Nß╗Öi vß╗Ñ' },
    {
      code: 'TO_CHUC_BO_MAY',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Tß╗ò chß╗⌐c bß╗Ö m├íy',
    },
    {
      code: 'CAN_BO_CONG_CHUC',
      parentCode: 'SO_NOI_VU',
      nameVi: 'C├ín bß╗Ö c├┤ng chß╗⌐c',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_CHUC',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Vi├¬n chß╗⌐c',
    },
    {
      code: 'DIA_GIOI_HANH_CHINH',
      parentCode: 'SO_NOI_VU',
      nameVi: '─Éß╗ïa giß╗¢i h├ánh ch├¡nh',
    },
    {
      group: 'DOMAIN',
      code: 'TON_GIAO',
      parentCode: 'SO_NOI_VU',
      nameVi: 'T├┤n gi├ío',
    },
    {
      code: 'THI_DUA_KHEN_THUONG',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Thi ─æua khen th╞░ß╗ƒng',
    },

    // =========================
    // Sß╗₧ T├ÇI CH├ìNH
    // =========================

    { group: 'DOMAIN', code: 'SO_TAI_CHINH', nameVi: 'Sß╗ƒ T├ái ch├¡nh' },
    {
      group: 'DOMAIN',
      code: 'NGAN_SACH',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Ng├ón s├ích',
    },
    {
      code: 'TAI_SAN_CONG',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'T├ái sß║ún c├┤ng',
    },
    {
      group: 'DOMAIN',
      code: 'DAU_TU_CONG',
      parentCode: 'SO_TAI_CHINH',
      nameVi: '─Éß║ºu t╞░ c├┤ng',
    },
    {
      code: 'DOANH_NGHIEP',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Doanh nghiß╗çp',
    },
    {
      code: 'HOP_TAC_XA',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Kinh tß║┐ tß║¡p thß╗â - HTX',
    },

    // =========================
    // Sß╗₧ X├éY Dß╗░NG
    // =========================

    { group: 'DOMAIN', code: 'SO_XAY_DUNG', nameVi: 'Sß╗ƒ X├óy dß╗▒ng' },
    {
      code: 'QUY_HOACH',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Quy hoß║ích x├óy dß╗▒ng',
    },
    {
      group: 'DOMAIN',
      code: 'NHA_O',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Nh├á ß╗ƒ',
    },
    {
      code: 'CAP_PHEP_XAY_DUNG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Cß║Ñp ph├⌐p x├óy dß╗▒ng',
    },
    {
      code: 'VAT_LIEU_XAY_DUNG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Vß║¡t liß╗çu x├óy dß╗▒ng',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_THONG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Giao th├┤ng',
    },
    {
      code: 'HA_TANG_DO_THI',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Hß║í tß║ºng ─æ├┤ thß╗ï',
    },

    // =========================
    // Sß╗₧ N├öNG NGHIß╗åP & M├öI TR╞»ß╗£NG
    // =========================

    {
      group: 'DOMAIN',
      code: 'SO_NN_MT',
      nameVi: 'Sß╗ƒ N├┤ng nghiß╗çp v├á M├┤i tr╞░ß╗¥ng',
    },
    {
      group: 'DOMAIN',
      code: 'TRONG_TROT',
      parentCode: 'SO_NN_MT',
      nameVi: 'Trß╗ông trß╗ìt',
    },
    {
      group: 'DOMAIN',
      code: 'CHAN_NUOI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Ch─ân nu├┤i',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_LOI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Thß╗ºy lß╗úi',
    },
    {
      group: 'DOMAIN',
      code: 'LAM_NGHIEP',
      parentCode: 'SO_NN_MT',
      nameVi: 'L├óm nghiß╗çp',
    },
    {
      group: 'DOMAIN',
      code: 'DAT_DAI',
      parentCode: 'SO_NN_MT',
      nameVi: '─Éß║Ñt ─æai',
    },
    {
      group: 'DOMAIN',
      code: 'MOI_TRUONG',
      parentCode: 'SO_NN_MT',
      nameVi: 'M├┤i tr╞░ß╗¥ng',
    },
    {
      code: 'KHI_TUONG_THUY_VAN',
      parentCode: 'SO_NN_MT',
      nameVi: 'Kh├¡ t╞░ß╗úng thß╗ºy v─ân',
    },

    // =========================
    // Sß╗₧ KHOA Hß╗îC & C├öNG NGHß╗å
    // =========================

    { group: 'DOMAIN', code: 'H15.07', nameVi: 'Sß╗ƒ Khoa hß╗ìc v├á C├┤ng nghß╗ç' },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO',
      parentCode: 'H15.07',
      nameVi: 'Chuyß╗ân ─æß╗òi sß╗æ',
    },
    {
      group: 'DOMAIN',
      code: 'DU_LIEU_SO',
      parentCode: 'H15.07',
      nameVi: 'Dß╗» liß╗çu sß╗æ',
    },
    {
      code: 'AN_TOAN_THONG_TIN',
      parentCode: 'H15.07',
      nameVi: 'An to├án th├┤ng tin',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THONG',
      parentCode: 'H15.07',
      nameVi: 'Viß╗àn th├┤ng',
    },
    {
      group: 'DOMAIN',
      code: 'KINH_TE_SO',
      parentCode: 'H15.07',
      nameVi: 'Kinh tß║┐ sß╗æ',
    },

    // =========================
    // Sß╗₧ GI├üO Dß╗ñC
    // =========================

    { group: 'DOMAIN', code: 'SO_GIAO_DUC', nameVi: 'Sß╗ƒ Gi├ío dß╗Ñc v├á ─É├áo tß║ío' },
    {
      group: 'DOMAIN',
      code: 'MAM_NON',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Mß║ºm non',
    },
    {
      group: 'DOMAIN',
      code: 'TIEU_HOC',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Tiß╗âu hß╗ìc',
    },
    {
      group: 'DOMAIN',
      code: 'THCS',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'THCS',
    },
    {
      group: 'DOMAIN',
      code: 'THPT',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'THPT',
    },
    {
      code: 'GIAO_DUC_NGHE',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Gi├ío dß╗Ñc nghß╗ü nghiß╗çp',
    },

    // =========================
    // Sß╗₧ Y Tß║╛
    // =========================

    { group: 'DOMAIN', code: 'SO_Y_TE', nameVi: 'Sß╗ƒ Y tß║┐' },
    {
      group: 'DOMAIN',
      code: 'KHAM_CHUA_BENH',
      parentCode: 'SO_Y_TE',
      nameVi: 'Kh├ím chß╗»a bß╗çnh',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_DU_PHONG',
      parentCode: 'SO_Y_TE',
      nameVi: 'Y tß║┐ dß╗▒ ph├▓ng',
    },
    { group: 'DOMAIN', code: 'DUOC', parentCode: 'SO_Y_TE', nameVi: 'D╞░ß╗úc' },
    {
      code: 'AN_TOAN_THUC_PHAM',
      parentCode: 'SO_Y_TE',
      nameVi: 'An to├án thß╗▒c phß║⌐m',
    },

    // =========================
    // C├öNG AN
    // =========================

    { group: 'DOMAIN', code: 'CONG_AN', nameVi: 'C├┤ng an' },
    {
      group: 'DOMAIN',
      code: 'AN_NINH',
      parentCode: 'CONG_AN',
      nameVi: 'An ninh',
    },
    {
      group: 'DOMAIN',
      code: 'TRAT_TU_XA_HOI',
      parentCode: 'CONG_AN',
      nameVi: 'Trß║¡t tß╗▒ x├ú hß╗Öi',
    },
    { group: 'DOMAIN', code: 'PCCC', parentCode: 'CONG_AN', nameVi: 'PCCC' },
    {
      group: 'DOMAIN',
      code: 'CU_TRU',
      parentCode: 'CONG_AN',
      nameVi: 'C╞░ tr├║',
    },

    // =========================
    // QU├éN Sß╗░
    // =========================

    { group: 'DOMAIN', code: 'QUAN_SU', nameVi: 'Qu├ón sß╗▒' },
    {
      code: 'QUOC_PHONG_DIA_PHUONG',
      parentCode: 'QUAN_SU',
      nameVi: 'Quß╗æc ph├▓ng ─æß╗ïa ph╞░╞íng',
    },
    {
      group: 'DOMAIN',
      code: 'DAN_QUAN_TU_VE',
      parentCode: 'QUAN_SU',
      nameVi: 'D├ón qu├ón tß╗▒ vß╗ç',
    },
    {
      code: 'NGHIA_VU_QUAN_SU',
      parentCode: 'QUAN_SU',
      nameVi: 'Ngh─⌐a vß╗Ñ qu├ón sß╗▒',
    },

    {
      group: 'STORAGE_PERIOD',
      code: '5_YEARS',
      order: 1,
      nameVi: '05 n─âm',
      nameEn: '5 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: '10_YEARS',
      order: 2,
      nameVi: '10 n─âm',
      nameEn: '10 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: '20_YEARS',
      order: 3,
      nameVi: '20 n─âm',
      nameEn: '20 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: 'PERMANENT',
      order: 4,
      nameVi: 'V─⌐nh viß╗àn',
      nameEn: 'Permanent',
    },

    // --- HRM & PERSONAL ---
    { group: 'GENDER', code: 'NAM', order: 1, nameVi: 'Nam', nameEn: 'Male' },
    { group: 'GENDER', code: 'NU', order: 2, nameVi: 'Nß╗»', nameEn: 'Female' },
    {
      group: 'GENDER',
      code: 'KHAC',
      order: 3,
      nameVi: 'Kh├íc',
      nameEn: 'Other',
    },

    {
      group: 'ETHNICITY',
      code: 'KINH',
      order: 1,
      nameVi: 'Kinh',
      nameEn: 'Kinh',
    },
    {
      group: 'ETHNICITY',
      code: 'EDE',
      order: 2,
      nameVi: '├è-─æ├¬',
      nameEn: 'Ede',
    },
    {
      group: 'ETHNICITY',
      code: 'M_NONG',
      order: 3,
      nameVi: "M'N├┤ng",
      nameEn: "M'Nong",
    },

    {
      group: 'RELIGION',
      code: 'KHONG',
      order: 1,
      nameVi: 'Kh├┤ng',
      nameEn: 'None',
    },
    {
      group: 'RELIGION',
      code: 'PHAT_GIAO',
      order: 2,
      nameVi: 'Phß║¡t gi├ío',
      nameEn: 'Buddhism',
    },
    {
      group: 'RELIGION',
      code: 'CONG_GIAO',
      order: 3,
      nameVi: 'C├┤ng gi├ío',
      nameEn: 'Catholicism',
    },

    {
      group: 'IDENTITY_TYPE',
      code: 'CCCD',
      order: 1,
      nameVi: 'C─ân c╞░ß╗¢c c├┤ng d├ón',
      nameEn: 'Citizen Identity Card',
    },
    {
      group: 'IDENTITY_TYPE',
      code: 'PASSPORT',
      order: 2,
      nameVi: 'Hß╗Ö chiß║┐u',
      nameEn: 'Passport',
    },

    {
      group: 'POSITION',
      code: 'GIAM_DOC',
      order: 1,
      nameVi: 'Gi├ím ─æß╗æc',
      nameEn: 'Director',
    },
    {
      group: 'POSITION',
      code: 'PHO_GIAM_DOC',
      order: 2,
      nameVi: 'Ph├│ Gi├ím ─æß╗æc',
      nameEn: 'Deputy Director',
    },
    {
      group: 'POSITION',
      code: 'TRUONG_PHONG',
      order: 3,
      nameVi: 'Tr╞░ß╗ƒng ph├▓ng',
      nameEn: 'Head of Department',
    },
    {
      group: 'POSITION',
      code: 'PHO_TRUONG_PHONG',
      order: 4,
      nameVi: 'Ph├│ Tr╞░ß╗ƒng ph├▓ng',
      nameEn: 'Deputy Head of Department',
    },
    {
      group: 'POSITION',
      code: 'CHANH_VAN_PHONG',
      order: 5,
      nameVi: 'Ch├ính V─ân ph├▓ng',
      nameEn: 'Chief of Office',
    },
    {
      group: 'POSITION',
      code: 'PHO_CHANH_VAN_PHONG',
      order: 6,
      nameVi: 'Ph├│ Ch├ính V─ân ph├▓ng',
      nameEn: 'Deputy Chief of Office',
    },
    {
      group: 'POSITION',
      code: 'CHANH_THANH_TRA',
      order: 7,
      nameVi: 'Ch├ính Thanh tra',
      nameEn: 'Chief Inspector',
    },
    {
      group: 'POSITION',
      code: 'PHO_CHANH_THANH_TRA',
      order: 8,
      nameVi: 'Ph├│ Ch├ính Thanh tra',
      nameEn: 'Deputy Chief Inspector',
    },
    {
      group: 'POSITION',
      code: 'SPECIALIST',
      order: 9,
      nameVi: 'Chuy├¬n vi├¬n',
      nameEn: 'Expert',
    },

    {
      group: 'ACADEMIC_RANK',
      code: 'TIEN_SI',
      order: 1,
      nameVi: 'Tiß║┐n s─⌐',
      nameEn: 'Doctor of Philosophy',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'THAC_SI',
      order: 2,
      nameVi: 'Thß║íc s─⌐',
      nameEn: 'Master of Science',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'GIAO_SU',
      order: 3,
      nameVi: 'Gi├ío s╞░',
      nameEn: 'Professor',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'PHO_GIAO_SU',
      order: 4,
      nameVi: 'Ph├│ Gi├ío s╞░',
      nameEn: 'Associate Professor',
    },

    {
      group: 'POLITICAL_THEORY',
      code: 'CAO_CAP',
      order: 1,
      nameVi: 'Cao cß║Ñp',
      nameEn: 'Advanced',
    },
    {
      group: 'POLITICAL_THEORY',
      code: 'TRUNG_CAP',
      order: 2,
      nameVi: 'Trung cß║Ñp',
      nameEn: 'Intermediate',
    },
    {
      group: 'POLITICAL_THEORY',
      code: 'SO_CAP',
      order: 3,
      nameVi: 'S╞í cß║Ñp',
      nameEn: 'Elementary',
    },

    {
      group: 'IT_SKILL',
      code: 'CO_BAN',
      order: 1,
      nameVi: 'C╞í bß║ún',
      nameEn: 'Basic',
    },
    {
      group: 'IT_SKILL',
      code: 'NANG_CAO',
      order: 2,
      nameVi: 'N├óng cao',
      nameEn: 'Advanced',
    },

    {
      group: 'LANGUAGE_SKILL',
      code: 'ENGLISH_B1',
      order: 1,
      nameVi: 'Tiß║┐ng Anh B1',
      nameEn: 'English B1',
    },
    {
      group: 'LANGUAGE_SKILL',
      code: 'ENGLISH_B2',
      order: 2,
      nameVi: 'Tiß║┐ng Anh B2',
      nameEn: 'English B2',
    },

    // --- SYSTEM LANGUAGES ---
    {
      group: 'LANGUAGE',
      code: 'vi',
      order: 1,
      nameVi: 'Tiß║┐ng Viß╗çt',
      nameEn: 'Vietnamese',
    },
    {
      group: 'LANGUAGE',
      code: 'en',
      order: 2,
      nameVi: 'Tiß║┐ng Anh',
      nameEn: 'English',
    },

    {
      group: 'SYSTEM_ACTION',
      code: 'APPROVE',
      order: 6,
      nameVi: 'Ph├¬ duyß╗çt',
      nameEn: 'Approve',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'REJECT',
      order: 7,
      nameVi: 'Tß╗½ chß╗æi',
      nameEn: 'Reject',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'PUBLISH',
      order: 8,
      nameVi: 'Xuß║Ñt bß║ún',
      nameEn: 'Publish',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'REQUEST_INFO',
      order: 9,
      nameVi: 'Y├¬u cß║ºu bß╗ò sung',
      nameEn: 'Request Info',
    },

    // --- OTHER ---
    {
      group: 'DOMAIN',
      code: 'KHCN',
      order: 1,
      nameVi: 'Khoa hß╗ìc c├┤ng nghß╗ç',
      nameEn: 'Science & Technology',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_KHOA_HOC',
      order: 2,
      nameVi: 'Quß║ún l├╜ khoa hß╗ìc',
      nameEn: 'Scientific Management',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_CONG_NGHE',
      order: 3,
      nameVi: 'Quß║ún l├╜ c├┤ng nghß╗ç',
      nameEn: 'Technology Management',
    },
    {
      group: 'DOMAIN',
      code: 'DOI_MOI_SANG_TAO',
      order: 4,
      nameVi: '─Éß╗òi mß╗¢i s├íng tß║ío',
      nameEn: 'Innovation',
    },
    {
      group: 'DOMAIN',
      code: 'SO_HUU_TRI_TUE',
      order: 5,
      nameVi: 'Sß╗ƒ hß╗»u tr├¡ tuß╗ç',
      nameEn: 'Intellectual Property',
    },
    {
      group: 'DOMAIN',
      code: 'TIEU_CHUAN_DO_LUONG_CHAT_LUONG',
      order: 6,
      nameVi: 'Ti├¬u chuß║⌐n ─æo l╞░ß╗¥ng chß║Ñt l╞░ß╗úng',
      nameEn: 'Standards Metrology & Quality',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_BUC_XA_HAT_NHAN',
      order: 7,
      nameVi: 'An to├án bß╗⌐c xß║í hß║ít nh├ón',
      nameEn: 'Radiation & Nuclear Safety',
    },
    {
      group: 'DOMAIN',
      code: 'UNG_DUNG_KHCN',
      order: 8,
      nameVi: 'ß╗¿ng dß╗Ñng khoa hß╗ìc c├┤ng nghß╗ç',
      nameEn: 'Science & Technology Application',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO',
      order: 9,
      nameVi: 'Chuyß╗ân ─æß╗òi sß╗æ',
      nameEn: 'Digital Transformation',
    },
    {
      group: 'DOMAIN',
      code: 'DU_LIEU_SO',
      order: 10,
      nameVi: 'Dß╗» liß╗çu sß╗æ',
      nameEn: 'Digital Data',
    },
    {
      group: 'DOMAIN',
      code: 'CHINH_QUYEN_SO',
      order: 11,
      nameVi: 'Ch├¡nh quyß╗ün sß╗æ',
      nameEn: 'Digital Government',
    },
    {
      group: 'DOMAIN',
      code: 'KINH_TE_SO',
      order: 12,
      nameVi: 'Kinh tß║┐ sß╗æ',
      nameEn: 'Digital Economy',
    },
    {
      group: 'DOMAIN',
      code: 'XA_HOI_SO',
      order: 13,
      nameVi: 'X├ú hß╗Öi sß╗æ',
      nameEn: 'Digital Society',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_THONG_TIN',
      order: 14,
      nameVi: 'An to├án th├┤ng tin',
      nameEn: 'Cyber Security',
    },
    {
      group: 'DOMAIN',
      code: 'CONG_NGHE_THONG_TIN',
      order: 15,
      nameVi: 'C├┤ng nghß╗ç th├┤ng tin',
      nameEn: 'Information Technology',
    },

    {
      group: 'DOMAIN',
      code: 'GIAO_DUC',
      order: 16,
      nameVi: 'Gi├ío dß╗Ñc',
      nameEn: 'Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_MAM_NON',
      order: 17,
      nameVi: 'Gi├ío dß╗Ñc mß║ºm non',
      nameEn: 'Preschool Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_TIEU_HOC',
      order: 18,
      nameVi: 'Gi├ío dß╗Ñc tiß╗âu hß╗ìc',
      nameEn: 'Primary Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THCS',
      order: 19,
      nameVi: 'Gi├ío dß╗Ñc THCS',
      nameEn: 'Secondary Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THPT',
      order: 20,
      nameVi: 'Gi├ío dß╗Ñc THPT',
      nameEn: 'High School Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THUONG_XUYEN',
      order: 21,
      nameVi: 'Gi├ío dß╗Ñc th╞░ß╗¥ng xuy├¬n',
      nameEn: 'Continuing Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_NGHE_NGHIEP',
      order: 22,
      nameVi: 'Gi├ío dß╗Ñc nghß╗ü nghiß╗çp',
      nameEn: 'Vocational Education',
    },
    {
      group: 'DOMAIN',
      code: 'KHAO_THI_KIEM_DINH',
      order: 23,
      nameVi: 'Khß║úo th├¡ kiß╗âm ─æß╗ïnh',
      nameEn: 'Testing & Accreditation',
    },
    {
      group: 'DOMAIN',
      code: 'HOC_SINH_SINH_VIEN',
      order: 24,
      nameVi: 'Hß╗ìc sinh sinh vi├¬n',
      nameEn: 'Students Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO_GIAO_DUC',
      order: 25,
      nameVi: 'Chuyß╗ân ─æß╗òi sß╗æ gi├ío dß╗Ñc',
      nameEn: 'Digital Education',
    },

    {
      group: 'DOMAIN',
      code: 'Y_TE',
      order: 26,
      nameVi: 'Y tß║┐',
      nameEn: 'Healthcare',
    },
    {
      group: 'DOMAIN',
      code: 'KHAM_CHUA_BENH',
      order: 27,
      nameVi: 'Kh├ím chß╗»a bß╗çnh',
      nameEn: 'Medical Examination & Treatment',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_DU_PHONG',
      order: 28,
      nameVi: 'Y tß║┐ dß╗▒ ph├▓ng',
      nameEn: 'Preventive Medicine',
    },
    {
      group: 'DOMAIN',
      code: 'DUOC_PHAM',
      order: 29,
      nameVi: 'D╞░ß╗úc phß║⌐m',
      nameEn: 'Pharmaceuticals',
    },
    {
      group: 'DOMAIN',
      code: 'THIET_BI_Y_TE',
      order: 30,
      nameVi: 'Thiß║┐t bß╗ï y tß║┐',
      nameEn: 'Medical Equipment',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_THUC_PHAM',
      order: 31,
      nameVi: 'An to├án thß╗▒c phß║⌐m',
      nameEn: 'Food Safety',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_HIEM_Y_TE',
      order: 32,
      nameVi: 'Bß║úo hiß╗âm y tß║┐',
      nameEn: 'Health Insurance',
    },
    {
      group: 'DOMAIN',
      code: 'DAN_SO',
      order: 33,
      nameVi: 'D├ón sß╗æ',
      nameEn: 'Population',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_CO_SO',
      order: 34,
      nameVi: 'Y tß║┐ c╞í sß╗ƒ',
      nameEn: 'Primary Healthcare',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO_Y_TE',
      order: 35,
      nameVi: 'Chuyß╗ân ─æß╗òi sß╗æ y tß║┐',
      nameEn: 'Digital Healthcare',
    },

    {
      group: 'DOMAIN',
      code: 'NONG_NGHIEP',
      order: 36,
      nameVi: 'N├┤ng nghiß╗çp & PTNT',
      nameEn: 'Agriculture & Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'TRONG_TROT',
      order: 37,
      nameVi: 'Trß╗ông trß╗ìt',
      nameEn: 'Crop Production',
    },
    {
      group: 'DOMAIN',
      code: 'CHAN_NUOI',
      order: 38,
      nameVi: 'Ch─ân nu├┤i',
      nameEn: 'Livestock',
    },
    {
      group: 'DOMAIN',
      code: 'THU_Y',
      order: 39,
      nameVi: 'Th├║ y',
      nameEn: 'Veterinary',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_SAN',
      order: 40,
      nameVi: 'Thß╗ºy sß║ún',
      nameEn: 'Fisheries',
    },
    {
      group: 'DOMAIN',
      code: 'LAM_NGHIEP',
      order: 41,
      nameVi: 'L├óm nghiß╗çp',
      nameEn: 'Forestry',
    },
    {
      group: 'DOMAIN',
      code: 'KIEM_LAM',
      order: 42,
      nameVi: 'Kiß╗âm l├óm',
      nameEn: 'Forest Protection',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_LOI',
      order: 43,
      nameVi: 'Thß╗ºy lß╗úi',
      nameEn: 'Irrigation',
    },
    {
      group: 'DOMAIN',
      code: 'PHAT_TRIEN_NONG_THON',
      order: 44,
      nameVi: 'Ph├ít triß╗ân n├┤ng th├┤n',
      nameEn: 'Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'NONG_THON_MOI',
      order: 45,
      nameVi: 'N├┤ng th├┤n mß╗¢i',
      nameEn: 'New Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'PHONG_CHONG_THIEN_TAI',
      order: 46,
      nameVi: 'Ph├▓ng chß╗æng thi├¬n tai',
      nameEn: 'Disaster Prevention',
    },
    {
      group: 'DOMAIN',
      code: 'CHAT_LUONG_NONG_LAM_SAN',
      order: 47,
      nameVi: 'Chß║Ñt l╞░ß╗úng n├┤ng l├óm sß║ún',
      nameEn: 'Agro-Forestry Quality',
    },
    {
      group: 'DOMAIN',
      code: 'KHUYEN_NONG',
      order: 48,
      nameVi: 'Khuyß║┐n n├┤ng',
      nameEn: 'Agricultural Extension',
    },

    {
      group: 'DOMAIN',
      code: 'CONG_THUONG',
      order: 49,
      nameVi: 'C├┤ng th╞░╞íng',
      nameEn: 'Industry & Trade',
    },
    {
      group: 'DOMAIN',
      code: 'CONG_NGHIEP',
      order: 50,
      nameVi: 'C├┤ng nghiß╗çp',
      nameEn: 'Industry',
    },
    {
      group: 'DOMAIN',
      code: 'THUONG_MAI',
      order: 51,
      nameVi: 'Th╞░╞íng mß║íi',
      nameEn: 'Trade',
    },
    {
      group: 'DOMAIN',
      code: 'XUC_TIEN_THUONG_MAI',
      order: 52,
      nameVi: 'X├║c tiß║┐n th╞░╞íng mß║íi',
      nameEn: 'Trade Promotion',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_THI_TRUONG',
      order: 53,
      nameVi: 'Quß║ún l├╜ thß╗ï tr╞░ß╗¥ng',
      nameEn: 'Market Surveillance',
    },
    {
      group: 'DOMAIN',
      code: 'XUAT_NHAP_KHAU',
      order: 54,
      nameVi: 'Xuß║Ñt nhß║¡p khß║⌐u',
      nameEn: 'Import Export',
    },
    {
      group: 'DOMAIN',
      code: 'NANG_LUONG',
      order: 55,
      nameVi: 'N─âng l╞░ß╗úng',
      nameEn: 'Energy',
    },
    {
      group: 'DOMAIN',
      code: 'DIEN_LUC',
      order: 56,
      nameVi: '─Éiß╗çn lß╗▒c',
      nameEn: 'Electricity',
    },
    {
      group: 'DOMAIN',
      code: 'THUONG_MAI_DIEN_TU',
      order: 57,
      nameVi: 'Th╞░╞íng mß║íi ─æiß╗çn tß╗¡',
      nameEn: 'E-Commerce',
    },
    {
      group: 'DOMAIN',
      code: 'CU_M_CONG_NGHIEP',
      order: 58,
      nameVi: 'Cß╗Ñm c├┤ng nghiß╗çp',
      nameEn: 'Industrial Clusters',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_VE_NGUOI_TIEU_DUNG',
      order: 59,
      nameVi: 'Bß║úo vß╗ç ng╞░ß╗¥i ti├¬u d├╣ng',
      nameEn: 'Consumer Protection',
    },

    {
      group: 'DOMAIN',
      code: 'NOI_VU',
      order: 60,
      nameVi: 'Nß╗Öi vß╗Ñ',
      nameEn: 'Home Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'TO_CHUC_BO_MAY',
      order: 61,
      nameVi: 'Tß╗ò chß╗⌐c bß╗Ö m├íy',
      nameEn: 'Organizational Structure',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_CHE',
      order: 62,
      nameVi: 'Bi├¬n chß║┐',
      nameEn: 'Staff Quota',
    },
    {
      group: 'DOMAIN',
      code: 'CAN_BO_CONG_CHUC',
      order: 63,
      nameVi: 'C├ín bß╗Ö c├┤ng chß╗⌐c vi├¬n chß╗⌐c',
      nameEn: 'Civil Servants Management',
    },
    {
      group: 'DOMAIN',
      code: 'CHINH_QUYEN_DIA_PHUONG',
      order: 64,
      nameVi: 'Ch├¡nh quyß╗ün ─æß╗ïa ph╞░╞íng',
      nameEn: 'Local Government',
    },
    {
      group: 'DOMAIN',
      code: 'DIA_GIOI_HANH_CHINH',
      order: 65,
      nameVi: '─Éß╗ïa giß╗¢i h├ánh ch├¡nh',
      nameEn: 'Administrative Boundaries',
    },
    {
      group: 'DOMAIN',
      code: 'THI_DUA_KHEN_THUONG',
      order: 66,
      nameVi: 'Thi ─æua khen th╞░ß╗ƒng',
      nameEn: 'Emulation & Reward',
    },
    {
      group: 'DOMAIN',
      code: 'TON_GIAO',
      order: 67,
      nameVi: 'T├┤n gi├ío',
      nameEn: 'Religious Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'VAN_THU_LUU_TRU',
      order: 68,
      nameVi: 'V─ân th╞░ l╞░u trß╗»',
      nameEn: 'Archives & Records',
    },
    {
      group: 'DOMAIN',
      code: 'CAI_CACH_HANH_CHINH',
      order: 69,
      nameVi: 'Cß║úi c├ích h├ánh ch├¡nh',
      nameEn: 'Administrative Reform',
    },

    {
      group: 'DOMAIN',
      code: 'TAI_NGUYEN_MOI_TRUONG',
      order: 70,
      nameVi: 'T├ái nguy├¬n & M├┤i tr╞░ß╗¥ng',
      nameEn: 'Natural Resources & Environment',
    },
    {
      group: 'DOMAIN',
      code: 'DAT_DAI',
      order: 71,
      nameVi: '─Éß║Ñt ─æai',
      nameEn: 'Land Administration',
    },
    {
      group: 'DOMAIN',
      code: 'DO_DAC_BAN_DO',
      order: 72,
      nameVi: '─Éo ─æß║íc bß║ún ─æß╗ô',
      nameEn: 'Survey & Mapping',
    },
    {
      group: 'DOMAIN',
      code: 'TAI_NGUYEN_NUOC',
      order: 73,
      nameVi: 'T├ái nguy├¬n n╞░ß╗¢c',
      nameEn: 'Water Resources',
    },
    {
      group: 'DOMAIN',
      code: 'KHOANG_SAN',
      order: 74,
      nameVi: 'Kho├íng sß║ún',
      nameEn: 'Minerals',
    },
    {
      group: 'DOMAIN',
      code: 'MOI_TRUONG',
      order: 75,
      nameVi: 'M├┤i tr╞░ß╗¥ng',
      nameEn: 'Environment',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_DOI_KHI_HAU',
      order: 76,
      nameVi: 'Biß║┐n ─æß╗òi kh├¡ hß║¡u',
      nameEn: 'Climate Change',
    },
    {
      group: 'DOMAIN',
      code: 'KHI_TUONG_THUY_VAN',
      order: 77,
      nameVi: 'Kh├¡ t╞░ß╗úng thß╗ºy v─ân',
      nameEn: 'Hydrometeorology',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THAM',
      order: 78,
      nameVi: 'Viß╗àn th├ím',
      nameEn: 'Remote Sensing',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_HAI_DAO',
      order: 79,
      nameVi: 'Biß╗ân hß║úi ─æß║úo',
      nameEn: 'Sea & Islands',
    },

    {
      group: 'DOMAIN',
      code: 'XAY_DUNG',
      order: 80,
      nameVi: 'X├óy dß╗▒ng',
      nameEn: 'Construction',
    },
    {
      group: 'DOMAIN',
      code: 'QUY_HOACH_XAY_DUNG',
      order: 81,
      nameVi: 'Quy hoß║ích x├óy dß╗▒ng',
      nameEn: 'Construction Planning',
    },
    {
      group: 'DOMAIN',
      code: 'PHAT_TRIEN_DO_THI',
      order: 82,
      nameVi: 'Ph├ít triß╗ân ─æ├┤ thß╗ï',
      nameEn: 'Urban Development',
    },
    {
      group: 'DOMAIN',
      code: 'HA_TANG_KY_THUAT',
      order: 83,
      nameVi: 'Hß║í tß║ºng kß╗╣ thuß║¡t',
      nameEn: 'Technical Infrastructure',
    },
    {
      group: 'DOMAIN',
      code: 'NHA_O',
      order: 84,
      nameVi: 'Nh├á ß╗ƒ',
      nameEn: 'Housing',
    },
    {
      group: 'DOMAIN',
      code: 'VAT_LIEU_XAY_DUNG',
      order: 85,
      nameVi: 'Vß║¡t liß╗çu x├óy dß╗▒ng',
      nameEn: 'Construction Materials',
    },
    {
      group: 'DOMAIN',
      code: 'GIAM_DINH_CHAT_LUONG_CONG_TRINH',
      order: 86,
      nameVi: 'Gi├ím ─æß╗ïnh chß║Ñt l╞░ß╗úng c├┤ng tr├¼nh',
      nameEn: 'Construction Quality Inspection',
    },
    {
      group: 'DOMAIN',
      code: 'CAP_PHEP_XAY_DUNG',
      order: 87,
      nameVi: 'Cß║Ñp ph├⌐p x├óy dß╗▒ng',
      nameEn: 'Construction Licensing',
    },

    {
      group: 'DOMAIN',
      code: 'THONG_TIN_TRUYEN_THONG',
      order: 88,
      nameVi: 'Th├┤ng tin & Truyß╗ün th├┤ng',
      nameEn: 'Information & Communications',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_CHI',
      order: 89,
      nameVi: 'B├ío ch├¡',
      nameEn: 'Press',
    },
    {
      group: 'DOMAIN',
      code: 'XUAT_BAN',
      order: 90,
      nameVi: 'Xuß║Ñt bß║ún',
      nameEn: 'Publishing',
    },
    {
      group: 'DOMAIN',
      code: 'THONG_TIN_DIEN_TU',
      order: 91,
      nameVi: 'Th├┤ng tin ─æiß╗çn tß╗¡',
      nameEn: 'Electronic Information',
    },
    {
      group: 'DOMAIN',
      code: 'BUU_CHINH',
      order: 92,
      nameVi: 'B╞░u ch├¡nh',
      nameEn: 'Postal Services',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THONG',
      order: 93,
      nameVi: 'Viß╗àn th├┤ng',
      nameEn: 'Telecommunications',
    },
    {
      group: 'DOMAIN',
      code: 'HA_TANG_SO',
      order: 94,
      nameVi: 'Hß║í tß║ºng sß╗æ',
      nameEn: 'Digital Infrastructure',
    },
    {
      group: 'DOMAIN',
      code: 'TRUYEN_THONG_CO_SO',
      order: 95,
      nameVi: 'Truyß╗ün th├┤ng c╞í sß╗ƒ',
      nameEn: 'Grassroots Communication',
    },
    {
      group: 'DOMAIN',
      code: 'THONG_TIN_DOI_NGOAI',
      order: 96,
      nameVi: 'Th├┤ng tin ─æß╗æi ngoß║íi',
      nameEn: 'External Information Service',
    },

    {
      group: 'CONTENT_TYPE',
      code: 'ARTICLE',
      order: 1,
      nameVi: 'B├ái viß║┐t',
      nameEn: 'Article',
    },
    {
      group: 'CONTENT_TYPE',
      code: 'NOTIF',
      order: 2,
      nameVi: 'Th├┤ng b├ío',
      nameEn: 'Notification',
    },
    {
      group: 'CONTENT_TYPE',
      code: 'POLICY',
      order: 3,
      nameVi: 'V─ân bß║ún chß╗ë ─æß║ío',
      nameEn: 'Policy Instruction',
    },

    {
      group: 'DEPARTMENT',
      code: 'VAN_PHONG',
      order: 1,
      nameVi: 'V─ân ph├▓ng Sß╗ƒ',
      nameEn: 'Department Office',
    },
    {
      group: 'DEPARTMENT',
      code: 'PHONG_KE_HOACH',
      order: 2,
      nameVi: 'Ph├▓ng Kß║┐ hoß║ích - T├ái ch├¡nh',
      nameEn: 'Planning & Finance Division',
    },

    // --- WORKFLOW ---
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'MANUAL',
      order: 1,
      nameVi: 'K├¡ch hoß║ít thß╗º c├┤ng',
      nameEn: 'Manual Trigger',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'POST_SUBMIT',
      order: 2,
      nameVi: 'Khi gß╗¡i duyß╗çt b├ái viß║┐t',
      nameEn: 'On Article Submitted',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'DOC_RECEIVED',
      order: 3,
      nameVi: 'Khi nhß║¡n v─ân bß║ún mß╗¢i',
      nameEn: 'On Document Received',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'USER_CREATED',
      order: 4,
      nameVi: 'Khi tß║ío t├ái khoß║ún mß╗¢i',
      nameEn: 'On User Account Created',
    },

    // --- BANNER POSITIONS ---
    {
      group: 'BANNER_POSITION',
      code: 'top',
      order: 1,
      nameVi: '─Éß║ºu trang (Header)',
      nameEn: 'Top (Header)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_1',
      order: 2,
      nameVi: 'Giß╗»a trang - Vß╗ï tr├¡ 1',
      nameEn: 'Middle - Position 1',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_2',
      order: 3,
      nameVi: 'Giß╗»a trang - Vß╗ï tr├¡ 2',
      nameEn: 'Middle - Position 2',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_3',
      order: 4,
      nameVi: 'Giß╗»a trang - Vß╗ï tr├¡ 3',
      nameEn: 'Middle - Position 3',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle',
      order: 5,
      nameVi: 'Th├ón trang (Sidebar)',
      nameEn: 'Sidebar (Middle)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'bottom',
      order: 6,
      nameVi: 'Cuß╗æi trang (Footer)',
      nameEn: 'Bottom (Footer)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'custom',
      order: 7,
      nameVi: 'Khß║⌐u hiß╗çu ch├¡nh',
      nameEn: 'Custom Slogan',
    },

    // --- PORTAL APPEARANCE CONFIGURATIONS ---
    {
      group: 'font_family',
      code: "'Times New Roman', Times, serif",
      order: 1,
      nameVi: 'Serif Uy Nghi├¬m (Government)',
      nameEn: 'Government Serif',
    },
    {
      group: 'font_family',
      code: "'Inter', sans-serif",
      order: 2,
      nameVi: 'Sans-Serif Hiß╗çn ─Éß║íi (Inter)',
      nameEn: 'Modern Sans-Serif',
    },
    {
      group: 'font_family',
      code: "'Outfit', 'Inter', sans-serif",
      order: 3,
      nameVi: 'Trß║╗ Trung (Outfit)',
      nameEn: 'Outfit Sans-Serif',
    },
    {
      group: 'font_family',
      code: "'Roboto Mono', monospace",
      order: 4,
      nameVi: 'Tß╗æi Giß║ún H╞░ß╗¢ng C├┤ng Nghß╗ç',
      nameEn: 'Monospace Minimal',
    },

    {
      group: 'border_radius',
      code: '0px',
      order: 1,
      nameVi: 'Kh├┤ng bo g├│c (0px)',
      nameEn: 'No border radius (0px)',
    },
    {
      group: 'border_radius',
      code: '4px',
      order: 2,
      nameVi: 'Bo g├│c nhß╗Å (4px)',
      nameEn: 'Small radius (4px)',
    },
    {
      group: 'border_radius',
      code: '8px',
      order: 3,
      nameVi: 'Bo g├│c trung b├¼nh (8px)',
      nameEn: 'Medium radius (8px)',
    },
    {
      group: 'border_radius',
      code: '12px',
      order: 4,
      nameVi: 'Bo g├│c tr├▓n (12px)',
      nameEn: 'Round radius (12px)',
    },
    {
      group: 'border_radius',
      code: '16px',
      order: 5,
      nameVi: 'Bo g├│c lß╗¢n (16px)',
      nameEn: 'Large radius (16px)',
    },
    // ==========================================================
    // UNIT_TYPE_CATEGORY - Phan loai to chuc don vi hanh chinh
    // description: JSON { icon, color, description, typeCodes }
    // ==========================================================
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'CHINH_QUYEN',
      order: 1,
      nameVi: 'T\u1ed5 ch\u1ee9c ch\u00ednh quy\u1ec1n',
      nameEn: 'Government Organization',
      description: '{"icon":"Landmark","color":"blue","description":"UBND, H\u0110ND, S\u1edf, UBND huy\u1ec7n/x\u00e3","typeCodes":["TINH_UY","HUYEN_UY","XA_PHUONG","SO_NGANH","PHONG_HUYEN"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'DANG',
      order: 2,
      nameVi: 'T\u1ed5 ch\u1ee9c \u0111\u1ea3ng',
      nameEn: 'Party Organization',
      description: '{"icon":"Flag","color":"red","description":"T\u1ec9nh \u1ee7y, Huy\u1ec7n \u1ee7y, \u0110\u1ea3ng b\u1ed9, Chi b\u1ed9","typeCodes":["TINH_UY_DANG","HUYEN_UY_DANG","DANG_BO_CO_SO","CHI_BO","BAN_DANG_UY"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'THAM_MUU',
      order: 3,
      nameVi: 'Ph\u00f2ng ban tham m\u01b0u',
      nameEn: 'Advisory Department',
      description: '{"icon":"BookOpen","color":"violet","description":"V\u0103n ph\u00f2ng, Thanh tra, Ph\u00f2ng T\u1ed5 ch\u1ee9c c\u00e1n b\u1ed9","typeCodes":["VAN_PHONG","THANH_TRA","PHONG_TO_CHUC","PHONG_KE_HOACH","PHONG_PHAP_CHE","PHONG_THAM_MUU"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'CHUYEN_MON',
      order: 4,
      nameVi: 'Ph\u00f2ng ban chuy\u00ean m\u00f4n',
      nameEn: 'Specialized Department',
      description: '{"icon":"FlaskConical","color":"emerald","description":"Ph\u00f2ng nghi\u1ec7p v\u1ee5, chuy\u00ean ng\u00e0nh thu\u1ed9c S\u1edf","typeCodes":["PHONG_QUAN_LY","PHONG_NGHIEP_VU","CHI_CUC","PHONG_THUOC_CHI_CUC"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'SU_NGHIEP',
      order: 5,
      nameVi: '\u0110\u01a1n v\u1ecb s\u1ef1 nghi\u1ec7p c\u00f4ng l\u1eadp',
      nameEn: 'Public Service Unit',
      description: '{"icon":"GraduationCap","color":"amber","description":"Trung t\u00e2m, Tr\u01b0\u1eddng, B\u1ec7nh vi\u1ec7n, Ban qu\u1ea3n l\u00fd","typeCodes":["TRUNG_TAM","TRUONG_HOC","BENH_VIEN","BAN_QUAN_LY","QUY_NN","DON_VI_SN_KHAC"]}'
    },
    {
      group: 'UNIT_TYPE_CATEGORY',
      code: 'PHONG_THUOC_SN',
      order: 6,
      nameVi: 'Ph\u00f2ng ban thu\u1ed9c \u0111\u01a1n v\u1ecb s\u1ef1 nghi\u1ec7p',
      nameEn: 'Department under Public Service Unit',
      description: '{"icon":"Building","color":"slate","description":"Ph\u00f2ng H\u00e0nh ch\u00ednh, Ph\u00f2ng chuy\u00ean m\u00f4n thu\u1ed9c Trung t\u00e2m","typeCodes":["PHONG_HC_TH","PHONG_CM_SN","PHONG_KT_DVTU","TO_DOI"]}'
    },
  ];


  console.log(
    `≡ƒôª Seeding ${categoriesData.length} categories with dual translations...`,
  );
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE sys_categories DROP COLUMN name, DROP COLUMN description;',
    );
    console.log('Γ£à Dropped unused legacy columns from sys_categories');
  } catch (e) {
    // Ignore if already dropped
  }
  let currentGroup = '';
  for (const cat of categoriesData) {
    if (cat.group) currentGroup = cat.group;
    cat.group = currentGroup;
    const category = await prisma.category.upsert({
      where: { group_code: { group: cat.group, code: cat.code } },
      update: { order: cat.order },
      create: {
        group: cat.group,
        code: cat.code,
        order: cat.order,
        isSystem: true,
      },
    });

    // Seed default Vietnamese translation
    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_langCode: { categoryId: category.id, langCode: 'vi' },
      },
      update: { name: cat.nameVi },
      create: {
        categoryId: category.id,
        langCode: 'vi',
        name: cat.nameVi,
      },
    });

    // Seed English translation
    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_langCode: { categoryId: category.id, langCode: 'en' },
      },
      update: { name: cat.nameEn || cat.nameVi },
      create: {
        categoryId: category.id,
        langCode: 'en',
        name: cat.nameEn || cat.nameVi,
      },
    });
  }
  console.log('Γ£à Categories and dual Vietnamese/English translations seeded');

  // ==========================================================
  // 3.2 CATEGORY GROUPS (For friendly names)
  // ==========================================================
  const groupLabels = [
    { code: 'STATUS', name: 'Trß║íng th├íi hß╗ç thß╗æng' },
    { code: 'SYSTEM_ACTION', name: 'H├ánh ─æß╗Öng hß╗ç thß╗æng' },
    { code: 'MICROSERVICE', name: 'Dß╗ïch vß╗Ñ hß╗ç thß╗æng' },
    { code: 'PROVINCE', name: 'Danh mß╗Ñc Tß╗ënh/Th├ánh' },
    { code: 'DISTRICT', name: 'Danh mß╗Ñc Quß║¡n/Huyß╗çn' },
    { code: 'GEO_AREA', name: 'Khu vß╗▒c ─æß╗ïa l├╜' },
    { code: 'DOCUMENT_TYPE', name: 'Loß║íi v─ân bß║ún' },
    { code: 'URGENCY_LEVEL', name: '─Éß╗Ö khß║⌐n' },
    { code: 'SECURITY_LEVEL', name: '─Éß╗Ö mß║¡t' },
    { code: 'DOCUMENT_DOMAIN', name: 'L─⌐nh vß╗▒c v─ân bß║ún' },
    { code: 'STORAGE_PERIOD', name: 'Thß╗¥i hß║ín bß║úo quß║ún' },
    { code: 'GENDER', name: 'Giß╗¢i t├¡nh' },
    { code: 'ETHNICITY', name: 'D├ón tß╗Öc' },
    { code: 'RELIGION', name: 'T├┤n gi├ío' },
    { code: 'IDENTITY_TYPE', name: 'Giß║Ñy tß╗¥ ─æß╗ïnh danh' },
    { code: 'POSITION', name: 'Chß╗⌐c vß╗Ñ' },
    { code: 'CIVIL_SERVANT_RANK', name: 'Ngß║ích c├┤ng chß╗⌐c' },
    { code: 'PUBLIC_EMPLOYEE_RANK', name: 'Ngß║ích vi├¬n chß╗⌐c' },
    { code: 'UNIT', name: '─É╞ín vß╗ï t├¡nh' },
    { code: 'ACADEMIC_RANK', name: 'Hß╗ìc h├ám/Hß╗ìc vß╗ï' },
    { code: 'POLITICAL_THEORY', name: 'L├╜ luß║¡n ch├¡nh trß╗ï' },

    { code: 'IT_SKILL', name: 'Tr├¼nh ─æß╗Ö tin hß╗ìc' },
    { code: 'LANGUAGE_SKILL', name: 'Tr├¼nh ─æß╗Ö ngoß║íi ngß╗»' },
    { code: 'LANGUAGE', name: 'Ng├┤n ngß╗» hß╗ç thß╗æng' },
    { code: 'DOMAIN', name: 'L─⌐nh vß╗▒c nghiß╗çp vß╗Ñ' },
    { code: 'CONTENT_TYPE', name: 'Loß║íi nß╗Öi dung' },
    { code: 'DEPARTMENT', name: 'Ph├▓ng ban' },
    { code: 'WORKFLOW_TRIGGER', name: 'K├¡ch hoß║ít quy tr├¼nh' },
    { code: 'BANNER_POSITION', name: 'Vß╗ï tr├¡ hiß╗ân thß╗ï Banner' },
    { code: 'font_family', name: 'Ph├┤ng chß╗» giao diß╗çn (Portal)' },
    { code: 'border_radius', name: '─Éß╗Ö bo g├│c khß╗æi (Portal)' },
    { code: 'AI_PROVIDER_TYPE', name: 'Nh├á cung cß║Ñp AI (LLM)' },
    { code: 'TRANSLATION_SERVICE_TYPE', name: 'Dß╗ïch vß╗Ñ Dß╗ïch thuß║¡t' },
  ];

  console.log('≡ƒôª Seeding Category Groups...');
  for (const g of groupLabels) {
    await prisma.categoryGroup.upsert({
      where: { code: g.code },
      update: { name: g.name },
      create: g,
    });
  }
  console.log('Γ£à Category Groups seeded');

  // ==========================================================
  // 3.1 UNIT TYPES (New Model)
  // ==========================================================
  console.log('≡ƒôª Seeding Unit Types...');
  const unitTypesData = [
    { code: 'CQ_TU', name: 'C╞í quan Trung ╞░╞íng', level: 1 },
    { code: 'UBND_TINH', name: 'UBND Cß║Ñp Tß╗ënh', level: 1 },
    { code: 'HDND_TINH', name: 'H─ÉND Cß║Ñp Tß╗ënh', level: 1 },
    { code: 'SO_NGANH', name: 'Sß╗ƒ, Ban, Ng├ánh', level: 2 },
    { code: 'PHONG_BAN_SO', name: 'Ph├▓ng chuy├¬n m├┤n cß║Ñp Sß╗ƒ', level: 3 },
    { code: 'PHONG_BAN_TRUNG_TAM', name: 'Ph├▓ng chuy├¬n m├┤n cß║Ñp Trung t├óm', level: 4 },
    { code: 'VAN_PHONG', name: 'V─ân ph├▓ng', level: 3 },
    { code: 'THANH_TRA', name: 'Thanh tra', level: 3 },
    { code: 'DVSN', name: '─É╞ín vß╗ï sß╗▒ nghiß╗çp', level: 2 },
    { code: 'CHI_CUC', name: 'Chi cß╗Ñc / Tß╗òng cß╗Ñc', level: 2 },
    { code: 'TRUNG_TAM', name: 'Trung t├óm', level: 3 },
    { code: 'CQ_DANG', name: 'C╞í quan ─Éß║úng', level: 1 },
    { code: 'TO_CHUC_CTXH', name: 'Tß╗ò chß╗⌐c Ch├¡nh trß╗ï - X├ú hß╗Öi', level: 2 },
  ];

  const unitTypeMap: Record<string, any> = {};
  for (const ut of unitTypesData) {
    const created = await prisma.unitType.upsert({
      where: { code: ut.code },
      update: { name: ut.name, level: ut.level },
      create: ut,
    });
    unitTypeMap[ut.code] = created;
  }
  console.log('Γ£à Unit Types seeded');

  // ==========================================================
  // 4. ROLES
  // ==========================================================
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
      name: 'Quß║ún trß╗ï vi├¬n hß╗ç thß╗æng',
    },
    create: {
      code: 'ADMIN',
      name: 'Quß║ún trß╗ï vi├¬n hß╗ç thß╗æng',
    },
  });

  // --- CMS ROLES ---
  const cmsRoles = [
    {
      code: 'AUTHOR',
      name: 'Bi├¬n tß║¡p vi├¬n',
      permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW'],
    },
    {
      code: 'REVIEWER',
      name: 'Thß║⌐m ─æß╗ïnh & Ph├¬ duyß╗çt',
      permissions: ['READ', 'VIEW', 'UPDATE', 'APPROVE', 'REJECT'],
    },
    {
      code: 'PUBLISHER',
      name: 'C├ín bß╗Ö xuß║Ñt bß║ún',
      permissions: ['READ', 'VIEW', 'PUBLISH'],
    },
  ];

  const roleMap: Record<string, any> = {
    SUPER_ADMIN: superAdminRole,
    ADMIN: adminRole,
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
          conditionString = 'resource.createdBy == currentUserId'; // Ng╞░ß╗¥i tß║ío
        } else if (r.code === 'REVIEWER' && ['UPDATE', 'APPROVE', 'REJECT'].includes(action)) {
          conditionString = 'user.positionLevel >= 3'; // Chß╗⌐c vß╗Ñ / Ph├▓ng ban
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

  // --- TASK ROLES ---
  const taskRoles = [
    {
      code: 'LEADER',
      name: 'L├únh ─æß║ío ─æ╞ín vß╗ï (Giao viß╗çc)',
      permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'ASSIGN', 'COMPLETE', 'COMMENT', 'EVALUATE', 'APPROVE'],
    },
    {
      code: 'MANAGER',
      name: 'Quß║ún l├╜ cß║Ñp ph├▓ng (Giao viß╗çc)',
      permissions: ['CREATE', 'READ', 'UPDATE', 'VIEW', 'ASSIGN', 'COMPLETE'],
    },
    {
      code: 'STAFF',
      name: 'Chuy├¬n vi├¬n / Nh├ón vi├¬n (Giao viß╗çc)',
      permissions: ['READ', 'VIEW', 'UPDATE', 'COMMENT', 'COMPLETE'],
    },
  ];

  for (const r of taskRoles) {
    const rolePoliciesData: { resourceId: number; action: string; effect: string; conditions?: any }[] = [];
    const resId = resources['TASK']?.id;
    if (resId) {
      for (const action of r.permissions) {
        let conditionString = '';
        if (r.code === 'LEADER' && ['ASSIGN', 'COMPLETE', 'EVALUATE', 'APPROVE'].includes(action)) {
          conditionString = 'user.isLeader == true'; // C╞í cß║Ñu tß╗ò chß╗⌐c / ─É╞ín vß╗ï trß╗▒c thuß╗Öc
        } else if (r.code === 'MANAGER' && ['ASSIGN', 'COMPLETE'].includes(action)) {
          conditionString = 'user.isLeader == true'; // C╞í cß║Ñu tß╗ò chß╗⌐c / Ph├▓ng ban
        } else if (r.code === 'STAFF' && ['UPDATE', 'COMMENT', 'COMPLETE'].includes(action)) {
          conditionString = 'currentUserId IN resource.assigneeIds'; // Ng╞░ß╗¥i ─æ╞░ß╗úc giao / C├óy nhiß╗çm vß╗Ñ
        }

        rolePoliciesData.push({
          resourceId: resId,
          action,
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

  // ==========================================================
  // 5. MENUS (ADMIN_PORTAL) - PBAC Implementation
  // ==========================================================

  const rootMenu = await prisma.menu.upsert({
    where: { code: 'SYS_ROOT' },
    update: { application: 'ADMIN_PORTAL' },
    create: {
      code: 'SYS_ROOT',
      name: 'Gß╗æc hß╗ç thß╗æng',
      order: 0,
      application: 'ADMIN_PORTAL',
    },
  });

  // Helper to link menu to resource permission
  const linkMenuPBAC = async (
    menuId: number,
    resCode?: string,
    action: string = 'READ',
  ) => {
    if (!resCode) return;
    const resId = resources[resCode]?.id;
    if (!resId) return;
    const perm = await prisma.permission.findUnique({
      where: { action_resourceId: { action, resourceId: resId } },
    });
    if (perm) {
      await prisma.menuRequiredPermission.upsert({
        where: { menuId_permissionId: { menuId, permissionId: perm.id } },
        update: {},
        create: { menuId, permissionId: perm.id },
      });
    }
  };

  // --- SERVICE ROOTS ---
  const services = [
    {
      code: 'USER_SERVICE_ROOT',
      name: 'Quß║ún trß╗ï Hß╗ç thß╗æng',
      icon: 'settings-outline',
      service: 'USER_SERVICE',
      color: '#3b82f6',
      order: 1,
      // res: 'USER',
      route: '/services/admin',
      description: 'Quß║ún l├╜ t├ái khoß║ún, ph├ón quyß╗ün (PBAC), tß╗ò chß╗⌐c ─æ╞ín vß╗ï v├á thiß║┐t lß║¡p hß╗ç thß╗æng.',
    },
    {
      code: 'HRM_SERVICE_ROOT',
      name: 'Quß║ún l├╜ Nh├ón sß╗▒',
      icon: 'people-outline',
      service: 'HRM_SERVICE',
      color: '#10b981',
      order: 2,
      res: 'EMPLOYEE',
      route: '/services/hrm',
      description: 'Quß║ún l├╜ hß╗ô s╞í c├ín bß╗Ö c├┤ng chß╗⌐c, vi├¬n chß╗⌐c, hß╗úp ─æß╗ông, l╞░╞íng v├á ─æ├ính gi├í.',
    },
    {
      code: 'DOCUMENT_SERVICE_ROOT',
      name: 'Quß║ún l├╜ V─ân bß║ún',
      icon: 'document-text-outline',
      service: 'DOCUMENT_SERVICE',
      color: '#f59e0b',
      order: 3,
      res: 'DOC_INCOMING',
      route: '/services/documents',
      description: 'Quß║ún l├╜ lu├ón chuyß╗ân v─ân bß║ún ─æß║┐n, v─ân bß║ún ─æi, v─ân bß║ún nß╗Öi bß╗Ö.',
    },
    {
      code: 'CONTENT_SERVICE_ROOT',
      name: 'Quß║ún l├╜ Nß╗Öi dung',
      icon: 'newspaper-outline',
      service: 'CONTENT_SERVICE',
      color: '#ec4899',
      order: 4,
      res: 'POST',
      route: '/services/posts',
      description: 'Quß║ún l├╜ b├ái viß║┐t, tin tß╗⌐c, chuy├¬n mß╗Ñc tr├¬n Cß╗òng th├┤ng tin ─æiß╗çn tß╗¡.',
    },
    {
      code: 'WORKFLOW_SERVICE_ROOT',
      name: 'Trung t├óm T├¡ch hß╗úp & Quy tr├¼nh',
      icon: 'layers-outline',
      service: 'WORKFLOW_SERVICE',
      color: '#8b5cf6',
      order: 5,
      res: 'WORKFLOW',
      route: '/services/integration',
      description: 'Quß║ún l├╜ cß║Ñu h├¼nh quy tr├¼nh ─æß╗Öng, li├¬n th├┤ng v├á t├¡ch hß╗úp dß╗» liß╗çu.',
    }
  ];

  const serviceNodes: Record<string, any> = {};
  for (const sys of services) {
    const node = await prisma.menu.upsert({
      where: { code: sys.code },
      update: {
        parentId: rootMenu.id,
        name: sys.name,
        icon: sys.icon,
        iconColor: sys.color,
        description: sys.description,
        order: sys.order,
        service: sys.service,
        route: sys.route,
      },
      create: {
        code: sys.code,
        name: sys.name,
        icon: sys.icon,
        iconColor: sys.color,
        description: sys.description,
        order: sys.order,
        service: sys.service,
        route: sys.route,
        parentId: rootMenu.id,
        application: 'ADMIN_PORTAL',
      },
    });
    serviceNodes[sys.service] = node;
    await linkMenuPBAC(node.id, sys.res, 'READ');
  }

  // --- SUB MENUS (PBAC LINKED) ---

  // 1. Admin Module
  const adminMenus = [
    {
      code: 'ADMIN_USERS',
      name: 'Ng╞░ß╗¥i d├╣ng',
      route: 'users',
      icon: 'person-outline',
      order: 1,
      res: 'USER',
      action: 'UPDATE',
    },
    {
      code: 'ADMIN_ROLES',
      name: 'Vai tr├▓ & Quyß╗ün',
      route: 'roles',
      icon: 'lock-closed-outline',
      order: 2,
      res: 'ROLE',
    },
    {
      code: 'ADMIN_RESOURCES',
      name: 'T├ái nguy├¬n',
      route: 'resources',
      icon: 'shield-checkmark-outline',
      order: 3,
      res: 'RESOURCE',
    },
    {
      code: 'ADMIN_MENUS',
      name: 'Cß║Ñu h├¼nh Menu',
      route: 'menus',
      icon: 'list-outline',
      order: 4,
      res: 'MENU',
    },
    {
      code: 'ADMIN_ORGANIZATION',
      name: '─É╞ín vß╗ï & Ph├▓ng ban',
      route: 'organization',
      icon: 'apartment',
      order: 5,
      // res: 'ORGANIZATION',
    },
    {
      code: 'ADMIN_CATEGORIES',
      name: 'Danh mß╗Ñc hß╗ç thß╗æng',
      route: 'categories',
      icon: 'cog-outline',
      order: 6,
      res: 'CATEGORY',
    },
    {
      code: 'ADMIN_SETTINGS',
      name: 'Thiß║┐t lß║¡p hß╗ç thß╗æng',
      route: 'settings',
      icon: 'settings-outline',
      order: 7,
      res: 'SYSTEM',
    },
    {
      code: 'ADMIN_ENDPOINTS',
      name: 'API Endpoints',
      route: 'endpoints',
      icon: 'shield-outline',
      order: 8,
      res: 'SYSTEM',
    },
  ];

  for (const { res, action, ...m } of adminMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        parentId: serviceNodes['USER_SERVICE'].id,
        order: m.order,
        route: m.route,
        icon: m.icon,
        name: m.name,
      },
      create: {
        ...m,
        parentId: serviceNodes['USER_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'USER_SERVICE',
      },
    });
    await linkMenuPBAC(node.id, res, action || 'READ');
  }

  // Admin Sub-menus for Settings
  const adminSettingsNode = await prisma.menu.findUnique({
    where: { code: 'ADMIN_SETTINGS' },
  });
  if (adminSettingsNode) {
    const adminSettingsSubMenus = [
      {
        code: 'ADMIN_SETTINGS_GENERAL',
        name: 'Th├┤ng sß╗æ chung',
        route: 'settings',
        icon: 'options-outline',
        order: 1,
        res: 'SYSTEM',
      },
      {
        code: 'ADMIN_NOTIFICATIONS',
        name: 'Th├┤ng b├ío',
        route: 'notifications',
        icon: 'megaphone-outline',
        order: 2,
        res: 'NOTIFICATION',
      },
    ];

    for (const { res, ...m } of adminSettingsSubMenus) {
      const node = await prisma.menu.upsert({
        where: { code: m.code },
        update: {
          parentId: adminSettingsNode.id,
          order: m.order,
          route: m.route,
          icon: m.icon,
          name: m.name,
        },
        create: {
          ...m,
          parentId: adminSettingsNode.id,
          application: 'ADMIN_PORTAL',
          service: 'USER_SERVICE',
        },
      });
      await linkMenuPBAC(node.id, res, 'READ');
    }
  }


  // 2. Document Module
  const docMenus = [
    {
      code: 'DOC_MENU_INCOMING',
      name: 'V─ân bß║ún ─æß║┐n',
      route: 'incoming',
      icon: 'document-attach-outline',
      order: 1,
      res: 'DOC_INCOMING',
    },
    {
      code: 'DOC_MENU_OUTGOING',
      name: 'V─ân bß║ún ─æi',
      route: 'outgoing',
      icon: 'document-attach-outline',
      order: 2,
      res: 'DOC_OUTGOING',
    },
    {
      code: 'DOC_MENU_PROCESSING',
      name: 'Xß╗¡ l├╜ v─ân bß║ún',
      route: 'processing',
      icon: 'document-text-outline',
      order: 3,
      res: 'DOC_PROCESSING',
    },
    {
      code: 'DOC_MENU_PUBLISH',
      name: 'Ph├ít h├ánh',
      route: 'publish',
      icon: 'globe-outline',
      order: 4,
      res: 'DOC_PUBLISH',
    },
    {
      code: 'DOC_MENU_TRANSPARENCY',
      name: 'C├┤ng khai v─ân bß║ún',
      route: 'transparency',
      icon: 'folder-outline',
      order: 5,
      res: 'DOC_TRANSPARENCY',
    },
    {
      code: 'DOC_MENU_FINANCE',
      name: 'C├┤ng khai T├ái ch├¡nh',
      route: 'transparency/finance',
      icon: 'cash-outline',
      order: 6,
      res: 'DOC_TRANSPARENCY',
    },
    {
      code: 'DOC_MENU_CONSULTATION',
      name: 'Lß║Ñy ├╜ kiß║┐n dß╗▒ thß║úo',
      route: 'consultations',
      icon: 'people-outline',
      order: 7,
      res: 'DOC_CONSULTATION',
    },
    {
      code: 'DOC_MENU_FEEDBACKS',
      name: 'Duyß╗çt G├│p ├╜ C├┤ng ch├║ng',
      route: 'consultations/public-feedbacks',
      icon: 'megaphone-outline',
      order: 8,
      res: 'DOC_CONSULTATION',
    },
    {
      code: 'DOC_MENU_MINUTES',
      name: 'Bi├¬n bß║ún cuß╗Öc hß╗ìp',
      route: 'minutes',
      icon: 'list-outline',
      order: 9,
      res: 'DOC_MINUTES',
    },

    {
      code: 'DOC_MENU_PROCEDURES',
      name: 'Thß╗º tß╗Ñc h├ánh ch├¡nh',
      route: 'procedures',
      icon: 'briefcase-outline',
      order: 11,
      res: 'DOC_INCOMING',
    },
    {
      code: 'DOC_MENU_DOSSIERS',
      name: 'Hß╗ô s╞í mß╗Öt cß╗¡a',
      route: 'dossiers',
      icon: 'folder-open-outline',
      order: 12,
      res: 'DOC_INCOMING',
    },
    {
      code: 'DOC_MENU_CABINET',
      name: 'Tß╗º v─ân bß║ún sß╗æ',
      route: 'cabinet',
      icon: 'server-outline',
      order: 13,
      res: 'DOC_INCOMING',
    },
  ];

  for (const { res, ...m } of docMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        parentId: serviceNodes['DOCUMENT_SERVICE'].id,
        order: m.order,
        route: m.route,
        icon: m.icon,
      },
      create: {
        ...m,
        parentId: serviceNodes['DOCUMENT_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'DOCUMENT_SERVICE',
      },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }
  // Clean up redundant menus
  await prisma.menu.deleteMany({
    where: {
      code: {
        in: [
          'HRM_MENU_DEPARTMENTS',
          'HRM_MENU_ATTENDANCE',
          'HRM_MENU_CONTRACTS',
          'HRM_MENU_PAYROLL',
          'HRM_MENU_TASKS',
          'HRM_MENU_CRITERIA',
          'HRM_MENU_KPI',
        ],
      },
    },
  });

  // 3. HRM Module
  const hrmMenus = [
    {
      code: 'HRM_MENU_EMPLOYEE_LIST',
      name: 'Danh s├ích c├ín bß╗Ö',
      route: 'employees',
      icon: 'people-outline',
      order: 1,
      res: 'EMPLOYEE',
      action: 'VIEW',
    },
    {
      code: 'HRM_MENU_PLANS',
      name: 'C├┤ng viß╗çc & Kß║┐ hoß║ích',
      route: 'work-plans/master-plans',
      icon: 'layers-outline',
      order: 2,
      res: 'PLAN',
      action: 'VIEW',
    },
    {
      code: 'HRM_MENU_TASKS',
      name: 'Bß║úng viß╗çc c├í nh├ón',
      route: 'work-plans/tasks',
      icon: 'briefcase-outline',
      order: 3,
      res: 'TASK',
      action: 'READ',
    },
    {
      code: 'HRM_MENU_CRITERIA',
      name: 'Khung ti├¬u ch├¡ KPI',
      route: 'work-plans/criteria',
      icon: 'settings-2-outline',
      order: 4,
      res: 'EVALUATION',
      action: 'READ',
    },

    {
      code: 'HRM_MENU_RANK_TEMPLATES',
      name: 'Cß║Ñu h├¼nh Ngß║ích',
      route: 'work-plans/rank-templates',
      icon: 'settings-outline',
      order: 6,
      res: 'EMPLOYEE',
      action: 'MANAGE',
    },
    {
      code: 'HRM_MENU_MANUAL_SELECTOR',
      name: 'G├ín viß╗çc theo Ngß║ích',
      route: 'work-plans/manual-selector',
      icon: 'list-outline',
      order: 7,
      res: 'EMPLOYEE',
      action: 'MANAGE',
    },

  ];

  for (const { res, action, ...m } of hrmMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        parentId: serviceNodes['HRM_SERVICE'].id,
        order: m.order,
        route: m.route,
        icon: m.icon,
      },
      create: {
        ...m,
        parentId: serviceNodes['HRM_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'HRM_SERVICE',
      },
    });
    await linkMenuPBAC(node.id, res, action || 'READ');
  }

  // 4. Content Module
  const postMenus = [
    {
      code: 'CONTENT_MENU_POSTS',
      name: 'Danh s├ích b├ái viß║┐t',
      route: '',
      icon: 'newspaper-outline',
      order: 1,
      res: 'POST',
    },
    {
      code: 'CONTENT_MENU_CATEGORIES',
      name: 'Chuy├¬n mß╗Ñc',
      route: 'categories',
      icon: 'list-outline',
      order: 2,
      res: 'POST_CATEGORY',
    },
    {
      code: 'CONTENT_MENU_PORTAL',
      name: 'Cß║Ñu h├¼nh Portal Menu',
      route: 'portal-menu',
      icon: 'menu-outline',
      order: 3,
      res: 'PORTAL_MENU',
    },
    {
      code: 'CONTENT_MENU_INTERACTIONS',
      name: 'T╞░╞íng t├íc c├┤ng d├ón',
      route: 'interactions',
      icon: 'chatbubbles-outline',
      order: 4,
      res: 'CITIZEN_INTERACTION',
    },
    {
      code: 'CONTENT_MENU_BANNERS',
      name: 'Banner & Quß║úng c├ío',
      route: 'banners',
      icon: 'layers-outline',
      order: 5,
      res: 'BANNER',
    },
    {
      code: 'CONTENT_MENU_PORTAL_CONFIG',
      name: 'Cß║Ñu h├¼nh chung ─æ╞ín vß╗ï',
      route: 'portal-config',
      icon: 'settings-outline',
      order: 6,
      res: 'PORTAL_MENU',
    },
  ];

  for (const { res, ...m } of postMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        parentId: serviceNodes['CONTENT_SERVICE'].id,
        order: m.order,
        route: m.route,
        icon: m.icon,
      },
      create: {
        ...m,
        parentId: serviceNodes['CONTENT_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'CONTENT_SERVICE',
      },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // Sub-menus for Interactions
  const interactionParent = await prisma.menu.findUnique({
    where: { code: 'CONTENT_MENU_INTERACTIONS' },
  });
  if (interactionParent) {
    const interactionSubMenus = [
      {
        code: 'CONTENT_MENU_COMMENTS',
        name: 'Kiß╗âm duyß╗çt b├¼nh luß║¡n',
        route: 'interactions/comments',
        icon: 'chatbox-outline',
        order: 1,
        res: 'CITIZEN_INTERACTION',
      },
      {
        code: 'CONTENT_MENU_QUESTIONS',
        name: 'Hß╗Åi ─æ├íp c├┤ng d├ón',
        route: 'interactions/questions',
        icon: 'help-circle-outline',
        order: 2,
        res: 'CITIZEN_INTERACTION',
      },
      {
        code: 'CONTENT_MENU_FEEDBACKS',
        name: 'G├│p ├╜ dß╗▒ thß║úo',
        route: 'interactions/feedbacks',
        icon: 'create-outline',
        order: 3,
        res: 'CITIZEN_INTERACTION',
      },
    ];

    for (const { res, ...m } of interactionSubMenus) {
      const node = await prisma.menu.upsert({
        where: { code: m.code },
        update: {
          parentId: interactionParent.id,
          order: m.order,
          route: m.route,
          icon: m.icon,
        },
        create: {
          ...m,
          parentId: interactionParent.id,
          application: 'ADMIN_PORTAL',
          service: 'CONTENT_SERVICE',
        },
      });
      await linkMenuPBAC(node.id, res, 'READ');
    }
  }

  // 5. Workflow & Integration Module
  const workflowMenus = [
    {
      code: 'WORKFLOW_MENU_BUILDER',
      name: 'Trung t├óm Li├¬n th├┤ng',
      route: '/services/integration',
      icon: 'git-network-outline',
      order: 1,
      res: 'WORKFLOW',
    }
  ];

  for (const { res, ...m } of workflowMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        parentId: serviceNodes['WORKFLOW_SERVICE'].id,
        order: m.order,
        route: m.route,
        icon: m.icon,
      },
      create: {
        ...m,
        parentId: serviceNodes['WORKFLOW_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'WORKFLOW_SERVICE',
      },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // ==========================================================
  // 6. USERS
  // ==========================================================
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@sys.com' },
    update: { roles: { set: [{ id: superAdminRole.id }] } },
    create: {
      email: 'superadmin@sys.com',
      username: 'superadmin',
      fullName: 'Super Administrator',
      roles: { connect: [{ id: superAdminRole.id }] },
    },
  });

  await prisma.credential.upsert({
    where: { userId: superAdmin.id },
    update: { passwordHash },
    create: { userId: superAdmin.id, passwordHash },
  });

  // --- CMS USERS ---
  const cmsUsers = [
    {
      email: 'author@daklak.gov.vn',
      username: 'author',
      fullName: 'Nguyß╗àn V─ân Bi├¬n Tß║¡p',
      role: 'AUTHOR',
    },
    {
      email: 'reviewer@daklak.gov.vn',
      username: 'reviewer',
      fullName: 'L├¬ V─ân Thß║⌐m ─Éß╗ïnh',
      role: 'REVIEWER',
    },
    {
      email: 'approver@daklak.gov.vn',
      username: 'approver',
      fullName: 'Phß║ím Ph├¬ Duyß╗çt',
      role: 'REVIEWER',
    },
    {
      email: 'publisher@daklak.gov.vn',
      username: 'publisher',
      fullName: 'Trß║ºn Xuß║Ñt Bß║ún',
      role: 'PUBLISHER',
    },
    {
      email: 'trungthanh@daklak.gov.vn',
      username: 'trungthanh',
      fullName: 'Trß║ºn Trung Th├ánh',
      role: 'ADMIN',
    },
  ];

  for (const u of cmsUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        roles: { set: [{ id: roleMap[u.role].id }] },
      },
      create: {
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        roles: { connect: [{ id: roleMap[u.role].id }] },
      },
    });

    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });
  }

  // ==========================================================
  // 7. JOB TITLES
  // ==========================================================
  console.log('≡ƒôª Seeding Job Titles...');
  const jobTitlesData = [
    {
      code: 'CHU_TICH',
      name: 'Chß╗º tß╗ïch',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHU_TICH',
      name: 'Ph├│ Chß╗º tß╗ïch',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'GIAM_DOC',
      name: 'Gi├ím ─æß╗æc',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_GIAM_DOC',
      name: 'Ph├│ Gi├ím ─æß╗æc',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'TRUONG_PHONG',
      name: 'Tr╞░ß╗ƒng ph├▓ng',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_PHONG',
      name: 'Ph├│ Tr╞░ß╗ƒng ph├▓ng',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'CHANH_VAN_PHONG',
      name: 'Ch├ính V─ân ph├▓ng',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHANH_VAN_PHONG',
      name: 'Ph├│ Ch├ính V─ân ph├▓ng',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'CHANH_THANH_TRA',
      name: 'Ch├ính Thanh tra',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHANH_THANH_TRA',
      name: 'Ph├│ Ch├ính Thanh tra',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'THANH_TRA_VIEN',
      name: 'Thanh tra vi├¬n',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'THANH_TRA_VIEN_CHINH',
      name: 'Thanh tra vi├¬n ch├¡nh',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'THANH_TRA_VIEN_CAO_CAP',
      name: 'Thanh tra vi├¬n cao cß║Ñp',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'UY_VIEN_UBND',
      name: 'ß╗ªy vi├¬n UBND',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'SPECIALIST',
      name: 'Chuy├¬n vi├¬n',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'SENIOR_SPECIALIST',
      name: 'Chuy├¬n vi├¬n cao cß║Ñp',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'PRINCIPAL_SPECIALIST',
      name: 'Chuy├¬n vi├¬n ch├¡nh',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'OFFICER',
      name: 'C├ín sß╗▒',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'KE_TOAN',
      name: 'Kß║┐ to├ín',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'VAN_THU',
      name: 'V─ân th╞░',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'VIEN_CHUC',
      name: 'Vi├¬n chß╗⌐c',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'NHAN_VIEN',
      name: 'Nh├ón vi├¬n',
      category: 'SUPPORT',
      rank: 5,
      type: 'RANK',
    },
    {
      code: 'BAO_VE',
      name: 'Bß║úo vß╗ç',
      category: 'SUPPORT',
      rank: 6,
      type: 'RANK',
    },
    {
      code: 'CONG_CHUC_PHU_TRACH',
      name: 'C├┤ng chß╗⌐c phß╗Ñ tr├ích',
      category: 'STAFF',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'CAN_BO_PHU_TRACH',
      name: 'C├ín bß╗Ö phß╗Ñ tr├ích',
      category: 'STAFF',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'BI_THU_DANG_BO',
      name: 'B├¡ th╞░ ─Éß║úng bß╗Ö',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU_DANG_BO',
      name: 'Ph├│ B├¡ th╞░ ─Éß║úng bß╗Ö',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'BI_THU_CHI_BO',
      name: 'B├¡ th╞░ Chi bß╗Ö',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU_CHI_BO',
      name: 'Ph├│ B├¡ th╞░ Chi bß╗Ö',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'DANG_UY_VIEN',
      name: '─Éß║úng ß╗ºy vi├¬n',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'PARTY',
    },
    {
      code: 'CHI_UY_VIEN',
      name: 'Chi ß╗ºy vi├¬n',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'PARTY',
    },
    {
      code: 'BI_THU',
      name: 'B├¡ th╞░',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU',
      name: 'Ph├│ B├¡ th╞░',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'TRUONG_BAN',
      name: 'Tr╞░ß╗ƒng ban',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_TRUONG_BAN',
      name: 'Ph├│ Tr╞░ß╗ƒng ban',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
  ];

  for (const jt of jobTitlesData) {
    await prisma.jobTitle.upsert({
      where: { code: jt.code },
      update: {
        name: jt.name,
        category: jt.category,
        rank: jt.rank,
        type: jt.type,
      },
      create: jt,
    });
  }

  // 7.1 LINK JOB TITLES TO UNIT TYPES (Using Template)
  console.log('≡ƒôª Cleaning and linking Job Titles to Unit Types...');
  await prisma.unitTypeJobTemplate.deleteMany({});

  const links = [
    {
      jt: 'CHU_TICH',
      types: [
        'UBND_TINH',
        'HDND_TINH',
      ],
    },
    {
      jt: 'PHO_CHU_TICH',
      types: [
        'UBND_TINH',
        'HDND_TINH',
      ],
    },
    { jt: 'UY_VIEN_UBND', types: ['UBND_TINH'] },
    { jt: 'GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    {
      jt: 'TRUONG_PHONG',
      types: [
        'PHONG_BAN_SO',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    {
      jt: 'PHO_PHONG',
      types: [
        'PHONG_BAN_SO',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    { jt: 'CHANH_VAN_PHONG', types: ['VAN_PHONG'] },
    { jt: 'PHO_CHANH_VAN_PHONG', types: ['VAN_PHONG'] },
    { jt: 'CHANH_THANH_TRA', types: ['THANH_TRA'] },
    { jt: 'PHO_CHANH_THANH_TRA', types: ['THANH_TRA'] },
    { jt: 'THANH_TRA_VIEN', types: ['THANH_TRA'] },
    { jt: 'THANH_TRA_VIEN_CHINH', types: ['THANH_TRA'] },
    { jt: 'THANH_TRA_VIEN_CAO_CAP', types: ['THANH_TRA'] },
    {
      jt: 'SPECIALIST',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    {
      jt: 'SENIOR_SPECIALIST',
      types: ['PHONG_BAN_SO', 'VAN_PHONG', 'CHI_CUC'],
    },
    {
      jt: 'PRINCIPAL_SPECIALIST',
      types: ['PHONG_BAN_SO', 'VAN_PHONG', 'CHI_CUC'],
    },
    {
      jt: 'OFFICER',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'STAFF',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'CONG_CHUC_PHU_TRACH',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'CAN_BO_PHU_TRACH',
      types: [
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'BI_THU_DANG_BO',
      types: [
        'CQ_DANG',
        'SO_NGANH',
        'UBND_TINH',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'PHO_BI_THU_DANG_BO',
      types: [
        'CQ_DANG',
        'SO_NGANH',
        'UBND_TINH',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'DANG_UY_VIEN',
      types: [
        'CQ_DANG',
        'SO_NGANH',
        'UBND_TINH',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'BI_THU_CHI_BO',
      types: [
        'CQ_DANG',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
      ],
    },
    {
      jt: 'PHO_BI_THU_CHI_BO',
      types: [
        'CQ_DANG',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
      ],
    },
    {
      jt: 'CHI_UY_VIEN',
      types: [
        'CQ_DANG',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
      ],
    },
    { jt: 'BI_THU', types: ['CQ_DANG'] },
    { jt: 'PHO_BI_THU', types: ['CQ_DANG'] },
    { jt: 'TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
    { jt: 'PHO_TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
  ];

  // Dynamically add PHONG_BAN_TRUNG_TAM to any link that supports PHONG_BAN_SO
  for (const link of links) {
    if (link.types.includes('PHONG_BAN_SO') && !link.types.includes('PHONG_BAN_TRUNG_TAM')) {
      link.types.push('PHONG_BAN_TRUNG_TAM');
    }
  }

  const templatesToCreate: { unitTypeId: number; jobTitleId: number }[] = [];
  for (const link of links) {
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { code: link.jt },
    });
    if (jobTitle) {
      for (const typeCode of link.types) {
        const typeId = unitTypeMap[typeCode]?.id;
        if (typeId) {
          templatesToCreate.push({ unitTypeId: typeId, jobTitleId: jobTitle.id });
        }
      }
    }
  }

  if (templatesToCreate.length > 0) {
    await prisma.unitTypeJobTemplate.createMany({
      data: templatesToCreate,
      skipDuplicates: true,
    });
  }

  // ==========================================================
  // 8. ORGANIZATIONS (DAK LAK PROVINCE)
  // ==========================================================
  console.log('≡ƒôª Seeding Organization Units...');
  const ubndTinhTypeId = unitTypeMap['UBND_TINH'].id;
  const soTypeId = unitTypeMap['SO_NGANH'].id;
  const phongTypeId = unitTypeMap['PHONG_BAN_SO'].id; // fallback changed from HUYEN to SO
  const dvsnTypeId = unitTypeMap['DVSN'].id;
  const trungTamTypeId = unitTypeMap['TRUNG_TAM'].id;

  const province = await prisma.organizationUnit.upsert({
    where: { code: 'H15' },
    update: { name: 'UBND Tß╗ënh ─Éß║»k Lß║»k', typeId: ubndTinhTypeId },
    create: {
      code: 'H15',
      name: 'UBND Tß╗ënh ─Éß║»k Lß║»k',
      typeId: ubndTinhTypeId,
      shortName: 'UBND Tß╗ënh',
    },
  });

  const depts = [
    {
      code: 'H15.07',
      name: 'Sß╗ƒ Khoa hß╗ìc v├á C├┤ng nghß╗ç',
      shortName: 'Sß╗ƒ KH&CN',
    },
    { code: 'H15.08', name: 'Sß╗ƒ Giao th├┤ng vß║¡n tß║úi', shortName: 'Sß╗ƒ GTVT' },
    { code: 'H15.09', name: 'Sß╗ƒ Y tß║┐', shortName: 'Sß╗ƒ Y tß║┐' },
    { code: 'H15.10', name: 'Sß╗ƒ Gi├ío dß╗Ñc v├á ─É├áo tß║ío', shortName: 'Sß╗ƒ GD&─ÉT' },
    { code: 'H15.11', name: 'Sß╗ƒ T├ái ch├¡nh', shortName: 'Sß╗ƒ T├ái ch├¡nh' },
    { code: 'H15.12', name: 'Sß╗ƒ Kß║┐ hoß║ích v├á ─Éß║ºu t╞░', shortName: 'Sß╗ƒ KH&─ÉT' },
    { code: 'H15.13', name: 'Sß╗ƒ Nß╗Öi vß╗Ñ', shortName: 'Sß╗ƒ Nß╗Öi vß╗Ñ' },
    { code: 'H15.14', name: 'Sß╗ƒ X├óy dß╗▒ng', shortName: 'Sß╗ƒ X├óy dß╗▒ng' },
    { code: 'H15.15', name: 'Sß╗ƒ T╞░ ph├íp', shortName: 'Sß╗ƒ T╞░ ph├íp' },
    {
      code: 'H15.16',
      name: 'Sß╗ƒ V─ân h├│a - Thß╗â thao v├á Du lß╗ïch',
      shortName: 'Sß╗ƒ VHTTDL',
    },
    { code: 'H15.17', name: 'Sß╗ƒ C├┤ng th╞░╞íng', shortName: 'Sß╗ƒ C├┤ng th╞░╞íng' },
    {
      code: 'H15.18',
      name: 'Sß╗ƒ N├┤ng nghiß╗çp v├á Ph├ít triß╗ân n├┤ng th├┤n',
      shortName: 'Sß╗ƒ NN&PTNT',
    },
    { code: 'H15.19', name: 'Sß╗ƒ D├ón tß╗Öc v├á T├┤n gi├ío', shortName: 'Sß╗ƒ D├ón tß╗Öc' },
    { code: 'H15.20', name: 'Thanh tra Tß╗ënh', shortName: 'Thanh tra Tß╗ënh' },
    { code: 'H15.01', name: 'V─ân ph├▓ng UBND tß╗ënh', shortName: 'VP UBND' },
  ];

  for (const d of depts) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: soTypeId },
      create: { ...d, parentId: province.id, typeId: soTypeId },
    });
  }

  // Th├¬m v├¡ dß╗Ñ UBND X├ú (Trß╗▒c thuß╗Öc Tß╗ënh theo m├┤ h├¼nh 2 cß║Ñp)







  // Th├¬m ─É╞ín vß╗ï sß╗▒ nghiß╗çp ti├¬u biß╗âu
  const soKhcn = await prisma.organizationUnit.findUnique({
    where: { code: 'H15.07' },
  });
  if (soKhcn) {
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.01' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.01',
        name: 'Trung t├óm ─Éß╗òi mß╗¢i S├íng tß║ío',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.04' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.04',
        name: 'Trung t├óm Gi├ím s├ít, ─Éiß╗üu h├ánh ─É├┤ thß╗ï Th├┤ng minh (IOC)',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.02' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.02',
        name: 'Trung t├óm Kß╗╣ thuß║¡t Ti├¬u chuß║⌐n - ─Éo l╞░ß╗¥ng - Chß║Ñt l╞░ß╗úng',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.03' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.03',
        name: 'Trung t├óm Th├┤ng tin - ß╗¿ng dß╗Ñng Khoa hß╗ìc v├á C├┤ng nghß╗ç',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
  }

  console.log('≡ƒÄë COMPREHENSIVE E-GOV SEED COMPLETED');
  console.log(`≡ƒæë SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);

  console.log('≡ƒôª Seeding Departments for Organizations...');

  // helper tß║ío ph├▓ng ban
  const createDept = async (
    parentCode: string,
    dept: { code: string; name: string; typeCode?: string },
  ) => {
    const parent = await prisma.organizationUnit.findUnique({
      where: { code: parentCode },
    });
    if (!parent) return;

    const tId = dept.typeCode ? unitTypeMap[dept.typeCode]?.id : phongTypeId;

    await prisma.organizationUnit.upsert({
      where: { code: dept.code },
      update: { parentId: parent.id, typeId: tId },
      create: {
        code: dept.code,
        name: dept.name,
        parentId: parent.id,
        typeId: tId,
      },
    });
  };

  // ==========================
  // 1. Sß╗₧ KHOA Hß╗îC & C├öNG NGHß╗å
  // ==========================
  await createDept('H15.07', {
    code: 'H15.07.05',
    name: 'V─ân ph├▓ng Sß╗ƒ',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07', {
    code: 'H15.07.06',
    name: 'Thanh tra Sß╗ƒ',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.07', {
    code: 'H15.07.07',
    name: 'Ph├▓ng Kß║┐ hoß║ích - T├ái ch├¡nh',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.08',
    name: 'Ph├▓ng Quß║ún l├╜ Khoa hß╗ìc',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.09',
    name: 'Ph├▓ng Chuyß╗ân ─æß╗òi sß╗æ',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.10',
    name: 'Ph├▓ng Quß║ún l├╜ C├┤ng nghß╗ç v├á ─Éß╗òi mß╗¢i s├íng tß║ío',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.11',
    name: 'Ph├▓ng Quß║ún l├╜ Ti├¬u chuß║⌐n - ─Éo l╞░ß╗¥ng - Chß║Ñt l╞░ß╗úng',
    typeCode: 'PHONG_BAN_SO',
  });

  // C├íc ph├▓ng thuß╗Öc Trung t├óm ─Éß╗òi mß╗¢i S├íng tß║ío
  await createDept('H15.07.01', {
    code: 'H15.07.01.01',
    name: 'Ph├▓ng H├ánh ch├¡nh - Tß╗òng hß╗úp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.01', {
    code: 'H15.07.01.02',
    name: 'Ph├▓ng ╞»╞ím tß║ío v├á Ph├ít triß╗ân',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // C├íc ph├▓ng thuß╗Öc Trung t├óm IOC
  await createDept('H15.07.04', {
    code: 'H15.07.04.01',
    name: 'Ph├▓ng H├ánh ch├¡nh - Tß╗òng hß╗úp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.02',
    name: 'Ph├▓ng Khai th├íc v├á Quß║ún l├╜ dß╗» liß╗çu',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.03',
    name: 'Ph├▓ng Hß║í tß║ºng - ─É├┤ thß╗ï th├┤ng minh',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // C├íc ph├▓ng thuß╗Öc Trung t├óm Kß╗╣ thuß║¡t Ti├¬u chuß║⌐n - ─Éo l╞░ß╗¥ng - Chß║Ñt l╞░ß╗úng
  await createDept('H15.07.02', {
    code: 'H15.07.02.01',
    name: 'Ph├▓ng H├ánh ch├¡nh - Tß╗ò chß╗⌐c',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.02',
    name: 'Ph├▓ng ─Éo l╞░ß╗¥ng',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.03',
    name: 'Ph├▓ng Thß╗¡ nghiß╗çm',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // C├íc ph├▓ng thuß╗Öc Trung t├óm Th├┤ng tin - ß╗¿ng dß╗Ñng Khoa hß╗ìc v├á C├┤ng nghß╗ç
  await createDept('H15.07.03', {
    code: 'H15.07.03.01',
    name: 'Ph├▓ng H├ánh ch├¡nh - Tß╗òng hß╗úp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.02',
    name: 'Ph├▓ng Th├┤ng tin KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.03',
    name: 'Ph├▓ng ß╗¿ng dß╗Ñng KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.04',
    name: 'Ph├▓ng Dß╗ïch vß╗Ñ KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.05',
    name: 'Trß║íi Thß╗▒c nghiß╗çm KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // ==========================
  // 2. Sß╗₧ Y Tß║╛
  // ==========================
  await createDept('SO_YTE', {
    code: 'SO_YTE_VP',
    name: 'V─ân ph├▓ng Sß╗ƒ',
    typeCode: 'VAN_PHONG',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_TT',
    name: 'Thanh tra Sß╗ƒ',
    typeCode: 'THANH_TRA',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_KHTC',
    name: 'Ph├▓ng Kß║┐ hoß║ích - T├ái ch├¡nh',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_NVY',
    name: 'Ph├▓ng Nghiß╗çp vß╗Ñ Y',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_DUOC',
    name: 'Ph├▓ng Quß║ún l├╜ D╞░ß╗úc',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 3. Sß╗₧ GI├üO Dß╗ñC
  // ==========================
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_VP',
    name: 'V─ân ph├▓ng Sß╗ƒ',
    typeCode: 'VAN_PHONG',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_TT',
    name: 'Thanh tra Sß╗ƒ',
    typeCode: 'THANH_TRA',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_KHTC',
    name: 'Ph├▓ng Kß║┐ hoß║ích - T├ái ch├¡nh',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_TCCB',
    name: 'Ph├▓ng Tß╗ò chß╗⌐c C├ín bß╗Ö',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_GDTRH',
    name: 'Ph├▓ng Gi├ío dß╗Ñc Trung hß╗ìc',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 4. Sß╗₧ T├ÇI CH├ìNH
  // ==========================
  await createDept('SO_TC', {
    code: 'SO_TC_VP',
    name: 'V─ân ph├▓ng Sß╗ƒ',
    typeCode: 'VAN_PHONG',
  });
  await createDept('SO_TC', {
    code: 'SO_TC_TT',
    name: 'Thanh tra Sß╗ƒ',
    typeCode: 'THANH_TRA',
  });
  await createDept('SO_TC', {
    code: 'SO_TC_NS',
    name: 'Ph├▓ng Ng├ón s├ích',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_TC', {
    code: 'SO_TC_HCSN',
    name: 'Ph├▓ng H├ánh ch├¡nh sß╗▒ nghiß╗çp',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================================================
  // 9. JOB POSITIONS
  // ==========================================================
  console.log('≡ƒôª Seeding Job Positions & Leaders (April 2026)...');

  const assignLeader = async (
    email: string,
    username: string,
    fullName: string,
    unitCode: string,
    jobTitleCode: string,
    isUnitLeader: boolean,
  ) => {
    // Determine PBAC Role based on job title
    let pbacRoleCode = 'STAFF';
    if (['GIAM_DOC', 'PHO_GIAM_DOC', 'CHU_TICH', 'PHO_CHU_TICH'].includes(jobTitleCode)) {
      pbacRoleCode = 'LEADER';
    } else if (['CHANH_VAN_PHONG', 'PHO_CHANH_VAN_PHONG', 'TRUONG_PHONG', 'PHO_PHONG', 'GIAM_DOC_TRUNG_TAM', 'PHO_GIAM_DOC_TRUNG_TAM'].includes(jobTitleCode)) {
      pbacRoleCode = 'MANAGER';
    }

    const pbacRole = await prisma.role.findUnique({ where: { code: pbacRoleCode } });
    const rolesConnect = [{ id: roleMap['AUTHOR']?.id || 1 }];
    if (pbacRole) {
      rolesConnect.push({ id: pbacRole.id });
    }

    // We assume DEFAULT_PASSWORD is still in scope
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        fullName,
        roles: { set: [], connect: rolesConnect }
      },
      create: {
        email,
        username,
        fullName,
        roles: { connect: rolesConnect },
      },
    });

    // ensure password
    await prisma.credential.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: { userId: user.id, passwordHash },
    });

    const unit = await prisma.organizationUnit.findUnique({
      where: { code: unitCode },
    });
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { code: jobTitleCode },
    });

    if (unit && jobTitle) {
      const existingPosition = await prisma.jobPosition.findFirst({
        where: { userId: user.id },
      });
      if (existingPosition) {
        // Cß║¡p nhß║¡t nß║┐u ─æ╞ín vß╗ï hoß║╖c chß╗⌐c danh bß╗ï sai
        if (existingPosition.unitId !== unit.id || existingPosition.jobTitleId !== jobTitle.id) {
          await prisma.jobPosition.update({
            where: { id: existingPosition.id },
            data: {
              unitId: unit.id,
              jobTitleId: jobTitle.id,
              isPrimary: true,
              isUnitLeader,
              isDeputyLeader: jobTitleCode.includes('PHO_'),
            },
          });
        }
      } else {
        await prisma.jobPosition.create({
          data: {
            userId: user.id,
            unitId: unit.id,
            jobTitleId: jobTitle.id,
            isPrimary: true,
            isUnitLeader,
            isDeputyLeader: jobTitleCode.includes('PHO_'),
          },
        });
        console.log(
          `Γ£à Created job position for ${fullName} at ${unit.name} (${jobTitle.name})`,
        );
      }
    }
  };

  // 1. UBND Tß╗ënh ─Éß║»k Lß║»k
  await assignLeader(
    'dohuuhuy@daklak.gov.vn',
    'dohuuhuy',
    '─Éß╗ù Hß╗»u Huy',
    'H15',
    'CHU_TICH',
    true,
  );
  // 2. Sß╗ƒ Nß╗Öi vß╗Ñ
  await assignLeader(
    'truongngoctuan@daklak.gov.vn',
    'truongngoctuan',
    'Tr╞░╞íng Ngß╗ìc Tuß║Ñn',
    'SO_NV',
    'GIAM_DOC',
    true,
  );
  // 3. Sß╗ƒ Khoa hß╗ìc & C├┤ng nghß╗ç
  await assignLeader(
    'buithanhtoan@daklak.gov.vn',
    'buithanhtoan',
    'B├╣i Thanh To├án',
    'H15.07',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'phamgiaviet@daklak.gov.vn',
    'phamgiaviet',
    'Phß║ím Gia Viß╗çt',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  await assignLeader(
    'ralantruongthanhha@daklak.gov.vn',
    'ralantruongthanhha',
    'Ra Lan Tr╞░╞íng Thanh H├á',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  await assignLeader(
    'tranvanson@daklak.gov.vn',
    'tranvanson',
    'Trß║ºn V─ân S╞ín',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  await assignLeader(
    'lamvumyhanh@daklak.gov.vn',
    'lamvumyhanh',
    'L├óm V┼⌐ Mß╗╣ Hß║ính',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  // B├¡ th╞░ ─Éß║úng bß╗Ö th╞░ß╗¥ng l├á Gi├ím ─æß╗æc
  await assignLeader(
    'buithanhtoan@daklak.gov.vn',
    'buithanhtoan',
    'B├╣i Thanh To├án',
    'H15.07',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'phamgiaviet@daklak.gov.vn',
    'phamgiaviet',
    'Phß║ím Gia Viß╗çt',
    'H15.07',
    'PHO_BI_THU_DANG_BO',
    true,
  );

  // L├únh ─æß║ío c├íc ph├▓ng ban Sß╗ƒ KHCN
  await assignLeader(
    'nguyenvana@daklak.gov.vn',
    'nguyenvana',
    'Nguyß╗àn V─ân A',
    'H15.07.05',
    'CHANH_VAN_PHONG',
    true,
  );
  await assignLeader(
    'lethib@daklak.gov.vn',
    'lethib',
    'L├¬ Thß╗ï B',
    'H15.07.07',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'tranvanc@daklak.gov.vn',
    'tranvanc',
    'Trß║ºn V─ân C',
    'H15.07.08',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'phamthid@daklak.gov.vn',
    'phamthid',
    'Phß║ím Thß╗ï D',
    'H15.07.09',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'hoangvane@daklak.gov.vn',
    'hoangvane',
    'Ho├áng V─ân E',
    'H15.07.10',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'vuthif@daklak.gov.vn',
    'vuthif',
    'V┼⌐ Thß╗ï F',
    'H15.07.11',
    'TRUONG_PHONG',
    true,
  );

  // L├únh ─æß║ío c├íc Trung t├óm thuß╗Öc Sß╗ƒ KHCN
  await assignLeader(
    'dovang@daklak.gov.vn',
    'dovang',
    '─Éß╗ù V─ân G',
    'H15.07.01',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'lyvani@daklak.gov.vn',
    'lyvani',
    'L├╜ V─ân I',
    'H15.07.02',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'vonguyenhoangnam@daklak.gov.vn',
    'vonguyenhoangnam',
    'V├╡ Nguyß╗àn Ho├áng Nam',
    'H15.07.04',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'lexuanquang@daklak.gov.vn',
    'lexuanquang',
    'L├¬ Xu├ón Quang',
    'H15.07.04',
    'PHO_GIAM_DOC',
    false,
  );
  await assignLeader(
    'tranduytan@daklak.gov.vn',
    'tranduytan',
    'Trß║ºn Duy T├ón',
    'H15.07.04',
    'PHO_GIAM_DOC',
    false,
  );

  // L├únh ─æß║ío c├íc ph├▓ng thuß╗Öc Trung t├óm
  await assignLeader(
    'truongphonghc_dmsm@daklak.gov.vn',
    'truongphonghc_dmsm',
    'Ho├áng V─ân HC',
    'H15.07.01.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongut_dmsm@daklak.gov.vn',
    'truongphongut_dmsm',
    'L├¬ Thß╗ï UT',
    'H15.07.01.02',
    'TRUONG_PHONG',
    true,
  );


  await assignLeader(
    'lequangthanh@daklak.gov.vn',
    'lequangthanh',
    'L├¬ Quang Thanh',
    'H15.07.04.03',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'letrongvu@daklak.gov.vn',
    'letrongvu',
    'L├¬ Trß╗ìng V┼⌐',
    'H15.07.04.02',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'leanhtuan@daklak.gov.vn',
    'leanhtuan',
    'L├¬ Anh Tuß║Ñn',
    'H15.07.04.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'chautrongphat@daklak.gov.vn',
    'chautrongphat',
    'Ch├óu Trß╗ìng Ph├ít',
    'H15.07.04.01',
    'KE_TOAN',
    false,
  );
  await assignLeader(
    'phamtheanh@daklak.gov.vn',
    'phamtheanh',
    'Phß║ím Thß║┐ Anh',
    'H15.07.04.03',
    'VIEN_CHUC',
    false,
  );
  await assignLeader(
    'nguyenvuhuy@daklak.gov.vn',
    'nguyenvuhuy',
    'Nguyß╗àn V┼⌐ Huy',
    'H15.07.04.03',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'lethithanhkieu@daklak.gov.vn',
    'lethithanhkieu',
    'L├¬ Thß╗ï Thanh Kiß╗üu',
    'H15.07.04.02',
    'VIEN_CHUC',
    false,
  );
  await assignLeader(
    'truongphonghc_kttdc@daklak.gov.vn',
    'truongphonghc_kttdc',
    'Nguyß╗àn V─ân HC',
    'H15.07.02.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongdl_kttdc@daklak.gov.vn',
    'truongphongdl_kttdc',
    '─Éinh Thß╗ï DL',
    'H15.07.02.02',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongtn_kttdc@daklak.gov.vn',
    'truongphongtn_kttdc',
    'V┼⌐ V─ân TN',
    'H15.07.02.03',
    'TRUONG_PHONG',
    true,
  );

  // Th├¬m mß╗Öt sß╗æ Ph├│ Tr╞░ß╗ƒng ph├▓ng (V├¡ dß╗Ñ)
  await assignLeader(
    'phochvp_khcn@daklak.gov.vn',
    'phochvp_khcn',
    'Tr╞░╞íng V─ân Ph├│ 1',
    'H15.07.05',
    'PHO_CHANH_VAN_PHONG',
    false,
  );
  await assignLeader(
    'photp_khtc_khcn@daklak.gov.vn',
    'photp_khtc_khcn',
    'Ng├┤ Thß╗ï Ph├│ 2',
    'H15.07.07',
    'PHO_TRUONG_PHONG',
    false,
  );

  // 4. Sß╗ƒ T├ái ch├¡nh
  await assignLeader(
    'tranvantan@daklak.gov.vn',
    'tranvantan',
    'Trß║ºn V─ân T├ón',
    'H15.11',
    'GIAM_DOC',
    true,
  );
  // 5. Nh├ón vi├¬n Ph├▓ng Khai th├íc & Quß║ún l├╜ dß╗» liß╗çu (H15.07.04.02)
  await assignLeader(
    'trantrungthanh@daklak.gov.vn',
    'trantrungthanh',
    'Trß║ºn Trung Th├ánh',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'nguyenthiquynhmai@daklak.gov.vn',
    'nguyenthiquynhmai',
    'Nguyß╗àn Thß╗ï Quß╗│nh Mai',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'nguyenquangtu@daklak.gov.vn',
    'nguyenquangtu',
    'Nguyß╗àn Quang T├║',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  // 6. Ph╞░ß╗¥ng T├ón Lß║¡p
  await assignLeader(
    'vuvanhung@daklak.gov.vn',
    'vuvanhung',
    'V┼⌐ V─ân H╞░ng',
    'H15.52',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'tranducnhat@daklak.gov.vn',
    'tranducnhat',
    'Trß║ºn ─Éß╗⌐c Nhß║¡t',
    'H15.52',
    'CHU_TICH',
    true,
  );
  // 7. Ph╞░ß╗¥ng T├ón An
  await assignLeader(
    'nguyenducvinh@daklak.gov.vn',
    'nguyenducvinh',
    'Nguyß╗àn ─Éß╗⌐c Vinh',
    'H15.53',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'phamtrungnghia@daklak.gov.vn',
    'phamtrungnghia',
    'Phß║ím Trung Ngh─⌐a',
    'H15.53',
    'CHU_TICH',
    true,
  );
  // 9. C├íc gi├ím ─æß╗æc Sß╗ƒ mß╗¢i (cß║¡p nhß║¡t tß╗½ 2026)
  await assignLeader(
    'caodinhhuy@daklak.gov.vn',
    'caodinhhuy',
    'Cao ─É├¼nh Huy',
    'H15.14',
    'GIAM_DOC',
    true,
  );
  // 10. C├íc ph╞░ß╗¥ng/x├ú c├▓n lß║íi
  await assignLeader(
    'nguyenthanhliem@daklak.gov.vn',
    'nguyenthanhliem',
    'Nguyß╗àn Thanh Li├¬m',
    'H15.54',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'nguyendinhtam@daklak.gov.vn',
    'nguyendinhtam',
    'Nguyß╗àn ─É├¼nh T├óm',
    'H15.54',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    'phamtienhung@daklak.gov.vn',
    'phamtienhung',
    'Phß║ím Tiß║┐n H╞░ng',
    'H15.55',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'nguyenthehau@daklak.gov.vn',
    'nguyenthehau',
    'Nguyß╗àn Thß║┐ Hß║¡u',
    'H15.55',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    'danggiaduan@daklak.gov.vn',
    'danggiaduan',
    '─Éß║╖ng Gia Duß║⌐n',
    'H15.56',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'ledaithang@daklak.gov.vn',
    'ledaithang',
    'L├¬ ─Éß║íi Thß║»ng',
    'H15.56',
    'CHU_TICH',
    true,
  );

  // ==========================
  // STAFFING (─Éß╗ïnh bi├¬n)
  // ==========================
  console.log('≡ƒôª Seeding Staffing (─Éß╗ïnh bi├¬n)...');
  const setStaffing = async (
    unitCode: string,
    jobTitleCode: string,
    quantity: number,
  ) => {
    const unit = await prisma.organizationUnit.findUnique({
      where: { code: unitCode },
    });
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { code: jobTitleCode },
    });
    if (unit && jobTitle) {
      await prisma.organizationStaffing.upsert({
        where: {
          unitId_jobTitleId: { unitId: unit.id, jobTitleId: jobTitle.id },
        },
        update: { quantity },
        create: {
          unitId: unit.id,
          jobTitleId: jobTitle.id,
          quantity,
        },
      });
    }
  };

  // ========================================
  // Sß╗₧ KHOA Hß╗îC & C├öNG NGHß╗å (H15.07)
  // ========================================
  await setStaffing('H15.07', 'GIAM_DOC', 1);
  await setStaffing('H15.07', 'PHO_GIAM_DOC', 4);

  // ΓöÇΓöÇ V─ân ph├▓ng Sß╗ƒ (H15.07.05) ΓöÇΓöÇ
  await setStaffing('H15.07.05', 'CHANH_VAN_PHONG', 1);
  await setStaffing('H15.07.05', 'PHO_CHANH_VAN_PHONG', 2);
  await setStaffing('H15.07.05', 'SPECIALIST', 5);

  // ΓöÇΓöÇ Ph├▓ng ban chuy├¬n m├┤n Sß╗ƒ KHCN ΓöÇΓöÇ
  // H15.07.06 - Thanh tra Sß╗ƒ
  await setStaffing('H15.07.06', 'CHANH_THANH_TRA', 1);
  await setStaffing('H15.07.06', 'PHO_CHANH_THANH_TRA', 1);
  await setStaffing('H15.07.06', 'THANH_TRA_VIEN', 3);

  // H15.07.07 - Ph├▓ng Kß║┐ hoß║ích - T├ái ch├¡nh
  await setStaffing('H15.07.07', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.07', 'PHO_PHONG', 2);
  await setStaffing('H15.07.07', 'SPECIALIST', 4);

  // H15.07.08 - Ph├▓ng Quß║ún l├╜ Khoa hß╗ìc
  await setStaffing('H15.07.08', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.08', 'PHO_PHONG', 2);
  await setStaffing('H15.07.08', 'SPECIALIST', 4);

  // H15.07.09 - Ph├▓ng Chuyß╗ân ─æß╗òi sß╗æ
  await setStaffing('H15.07.09', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.09', 'PHO_PHONG', 2);
  await setStaffing('H15.07.09', 'SPECIALIST', 4);

  // H15.07.10 - Ph├▓ng Quß║ún l├╜ C├┤ng nghß╗ç & ─Éß╗òi mß╗¢i s├íng tß║ío
  await setStaffing('H15.07.10', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.10', 'PHO_PHONG', 2);
  await setStaffing('H15.07.10', 'SPECIALIST', 4);

  // H15.07.11 - Ph├▓ng Quß║ún l├╜ TC─ÉLCL
  await setStaffing('H15.07.11', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.11', 'PHO_PHONG', 2);
  await setStaffing('H15.07.11', 'SPECIALIST', 4);

  // ========================================
  // TRUNG T├éM ─Éß╗öI Mß╗ÜI S├üNG Tß║áO (H15.07.01)
  // ========================================
  await setStaffing('H15.07.01', 'GIAM_DOC', 1);
  await setStaffing('H15.07.01', 'PHO_GIAM_DOC', 2);

  // H15.07.01.01 - Ph├▓ng H├ánh ch├¡nh - Tß╗òng hß╗úp
  await setStaffing('H15.07.01.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.01', 'VIEN_CHUC', 3);

  // H15.07.01.02 - Ph├▓ng ─É├áo tß║ío & Ph├ít triß╗ân
  await setStaffing('H15.07.01.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.02', 'VIEN_CHUC', 4);

  // ========================================
  // TRUNG T├éM Kß╗╕ THUß║¼T TC─ÉLCL (H15.07.02)
  // ========================================
  await setStaffing('H15.07.02', 'GIAM_DOC', 1);
  await setStaffing('H15.07.02', 'PHO_GIAM_DOC', 2);

  // H15.07.02.01 - Ph├▓ng H├ánh ch├¡nh - Tß╗ò chß╗⌐c
  await setStaffing('H15.07.02.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.01', 'VIEN_CHUC', 3);

  // H15.07.02.02 - Ph├▓ng ─Éo l╞░ß╗¥ng
  await setStaffing('H15.07.02.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.02', 'VIEN_CHUC', 4);

  // H15.07.02.03 - Ph├▓ng Thß╗¡ nghiß╗çm
  await setStaffing('H15.07.02.03', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.03', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.03', 'VIEN_CHUC', 4);

  // ========================================
  // TRUNG T├éM TH├öNG TIN ß╗¿NG Dß╗ñNG KH&CN (H15.07.03)
  // ========================================
  await setStaffing('H15.07.03', 'GIAM_DOC', 1);
  await setStaffing('H15.07.03', 'PHO_GIAM_DOC', 2);

  // H15.07.03.01 - Ph├▓ng H├ánh ch├¡nh - Tß╗òng hß╗úp
  await setStaffing('H15.07.03.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.01', 'VIEN_CHUC', 3);

  // H15.07.03.02 - Ph├▓ng Th├┤ng tin KH&CN
  await setStaffing('H15.07.03.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.02', 'VIEN_CHUC', 4);

  // H15.07.03.03 - Ph├▓ng ß╗¿ng dß╗Ñng KH&CN
  await setStaffing('H15.07.03.03', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.03', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.03', 'VIEN_CHUC', 4);

  // H15.07.03.04 - Ph├▓ng Dß╗ïch vß╗Ñ KH&CN
  await setStaffing('H15.07.03.04', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.04', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.04', 'VIEN_CHUC', 3);

  // H15.07.03.05 - Trß║íi Thß╗▒c nghiß╗çm KH&CN
  await setStaffing('H15.07.03.05', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.05', 'VIEN_CHUC', 5);

  // ========================================
  // TRUNG T├éM IOC - GI├üM S├üT ─É├ö THß╗è TH├öNG MINH (H15.07.04)
  // ========================================
  await setStaffing('H15.07.04', 'GIAM_DOC', 1);
  await setStaffing('H15.07.04', 'PHO_GIAM_DOC', 2);

  // H15.07.04.01 - Ph├▓ng H├ánh ch├¡nh - Tß╗òng hß╗úp
  // Thß╗▒c tß║┐: 1 TP + 1 KT + 1 VC + 1 VT + 4 NV + 2 BV = 10 ng╞░ß╗¥i
  await setStaffing('H15.07.04.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.01', 'KE_TOAN', 1);
  await setStaffing('H15.07.04.01', 'VAN_THU', 1);
  await setStaffing('H15.07.04.01', 'VIEN_CHUC', 1);
  await setStaffing('H15.07.04.01', 'NHAN_VIEN', 4);
  await setStaffing('H15.07.04.01', 'BAO_VE', 2);

  // H15.07.04.02 - Ph├▓ng Khai th├íc & Quß║ún l├╜ dß╗» liß╗çu
  // Thß╗▒c tß║┐: 1 TP + 3 VC + 3 NV = 7 ng╞░ß╗¥i
  await setStaffing('H15.07.04.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.02', 'VIEN_CHUC', 3);
  await setStaffing('H15.07.04.02', 'NHAN_VIEN', 3);

  // H15.07.04.03 - Ph├▓ng Hß║í tß║ºng - ─É├┤ thß╗ï th├┤ng minh
  // Thß╗▒c tß║┐: 1 TP + 2 VC + 3 NV = 6 ng╞░ß╗¥i
  await setStaffing('H15.07.04.03', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.03', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.03', 'VIEN_CHUC', 2);
  await setStaffing('H15.07.04.03', 'NHAN_VIEN', 3);


  // ==========================================================
  // 10. CATEGORIES (Danh mß╗Ñc d├╣ng chung)
  // ==========================================================
  console.log('≡ƒö╣ Seeding Categories...');

  await prisma.categoryGroup.upsert({
    where: { code: 'PLAN_FRAMEWORK' },
    update: { name: 'M├┤ h├¼nh Quß║ún trß╗ï / Kß║┐ hoß║ích' },
    create: { code: 'PLAN_FRAMEWORK', name: 'M├┤ h├¼nh Quß║ún trß╗ï / Kß║┐ hoß║ích' },
  });

  const planFrameworks = [
    { code: 'OKRs', name: 'Objective & Key Results (OKRs)', order: 1 },
    { code: 'BSC', name: 'Balanced Scorecard (BSC)', order: 2 },
    { code: 'KPI', name: 'KPI Management', order: 3 },
    { code: 'MBO', name: 'Management by Objectives (MBO)', order: 4 },
    { code: 'SMART', name: 'SMART Goals', order: 5 },
    { code: 'AGILE', name: 'Agile Management', order: 6 },
    { code: 'LEAN', name: 'Lean Management', order: 7 },
    { code: 'DATA_DRIVEN', name: 'Data-Driven Management', order: 8 },
    { code: 'GOVERNANCE', name: 'Governance Model', order: 9 },
    { code: 'RACI', name: 'RACI Matrix', order: 10 },
  ];

  for (const fw of planFrameworks) {
    const cat = await prisma.category.upsert({
      where: { group_code: { group: 'PLAN_FRAMEWORK', code: fw.code } },
      update: { order: fw.order },
      create: { group: 'PLAN_FRAMEWORK', code: fw.code, order: fw.order },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { name: fw.name },
      create: { categoryId: cat.id, langCode: 'vi', name: fw.name },
    });
  }



  console.log('Γ£à Categories seeded successfully!');


  // 4. Lß║Ñy tß║Ñt cß║ú c├íc x├ú/ph╞░ß╗¥ng (GEO_AREA) v├á to├án tß╗ënh ─Éß║»k Lß║»k (PROVINCE 47)
  const allGeoAreas = await prisma.category.findMany({
    where: {
      OR: [
        { group: 'GEO_AREA' },
        { code: '47', group: 'PROVINCE' }
      ]
    },
  });

  // 5. Lß║Ñy c├íc l─⌐nh vß╗▒c KHCN, TT&TT, C─ÉS v├á NG├éN S├üCH
  const allDomainCodes = [
    'H15.07', 'CHUYEN_DOI_SO', 'DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'VIEN_THONG', 'KINH_TE_SO',
    'THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'BUU_CHINH', 'HA_TANG_SO',
    'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI', 'NGAN_SACH'
  ];

  const techDomains = await prisma.category.findMany({
    where: {
      group: 'DOMAIN',
      code: {
        in: allDomainCodes
      }
    }
  });

  const soKhcnUnits = await prisma.organizationUnit.findMany({
    where: {
      OR: [
        { code: 'H15.07' },
        { code: { startsWith: 'H15.07.' } }
      ]
    }
  });

  if (soKhcnUnits.length > 0) {
    const geoData: { unitId: number, geographicAreaId: number }[] = [];
    const domainData: { unitId: number, domainId: number }[] = [];

    const domainMapping: Record<string, string[]> = {
      // Sß╗ƒ KHCN ΓÇö to├án bß╗Ö l─⌐nh vß╗▒c
      'H15.07': allDomainCodes,

      // V─ân ph├▓ng Sß╗ƒ ΓÇö h├ánh ch├¡nh tß╗òng hß╗úp to├án Sß╗ƒ
      'H15.07.05': ['H15.07'],

      // Ph├▓ng Kß║┐ hoß║ích - T├ái ch├¡nh
      'H15.07.07': ['NGAN_SACH', 'H15.07'],

      // Ph├▓ng Quß║ún l├╜ Khoa hß╗ìc
      'H15.07.08': ['H15.07'],

      // Ph├▓ng Chuyß╗ân ─æß╗òi sß╗æ
      'H15.07.09': ['CHUYEN_DOI_SO', 'DU_LIEU_SO', 'KINH_TE_SO', 'AN_TOAN_THONG_TIN', 'HA_TANG_SO'],

      // Ph├▓ng Quß║ún l├╜ C├┤ng nghß╗ç & ─Éß╗òi mß╗¢i s├íng tß║ío
      'H15.07.10': ['H15.07'],

      // Ph├▓ng Quß║ún l├╜ TC─ÉLCL
      'H15.07.11': ['H15.07'],

      // TT Th├┤ng tin ß╗¿ng dß╗Ñng KH&CN (H15.07.03)
      'H15.07.03': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.03.01': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN'],
      'H15.07.03.02': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU'],
      'H15.07.03.03': ['THONG_TIN_DIEN_TU', 'BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO'],
      'H15.07.03.04': ['BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.03.05': ['H15.07'],

      // TT Kß╗╣ thuß║¡t TC─ÉLCL (H15.07.02)
      'H15.07.02': ['H15.07'],
      'H15.07.02.01': ['H15.07'],
      'H15.07.02.02': ['H15.07'],
      'H15.07.02.03': ['H15.07'],

      // TT IOC ΓÇö Gi├ím s├ít ─É├┤ thß╗ï Th├┤ng minh (H15.07.04)
      'H15.07.04': ['DU_LIEU_SO', 'HA_TANG_SO', 'THONG_TIN_TRUYEN_THONG', 'CHUYEN_DOI_SO', 'AN_TOAN_THONG_TIN'],
      'H15.07.04.01': ['DU_LIEU_SO', 'CHUYEN_DOI_SO'],                                        // HC-TH IOC
      'H15.07.04.02': ['DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'CHUYEN_DOI_SO'],                   // Khai th├íc dß╗» liß╗çu
      'H15.07.04.03': ['HA_TANG_SO', 'AN_TOAN_THONG_TIN', 'THONG_TIN_TRUYEN_THONG'],          // Hß║í tß║ºng ─ÉT th├┤ng minh

      // TT ─ÉMST (H15.07.01)
      'H15.07.01': ['H15.07'],
      'H15.07.01.01': ['H15.07'],
      'H15.07.01.02': ['H15.07'],
    };


    for (const unit of soKhcnUnits) {
      for (const geo of allGeoAreas) {
        geoData.push({ unitId: unit.id, geographicAreaId: geo.id });
      }

      const assignedCodes = domainMapping[unit.code] || ['H15.07'];
      const unitDomains = techDomains.filter(d => assignedCodes.includes(d.code));

      for (const domain of unitDomains) {
        domainData.push({ unitId: unit.id, domainId: domain.id });
      }
    }

    await prisma.unitGeographicArea.createMany({
      data: geoData,
      skipDuplicates: true,
    });

    await prisma.unitDomain.createMany({
      data: domainData,
      skipDuplicates: true,
    });

    console.log(`Γ£à ─É├ú cß║¡p nhß║¡t ${allGeoAreas.length} ─Éß╗ïa b├án (c├íc x├ú, to├án tß╗ënh) cho ${soKhcnUnits.length} ─æ╞ín vß╗ï KH&CN (Tß╗òng: ${geoData.length} bß║ún ghi)`);
    console.log(`Γ£à ─É├ú ph├ón bß╗ò L─⌐nh vß╗▒c chuy├¬n m├┤n theo chß╗⌐c n─âng cho c├íc ─æ╞ín vß╗ï KH&CN (Tß╗òng: ${domainData.length} bß║ún ghi)`);

    // ----------------------------------------------------
    // SEED STAFFING SLOTS (─Éß╗ïnh bi├¬n chi tiß║┐t cho tß╗½ng Slot)
    // ----------------------------------------------------
    const allStaffing = await prisma.organizationStaffing.findMany({
      where: { unitId: { in: soKhcnUnits.map(u => u.id) } },
      include: { jobTitle: true, unit: true }
    });

    const slotGeos: { slotId: number, geographicAreaId: number }[] = [];
    const slotDomains: { slotId: number, domainId: number }[] = [];
    const slotMonitored: { slotId: number, unitId: number }[] = [];

    const phongKHTC = soKhcnUnits.find(u => u.code === 'H15.07.07');
    const phongCDS = soKhcnUnits.find(u => u.code === 'H15.07.09');
    const trungtamIOC = soKhcnUnits.find(u => u.code === 'H15.07.04');
    const phongQLCN = soKhcnUnits.find(u => u.code === 'H15.07.10');
    const domainNS = techDomains.find(d => d.code === 'NGAN_SACH');
    const domainCDS = techDomains.find(d => d.code === 'CHUYEN_DOI_SO');

    const daklakGeo = allGeoAreas.find(g => g.code === '47');

    for (const staffing of allStaffing) {
      for (let i = 1; i <= staffing.quantity; i++) {
        // Tß║ío Slot
        const slot = await prisma.staffingSlot.upsert({
          where: { staffingId_slotOrder: { staffingId: staffing.id, slotOrder: i } },
          update: {},
          create: { staffingId: staffing.id, slotOrder: i },
        });

        // 1. ─Éß╗ïa b├án: G├ín mß║╖c ─æß╗ïnh Tß╗ënh ─Éß║»k Lß║»k (m├ú 47) hoß║╖c tß║Ñt cß║ú x├ú ph╞░ß╗¥ng tuß╗│ chß╗ìn, ß╗ƒ ─æ├óy g├ín ─Éß║»k Lß║»k
        if (daklakGeo) {
          slotGeos.push({ slotId: slot.id, geographicAreaId: daklakGeo.id });
        }

        // 2. L─⌐nh vß╗▒c v├á Ph├▓ng ban theo d├╡i
        if (staffing.unit.code === 'H15.07') { // L├únh ─æß║ío cß║Ñp Sß╗ƒ
          if (staffing.jobTitle.code === 'GIAM_DOC' && i === 1) {
            if (domainNS) slotDomains.push({ slotId: slot.id, domainId: domainNS.id });
            if (phongKHTC) slotMonitored.push({ slotId: slot.id, unitId: phongKHTC.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1) { // PGD 1 phß╗Ñ tr├ích C─ÉS
              if (domainCDS) slotDomains.push({ slotId: slot.id, domainId: domainCDS.id });
              if (phongCDS) slotMonitored.push({ slotId: slot.id, unitId: phongCDS.id });
              if (trungtamIOC) slotMonitored.push({ slotId: slot.id, unitId: trungtamIOC.id });
            }
            if (i === 2) { // PGD 2 phß╗Ñ tr├ích QLCN
              if (phongQLCN) slotMonitored.push({ slotId: slot.id, unitId: phongQLCN.id });
            }
          }
        } else {
          // Tr╞░ß╗ƒng ph├▓ng / Ph├│ tr╞░ß╗ƒng ph├▓ng: Kß║┐ thß╗½a l─⌐nh vß╗▒c cß╗ºa ─æ╞ín vß╗ï cha
          const assignedCodes = domainMapping[staffing.unit.code] || ['H15.07'];
          const unitDomains = techDomains.filter(d => assignedCodes.includes(d.code));
          for (const d of unitDomains) {
            slotDomains.push({ slotId: slot.id, domainId: d.id });
          }
        }
      }
    }

    await prisma.staffingSlotGeographicArea.createMany({ data: slotGeos, skipDuplicates: true });
    await prisma.staffingSlotDomain.createMany({ data: slotDomains, skipDuplicates: true });
    await prisma.staffingSlotMonitoredUnit.createMany({ data: slotMonitored, skipDuplicates: true });

    console.log(`Γ£à ─É├ú ph├ón bß╗ò chi tiß║┐t ─Éß╗ïnh bi├¬n (StaffingSlots) cho to├án Sß╗ƒ v├á c├íc ─æ╞ín vß╗ï trß╗▒c thuß╗Öc (Slot domains: ${slotDomains.length}, Geos: ${slotGeos.length}, Monitored Units: ${slotMonitored.length})`);
  }

  // ==========================================================
  // PBAC SEED: SCOPES, POLICIES, ROLES & MAPPINGS
  // ==========================================================
  console.log('≡ƒö╣ Seeding PBAC Scopes & Policies into SystemConfig...');
  const pbacScopes = ['SELF', 'DEPARTMENT', 'ORGANIZATION', 'GLOBAL'];
  const pbacPolicies = {
    'TASK.VIEW': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.assignees OR currentUserId IN resource.supervisors OR currentUserId IN resource.collaborators",
    'TASK.UPDATE': "ALLOW IF currentUserId IN resource.assignees AND resource.status NOT IN ('COMPLETED','CLOSED')",
    'TASK.CLOSE': "ALLOW IF resource.ownerId == currentUserId",
    'DOCUMENT.UPDATE': "ALLOW IF resource.createdBy == currentUserId AND resource.status == 'DRAFT'",
    'DOCUMENT.APPROVE': "ALLOW IF user.positionLevel >= 3",
    'DOCUMENT.VIEW': "ALLOW IF resource.departmentId == currentDepartmentId OR resource.visibility == 'PUBLIC'"
  };

  await prisma.systemConfig.upsert({
    where: { key: 'PBAC_SCOPES' },
    update: { value: JSON.stringify(pbacScopes) },
    create: { key: 'PBAC_SCOPES', value: JSON.stringify(pbacScopes), description: 'PBAC Scopes' }
  });

  await prisma.systemConfig.upsert({
    where: { key: 'PBAC_POLICIES' },
    update: { value: JSON.stringify(pbacPolicies) },
    create: { key: 'PBAC_POLICIES', value: JSON.stringify(pbacPolicies), description: 'PBAC Policies' }
  });

  // ==========================================================
  // Mß╗₧ Rß╗ÿNG POLICY PBAC CHO Hß╗å THß╗ÉNG LI├èN TH├öNG & HRM
  // ==========================================================
  console.log('≡ƒö╣ Mß╗ƒ rß╗Öng Policy PBAC cho hß╗ç thß╗æng li├¬n th├┤ng & HRM...');

  const extendedPbacPolicies = {
    ...pbacPolicies,
    // Document Incoming
    'DOC_INCOMING.PROCESS': "ALLOW IF currentUserId IN resource.processingUsers OR currentDepartmentId == resource.processingDepartmentId",
    'DOC_INCOMING.VIEW': "ALLOW IF resource.departmentId == currentDepartmentId",
    'DOC_OUTGOING.ISSUE': "ALLOW IF user.positionLevel >= 2",

    // Plan
    'PLAN.VIEW': "ALLOW IF targetUser.unitCode STARTSWITH user.unitCode OR resource.visibility == 'PUBLIC'",
    'PLAN.UPDATE': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.collaborators",
    'PLAN.APPROVE': "ALLOW IF user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode",
    'PLAN.CLOSE': "ALLOW IF resource.ownerId == currentUserId",

    // Task
    'TASK.ASSIGN': "ALLOW IF user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode OR resource.ownerId == currentUserId",
    'TASK.VIEW': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.assigneeIds OR (user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode)",
    'TASK.UPDATE': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.assigneeIds",
    'TASK.COMPLETE': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.assigneeIds",
    'TASK.EVALUATE': "ALLOW IF resource.ownerId == currentUserId OR (user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode)",

    // Objective
    'OBJECTIVE.VIEW': "ALLOW IF targetUser.unitCode STARTSWITH user.unitCode",
    'OBJECTIVE.UPDATE': "ALLOW IF resource.ownerId == currentUserId",
    'OBJECTIVE.APPROVE': "ALLOW IF user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode",

    // KPI
    'KPI.VIEW': "ALLOW IF resource.ownerId == currentUserId OR resource.managerId == currentUserId OR (user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode)",
    'KPI.UPDATE': "ALLOW IF resource.ownerId == currentUserId",
    'KPI.EVALUATE': "ALLOW IF currentUserId == resource.managerId OR (user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode)",

    // HRM
    'HRM_EMPLOYEE.VIEW': "ALLOW IF resource.id == currentUserId OR targetUser.unitCode STARTSWITH user.unitCode OR user.role == 'ADMIN'",
    'HRM_EMPLOYEE.UPDATE': "ALLOW IF resource.id == currentUserId OR user.role == 'ADMIN'",

    // Report
    'REPORT.VIEW': "ALLOW IF targetUser.unitCode STARTSWITH user.unitCode OR user.isOrganizationLeader == true",
    'REPORT.EXPORT': "ALLOW IF user.isOrganizationLeader == true"
  };

  await prisma.systemConfig.upsert({
    where: { key: 'PBAC_POLICIES_EXTENDED' },
    update: { value: JSON.stringify(extendedPbacPolicies) },
    create: { key: 'PBAC_POLICIES_EXTENDED', value: JSON.stringify(extendedPbacPolicies), description: 'Extended PBAC Policies' }
  });


  console.log('≡ƒö╣ Seeding PBAC Roles & Policies...');
  await prisma.policy.deleteMany({}); // Clear existing policies to avoid duplicates on re-run

  const getPolicies = async (specs: string[]) => {
    const allResources = await prisma.resource.findMany();
    const result: { id: number }[] = [];

    for (const spec of specs) {
      if (spec === 'ALL') {
        for (const res of allResources) {
          const pol = await prisma.policy.create({
            data: { resourceId: res.id, action: '*', effect: 'ALLOW', conditions: { expression: 'ALLOW ALWAYS' } }
          });
          result.push({ id: pol.id });
        }
        return result;
      }

      if (spec.endsWith('.*')) {
        const resCode = spec.split('.')[0];
        const res = allResources.find(r => r.code === resCode);
        if (res) {
          const pol = await prisma.policy.create({
            data: { resourceId: res.id, action: '*', effect: 'ALLOW', conditions: { expression: 'ALLOW ALWAYS' } }
          });
          result.push({ id: pol.id });
        }
      } else {
        const [resCode, actCode] = spec.split('.');
        const res = allResources.find(r => r.code === resCode);
        if (res) {
          const conditionString = (extendedPbacPolicies as any)[spec] || (pbacPolicies as any)[spec];
          const pol = await prisma.policy.create({
            data: {
              resourceId: res.id,
              action: actCode,
              effect: 'ALLOW',
              conditions: conditionString ? { expression: conditionString } : null
            }
          });
          result.push({ id: pol.id });
        }
      }
    }
    return result;
  };

  const roleDefinitions = [
    { code: 'SUPER_ADMIN', name: 'Quß║ún trß╗ï vi├¬n cß║Ñp cao', scope: 'GLOBAL', perms: ['ALL'] },
    { code: 'ADMIN', name: 'Quß║ún trß╗ï hß╗ç thß╗æng', scope: 'GLOBAL', perms: ['ALL'] },
    {
      code: 'LEADER',
      name: 'L├únh ─æß║ío ─æ╞ín vß╗ï',
      scope: 'ORGANIZATION',
      perms: [
        'HRM_EMPLOYEE.*',
        'ORGANIZATION.*',
        'USER.*',
        'DOCUMENT.*',
        'DOC_INCOMING.*',
        'DOC_OUTGOING.*',
        'DOC_PROCESSING.*',
        'DOC_PUBLISH.*',
        'DOC_TRANSPARENCY.*',
        'DOC_CONSULTATION.*',
        'DOC_MINUTES.*',
        'DOC_CATEGORIES.*',
        'PLAN.*',
        'OBJECTIVE.*',
        'TASK.*',
        'KPI.*',
        'REPORT.*',
        'WORKFLOW.*'
      ]
    },
    {
      code: 'MANAGER',
      name: 'Quß║ún l├╜',
      scope: 'DEPARTMENT',
      perms: [
        'HRM_EMPLOYEE.VIEW',
        'HRM_EMPLOYEE.READ',
        'HRM_EMPLOYEE.MANAGE',
        'ORGANIZATION.VIEW',
        'ORGANIZATION.READ',
        'USER.VIEW',
        'USER.READ',
        'DOCUMENT.VIEW',
        'DOCUMENT.READ',
        'DOCUMENT.PROCESS',
        'DOCUMENT.ASSIGN',
        'DOC_INCOMING.VIEW',
        'DOC_INCOMING.READ',
        'DOC_INCOMING.PROCESS',
        'DOC_INCOMING.ASSIGN',
        'DOC_OUTGOING.VIEW',
        'DOC_OUTGOING.READ',
        'DOC_OUTGOING.PROCESS',
        'DOC_PROCESSING.VIEW',
        'DOC_PROCESSING.READ',
        'DOC_PROCESSING.PROCESS',
        'DOC_PUBLISH.VIEW',
        'DOC_PUBLISH.READ',
        'DOC_PUBLISH.PROCESS',
        'DOC_TRANSPARENCY.VIEW',
        'DOC_TRANSPARENCY.READ',
        'DOC_CONSULTATION.VIEW',
        'DOC_CONSULTATION.READ',
        'DOC_MINUTES.VIEW',
        'DOC_MINUTES.READ',
        'DOC_CATEGORIES.VIEW',
        'DOC_CATEGORIES.READ',
        'PLAN.VIEW',
        'PLAN.READ',
        'PLAN.UPDATE',
        'OBJECTIVE.VIEW',
        'OBJECTIVE.READ',
        'OBJECTIVE.UPDATE',
        'TASK.VIEW',
        'TASK.READ',
        'TASK.CREATE',
        'TASK.UPDATE',
        'TASK.ASSIGN',
        'TASK.COMPLETE',
        'KPI.VIEW',
        'KPI.READ',
        'REPORT.VIEW',
        'REPORT.READ',
        'WORKFLOW.VIEW',
        'WORKFLOW.READ'
      ]
    },
    {
      code: 'STAFF',
      name: 'Nh├ón vi├¬n',
      scope: 'SELF',
      perms: [
        'HRM_EMPLOYEE.VIEW',
        'HRM_EMPLOYEE.READ',
        'DOCUMENT.VIEW',
        'DOCUMENT.READ',
        'DOCUMENT.PROCESS',
        'DOC_INCOMING.VIEW',
        'DOC_INCOMING.READ',
        'DOC_INCOMING.PROCESS',
        'DOC_OUTGOING.VIEW',
        'DOC_OUTGOING.READ',
        'DOC_OUTGOING.PROCESS',
        'DOC_PROCESSING.VIEW',
        'DOC_PROCESSING.READ',
        'DOC_PROCESSING.PROCESS',
        'DOC_PUBLISH.VIEW',
        'DOC_PUBLISH.READ',
        'DOC_PUBLISH.PROCESS',
        'DOC_TRANSPARENCY.VIEW',
        'DOC_TRANSPARENCY.READ',
        'DOC_CONSULTATION.VIEW',
        'DOC_CONSULTATION.READ',
        'DOC_MINUTES.VIEW',
        'DOC_MINUTES.READ',
        'DOC_CATEGORIES.VIEW',
        'DOC_CATEGORIES.READ',
        'PLAN.VIEW',
        'PLAN.READ',
        'OBJECTIVE.VIEW',
        'OBJECTIVE.READ',
        'TASK.VIEW',
        'TASK.READ',
        'TASK.UPDATE',
        'TASK.COMMENT',
        'TASK.COMPLETE',
        'KPI.VIEW',
        'KPI.READ',
        'WORKFLOW.VIEW',
        'WORKFLOW.READ'
      ]
    },
    {
      code: 'SUPERVISOR',
      name: 'Gi├ím s├ít',
      scope: 'DEPARTMENT',
      perms: [
        'HRM_EMPLOYEE.VIEW',
        'HRM_EMPLOYEE.READ',
        'DOCUMENT.VIEW',
        'DOCUMENT.READ',
        'DOC_INCOMING.VIEW',
        'DOC_INCOMING.READ',
        'DOC_OUTGOING.VIEW',
        'DOC_OUTGOING.READ',
        'DOC_PROCESSING.VIEW',
        'DOC_PROCESSING.READ',
        'DOC_PUBLISH.VIEW',
        'DOC_PUBLISH.READ',
        'DOC_TRANSPARENCY.VIEW',
        'DOC_TRANSPARENCY.READ',
        'DOC_CONSULTATION.VIEW',
        'DOC_CONSULTATION.READ',
        'DOC_MINUTES.VIEW',
        'DOC_MINUTES.READ',
        'DOC_CATEGORIES.VIEW',
        'DOC_CATEGORIES.READ',
        'PLAN.VIEW',
        'PLAN.READ',
        'OBJECTIVE.VIEW',
        'OBJECTIVE.READ',
        'TASK.VIEW',
        'TASK.READ',
        'KPI.VIEW',
        'KPI.READ',
        'REPORT.VIEW',
        'REPORT.READ',
        'WORKFLOW.VIEW',
        'WORKFLOW.READ'
      ]
    }
  ];

  for (const rd of roleDefinitions) {
    const policyConnect = await getPolicies(rd.perms);
    await prisma.systemConfig.upsert({
      where: { key: `ROLE_SCOPE_${rd.code}` },
      update: { value: rd.scope },
      create: { key: `ROLE_SCOPE_${rd.code}`, value: rd.scope, description: `Scope for ${rd.code}` }
    });

    await prisma.role.upsert({
      where: { code: rd.code },
      update: {
        name: rd.name,
        policies: { set: [], connect: policyConnect }
      },
      create: {
        code: rd.code,
        name: rd.name,
        policies: { connect: policyConnect }
      }
    });
  }
  console.log('Γ£à Ho├án tß║Ñt Seed PBAC Engine.');

  // ==========================================================
  // UNIT_TYPE_CATEGORY ΓÇö Cß║¡p nhß║¡t description vß╗¢i metadata ─æß║ºy ─æß╗º
  // Categories ─æ├ú tß║ío qua loop chuß║⌐n ß╗ƒ tr├¬n (group_code unique).
  // description l╞░u trong CategoryTranslation.description (JSON).
  // Frontend parse v├á render, kh├┤ng hardcode logic nghiß╗çp vß╗Ñ.
  // ==========================================================
  const unitTypeMeta: Record<string, { descVi: string; descEn: string }> = {
    CHINH_QUYEN: {
      descVi: JSON.stringify({
        icon: 'Landmark', color: 'blue',
        description: 'Sß╗ƒ, Ban, UBND c├íc cß║Ñp, Chi cß╗Ñc trß╗▒c thuß╗Öc',
        signingNote: 'K├╜ ban h├ánh v─ân bß║ún quß║ún l├╜ nh├á n╞░ß╗¢c (Q─É, CV, TB) theo thß║⌐m quyß╗ün ─æ╞░ß╗úc ph├ón cß║Ñp.',
        purposeNote: 'Thß╗▒c hiß╗çn chß╗⌐c n─âng quß║ún l├╜ h├ánh ch├¡nh nh├á n╞░ß╗¢c trong l─⌐nh vß╗▒c ─æ╞░ß╗úc giao.',
        signingAuthority: 'FULL', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds', 'geographicAreaIds'],
        leaderTitleKeywords: ['Gi├ím ─æß╗æc', 'Ph├│ Gi├ím ─æß╗æc', 'Chß╗º tß╗ïch UBND', 'Ph├│ Chß╗º tß╗ïch UBND'],
        staffTitleKeywords: ['Chuy├¬n vi├¬n cao cß║Ñp', 'Chuy├¬n vi├¬n ch├¡nh', 'Chuy├¬n vi├¬n', 'Nh├ón vi├¬n'],
      }),
      descEn: JSON.stringify({
        icon: 'Landmark', color: 'blue',
        description: 'Departments, Offices, People\'s Committees, Sub-departments',
        signingNote: 'Issue state management documents (Decisions, Dispatches, Notices) within delegated authority.',
        purposeNote: 'Performs state administrative management functions in assigned fields.',
        signingAuthority: 'FULL', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds', 'geographicAreaIds'],
        leaderTitleKeywords: ['Director', 'Deputy Director', 'Chairman', 'Vice Chairman'],
        staffTitleKeywords: ['Senior Expert', 'Principal Expert', 'Expert', 'Staff'],
      }),
    },
    DANG: {
      descVi: JSON.stringify({
        icon: 'Flag', color: 'red',
        description: 'Tß╗ënh ß╗ºy, Huyß╗çn ß╗ºy, ─Éß║úng bß╗Ö, Chi bß╗Ö, Ban ─Éß║úng',
        signingNote: 'K├╜ ban h├ánh nghß╗ï quyß║┐t, chß╗ë thß╗ï, th├┤ng b├ío kß║┐t luß║¡n cß╗ºa ─Éß║úng.',
        purposeNote: 'L├únh ─æß║ío ch├¡nh trß╗ï theo hß╗ç thß╗æng ─Éß║úng, song song vß╗¢i hß╗ç thß╗æng h├ánh ch├¡nh.',
        signingAuthority: 'FULL', politicalSystem: 'DANG',
        requiredFields: [],
        leaderTitleKeywords: ['B├¡ th╞░', 'Ph├│ B├¡ th╞░', 'ß╗ªy vi├¬n Ban Th╞░ß╗¥ng vß╗Ñ', 'Tß╗ënh ß╗ºy vi├¬n'],
        staffTitleKeywords: ['Chuy├¬n vi├¬n ─æß║úng', 'Nh├ón vi├¬n v─ân ph├▓ng ─Éß║úng ß╗ºy'],
      }),
      descEn: JSON.stringify({
        icon: 'Flag', color: 'red',
        description: 'Provincial/District Party Committees, Party Cells',
        signingNote: 'Issue Party resolutions, directives, and conclusion notices.',
        purposeNote: 'Political leadership through the Party system, parallel to administrative governance.',
        signingAuthority: 'FULL', politicalSystem: 'DANG',
        requiredFields: [],
        leaderTitleKeywords: ['Secretary', 'Deputy Secretary', 'Standing Committee Member'],
        staffTitleKeywords: ['Party Expert', 'Party Office Staff'],
      }),
    },
    THAM_MUU: {
      descVi: JSON.stringify({
        icon: 'ClipboardList', color: 'violet',
        description: 'V─ân ph├▓ng, Thanh tra, Ph├▓ng Tß╗ò chß╗⌐c c├ín bß╗Ö, Kß║┐ hoß║íchΓÇôT├ái ch├¡nh',
        signingNote: 'K├╜ thß╗½a lß╗çnh hoß║╖c theo ß╗ºy quyß╗ün. Kh├┤ng ban h├ánh v─ân bß║ún quy phß║ím ph├íp luß║¡t ─æß╗Öc lß║¡p.',
        purposeNote: 'Tham m╞░u tß╗òng hß╗úp, ─æiß╗üu phß╗æi nß╗Öi bß╗Ö, h├ánh ch├¡nh quß║ún trß╗ï cho l├únh ─æß║ío c╞í quan.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Ch├ính V─ân ph├▓ng', 'Ph├│ Ch├ính V─ân ph├▓ng', 'Ch├ính Thanh tra', 'Tr╞░ß╗ƒng ph├▓ng', 'Ph├│ Tr╞░ß╗ƒng ph├▓ng'],
        staffTitleKeywords: ['Chuy├¬n vi├¬n', 'Kß║┐ to├ín vi├¬n', 'Nh├ón vi├¬n'],
      }),
      descEn: JSON.stringify({
        icon: 'ClipboardList', color: 'violet',
        description: 'Office, Inspectorate, Personnel Dept, Finance & Planning',
        signingNote: 'Sign on behalf of or by delegation. Cannot independently issue regulatory documents.',
        purposeNote: 'Comprehensive advisory, internal coordination, and administrative management.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Chief of Office', 'Deputy Chief', 'Chief Inspector', 'Head of Department'],
        staffTitleKeywords: ['Expert', 'Accountant', 'Staff'],
      }),
    },
    CHUYEN_MON: {
      descVi: JSON.stringify({
        icon: 'BookOpen', color: 'emerald',
        description: 'Ph├▓ng nghiß╗çp vß╗Ñ, Chi cß╗Ñc trß╗▒c thuß╗Öc Sß╗ƒ',
        signingNote: 'Tham m╞░u v├á thß╗▒c thi chuy├¬n ng├ánh. Chi cß╗Ñc c├│ thß╗â k├╜ mß╗Öt sß╗æ v─ân bß║ún theo ph├ón cß║Ñp.',
        purposeNote: 'Quß║ún l├╜ chuy├¬n m├┤n theo ng├ánh dß╗ìc; thanh tra, kiß╗âm tra, h╞░ß╗¢ng dß║½n nghiß╗çp vß╗Ñ.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds', 'geographicAreaIds'],
        leaderTitleKeywords: ['Tr╞░ß╗ƒng ph├▓ng', 'Ph├│ Tr╞░ß╗ƒng ph├▓ng', 'Chi cß╗Ñc tr╞░ß╗ƒng', 'Ph├│ Chi cß╗Ñc tr╞░ß╗ƒng'],
        staffTitleKeywords: ['Chuy├¬n vi├¬n', 'Chuy├¬n vi├¬n ch├¡nh', 'Chuy├¬n vi├¬n cao cß║Ñp', 'Kiß╗âm so├ít vi├¬n'],
      }),
      descEn: JSON.stringify({
        icon: 'BookOpen', color: 'emerald',
        description: 'Specialized divisions, Sub-departments under Departments',
        signingNote: 'Advisory and implementation in specialized fields. Sub-departments may sign certain documents.',
        purposeNote: 'Vertical sector management; inspection, guidance on professional matters.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds', 'geographicAreaIds'],
        leaderTitleKeywords: ['Head of Division', 'Deputy Head', 'Sub-department Director'],
        staffTitleKeywords: ['Expert', 'Principal Expert', 'Senior Expert', 'Inspector'],
      }),
    },
    SU_NGHIEP: {
      descVi: JSON.stringify({
        icon: 'GraduationCap', color: 'amber',
        description: 'Trung t├óm, Tr╞░ß╗¥ng, Bß╗çnh viß╗çn, Ban quß║ún l├╜ dß╗▒ ├ín',
        signingNote: 'K├╜ hß╗úp ─æß╗ông dß╗ïch vß╗Ñ, v─ân bß║ún nß╗Öi bß╗Ö. V╞░ß╗út thß║⌐m quyß╗ün phß║úi tr├¼nh c╞í quan chß╗º quß║ún.',
        purposeNote: 'Cung cß║Ñp dß╗ïch vß╗Ñ c├┤ng theo c╞í chß║┐ tß╗▒ chß╗º. Hoß║ít ─æß╗Öng theo Luß║¡t Vi├¬n chß╗⌐c.',
        signingAuthority: 'FULL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds', 'scope'],
        leaderTitleKeywords: ['Gi├ím ─æß╗æc', 'Ph├│ Gi├ím ─æß╗æc', 'Hiß╗çu tr╞░ß╗ƒng', 'Ph├│ Hiß╗çu tr╞░ß╗ƒng', 'Tr╞░ß╗ƒng ban'],
        staffTitleKeywords: ['Vi├¬n chß╗⌐c', 'Gi├ío vi├¬n', 'B├íc s─⌐', '─Éiß╗üu d╞░ß╗íng', 'Kß╗╣ s╞░', 'Giß║úng vi├¬n'],
      }),
      descEn: JSON.stringify({
        icon: 'GraduationCap', color: 'amber',
        description: 'Centers, Schools, Hospitals, Project Management Boards',
        signingNote: 'Sign service contracts, internal documents. Exceed authority must report to supervising agency.',
        purposeNote: 'Provide public services under autonomous mechanism. Operate under Civil Servant Law.',
        signingAuthority: 'FULL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds', 'scope'],
        leaderTitleKeywords: ['Director', 'Deputy Director', 'Principal', 'Vice Principal'],
        staffTitleKeywords: ['Official', 'Teacher', 'Doctor', 'Nurse', 'Engineer', 'Lecturer'],
      }),
    },
    PHONG_THUOC_SN: {
      descVi: JSON.stringify({
        icon: 'Users', color: 'slate',
        description: 'Ph├▓ng HCΓÇôTH, Tß╗ò chuy├¬n m├┤n nß╗Öi bß╗Ö TT/Tr╞░ß╗¥ng/BV',
        signingNote: 'Kh├┤ng k├╜ v─ân bß║ún ─æß╗æi ngoß║íi. Mß╗ìi trao ─æß╗òi ra ngo├ái qua Gi├ím ─æß╗æc/Hiß╗çu tr╞░ß╗ƒng ─æ╞ín vß╗ï.',
        purposeNote: 'Thß╗▒c hiß╗çn chß╗⌐c n─âng chuy├¬n m├┤n nß╗Öi bß╗Ö trong ─æ╞ín vß╗ï sß╗▒ nghiß╗çp.',
        signingAuthority: 'INTERNAL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Tr╞░ß╗ƒng ph├▓ng', 'Ph├│ Tr╞░ß╗ƒng ph├▓ng', 'Tß╗ò tr╞░ß╗ƒng', 'Tß╗ò ph├│'],
        staffTitleKeywords: ['Vi├¬n chß╗⌐c', 'Nh├ón vi├¬n', 'Kß╗╣ thuß║¡t vi├¬n', 'Y t├í', 'Hß╗Ö l├╜'],
      }),
      descEn: JSON.stringify({
        icon: 'Users', color: 'slate',
        description: 'Admin Division, Internal specialist teams in Centers/Schools/Hospitals',
        signingNote: 'No external document signing. All external communications via Director/Principal.',
        purposeNote: 'Internal specialized functions within public service units.',
        signingAuthority: 'INTERNAL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Head of Department', 'Deputy Head', 'Team Leader', 'Deputy Team Leader'],
        staffTitleKeywords: ['Official', 'Staff', 'Technician', 'Nurse', 'Care Worker'],
      }),
    },
  };

  for (const [code, meta] of Object.entries(unitTypeMeta)) {
    const cat = await prisma.category.findUnique({
      where: { group_code: { group: 'UNIT_TYPE_CATEGORY', code } },
    });
    if (!cat) continue;

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { description: meta.descVi },
      create: { categoryId: cat.id, langCode: 'vi', name: '', description: meta.descVi },
    });
    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'en' } },
      update: { description: meta.descEn },
      create: { categoryId: cat.id, langCode: 'en', name: '', description: meta.descEn },
    });
  }
  console.log('Γ£à ─É├ú cß║¡p nhß║¡t metadata ─æß║ºy ─æß╗º cho UNIT_TYPE_CATEGORY (6 nh├│m ph├ón loß║íi tß╗ò chß╗⌐c).');

  // ==========================================================
  console.log('≡ƒî▒ READY FOR GRPC MICROSERVICES DEPLOYMENT!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
