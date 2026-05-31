import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@generated/prisma/client';
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
  console.log('🌱 START COMPREHENSIVE E-GOV SEED');

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ==========================================================
  // 1. RESOURCES
  // ==========================================================
  const resourcesData = [
    // System & Admin
    { code: 'SYSTEM', name: 'Hệ thống' },
    { code: 'USER', name: 'Quản lý Người dùng' },
    { code: 'ROLE', name: 'Quản lý Vai trò' },
    { code: 'RESOURCE', name: 'Quản lý Tài nguyên' },
    { code: 'MENU', name: 'Quản lý Menu' },
    { code: 'ORGANIZATION', name: 'Cây tổ chức' },
    { code: 'CATEGORY', name: 'Danh mục hệ thống' },
    { code: 'NOTIFICATION', name: 'Thông báo hệ thống' },

    // Document Management
    { code: 'DOC_INCOMING', name: 'Văn bản đến' },
    { code: 'DOC_OUTGOING', name: 'Văn bản đi' },
    { code: 'DOC_PROCESSING', name: 'Xử lý văn bản' },
    { code: 'DOC_PUBLISH', name: 'Phát hành văn bản' },
    { code: 'DOC_TRANSPARENCY', name: 'Công khai văn bản' },
    { code: 'DOC_CONSULTATION', name: 'Xin ý kiến văn bản' },
    { code: 'DOC_MINUTES', name: 'Biên bản cuộc họp' },
    { code: 'DOC_CATEGORIES', name: 'Danh mục văn bản' },

    // HRM
    { code: 'HRM_EMPLOYEE', name: 'Quản lý Nhân sự' },

    // CMS
    { code: 'POST', name: 'Quản lý Bài viết' },
    { code: 'POST_CATEGORY', name: 'Quản lý Chuyên mục' },
    { code: 'BANNER', name: 'Quản lý Banner & Quảng cáo' },
    { code: 'PORTAL_MENU', name: 'Quản lý Portal Menu' },
    { code: 'CITIZEN_INTERACTION', name: 'Tương tác công dân' },

    // Workflow
    { code: 'WORKFLOW', name: 'Quy trình nghiệp vụ' },

    // Integration
    { code: 'INTEGRATION', name: 'Liên thông hệ thống' },

    // PBAC
    { code: 'DOCUMENT', name: 'Văn bản' },
    { code: 'PLAN', name: 'Kế hoạch' },
    { code: 'OBJECTIVE', name: 'Mục tiêu' },
    { code: 'TASK', name: 'Công việc' },
    { code: 'KPI', name: 'KPI' },
    { code: 'REPORT', name: 'Báo cáo' },
  ];

  const resources: Record<string, { id: number; code: string; name: string }> =
    {};
  for (const res of resourcesData) {
    const created = await prisma.resource.upsert({
      where: { code: res.code },
      update: { name: res.name },
      create: res,
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
    'PUBLISH',
    'MANAGE',
    'ASSIGN',
    'PROCESS',
    'SIGN',
    'ISSUE',
    'ARCHIVE',
    'EXPORT',
    'CLOSE',
    'COMPLETE',
    'COMMENT',
    'EVALUATE'
  ];
  const allPermissions: { id: number }[] = [];

  for (const res of Object.values(resources)) {
    for (const action of actions) {
      // Logic constraint: SYSTEM only has VIEW/MANAGE
      if (res.code === 'SYSTEM' && !['VIEW', 'MANAGE'].includes(action))
        continue;

      const perm = await prisma.permission.upsert({
        where: { action_resourceId: { action, resourceId: res.id } },
        update: {},
        create: { action, resourceId: res.id },
      });
      allPermissions.push({ id: perm.id });
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
      nameVi: 'Hoạt động',
      nameEn: 'Active',
    },
    {
      group: 'STATUS',
      code: 'INACTIVE',
      order: 2,
      nameVi: 'Ngưng hoạt động',
      nameEn: 'Inactive',
    },
    {
      group: 'STATUS',
      code: 'PENDING',
      order: 3,
      nameVi: 'Chờ xử lý',
      nameEn: 'Pending',
    },
    {
      group: 'STATUS',
      code: 'LOCKED',
      order: 4,
      nameVi: 'Đã khóa',
      nameEn: 'Locked',
    },

    {
      group: 'ACTION_LOG',
      code: 'LOGIN',
      order: 1,
      nameVi: 'Đăng nhập',
      nameEn: 'Login',
    },
    {
      group: 'ACTION_LOG',
      code: 'LOGOUT',
      order: 2,
      nameVi: 'Đăng xuất',
      nameEn: 'Logout',
    },
    {
      group: 'ACTION_LOG',
      code: 'CREATE',
      order: 3,
      nameVi: 'Tạo mới',
      nameEn: 'Create',
    },
    {
      group: 'ACTION_LOG',
      code: 'UPDATE',
      order: 4,
      nameVi: 'Cập nhật',
      nameEn: 'Update',
    },
    {
      group: 'ACTION_LOG',
      code: 'DELETE',
      order: 5,
      nameVi: 'Xóa',
      nameEn: 'Delete',
    },

    {
      group: 'MICROSERVICE',
      code: 'USER_SERVICE',
      order: 1,
      nameVi: 'Dịch vụ Người dùng',
      nameEn: 'User Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'HRM_SERVICE',
      order: 2,
      nameVi: 'Dịch vụ Nhân sự',
      nameEn: 'HRM Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'DOCUMENT_SERVICE',
      order: 3,
      nameVi: 'Dịch vụ Văn bản',
      nameEn: 'Document Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'POST_SERVICE',
      order: 4,
      nameVi: 'Dịch vụ Nội dung',
      nameEn: 'Content Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'WORKFLOW_SERVICE',
      order: 5,
      nameVi: 'Dịch vụ Quy trình',
      nameEn: 'Workflow Service',
    },
    {
      group: 'MICROSERVICE',
      code: 'INTEGRATION_SERVICE',
      order: 6,
      nameVi: 'Dịch vụ Liên thông',
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
      nameVi: 'Dùng chung hệ thống AI Smart Router',
      nameEn: 'Use AI Smart Router',
    },

    // --- GEOGRAPHIC DATA ---
    {
      group: 'PROVINCE',
      code: '47',
      order: 1,
      nameVi: 'Tỉnh Đắk Lắk',
      nameEn: 'Dak Lak Province',
    },
    {
      group: 'PROVINCE',
      code: '01',
      order: 2,
      nameVi: 'Thành phố Hà Nội',
      nameEn: 'Hanoi City',
    },
    {
      group: 'PROVINCE',
      code: '79',
      order: 3,
      nameVi: 'Thành phố Hồ Chí Minh',
      nameEn: 'Ho Chi Minh City',
    },

    {
      group: 'GEO_AREA',
      code: '24001',
      order: 1,
      nameVi: 'Phường Buôn Ma Thuột',
      nameEn: 'Buon Ma Thuot GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24002',
      order: 2,
      nameVi: 'Phường Tân An',
      nameEn: 'Tan An GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24003',
      order: 3,
      nameVi: 'Phường Tân Lập',
      nameEn: 'Tan Lap GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24004',
      order: 4,
      nameVi: 'Phường Thành Nhất',
      nameEn: 'Thanh Nhat GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24005',
      order: 5,
      nameVi: 'Xã Hòa Phú',
      nameEn: 'Hoa Phu Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24006',
      order: 6,
      nameVi: 'Phường Ea Kao',
      nameEn: 'Ea Kao GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24007',
      order: 7,
      nameVi: 'Xã Ea Súp',
      nameEn: 'Ea Sup Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24008',
      order: 8,
      nameVi: 'Xã Ea Rốk',
      nameEn: 'Ea Rok Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24009',
      order: 9,
      nameVi: 'Xã Ea Bung',
      nameEn: 'Ea Bung Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24010',
      order: 10,
      nameVi: 'Xã Ia Rvê',
      nameEn: 'Ia Rve Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24011',
      order: 11,
      nameVi: 'Xã Ia Lốp',
      nameEn: 'Ia Lop Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24012',
      order: 12,
      nameVi: 'Xã Ea Ning',
      nameEn: 'Ea Ning Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24013',
      order: 13,
      nameVi: 'Xã Dray Bhăng',
      nameEn: 'Dray Bhang Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24014',
      order: 14,
      nameVi: 'Xã Ea Ktur',
      nameEn: 'Ea Ktur Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24015',
      order: 15,
      nameVi: 'Xã Buôn Đôn',
      nameEn: 'Buon Don Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24016',
      order: 16,
      nameVi: 'Xã Ea Wer',
      nameEn: 'Ea Wer Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24017',
      order: 17,
      nameVi: 'Xã Ea Nuôl',
      nameEn: 'Ea Nuol Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24018',
      order: 18,
      nameVi: 'Xã Quảng Phú',
      nameEn: 'Quang Phu Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24019',
      order: 19,
      nameVi: 'Xã Ea Kiết',
      nameEn: 'Ea Kiet Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24020',
      order: 20,
      nameVi: 'Xã Ea Tul',
      nameEn: 'Ea Tul Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24021',
      order: 21,
      nameVi: 'Xã Cư M’gar',
      nameEn: 'Cu Mgar Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24022',
      order: 22,
      nameVi: 'Xã Ea M’Droh',
      nameEn: 'Ea MDroh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24023',
      order: 23,
      nameVi: 'Xã Cuôr Đăng',
      nameEn: 'Cuor Dang Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24024',
      order: 24,
      nameVi: 'Xã Krông Búk',
      nameEn: 'Krong Buk Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24025',
      order: 25,
      nameVi: 'Xã Cư Pơng',
      nameEn: 'Cu Pong Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24026',
      order: 26,
      nameVi: 'Phường Buôn Hồ',
      nameEn: 'Buon Ho GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24027',
      order: 27,
      nameVi: 'Phường Cư Bao',
      nameEn: 'Cu Bao GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '24028',
      order: 28,
      nameVi: 'Xã Ea Drông',
      nameEn: 'Ea Drong Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24029',
      order: 29,
      nameVi: 'Xã Krông Năng',
      nameEn: 'Krong Nang Commune',
    },
    {
      group: 'GEO_AREA',
      code: '24030',
      order: 30,
      nameVi: 'Xã Dliê Ya',
      nameEn: 'Dlie Ya Commune',
    },

    // ===== PHÚ YÊN CŨ =====

    {
      group: 'GEO_AREA',
      code: '25001',
      order: 69,
      nameVi: 'Phường Xuân Đài',
      nameEn: 'Xuan Dai GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '25002',
      order: 70,
      nameVi: 'Phường Bình Kiến',
      nameEn: 'Binh Kien GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '25003',
      order: 71,
      nameVi: 'Phường Tuy Hòa',
      nameEn: 'Tuy Hoa GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '25004',
      order: 72,
      nameVi: 'Phường Phú Yên',
      nameEn: 'Phu Yen GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '25005',
      order: 73,
      nameVi: 'Phường Hòa Hiệp',
      nameEn: 'Hoa Hiep GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '25006',
      order: 74,
      nameVi: 'Phường Đông Hòa',
      nameEn: 'Dong Hoa GEO_AREA',
    },
    {
      group: 'GEO_AREA',
      code: '25007',
      order: 75,
      nameVi: 'Xã Sông Cầu',
      nameEn: 'Song Cau Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25008',
      order: 76,
      nameVi: 'Xã Xuân Thọ',
      nameEn: 'Xuan Tho Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25009',
      order: 77,
      nameVi: 'Xã Xuân Cảnh',
      nameEn: 'Xuan Canh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25010',
      order: 78,
      nameVi: 'Xã Xuân Lộc',
      nameEn: 'Xuan Loc Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25011',
      order: 79,
      nameVi: 'Xã Xuân Phước',
      nameEn: 'Xuan Phuoc Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25012',
      order: 80,
      nameVi: 'Xã Đồng Xuân',
      nameEn: 'Dong Xuan Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25013',
      order: 81,
      nameVi: 'Xã La Hai',
      nameEn: 'La Hai Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25014',
      order: 82,
      nameVi: 'Xã Tuy An',
      nameEn: 'Tuy An Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25015',
      order: 83,
      nameVi: 'Xã Chí Thạnh',
      nameEn: 'Chi Thanh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25016',
      order: 84,
      nameVi: 'Xã An Mỹ',
      nameEn: 'An My Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25017',
      order: 85,
      nameVi: 'Xã An Chấn',
      nameEn: 'An Chan Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25018',
      order: 86,
      nameVi: 'Xã An Ninh',
      nameEn: 'An Ninh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25019',
      order: 87,
      nameVi: 'Xã An Lĩnh',
      nameEn: 'An Linh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25020',
      order: 88,
      nameVi: 'Xã Tây Hòa',
      nameEn: 'Tay Hoa Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25021',
      order: 89,
      nameVi: 'Xã Sơn Thành',
      nameEn: 'Son Thanh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25022',
      order: 90,
      nameVi: 'Xã Hòa Mỹ',
      nameEn: 'Hoa My Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25023',
      order: 91,
      nameVi: 'Xã Hòa Thịnh',
      nameEn: 'Hoa Thinh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25024',
      order: 92,
      nameVi: 'Xã Hòa Xuân',
      nameEn: 'Hoa Xuan Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25025',
      order: 93,
      nameVi: 'Xã Hòa Vinh',
      nameEn: 'Hoa Vinh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25026',
      order: 94,
      nameVi: 'Xã Phú Hòa',
      nameEn: 'Phu Hoa Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25027',
      order: 95,
      nameVi: 'Xã Hòa Quang',
      nameEn: 'Hoa Quang Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25028',
      order: 96,
      nameVi: 'Xã Hòa Trị',
      nameEn: 'Hoa Tri Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25029',
      order: 97,
      nameVi: 'Xã Hòa Định',
      nameEn: 'Hoa Dinh Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25030',
      order: 98,
      nameVi: 'Xã Sơn Hòa',
      nameEn: 'Son Hoa Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25031',
      order: 99,
      nameVi: 'Xã Củng Sơn',
      nameEn: 'Cung Son Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25032',
      order: 100,
      nameVi: 'Xã Suối Bạc',
      nameEn: 'Suoi Bac Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25033',
      order: 101,
      nameVi: 'Xã Xuân Phương',
      nameEn: 'Xuan Phuong Commune',
    },
    {
      group: 'GEO_AREA',
      code: '25034',
      order: 102,
      nameVi: 'Xã Xuân Hải',
      nameEn: 'Xuan Hai Commune',
    },

    // --- DOCUMENTS ---
    {
      group: 'DOCUMENT_TYPE',
      code: 'QUYET_DINH',
      order: 1,
      nameVi: 'Quyết định',
      nameEn: 'Decision',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'NGHI_QUYET',
      order: 2,
      nameVi: 'Nghị quyết',
      nameEn: 'Resolution',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'CONG_VAN',
      order: 3,
      nameVi: 'Công văn',
      nameEn: 'Official Letter',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'TO_TRINH',
      order: 4,
      nameVi: 'Tờ trình',
      nameEn: 'Proposal',
    },
    {
      group: 'DOCUMENT_TYPE',
      code: 'BAO_CAO',
      order: 5,
      nameVi: 'Báo cáo',
      nameEn: 'Report',
    },

    {
      group: 'URGENCY_LEVEL',
      code: 'THUONG',
      order: 1,
      nameVi: 'Thường',
      nameEn: 'Normal',
    },
    {
      group: 'URGENCY_LEVEL',
      code: 'KHAN',
      order: 2,
      nameVi: 'Khẩn',
      nameEn: 'Urgent',
    },
    {
      group: 'URGENCY_LEVEL',
      code: 'HOA_TOC',
      order: 3,
      nameVi: 'Hỏa tốc',
      nameEn: 'Express',
    },

    {
      group: 'SECURITY_LEVEL',
      code: 'THUONG',
      order: 1,
      nameVi: 'Thường',
      nameEn: 'Unclassified',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'MAT',
      order: 2,
      nameVi: 'Mật',
      nameEn: 'Confidential',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'TOI_MAT',
      order: 3,
      nameVi: 'Tối mật',
      nameEn: 'Secret',
    },
    {
      group: 'SECURITY_LEVEL',
      code: 'TUYET_MAT',
      order: 4,
      nameVi: 'Tuyệt mật',
      nameEn: 'Top Secret',
    },

    // --- UNIT OF MEASURE (NĐ 335/2025/NĐ-CP) ---
    {
      group: 'UNIT',
      code: 'UNIT_HO_SO',
      order: 1,
      nameVi: 'Hồ sơ',
      nameEn: 'Dossier',
    },
    {
      group: 'UNIT',
      code: 'UNIT_BAO_CAO',
      order: 2,
      nameVi: 'Báo cáo',
      nameEn: 'Report',
    },
    {
      group: 'UNIT',
      code: 'UNIT_VAN_BAN',
      order: 3,
      nameVi: 'Văn bản',
      nameEn: 'Document',
    },
    {
      group: 'UNIT',
      code: 'UNIT_GIO_CONG',
      order: 4,
      nameVi: 'Giờ công',
      nameEn: 'Man-hour',
    },
    {
      group: 'UNIT',
      code: 'UNIT_CHUYEN_DE',
      order: 5,
      nameVi: 'Chuyên đề',
      nameEn: 'Thematic',
    },
    {
      group: 'UNIT',
      code: 'UNIT_LUOT',
      order: 6,
      nameVi: 'Lượt',
      nameEn: 'Turn',
    },

    // --- CIVIL_SERVANT_RANK ---
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'SENIOR_SPECIALIST',
      order: 1,
      nameVi: 'Chuyên viên Cao cấp',
      nameEn: 'Senior Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'PRINCIPAL_SPECIALIST',
      order: 2,
      nameVi: 'Chuyên viên Chính',
      nameEn: 'Principal Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'SPECIALIST',
      order: 3,
      nameVi: 'Chuyên viên',
      nameEn: 'Specialist',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'OFFICER',
      order: 4,
      nameVi: 'Cán sự',
      nameEn: 'Officer',
    },
    {
      group: 'CIVIL_SERVANT_RANK',
      code: 'STAFF',
      order: 5,
      nameVi: 'Nhân viên',
      nameEn: 'Staff',
    },

    // --- PUBLIC_EMPLOYEE_RANK ---
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_1',
      order: 1,
      nameVi: 'Viên chức Hạng I',
      nameEn: 'Grade I Public Employee',
    },
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_2',
      order: 2,
      nameVi: 'Viên chức Hạng II',
      nameEn: 'Grade II Public Employee',
    },
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_3',
      order: 3,
      nameVi: 'Viên chức Hạng III',
      nameEn: 'Grade III Public Employee',
    },
    {
      group: 'PUBLIC_EMPLOYEE_RANK',
      code: 'GRADE_4',
      order: 4,
      nameVi: 'Viên chức Hạng IV',
      nameEn: 'Grade IV Public Employee',
    },

    // =========================
    // ĐIỀU HÀNH - HÀNH CHÍNH
    // =========================

    // =========================
    // VĂN PHÒNG UBND
    // =========================

    { group: 'DOMAIN', code: 'VAN_PHONG_UBND', nameVi: 'Văn phòng UBND' },
    {
      code: 'CHI_DAO_DIEU_HANH',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Chỉ đạo điều hành',
    },
    {
      group: 'DOMAIN',
      code: 'MOT_CUA',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Một cửa',
    },
    {
      code: 'KIEM_SOAT_TTHC',
      parentCode: 'VAN_PHONG_UBND',
      nameVi: 'Kiểm soát TTHC',
    },

    // =========================
    // SỞ NỘI VỤ
    // =========================

    { group: 'DOMAIN', code: 'SO_NOI_VU', nameVi: 'Sở Nội vụ' },
    {
      code: 'TO_CHUC_BO_MAY',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Tổ chức bộ máy',
    },
    {
      code: 'CAN_BO_CONG_CHUC',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Cán bộ công chức',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_CHUC',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Viên chức',
    },
    {
      code: 'DIA_GIOI_HANH_CHINH',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Địa giới hành chính',
    },
    {
      group: 'DOMAIN',
      code: 'TON_GIAO',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Tôn giáo',
    },
    {
      code: 'THI_DUA_KHEN_THUONG',
      parentCode: 'SO_NOI_VU',
      nameVi: 'Thi đua khen thưởng',
    },

    // =========================
    // SỞ TÀI CHÍNH
    // =========================

    { group: 'DOMAIN', code: 'SO_TAI_CHINH', nameVi: 'Sở Tài chính' },
    {
      group: 'DOMAIN',
      code: 'NGAN_SACH',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Ngân sách',
    },
    {
      code: 'TAI_SAN_CONG',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Tài sản công',
    },
    {
      group: 'DOMAIN',
      code: 'DAU_TU_CONG',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Đầu tư công',
    },
    {
      code: 'DOANH_NGHIEP',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Doanh nghiệp',
    },
    {
      code: 'HOP_TAC_XA',
      parentCode: 'SO_TAI_CHINH',
      nameVi: 'Kinh tế tập thể - HTX',
    },

    // =========================
    // SỞ XÂY DỰNG
    // =========================

    { group: 'DOMAIN', code: 'SO_XAY_DUNG', nameVi: 'Sở Xây dựng' },
    {
      code: 'QUY_HOACH',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Quy hoạch xây dựng',
    },
    {
      group: 'DOMAIN',
      code: 'NHA_O',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Nhà ở',
    },
    {
      code: 'CAP_PHEP_XAY_DUNG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Cấp phép xây dựng',
    },
    {
      code: 'VAT_LIEU_XAY_DUNG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Vật liệu xây dựng',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_THONG',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Giao thông',
    },
    {
      code: 'HA_TANG_DO_THI',
      parentCode: 'SO_XAY_DUNG',
      nameVi: 'Hạ tầng đô thị',
    },

    // =========================
    // SỞ NÔNG NGHIỆP & MÔI TRƯỜNG
    // =========================

    {
      group: 'DOMAIN',
      code: 'SO_NN_MT',
      nameVi: 'Sở Nông nghiệp và Môi trường',
    },
    {
      group: 'DOMAIN',
      code: 'TRONG_TROT',
      parentCode: 'SO_NN_MT',
      nameVi: 'Trồng trọt',
    },
    {
      group: 'DOMAIN',
      code: 'CHAN_NUOI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Chăn nuôi',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_LOI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Thủy lợi',
    },
    {
      group: 'DOMAIN',
      code: 'LAM_NGHIEP',
      parentCode: 'SO_NN_MT',
      nameVi: 'Lâm nghiệp',
    },
    {
      group: 'DOMAIN',
      code: 'DAT_DAI',
      parentCode: 'SO_NN_MT',
      nameVi: 'Đất đai',
    },
    {
      group: 'DOMAIN',
      code: 'MOI_TRUONG',
      parentCode: 'SO_NN_MT',
      nameVi: 'Môi trường',
    },
    {
      code: 'KHI_TUONG_THUY_VAN',
      parentCode: 'SO_NN_MT',
      nameVi: 'Khí tượng thủy văn',
    },

    // =========================
    // SỞ KHOA HỌC & CÔNG NGHỆ
    // =========================

    { group: 'DOMAIN', code: 'H15.07', nameVi: 'Sở Khoa học và Công nghệ' },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO',
      parentCode: 'H15.07',
      nameVi: 'Chuyển đổi số',
    },
    {
      group: 'DOMAIN',
      code: 'DU_LIEU_SO',
      parentCode: 'H15.07',
      nameVi: 'Dữ liệu số',
    },
    {
      code: 'AN_TOAN_THONG_TIN',
      parentCode: 'H15.07',
      nameVi: 'An toàn thông tin',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THONG',
      parentCode: 'H15.07',
      nameVi: 'Viễn thông',
    },
    {
      group: 'DOMAIN',
      code: 'KINH_TE_SO',
      parentCode: 'H15.07',
      nameVi: 'Kinh tế số',
    },

    // =========================
    // SỞ GIÁO DỤC
    // =========================

    { group: 'DOMAIN', code: 'SO_GIAO_DUC', nameVi: 'Sở Giáo dục và Đào tạo' },
    {
      group: 'DOMAIN',
      code: 'MAM_NON',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Mầm non',
    },
    {
      group: 'DOMAIN',
      code: 'TIEU_HOC',
      parentCode: 'SO_GIAO_DUC',
      nameVi: 'Tiểu học',
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
      nameVi: 'Giáo dục nghề nghiệp',
    },

    // =========================
    // SỞ Y TẾ
    // =========================

    { group: 'DOMAIN', code: 'SO_Y_TE', nameVi: 'Sở Y tế' },
    {
      group: 'DOMAIN',
      code: 'KHAM_CHUA_BENH',
      parentCode: 'SO_Y_TE',
      nameVi: 'Khám chữa bệnh',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_DU_PHONG',
      parentCode: 'SO_Y_TE',
      nameVi: 'Y tế dự phòng',
    },
    { group: 'DOMAIN', code: 'DUOC', parentCode: 'SO_Y_TE', nameVi: 'Dược' },
    {
      code: 'AN_TOAN_THUC_PHAM',
      parentCode: 'SO_Y_TE',
      nameVi: 'An toàn thực phẩm',
    },

    // =========================
    // CÔNG AN
    // =========================

    { group: 'DOMAIN', code: 'CONG_AN', nameVi: 'Công an' },
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
      nameVi: 'Trật tự xã hội',
    },
    { group: 'DOMAIN', code: 'PCCC', parentCode: 'CONG_AN', nameVi: 'PCCC' },
    {
      group: 'DOMAIN',
      code: 'CU_TRU',
      parentCode: 'CONG_AN',
      nameVi: 'Cư trú',
    },

    // =========================
    // QUÂN SỰ
    // =========================

    { group: 'DOMAIN', code: 'QUAN_SU', nameVi: 'Quân sự' },
    {
      code: 'QUOC_PHONG_DIA_PHUONG',
      parentCode: 'QUAN_SU',
      nameVi: 'Quốc phòng địa phương',
    },
    {
      group: 'DOMAIN',
      code: 'DAN_QUAN_TU_VE',
      parentCode: 'QUAN_SU',
      nameVi: 'Dân quân tự vệ',
    },
    {
      code: 'NGHIA_VU_QUAN_SU',
      parentCode: 'QUAN_SU',
      nameVi: 'Nghĩa vụ quân sự',
    },

    {
      group: 'STORAGE_PERIOD',
      code: '5_YEARS',
      order: 1,
      nameVi: '05 năm',
      nameEn: '5 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: '10_YEARS',
      order: 2,
      nameVi: '10 năm',
      nameEn: '10 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: '20_YEARS',
      order: 3,
      nameVi: '20 năm',
      nameEn: '20 years',
    },
    {
      group: 'STORAGE_PERIOD',
      code: 'PERMANENT',
      order: 4,
      nameVi: 'Vĩnh viễn',
      nameEn: 'Permanent',
    },

    // --- HRM & PERSONAL ---
    { group: 'GENDER', code: 'NAM', order: 1, nameVi: 'Nam', nameEn: 'Male' },
    { group: 'GENDER', code: 'NU', order: 2, nameVi: 'Nữ', nameEn: 'Female' },
    {
      group: 'GENDER',
      code: 'KHAC',
      order: 3,
      nameVi: 'Khác',
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
      nameVi: 'Ê-đê',
      nameEn: 'Ede',
    },
    {
      group: 'ETHNICITY',
      code: 'M_NONG',
      order: 3,
      nameVi: "M'Nông",
      nameEn: "M'Nong",
    },

    {
      group: 'RELIGION',
      code: 'KHONG',
      order: 1,
      nameVi: 'Không',
      nameEn: 'None',
    },
    {
      group: 'RELIGION',
      code: 'PHAT_GIAO',
      order: 2,
      nameVi: 'Phật giáo',
      nameEn: 'Buddhism',
    },
    {
      group: 'RELIGION',
      code: 'CONG_GIAO',
      order: 3,
      nameVi: 'Công giáo',
      nameEn: 'Catholicism',
    },

    {
      group: 'IDENTITY_TYPE',
      code: 'CCCD',
      order: 1,
      nameVi: 'Căn cước công dân',
      nameEn: 'Citizen Identity Card',
    },
    {
      group: 'IDENTITY_TYPE',
      code: 'PASSPORT',
      order: 2,
      nameVi: 'Hộ chiếu',
      nameEn: 'Passport',
    },

    {
      group: 'POSITION',
      code: 'GIAM_DOC',
      order: 1,
      nameVi: 'Giám đốc',
      nameEn: 'Director',
    },
    {
      group: 'POSITION',
      code: 'PHO_GIAM_DOC',
      order: 2,
      nameVi: 'Phó Giám đốc',
      nameEn: 'Deputy Director',
    },
    {
      group: 'POSITION',
      code: 'TRUONG_PHONG',
      order: 3,
      nameVi: 'Trưởng phòng',
      nameEn: 'Head of Department',
    },
    {
      group: 'POSITION',
      code: 'PHO_TRUONG_PHONG',
      order: 4,
      nameVi: 'Phó Trưởng phòng',
      nameEn: 'Deputy Head of Department',
    },
    {
      group: 'POSITION',
      code: 'CHANH_VAN_PHONG',
      order: 5,
      nameVi: 'Chánh Văn phòng',
      nameEn: 'Chief of Office',
    },
    {
      group: 'POSITION',
      code: 'PHO_CHANH_VAN_PHONG',
      order: 6,
      nameVi: 'Phó Chánh Văn phòng',
      nameEn: 'Deputy Chief of Office',
    },
    {
      group: 'POSITION',
      code: 'CHANH_THANH_TRA',
      order: 7,
      nameVi: 'Chánh Thanh tra',
      nameEn: 'Chief Inspector',
    },
    {
      group: 'POSITION',
      code: 'PHO_CHANH_THANH_TRA',
      order: 8,
      nameVi: 'Phó Chánh Thanh tra',
      nameEn: 'Deputy Chief Inspector',
    },
    {
      group: 'POSITION',
      code: 'SPECIALIST',
      order: 9,
      nameVi: 'Chuyên viên',
      nameEn: 'Expert',
    },

    {
      group: 'ACADEMIC_RANK',
      code: 'TIEN_SI',
      order: 1,
      nameVi: 'Tiến sĩ',
      nameEn: 'Doctor of Philosophy',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'THAC_SI',
      order: 2,
      nameVi: 'Thạc sĩ',
      nameEn: 'Master of Science',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'GIAO_SU',
      order: 3,
      nameVi: 'Giáo sư',
      nameEn: 'Professor',
    },
    {
      group: 'ACADEMIC_RANK',
      code: 'PHO_GIAO_SU',
      order: 4,
      nameVi: 'Phó Giáo sư',
      nameEn: 'Associate Professor',
    },

    {
      group: 'POLITICAL_THEORY',
      code: 'CAO_CAP',
      order: 1,
      nameVi: 'Cao cấp',
      nameEn: 'Advanced',
    },
    {
      group: 'POLITICAL_THEORY',
      code: 'TRUNG_CAP',
      order: 2,
      nameVi: 'Trung cấp',
      nameEn: 'Intermediate',
    },
    {
      group: 'POLITICAL_THEORY',
      code: 'SO_CAP',
      order: 3,
      nameVi: 'Sơ cấp',
      nameEn: 'Elementary',
    },

    {
      group: 'IT_SKILL',
      code: 'CO_BAN',
      order: 1,
      nameVi: 'Cơ bản',
      nameEn: 'Basic',
    },
    {
      group: 'IT_SKILL',
      code: 'NANG_CAO',
      order: 2,
      nameVi: 'Nâng cao',
      nameEn: 'Advanced',
    },

    {
      group: 'LANGUAGE_SKILL',
      code: 'ENGLISH_B1',
      order: 1,
      nameVi: 'Tiếng Anh B1',
      nameEn: 'English B1',
    },
    {
      group: 'LANGUAGE_SKILL',
      code: 'ENGLISH_B2',
      order: 2,
      nameVi: 'Tiếng Anh B2',
      nameEn: 'English B2',
    },

    // --- SYSTEM LANGUAGES ---
    {
      group: 'LANGUAGE',
      code: 'vi',
      order: 1,
      nameVi: 'Tiếng Việt',
      nameEn: 'Vietnamese',
    },
    {
      group: 'LANGUAGE',
      code: 'en',
      order: 2,
      nameVi: 'Tiếng Anh',
      nameEn: 'English',
    },

    // --- OTHER ---
    {
      group: 'DOMAIN',
      code: 'KHCN',
      order: 1,
      nameVi: 'Khoa học công nghệ',
      nameEn: 'Science & Technology',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_KHOA_HOC',
      order: 2,
      nameVi: 'Quản lý khoa học',
      nameEn: 'Scientific Management',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_CONG_NGHE',
      order: 3,
      nameVi: 'Quản lý công nghệ',
      nameEn: 'Technology Management',
    },
    {
      group: 'DOMAIN',
      code: 'DOI_MOI_SANG_TAO',
      order: 4,
      nameVi: 'Đổi mới sáng tạo',
      nameEn: 'Innovation',
    },
    {
      group: 'DOMAIN',
      code: 'SO_HUU_TRI_TUE',
      order: 5,
      nameVi: 'Sở hữu trí tuệ',
      nameEn: 'Intellectual Property',
    },
    {
      group: 'DOMAIN',
      code: 'TIEU_CHUAN_DO_LUONG_CHAT_LUONG',
      order: 6,
      nameVi: 'Tiêu chuẩn đo lường chất lượng',
      nameEn: 'Standards Metrology & Quality',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_BUC_XA_HAT_NHAN',
      order: 7,
      nameVi: 'An toàn bức xạ hạt nhân',
      nameEn: 'Radiation & Nuclear Safety',
    },
    {
      group: 'DOMAIN',
      code: 'UNG_DUNG_KHCN',
      order: 8,
      nameVi: 'Ứng dụng khoa học công nghệ',
      nameEn: 'Science & Technology Application',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO',
      order: 9,
      nameVi: 'Chuyển đổi số',
      nameEn: 'Digital Transformation',
    },
    {
      group: 'DOMAIN',
      code: 'DU_LIEU_SO',
      order: 10,
      nameVi: 'Dữ liệu số',
      nameEn: 'Digital Data',
    },
    {
      group: 'DOMAIN',
      code: 'CHINH_QUYEN_SO',
      order: 11,
      nameVi: 'Chính quyền số',
      nameEn: 'Digital Government',
    },
    {
      group: 'DOMAIN',
      code: 'KINH_TE_SO',
      order: 12,
      nameVi: 'Kinh tế số',
      nameEn: 'Digital Economy',
    },
    {
      group: 'DOMAIN',
      code: 'XA_HOI_SO',
      order: 13,
      nameVi: 'Xã hội số',
      nameEn: 'Digital Society',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_THONG_TIN',
      order: 14,
      nameVi: 'An toàn thông tin',
      nameEn: 'Cyber Security',
    },
    {
      group: 'DOMAIN',
      code: 'CONG_NGHE_THONG_TIN',
      order: 15,
      nameVi: 'Công nghệ thông tin',
      nameEn: 'Information Technology',
    },

    {
      group: 'DOMAIN',
      code: 'GIAO_DUC',
      order: 16,
      nameVi: 'Giáo dục',
      nameEn: 'Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_MAM_NON',
      order: 17,
      nameVi: 'Giáo dục mầm non',
      nameEn: 'Preschool Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_TIEU_HOC',
      order: 18,
      nameVi: 'Giáo dục tiểu học',
      nameEn: 'Primary Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THCS',
      order: 19,
      nameVi: 'Giáo dục THCS',
      nameEn: 'Secondary Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THPT',
      order: 20,
      nameVi: 'Giáo dục THPT',
      nameEn: 'High School Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_THUONG_XUYEN',
      order: 21,
      nameVi: 'Giáo dục thường xuyên',
      nameEn: 'Continuing Education',
    },
    {
      group: 'DOMAIN',
      code: 'GIAO_DUC_NGHE_NGHIEP',
      order: 22,
      nameVi: 'Giáo dục nghề nghiệp',
      nameEn: 'Vocational Education',
    },
    {
      group: 'DOMAIN',
      code: 'KHAO_THI_KIEM_DINH',
      order: 23,
      nameVi: 'Khảo thí kiểm định',
      nameEn: 'Testing & Accreditation',
    },
    {
      group: 'DOMAIN',
      code: 'HOC_SINH_SINH_VIEN',
      order: 24,
      nameVi: 'Học sinh sinh viên',
      nameEn: 'Students Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO_GIAO_DUC',
      order: 25,
      nameVi: 'Chuyển đổi số giáo dục',
      nameEn: 'Digital Education',
    },

    {
      group: 'DOMAIN',
      code: 'Y_TE',
      order: 26,
      nameVi: 'Y tế',
      nameEn: 'Healthcare',
    },
    {
      group: 'DOMAIN',
      code: 'KHAM_CHUA_BENH',
      order: 27,
      nameVi: 'Khám chữa bệnh',
      nameEn: 'Medical Examination & Treatment',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_DU_PHONG',
      order: 28,
      nameVi: 'Y tế dự phòng',
      nameEn: 'Preventive Medicine',
    },
    {
      group: 'DOMAIN',
      code: 'DUOC_PHAM',
      order: 29,
      nameVi: 'Dược phẩm',
      nameEn: 'Pharmaceuticals',
    },
    {
      group: 'DOMAIN',
      code: 'THIET_BI_Y_TE',
      order: 30,
      nameVi: 'Thiết bị y tế',
      nameEn: 'Medical Equipment',
    },
    {
      group: 'DOMAIN',
      code: 'AN_TOAN_THUC_PHAM',
      order: 31,
      nameVi: 'An toàn thực phẩm',
      nameEn: 'Food Safety',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_HIEM_Y_TE',
      order: 32,
      nameVi: 'Bảo hiểm y tế',
      nameEn: 'Health Insurance',
    },
    {
      group: 'DOMAIN',
      code: 'DAN_SO',
      order: 33,
      nameVi: 'Dân số',
      nameEn: 'Population',
    },
    {
      group: 'DOMAIN',
      code: 'Y_TE_CO_SO',
      order: 34,
      nameVi: 'Y tế cơ sở',
      nameEn: 'Primary Healthcare',
    },
    {
      group: 'DOMAIN',
      code: 'CHUYEN_DOI_SO_Y_TE',
      order: 35,
      nameVi: 'Chuyển đổi số y tế',
      nameEn: 'Digital Healthcare',
    },

    {
      group: 'DOMAIN',
      code: 'NONG_NGHIEP',
      order: 36,
      nameVi: 'Nông nghiệp & PTNT',
      nameEn: 'Agriculture & Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'TRONG_TROT',
      order: 37,
      nameVi: 'Trồng trọt',
      nameEn: 'Crop Production',
    },
    {
      group: 'DOMAIN',
      code: 'CHAN_NUOI',
      order: 38,
      nameVi: 'Chăn nuôi',
      nameEn: 'Livestock',
    },
    {
      group: 'DOMAIN',
      code: 'THU_Y',
      order: 39,
      nameVi: 'Thú y',
      nameEn: 'Veterinary',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_SAN',
      order: 40,
      nameVi: 'Thủy sản',
      nameEn: 'Fisheries',
    },
    {
      group: 'DOMAIN',
      code: 'LAM_NGHIEP',
      order: 41,
      nameVi: 'Lâm nghiệp',
      nameEn: 'Forestry',
    },
    {
      group: 'DOMAIN',
      code: 'KIEM_LAM',
      order: 42,
      nameVi: 'Kiểm lâm',
      nameEn: 'Forest Protection',
    },
    {
      group: 'DOMAIN',
      code: 'THUY_LOI',
      order: 43,
      nameVi: 'Thủy lợi',
      nameEn: 'Irrigation',
    },
    {
      group: 'DOMAIN',
      code: 'PHAT_TRIEN_NONG_THON',
      order: 44,
      nameVi: 'Phát triển nông thôn',
      nameEn: 'Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'NONG_THON_MOI',
      order: 45,
      nameVi: 'Nông thôn mới',
      nameEn: 'New Rural Development',
    },
    {
      group: 'DOMAIN',
      code: 'PHONG_CHONG_THIEN_TAI',
      order: 46,
      nameVi: 'Phòng chống thiên tai',
      nameEn: 'Disaster Prevention',
    },
    {
      group: 'DOMAIN',
      code: 'CHAT_LUONG_NONG_LAM_SAN',
      order: 47,
      nameVi: 'Chất lượng nông lâm sản',
      nameEn: 'Agro-Forestry Quality',
    },
    {
      group: 'DOMAIN',
      code: 'KHUYEN_NONG',
      order: 48,
      nameVi: 'Khuyến nông',
      nameEn: 'Agricultural Extension',
    },

    {
      group: 'DOMAIN',
      code: 'CONG_THUONG',
      order: 49,
      nameVi: 'Công thương',
      nameEn: 'Industry & Trade',
    },
    {
      group: 'DOMAIN',
      code: 'CONG_NGHIEP',
      order: 50,
      nameVi: 'Công nghiệp',
      nameEn: 'Industry',
    },
    {
      group: 'DOMAIN',
      code: 'THUONG_MAI',
      order: 51,
      nameVi: 'Thương mại',
      nameEn: 'Trade',
    },
    {
      group: 'DOMAIN',
      code: 'XUC_TIEN_THUONG_MAI',
      order: 52,
      nameVi: 'Xúc tiến thương mại',
      nameEn: 'Trade Promotion',
    },
    {
      group: 'DOMAIN',
      code: 'QUAN_LY_THI_TRUONG',
      order: 53,
      nameVi: 'Quản lý thị trường',
      nameEn: 'Market Surveillance',
    },
    {
      group: 'DOMAIN',
      code: 'XUAT_NHAP_KHAU',
      order: 54,
      nameVi: 'Xuất nhập khẩu',
      nameEn: 'Import Export',
    },
    {
      group: 'DOMAIN',
      code: 'NANG_LUONG',
      order: 55,
      nameVi: 'Năng lượng',
      nameEn: 'Energy',
    },
    {
      group: 'DOMAIN',
      code: 'DIEN_LUC',
      order: 56,
      nameVi: 'Điện lực',
      nameEn: 'Electricity',
    },
    {
      group: 'DOMAIN',
      code: 'THUONG_MAI_DIEN_TU',
      order: 57,
      nameVi: 'Thương mại điện tử',
      nameEn: 'E-Commerce',
    },
    {
      group: 'DOMAIN',
      code: 'CU_M_CONG_NGHIEP',
      order: 58,
      nameVi: 'Cụm công nghiệp',
      nameEn: 'Industrial Clusters',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_VE_NGUOI_TIEU_DUNG',
      order: 59,
      nameVi: 'Bảo vệ người tiêu dùng',
      nameEn: 'Consumer Protection',
    },

    {
      group: 'DOMAIN',
      code: 'NOI_VU',
      order: 60,
      nameVi: 'Nội vụ',
      nameEn: 'Home Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'TO_CHUC_BO_MAY',
      order: 61,
      nameVi: 'Tổ chức bộ máy',
      nameEn: 'Organizational Structure',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_CHE',
      order: 62,
      nameVi: 'Biên chế',
      nameEn: 'Staff Quota',
    },
    {
      group: 'DOMAIN',
      code: 'CAN_BO_CONG_CHUC',
      order: 63,
      nameVi: 'Cán bộ công chức viên chức',
      nameEn: 'Civil Servants Management',
    },
    {
      group: 'DOMAIN',
      code: 'CHINH_QUYEN_DIA_PHUONG',
      order: 64,
      nameVi: 'Chính quyền địa phương',
      nameEn: 'Local Government',
    },
    {
      group: 'DOMAIN',
      code: 'DIA_GIOI_HANH_CHINH',
      order: 65,
      nameVi: 'Địa giới hành chính',
      nameEn: 'Administrative Boundaries',
    },
    {
      group: 'DOMAIN',
      code: 'THI_DUA_KHEN_THUONG',
      order: 66,
      nameVi: 'Thi đua khen thưởng',
      nameEn: 'Emulation & Reward',
    },
    {
      group: 'DOMAIN',
      code: 'TON_GIAO',
      order: 67,
      nameVi: 'Tôn giáo',
      nameEn: 'Religious Affairs',
    },
    {
      group: 'DOMAIN',
      code: 'VAN_THU_LUU_TRU',
      order: 68,
      nameVi: 'Văn thư lưu trữ',
      nameEn: 'Archives & Records',
    },
    {
      group: 'DOMAIN',
      code: 'CAI_CACH_HANH_CHINH',
      order: 69,
      nameVi: 'Cải cách hành chính',
      nameEn: 'Administrative Reform',
    },

    {
      group: 'DOMAIN',
      code: 'TAI_NGUYEN_MOI_TRUONG',
      order: 70,
      nameVi: 'Tài nguyên & Môi trường',
      nameEn: 'Natural Resources & Environment',
    },
    {
      group: 'DOMAIN',
      code: 'DAT_DAI',
      order: 71,
      nameVi: 'Đất đai',
      nameEn: 'Land Administration',
    },
    {
      group: 'DOMAIN',
      code: 'DO_DAC_BAN_DO',
      order: 72,
      nameVi: 'Đo đạc bản đồ',
      nameEn: 'Survey & Mapping',
    },
    {
      group: 'DOMAIN',
      code: 'TAI_NGUYEN_NUOC',
      order: 73,
      nameVi: 'Tài nguyên nước',
      nameEn: 'Water Resources',
    },
    {
      group: 'DOMAIN',
      code: 'KHOANG_SAN',
      order: 74,
      nameVi: 'Khoáng sản',
      nameEn: 'Minerals',
    },
    {
      group: 'DOMAIN',
      code: 'MOI_TRUONG',
      order: 75,
      nameVi: 'Môi trường',
      nameEn: 'Environment',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_DOI_KHI_HAU',
      order: 76,
      nameVi: 'Biến đổi khí hậu',
      nameEn: 'Climate Change',
    },
    {
      group: 'DOMAIN',
      code: 'KHI_TUONG_THUY_VAN',
      order: 77,
      nameVi: 'Khí tượng thủy văn',
      nameEn: 'Hydrometeorology',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THAM',
      order: 78,
      nameVi: 'Viễn thám',
      nameEn: 'Remote Sensing',
    },
    {
      group: 'DOMAIN',
      code: 'BIEN_HAI_DAO',
      order: 79,
      nameVi: 'Biển hải đảo',
      nameEn: 'Sea & Islands',
    },

    {
      group: 'DOMAIN',
      code: 'XAY_DUNG',
      order: 80,
      nameVi: 'Xây dựng',
      nameEn: 'Construction',
    },
    {
      group: 'DOMAIN',
      code: 'QUY_HOACH_XAY_DUNG',
      order: 81,
      nameVi: 'Quy hoạch xây dựng',
      nameEn: 'Construction Planning',
    },
    {
      group: 'DOMAIN',
      code: 'PHAT_TRIEN_DO_THI',
      order: 82,
      nameVi: 'Phát triển đô thị',
      nameEn: 'Urban Development',
    },
    {
      group: 'DOMAIN',
      code: 'HA_TANG_KY_THUAT',
      order: 83,
      nameVi: 'Hạ tầng kỹ thuật',
      nameEn: 'Technical Infrastructure',
    },
    {
      group: 'DOMAIN',
      code: 'NHA_O',
      order: 84,
      nameVi: 'Nhà ở',
      nameEn: 'Housing',
    },
    {
      group: 'DOMAIN',
      code: 'VAT_LIEU_XAY_DUNG',
      order: 85,
      nameVi: 'Vật liệu xây dựng',
      nameEn: 'Construction Materials',
    },
    {
      group: 'DOMAIN',
      code: 'GIAM_DINH_CHAT_LUONG_CONG_TRINH',
      order: 86,
      nameVi: 'Giám định chất lượng công trình',
      nameEn: 'Construction Quality Inspection',
    },
    {
      group: 'DOMAIN',
      code: 'CAP_PHEP_XAY_DUNG',
      order: 87,
      nameVi: 'Cấp phép xây dựng',
      nameEn: 'Construction Licensing',
    },

    {
      group: 'DOMAIN',
      code: 'THONG_TIN_TRUYEN_THONG',
      order: 88,
      nameVi: 'Thông tin & Truyền thông',
      nameEn: 'Information & Communications',
    },
    {
      group: 'DOMAIN',
      code: 'BAO_CHI',
      order: 89,
      nameVi: 'Báo chí',
      nameEn: 'Press',
    },
    {
      group: 'DOMAIN',
      code: 'XUAT_BAN',
      order: 90,
      nameVi: 'Xuất bản',
      nameEn: 'Publishing',
    },
    {
      group: 'DOMAIN',
      code: 'THONG_TIN_DIEN_TU',
      order: 91,
      nameVi: 'Thông tin điện tử',
      nameEn: 'Electronic Information',
    },
    {
      group: 'DOMAIN',
      code: 'BUU_CHINH',
      order: 92,
      nameVi: 'Bưu chính',
      nameEn: 'Postal Services',
    },
    {
      group: 'DOMAIN',
      code: 'VIEN_THONG',
      order: 93,
      nameVi: 'Viễn thông',
      nameEn: 'Telecommunications',
    },
    {
      group: 'DOMAIN',
      code: 'HA_TANG_SO',
      order: 94,
      nameVi: 'Hạ tầng số',
      nameEn: 'Digital Infrastructure',
    },
    {
      group: 'DOMAIN',
      code: 'TRUYEN_THONG_CO_SO',
      order: 95,
      nameVi: 'Truyền thông cơ sở',
      nameEn: 'Grassroots Communication',
    },
    {
      group: 'DOMAIN',
      code: 'THONG_TIN_DOI_NGOAI',
      order: 96,
      nameVi: 'Thông tin đối ngoại',
      nameEn: 'External Information Service',
    },

    {
      group: 'CONTENT_TYPE',
      code: 'ARTICLE',
      order: 1,
      nameVi: 'Bài viết',
      nameEn: 'Article',
    },
    {
      group: 'CONTENT_TYPE',
      code: 'NOTIF',
      order: 2,
      nameVi: 'Thông báo',
      nameEn: 'Notification',
    },
    {
      group: 'CONTENT_TYPE',
      code: 'POLICY',
      order: 3,
      nameVi: 'Văn bản chỉ đạo',
      nameEn: 'Policy Instruction',
    },

    {
      group: 'DEPARTMENT',
      code: 'VAN_PHONG',
      order: 1,
      nameVi: 'Văn phòng Sở',
      nameEn: 'Department Office',
    },
    {
      group: 'DEPARTMENT',
      code: 'PHONG_KE_HOACH',
      order: 2,
      nameVi: 'Phòng Kế hoạch - Tài chính',
      nameEn: 'Planning & Finance Division',
    },

    // --- WORKFLOW ---
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'MANUAL',
      order: 1,
      nameVi: 'Kích hoạt thủ công',
      nameEn: 'Manual Trigger',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'POST_SUBMIT',
      order: 2,
      nameVi: 'Khi gửi duyệt bài viết',
      nameEn: 'On Article Submitted',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'DOC_RECEIVED',
      order: 3,
      nameVi: 'Khi nhận văn bản mới',
      nameEn: 'On Document Received',
    },
    {
      group: 'WORKFLOW_TRIGGER',
      code: 'USER_CREATED',
      order: 4,
      nameVi: 'Khi tạo tài khoản mới',
      nameEn: 'On User Account Created',
    },

    {
      group: 'WORKFLOW_ACTION',
      code: 'APPROVE',
      order: 1,
      nameVi: 'Phê duyệt',
      nameEn: 'Approve',
    },
    {
      group: 'WORKFLOW_ACTION',
      code: 'REJECT',
      order: 2,
      nameVi: 'Từ chối',
      nameEn: 'Reject',
    },
    {
      group: 'WORKFLOW_ACTION',
      code: 'PUBLISH',
      order: 3,
      nameVi: 'Xuất bản',
      nameEn: 'Publish',
    },
    {
      group: 'WORKFLOW_ACTION',
      code: 'REQUEST_INFO',
      order: 4,
      nameVi: 'Yêu cầu bổ sung',
      nameEn: 'Request More Info',
    },

    // --- BANNER POSITIONS ---
    {
      group: 'BANNER_POSITION',
      code: 'top',
      order: 1,
      nameVi: 'Đầu trang (Header)',
      nameEn: 'Top (Header)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_1',
      order: 2,
      nameVi: 'Giữa trang - Vị trí 1',
      nameEn: 'Middle - Position 1',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_2',
      order: 3,
      nameVi: 'Giữa trang - Vị trí 2',
      nameEn: 'Middle - Position 2',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle_3',
      order: 4,
      nameVi: 'Giữa trang - Vị trí 3',
      nameEn: 'Middle - Position 3',
    },
    {
      group: 'BANNER_POSITION',
      code: 'middle',
      order: 5,
      nameVi: 'Thân trang (Sidebar)',
      nameEn: 'Sidebar (Middle)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'bottom',
      order: 6,
      nameVi: 'Cuối trang (Footer)',
      nameEn: 'Bottom (Footer)',
    },
    {
      group: 'BANNER_POSITION',
      code: 'custom',
      order: 7,
      nameVi: 'Khẩu hiệu chính',
      nameEn: 'Custom Slogan',
    },

    // --- PORTAL APPEARANCE CONFIGURATIONS ---
    {
      group: 'font_family',
      code: "'Times New Roman', Times, serif",
      order: 1,
      nameVi: 'Serif Uy Nghiêm (Government)',
      nameEn: 'Government Serif',
    },
    {
      group: 'font_family',
      code: "'Inter', sans-serif",
      order: 2,
      nameVi: 'Sans-Serif Hiện Đại (Inter)',
      nameEn: 'Modern Sans-Serif',
    },
    {
      group: 'font_family',
      code: "'Outfit', 'Inter', sans-serif",
      order: 3,
      nameVi: 'Trẻ Trung (Outfit)',
      nameEn: 'Outfit Sans-Serif',
    },
    {
      group: 'font_family',
      code: "'Roboto Mono', monospace",
      order: 4,
      nameVi: 'Tối Giản Hướng Công Nghệ',
      nameEn: 'Monospace Minimal',
    },

    {
      group: 'border_radius',
      code: '0px',
      order: 1,
      nameVi: 'Không bo góc (0px)',
      nameEn: 'No border radius (0px)',
    },
    {
      group: 'border_radius',
      code: '4px',
      order: 2,
      nameVi: 'Bo góc nhỏ (4px)',
      nameEn: 'Small radius (4px)',
    },
    {
      group: 'border_radius',
      code: '8px',
      order: 3,
      nameVi: 'Bo góc trung bình (8px)',
      nameEn: 'Medium radius (8px)',
    },
    {
      group: 'border_radius',
      code: '12px',
      order: 4,
      nameVi: 'Bo góc tròn (12px)',
      nameEn: 'Round radius (12px)',
    },
    {
      group: 'border_radius',
      code: '16px',
      order: 5,
      nameVi: 'Bo góc lớn (16px)',
      nameEn: 'Large radius (16px)',
    },
  ];

  console.log(
    `📦 Seeding ${categoriesData.length} categories with dual translations...`,
  );
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE sys_categories DROP COLUMN name, DROP COLUMN description;',
    );
    console.log('✅ Dropped unused legacy columns from sys_categories');
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
  console.log('✅ Categories and dual Vietnamese/English translations seeded');

  // ==========================================================
  // 3.2 CATEGORY GROUPS (For friendly names)
  // ==========================================================
  const groupLabels = [
    { code: 'STATUS', name: 'Trạng thái hệ thống' },
    { code: 'ACTION_LOG', name: 'Nhật ký hoạt động' },
    { code: 'MICROSERVICE', name: 'Dịch vụ hệ thống' },
    { code: 'PROVINCE', name: 'Danh mục Tỉnh/Thành' },
    { code: 'DISTRICT', name: 'Danh mục Quận/Huyện' },
    { code: 'GEO_AREA', name: 'Khu vực địa lý' },
    { code: 'DOCUMENT_TYPE', name: 'Loại văn bản' },
    { code: 'URGENCY_LEVEL', name: 'Độ khẩn' },
    { code: 'SECURITY_LEVEL', name: 'Độ mật' },
    { code: 'DOCUMENT_DOMAIN', name: 'Lĩnh vực văn bản' },
    { code: 'STORAGE_PERIOD', name: 'Thời hạn bảo quản' },
    { code: 'GENDER', name: 'Giới tính' },
    { code: 'ETHNICITY', name: 'Dân tộc' },
    { code: 'RELIGION', name: 'Tôn giáo' },
    { code: 'IDENTITY_TYPE', name: 'Giấy tờ định danh' },
    { code: 'POSITION', name: 'Chức vụ' },
    { code: 'CIVIL_SERVANT_RANK', name: 'Ngạch công chức' },
    { code: 'PUBLIC_EMPLOYEE_RANK', name: 'Ngạch viên chức' },
    { code: 'UNIT', name: 'Đơn vị tính' },
    { code: 'ACADEMIC_RANK', name: 'Học hàm/Học vị' },
    { code: 'POLITICAL_THEORY', name: 'Lý luận chính trị' },

    { code: 'IT_SKILL', name: 'Trình độ tin học' },
    { code: 'LANGUAGE_SKILL', name: 'Trình độ ngoại ngữ' },
    { code: 'LANGUAGE', name: 'Ngôn ngữ hệ thống' },
    { code: 'DOMAIN', name: 'Lĩnh vực nghiệp vụ' },
    { code: 'CONTENT_TYPE', name: 'Loại nội dung' },
    { code: 'DEPARTMENT', name: 'Phòng ban' },
    { code: 'WORKFLOW_TRIGGER', name: 'Kích hoạt quy trình' },
    { code: 'WORKFLOW_ACTION', name: 'Hành động quy trình' },
    { code: 'BANNER_POSITION', name: 'Vị trí hiển thị Banner' },
    { code: 'font_family', name: 'Phông chữ giao diện (Portal)' },
    { code: 'border_radius', name: 'Độ bo góc khối (Portal)' },
    { code: 'AI_PROVIDER_TYPE', name: 'Nhà cung cấp AI (LLM)' },
    { code: 'TRANSLATION_SERVICE_TYPE', name: 'Dịch vụ Dịch thuật' },
  ];

  console.log('📦 Seeding Category Groups...');
  for (const g of groupLabels) {
    await prisma.categoryGroup.upsert({
      where: { code: g.code },
      update: { name: g.name },
      create: g,
    });
  }
  console.log('✅ Category Groups seeded');

  // ==========================================================
  // 3.1 UNIT TYPES (New Model)
  // ==========================================================
  console.log('📦 Seeding Unit Types...');
  const unitTypesData = [
    { code: 'CQ_TU', name: 'Cơ quan Trung ương', level: 1 },
    { code: 'UBND_TINH', name: 'UBND Cấp Tỉnh', level: 1 },
    { code: 'HDND_TINH', name: 'HĐND Cấp Tỉnh', level: 1 },
    { code: 'SO_NGANH', name: 'Sở, Ban, Ngành', level: 2 },
    { code: 'UBND_HUYEN', name: 'UBND Cấp Huyện', level: 2 },
    { code: 'HDND_HUYEN', name: 'HĐND Cấp Huyện', level: 2 },
    { code: 'PHONG_BAN_SO', name: 'Phòng chuyên môn cấp Sở', level: 3 },
    {
      code: 'PHONG_BAN_HUYEN',
      name: 'Phòng, Ban chuyên môn cấp Huyện',
      level: 3,
    },
    { code: 'VAN_PHONG', name: 'Văn phòng', level: 3 },
    { code: 'THANH_TRA', name: 'Thanh tra', level: 3 },
    { code: 'UBND_XA', name: 'UBND Cấp Xã/Phường', level: 3 },
    { code: 'HDND_XA', name: 'HĐND Cấp Xã', level: 3 },
    { code: 'DVSN', name: 'Đơn vị sự nghiệp', level: 2 },
    { code: 'CHI_CUC', name: 'Chi cục / Tổng cục', level: 2 },
    { code: 'TRUNG_TAM', name: 'Trung tâm', level: 3 },
    { code: 'CQ_DANG', name: 'Cơ quan Đảng', level: 1 },
    { code: 'TO_CHUC_CTXH', name: 'Tổ chức Chính trị - Xã hội', level: 2 },
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
  console.log('✅ Unit Types seeded');

  // ==========================================================
  // 4. ROLES
  // ==========================================================
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {
      name: 'Super Administrator',
      permissions: { set: allPermissions },
    },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      permissions: { connect: allPermissions },
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {
      name: 'Quản trị viên hệ thống',
      permissions: { set: allPermissions },
    },
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên hệ thống',
      permissions: { connect: allPermissions },
    },
  });

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

  const roleMap: Record<string, any> = {
    SUPER_ADMIN: superAdminRole,
    ADMIN: adminRole,
  };

  for (const r of cmsRoles) {
    const rolePerms: { id: number }[] = [];
    const postResId = resources['POST'].id;

    for (const action of r.permissions) {
      const perm = await prisma.permission.findUnique({
        where: {
          action_resourceId: {
            action: action === 'REJECT' ? 'UPDATE' : action,
            resourceId: postResId,
          },
        },
      });
      if (perm) rolePerms.push({ id: perm.id });
    }

    const createdRole = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, permissions: { set: rolePerms } },
      create: {
        code: r.code,
        name: r.name,
        permissions: { connect: rolePerms },
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
      name: 'Gốc hệ thống',
      order: 0,
      application: 'ADMIN_PORTAL',
    },
  });

  // Helper to link menu to resource permission
  const linkMenuPBAC = async (
    menuId: number,
    resCode: string,
    action: string = 'READ',
  ) => {
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
      name: 'Quản trị Hệ thống',
      icon: 'shield-checkmark-outline',
      service: 'USER_SERVICE',
      color: '#3b82f6',
      order: 1,
      res: 'USER',
    },
    {
      code: 'HRM_SERVICE_ROOT',
      name: 'Quản lý Nhân sự',
      icon: 'people-outline',
      service: 'HRM_SERVICE',
      color: '#10b981',
      order: 2,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'DOCUMENT_SERVICE_ROOT',
      name: 'Quản lý Văn bản',
      icon: 'document-text-outline',
      service: 'DOCUMENT_SERVICE',
      color: '#f59e0b',
      order: 3,
      res: 'DOC_INCOMING',
    },
    {
      code: 'CONTENT_SERVICE_ROOT',
      name: 'Quản lý Nội dung',
      icon: 'newspaper-outline',
      service: 'CONTENT_SERVICE',
      color: '#ec4899',
      order: 4,
      res: 'POST',
    },
    {
      code: 'WORKFLOW_SERVICE_ROOT',
      name: 'Quy trình Nghiệp vụ',
      icon: 'layers-outline',
      service: 'WORKFLOW_SERVICE',
      color: '#8b5cf6',
      order: 5,
      res: 'WORKFLOW',
    },
    {
      code: 'INTEGRATION_SERVICE_ROOT',
      name: 'Trung tâm Liên thông',
      icon: 'swap-horizontal-outline',
      service: 'INTEGRATION_SERVICE',
      color: '#0ea5e9',
      order: 6,
      res: 'INTEGRATION',
    },
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
        order: sys.order,
        service: sys.service,
      },
      create: {
        code: sys.code,
        name: sys.name,
        icon: sys.icon,
        iconColor: sys.color,
        order: sys.order,
        service: sys.service,
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
      name: 'Người dùng',
      route: 'users',
      icon: 'person-outline',
      order: 1,
      res: 'USER',
    },
    {
      code: 'ADMIN_ROLES',
      name: 'Vai trò & Quyền',
      route: 'roles',
      icon: 'lock-closed-outline',
      order: 2,
      res: 'ROLE',
    },
    {
      code: 'ADMIN_RESOURCES',
      name: 'Tài nguyên',
      route: 'resources',
      icon: 'shield-checkmark-outline',
      order: 3,
      res: 'RESOURCE',
    },
    {
      code: 'ADMIN_MENUS',
      name: 'Cấu hình Menu',
      route: 'menus',
      icon: 'list-outline',
      order: 4,
      res: 'MENU',
    },
    {
      code: 'ADMIN_ORGANIZATION',
      name: 'Đơn vị & Phòng ban',
      route: 'organization',
      icon: 'apartment',
      order: 5,
      res: 'ORGANIZATION',
    },
    {
      code: 'ADMIN_CATEGORIES',
      name: 'Danh mục hệ thống',
      route: 'categories',
      icon: 'cog-outline',
      order: 6,
      res: 'CATEGORY',
    },
    {
      code: 'ADMIN_SETTINGS',
      name: 'Thiết lập hệ thống',
      route: 'settings',
      icon: 'settings-outline',
      order: 7,
      res: 'SYSTEM',
    },
  ];

  for (const { res, ...m } of adminMenus) {
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
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // Admin Sub-menus for Settings
  const adminSettingsNode = await prisma.menu.findUnique({
    where: { code: 'ADMIN_SETTINGS' },
  });
  if (adminSettingsNode) {
    const adminSettingsSubMenus = [
      {
        code: 'ADMIN_SETTINGS_GENERAL',
        name: 'Thông số chung',
        route: 'settings',
        icon: 'options-outline',
        order: 1,
        res: 'SYSTEM',
      },
      {
        code: 'ADMIN_NOTIFICATIONS',
        name: 'Thông báo',
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
      name: 'Văn bản đến',
      route: 'incoming',
      icon: 'document-attach-outline',
      order: 1,
      res: 'DOC_INCOMING',
    },
    {
      code: 'DOC_MENU_OUTGOING',
      name: 'Văn bản đi',
      route: 'outgoing',
      icon: 'document-attach-outline',
      order: 2,
      res: 'DOC_OUTGOING',
    },
    {
      code: 'DOC_MENU_PROCESSING',
      name: 'Xử lý văn bản',
      route: 'processing',
      icon: 'document-text-outline',
      order: 3,
      res: 'DOC_PROCESSING',
    },
    {
      code: 'DOC_MENU_PUBLISH',
      name: 'Phát hành',
      route: 'publish',
      icon: 'globe-outline',
      order: 4,
      res: 'DOC_PUBLISH',
    },
    {
      code: 'DOC_MENU_TRANSPARENCY',
      name: 'Công khai văn bản',
      route: 'transparency',
      icon: 'folder-outline',
      order: 5,
      res: 'DOC_TRANSPARENCY',
    },
    {
      code: 'DOC_MENU_FINANCE',
      name: 'Công khai Tài chính',
      route: 'transparency/finance',
      icon: 'cash-outline',
      order: 6,
      res: 'DOC_TRANSPARENCY',
    },
    {
      code: 'DOC_MENU_CONSULTATION',
      name: 'Lấy ý kiến dự thảo',
      route: 'consultations',
      icon: 'people-outline',
      order: 7,
      res: 'DOC_CONSULTATION',
    },
    {
      code: 'DOC_MENU_FEEDBACKS',
      name: 'Duyệt Góp ý Công chúng',
      route: 'consultations/public-feedbacks',
      icon: 'megaphone-outline',
      order: 8,
      res: 'DOC_CONSULTATION',
    },
    {
      code: 'DOC_MENU_MINUTES',
      name: 'Biên bản cuộc họp',
      route: 'minutes',
      icon: 'list-outline',
      order: 9,
      res: 'DOC_MINUTES',
    },
    {
      code: 'DOC_MENU_CATEGORIES',
      name: 'Danh mục dùng chung',
      route: 'categories',
      icon: 'settings-outline',
      order: 10,
      res: 'DOC_CATEGORIES',
    },
    {
      code: 'DOC_MENU_PROCEDURES',
      name: 'Thủ tục hành chính',
      route: 'procedures',
      icon: 'briefcase-outline',
      order: 11,
      res: 'DOC_INCOMING',
    },
    {
      code: 'DOC_MENU_DOSSIERS',
      name: 'Hồ sơ một cửa',
      route: 'dossiers',
      icon: 'folder-open-outline',
      order: 12,
      res: 'DOC_INCOMING',
    },
    {
      code: 'DOC_MENU_CABINET',
      name: 'Tủ văn bản số',
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
          'HRM_MENU_LEAVE',
          'HRM_MENU_PAYROLL',
        ],
      },
    },
  });

  // 3. HRM Module
  const hrmMenus = [
    {
      code: 'HRM_MENU_EMPLOYEE_LIST',
      name: 'Danh sách cán bộ',
      route: 'employees',
      icon: 'people-outline',
      order: 1,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_PLANS',
      name: 'Chủ trương & Kế hoạch',
      route: 'work-plans/master-plans',
      icon: 'layers-outline',
      order: 2,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_TASKS',
      name: 'Phân công & Giao việc',
      route: 'work-plans/tasks',
      icon: 'list-outline',
      order: 3,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_CRITERIA',
      name: 'Khung tiêu chí đánh giá',
      route: 'performance/criteria',
      icon: 'document-text-outline',
      order: 4,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_KPI',
      name: 'Đánh giá Năng lực (KPI)',
      route: 'performance/evaluations',
      icon: 'settings-outline',
      order: 5,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_RANK_TEMPLATES',
      name: 'Cấu hình Ngạch',
      route: 'work-plans/rank-templates',
      icon: 'settings-outline',
      order: 6,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_MANUAL_SELECTOR',
      name: 'Gán việc theo Ngạch',
      route: 'work-plans/manual-selector',
      icon: 'list-outline',
      order: 7,
      res: 'HRM_EMPLOYEE',
    },
    {
      code: 'HRM_MENU_NOTIFICATIONS',
      name: 'Thông báo',
      route: 'notifications',
      icon: 'notifications-outline',
      order: 8,
      res: 'HRM_EMPLOYEE',
    },
  ];

  for (const { res, ...m } of hrmMenus) {
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
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 4. Content Module
  const postMenus = [
    {
      code: 'CONTENT_MENU_POSTS',
      name: 'Danh sách bài viết',
      route: '',
      icon: 'newspaper-outline',
      order: 1,
      res: 'POST',
    },
    {
      code: 'CONTENT_MENU_CATEGORIES',
      name: 'Chuyên mục',
      route: 'categories',
      icon: 'list-outline',
      order: 2,
      res: 'POST_CATEGORY',
    },
    {
      code: 'CONTENT_MENU_PORTAL',
      name: 'Cấu hình Portal Menu',
      route: 'portal-menu',
      icon: 'menu-outline',
      order: 3,
      res: 'PORTAL_MENU',
    },
    {
      code: 'CONTENT_MENU_INTERACTIONS',
      name: 'Tương tác công dân',
      route: 'interactions',
      icon: 'chatbubbles-outline',
      order: 4,
      res: 'CITIZEN_INTERACTION',
    },
    {
      code: 'CONTENT_MENU_BANNERS',
      name: 'Banner & Quảng cáo',
      route: 'banners',
      icon: 'layers-outline',
      order: 5,
      res: 'BANNER',
    },
    {
      code: 'CONTENT_MENU_PORTAL_CONFIG',
      name: 'Cấu hình chung đơn vị',
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
        name: 'Kiểm duyệt bình luận',
        route: 'interactions/comments',
        icon: 'chatbox-outline',
        order: 1,
        res: 'CITIZEN_INTERACTION',
      },
      {
        code: 'CONTENT_MENU_QUESTIONS',
        name: 'Hỏi đáp công dân',
        route: 'interactions/questions',
        icon: 'help-circle-outline',
        order: 2,
        res: 'CITIZEN_INTERACTION',
      },
      {
        code: 'CONTENT_MENU_FEEDBACKS',
        name: 'Góp ý dự thảo',
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

  // 5. Integration Module
  const integrationMenus = [
    {
      code: 'INTEGRATION_MENU_CONFIG',
      name: 'Cấu hình kết nối',
      route: '',
      icon: 'options-outline',
      order: 1,
      res: 'INTEGRATION',
    },
    {
      code: 'INTEGRATION_MENU_LOGS',
      name: 'Nhật ký đồng bộ',
      route: 'logs',
      icon: 'list-outline',
      order: 2,
      res: 'INTEGRATION',
    },
  ];

  for (const { res, ...m } of integrationMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        parentId: serviceNodes['INTEGRATION_SERVICE'].id,
        order: m.order,
        route: m.route,
        icon: m.icon,
      },
      create: {
        ...m,
        parentId: serviceNodes['INTEGRATION_SERVICE'].id,
        application: 'ADMIN_PORTAL',
        service: 'INTEGRATION_SERVICE',
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
      fullName: 'Nguyễn Văn Biên Tập',
      role: 'AUTHOR',
    },
    {
      email: 'reviewer@daklak.gov.vn',
      username: 'reviewer',
      fullName: 'Lê Văn Thẩm Định',
      role: 'REVIEWER',
    },
    {
      email: 'approver@daklak.gov.vn',
      username: 'approver',
      fullName: 'Phạm Phê Duyệt',
      role: 'REVIEWER',
    },
    {
      email: 'publisher@daklak.gov.vn',
      username: 'publisher',
      fullName: 'Trần Xuất Bản',
      role: 'PUBLISHER',
    },
    {
      email: 'trungthanh@daklak.gov.vn',
      username: 'trungthanh',
      fullName: 'Trần Trung Thành',
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
  console.log('📦 Seeding Job Titles...');
  const jobTitlesData = [
    {
      code: 'CHU_TICH',
      name: 'Chủ tịch',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHU_TICH',
      name: 'Phó Chủ tịch',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'GIAM_DOC',
      name: 'Giám đốc',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_GIAM_DOC',
      name: 'Phó Giám đốc',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'TRUONG_PHONG',
      name: 'Trưởng phòng',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_PHONG',
      name: 'Phó Trưởng phòng',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'CHANH_VAN_PHONG',
      name: 'Chánh Văn phòng',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHANH_VAN_PHONG',
      name: 'Phó Chánh Văn phòng',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'CHANH_THANH_TRA',
      name: 'Chánh Thanh tra',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_CHANH_THANH_TRA',
      name: 'Phó Chánh Thanh tra',
      category: 'MANAGER',
      rank: 2,
      type: 'GOVERNMENT',
    },
    {
      code: 'THANH_TRA_VIEN',
      name: 'Thanh tra viên',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'THANH_TRA_VIEN_CHINH',
      name: 'Thanh tra viên chính',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'THANH_TRA_VIEN_CAO_CAP',
      name: 'Thanh tra viên cao cấp',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'UY_VIEN_UBND',
      name: 'Ủy viên UBND',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'SPECIALIST',
      name: 'Chuyên viên',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'SENIOR_SPECIALIST',
      name: 'Chuyên viên cao cấp',
      category: 'STAFF',
      rank: 1,
      type: 'RANK',
    },
    {
      code: 'PRINCIPAL_SPECIALIST',
      name: 'Chuyên viên chính',
      category: 'STAFF',
      rank: 2,
      type: 'RANK',
    },
    {
      code: 'OFFICER',
      name: 'Cán sự',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'KE_TOAN',
      name: 'Kế toán',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'VAN_THU',
      name: 'Văn thư',
      category: 'STAFF',
      rank: 4,
      type: 'RANK',
    },
    {
      code: 'VIEN_CHUC',
      name: 'Viên chức',
      category: 'STAFF',
      rank: 3,
      type: 'RANK',
    },
    {
      code: 'NHAN_VIEN',
      name: 'Nhân viên',
      category: 'SUPPORT',
      rank: 5,
      type: 'RANK',
    },
    {
      code: 'BAO_VE',
      name: 'Bảo vệ',
      category: 'SUPPORT',
      rank: 6,
      type: 'RANK',
    },
    {
      code: 'CONG_CHUC_PHU_TRACH',
      name: 'Công chức phụ trách',
      category: 'STAFF',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'CAN_BO_PHU_TRACH',
      name: 'Cán bộ phụ trách',
      category: 'STAFF',
      rank: 3,
      type: 'GOVERNMENT',
    },
    {
      code: 'BI_THU_DANG_BO',
      name: 'Bí thư Đảng bộ',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU_DANG_BO',
      name: 'Phó Bí thư Đảng bộ',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'BI_THU_CHI_BO',
      name: 'Bí thư Chi bộ',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU_CHI_BO',
      name: 'Phó Bí thư Chi bộ',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'DANG_UY_VIEN',
      name: 'Đảng ủy viên',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'PARTY',
    },
    {
      code: 'CHI_UY_VIEN',
      name: 'Chi ủy viên',
      category: 'EXECUTIVE',
      rank: 3,
      type: 'PARTY',
    },
    {
      code: 'BI_THU',
      name: 'Bí thư',
      category: 'EXECUTIVE',
      rank: 1,
      type: 'PARTY',
    },
    {
      code: 'PHO_BI_THU',
      name: 'Phó Bí thư',
      category: 'EXECUTIVE',
      rank: 2,
      type: 'PARTY',
    },
    {
      code: 'TRUONG_BAN',
      name: 'Trưởng ban',
      category: 'MANAGER',
      rank: 1,
      type: 'GOVERNMENT',
    },
    {
      code: 'PHO_TRUONG_BAN',
      name: 'Phó Trưởng ban',
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
  console.log('📦 Cleaning and linking Job Titles to Unit Types...');
  await prisma.unitTypeJobTemplate.deleteMany({});

  const links = [
    {
      jt: 'CHU_TICH',
      types: [
        'UBND_TINH',
        'UBND_HUYEN',
        'UBND_XA',
        'HDND_TINH',
        'HDND_HUYEN',
        'HDND_XA',
      ],
    },
    {
      jt: 'PHO_CHU_TICH',
      types: [
        'UBND_TINH',
        'UBND_HUYEN',
        'UBND_XA',
        'HDND_TINH',
        'HDND_HUYEN',
        'HDND_XA',
      ],
    },
    { jt: 'UY_VIEN_UBND', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA'] },
    { jt: 'GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    {
      jt: 'TRUONG_PHONG',
      types: [
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    {
      jt: 'PHO_PHONG',
      types: [
        'PHONG_BAN_HUYEN',
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
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
      ],
    },
    {
      jt: 'SENIOR_SPECIALIST',
      types: ['PHONG_BAN_HUYEN', 'PHONG_BAN_SO', 'VAN_PHONG', 'CHI_CUC'],
    },
    {
      jt: 'PRINCIPAL_SPECIALIST',
      types: ['PHONG_BAN_HUYEN', 'PHONG_BAN_SO', 'VAN_PHONG', 'CHI_CUC'],
    },
    {
      jt: 'OFFICER',
      types: [
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'STAFF',
      types: [
        'PHONG_BAN_HUYEN',
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
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'DVSN',
        'TRUNG_TAM',
      ],
    },
    {
      jt: 'CAN_BO_PHU_TRACH',
      types: [
        'PHONG_BAN_HUYEN',
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
        'UBND_HUYEN',
        'UBND_XA',
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
        'UBND_HUYEN',
        'UBND_XA',
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
        'UBND_HUYEN',
        'UBND_XA',
        'DVSN',
        'CHI_CUC',
      ],
    },
    {
      jt: 'BI_THU_CHI_BO',
      types: [
        'CQ_DANG',
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
        'UBND_HUYEN',
        'UBND_XA',
      ],
    },
    {
      jt: 'PHO_BI_THU_CHI_BO',
      types: [
        'CQ_DANG',
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
        'UBND_HUYEN',
        'UBND_XA',
      ],
    },
    {
      jt: 'CHI_UY_VIEN',
      types: [
        'CQ_DANG',
        'PHONG_BAN_HUYEN',
        'PHONG_BAN_SO',
        'VAN_PHONG',
        'THANH_TRA',
        'DVSN',
        'TRUNG_TAM',
        'CHI_CUC',
        'SO_NGANH',
        'UBND_TINH',
        'UBND_HUYEN',
        'UBND_XA',
      ],
    },
    { jt: 'BI_THU', types: ['CQ_DANG'] },
    { jt: 'PHO_BI_THU', types: ['CQ_DANG'] },
    { jt: 'TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
    { jt: 'PHO_TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
  ];

  for (const link of links) {
    const jobTitle = await prisma.jobTitle.findUnique({
      where: { code: link.jt },
    });
    if (jobTitle) {
      for (const typeCode of link.types) {
        const typeId = unitTypeMap[typeCode]?.id;
        if (typeId) {
          await prisma.unitTypeJobTemplate.upsert({
            where: {
              unitTypeId_jobTitleId: {
                unitTypeId: typeId,
                jobTitleId: jobTitle.id,
              },
            },
            update: {},
            create: { unitTypeId: typeId, jobTitleId: jobTitle.id },
          });
        }
      }
    }
  }

  // ==========================================================
  // 8. ORGANIZATIONS (DAK LAK PROVINCE)
  // ==========================================================
  console.log('📦 Seeding Organization Units...');
  const ubndTinhTypeId = unitTypeMap['UBND_TINH'].id;
  const ubndHuyenTypeId = unitTypeMap['UBND_HUYEN'].id;
  const ubndXaTypeId = unitTypeMap['UBND_XA'].id;
  const soTypeId = unitTypeMap['SO_NGANH'].id;
  const phongTypeId = unitTypeMap['PHONG_BAN_HUYEN'].id;
  const dvsnTypeId = unitTypeMap['DVSN'].id;
  const trungTamTypeId = unitTypeMap['TRUNG_TAM'].id;

  const province = await prisma.organizationUnit.upsert({
    where: { code: 'H15' },
    update: { name: 'UBND Tỉnh Đắk Lắk', typeId: ubndTinhTypeId },
    create: {
      code: 'H15',
      name: 'UBND Tỉnh Đắk Lắk',
      typeId: ubndTinhTypeId,
      shortName: 'UBND Tỉnh',
    },
  });

  const depts = [
    {
      code: 'H15.07',
      name: 'Sở Khoa học và Công nghệ',
      shortName: 'Sở KH&CN',
    },
    { code: 'SO_GTVT', name: 'Sở Giao thông vận tải', shortName: 'Sở GTVT' },
    { code: 'SO_YTE', name: 'Sở Y tế', shortName: 'Sở Y tế' },
    { code: 'SO_GDDT', name: 'Sở Giáo dục và Đào tạo', shortName: 'Sở GD&ĐT' },
    { code: 'SO_TC', name: 'Sở Tài chính', shortName: 'Sở Tài chính' },
    { code: 'SO_KHDT', name: 'Sở Kế hoạch và Đầu tư', shortName: 'Sở KH&ĐT' },
    { code: 'SO_NV', name: 'Sở Nội vụ', shortName: 'Sở Nội vụ' },
    { code: 'SO_XD', name: 'Sở Xây dựng', shortName: 'Sở Xây dựng' },
    { code: 'SO_TP', name: 'Sở Tư pháp', shortName: 'Sở Tư pháp' },
    {
      code: 'SO_VHTT',
      name: 'Sở Văn hóa - Thể thao và Du lịch',
      shortName: 'Sở VHTTDL',
    },
    { code: 'SO_CT', name: 'Sở Công thương', shortName: 'Sở Công thương' },
    {
      code: 'SO_NN',
      name: 'Sở Nông nghiệp và Phát triển nông thôn',
      shortName: 'Sở NN&PTNT',
    },
    { code: 'SO_DT', name: 'Sở Dân tộc và Tôn giáo', shortName: 'Sở Dân tộc' },
    { code: 'TT_TINH', name: 'Thanh tra Tỉnh', shortName: 'Thanh tra Tỉnh' },
    { code: 'VP_UBND', name: 'Văn phòng UBND tỉnh', shortName: 'VP UBND' },
  ];

  for (const d of depts) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: soTypeId },
      create: { ...d, parentId: province.id, typeId: soTypeId },
    });
  }

  // Thêm ví dụ UBND Xã (Trực thuộc Tỉnh theo mô hình 2 cấp)
  await prisma.organizationUnit.upsert({
    where: { code: 'UBND_XA_TAN_LOI' },
    update: { parentId: province.id, typeId: ubndXaTypeId },
    create: {
      code: 'UBND_XA_TAN_LOI',
      name: 'UBND Phường Tân Lợi',
      parentId: province.id,
      typeId: ubndXaTypeId,
    },
  });
  await prisma.organizationUnit.upsert({
    where: { code: 'UBND_XA_TAN_LAP' },
    update: { parentId: province.id, typeId: ubndXaTypeId },
    create: {
      code: 'UBND_XA_TAN_LAP',
      name: 'UBND Phường Tân Lập',
      parentId: province.id,
      typeId: ubndXaTypeId,
    },
  });
  await prisma.organizationUnit.upsert({
    where: { code: 'UBND_XA_TAN_AN' },
    update: { parentId: province.id, typeId: ubndXaTypeId },
    create: {
      code: 'UBND_XA_TAN_AN',
      name: 'UBND Phường Tân An',
      parentId: province.id,
      typeId: ubndXaTypeId,
    },
  });
  await prisma.organizationUnit.upsert({
    where: { code: 'UBND_XA_THANH_NHAT' },
    update: { parentId: province.id, typeId: ubndXaTypeId },
    create: {
      code: 'UBND_XA_THANH_NHAT',
      name: 'UBND Phường Thành Nhất',
      parentId: province.id,
      typeId: ubndXaTypeId,
    },
  });
  await prisma.organizationUnit.upsert({
    where: { code: 'UBND_XA_HOA_PHU' },
    update: { parentId: province.id, typeId: ubndXaTypeId },
    create: {
      code: 'UBND_XA_HOA_PHU',
      name: 'UBND Xã Hòa Phú',
      parentId: province.id,
      typeId: ubndXaTypeId,
    },
  });
  await prisma.organizationUnit.upsert({
    where: { code: 'UBND_XA_EA_KAO' },
    update: { parentId: province.id, typeId: ubndXaTypeId },
    create: {
      code: 'UBND_XA_EA_KAO',
      name: 'UBND Phường Ea Kao',
      parentId: province.id,
      typeId: ubndXaTypeId,
    },
  });

  // Thêm Đơn vị sự nghiệp tiêu biểu
  const soKhcn = await prisma.organizationUnit.findUnique({
    where: { code: 'H15.07' },
  });
  if (soKhcn) {
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.01' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.01',
        name: 'Trung tâm Đổi mới Sáng tạo',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.04' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.04',
        name: 'Trung tâm Giám sát, Điều hành Đô thị Thông minh (IOC)',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.02' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.02',
        name: 'Trung tâm Kỹ thuật Tiêu chuẩn - Đo lường - Chất lượng',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
    await prisma.organizationUnit.upsert({
      where: { code: 'H15.07.03' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: {
        code: 'H15.07.03',
        name: 'Trung tâm Thông tin - Ứng dụng Khoa học và Công nghệ',
        parentId: soKhcn.id,
        typeId: trungTamTypeId,
      },
    });
  }

  console.log('🎉 COMPREHENSIVE E-GOV SEED COMPLETED');
  console.log(`👉 SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);

  console.log('📦 Seeding Departments for Organizations...');

  // helper tạo phòng ban
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
  // 1. SỞ KHOA HỌC & CÔNG NGHỆ
  // ==========================
  await createDept('H15.07', {
    code: 'H15.07.VP',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07', {
    code: 'H15.07.TT',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.07', {
    code: 'H15.07.KHTC',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.QLKH',
    name: 'Phòng Quản lý Khoa học',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.CDS',
    name: 'Phòng Chuyển đổi số',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.QLCN',
    name: 'Phòng Quản lý Công nghệ và Đổi mới sáng tạo',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.TDC',
    name: 'Phòng Quản lý Tiêu chuẩn - Đo lường - Chất lượng',
    typeCode: 'PHONG_BAN_SO',
  });

  // Các phòng thuộc Trung tâm Đổi mới Sáng tạo
  await createDept('H15.07.01', {
    code: 'H15.07.01.HC',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07.01', {
    code: 'H15.07.01.UT',
    name: 'Phòng Ươm tạo và Phát triển',
    typeCode: 'PHONG_BAN_SO',
  });

  // Các phòng thuộc Trung tâm IOC
  await createDept('H15.07.04', {
    code: 'H15.07.04.HC',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.DL',
    name: 'Phòng Khai thác và Quản lý dữ liệu',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.HT',
    name: 'Phòng Hạ tầng - Đô thị thông minh',
    typeCode: 'PHONG_BAN_SO',
  });

  // Các phòng thuộc Trung tâm Kỹ thuật Tiêu chuẩn - Đo lường - Chất lượng
  await createDept('H15.07.02', {
    code: 'H15.07.02.HC',
    name: 'Phòng Hành chính - Tổ chức',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.DL',
    name: 'Phòng Đo lường',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.TN',
    name: 'Phòng Thử nghiệm',
    typeCode: 'PHONG_BAN_SO',
  });

  // Các phòng thuộc Trung tâm Thông tin - Ứng dụng Khoa học và Công nghệ
  await createDept('H15.07.03', {
    code: 'H15.07.03.HC',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.TT',
    name: 'Phòng Thông tin KH&CN',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.UD',
    name: 'Phòng Ứng dụng KH&CN',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.DV',
    name: 'Phòng Dịch vụ KH&CN',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.TN',
    name: 'Trại Thực nghiệm KH&CN',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 2. SỞ Y TẾ
  // ==========================
  await createDept('SO_YTE', {
    code: 'SO_YTE_VP',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_TT',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_KHTC',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_NVY',
    name: 'Phòng Nghiệp vụ Y',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_YTE', {
    code: 'SO_YTE_DUOC',
    name: 'Phòng Quản lý Dược',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 3. SỞ GIÁO DỤC
  // ==========================
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_VP',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_TT',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_KHTC',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_TCCB',
    name: 'Phòng Tổ chức Cán bộ',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_GDDT', {
    code: 'SO_GDDT_GDTRH',
    name: 'Phòng Giáo dục Trung học',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 4. SỞ TÀI CHÍNH
  // ==========================
  await createDept('SO_TC', {
    code: 'SO_TC_VP',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('SO_TC', {
    code: 'SO_TC_TT',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('SO_TC', {
    code: 'SO_TC_NS',
    name: 'Phòng Ngân sách',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('SO_TC', {
    code: 'SO_TC_HCSN',
    name: 'Phòng Hành chính sự nghiệp',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================================================
  // 9. JOB POSITIONS
  // ==========================================================
  console.log('📦 Seeding Job Positions & Leaders (April 2026)...');

  const assignLeader = async (
    email: string,
    username: string,
    fullName: string,
    unitCode: string,
    jobTitleCode: string,
    isUnitLeader: boolean,
  ) => {
    // We assume DEFAULT_PASSWORD is still in scope
    const user = await prisma.user.upsert({
      where: { email },
      update: { fullName },
      create: {
        email,
        username,
        fullName,
        // Default role for new users created this way
        roles: { connect: [{ id: roleMap['AUTHOR']?.id || 1 }] },
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
        where: { userId: user.id, unitId: unit.id, jobTitleId: jobTitle.id },
      });
      if (!existingPosition) {
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
          `✅ Created job position for ${fullName} at ${unit.name} (${jobTitle.name})`,
        );
      }
    }
  };

  // 1. UBND Tỉnh Đắk Lắk
  await assignLeader(
    'dohuuhuy@daklak.gov.vn',
    'dohuuhuy',
    'Đỗ Hữu Huy',
    'H15',
    'CHU_TICH',
    true,
  );
  // 2. Sở Nội vụ
  await assignLeader(
    'truongngoctuan@daklak.gov.vn',
    'truongngoctuan',
    'Trương Ngọc Tuấn',
    'SO_NV',
    'GIAM_DOC',
    true,
  );
  // 3. Sở Khoa học & Công nghệ
  await assignLeader(
    'buithanhtoan@daklak.gov.vn',
    'buithanhtoan',
    'Bùi Thanh Toàn',
    'H15.07',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'phamgiaviet@daklak.gov.vn',
    'phamgiaviet',
    'Phạm Gia Việt',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  await assignLeader(
    'ralantruongthanhha@daklak.gov.vn',
    'ralantruongthanhha',
    'Ra Lan Trương Thanh Hà',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  await assignLeader(
    'tranvanson@daklak.gov.vn',
    'tranvanson',
    'Trần Văn Sơn',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  await assignLeader(
    'lamvumyhanh@daklak.gov.vn',
    'lamvumyhanh',
    'Lâm Vũ Mỹ Hạnh',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
  );
  // Bí thư Đảng bộ thường là Giám đốc
  await assignLeader(
    'buithanhtoan@daklak.gov.vn',
    'buithanhtoan',
    'Bùi Thanh Toàn',
    'H15.07',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'phamgiaviet@daklak.gov.vn',
    'phamgiaviet',
    'Phạm Gia Việt',
    'H15.07',
    'PHO_BI_THU_DANG_BO',
    true,
  );

  // Lãnh đạo các phòng ban Sở KHCN
  await assignLeader(
    'nguyenvana@daklak.gov.vn',
    'nguyenvana',
    'Nguyễn Văn A',
    'H15.07.VP',
    'CHANH_VAN_PHONG',
    true,
  );
  await assignLeader(
    'lethib@daklak.gov.vn',
    'lethib',
    'Lê Thị B',
    'H15.07.KHTC',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'tranvanc@daklak.gov.vn',
    'tranvanc',
    'Trần Văn C',
    'H15.07.QLKH',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'phamthid@daklak.gov.vn',
    'phamthid',
    'Phạm Thị D',
    'H15.07.CDS',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'hoangvane@daklak.gov.vn',
    'hoangvane',
    'Hoàng Văn E',
    'H15.07.QLCN',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'vuthif@daklak.gov.vn',
    'vuthif',
    'Vũ Thị F',
    'H15.07.TDC',
    'TRUONG_PHONG',
    true,
  );

  // Lãnh đạo các Trung tâm thuộc Sở KHCN
  await assignLeader(
    'dovang@daklak.gov.vn',
    'dovang',
    'Đỗ Văn G',
    'H15.07.01',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'ngothih@daklak.gov.vn',
    'ngothih',
    'Ngô Thị H',
    'H15.07.04',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'lyvani@daklak.gov.vn',
    'lyvani',
    'Lý Văn I',
    'H15.07.02',
    'GIAM_DOC',
    true,
  );

  // Lãnh đạo các phòng thuộc Trung tâm
  await assignLeader(
    'truongphonghc_dmsm@daklak.gov.vn',
    'truongphonghc_dmsm',
    'Hoàng Văn HC',
    'H15.07.01.HC',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongut_dmsm@daklak.gov.vn',
    'truongphongut_dmsm',
    'Lê Thị UT',
    'H15.07.01.UT',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphonghc_ioc@daklak.gov.vn',
    'truongphonghc_ioc',
    'Trần Văn HC',
    'H15.07.04.HC',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongcn_ioc@daklak.gov.vn',
    'truongphongcn_ioc',
    'Phạm Thị CN',
    'H15.07.04.CN',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphonghc_kttdc@daklak.gov.vn',
    'truongphonghc_kttdc',
    'Nguyễn Văn HC',
    'H15.07.02.HC',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongdl_kttdc@daklak.gov.vn',
    'truongphongdl_kttdc',
    'Đinh Thị DL',
    'H15.07.02.DL',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongtn_kttdc@daklak.gov.vn',
    'truongphongtn_kttdc',
    'Vũ Văn TN',
    'H15.07.02.TN',
    'TRUONG_PHONG',
    true,
  );

  // Thêm một số Phó Trưởng phòng (Ví dụ)
  await assignLeader(
    'phochvp_khcn@daklak.gov.vn',
    'phochvp_khcn',
    'Trương Văn Phó 1',
    'H15.07.VP',
    'PHO_CHANH_VAN_PHONG',
    false,
  );
  await assignLeader(
    'photp_khtc_khcn@daklak.gov.vn',
    'photp_khtc_khcn',
    'Ngô Thị Phó 2',
    'H15.07.KHTC',
    'PHO_TRUONG_PHONG',
    false,
  );

  // 4. Sở Tài chính
  await assignLeader(
    'tranvantan@daklak.gov.vn',
    'tranvantan',
    'Trần Văn Tân',
    'SO_TC',
    'GIAM_DOC',
    true,
  );
  // 5. Existing test user
  await assignLeader(
    'trungthanh@daklak.gov.vn',
    'trungthanh',
    'Trần Trung Thành',
    'H15.07',
    'CONG_CHUC_PHU_TRACH',
    false,
  );
  // 6. Phường Tân Lập
  await assignLeader(
    'vuvanhung@daklak.gov.vn',
    'vuvanhung',
    'Vũ Văn Hưng',
    'UBND_XA_TAN_LAP',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'tranducnhat@daklak.gov.vn',
    'tranducnhat',
    'Trần Đức Nhật',
    'UBND_XA_TAN_LAP',
    'CHU_TICH',
    true,
  );
  // 7. Phường Tân An
  await assignLeader(
    'nguyenducvinh@daklak.gov.vn',
    'nguyenducvinh',
    'Nguyễn Đức Vinh',
    'UBND_XA_TAN_AN',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'phamtrungnghia@daklak.gov.vn',
    'phamtrungnghia',
    'Phạm Trung Nghĩa',
    'UBND_XA_TAN_AN',
    'CHU_TICH',
    true,
  );
  // 9. Các giám đốc Sở mới (cập nhật từ 2026)
  await assignLeader(
    'caodinhhuy@daklak.gov.vn',
    'caodinhhuy',
    'Cao Đình Huy',
    'SO_XD',
    'GIAM_DOC',
    true,
  );
  // 10. Các phường/xã còn lại
  await assignLeader(
    'nguyenthanhliem@daklak.gov.vn',
    'nguyenthanhliem',
    'Nguyễn Thanh Liêm',
    'UBND_XA_THANH_NHAT',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'nguyendinhtam@daklak.gov.vn',
    'nguyendinhtam',
    'Nguyễn Đình Tâm',
    'UBND_XA_THANH_NHAT',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    'phamtienhung@daklak.gov.vn',
    'phamtienhung',
    'Phạm Tiến Hưng',
    'UBND_XA_HOA_PHU',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'nguyenthehau@daklak.gov.vn',
    'nguyenthehau',
    'Nguyễn Thế Hậu',
    'UBND_XA_HOA_PHU',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    'danggiaduan@daklak.gov.vn',
    'danggiaduan',
    'Đặng Gia Duẩn',
    'UBND_XA_EA_KAO',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'ledaithang@daklak.gov.vn',
    'ledaithang',
    'Lê Đại Thắng',
    'UBND_XA_EA_KAO',
    'CHU_TICH',
    true,
  );

  // ==========================
  // STAFFING (Định biên)
  // ==========================
  console.log('📦 Seeding Staffing (Định biên)...');
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

  // Sở KHCN
  await setStaffing('H15.07', 'GIAM_DOC', 1);
  await setStaffing('H15.07', 'PHO_GIAM_DOC', 4);

  // Các phòng ban thuộc Sở
  await setStaffing('H15.07.VP', 'CHANH_VAN_PHONG', 1);
  await setStaffing('H15.07.VP', 'PHO_CHANH_VAN_PHONG', 2);
  await setStaffing('H15.07.VP', 'SPECIALIST', 5);

  const phongBanCodes = [
    'H15.07.KHTC',
    'H15.07.QLKH',
    'H15.07.CDS',
    'H15.07.QLCN',
    'H15.07.TDC',
  ];
  for (const code of phongBanCodes) {
    await setStaffing(code, 'TRUONG_PHONG', 1);
    await setStaffing(code, 'PHO_TRUONG_PHONG', 2);
    await setStaffing(code, 'SPECIALIST', 4);
  }

  // Các Trung tâm
  const trungTamCodes = ['H15.07.01', 'H15.07.04', 'H15.07.02'];
  for (const code of trungTamCodes) {
    await setStaffing(code, 'GIAM_DOC', 1);
    await setStaffing(code, 'PHO_GIAM_DOC', 2);
  }

  // Các phòng thuộc Trung tâm
  const phongTrungTamCodes = [
    'H15.07.01.HC',
    'H15.07.01.UT',
    'H15.07.04.HC',
    'H15.07.04.CN',
    'H15.07.02.HC',
    'H15.07.02.DL',
    'H15.07.02.TN',
  ];
  for (const code of phongTrungTamCodes) {
    await setStaffing(code, 'TRUONG_PHONG', 1);
    await setStaffing(code, 'PHO_TRUONG_PHONG', 1);
    await setStaffing(code, 'SPECIALIST', 3);
  }

  // ==========================================================
  // 10. CATEGORIES (Danh mục dùng chung)
  // ==========================================================
  console.log('🔹 Seeding Categories...');

  await prisma.categoryGroup.upsert({
    where: { code: 'PLAN_FRAMEWORK' },
    update: { name: 'Mô hình Quản trị / Kế hoạch' },
    create: { code: 'PLAN_FRAMEWORK', name: 'Mô hình Quản trị / Kế hoạch' },
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



  console.log('✅ Categories seeded successfully!');


  // 4. Lấy tất cả các xã/phường (GEO_AREA) và toàn tỉnh Đắk Lắk (PROVINCE 47)
  const allGeoAreas = await prisma.category.findMany({
    where: {
      OR: [
        { group: 'GEO_AREA' },
        { code: '47', group: 'PROVINCE' }
      ]
    },
  });

  // 5. Lấy các lĩnh vực KHCN, TT&TT, CĐS và NGÂN SÁCH
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
      'H15.07': allDomainCodes,
      'H15.07.CDS': ['CHUYEN_DOI_SO', 'DU_LIEU_SO', 'KINH_TE_SO', 'AN_TOAN_THONG_TIN', 'HA_TANG_SO'],
      'H15.07.04': ['DU_LIEU_SO', 'HA_TANG_SO', 'THONG_TIN_TRUYEN_THONG', 'CHUYEN_DOI_SO'],
      'H15.07.03': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.KHTC': ['NGAN_SACH', 'H15.07'],
      'H15.07.VP': ['H15.07'],
      'H15.07.QLCN': ['H15.07'],
      'H15.07.QLKH': ['H15.07'],
      'H15.07.TCDLCL': ['H15.07'],
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

    console.log(`✅ Đã cập nhật ${allGeoAreas.length} Địa bàn (các xã, toàn tỉnh) cho ${soKhcnUnits.length} đơn vị KH&CN (Tổng: ${geoData.length} bản ghi)`);
    console.log(`✅ Đã phân bổ Lĩnh vực chuyên môn theo chức năng cho các đơn vị KH&CN (Tổng: ${domainData.length} bản ghi)`);

    // ----------------------------------------------------
    // SEED STAFFING SLOTS (Định biên chi tiết cho từng Slot)
    // ----------------------------------------------------
    const allStaffing = await prisma.organizationStaffing.findMany({
      where: { unitId: { in: soKhcnUnits.map(u => u.id) } },
      include: { jobTitle: true, unit: true }
    });

    const slotGeos: { slotId: number, geographicAreaId: number }[] = [];
    const slotDomains: { slotId: number, domainId: number }[] = [];
    const slotMonitored: { slotId: number, unitId: number }[] = [];

    const phongKHTC = soKhcnUnits.find(u => u.code === 'H15.07.KHTC');
    const phongCDS = soKhcnUnits.find(u => u.code === 'H15.07.CDS');
    const trungtamIOC = soKhcnUnits.find(u => u.code === 'H15.07.04');
    const phongQLCN = soKhcnUnits.find(u => u.code === 'H15.07.QLCN');
    const domainNS = techDomains.find(d => d.code === 'NGAN_SACH');
    const domainCDS = techDomains.find(d => d.code === 'CHUYEN_DOI_SO');

    const daklakGeo = allGeoAreas.find(g => g.code === '47');

    for (const staffing of allStaffing) {
      for (let i = 1; i <= staffing.quantity; i++) {
        // Tạo Slot
        const slot = await prisma.staffingSlot.upsert({
          where: { staffingId_slotOrder: { staffingId: staffing.id, slotOrder: i } },
          update: {},
          create: { staffingId: staffing.id, slotOrder: i },
        });

        // 1. Địa bàn: Gán mặc định Tỉnh Đắk Lắk (mã 47) hoặc tất cả xã phường tuỳ chọn, ở đây gán Đắk Lắk
        if (daklakGeo) {
          slotGeos.push({ slotId: slot.id, geographicAreaId: daklakGeo.id });
        }

        // 2. Lĩnh vực và Phòng ban theo dõi
        if (staffing.unit.code === 'H15.07') { // Lãnh đạo cấp Sở
          if (staffing.jobTitle.code === 'GIAM_DOC' && i === 1) {
            if (domainNS) slotDomains.push({ slotId: slot.id, domainId: domainNS.id });
            if (phongKHTC) slotMonitored.push({ slotId: slot.id, unitId: phongKHTC.id });
          } else if (staffing.jobTitle.code === 'PHO_GIAM_DOC') {
            if (i === 1) { // PGD 1 phụ trách CĐS
              if (domainCDS) slotDomains.push({ slotId: slot.id, domainId: domainCDS.id });
              if (phongCDS) slotMonitored.push({ slotId: slot.id, unitId: phongCDS.id });
              if (trungtamIOC) slotMonitored.push({ slotId: slot.id, unitId: trungtamIOC.id });
            }
            if (i === 2) { // PGD 2 phụ trách QLCN
              if (phongQLCN) slotMonitored.push({ slotId: slot.id, unitId: phongQLCN.id });
            }
          }
        } else {
          // Trưởng phòng / Phó trưởng phòng: Kế thừa lĩnh vực của đơn vị cha
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

    console.log(`✅ Đã phân bổ chi tiết Định biên (StaffingSlots) cho toàn Sở và các đơn vị trực thuộc (Slot domains: ${slotDomains.length}, Geos: ${slotGeos.length}, Monitored Units: ${slotMonitored.length})`);
  }

  // ==========================================================
  // PBAC SEED: SCOPES, POLICIES, ROLES & MAPPINGS
  // ==========================================================
  console.log('🔹 Seeding PBAC Scopes & Policies into SystemConfig...');
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

  console.log('🔹 Seeding PBAC Roles & RolePermissions...');
  const getPerms = async (specs: string[]) => {
    const all = await prisma.permission.findMany({ include: { resource: true } });
    if (specs.includes('ALL')) return all.map(p => ({ id: p.id }));
    const result: { id: number }[] = [];
    for (const spec of specs) {
      if (spec.endsWith('.*')) {
        const resCode = spec.split('.')[0];
        const matched = all.filter(p => p.resource.code === resCode);
        result.push(...matched.map(p => ({ id: p.id })));
      } else {
        const [resCode, actCode] = spec.split('.');
        const matched = all.find(p => p.resource.code === resCode && p.action === actCode);
        if (matched) result.push({ id: matched.id });
      }
    }
    return result;
  };

  const roleDefinitions = [
    { code: 'ADMIN', name: 'Quản trị hệ thống', scope: 'GLOBAL', perms: ['ALL'] },
    { code: 'LEADER', name: 'Lãnh đạo đơn vị', scope: 'ORGANIZATION', perms: ['DOCUMENT.*', 'PLAN.*', 'OBJECTIVE.*', 'TASK.*', 'KPI.*', 'REPORT.*'] },
    { code: 'MANAGER', name: 'Quản lý', scope: 'DEPARTMENT', perms: ['DOCUMENT.VIEW', 'DOCUMENT.PROCESS', 'DOCUMENT.ASSIGN', 'PLAN.VIEW', 'PLAN.UPDATE', 'OBJECTIVE.VIEW', 'OBJECTIVE.UPDATE', 'TASK.VIEW', 'TASK.CREATE', 'TASK.UPDATE', 'TASK.ASSIGN', 'TASK.COMPLETE', 'KPI.VIEW', 'REPORT.VIEW'] },
    { code: 'STAFF', name: 'Nhân viên', scope: 'SELF', perms: ['DOCUMENT.VIEW', 'DOCUMENT.PROCESS', 'PLAN.VIEW', 'OBJECTIVE.VIEW', 'TASK.VIEW', 'TASK.UPDATE', 'TASK.COMMENT', 'TASK.COMPLETE', 'KPI.VIEW'] },
    { code: 'SUPERVISOR', name: 'Giám sát', scope: 'DEPARTMENT', perms: ['DOCUMENT.VIEW', 'PLAN.VIEW', 'OBJECTIVE.VIEW', 'TASK.VIEW', 'KPI.VIEW', 'REPORT.VIEW'] }
  ];

  for (const rd of roleDefinitions) {
    const permConnect = await getPerms(rd.perms);
    await prisma.systemConfig.upsert({
      where: { key: `ROLE_SCOPE_${rd.code}` },
      update: { value: rd.scope },
      create: { key: `ROLE_SCOPE_${rd.code}`, value: rd.scope, description: `Scope for ${rd.code}` }
    });

    await prisma.role.upsert({
      where: { code: rd.code },
      update: {
        name: rd.name,
        permissions: { set: [], connect: permConnect }
      },
      create: {
        code: rd.code,
        name: rd.name,
        permissions: { connect: permConnect }
      }
    });
  }
  console.log('✅ Hoàn tất Seed PBAC Engine.');

  for (const rd of roleDefinitions) {
    const permConnect = await getPerms(rd.perms);
    await prisma.systemConfig.upsert({
      where: { key: `ROLE_SCOPE_${rd.code}` },
      update: { value: rd.scope },
      create: { key: `ROLE_SCOPE_${rd.code}`, value: rd.scope, description: `Scope for ${rd.code}` }
    });

    await prisma.role.upsert({
      where: { code: rd.code },
      update: {
        name: rd.name,
        permissions: { set: [], connect: permConnect }
      },
      create: {
        code: rd.code,
        name: rd.name,
        permissions: { connect: permConnect }
      }
    });
  }
  console.log('✅ Hoàn tất Seed PBAC Engine.');

  // ==========================================================
  // DÁN ĐOẠN CODE MỚI VÀO ĐÂY BẮT ĐẦU TỪ DÒNG NÀY
  // ==========================================================
  console.log('🔹 Mở rộng Policy PBAC cho hệ thống liên thông & HRM...');

  const extendedPbacPolicies = {
    ...pbacPolicies,
    'DOC_INCOMING.PROCESS': "ALLOW IF currentUserId IN resource.processingUsers OR currentDepartmentId == resource.processingDepartmentId",
    // ... (toàn bộ đoạn code tôi vừa cung cấp ở trên)

    // ==========================================================
    // KẾT THÚC ĐOẠN CODE MỚI
    // ==========================================================
  }
  console.log('🚀 READY FOR GRPC MICROSERVICES DEPLOYMENT!');
}


main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
