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
    { code: 'SYSTEM', name: 'Hệ thống', serviceCode: 'USER_SERVICE' },
    { code: 'USER', name: 'Quản lý Người dùng', serviceCode: 'USER_SERVICE' },
    { code: 'ROLE', name: 'Quản lý Vai trò', serviceCode: 'USER_SERVICE' },
    { code: 'RESOURCE', name: 'Quản lý Tài nguyên', serviceCode: 'USER_SERVICE' },
    { code: 'MENU', name: 'Quản lý Menu', serviceCode: 'USER_SERVICE' },
    { code: 'ORGANIZATION', name: 'Cây tổ chức', serviceCode: 'USER_SERVICE' },
    { code: 'CATEGORY', name: 'Danh mục hệ thống', serviceCode: 'USER_SERVICE' },
    { code: 'NOTIFICATION', name: 'Thông báo hệ thống', serviceCode: 'USER_SERVICE' },

    // Document Management
    { code: 'DOCUMENT', name: 'Quản lý Văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_INCOMING', name: 'Văn bản đến', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_OUTGOING', name: 'Văn bản đi', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_INTERNAL', name: 'Văn bản nội bộ', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_DRAFT', name: 'Dự thảo văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_TEMPLATE', name: 'Biểu mẫu văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_PUBLISH', name: 'Phát hành văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_PROCESSING', name: 'Xử lý văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_TRANSPARENCY', name: 'Công khai văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_CONSULTATION', name: 'Lấy ý kiến văn bản', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_MINUTES', name: 'Biên bản cuộc họp', serviceCode: 'DOCUMENT_SERVICE' },
    { code: 'DOC_CATEGORIES', name: 'Danh mục văn bản', serviceCode: 'DOCUMENT_SERVICE' },

    // HRM
    { code: 'HRM_EMPLOYEE', name: 'Quản lý Nhân sự', serviceCode: 'HRM_SERVICE' },

    // CMS
    { code: 'POST', name: 'Quản lý Bài viết', serviceCode: 'CONTENT_SERVICE' },
    { code: 'POST_CATEGORY', name: 'Quản lý Chuyên mục', serviceCode: 'CONTENT_SERVICE' },
    { code: 'BANNER', name: 'Quản lý Banner & Quảng cáo', serviceCode: 'CONTENT_SERVICE' },
    { code: 'PORTAL_MENU', name: 'Quản lý Portal Menu', serviceCode: 'CONTENT_SERVICE' },
    { code: 'CITIZEN_INTERACTION', name: 'Tương tác công dân', serviceCode: 'CONTENT_SERVICE' },

    // Integration & Workflow
    { code: 'INTEGRATION', name: 'Liên thông hệ thống', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'TASK', name: 'Công việc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'PROJECT', name: 'Dự án', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'PLAN', name: 'Kế hoạch công tác', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'WORKFLOW', name: 'Quy trình công việc', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'OBJECTIVE', name: 'Mục tiêu', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'KPI', name: 'KPI', serviceCode: 'WORKFLOW_SERVICE' },
    { code: 'REPORT', name: 'Báo cáo', serviceCode: 'WORKFLOW_SERVICE' },
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

    // --- TASK ROLES ---
    {
      group: 'TASK_ROLE',
      code: 'ASSIGNEE',
      order: 1,
      nameVi: 'Người xử lý chính',
      nameEn: 'Assignee',
    },
    {
      group: 'TASK_ROLE',
      code: 'OWNER',
      order: 2,
      nameVi: 'Người giao việc',
      nameEn: 'Owner',
    },
    {
      group: 'TASK_ROLE',
      code: 'APPROVER',
      order: 3,
      nameVi: 'Người theo dõi/Chỉ đạo',
      nameEn: 'Approver',
    },
    {
      group: 'TASK_ROLE',
      code: 'COORDINATOR',
      order: 4,
      nameVi: 'Người phối hợp',
      nameEn: 'Coordinator',
    },

    // --- TASK STATUS ---
    {
      group: 'TASK_STATUS',
      code: 'UNASSIGNED',
      order: 1,
      nameVi: 'Chưa giao',
      nameEn: 'Unassigned',
    },
    {
      group: 'TASK_STATUS',
      code: 'PENDING',
      order: 2,
      nameVi: 'Chờ xử lý',
      nameEn: 'Pending',
    },
    {
      group: 'TASK_STATUS',
      code: 'PROCESSING',
      order: 3,
      nameVi: 'Đang xử lý',
      nameEn: 'Processing',
    },
    {
      group: 'TASK_STATUS',
      code: 'DONE',
      order: 4,
      nameVi: 'Hoàn thành',
      nameEn: 'Done',
    },
    {
      group: 'TASK_STATUS',
      code: 'REJECTED',
      order: 5,
      nameVi: 'Từ chối',
      nameEn: 'Rejected',
    },
    {
      group: 'TASK_STATUS',
      code: 'RETURNED',
      order: 6,
      nameVi: 'Trả lại (Yêu cầu làm lại)',
      nameEn: 'Returned',
    },
    {
      group: 'TASK_STATUS',
      code: 'CANCELED',
      order: 7,
      nameVi: 'Hủy bỏ',
      nameEn: 'Canceled',
    },
    {
      group: 'TASK_STATUS',
      code: 'OVERDUE',
      order: 8,
      nameVi: 'Quá hạn',
      nameEn: 'Overdue',
    },

    {
      group: 'SYSTEM_ACTION',
      code: 'LOGIN',
      order: 1,
      nameVi: 'Đăng nhập',
      nameEn: 'Login',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'LOGOUT',
      order: 2,
      nameVi: 'Đăng xuất',
      nameEn: 'Logout',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'CREATE',
      order: 3,
      nameVi: 'Tạo mới',
      nameEn: 'Create',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'UPDATE',
      order: 4,
      nameVi: 'Cập nhật',
      nameEn: 'Update',
    },
    {
      group: 'SYSTEM_ACTION',
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

    {
      group: 'SYSTEM_ACTION',
      code: 'APPROVE',
      order: 6,
      nameVi: 'Phê duyệt',
      nameEn: 'Approve',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'REJECT',
      order: 7,
      nameVi: 'Từ chối',
      nameEn: 'Reject',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'PUBLISH',
      order: 8,
      nameVi: 'Xuất bản',
      nameEn: 'Publish',
    },
    {
      group: 'SYSTEM_ACTION',
      code: 'REQUEST_INFO',
      order: 9,
      nameVi: 'Yêu cầu bổ sung',
      nameEn: 'Request Info',
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


  // ==========================================================
  // 3.2 CATEGORY GROUPS — Phải seed TRƯỚC categories (FK constraint: group_code)
  // ==========================================================
  const groupLabels = [
    { code: 'STATUS', name: 'Trạng thái hệ thống' },
    { code: 'TASK_ROLE', name: 'Vai trò công việc' },
    { code: 'TASK_STATUS', name: 'Trạng thái công việc' },
    { code: 'SYSTEM_ACTION', name: 'Hành động hệ thống' },
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
    { code: 'BANNER_POSITION', name: 'Vị trí hiển thị Banner' },
    { code: 'font_family', name: 'Phông chữ giao diện (Portal)' },
    { code: 'border_radius', name: 'Độ bo góc khối (Portal)' },
    { code: 'AI_PROVIDER_TYPE', name: 'Nhà cung cấp AI (LLM)' },
    { code: 'TRANSLATION_SERVICE_TYPE', name: 'Dịch vụ Dịch thuật' },
    { code: 'UNIT_TYPE_CATEGORY', name: 'Phân loại tổ chức đơn vị' },
    { code: 'PLAN_FRAMEWORK', name: 'Mô hình Quản trị / Kế hoạch' },
  ];
  console.log('📦 Seeding Category Groups FIRST (FK dependency)...');
  for (const g of groupLabels) {
    await prisma.categoryGroup.upsert({
      where: { code: g.code },
      update: { name: g.name },
      create: g,
    });
  }
  console.log('✅ Category Groups seeded');

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
      where: { groupCode_code: { groupCode: cat.group, code: cat.code } },
      update: { order: cat.order },
      create: {
        groupCode: cat.group,
        code: cat.code,
        order: cat.order,
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
  // 3.1 UNIT TYPES (New Model)
  // ==========================================================

  console.log('📦 Seeding Unit Types...');
  const unitTypesData = [
    { code: 'CQ_TU', name: 'Cơ quan Trung ương', level: 1 },
    { code: 'UBND_TINH', name: 'UBND Cấp Tỉnh', level: 1 },
    { code: 'HDND_TINH', name: 'HĐND Cấp Tỉnh', level: 1 },
    { code: 'SO_NGANH', name: 'Sở, Ban, Ngành', level: 2 },
    { code: 'PHONG_BAN_SO', name: 'Phòng chuyên môn cấp Sở', level: 3 },
    { code: 'PHONG_BAN_TRUNG_TAM', name: 'Phòng chuyên môn cấp Trung tâm', level: 4 },
    { code: 'VAN_PHONG', name: 'Văn phòng', level: 3 },
    { code: 'THANH_TRA', name: 'Thanh tra', level: 3 },
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

  // Gán đầy đủ policies cho ADMIN role
  // Policy<->Role là many-to-many nên phải dùng findFirst/create + role.update connect
  const adminResourceCodes = ['USER', 'ROLE', 'RESOURCE', 'MENU', 'ORGANIZATION', 'CATEGORY', 'SYSTEM', 'NOTIFICATION', 'HRM_EMPLOYEE', 'DOCUMENT', 'DOC_INCOMING', 'DOC_OUTGOING', 'DOC_INTERNAL', 'DOC_PROCESSING', 'DOC_PUBLISH', 'DOC_TRANSPARENCY', 'DOC_CONSULTATION', 'DOC_MINUTES', 'DOC_CATEGORIES', 'POST', 'POST_CATEGORY', 'BANNER', 'PORTAL_MENU', 'CITIZEN_INTERACTION', 'WORKFLOW', 'TASK', 'PLAN', 'REPORT'];
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

  // --- TASK ROLES ---
  const taskRoles = [
    {
      code: 'LEADER',
      name: 'Lãnh đạo đơn vị (Giao việc)',
      permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'ASSIGN', 'COMPLETE', 'COMMENT', 'EVALUATE', 'APPROVE'],
    },
    {
      code: 'MANAGER',
      name: 'Quản lý cấp phòng (Giao việc)',
      permissions: ['CREATE', 'READ', 'UPDATE', 'VIEW', 'ASSIGN', 'COMPLETE'],
    },
    {
      code: 'STAFF',
      name: 'Chuyên viên / Nhân viên (Giao việc)',
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
          conditionString = 'user.isLeader == true'; // Cơ cấu tổ chức / Đơn vị trực thuộc
        } else if (r.code === 'MANAGER' && ['ASSIGN', 'COMPLETE'].includes(action)) {
          conditionString = 'user.isLeader == true'; // Cơ cấu tổ chức / Phòng ban
        } else if (r.code === 'STAFF' && ['UPDATE', 'COMMENT', 'COMPLETE'].includes(action)) {
          conditionString = 'currentUserId IN resource.assigneeIds'; // Người được giao / Cây nhiệm vụ
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
      name: 'Gốc hệ thống',
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
    await prisma.menu.update({
      where: { id: menuId },
      data: { linkedResourceCode: resCode }
    });
  };

  // --- SERVICE ROOTS ---
  const services = [
    {
      code: 'USER_SERVICE_ROOT',
      name: 'Quản trị Hệ thống',
      icon: 'settings-outline',
      service: 'USER_SERVICE',
      color: '#3b82f6',
      order: 1,
      res: 'USER',
      route: '/services/admin',
      description: 'Quản lý tài khoản, phân quyền (PBAC), tổ chức đơn vị và thiết lập hệ thống.',
    },
    {
      code: 'HRM_SERVICE_ROOT',
      name: 'Quản lý Nhân sự',
      icon: 'people-outline',
      service: 'HRM_SERVICE',
      color: '#10b981',
      order: 2,
      res: 'EMPLOYEE',
      route: '/services/hrm',
      description: 'Quản lý hồ sơ cán bộ công chức, viên chức, hợp đồng, lương và đánh giá.',
    },
    {
      code: 'DOCUMENT_SERVICE_ROOT',
      name: 'Quản lý Văn bản',
      icon: 'document-text-outline',
      service: 'DOCUMENT_SERVICE',
      color: '#f59e0b',
      order: 3,
      res: 'DOC_INCOMING',
      route: '/services/documents',
      description: 'Quản lý luân chuyển văn bản đến, văn bản đi, văn bản nội bộ.',
    },
    {
      code: 'CONTENT_SERVICE_ROOT',
      name: 'Quản lý Nội dung',
      icon: 'newspaper-outline',
      service: 'CONTENT_SERVICE',
      color: '#ec4899',
      order: 4,
      res: 'POST',
      route: '/services/posts',
      description: 'Quản lý bài viết, tin tức, chuyên mục trên Cổng thông tin điện tử.',
    },
    {
      code: 'WORKFLOW_SERVICE_ROOT',
      name: 'Trung tâm Tích hợp & Quy trình',
      icon: 'layers-outline',
      service: 'WORKFLOW_SERVICE',
      color: '#8b5cf6',
      order: 5,
      res: 'WORKFLOW',
      route: '/services/integration',
      description: 'Quản lý cấu hình quy trình động, liên thông và tích hợp dữ liệu.',
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
      name: 'Người dùng',
      route: 'users',
      icon: 'person-outline',
      order: 1,
      res: 'USER',
      action: 'UPDATE',
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
      name: 'Danh sách cán bộ',
      route: 'employees',
      icon: 'people-outline',
      order: 1,
      res: 'EMPLOYEE',
      action: 'VIEW',
    },
    {
      code: 'HRM_MENU_PLANS',
      name: 'Công việc & Kế hoạch',
      route: 'work-plans/master-plans',
      icon: 'layers-outline',
      order: 2,
      res: 'PLAN',
      action: 'VIEW',
    },
    {
      code: 'HRM_MENU_TASKS',
      name: 'Bảng việc cá nhân',
      route: 'work-plans/tasks',
      icon: 'briefcase-outline',
      order: 3,
      res: 'TASK',
      action: 'READ',
    },
    {
      code: 'HRM_MENU_CRITERIA',
      name: 'Khung tiêu chí KPI',
      route: 'work-plans/criteria',
      icon: 'settings-2-outline',
      order: 4,
      res: 'EVALUATION',
      action: 'READ',
    },

    {
      code: 'HRM_MENU_RANK_TEMPLATES',
      name: 'Cấu hình Ngạch',
      route: 'work-plans/rank-templates',
      icon: 'settings-outline',
      order: 6,
      res: 'EMPLOYEE',
      action: 'MANAGE',
    },
    {
      code: 'HRM_MENU_MANUAL_SELECTOR',
      name: 'Gán việc theo Ngạch',
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

  // 5. Workflow & Integration Module
  const workflowMenus = [
    {
      code: 'WORKFLOW_MENU_BUILDER',
      name: 'Trung tâm Liên thông',
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
  console.log('📦 Seeding Organization Units...');
  const ubndTinhTypeId = unitTypeMap['UBND_TINH'].id;
  const soTypeId = unitTypeMap['SO_NGANH'].id;
  const phongTypeId = unitTypeMap['PHONG_BAN_SO'].id; // fallback changed from HUYEN to SO
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
    { code: 'H15.08', name: 'Sở Giao thông vận tải', shortName: 'Sở GTVT' },
    { code: 'H15.09', name: 'Sở Y tế', shortName: 'Sở Y tế' },
    { code: 'H15.10', name: 'Sở Giáo dục và Đào tạo', shortName: 'Sở GD&ĐT' },
    { code: 'H15.11', name: 'Sở Tài chính', shortName: 'Sở Tài chính' },
    { code: 'H15.12', name: 'Sở Kế hoạch và Đầu tư', shortName: 'Sở KH&ĐT' },
    { code: 'H15.13', name: 'Sở Nội vụ', shortName: 'Sở Nội vụ' },
    { code: 'H15.14', name: 'Sở Xây dựng', shortName: 'Sở Xây dựng' },
    { code: 'H15.15', name: 'Sở Tư pháp', shortName: 'Sở Tư pháp' },
    {
      code: 'H15.16',
      name: 'Sở Văn hóa - Thể thao và Du lịch',
      shortName: 'Sở VHTTDL',
    },
    { code: 'H15.17', name: 'Sở Công thương', shortName: 'Sở Công thương' },
    {
      code: 'H15.18',
      name: 'Sở Nông nghiệp và Phát triển nông thôn',
      shortName: 'Sở NN&PTNT',
    },
    { code: 'H15.19', name: 'Sở Dân tộc và Tôn giáo', shortName: 'Sở Dân tộc' },
    { code: 'H15.20', name: 'Thanh tra Tỉnh', shortName: 'Thanh tra Tỉnh' },
    { code: 'H15.01', name: 'Văn phòng UBND tỉnh', shortName: 'VP UBND' },
  ];

  for (const d of depts) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: soTypeId },
      create: { ...d, parentId: province.id, typeId: soTypeId },
    });
  }

  // Thêm ví dụ UBND Xã (Trực thuộc Tỉnh theo mô hình 2 cấp)







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
    code: 'H15.07.05',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.07', {
    code: 'H15.07.06',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.07', {
    code: 'H15.07.07',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.08',
    name: 'Phòng Quản lý Khoa học',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.09',
    name: 'Phòng Chuyển đổi số',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.10',
    name: 'Phòng Quản lý Công nghệ và Đổi mới sáng tạo',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.07', {
    code: 'H15.07.11',
    name: 'Phòng Quản lý Tiêu chuẩn - Đo lường - Chất lượng',
    typeCode: 'PHONG_BAN_SO',
  });

  // Các phòng thuộc Trung tâm Đổi mới Sáng tạo
  await createDept('H15.07.01', {
    code: 'H15.07.01.01',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.01', {
    code: 'H15.07.01.02',
    name: 'Phòng Ươm tạo và Phát triển',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // Các phòng thuộc Trung tâm IOC
  await createDept('H15.07.04', {
    code: 'H15.07.04.01',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.02',
    name: 'Phòng Khai thác và Quản lý dữ liệu',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.04', {
    code: 'H15.07.04.03',
    name: 'Phòng Hạ tầng - Đô thị thông minh',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // Các phòng thuộc Trung tâm Kỹ thuật Tiêu chuẩn - Đo lường - Chất lượng
  await createDept('H15.07.02', {
    code: 'H15.07.02.01',
    name: 'Phòng Hành chính - Tổ chức',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.02',
    name: 'Phòng Đo lường',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.02', {
    code: 'H15.07.02.03',
    name: 'Phòng Thử nghiệm',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // Các phòng thuộc Trung tâm Thông tin - Ứng dụng Khoa học và Công nghệ
  await createDept('H15.07.03', {
    code: 'H15.07.03.01',
    name: 'Phòng Hành chính - Tổng hợp',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.02',
    name: 'Phòng Thông tin KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.03',
    name: 'Phòng Ứng dụng KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.04',
    name: 'Phòng Dịch vụ KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });
  await createDept('H15.07.03', {
    code: 'H15.07.03.05',
    name: 'Trại Thực nghiệm KH&CN',
    typeCode: 'PHONG_BAN_TRUNG_TAM',
  });

  // ==========================
  // 2. SỞ Y TẾ
  // ==========================
  await createDept('H15.09', {
    code: 'H15.09.01',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.09', {
    code: 'H15.09.02',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.09', {
    code: 'H15.09.03',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.09', {
    code: 'H15.09.04',
    name: 'Phòng Nghiệp vụ Y',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.09', {
    code: 'H15.09.05',
    name: 'Phòng Quản lý Dược',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 3. SỞ GIÁO DỤC VÀ ĐÀO TẠO
  // ==========================
  await createDept('H15.10', {
    code: 'H15.10.01',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.10', {
    code: 'H15.10.02',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.10', {
    code: 'H15.10.03',
    name: 'Phòng Kế hoạch - Tài chính',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.10', {
    code: 'H15.10.04',
    name: 'Phòng Tổ chức Cán bộ',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.10', {
    code: 'H15.10.05',
    name: 'Phòng Giáo dục Trung học',
    typeCode: 'PHONG_BAN_SO',
  });

  // ==========================
  // 4. SỞ TÀI CHÍNH
  // ==========================
  await createDept('H15.11', {
    code: 'H15.11.01',
    name: 'Văn phòng Sở',
    typeCode: 'VAN_PHONG',
  });
  await createDept('H15.11', {
    code: 'H15.11.02',
    name: 'Thanh tra Sở',
    typeCode: 'THANH_TRA',
  });
  await createDept('H15.11', {
    code: 'H15.11.03',
    name: 'Phòng Ngân sách',
    typeCode: 'PHONG_BAN_SO',
  });
  await createDept('H15.11', {
    code: 'H15.11.04',
    name: 'Phòng Hành chính sự nghiệp',
    typeCode: 'PHONG_BAN_SO',
  });

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

  // ==========================================================
  // MỞ RỘNG POLICY PBAC CHO HỆ THỐNG LIÊN THÔNG & HRM
  // ==========================================================
  console.log('≡ƒö╣ Mở rộng Policy PBAC cho hệ thống liên thông & HRM...');

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
    'TASK.ASSIGN': "ALLOW IF user.isLeader == true AND targetUser.managerId == currentUserId OR resource.ownerId == currentUserId OR currentUserId IN resource.assigneeIds",
    'TASK.VIEW': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.treeParticipantIds OR (user.isLeader == true AND targetUser.managerId == currentUserId)",
    'TASK.UPDATE': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.assigneeIds",
    'TASK.COMMENT': "ALLOW IF currentUserId IN resource.treeParticipantIds",
    'TASK.COMPLETE': "ALLOW IF resource.ownerId == currentUserId OR currentUserId IN resource.assigneeIds",
    'TASK.CREATE': "ALLOW IF currentUserId IN resource.assigneeIds OR user.isLeader == true OR resource.ownerId == currentUserId",
    'TASK.EVALUATE': "ALLOW IF resource.ownerId == currentUserId OR (user.isLeader == true AND targetUser.managerId == currentUserId)",

    // Objective
    'OBJECTIVE.VIEW': "ALLOW IF targetUser.unitCode STARTSWITH user.unitCode",
    'OBJECTIVE.UPDATE': "ALLOW IF resource.ownerId == currentUserId",
    'OBJECTIVE.APPROVE': "ALLOW IF user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode",

    // KPI
    'KPI.VIEW': "ALLOW IF resource.ownerId == currentUserId OR resource.managerId == currentUserId OR (user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode)",
    'KPI.UPDATE': "ALLOW IF resource.ownerId == currentUserId",
    'KPI.EVALUATE': "ALLOW IF currentUserId == resource.managerId OR (user.isLeader == true AND targetUser.unitCode STARTSWITH user.unitCode)",

    // HRM
    'HRM_EMPLOYEE.VIEW': "ALLOW IF resource.id == currentUserId OR targetUser.managerId == currentUserId OR user.role == 'ADMIN'",
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


  console.log('🔹 Seeding PBAC Roles & Policies...');
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
              conditions: conditionString ? { expression: conditionString } : undefined
            }
          });
          result.push({ id: pol.id });
        }
      }
    }
    return result;
  };

  const roleDefinitions = [
    { code: 'SUPER_ADMIN', name: 'Quản trị viên cấp cao', scope: 'GLOBAL', perms: ['ALL'] },
    { code: 'ADMIN', name: 'Quản trị hệ thống', scope: 'GLOBAL', perms: ['ALL'] },
    {
      code: 'LEADER',
      name: 'Lãnh đạo đơn vị',
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
        'TASK.*',
        'OBJECTIVE.*',
        'KPI.*',
        'REPORT.*',
        'WORKFLOW.*'
      ]
    },
    {
      code: 'MANAGER',
      name: 'Quản lý',
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
      name: 'Nhân viên',
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
        'TASK.VIEW',
        'TASK.READ',
        'TASK.UPDATE',
        'TASK.COMMENT',
        'TASK.COMPLETE',
        'TASK.CREATE',
        'TASK.ASSIGN',
        'KPI.VIEW',
        'KPI.READ',
        'WORKFLOW.VIEW',
        'WORKFLOW.READ'
      ]
    },
    {
      code: 'SUPERVISOR',
      name: 'Giám sát',
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
  console.log('✅ Hoàn tất Seed PBAC Engine.');

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
        // Cập nhật nếu đơn vị hoặc chức danh bị sai
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
    'H15.07.05',
    'CHANH_VAN_PHONG',
    true,
  );
  await assignLeader(
    'lethib@daklak.gov.vn',
    'lethib',
    'Lê Thị B',
    'H15.07.07',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'tranvanc@daklak.gov.vn',
    'tranvanc',
    'Trần Văn C',
    'H15.07.08',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'phamthid@daklak.gov.vn',
    'phamthid',
    'Phạm Thị D',
    'H15.07.09',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'hoangvane@daklak.gov.vn',
    'hoangvane',
    'Hoàng Văn E',
    'H15.07.10',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'vuthif@daklak.gov.vn',
    'vuthif',
    'Vũ Thị F',
    'H15.07.11',
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
    'lyvani@daklak.gov.vn',
    'lyvani',
    'Lý Văn I',
    'H15.07.02',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'vonguyenhoangnam@daklak.gov.vn',
    'vonguyenhoangnam',
    'Võ Nguyễn Hoàng Nam',
    'H15.07.04',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'lexuanquang@daklak.gov.vn',
    'lexuanquang',
    'Lê Xuân Quang',
    'H15.07.04',
    'PHO_GIAM_DOC',
    false,
  );
  await assignLeader(
    'tranduytan@daklak.gov.vn',
    'tranduytan',
    'Trần Duy Tân',
    'H15.07.04',
    'PHO_GIAM_DOC',
    false,
  );

  // Lãnh đạo các phòng thuộc Trung tâm
  await assignLeader(
    'truongphonghc_dmsm@daklak.gov.vn',
    'truongphonghc_dmsm',
    'Hoàng Văn HC',
    'H15.07.01.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongut_dmsm@daklak.gov.vn',
    'truongphongut_dmsm',
    'Lê Thị UT',
    'H15.07.01.02',
    'TRUONG_PHONG',
    true,
  );


  await assignLeader(
    'lequangthanh@daklak.gov.vn',
    'lequangthanh',
    'Lê Quang Thanh',
    'H15.07.04.03',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'letrongvu@daklak.gov.vn',
    'letrongvu',
    'Lê Trọng Vũ',
    'H15.07.04.02',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'leanhtuan@daklak.gov.vn',
    'leanhtuan',
    'Lê Anh Tuấn',
    'H15.07.04.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'chautrongphat@daklak.gov.vn',
    'chautrongphat',
    'Châu Trọng Phát',
    'H15.07.04.01',
    'KE_TOAN',
    false,
  );
  await assignLeader(
    'phamtheanh@daklak.gov.vn',
    'phamtheanh',
    'Phạm Thế Anh',
    'H15.07.04.03',
    'VIEN_CHUC',
    false,
  );
  await assignLeader(
    'nguyenvuhuy@daklak.gov.vn',
    'nguyenvuhuy',
    'Nguyễn Vũ Huy',
    'H15.07.04.03',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'lethithanhkieu@daklak.gov.vn',
    'lethithanhkieu',
    'Lê Thị Thanh Kiều',
    'H15.07.04.02',
    'VIEN_CHUC',
    false,
  );
  await assignLeader(
    'truongphonghc_kttdc@daklak.gov.vn',
    'truongphonghc_kttdc',
    'Nguyễn Văn HC',
    'H15.07.02.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongdl_kttdc@daklak.gov.vn',
    'truongphongdl_kttdc',
    'Đinh Thị DL',
    'H15.07.02.02',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'truongphongtn_kttdc@daklak.gov.vn',
    'truongphongtn_kttdc',
    'Vũ Văn TN',
    'H15.07.02.03',
    'TRUONG_PHONG',
    true,
  );

  // Thêm một số Phó Trưởng phòng (Ví dụ)
  await assignLeader(
    'phochvp_khcn@daklak.gov.vn',
    'phochvp_khcn',
    'Trương Văn Phó 1',
    'H15.07.05',
    'PHO_CHANH_VAN_PHONG',
    false,
  );
  await assignLeader(
    'photp_khtc_khcn@daklak.gov.vn',
    'photp_khtc_khcn',
    'Ngô Thị Phó 2',
    'H15.07.07',
    'PHO_TRUONG_PHONG',
    false,
  );

  // 4. Sở Tài chính
  await assignLeader(
    'tranvantan@daklak.gov.vn',
    'tranvantan',
    'Trần Văn Tân',
    'H15.11',
    'GIAM_DOC',
    true,
  );
  // 5. Nhân viên Phòng Khai thác & Quản lý dữ liệu (H15.07.04.02)
  await assignLeader(
    'trantrungthanh@daklak.gov.vn',
    'trantrungthanh',
    'Trần Trung Thành',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'nguyenthiquynhmai@daklak.gov.vn',
    'nguyenthiquynhmai',
    'Nguyễn Thị Quỳnh Mai',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'nguyenquangtu@daklak.gov.vn',
    'nguyenquangtu',
    'Nguyễn Quang Tú',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  // 6. Phường Tân Lập
  await assignLeader(
    'vuvanhung@daklak.gov.vn',
    'vuvanhung',
    'Vũ Văn Hưng',
    'H15.52',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'tranducnhat@daklak.gov.vn',
    'tranducnhat',
    'Trần Đức Nhật',
    'H15.52',
    'CHU_TICH',
    true,
  );
  // 7. Phường Tân An
  await assignLeader(
    'nguyenducvinh@daklak.gov.vn',
    'nguyenducvinh',
    'Nguyễn Đức Vinh',
    'H15.53',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'phamtrungnghia@daklak.gov.vn',
    'phamtrungnghia',
    'Phạm Trung Nghĩa',
    'H15.53',
    'CHU_TICH',
    true,
  );
  // 9. Các giám đốc Sở mới (cập nhật từ 2026)
  await assignLeader(
    'caodinhhuy@daklak.gov.vn',
    'caodinhhuy',
    'Cao Đình Huy',
    'H15.14',
    'GIAM_DOC',
    true,
  );
  // 10. Các phường/xã còn lại
  await assignLeader(
    'nguyenthanhliem@daklak.gov.vn',
    'nguyenthanhliem',
    'Nguyễn Thanh Liêm',
    'H15.54',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'nguyendinhtam@daklak.gov.vn',
    'nguyendinhtam',
    'Nguyễn Đình Tâm',
    'H15.54',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    'phamtienhung@daklak.gov.vn',
    'phamtienhung',
    'Phạm Tiến Hưng',
    'H15.55',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'nguyenthehau@daklak.gov.vn',
    'nguyenthehau',
    'Nguyễn Thế Hậu',
    'H15.55',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    'danggiaduan@daklak.gov.vn',
    'danggiaduan',
    'Đặng Gia Duẩn',
    'H15.56',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'ledaithang@daklak.gov.vn',
    'ledaithang',
    'Lê Đại Thắng',
    'H15.56',
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

  // ========================================
  // SỞ KHOA HỌC & CÔNG NGHỆ (H15.07)
  // ========================================
  await setStaffing('H15.07', 'GIAM_DOC', 1);
  await setStaffing('H15.07', 'PHO_GIAM_DOC', 4);

  // ── Văn phòng Sở (H15.07.05) ──
  await setStaffing('H15.07.05', 'CHANH_VAN_PHONG', 1);
  await setStaffing('H15.07.05', 'PHO_CHANH_VAN_PHONG', 2);
  await setStaffing('H15.07.05', 'SPECIALIST', 5);

  // ── Phòng ban chuyên môn Sở KHCN ──
  // H15.07.06 - Thanh tra Sở
  await setStaffing('H15.07.06', 'CHANH_THANH_TRA', 1);
  await setStaffing('H15.07.06', 'PHO_CHANH_THANH_TRA', 1);
  await setStaffing('H15.07.06', 'THANH_TRA_VIEN', 3);

  // H15.07.07 - Phòng Kế hoạch - Tài chính
  await setStaffing('H15.07.07', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.07', 'PHO_PHONG', 2);
  await setStaffing('H15.07.07', 'SPECIALIST', 4);

  // H15.07.08 - Phòng Quản lý Khoa học
  await setStaffing('H15.07.08', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.08', 'PHO_PHONG', 2);
  await setStaffing('H15.07.08', 'SPECIALIST', 4);

  // H15.07.09 - Phòng Chuyển đổi số
  await setStaffing('H15.07.09', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.09', 'PHO_PHONG', 2);
  await setStaffing('H15.07.09', 'SPECIALIST', 4);

  // H15.07.10 - Phòng Quản lý Công nghệ & Đổi mới sáng tạo
  await setStaffing('H15.07.10', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.10', 'PHO_PHONG', 2);
  await setStaffing('H15.07.10', 'SPECIALIST', 4);

  // H15.07.11 - Phòng Quản lý TCĐLCL
  await setStaffing('H15.07.11', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.11', 'PHO_PHONG', 2);
  await setStaffing('H15.07.11', 'SPECIALIST', 4);

  // ========================================
  // TRUNG TÂM ĐỔI MỚI SÁNG TẠO (H15.07.01)
  // ========================================
  await setStaffing('H15.07.01', 'GIAM_DOC', 1);
  await setStaffing('H15.07.01', 'PHO_GIAM_DOC', 2);

  // H15.07.01.01 - Phòng Hành chính - Tổng hợp
  await setStaffing('H15.07.01.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.01', 'VIEN_CHUC', 3);

  // H15.07.01.02 - Phòng Đào tạo & Phát triển
  await setStaffing('H15.07.01.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.01.02', 'VIEN_CHUC', 4);

  // ========================================
  // TRUNG TÂM KỸ THUẬT TCĐLCL (H15.07.02)
  // ========================================
  await setStaffing('H15.07.02', 'GIAM_DOC', 1);
  await setStaffing('H15.07.02', 'PHO_GIAM_DOC', 2);

  // H15.07.02.01 - Phòng Hành chính - Tổ chức
  await setStaffing('H15.07.02.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.01', 'VIEN_CHUC', 3);

  // H15.07.02.02 - Phòng Đo lường
  await setStaffing('H15.07.02.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.02', 'VIEN_CHUC', 4);

  // H15.07.02.03 - Phòng Thử nghiệm
  await setStaffing('H15.07.02.03', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.03', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.02.03', 'VIEN_CHUC', 4);

  // ========================================
  // TRUNG TÂM THÔNG TIN ỨNG DỤNG KH&CN (H15.07.03)
  // ========================================
  await setStaffing('H15.07.03', 'GIAM_DOC', 1);
  await setStaffing('H15.07.03', 'PHO_GIAM_DOC', 2);

  // H15.07.03.01 - Phòng Hành chính - Tổng hợp
  await setStaffing('H15.07.03.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.01', 'VIEN_CHUC', 3);

  // H15.07.03.02 - Phòng Thông tin KH&CN
  await setStaffing('H15.07.03.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.02', 'VIEN_CHUC', 4);

  // H15.07.03.03 - Phòng Ứng dụng KH&CN
  await setStaffing('H15.07.03.03', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.03', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.03', 'VIEN_CHUC', 4);

  // H15.07.03.04 - Phòng Dịch vụ KH&CN
  await setStaffing('H15.07.03.04', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.04', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.04', 'VIEN_CHUC', 3);

  // H15.07.03.05 - Trại Thực nghiệm KH&CN
  await setStaffing('H15.07.03.05', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.03.05', 'VIEN_CHUC', 5);

  // ========================================
  // TRUNG TÂM IOC - GIÁM SÁT ĐÔ THỊ THÔNG MINH (H15.07.04)
  // ========================================
  await setStaffing('H15.07.04', 'GIAM_DOC', 1);
  await setStaffing('H15.07.04', 'PHO_GIAM_DOC', 2);

  // H15.07.04.01 - Phòng Hành chính - Tổng hợp
  // Thực tế: 1 TP + 1 KT + 1 VC + 1 VT + 4 NV + 2 BV = 10 người
  await setStaffing('H15.07.04.01', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.01', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.01', 'KE_TOAN', 1);
  await setStaffing('H15.07.04.01', 'VAN_THU', 1);
  await setStaffing('H15.07.04.01', 'VIEN_CHUC', 1);
  await setStaffing('H15.07.04.01', 'NHAN_VIEN', 4);
  await setStaffing('H15.07.04.01', 'BAO_VE', 2);

  // H15.07.04.02 - Phòng Khai thác & Quản lý dữ liệu
  // Thực tế: 1 TP + 3 VC + 3 NV = 7 người
  await setStaffing('H15.07.04.02', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.02', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.02', 'VIEN_CHUC', 3);
  await setStaffing('H15.07.04.02', 'NHAN_VIEN', 3);

  // H15.07.04.03 - Phòng Hạ tầng - Đô thị thông minh
  // Thực tế: 1 TP + 2 VC + 3 NV = 6 người
  await setStaffing('H15.07.04.03', 'TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.03', 'PHO_TRUONG_PHONG', 1);
  await setStaffing('H15.07.04.03', 'VIEN_CHUC', 2);
  await setStaffing('H15.07.04.03', 'NHAN_VIEN', 3);


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
      where: { groupCode_code: { groupCode: 'PLAN_FRAMEWORK', code: fw.code } },
      update: { order: fw.order },
      create: { groupCode: 'PLAN_FRAMEWORK', code: fw.code, order: fw.order },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: cat.id, langCode: 'vi' } },
      update: { name: fw.name },
      create: { categoryId: cat.id, langCode: 'vi', name: fw.name },
    });
  }



  console.log('✅ Categories seeded successfully!');

  // 4. Chỉ lấy địa bàn cấp tỉnh: Tỉnh Đắk Lắk (PROVINCE 47)
  // Không gán từng xã/phường — cấp Sở quản lý toàn tỉnh
  const daklakProvince = await prisma.category.findFirst({
    where: { code: '47', groupCode: 'PROVINCE' },
  });
  const defaultGeoAreas = daklakProvince ? [daklakProvince] : [];

  // 5. Lấy các lĩnh vực KHCN, TT&TT, CĐS và NGÂN SÁCH
  const allDomainCodes = [
    'H15.07', 'CHUYEN_DOI_SO', 'DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'VIEN_THONG', 'KINH_TE_SO',
    'THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'BUU_CHINH', 'HA_TANG_SO',
    'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI', 'NGAN_SACH'
  ];

  const techDomains = await prisma.category.findMany({
    where: {
      groupCode: 'DOMAIN',
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
      // Sở KHCN — toàn bộ lĩnh vực
      'H15.07': allDomainCodes,

      // Văn phòng Sở — hành chính tổng hợp toàn Sở
      'H15.07.05': ['H15.07'],

      // Phòng Kế hoạch - Tài chính
      'H15.07.07': ['NGAN_SACH', 'H15.07'],

      // Phòng Quản lý Khoa học
      'H15.07.08': ['H15.07'],

      // Phòng Chuyển đổi số
      'H15.07.09': ['CHUYEN_DOI_SO', 'DU_LIEU_SO', 'KINH_TE_SO', 'AN_TOAN_THONG_TIN', 'HA_TANG_SO'],

      // Phòng Quản lý Công nghệ & Đổi mới sáng tạo
      'H15.07.10': ['H15.07'],

      // Phòng Quản lý TCĐLCL
      'H15.07.11': ['H15.07'],

      // TT Thông tin Ứng dụng KH&CN (H15.07.03)
      'H15.07.03': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU', 'BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.03.01': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN'],
      'H15.07.03.02': ['THONG_TIN_TRUYEN_THONG', 'BAO_CHI', 'XUAT_BAN', 'THONG_TIN_DIEN_TU'],
      'H15.07.03.03': ['THONG_TIN_DIEN_TU', 'BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO'],
      'H15.07.03.04': ['BUU_CHINH', 'VIEN_THONG', 'TRUYEN_THONG_CO_SO', 'THONG_TIN_DOI_NGOAI'],
      'H15.07.03.05': ['H15.07'],

      // TT Kỹ thuật TCĐLCL (H15.07.02)
      'H15.07.02': ['H15.07'],
      'H15.07.02.01': ['H15.07'],
      'H15.07.02.02': ['H15.07'],
      'H15.07.02.03': ['H15.07'],

      // TT IOC — Giám sát Đô thị Thông minh (H15.07.04)
      'H15.07.04': ['DU_LIEU_SO', 'HA_TANG_SO', 'THONG_TIN_TRUYEN_THONG', 'CHUYEN_DOI_SO', 'AN_TOAN_THONG_TIN'],
      'H15.07.04.01': ['DU_LIEU_SO', 'CHUYEN_DOI_SO'],
      'H15.07.04.02': ['DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'CHUYEN_DOI_SO'],
      'H15.07.04.03': ['HA_TANG_SO', 'AN_TOAN_THONG_TIN', 'THONG_TIN_TRUYEN_THONG'],

      // TT ĐMST (H15.07.01)
      'H15.07.01': ['H15.07'],
      'H15.07.01.01': ['H15.07'],
      'H15.07.01.02': ['H15.07'],
    };


    for (const unit of soKhcnUnits) {
      // Địa bàn: chỉ gán Tỉnh Đắk Lắk (1 bản ghi/đơn vị)
      for (const geo of defaultGeoAreas) {
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

    console.log(`✅ Đã cập nhật ${defaultGeoAreas.length} Địa bàn (toàn tỉnh Đắk Lắk) cho ${soKhcnUnits.length} đơn vị KH&CN (Tổng: ${geoData.length} bản ghi)`);
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

    const phongKHTC = soKhcnUnits.find(u => u.code === 'H15.07.07');
    const phongCDS = soKhcnUnits.find(u => u.code === 'H15.07.09');
    const trungtamIOC = soKhcnUnits.find(u => u.code === 'H15.07.04');
    const phongQLCN = soKhcnUnits.find(u => u.code === 'H15.07.10');
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

    await prisma.staffingSlotMonitoredUnit.createMany({ data: slotMonitored, skipDuplicates: true });

    console.log(`✅ Đã phân bổ chi tiết Định biên (StaffingSlots) cho toàn Sở và các đơn vị trực thuộc (Monitored Units: ${slotMonitored.length})`);
  }



  // ==========================================================
  // UNIT_TYPE_CATEGORY — Cập nhật description với metadata đầy đủ
  // Categories đã tạo qua loop chuẩn ở trên (group_code unique).
  // description lưu trong CategoryTranslation.description (JSON).
  // Frontend parse và render, không hardcode logic nghiệp vụ.
  // ==========================================================
  const unitTypeMeta: Record<string, { descVi: string; descEn: string }> = {
    CHINH_QUYEN: {
      descVi: JSON.stringify({
        icon: 'Landmark', color: 'blue',
        description: 'Sở, Ban, UBND các cấp, Chi cục trực thuộc',
        signingNote: 'Ký ban hành văn bản quản lý nhà nước (QĐ, CV, TB) theo thẩm quyền được phân cấp.',
        purposeNote: 'Thực hiện chức năng quản lý hành chính nhà nước trong lĩnh vực được giao.',
        signingAuthority: 'FULL', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds', 'geographicAreaIds'],
        leaderTitleKeywords: ['Giám đốc', 'Phó Giám đốc', 'Chủ tịch UBND', 'Phó Chủ tịch UBND'],
        staffTitleKeywords: ['Chuyên viên cao cấp', 'Chuyên viên chính', 'Chuyên viên', 'Nhân viên'],
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
        description: 'Tỉnh ủy, Huyện ủy, Đảng bộ, Chi bộ, Ban Đảng',
        signingNote: 'Ký ban hành nghị quyết, chỉ thị, thông báo kết luận của Đảng.',
        purposeNote: 'Lãnh đạo chính trị theo hệ thống Đảng, song song với hệ thống hành chính.',
        signingAuthority: 'FULL', politicalSystem: 'DANG',
        requiredFields: [],
        leaderTitleKeywords: ['Bí thư', 'Phó Bí thư', 'Ủy viên Ban Thường vụ', 'Tỉnh ủy viên'],
        staffTitleKeywords: ['Chuyên viên đảng', 'Nhân viên văn phòng Đảng ủy'],
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
        description: 'Văn phòng, Thanh tra, Phòng Tổ chức cán bộ, Kế hoạch–Tài chính',
        signingNote: 'Ký thừa lệnh hoặc theo ủy quyền. Không ban hành văn bản quy phạm pháp luật độc lập.',
        purposeNote: 'Tham mưu tổng hợp, điều phối nội bộ, hành chính quản trị cho lãnh đạo cơ quan.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Chánh Văn phòng', 'Phó Chánh Văn phòng', 'Chánh Thanh tra', 'Trưởng phòng', 'Phó Trưởng phòng'],
        staffTitleKeywords: ['Chuyên viên', 'Kế toán viên', 'Nhân viên'],
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
        description: 'Phòng nghiệp vụ, Chi cục trực thuộc Sở',
        signingNote: 'Tham mưu và thực thi chuyên ngành. Chi cục có thể ký một số văn bản theo phân cấp.',
        purposeNote: 'Quản lý chuyên môn theo ngành dọc; thanh tra, kiểm tra, hướng dẫn nghiệp vụ.',
        signingAuthority: 'DELEGATED', politicalSystem: 'HANH_CHINH',
        requiredFields: ['domainIds', 'geographicAreaIds'],
        leaderTitleKeywords: ['Trưởng phòng', 'Phó Trưởng phòng', 'Chi cục trưởng', 'Phó Chi cục trưởng'],
        staffTitleKeywords: ['Chuyên viên', 'Chuyên viên chính', 'Chuyên viên cao cấp', 'Kiểm soát viên'],
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
        description: 'Trung tâm, Trường, Bệnh viện, Ban quản lý dự án',
        signingNote: 'Ký hợp đồng dịch vụ, văn bản nội bộ. Vượt thẩm quyền phải trình cơ quan chủ quản.',
        purposeNote: 'Cung cấp dịch vụ công theo cơ chế tự chủ. Hoạt động theo Luật Viên chức.',
        signingAuthority: 'FULL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds', 'scope'],
        leaderTitleKeywords: ['Giám đốc', 'Phó Giám đốc', 'Hiệu trưởng', 'Phó Hiệu trưởng', 'Trưởng ban'],
        staffTitleKeywords: ['Viên chức', 'Giáo viên', 'Bác sĩ', 'Điều dưỡng', 'Kỹ sư', 'Giảng viên'],
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
        description: 'Phòng HC-TH, Tổ chuyên môn nội bộ TT/Trường/BV',
        signingNote: 'Không ký văn bản đối ngoại. Mọi trao đổi ra ngoài qua Giám đốc/Hiệu trưởng đơn vị.',
        purposeNote: 'Thực hiện chức năng chuyên môn nội bộ trong đơn vị sự nghiệp.',
        signingAuthority: 'INTERNAL', politicalSystem: 'SU_NGHIEP',
        requiredFields: ['domainIds'],
        leaderTitleKeywords: ['Trưởng phòng', 'Phó Trưởng phòng', 'Tổ trưởng', 'Tổ phó'],
        staffTitleKeywords: ['Viên chức', 'Nhân viên', 'Kỹ thuật viên', 'Y tá', 'Hộ lý'],
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
      where: { groupCode_code: { groupCode: 'UNIT_TYPE_CATEGORY', code } },
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
  console.log('✅ Đã cập nhật metadata đầy đủ cho UNIT_TYPE_CATEGORY (6 nhóm phân loại tổ chức).');

  // ==========================================================
  // PBAC MENU SEED (Giao diện chuẩn)
  // ==========================================================
  console.log('🔹 Seeding Standard Menus...');

  const menuData = [
    // 1. Dashboard (Public/No PBAC required)
    { code: 'DASHBOARD', name: 'Bảng điều khiển', route: '/', icon: 'LayoutDashboard', order: 1, application: 'ADMIN_PORTAL', linkedResourceCode: null },

    // 2. Hệ thống
    { code: 'SYS_GROUP', name: 'Quản trị hệ thống', route: null, icon: 'Settings', order: 99, application: 'ADMIN_PORTAL', linkedResourceCode: 'SYSTEM' },
    { code: 'SYS_ORG', name: 'Cơ cấu tổ chức', route: '/system/organizations', icon: 'Building2', order: 1, application: 'ADMIN_PORTAL', parentCode: 'SYS_GROUP', linkedResourceCode: 'ORGANIZATION' },
    { code: 'SYS_USER', name: 'Người dùng', route: '/system/users', icon: 'Users', order: 2, application: 'ADMIN_PORTAL', parentCode: 'SYS_GROUP', linkedResourceCode: 'USER' },
    { code: 'SYS_ROLE', name: 'Vai trò & Quyền', route: '/system/roles', icon: 'ShieldCheck', order: 3, application: 'ADMIN_PORTAL', parentCode: 'SYS_GROUP', linkedResourceCode: 'ROLE' },
    { code: 'SYS_RESOURCE', name: 'Tài nguyên PBAC', route: '/system/resources', icon: 'Database', order: 4, application: 'ADMIN_PORTAL', parentCode: 'SYS_GROUP', linkedResourceCode: 'RESOURCE' },
    { code: 'SYS_MENU', name: 'Quản lý Menu', route: '/system/menus', icon: 'Menu', order: 5, application: 'ADMIN_PORTAL', parentCode: 'SYS_GROUP', linkedResourceCode: 'MENU' },
    { code: 'SYS_CAT', name: 'Danh mục', route: '/system/categories', icon: 'ListTree', order: 6, application: 'ADMIN_PORTAL', parentCode: 'SYS_GROUP', linkedResourceCode: 'CATEGORY' },

    // 3. Quản lý Nhân sự & Công việc
    { code: 'HRM_GROUP', name: 'Nhân sự & Công việc', route: null, icon: 'Users', order: 2, application: 'ADMIN_PORTAL', linkedResourceCode: 'HRM_EMPLOYEE' },
    { code: 'HRM_EMPLOYEE_MENU', name: 'Hồ sơ nhân sự', route: '/hrm/employees', icon: 'UserCircle', order: 1, application: 'ADMIN_PORTAL', parentCode: 'HRM_GROUP', linkedResourceCode: 'HRM_EMPLOYEE' },
    { code: 'HRM_TASK_MENU', name: 'Quản lý công việc', route: '/hrm/tasks', icon: 'CheckSquare', order: 2, application: 'ADMIN_PORTAL', parentCode: 'HRM_GROUP', linkedResourceCode: 'TASK' },
    { code: 'HRM_PLAN_MENU', name: 'Kế hoạch công tác', route: '/hrm/plans', icon: 'Calendar', order: 3, application: 'ADMIN_PORTAL', parentCode: 'HRM_GROUP', linkedResourceCode: 'PLAN' },
  ];

  for (const m of menuData) {
    let parentId: number | null = null;
    if (m.parentCode) {
      const parentMenu = await prisma.menu.findUnique({ where: { code: m.parentCode } });
      if (parentMenu) parentId = parentMenu.id;
    }

    await prisma.menu.upsert({
      where: { code: m.code },
      update: {
        name: m.name,
        route: m.route,
        icon: m.icon,
        order: m.order,
        application: m.application,
        linkedResourceCode: m.linkedResourceCode,
        parentId
      },
      create: {
        code: m.code,
        name: m.name,
        route: m.route,
        icon: m.icon,
        order: m.order,
        application: m.application,
        linkedResourceCode: m.linkedResourceCode,
        parentId
      }
    });
  }
  console.log('✅ Hoàn tất cấu hình PBAC Menus.');

  // ==========================================================
  console.log('🌱 READY FOR GRPC MICROSERVICES DEPLOYMENT!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
