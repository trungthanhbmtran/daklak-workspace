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
  ];

  const resources: Record<string, { id: number; code: string; name: string }> = {};
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
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'PUBLISH', 'MANAGE'];
  const allPermissions: { id: number }[] = [];

  for (const res of Object.values(resources)) {
    for (const action of actions) {
      // Logic constraint: SYSTEM only has VIEW/MANAGE
      if (res.code === 'SYSTEM' && !['VIEW', 'MANAGE'].includes(action)) continue;

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
    { group: 'STATUS', code: 'ACTIVE', order: 1, nameVi: 'Hoạt động', nameEn: 'Active' },
    { group: 'STATUS', code: 'INACTIVE', order: 2, nameVi: 'Ngưng hoạt động', nameEn: 'Inactive' },
    { group: 'STATUS', code: 'PENDING', order: 3, nameVi: 'Chờ xử lý', nameEn: 'Pending' },
    { group: 'STATUS', code: 'LOCKED', order: 4, nameVi: 'Đã khóa', nameEn: 'Locked' },

    { group: 'ACTION_LOG', code: 'LOGIN', order: 1, nameVi: 'Đăng nhập', nameEn: 'Login' },
    { group: 'ACTION_LOG', code: 'LOGOUT', order: 2, nameVi: 'Đăng xuất', nameEn: 'Logout' },
    { group: 'ACTION_LOG', code: 'CREATE', order: 3, nameVi: 'Tạo mới', nameEn: 'Create' },
    { group: 'ACTION_LOG', code: 'UPDATE', order: 4, nameVi: 'Cập nhật', nameEn: 'Update' },
    { group: 'ACTION_LOG', code: 'DELETE', order: 5, nameVi: 'Xóa', nameEn: 'Delete' },

    { group: 'MICROSERVICE', code: 'USER_SERVICE', order: 1, nameVi: 'Dịch vụ Người dùng', nameEn: 'User Service' },
    { group: 'MICROSERVICE', code: 'HRM_SERVICE', order: 2, nameVi: 'Dịch vụ Nhân sự', nameEn: 'HRM Service' },
    { group: 'MICROSERVICE', code: 'DOCUMENT_SERVICE', order: 3, nameVi: 'Dịch vụ Văn bản', nameEn: 'Document Service' },
    { group: 'MICROSERVICE', code: 'POST_SERVICE', order: 4, nameVi: 'Dịch vụ Nội dung', nameEn: 'Content Service' },
    { group: 'MICROSERVICE', code: 'WORKFLOW_SERVICE', order: 5, nameVi: 'Dịch vụ Quy trình', nameEn: 'Workflow Service' },

    // --- GEOGRAPHIC DATA ---
    { group: 'PROVINCE', code: '47', order: 1, nameVi: 'Tỉnh Đắk Lắk', nameEn: 'Dak Lak Province' },
    { group: 'PROVINCE', code: '01', order: 2, nameVi: 'Thành phố Hà Nội', nameEn: 'Hanoi City' },
    { group: 'PROVINCE', code: '79', order: 3, nameVi: 'Thành phố Hồ Chí Minh', nameEn: 'Ho Chi Minh City' },

    { group: 'DISTRICT', code: '47_01', order: 1, nameVi: 'Thành phố Buôn Ma Thuột', nameEn: 'Buon Ma Thuot City' },
    { group: 'DISTRICT', code: '47_02', order: 2, nameVi: 'Thị xã Buôn Hồ', nameEn: 'Buon Ho Town' },
    { group: 'DISTRICT', code: '47_03', order: 3, nameVi: 'Huyện Krông Pắc', nameEn: 'Krong Pac District' },
    { group: 'DISTRICT', code: '47_04', order: 4, nameVi: 'Huyện Krông Năng', nameEn: 'Krong Nang District' },
    { group: 'DISTRICT', code: '47_05', order: 5, nameVi: 'Huyện Ea H\'leo', nameEn: 'Ea H\'leo District' },
    { group: 'DISTRICT', code: '47_06', order: 6, nameVi: 'Huyện Buôn Đôn', nameEn: 'Buon Don District' },
    { group: 'DISTRICT', code: '47_07', order: 7, nameVi: 'Huyện Cư M\'gar', nameEn: 'Cu M\'gar District' },
    { group: 'DISTRICT', code: '47_08', order: 8, nameVi: 'Huyện Ea Kar', nameEn: 'Ea Kar District' },

    { group: 'WARD', code: '47_01_01', order: 1, nameVi: 'Phường Tân Lợi', nameEn: 'Tan Loi Ward' },
    { group: 'WARD', code: '47_01_02', order: 2, nameVi: 'Phường Tân Hòa', nameEn: 'Tan Hoa Ward' },
    { group: 'WARD', code: '47_01_03', order: 3, nameVi: 'Phường Tân Lập', nameEn: 'Tan Lap Ward' },
    { group: 'WARD', code: '47_01_04', order: 4, nameVi: 'Phường Tân An', nameEn: 'Tan An Ward' },
    { group: 'WARD', code: '47_01_05', order: 5, nameVi: 'Phường Thắng Lợi', nameEn: 'Thang Loi Ward' },

    { group: 'GEO_AREA', code: 'TAY_NGUYEN', order: 1, nameVi: 'Khu vực Tây Nguyên', nameEn: 'Central Highlands Region' },
    { group: 'GEO_AREA', code: 'MIEN_TRUNG', order: 2, nameVi: 'Khu vực Miền Trung', nameEn: 'Central Region' },

    // --- DOCUMENTS ---
    { group: 'DOCUMENT_TYPE', code: 'QUYET_DINH', order: 1, nameVi: 'Quyết định', nameEn: 'Decision' },
    { group: 'DOCUMENT_TYPE', code: 'NGHI_QUYET', order: 2, nameVi: 'Nghị quyết', nameEn: 'Resolution' },
    { group: 'DOCUMENT_TYPE', code: 'CONG_VAN', order: 3, nameVi: 'Công văn', nameEn: 'Official Letter' },
    { group: 'DOCUMENT_TYPE', code: 'TO_TRINH', order: 4, nameVi: 'Tờ trình', nameEn: 'Proposal' },
    { group: 'DOCUMENT_TYPE', code: 'BAO_CAO', order: 5, nameVi: 'Báo cáo', nameEn: 'Report' },

    { group: 'URGENCY_LEVEL', code: 'THUONG', order: 1, nameVi: 'Thường', nameEn: 'Normal' },
    { group: 'URGENCY_LEVEL', code: 'KHAN', order: 2, nameVi: 'Khẩn', nameEn: 'Urgent' },
    { group: 'URGENCY_LEVEL', code: 'HOA_TOC', order: 3, nameVi: 'Hỏa tốc', nameEn: 'Express' },

    { group: 'SECURITY_LEVEL', code: 'THUONG', order: 1, nameVi: 'Thường', nameEn: 'Unclassified' },
    { group: 'SECURITY_LEVEL', code: 'MAT', order: 2, nameVi: 'Mật', nameEn: 'Confidential' },
    { group: 'SECURITY_LEVEL', code: 'TOI_MAT', order: 3, nameVi: 'Tối mật', nameEn: 'Secret' },
    { group: 'SECURITY_LEVEL', code: 'TUYET_MAT', order: 4, nameVi: 'Tuyệt mật', nameEn: 'Top Secret' },

    { group: 'DOCUMENT_DOMAIN', code: 'HANH_CHINH', order: 1, nameVi: 'Hành chính', nameEn: 'Administration' },
    { group: 'DOCUMENT_DOMAIN', code: 'KHOA_HOC', order: 2, nameVi: 'Khoa học công nghệ', nameEn: 'Science & Technology' },
    { group: 'DOCUMENT_DOMAIN', code: 'TAI_CHINH', order: 3, nameVi: 'Tài chính', nameEn: 'Finance' },
    { group: 'DOCUMENT_DOMAIN', code: 'GIAO_THONG', order: 4, nameVi: 'Giao thông vận tải', nameEn: 'Transportation' },
    { group: 'DOCUMENT_DOMAIN', code: 'Y_TE', order: 5, nameVi: 'Y tế', nameEn: 'Healthcare' },

    { group: 'STORAGE_PERIOD', code: '5_YEARS', order: 1, nameVi: '05 năm', nameEn: '5 years' },
    { group: 'STORAGE_PERIOD', code: '10_YEARS', order: 2, nameVi: '10 năm', nameEn: '10 years' },
    { group: 'STORAGE_PERIOD', code: '20_YEARS', order: 3, nameVi: '20 năm', nameEn: '20 years' },
    { group: 'STORAGE_PERIOD', code: 'PERMANENT', order: 4, nameVi: 'Vĩnh viễn', nameEn: 'Permanent' },

    // --- HRM & PERSONAL ---
    { group: 'GENDER', code: 'NAM', order: 1, nameVi: 'Nam', nameEn: 'Male' },
    { group: 'GENDER', code: 'NU', order: 2, nameVi: 'Nữ', nameEn: 'Female' },
    { group: 'GENDER', code: 'KHAC', order: 3, nameVi: 'Khác', nameEn: 'Other' },

    { group: 'ETHNICITY', code: 'KINH', order: 1, nameVi: 'Kinh', nameEn: 'Kinh' },
    { group: 'ETHNICITY', code: 'EDE', order: 2, nameVi: 'Ê-đê', nameEn: 'Ede' },
    { group: 'ETHNICITY', code: 'M_NONG', order: 3, nameVi: 'M\'Nông', nameEn: 'M\'Nong' },

    { group: 'RELIGION', code: 'KHONG', order: 1, nameVi: 'Không', nameEn: 'None' },
    { group: 'RELIGION', code: 'PHAT_GIAO', order: 2, nameVi: 'Phật giáo', nameEn: 'Buddhism' },
    { group: 'RELIGION', code: 'CONG_GIAO', order: 3, nameVi: 'Công giáo', nameEn: 'Catholicism' },

    { group: 'IDENTITY_TYPE', code: 'CCCD', order: 1, nameVi: 'Căn cước công dân', nameEn: 'Citizen Identity Card' },
    { group: 'IDENTITY_TYPE', code: 'PASSPORT', order: 2, nameVi: 'Hộ chiếu', nameEn: 'Passport' },

    { group: 'POSITION', code: 'GIAM_DOC', order: 1, nameVi: 'Giám đốc', nameEn: 'Director' },
    { group: 'POSITION', code: 'PHO_GIAM_DOC', order: 2, nameVi: 'Phó Giám đốc', nameEn: 'Deputy Director' },
    { group: 'POSITION', code: 'TRUONG_PHONG', order: 3, nameVi: 'Trưởng phòng', nameEn: 'Head of Department' },
    { group: 'POSITION', code: 'CHUYEN_VIEN', order: 4, nameVi: 'Chuyên viên', nameEn: 'Expert' },

    { group: 'CIVIL_SERVANT_RANK', code: 'CVC_CAO_CAP', order: 1, nameVi: 'Chuyên viên cao cấp', nameEn: 'Senior Expert' },
    { group: 'CIVIL_SERVANT_RANK', code: 'CVC_CHINH', order: 2, nameVi: 'Chuyên viên chính', nameEn: 'Principal Expert' },
    { group: 'CIVIL_SERVANT_RANK', code: 'CHUYEN_VIEN', order: 3, nameVi: 'Chuyên viên', nameEn: 'Expert' },

    { group: 'ACADEMIC_RANK', code: 'TIEN_SI', order: 1, nameVi: 'Tiến sĩ', nameEn: 'Doctor of Philosophy' },
    { group: 'ACADEMIC_RANK', code: 'THAC_SI', order: 2, nameVi: 'Thạc sĩ', nameEn: 'Master of Science' },
    { group: 'ACADEMIC_RANK', code: 'GIAO_SU', order: 3, nameVi: 'Giáo sư', nameEn: 'Professor' },
    { group: 'ACADEMIC_RANK', code: 'PHO_GIAO_SU', order: 4, nameVi: 'Phó Giáo sư', nameEn: 'Associate Professor' },

    { group: 'POLITICAL_THEORY', code: 'CAO_CAP', order: 1, nameVi: 'Cao cấp', nameEn: 'Advanced' },
    { group: 'POLITICAL_THEORY', code: 'TRUNG_CAP', order: 2, nameVi: 'Trung cấp', nameEn: 'Intermediate' },
    { group: 'POLITICAL_THEORY', code: 'SO_CAP', order: 3, nameVi: 'Sơ cấp', nameEn: 'Elementary' },

    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN_CAO_CAP', order: 1, nameVi: 'Chuyên viên cao cấp', nameEn: 'Senior Management Expert' },
    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN_CHINH', order: 2, nameVi: 'Chuyên viên chính', nameEn: 'Principal Management Expert' },
    { group: 'STATE_MANAGEMENT', code: 'CHUYEN_VIEN', order: 3, nameVi: 'Chuyên viên', nameEn: 'Management Expert' },

    { group: 'IT_SKILL', code: 'CO_BAN', order: 1, nameVi: 'Cơ bản', nameEn: 'Basic' },
    { group: 'IT_SKILL', code: 'NANG_CAO', order: 2, nameVi: 'Nâng cao', nameEn: 'Advanced' },

    { group: 'LANGUAGE_SKILL', code: 'ENGLISH_B1', order: 1, nameVi: 'Tiếng Anh B1', nameEn: 'English B1' },
    { group: 'LANGUAGE_SKILL', code: 'ENGLISH_B2', order: 2, nameVi: 'Tiếng Anh B2', nameEn: 'English B2' },

    // --- SYSTEM LANGUAGES ---
    { group: 'LANGUAGE', code: 'vi', order: 1, nameVi: 'Tiếng Việt', nameEn: 'Vietnamese' },
    { group: 'LANGUAGE', code: 'en', order: 2, nameVi: 'Tiếng Anh', nameEn: 'English' },

    // --- OTHER ---
    { group: 'DOMAIN', code: 'KHCN', order: 1, nameVi: 'Khoa học công nghệ', nameEn: 'Science & Technology' },
    { group: 'DOMAIN', code: 'GIAO_DUC', order: 2, nameVi: 'Giáo dục', nameEn: 'Education' },
    { group: 'DOMAIN', code: 'Y_TE', order: 3, nameVi: 'Y tế', nameEn: 'Healthcare' },
    { group: 'DOMAIN', code: 'NONG_NGHIEP', order: 4, nameVi: 'Nông nghiệp & PTNT', nameEn: 'Agriculture & Rural Development' },
    { group: 'DOMAIN', code: 'CONG_THUONG', order: 5, nameVi: 'Công thương', nameEn: 'Industry & Trade' },

    { group: 'CONTENT_TYPE', code: 'ARTICLE', order: 1, nameVi: 'Bài viết', nameEn: 'Article' },
    { group: 'CONTENT_TYPE', code: 'NOTIF', order: 2, nameVi: 'Thông báo', nameEn: 'Notification' },
    { group: 'CONTENT_TYPE', code: 'POLICY', order: 3, nameVi: 'Văn bản chỉ đạo', nameEn: 'Policy Instruction' },

    { group: 'DEPARTMENT', code: 'VAN_PHONG', order: 1, nameVi: 'Văn phòng Sở', nameEn: 'Department Office' },
    { group: 'DEPARTMENT', code: 'PHONG_KE_HOACH', order: 2, nameVi: 'Phòng Kế hoạch - Tài chính', nameEn: 'Planning & Finance Division' },

    // --- WORKFLOW ---
    { group: 'WORKFLOW_TRIGGER', code: 'MANUAL', order: 1, nameVi: 'Kích hoạt thủ công', nameEn: 'Manual Trigger' },
    { group: 'WORKFLOW_TRIGGER', code: 'POST_SUBMIT', order: 2, nameVi: 'Khi gửi duyệt bài viết', nameEn: 'On Article Submitted' },
    { group: 'WORKFLOW_TRIGGER', code: 'DOC_RECEIVED', order: 3, nameVi: 'Khi nhận văn bản mới', nameEn: 'On Document Received' },
    { group: 'WORKFLOW_TRIGGER', code: 'USER_CREATED', order: 4, nameVi: 'Khi tạo tài khoản mới', nameEn: 'On User Account Created' },

    { group: 'WORKFLOW_ACTION', code: 'APPROVE', order: 1, nameVi: 'Phê duyệt', nameEn: 'Approve' },
    { group: 'WORKFLOW_ACTION', code: 'REJECT', order: 2, nameVi: 'Từ chối', nameEn: 'Reject' },
    { group: 'WORKFLOW_ACTION', code: 'PUBLISH', order: 3, nameVi: 'Xuất bản', nameEn: 'Publish' },
    { group: 'WORKFLOW_ACTION', code: 'REQUEST_INFO', order: 4, nameVi: 'Yêu cầu bổ sung', nameEn: 'Request More Info' },

    // --- BANNER POSITIONS ---
    { group: 'BANNER_POSITION', code: 'top', order: 1, nameVi: 'Đầu trang (Header)', nameEn: 'Top (Header)' },
    { group: 'BANNER_POSITION', code: 'middle_1', order: 2, nameVi: 'Giữa trang - Vị trí 1', nameEn: 'Middle - Position 1' },
    { group: 'BANNER_POSITION', code: 'middle_2', order: 3, nameVi: 'Giữa trang - Vị trí 2', nameEn: 'Middle - Position 2' },
    { group: 'BANNER_POSITION', code: 'middle_3', order: 4, nameVi: 'Giữa trang - Vị trí 3', nameEn: 'Middle - Position 3' },
    { group: 'BANNER_POSITION', code: 'middle', order: 5, nameVi: 'Thân trang (Sidebar)', nameEn: 'Sidebar (Middle)' },
    { group: 'BANNER_POSITION', code: 'bottom', order: 6, nameVi: 'Cuối trang (Footer)', nameEn: 'Bottom (Footer)' },
    { group: 'BANNER_POSITION', code: 'custom', order: 7, nameVi: 'Khẩu hiệu chính', nameEn: 'Custom Slogan' },

    // --- PORTAL APPEARANCE CONFIGURATIONS ---
    { group: 'font_family', code: "'Times New Roman', Times, serif", order: 1, nameVi: 'Serif Uy Nghiêm (Government)', nameEn: 'Government Serif' },
    { group: 'font_family', code: "'Inter', sans-serif", order: 2, nameVi: 'Sans-Serif Hiện Đại (Inter)', nameEn: 'Modern Sans-Serif' },
    { group: 'font_family', code: "'Outfit', 'Inter', sans-serif", order: 3, nameVi: 'Trẻ Trung (Outfit)', nameEn: 'Outfit Sans-Serif' },
    { group: 'font_family', code: "'Roboto Mono', monospace", order: 4, nameVi: 'Tối Giản Hướng Công Nghệ', nameEn: 'Monospace Minimal' },

    { group: 'border_radius', code: '0px', order: 1, nameVi: 'Không bo góc (0px)', nameEn: 'No border radius (0px)' },
    { group: 'border_radius', code: '4px', order: 2, nameVi: 'Bo góc nhỏ (4px)', nameEn: 'Small radius (4px)' },
    { group: 'border_radius', code: '8px', order: 3, nameVi: 'Bo góc trung bình (8px)', nameEn: 'Medium radius (8px)' },
    { group: 'border_radius', code: '12px', order: 4, nameVi: 'Bo góc tròn (12px)', nameEn: 'Round radius (12px)' },
    { group: 'border_radius', code: '16px', order: 5, nameVi: 'Bo góc lớn (16px)', nameEn: 'Large radius (16px)' },
  ];

  console.log(`📦 Seeding ${categoriesData.length} categories with dual translations...`);
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { group_code: { group: cat.group, code: cat.code } },
      update: { order: cat.order },
      create: { group: cat.group, code: cat.code, order: cat.order, isSystem: true },
    });

    // Seed default Vietnamese translation
    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: category.id, langCode: 'vi' } },
      update: { name: cat.nameVi },
      create: {
        categoryId: category.id,
        langCode: 'vi',
        name: cat.nameVi,
      }
    });

    // Seed English translation
    await prisma.categoryTranslation.upsert({
      where: { categoryId_langCode: { categoryId: category.id, langCode: 'en' } },
      update: { name: cat.nameEn },
      create: {
        categoryId: category.id,
        langCode: 'en',
        name: cat.nameEn,
      }
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
    { code: 'WARD', name: 'Danh mục Phường/Xã' },
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
    { code: 'ACADEMIC_RANK', name: 'Học hàm/Học vị' },
    { code: 'POLITICAL_THEORY', name: 'Lý luận chính trị' },
    { code: 'STATE_MANAGEMENT', name: 'Quản lý nhà nước' },
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
    { code: 'PHONG_BAN_HUYEN', name: 'Phòng, Ban chuyên môn cấp Huyện', level: 3 },
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
    { code: 'AUTHOR', name: 'Biên tập viên', permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'VIEW'] },
    { code: 'REVIEWER', name: 'Thẩm định & Phê duyệt', permissions: ['READ', 'VIEW', 'UPDATE', 'APPROVE', 'REJECT'] },
    { code: 'PUBLISHER', name: 'Cán bộ xuất bản', permissions: ['READ', 'VIEW', 'PUBLISH'] },
  ];

  const roleMap: Record<string, any> = { SUPER_ADMIN: superAdminRole, ADMIN: adminRole };

  for (const r of cmsRoles) {
    const rolePerms: { id: number }[] = [];
    const postResId = resources['POST'].id;

    for (const action of r.permissions) {
      const perm = await prisma.permission.findUnique({
        where: { action_resourceId: { action: action === 'REJECT' ? 'UPDATE' : action, resourceId: postResId } }
      });
      if (perm) rolePerms.push({ id: perm.id });
    }

    const createdRole = await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name, permissions: { set: rolePerms } },
      create: { code: r.code, name: r.name, permissions: { connect: rolePerms } },
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
  const linkMenuPBAC = async (menuId: number, resCode: string, action: string = 'READ') => {
    const resId = resources[resCode]?.id;
    if (!resId) return;
    const perm = await prisma.permission.findUnique({
      where: { action_resourceId: { action, resourceId: resId } }
    });
    if (perm) {
      await prisma.menuRequiredPermission.upsert({
        where: { menuId_permissionId: { menuId, permissionId: perm.id } },
        update: {},
        create: { menuId, permissionId: perm.id }
      });
    }
  };

  // --- SERVICE ROOTS ---
  const services = [
    { code: 'USER_SERVICE_ROOT', name: 'Quản trị Hệ thống', icon: 'shield-checkmark-outline', service: 'USER_SERVICE', color: '#3b82f6', order: 1, res: 'USER' },
    { code: 'HRM_SERVICE_ROOT', name: 'Quản lý Nhân sự', icon: 'people-outline', service: 'HRM_SERVICE', color: '#10b981', order: 2, res: 'HRM_EMPLOYEE' },
    { code: 'DOCUMENT_SERVICE_ROOT', name: 'Quản lý Văn bản', icon: 'document-text-outline', service: 'DOCUMENT_SERVICE', color: '#f59e0b', order: 3, res: 'DOC_INCOMING' },
    { code: 'CONTENT_SERVICE_ROOT', name: 'Quản lý Nội dung', icon: 'newspaper-outline', service: 'CONTENT_SERVICE', color: '#ec4899', order: 4, res: 'POST' },
    { code: 'WORKFLOW_SERVICE_ROOT', name: 'Quy trình Nghiệp vụ', icon: 'layers-outline', service: 'WORKFLOW_SERVICE', color: '#8b5cf6', order: 5, res: 'WORKFLOW' },
  ];

  const serviceNodes: Record<string, any> = {};
  for (const sys of services) {
    const node = await prisma.menu.upsert({
      where: { code: sys.code },
      update: { parentId: rootMenu.id, name: sys.name, icon: sys.icon, iconColor: sys.color, order: sys.order, service: sys.service },
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
    { code: 'ADMIN_USERS', name: 'Người dùng', route: 'users', icon: 'person-outline', order: 1, res: 'USER' },
    { code: 'ADMIN_ROLES', name: 'Vai trò & Quyền', route: 'roles', icon: 'lock-closed-outline', order: 2, res: 'ROLE' },
    { code: 'ADMIN_RESOURCES', name: 'Tài nguyên', route: 'resources', icon: 'shield-checkmark-outline', order: 3, res: 'RESOURCE' },
    { code: 'ADMIN_MENUS', name: 'Cấu hình Menu', route: 'menus', icon: 'list-outline', order: 4, res: 'MENU' },
    { code: 'ADMIN_ORGANIZATION', name: 'Đơn vị & Phòng ban', route: 'organization', icon: 'apartment', order: 5, res: 'ORGANIZATION' },
    { code: 'ADMIN_CATEGORIES', name: 'Danh mục hệ thống', route: 'categories', icon: 'cog-outline', order: 6, res: 'CATEGORY' },
    { code: 'ADMIN_NOTIFICATIONS', name: 'Thông báo', route: 'notifications', icon: 'megaphone-outline', order: 7, res: 'NOTIFICATION' },
  ];

  for (const { res, ...m } of adminMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['USER_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['USER_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'USER_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 2. Document Module
  const docMenus = [
    { code: 'DOC_MENU_INCOMING', name: 'Văn bản đến', route: 'incoming', icon: 'document-attach-outline', order: 1, res: 'DOC_INCOMING' },
    { code: 'DOC_MENU_OUTGOING', name: 'Văn bản đi', route: 'outgoing', icon: 'document-attach-outline', order: 2, res: 'DOC_OUTGOING' },
    { code: 'DOC_MENU_PROCESSING', name: 'Xử lý văn bản', route: 'processing', icon: 'document-text-outline', order: 3, res: 'DOC_PROCESSING' },
    { code: 'DOC_MENU_PUBLISH', name: 'Phát hành', route: 'publish', icon: 'globe-outline', order: 4, res: 'DOC_PUBLISH' },
    { code: 'DOC_MENU_TRANSPARENCY', name: 'Công khai văn bản', route: 'transparency', icon: 'folder-outline', order: 5, res: 'DOC_TRANSPARENCY' },
    { code: 'DOC_MENU_FINANCE', name: 'Công khai Tài chính', route: 'transparency/finance', icon: 'cash-outline', order: 6, res: 'DOC_TRANSPARENCY' },
    { code: 'DOC_MENU_CONSULTATION', name: 'Lấy ý kiến dự thảo', route: 'consultations', icon: 'people-outline', order: 7, res: 'DOC_CONSULTATION' },
    { code: 'DOC_MENU_FEEDBACKS', name: 'Duyệt Góp ý Công chúng', route: 'consultations/public-feedbacks', icon: 'megaphone-outline', order: 8, res: 'DOC_CONSULTATION' },
    { code: 'DOC_MENU_MINUTES', name: 'Biên bản cuộc họp', route: 'minutes', icon: 'list-outline', order: 9, res: 'DOC_MINUTES' },
    { code: 'DOC_MENU_CATEGORIES', name: 'Danh mục dùng chung', route: 'categories', icon: 'settings-outline', order: 10, res: 'DOC_CATEGORIES' },
    { code: 'DOC_MENU_PROCEDURES', name: 'Thủ tục hành chính', route: 'procedures', icon: 'briefcase-outline', order: 11, res: 'DOC_INCOMING' },
    { code: 'DOC_MENU_DOSSIERS', name: 'Hồ sơ một cửa', route: 'dossiers', icon: 'folder-open-outline', order: 12, res: 'DOC_INCOMING' },
  ];

  for (const { res, ...m } of docMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['DOCUMENT_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['DOCUMENT_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'DOCUMENT_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 3. HRM Module
  const hrmMenus = [
    { code: 'HRM_MENU_EMPLOYEE_LIST', name: 'Danh sách cán bộ', route: 'employees', icon: 'people-outline', order: 1, res: 'HRM_EMPLOYEE' },
  ];

  for (const { res, ...m } of hrmMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['HRM_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['HRM_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'HRM_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // 4. Content Module
  const postMenus = [
    { code: 'CONTENT_MENU_POSTS', name: 'Danh sách bài viết', route: '', icon: 'newspaper-outline', order: 1, res: 'POST' },
    { code: 'CONTENT_MENU_CATEGORIES', name: 'Chuyên mục', route: 'categories', icon: 'list-outline', order: 2, res: 'POST_CATEGORY' },
    { code: 'CONTENT_MENU_PORTAL', name: 'Cấu hình Portal Menu', route: 'portal-menu', icon: 'menu-outline', order: 3, res: 'PORTAL_MENU' },
    { code: 'CONTENT_MENU_INTERACTIONS', name: 'Tương tác công dân', route: 'interactions', icon: 'chatbubbles-outline', order: 4, res: 'CITIZEN_INTERACTION' },
    { code: 'CONTENT_MENU_BANNERS', name: 'Banner & Quảng cáo', route: 'banners', icon: 'layers-outline', order: 5, res: 'BANNER' },
    { code: 'CONTENT_MENU_PORTAL_CONFIG', name: 'Cấu hình chung đơn vị', route: 'portal-config', icon: 'settings-outline', order: 6, res: 'PORTAL_MENU' },
  ];

  for (const { res, ...m } of postMenus) {
    const node = await prisma.menu.upsert({
      where: { code: m.code },
      update: { parentId: serviceNodes['CONTENT_SERVICE'].id, order: m.order, route: m.route, icon: m.icon },
      create: { ...m, parentId: serviceNodes['CONTENT_SERVICE'].id, application: 'ADMIN_PORTAL', service: 'CONTENT_SERVICE' },
    });
    await linkMenuPBAC(node.id, res, 'READ');
  }

  // Sub-menus for Interactions
  const interactionParent = await prisma.menu.findUnique({ where: { code: 'CONTENT_MENU_INTERACTIONS' } });
  if (interactionParent) {
    const interactionSubMenus = [
      { code: 'CONTENT_MENU_COMMENTS', name: 'Kiểm duyệt bình luận', route: 'interactions/comments', icon: 'chatbox-outline', order: 1, res: 'CITIZEN_INTERACTION' },
      { code: 'CONTENT_MENU_QUESTIONS', name: 'Hỏi đáp công dân', route: 'interactions/questions', icon: 'help-circle-outline', order: 2, res: 'CITIZEN_INTERACTION' },
      { code: 'CONTENT_MENU_FEEDBACKS', name: 'Góp ý dự thảo', route: 'interactions/feedbacks', icon: 'create-outline', order: 3, res: 'CITIZEN_INTERACTION' },
    ];

    for (const { res, ...m } of interactionSubMenus) {
      const node = await prisma.menu.upsert({
        where: { code: m.code },
        update: { parentId: interactionParent.id, order: m.order, route: m.route, icon: m.icon },
        create: { ...m, parentId: interactionParent.id, application: 'ADMIN_PORTAL', service: 'CONTENT_SERVICE' },
      });
      await linkMenuPBAC(node.id, res, 'READ');
    }
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
    { email: 'author@daklak.gov.vn', username: 'author', fullName: 'Nguyễn Văn Biên Tập', role: 'AUTHOR' },
    { email: 'reviewer@daklak.gov.vn', username: 'reviewer', fullName: 'Lê Văn Thẩm Định', role: 'REVIEWER' },
    { email: 'approver@daklak.gov.vn', username: 'approver', fullName: 'Phạm Phê Duyệt', role: 'REVIEWER' },
    { email: 'publisher@daklak.gov.vn', username: 'publisher', fullName: 'Trần Xuất Bản', role: 'PUBLISHER' },
    { email: 'trungthanh@daklak.gov.vn', username: 'trungthanh', fullName: 'Trần Trung Thành', role: 'ADMIN' },
  ];

  for (const u of cmsUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, roles: { set: [{ id: roleMap[u.role].id }] } },
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
    { code: 'CHU_TICH', name: 'Chủ tịch', category: 'EXECUTIVE', rank: 1, type: 'GOVERNMENT' },
    { code: 'PHO_CHU_TICH', name: 'Phó Chủ tịch', category: 'EXECUTIVE', rank: 2, type: 'GOVERNMENT' },
    { code: 'GIAM_DOC', name: 'Giám đốc', category: 'EXECUTIVE', rank: 1, type: 'GOVERNMENT' },
    { code: 'PHO_GIAM_DOC', name: 'Phó Giám đốc', category: 'EXECUTIVE', rank: 2, type: 'GOVERNMENT' },
    { code: 'TRUONG_PHONG', name: 'Trưởng phòng', category: 'MANAGER', rank: 1, type: 'GOVERNMENT' },
    { code: 'PHO_PHONG', name: 'Phó Trưởng phòng', category: 'MANAGER', rank: 2, type: 'GOVERNMENT' },
    { code: 'CHUYEN_VIEN', name: 'Chuyên viên', category: 'STAFF', rank: 3, type: 'RANK' },
    { code: 'CHUYEN_VIEN_CAO_CAP', name: 'Chuyên viên cao cấp', category: 'STAFF', rank: 1, type: 'RANK' },
    { code: 'CHUYEN_VIEN_CHINH', name: 'Chuyên viên chính', category: 'STAFF', rank: 2, type: 'RANK' },
    { code: 'CAN_SU', name: 'Cán sự', category: 'STAFF', rank: 4, type: 'RANK' },
    { code: 'NHAN_VIEN', name: 'Nhân viên', category: 'SUPPORT', rank: 5, type: 'RANK' },
    { code: 'CONG_CHUC_PHU_TRACH', name: 'Công chức phụ trách', category: 'STAFF', rank: 3, type: 'GOVERNMENT' },
    { code: 'CAN_BO_PHU_TRACH', name: 'Cán bộ phụ trách', category: 'STAFF', rank: 3, type: 'GOVERNMENT' },
    { code: 'BI_THU_DANG_BO', name: 'Bí thư Đảng bộ', category: 'EXECUTIVE', rank: 1, type: 'PARTY' },
    { code: 'PHO_BI_THU_DANG_BO', name: 'Phó Bí thư Đảng bộ', category: 'EXECUTIVE', rank: 2, type: 'PARTY' },
    { code: 'BI_THU_CHI_BO', name: 'Bí thư Chi bộ', category: 'EXECUTIVE', rank: 1, type: 'PARTY' },
    { code: 'PHO_BI_THU_CHI_BO', name: 'Phó Bí thư Chi bộ', category: 'EXECUTIVE', rank: 2, type: 'PARTY' },
    { code: 'BI_THU', name: 'Bí thư', category: 'EXECUTIVE', rank: 1, type: 'PARTY' },
    { code: 'PHO_BI_THU', name: 'Phó Bí thư', category: 'EXECUTIVE', rank: 2, type: 'PARTY' },
    { code: 'TRUONG_BAN', name: 'Trưởng ban', category: 'MANAGER', rank: 1, type: 'GOVERNMENT' },
    { code: 'PHO_TRUONG_BAN', name: 'Phó Trưởng ban', category: 'MANAGER', rank: 2, type: 'GOVERNMENT' },
  ];

  for (const jt of jobTitlesData) {
    await prisma.jobTitle.upsert({
      where: { code: jt.code },
      update: { name: jt.name, category: jt.category, rank: jt.rank, type: jt.type },
      create: jt,
    });
  }

  // 7.1 LINK JOB TITLES TO UNIT TYPES (Using Template)
  console.log('📦 Cleaning and linking Job Titles to Unit Types...');
  await prisma.unitTypeJobTemplate.deleteMany({});

  const links = [
    { jt: 'CHU_TICH', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'HDND_TINH', 'HDND_HUYEN', 'HDND_XA'] },
    { jt: 'PHO_CHU_TICH', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'HDND_TINH', 'HDND_HUYEN', 'HDND_XA'] },
    { jt: 'GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_GIAM_DOC', types: ['SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'TRUONG_PHONG', types: ['PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'PHO_PHONG', types: ['PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM', 'CHI_CUC'] },
    { jt: 'CHUYEN_VIEN', types: ['PHONG_BAN_HUYEN', 'SO_NGANH', 'DVSN', 'TRUNG_TAM', 'CHI_CUC', 'CQ_TU', 'UBND_TINH', 'UBND_HUYEN'] },
    { jt: 'CHUYEN_VIEN_CAO_CAP', types: ['UBND_TINH', 'SO_NGANH'] },
    { jt: 'CHUYEN_VIEN_CHINH', types: ['UBND_TINH', 'UBND_HUYEN', 'SO_NGANH'] },
    { jt: 'CAN_SU', types: ['UBND_HUYEN', 'UBND_XA', 'PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM'] },
    { jt: 'NHAN_VIEN', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'SO_NGANH', 'PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM'] },
    { jt: 'CONG_CHUC_PHU_TRACH', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'SO_NGANH', 'PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM'] },
    { jt: 'CAN_BO_PHU_TRACH', types: ['UBND_TINH', 'UBND_HUYEN', 'UBND_XA', 'SO_NGANH', 'PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM'] },
    { jt: 'BI_THU_DANG_BO', types: ['SO_NGANH', 'UBND_TINH', 'UBND_HUYEN'] },
    { jt: 'PHO_BI_THU_DANG_BO', types: ['SO_NGANH', 'UBND_TINH', 'UBND_HUYEN'] },
    { jt: 'BI_THU_CHI_BO', types: ['SO_NGANH', 'PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM', 'CHI_CUC', 'UBND_XA'] },
    { jt: 'PHO_BI_THU_CHI_BO', types: ['SO_NGANH', 'PHONG_BAN_HUYEN', 'DVSN', 'TRUNG_TAM', 'CHI_CUC', 'UBND_XA'] },
    { jt: 'BI_THU', types: ['CQ_DANG', 'UBND_TINH', 'UBND_HUYEN', 'UBND_XA'] },
    { jt: 'PHO_BI_THU', types: ['CQ_DANG', 'UBND_TINH', 'UBND_HUYEN', 'UBND_XA'] },
    { jt: 'TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
    { jt: 'PHO_TRUONG_BAN', types: ['CQ_DANG', 'TO_CHUC_CTXH'] },
  ];

  for (const link of links) {
    const jobTitle = await prisma.jobTitle.findUnique({ where: { code: link.jt } });
    if (jobTitle) {
      for (const typeCode of link.types) {
        const typeId = unitTypeMap[typeCode]?.id;
        if (typeId) {
          await prisma.unitTypeJobTemplate.upsert({
            where: { unitTypeId_jobTitleId: { unitTypeId: typeId, jobTitleId: jobTitle.id } },
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
    where: { code: 'UBND_TINH_DAKLAK' },
    update: { name: 'UBND Tỉnh Đắk Lắk', typeId: ubndTinhTypeId },
    create: { code: 'UBND_TINH_DAKLAK', name: 'UBND Tỉnh Đắk Lắk', typeId: ubndTinhTypeId, shortName: 'UBND Tỉnh' },
  });

  const depts = [
    { code: 'SO_KHCN', name: 'Sở Khoa học và Công nghệ', shortName: 'Sở KH&CN' },
    { code: 'SO_GTVT', name: 'Sở Giao thông vận tải', shortName: 'Sở GTVT' },
    { code: 'SO_YTE', name: 'Sở Y tế', shortName: 'Sở Y tế' },
    { code: 'SO_GDDT', name: 'Sở Giáo dục và Đào tạo', shortName: 'Sở GD&ĐT' },
    { code: 'SO_TC', name: 'Sở Tài chính', shortName: 'Sở Tài chính' },
    { code: 'SO_KHDT', name: 'Sở Kế hoạch và Đầu tư', shortName: 'Sở KH&ĐT' },
    { code: 'SO_NV', name: 'Sở Nội vụ', shortName: 'Sở Nội vụ' },
    { code: 'VP_UBND', name: 'Văn phòng UBND tỉnh', shortName: 'VP UBND' },
  ];

  for (const d of depts) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: soTypeId },
      create: { ...d, parentId: province.id, typeId: soTypeId },
    });
  }

  const districtsUnits = [
    { code: 'UBND_BMT', name: 'UBND Thành phố Buôn Ma Thuột', shortName: 'UBND BMT' },
    { code: 'UBND_BUON_HO', name: 'UBND Thị xã Buôn Hồ', shortName: 'UBND Buôn Hồ' },
  ];

  for (const d of districtsUnits) {
    await prisma.organizationUnit.upsert({
      where: { code: d.code },
      update: { parentId: province.id, typeId: ubndHuyenTypeId },
      create: { ...d, parentId: province.id, typeId: ubndHuyenTypeId },
    });
  }

  // Thêm ví dụ UBND Xã
  const ubndBmt = await prisma.organizationUnit.findUnique({ where: { code: 'UBND_BMT' } });
  if (ubndBmt) {
    await prisma.organizationUnit.upsert({
      where: { code: 'UBND_XA_TAN_LOI' },
      update: { parentId: ubndBmt.id, typeId: ubndXaTypeId },
      create: { code: 'UBND_XA_TAN_LOI', name: 'UBND Phường Tân Lợi', parentId: ubndBmt.id, typeId: ubndXaTypeId },
    });
  }

  // Thêm Đơn vị sự nghiệp tiêu biểu
  const soKhcn = await prisma.organizationUnit.findUnique({ where: { code: 'SO_KHCN' } });
  if (soKhcn) {
    await prisma.organizationUnit.upsert({
      where: { code: 'TT_CNTT_KHCN' },
      update: { parentId: soKhcn.id, typeId: trungTamTypeId },
      create: { code: 'TT_CNTT_KHCN', name: 'Trung tâm Công nghệ thông tin và Khoa học công nghệ', parentId: soKhcn.id, typeId: trungTamTypeId },
    });
  }

  console.log('🎉 COMPREHENSIVE E-GOV SEED COMPLETED');
  console.log(`👉 SuperAdmin: superadmin@sys.com / ${DEFAULT_PASSWORD}`);

  console.log('📦 Seeding Departments for Organizations...');

  // helper tạo phòng ban
  const createDept = async (parentCode: string, dept: { code: string; name: string }) => {
    const parent = await prisma.organizationUnit.findUnique({
      where: { code: parentCode },
    });
    if (!parent) return;

    await prisma.organizationUnit.upsert({
      where: { code: dept.code },
      update: { parentId: parent.id },
      create: {
        code: dept.code,
        name: dept.name,
        parentId: parent.id,
        typeId: phongTypeId,
      },
    });
  };

  // ==========================
  // 1. SỞ KHOA HỌC & CÔNG NGHỆ
  // ==========================
  await createDept('SO_KHCN', { code: 'SO_KHCN_VP', name: 'Văn phòng Sở' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_TT', name: 'Thanh tra Sở' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_KHTC', name: 'Phòng Kế hoạch - Tài chính' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_QLKH', name: 'Phòng Quản lý Khoa học' });
  await createDept('SO_KHCN', { code: 'SO_KHCN_CNSH', name: 'Phòng Công nghệ & Sở hữu trí tuệ' });

  // ==========================
  // 2. SỞ Y TẾ
  // ==========================
  await createDept('SO_YTE', { code: 'SO_YTE_VP', name: 'Văn phòng Sở' });
  await createDept('SO_YTE', { code: 'SO_YTE_TT', name: 'Thanh tra Sở' });
  await createDept('SO_YTE', { code: 'SO_YTE_KHTC', name: 'Phòng Kế hoạch - Tài chính' });
  await createDept('SO_YTE', { code: 'SO_YTE_NVY', name: 'Phòng Nghiệp vụ Y' });
  await createDept('SO_YTE', { code: 'SO_YTE_DUOC', name: 'Phòng Quản lý Dược' });

  // ==========================
  // 3. SỞ GIÁO DỤC
  // ==========================
  await createDept('SO_GDDT', { code: 'SO_GDDT_VP', name: 'Văn phòng Sở' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_TT', name: 'Thanh tra Sở' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_KHTC', name: 'Phòng Kế hoạch - Tài chính' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_TCCB', name: 'Phòng Tổ chức Cán bộ' });
  await createDept('SO_GDDT', { code: 'SO_GDDT_GDTRH', name: 'Phòng Giáo dục Trung học' });

  // ==========================
  // 4. SỞ TÀI CHÍNH
  // ==========================
  await createDept('SO_TC', { code: 'SO_TC_VP', name: 'Văn phòng Sở' });
  await createDept('SO_TC', { code: 'SO_TC_TT', name: 'Thanh tra Sở' });
  await createDept('SO_TC', { code: 'SO_TC_NS', name: 'Phòng Ngân sách' });
  await createDept('SO_TC', { code: 'SO_TC_HCSN', name: 'Phòng Hành chính sự nghiệp' });

  // ==========================
  // 5. UBND TP BUÔN MA THUỘT
  // ==========================
  await createDept('UBND_BMT', { code: 'BMT_VP', name: 'Văn phòng HĐND & UBND' });
  await createDept('UBND_BMT', { code: 'BMT_NV', name: 'Phòng Nội vụ' });
  await createDept('UBND_BMT', { code: 'BMT_TC_KH', name: 'Phòng Tài chính - Kế hoạch' });
  await createDept('UBND_BMT', { code: 'BMT_KT', name: 'Phòng Kinh tế' });
  await createDept('UBND_BMT', { code: 'BMT_TNMT', name: 'Phòng Tài nguyên & Môi trường' });

  // ==========================
  // 6. UBND BUÔN HỒ
  // ==========================
  await createDept('UBND_BUON_HO', { code: 'BH_VP', name: 'Văn phòng HĐND & UBND' });
  await createDept('UBND_BUON_HO', { code: 'BH_NV', name: 'Phòng Nội vụ' });
  await createDept('UBND_BUON_HO', { code: 'BH_TC_KH', name: 'Phòng Tài chính - Kế hoạch' });
  await createDept('UBND_BUON_HO', { code: 'BH_KT_HT', name: 'Phòng Kinh tế - Hạ tầng' });

  // ==========================================================
  // 9. JOB POSITIONS
  // ==========================================================
  console.log('📦 Seeding Job Positions...');
  const targetUser = await prisma.user.findUnique({
    where: { email: 'trungthanh@daklak.gov.vn' },
  });
  const soKhcnUnit = await prisma.organizationUnit.findUnique({
    where: { code: 'SO_KHCN' },
  });
  const congChucJob = await prisma.jobTitle.findUnique({
    where: { code: 'CONG_CHUC_PHU_TRACH' },
  });

  if (targetUser && soKhcnUnit && congChucJob) {
    const existingPosition = await prisma.jobPosition.findFirst({
      where: {
        userId: targetUser.id,
        unitId: soKhcnUnit.id,
        jobTitleId: congChucJob.id,
      },
    });

    if (!existingPosition) {
      await prisma.jobPosition.create({
        data: {
          userId: targetUser.id,
          unitId: soKhcnUnit.id,
          jobTitleId: congChucJob.id,
          isPrimary: true,
          isUnitLeader: false,
          isDeputyLeader: false,
        },
      });
      console.log('✅ Created job position for Trần Trung Thành at Sở KH&CN');
    } else {
      console.log('ℹ️ Job position already exists for Trần Trung Thành');
    }
  } else {
    console.warn('⚠️ Could not find targetUser, soKhcnUnit, or congChucJob to seed JobPosition');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });