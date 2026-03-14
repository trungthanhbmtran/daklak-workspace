/**
 * Seed script – nạp dữ liệu mẫu và cập nhật database (idempotent, an toàn chạy lại).
 * Sau khi chuyển RBAC → PBAC: seed cập nhật menu SYS_RBAC thành SYS_PBAC.
 *
 * Chạy để cập nhật database (từ thư mục project_stc/user-service):
 *   npm run prisma:seed
 *
 * Yêu cầu: DATABASE_URL trong .env (file .env ở thư mục user-service hoặc root).
 */
import * as bcrypt from 'bcrypt'; // Hoặc 'bcryptjs' tùy package bạn cài
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mysql from 'mysql2'; // Đảm bảo đã cài: npm install mysql2
dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL chưa được đặt. Tạo file .env với DATABASE_URL="mysql://..."');
  process.exit(1);
}

const adapter = new PrismaMariaDb(url);

const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'Admin@123';

async function main() {
  console.log('🌱 Bắt đầu nạp dữ liệu mẫu (Full Schema + Rich Data)...');

  // ==========================================================
  // 1. NẠP DANH MỤC DÙNG CHUNG (CATEGORIES) – bảng sys_categories
  // ==========================================================
  console.log('🔹 1. Đang nạp Danh mục dùng chung (Categories)...');

  const categories: { group: string; code: string; name: string; order: number }[] = [
    // --- Loại đơn vị (theo NĐ 24/2014, 107/2020 - cơ cấu Sở) ---
    { group: 'UNIT_TYPE', code: 'PROVINCE_PC', name: 'UBND Tỉnh / Thành phố', order: 1 },
    { group: 'UNIT_TYPE', code: 'DEPARTMENT', name: 'Sở / Ban / Ngành', order: 2 },
    { group: 'UNIT_TYPE', code: 'DISTRICT_PC', name: 'UBND Quận / Huyện', order: 3 },
    { group: 'UNIT_TYPE', code: 'DIVISION', name: 'Phòng chuyên môn, nghiệp vụ', order: 4 },
    { group: 'UNIT_TYPE', code: 'CHI_CUC', name: 'Chi cục / Tổ chức tương đương thuộc Sở', order: 5 },
    { group: 'UNIT_TYPE', code: 'INSPECTORATE', name: 'Thanh tra Sở', order: 6 },
    { group: 'UNIT_TYPE', code: 'OFFICE', name: 'Văn phòng Sở', order: 7 },
    { group: 'UNIT_TYPE', code: 'CENTER', name: 'Đơn vị sự nghiệp công lập', order: 8 },
    { group: 'UNIT_TYPE', code: 'WARD_PC', name: 'UBND Phường / Xã', order: 9 },
    // --- Lĩnh vực quản lý (Domain) – đơn vị & chức danh ---
    { group: 'DOMAIN', code: 'IT', name: 'Công nghệ thông tin', order: 1 },
    { group: 'DOMAIN', code: 'INTERNAL_AFFAIRS', name: 'Nội vụ', order: 2 },
    { group: 'DOMAIN', code: 'FINANCE', name: 'Tài chính - Kế toán', order: 3 },
    { group: 'DOMAIN', code: 'PLANNING', name: 'Kế hoạch - Đầu tư', order: 4 },
    { group: 'DOMAIN', code: 'ORGANIZATION', name: 'Tổ chức - Cán bộ', order: 5 },
    { group: 'DOMAIN', code: 'SCIENCE_TECH', name: 'Khoa học và Công nghệ', order: 6 },
    { group: 'DOMAIN', code: 'ADMINISTRATION', name: 'Hành chính - Văn phòng', order: 7 },
    { group: 'DOMAIN', code: 'LEGAL', name: 'Pháp chế', order: 8 },
    { group: 'DOMAIN', code: 'OTHER', name: 'Lĩnh vực khác', order: 99 },
    // --- Khu vực địa lý phụ trách (chức danh) ---
    { group: 'GEO_AREA', code: 'WHOLE_PROVINCE', name: 'Toàn tỉnh / thành phố', order: 1 },
    { group: 'GEO_AREA', code: 'WHOLE_COUNTRY', name: 'Toàn quốc', order: 2 },
    { group: 'GEO_AREA', code: 'DISTRICT', name: 'Cấp quận/huyện', order: 3 },
    { group: 'GEO_AREA', code: 'WARD', name: 'Cấp phường/xã', order: 4 },
    { group: 'GEO_AREA', code: 'OTHER', name: 'Khác', order: 99 },
    // --- Giới tính ---
    { group: 'GENDER', code: 'MALE', name: 'Nam', order: 1 },
    { group: 'GENDER', code: 'FEMALE', name: 'Nữ', order: 2 },
    // --- Loại văn bản ---
    { group: 'DOCUMENT_TYPE', code: 'VAN_BAN_DEN', name: 'Văn bản đến', order: 1 },
    { group: 'DOCUMENT_TYPE', code: 'VAN_BAN_DI', name: 'Văn bản đi', order: 2 },
    { group: 'DOCUMENT_TYPE', code: 'BAO_CAO', name: 'Báo cáo', order: 3 },
    { group: 'DOCUMENT_TYPE', code: 'Nghi_quyet', name: 'Nghị quyết', order: 4 },
    { group: 'DOCUMENT_TYPE', code: 'Quyet_dinh', name: 'Quyết định', order: 5 },
    { group: 'DOCUMENT_TYPE', code: 'Chi_thi', name: 'Chỉ thị', order: 6 },
    // --- Trạng thái (nội dung, văn bản, đơn...) ---
    { group: 'STATUS', code: 'DRAFT', name: 'Nháp', order: 1 },
    { group: 'STATUS', code: 'PENDING', name: 'Chờ duyệt', order: 2 },
    { group: 'STATUS', code: 'ACTIVE', name: 'Đang hiệu lực', order: 3 },
    { group: 'STATUS', code: 'ARCHIVED', name: 'Lưu trữ', order: 4 },
    // --- Dịch vụ chức năng (SERVICE) – nghiệp vụ ---
    { group: 'SERVICE', code: 'HRM_SERVICE', name: 'Quản trị Nhân sự', order: 1 },
    { group: 'SERVICE', code: 'DOCUMENT_SERVICE', name: 'Quản lý Văn bản', order: 2 },
    { group: 'SERVICE', code: 'FILE_SERVICE', name: 'Quản lý Kho lưu trữ', order: 3 },
    { group: 'SERVICE', code: 'ORG_SERVICE', name: 'Quản lý Tổ chức', order: 4 },
    { group: 'SERVICE', code: 'MENU_SERVICE', name: 'Quản lý Menu', order: 5 },
    { group: 'SERVICE', code: 'ROLE_SERVICE', name: 'Quản lý Vai trò', order: 6 },
    { group: 'SERVICE', code: 'PERMISSION_SERVICE', name: 'Quản lý Quyền', order: 7 },
    { group: 'SERVICE', code: 'USER_SERVICE', name: 'Quản lý Người dùng', order: 8 },
    { group: 'SERVICE', code: 'CONTENT_SERVICE', name: 'Quản lý Nội dung Cổng TTĐT', order: 9 },
    // --- Microservice – tên service trong kiến trúc (Cổng TTĐT + Admin) ---
    { group: 'MICROSERVICE', code: 'API_GATEWAY', name: 'API Gateway', order: 1 },
    { group: 'MICROSERVICE', code: 'USER_SERVICE', name: 'User Service (Xác thực, PBAC, Menu)', order: 2 },
    { group: 'MICROSERVICE', code: 'HRM_SERVICE', name: 'HRM Service (Nhân sự)', order: 3 },
    { group: 'MICROSERVICE', code: 'NOTIFICATION_SERVICE', name: 'Notification Service (Thông báo, Email)', order: 4 },
    { group: 'MICROSERVICE', code: 'DOCUMENT_SERVICE', name: 'Document Service (Văn bản)', order: 5 },
    { group: 'MICROSERVICE', code: 'POSTS_SERVICE', name: 'Posts Service (Bài viết, Tin tức)', order: 6 },
    { group: 'MICROSERVICE', code: 'STORAGE_SERVICE', name: 'Storage Service (Kho lưu trữ)', order: 7 },
    { group: 'MICROSERVICE', code: 'TRANSLATE_SERVICE', name: 'Translate Service (Dịch)', order: 8 },
    { group: 'MICROSERVICE', code: 'POPULATION_SERVICE', name: 'Population Service (Dân cư)', order: 9 },
    { group: 'MICROSERVICE', code: 'CONTENT_SERVICE', name: 'Content Service (Nội dung Cổng)', order: 10 },
    { group: 'MICROSERVICE', code: 'CORE_SERVICE', name: 'Core Service (Tổng quan, Cấu hình)', order: 11 },
    // --- Loại bài viết / tin (Cổng nội dung) ---
    { group: 'CONTENT_TYPE', code: 'NEWS', name: 'Tin tức', order: 1 },
    { group: 'CONTENT_TYPE', code: 'EVENT', name: 'Sự kiện', order: 2 },
    { group: 'CONTENT_TYPE', code: 'ANNOUNCEMENT', name: 'Thông báo', order: 3 },
    { group: 'CONTENT_TYPE', code: 'DOCUMENT', name: 'Văn bản', order: 4 },
    { group: 'CONTENT_TYPE', code: 'PAGE', name: 'Trang tĩnh', order: 5 },
    // --- Ứng dụng (menu thuộc cổng nào) ---
    { group: 'APPLICATION', code: 'ADMIN_PORTAL', name: 'Cổng quản trị', order: 1 },
    { group: 'APPLICATION', code: 'CITIZEN_PORTAL', name: 'Cổng công dân', order: 2 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { group_code: { group: cat.group, code: cat.code } },
      update: { name: cat.name, order: cat.order },
      create: {
        group: cat.group,
        code: cat.code,
        name: cat.name,
        order: cat.order,
        isSystem: true,
      },
    });
  }
  console.log(`   → Đã nạp ${categories.length} danh mục dùng chung (groups: UNIT_TYPE, DOMAIN, GEO_AREA, GENDER, DOCUMENT_TYPE, STATUS, SERVICE, MICROSERVICE, CONTENT_TYPE, APPLICATION).`);

  // ==========================================================
  // 2. NẠP CHỨC DANH (JOB TITLES)
  // ==========================================================
  console.log('🔹 2. Đang nạp Chức danh...');

  // Chức danh theo NĐ 24/2014, 107/2020 (Sở: Giám đốc, Phó GĐ; Phòng: Trưởng/Phó phòng; Thanh tra, Văn phòng, Chi cục; UBND: Chủ tịch, Phó CT)
  const jobTitles = [
    { code: 'CHU_TICH', name: 'Chủ tịch' },
    { code: 'PHO_CHU_TICH', name: 'Phó Chủ tịch' },
    { code: 'GIAM_DOC', name: 'Giám đốc' },
    { code: 'PHO_GIAM_DOC', name: 'Phó Giám đốc' },
    { code: 'TRUONG_PHONG', name: 'Trưởng phòng' },
    { code: 'PHO_PHONG', name: 'Phó Trưởng phòng' },
    { code: 'CHI_CUC_TRUONG', name: 'Chi cục trưởng' },
    { code: 'CHI_CUC_PHO', name: 'Phó Chi cục trưởng' },
    { code: 'CHANH_THANH_TRA', name: 'Chánh Thanh tra' },
    { code: 'PHO_CHANH_THANH_TRA', name: 'Phó Chánh Thanh tra' },
    { code: 'CHANH_VAN_PHONG', name: 'Chánh Văn phòng' },
    { code: 'PHO_CHANH_VAN_PHONG', name: 'Phó Chánh Văn phòng' },
    { code: 'CHUYEN_VIEN', name: 'Chuyên viên' },
    { code: 'CHUYEN_VIEN_CHINH', name: 'Chuyên viên chính' },
  ];

  for (const title of jobTitles) {
    await prisma.jobTitle.upsert({
      where: { code: title.code },
      update: { name: title.name },
      create: { code: title.code, name: title.name },
    });
  }

  // 2b. Chức danh áp dụng cho loại đơn vị nào (Sở không có Chủ tịch, Phòng không có Giám đốc)
  const unitTypes = await prisma.category.findMany({ where: { group: 'UNIT_TYPE' }, orderBy: { order: 'asc' } });
  const typeByCode = Object.fromEntries(unitTypes.map((t) => [t.code, t]));
  const jobTitleByCode = async (code: string) => (await prisma.jobTitle.findUniqueOrThrow({ where: { code } })).id;

  // Chức danh áp dụng cho loại đơn vị (NĐ 24/2014, 107/2020: Sở không có Chủ tịch; Phòng không có Giám đốc; Chi cục có Chi cục trưởng/phó...)
  const jobTitleUnitTypeRules: { jobTitleCode: string; unitTypeCodes: string[] }[] = [
    { jobTitleCode: 'CHU_TICH', unitTypeCodes: ['PROVINCE_PC', 'DISTRICT_PC'] },
    { jobTitleCode: 'PHO_CHU_TICH', unitTypeCodes: ['PROVINCE_PC', 'DISTRICT_PC'] },
    { jobTitleCode: 'GIAM_DOC', unitTypeCodes: ['DEPARTMENT', 'CENTER'] },
    { jobTitleCode: 'PHO_GIAM_DOC', unitTypeCodes: ['DEPARTMENT', 'CENTER'] },
    { jobTitleCode: 'TRUONG_PHONG', unitTypeCodes: ['DIVISION', 'DEPARTMENT', 'CENTER', 'CHI_CUC'] },
    { jobTitleCode: 'PHO_PHONG', unitTypeCodes: ['DIVISION', 'DEPARTMENT', 'CENTER', 'CHI_CUC'] },
    { jobTitleCode: 'CHI_CUC_TRUONG', unitTypeCodes: ['CHI_CUC'] },
    { jobTitleCode: 'CHI_CUC_PHO', unitTypeCodes: ['CHI_CUC'] },
    { jobTitleCode: 'CHANH_THANH_TRA', unitTypeCodes: ['INSPECTORATE'] },
    { jobTitleCode: 'PHO_CHANH_THANH_TRA', unitTypeCodes: ['INSPECTORATE'] },
    { jobTitleCode: 'CHANH_VAN_PHONG', unitTypeCodes: ['OFFICE'] },
    { jobTitleCode: 'PHO_CHANH_VAN_PHONG', unitTypeCodes: ['OFFICE'] },
    { jobTitleCode: 'CHUYEN_VIEN', unitTypeCodes: ['DIVISION', 'DEPARTMENT', 'CENTER', 'CHI_CUC', 'INSPECTORATE', 'OFFICE', 'PROVINCE_PC', 'DISTRICT_PC', 'WARD_PC'] },
    { jobTitleCode: 'CHUYEN_VIEN_CHINH', unitTypeCodes: ['DIVISION', 'DEPARTMENT', 'CENTER', 'CHI_CUC', 'INSPECTORATE', 'OFFICE', 'PROVINCE_PC', 'DISTRICT_PC', 'WARD_PC'] },
  ];

  for (const rule of jobTitleUnitTypeRules) {
    const jtId = await jobTitleByCode(rule.jobTitleCode);
    for (const utCode of rule.unitTypeCodes) {
      const ut = typeByCode[utCode];
      if (ut) {
        await prisma.jobTitleUnitType.upsert({
          where: { jobTitleId_unitTypeId: { jobTitleId: jtId, unitTypeId: ut.id } },
          update: {},
          create: { jobTitleId: jtId, unitTypeId: ut.id },
        });
      }
    }
  }

  // ==========================================================
  // 3. NẠP PBAC (RESOURCE & PERMISSION)
  // ==========================================================
  console.log('🔹 3. Đang nạp Chính sách phân quyền (PBAC)...');

  const resSystem = await prisma.resource.upsert({
    where: { code: 'SYSTEM' },
    update: {},
    create: { code: 'SYSTEM', name: 'Hệ thống' },
  });

  const resUser = await prisma.resource.upsert({
    where: { code: 'USER_MGMT' },
    update: {},
    create: { code: 'USER_MGMT', name: 'Quản lý người dùng' },
  });

  const resOrg = await prisma.resource.upsert({
    where: { code: 'ORG_MGMT' },
    update: {},
    create: { code: 'ORG_MGMT', name: 'Quản lý tổ chức' },
  });

  const resMenu = await prisma.resource.upsert({
    where: { code: 'MENU_MGMT' },
    update: {},
    create: { code: 'MENU_MGMT', name: 'Quản lý menu' },
  });

  // Danh mục dùng chung (Danh mục dịch vụ / Categories) — dùng cho phân quyền xem menu
  const resCategory = await prisma.resource.upsert({
    where: { code: 'SYS_CATEGORY' },
    update: {},
    create: { code: 'SYS_CATEGORY', name: 'Danh mục dùng chung' },
  });

  // Tài nguyên & Quyền (Resources & Permissions – trang quản lý PBAC)
  const resResources = await prisma.resource.upsert({
    where: { code: 'RESOURCE_MGMT' },
    update: {},
    create: { code: 'RESOURCE_MGMT', name: 'Tài nguyên & Quyền (Resources & Permissions)' },
  });

  // HRM – Quản lý nhân sự
  const resHrm = await prisma.resource.upsert({
    where: { code: 'HRM_VIEW' },
    update: {},
    create: { code: 'HRM_VIEW', name: 'Quản lý Nhân sự' },
  });

  // Tạo Permissions cơ bản
  const permSystemView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resSystem.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resSystem.id },
  });

  const permUserRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resUser.id } },
    update: {},
    create: { action: 'READ', resourceId: resUser.id },
  });

  const permUserCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resUser.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resUser.id },
  });

  const permOrgRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resOrg.id } },
    update: {},
    create: { action: 'READ', resourceId: resOrg.id },
  });

  const permMenuRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resMenu.id } },
    update: {},
    create: { action: 'READ', resourceId: resMenu.id },
  });

  // Quyền xem Danh mục dùng chung (Danh mục dịch vụ) — gán vào role để hiển thị menu
  const permCategoryView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resCategory.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resCategory.id },
  });

  // ----- Chuẩn Cổng thông tin điện tử Chính phủ & hệ thống bên dưới -----
  const resNews = await prisma.resource.upsert({
    where: { code: 'NEWS_MGMT' },
    update: {},
    create: { code: 'NEWS_MGMT', name: 'Quản lý Tin tức' },
  });
  const resDocument = await prisma.resource.upsert({
    where: { code: 'DOCUMENT_MGMT' },
    update: {},
    create: { code: 'DOCUMENT_MGMT', name: 'Quản lý Văn bản' },
  });
  const resNotification = await prisma.resource.upsert({
    where: { code: 'NOTIFICATION_MGMT' },
    update: {},
    create: { code: 'NOTIFICATION_MGMT', name: 'Quản lý Thông báo' },
  });
  const resEvent = await prisma.resource.upsert({
    where: { code: 'EVENT_MGMT' },
    update: {},
    create: { code: 'EVENT_MGMT', name: 'Quản lý Sự kiện' },
  });
  const resPage = await prisma.resource.upsert({
    where: { code: 'PAGE_MGMT' },
    update: {},
    create: { code: 'PAGE_MGMT', name: 'Quản lý Trang tĩnh / Danh mục' },
  });
  const resPortalConfig = await prisma.resource.upsert({
    where: { code: 'PORTAL_CONFIG' },
    update: {},
    create: { code: 'PORTAL_CONFIG', name: 'Cấu hình cổng thông tin' },
  });
  const resStatistics = await prisma.resource.upsert({
    where: { code: 'STATISTICS_VIEW' },
    update: {},
    create: { code: 'STATISTICS_VIEW', name: 'Thống kê - Báo cáo' },
  });
  const resDashboard = await prisma.resource.upsert({
    where: { code: 'DASHBOARD_VIEW' },
    update: {},
    create: { code: 'DASHBOARD_VIEW', name: 'Tổng quan' },
  });

  const permNewsRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resNews.id } },
    update: {},
    create: { action: 'READ', resourceId: resNews.id },
  });
  const permNewsCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resNews.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resNews.id },
  });
  const permDocRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resDocument.id } },
    update: {},
    create: { action: 'READ', resourceId: resDocument.id },
  });
  const permDocCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resDocument.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resDocument.id },
  });
  const permNotifRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resNotification.id } },
    update: {},
    create: { action: 'READ', resourceId: resNotification.id },
  });
  const permNotifCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resNotification.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resNotification.id },
  });
  const permEventRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resEvent.id } },
    update: {},
    create: { action: 'READ', resourceId: resEvent.id },
  });
  const permEventCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resEvent.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resEvent.id },
  });
  const permPageRead = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'READ', resourceId: resPage.id } },
    update: {},
    create: { action: 'READ', resourceId: resPage.id },
  });
  const permPageCreate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'CREATE', resourceId: resPage.id } },
    update: {},
    create: { action: 'CREATE', resourceId: resPage.id },
  });
  const permPortalConfigView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resPortalConfig.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resPortalConfig.id },
  });
  const permStatisticsView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resStatistics.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resStatistics.id },
  });
  const permDashboardView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resDashboard.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resDashboard.id },
  });

  const permMenuUpdate = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'UPDATE', resourceId: resMenu.id } },
    update: {},
    create: { action: 'UPDATE', resourceId: resMenu.id },
  });

  const permResourceView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resResources.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resResources.id },
  });

  const permHrmView = await prisma.permission.upsert({
    where: { action_resourceId: { action: 'VIEW', resourceId: resHrm.id } },
    update: {},
    create: { action: 'VIEW', resourceId: resHrm.id },
  });

  const adminPermIds = [permSystemView.id, permUserRead.id, permUserCreate.id, permOrgRead.id, permMenuRead.id, permMenuUpdate.id, permCategoryView.id, permResourceView.id];
  const managerPermIds = [permSystemView.id, permUserRead.id, permOrgRead.id, permMenuRead.id, permCategoryView.id, permResourceView.id];
  const viewerPermIds = [permUserRead.id];

  // Toàn bộ quyền (cho SUPER_ADMIN / Quản trị cổng)
  const allPortalPermIds = [
    permSystemView.id, permUserRead.id, permUserCreate.id, permOrgRead.id, permMenuRead.id, permMenuUpdate.id, permCategoryView.id, permResourceView.id,
    permNewsRead.id, permNewsCreate.id, permDocRead.id, permDocCreate.id, permNotifRead.id, permNotifCreate.id,
    permEventRead.id, permEventCreate.id, permPageRead.id, permPageCreate.id,
    permPortalConfigView.id, permStatisticsView.id, permDashboardView.id, permHrmView.id,
  ];

  const contentPermIds = [permDashboardView.id, permNewsRead.id, permNewsCreate.id, permDocRead.id, permDocCreate.id, permNotifRead.id, permNotifCreate.id, permEventRead.id, permEventCreate.id, permPageRead.id, permPageCreate.id];
  const editorPermIds = [permDashboardView.id, permNewsRead.id, permNewsCreate.id, permDocRead.id, permDocCreate.id, permNotifRead.id, permNotifCreate.id, permEventRead.id, permEventCreate.id, permPageRead.id, permPageCreate.id];
  const contributorPermIds = [permDashboardView.id, permNewsRead.id, permNewsCreate.id, permDocRead.id, permDocCreate.id, permNotifRead.id, permNotifCreate.id, permEventRead.id, permEventCreate.id, permPageRead.id, permPageCreate.id];
  const portalViewerPermIds = [permDashboardView.id, permNewsRead.id, permDocRead.id, permNotifRead.id, permEventRead.id, permPageRead.id, permStatisticsView.id];

  // Roles – update cũng set permissions để Chính sách hiệu lực (UserPolicy) có dữ liệu
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: { permissions: { set: adminPermIds.map((id) => ({ id })) } },
    create: {
      code: 'ADMIN',
      name: 'Quản trị viên cấp cao',
      description: 'Full quyền',
      permissions: { connect: adminPermIds.map((id) => ({ id })) },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { code: 'MANAGER' },
    update: { permissions: { set: managerPermIds.map((id) => ({ id })) } },
    create: {
      code: 'MANAGER',
      name: 'Quản lý đơn vị',
      description: 'Xem user, tổ chức, menu, danh mục dùng chung',
      permissions: { connect: managerPermIds.map((id) => ({ id })) },
    },
  });

  const userViewerRole = await prisma.role.upsert({
    where: { code: 'USER_VIEWER' },
    update: { permissions: { set: viewerPermIds.map((id) => ({ id })) } },
    create: {
      code: 'USER_VIEWER',
      name: 'Xem danh sách người dùng',
      description: 'Chỉ xem',
      permissions: { connect: viewerPermIds.map((id) => ({ id })) },
    },
  });

  // Vai trò chuẩn Cổng thông tin điện tử Chính phủ
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: { permissions: { set: allPortalPermIds.map((id) => ({ id })) } },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'Toàn quyền hệ thống quản trị cổng TTĐT',
      permissions: { connect: allPortalPermIds.map((id) => ({ id })) },
    },
  });

  const portalAdminRole = await prisma.role.upsert({
    where: { code: 'PORTAL_ADMIN' },
    update: { permissions: { set: allPortalPermIds.map((id) => ({ id })) } },
    create: {
      code: 'PORTAL_ADMIN',
      name: 'Quản trị cổng thông tin',
      description: 'Quản trị toàn bộ cổng và nội dung',
      permissions: { connect: allPortalPermIds.map((id) => ({ id })) },
    },
  });

  const contentAdminRole = await prisma.role.upsert({
    where: { code: 'CONTENT_ADMIN' },
    update: { permissions: { set: contentPermIds.map((id) => ({ id })) } },
    create: {
      code: 'CONTENT_ADMIN',
      name: 'Quản trị nội dung',
      description: 'Quản lý tin tức, văn bản, thông báo, sự kiện, trang tĩnh',
      permissions: { connect: contentPermIds.map((id) => ({ id })) },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { code: 'EDITOR' },
    update: { permissions: { set: editorPermIds.map((id) => ({ id })) } },
    create: {
      code: 'EDITOR',
      name: 'Biên tập viên',
      description: 'Tạo, sửa, xuất bản nội dung',
      permissions: { connect: editorPermIds.map((id) => ({ id })) },
    },
  });

  const contributorRole = await prisma.role.upsert({
    where: { code: 'CONTRIBUTOR' },
    update: { permissions: { set: contributorPermIds.map((id) => ({ id })) } },
    create: {
      code: 'CONTRIBUTOR',
      name: 'Cộng tác viên',
      description: 'Đăng bài, nội dung chờ duyệt',
      permissions: { connect: contributorPermIds.map((id) => ({ id })) },
    },
  });

  const portalViewerRole = await prisma.role.upsert({
    where: { code: 'PORTAL_VIEWER' },
    update: { permissions: { set: portalViewerPermIds.map((id) => ({ id })) } },
    create: {
      code: 'PORTAL_VIEWER',
      name: 'Người xem',
      description: 'Chỉ xem nội dung và thống kê',
      permissions: { connect: portalViewerPermIds.map((id) => ({ id })) },
    },
  });

  // ==========================================================
  // 4. NẠP MENU – Một hệ thống menu cho cả Portal và Admin (chuẩn Cổng TTĐT)
  // ==========================================================
  console.log('🔹 4. Đang nạp Menu (Cổng thông tin + Quản trị hệ thống)...');

  // Root: Hệ thống quản trị (dùng chung cho cả portal và admin)
  const menuSystem = await prisma.menu.upsert({
    where: { code: 'SYS_ROOT' },
    update: { name: 'Hệ thống quản trị', order: 0 },
    create: {
      code: 'SYS_ROOT',
      name: 'Hệ thống quản trị',
      icon: 'apps-outline',
      order: 0,
      route: null,
      service: 'CORE_SERVICE',
      application: 'ADMIN_PORTAL',
      requiredPermissions: { create: [{ permissionId: permSystemView.id }] },
    },
  });

  // --- NHÁNH 1: CỔNG THÔNG TIN (Portal) ---
  const portalRoot = await prisma.menu.upsert({
    where: { code: 'PORTAL_ROOT' },
    update: { parentId: menuSystem.id, order: 0 },
    create: {
      code: 'PORTAL_ROOT',
      name: 'Cổng thông tin',
      icon: 'globe-outline',
      route: null,
      order: 0,
      service: 'CORE_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuSystem.id,
      requiredPermissions: { create: [{ permissionId: permDashboardView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'PORTAL_DASHBOARD' },
    update: { parentId: portalRoot.id, order: 0 },
    create: {
      code: 'PORTAL_DASHBOARD',
      name: 'Tổng quan',
      icon: 'grid-outline',
      route: '/',
      order: 0,
      service: 'CORE_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: portalRoot.id,
      requiredPermissions: { create: [{ permissionId: permDashboardView.id }] },
    },
  });

  const menuContentRoot = await prisma.menu.upsert({
    where: { code: 'CONTENT_ROOT' },
    update: { parentId: portalRoot.id, order: 1 },
    create: {
      code: 'CONTENT_ROOT',
      name: 'Quản lý nội dung',
      icon: 'document-text-outline',
      route: null,
      order: 1,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: portalRoot.id,
      requiredPermissions: { create: [{ permissionId: permNewsRead.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'CONTENT_NEWS' },
    update: { parentId: menuContentRoot.id },
    create: {
      code: 'CONTENT_NEWS',
      name: 'Tin tức',
      icon: 'newspaper-outline',
      route: '/content/news',
      order: 1,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuContentRoot.id,
      requiredPermissions: { create: [{ permissionId: permNewsRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'CONTENT_DOCUMENT' },
    update: { parentId: menuContentRoot.id },
    create: {
      code: 'CONTENT_DOCUMENT',
      name: 'Văn bản',
      icon: 'document-outline',
      route: '/content/documents',
      order: 2,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuContentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'CONTENT_NOTIFICATION' },
    update: { parentId: menuContentRoot.id },
    create: {
      code: 'CONTENT_NOTIFICATION',
      name: 'Thông báo',
      icon: 'megaphone-outline',
      route: '/content/notifications',
      order: 3,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuContentRoot.id,
      requiredPermissions: { create: [{ permissionId: permNotifRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'CONTENT_EVENT' },
    update: { parentId: menuContentRoot.id },
    create: {
      code: 'CONTENT_EVENT',
      name: 'Sự kiện',
      icon: 'calendar-outline',
      route: '/content/events',
      order: 4,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuContentRoot.id,
      requiredPermissions: { create: [{ permissionId: permEventRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'CONTENT_PAGE' },
    update: { parentId: menuContentRoot.id },
    create: {
      code: 'CONTENT_PAGE',
      name: 'Trang tĩnh / Danh mục',
      icon: 'layers-outline',
      route: '/content/pages',
      order: 5,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuContentRoot.id,
      requiredPermissions: { create: [{ permissionId: permPageRead.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'PORTAL_CONFIG' },
    update: { parentId: portalRoot.id, order: 2 },
    create: {
      code: 'PORTAL_CONFIG',
      name: 'Cấu hình cổng thông tin',
      icon: 'cog-outline',
      route: '/portal/config',
      order: 2,
      service: 'CORE_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: portalRoot.id,
      requiredPermissions: { create: [{ permissionId: permPortalConfigView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'PORTAL_STATISTICS' },
    update: { parentId: portalRoot.id, order: 3 },
    create: {
      code: 'PORTAL_STATISTICS',
      name: 'Thống kê - Báo cáo',
      icon: 'bar-chart-outline',
      route: '/statistics',
      order: 3,
      service: 'CORE_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: portalRoot.id,
      requiredPermissions: { create: [{ permissionId: permStatisticsView.id }] },
    },
  });

  // --- NHÁNH 2: QUẢN TRỊ HỆ THỐNG (Admin) ---
  const adminRoot = await prisma.menu.upsert({
    where: { code: 'ADMIN_ROOT' },
    update: { parentId: menuSystem.id, order: 1, description: 'Quản lý người dùng, vai trò, quyền PBAC, cơ cấu tổ chức và danh mục dùng chung.', iconColor: '#475569' },
    create: {
      code: 'ADMIN_ROOT',
      name: 'Quản trị hệ thống',
      icon: 'settings-outline',
      route: null,
      order: 1,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuSystem.id,
      description: 'Quản lý người dùng, vai trò, quyền PBAC, cơ cấu tổ chức và danh mục dùng chung.',
      iconColor: '#475569',
      requiredPermissions: { create: [{ permissionId: permSystemView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'ADMIN_DASHBOARD' },
    update: { parentId: adminRoot.id, order: 0 },
    create: {
      code: 'ADMIN_DASHBOARD',
      name: 'Tổng quan',
      icon: 'grid-outline',
      route: '/',
      order: 0,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permDashboardView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'SYS_USER_LIST' },
    update: { parentId: adminRoot.id, order: 1 },
    create: {
      code: 'SYS_USER_LIST',
      name: 'Cán bộ, Nhân viên',
      icon: 'people-outline',
      route: '/users',
      order: 1,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permUserRead.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'SYS_ORG_CHART' },
    update: { parentId: adminRoot.id, order: 2 },
    create: {
      code: 'SYS_ORG_CHART',
      name: 'Cơ cấu tổ chức',
      icon: 'apartment',
      route: '/organization',
      order: 2,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permSystemView.id }] },
    },
  });

  const oldRbacMenu = await prisma.menu.findUnique({ where: { code: 'SYS_RBAC' } });
  if (oldRbacMenu) {
    await prisma.menu.update({
      where: { id: oldRbacMenu.id },
      data: { code: 'SYS_PBAC', name: 'Vai trò & Chính sách (PBAC)', route: '/roles', parentId: adminRoot.id },
    });
    console.log('   → Đã cập nhật menu SYS_RBAC thành SYS_PBAC.');
  }

  await prisma.menu.upsert({
    where: { code: 'SYS_PBAC' },
    update: { parentId: adminRoot.id, order: 3 },
    create: {
      code: 'SYS_PBAC',
      name: 'Vai trò & Chính sách (PBAC)',
      icon: 'lock-closed-outline',
      route: '/roles',
      order: 3,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permSystemView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'SYS_RESOURCES' },
    update: { parentId: adminRoot.id, order: 4 },
    create: {
      code: 'SYS_RESOURCES',
      name: 'Tài nguyên & Quyền (Resources & Permissions)',
      icon: 'shield-checkmark-outline',
      route: '/resources',
      order: 4,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permResourceView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'SYS_MENU_LIST' },
    update: { parentId: adminRoot.id, order: 5 },
    create: {
      code: 'SYS_MENU_LIST',
      name: 'Quản lý Menu',
      icon: 'list-outline',
      route: '/menus',
      order: 5,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permMenuRead.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'SYS_CATEGORIES' },
    update: { parentId: adminRoot.id, order: 6 },
    create: {
      code: 'SYS_CATEGORIES',
      name: 'Danh mục dùng chung',
      icon: 'folder-outline',
      route: '/categories',
      order: 6,
      service: 'USER_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: adminRoot.id,
      requiredPermissions: { create: [{ permissionId: permCategoryView.id }] },
    },
  });

  // --- NHÁNH 3: HRM (Quản lý Nhân sự) ---
  const hrmRoot = await prisma.menu.upsert({
    where: { code: 'HRM_ROOT' },
    update: { parentId: menuSystem.id, order: 2, description: 'Hồ sơ cán bộ, công chức, viên chức; quản lý phòng ban và chức danh.', iconColor: '#059669' },
    create: {
      code: 'HRM_ROOT',
      name: 'Quản lý Nhân sự',
      icon: 'people-outline',
      route: null,
      order: 2,
      service: 'HRM_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuSystem.id,
      description: 'Hồ sơ cán bộ, công chức, viên chức; quản lý phòng ban và chức danh.',
      iconColor: '#059669',
      requiredPermissions: { create: [{ permissionId: permHrmView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'HRM_DASHBOARD' },
    update: { parentId: hrmRoot.id, order: 0 },
    create: {
      code: 'HRM_DASHBOARD',
      name: 'Tổng quan',
      icon: 'grid-outline',
      route: '/',
      order: 0,
      service: 'HRM_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: hrmRoot.id,
      requiredPermissions: { create: [{ permissionId: permHrmView.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'HRM_EMPLOYEES' },
    update: { parentId: hrmRoot.id, order: 1 },
    create: {
      code: 'HRM_EMPLOYEES',
      name: 'Hồ sơ nhân viên',
      icon: 'person-outline',
      route: '/employees',
      order: 1,
      service: 'HRM_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: hrmRoot.id,
      requiredPermissions: { create: [{ permissionId: permHrmView.id }] },
    },
  });

  // --- NHÁNH 4: VĂN BẢN (Document Service) ---
  const documentRoot = await prisma.menu.upsert({
    where: { code: 'DOCUMENT_ROOT' },
    update: { parentId: menuSystem.id, order: 3, description: 'Văn bản đến/đi, công bố, xử lý luân chuyển và tham vấn công khai.', iconColor: '#d97706' },
    create: {
      code: 'DOCUMENT_ROOT',
      name: 'Hệ thống Văn bản',
      icon: 'document-attach-outline',
      route: null,
      order: 3,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuSystem.id,
      description: 'Văn bản đến/đi, công bố, xử lý luân chuyển và tham vấn công khai.',
      iconColor: '#d97706',
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'DOC_DASHBOARD' },
    update: { parentId: documentRoot.id, order: 0 },
    create: {
      code: 'DOC_DASHBOARD',
      name: 'Tổng quan',
      icon: 'grid-outline',
      route: '/',
      order: 0,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_INCOMING' },
    update: { parentId: documentRoot.id, order: 1 },
    create: {
      code: 'DOC_INCOMING',
      name: 'Văn bản đến',
      icon: 'arrow-down-circle-outline',
      route: '/incoming',
      order: 1,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_OUTGOING' },
    update: { parentId: documentRoot.id, order: 2 },
    create: {
      code: 'DOC_OUTGOING',
      name: 'Văn bản đi',
      icon: 'arrow-up-circle-outline',
      route: '/outgoing',
      order: 2,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_PUBLISH' },
    update: { parentId: documentRoot.id, order: 3 },
    create: {
      code: 'DOC_PUBLISH',
      name: 'Công bố văn bản',
      icon: 'megaphone-outline',
      route: '/publish',
      order: 3,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_PROCESSING' },
    update: { parentId: documentRoot.id, order: 4 },
    create: {
      code: 'DOC_PROCESSING',
      name: 'Xử lý văn bản',
      icon: 'construct-outline',
      route: '/processing',
      order: 4,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_CONSULTATIONS_MANAGE' },
    update: { parentId: documentRoot.id, order: 5 },
    create: {
      code: 'DOC_CONSULTATIONS_MANAGE',
      name: 'Quản lý tham vấn',
      icon: 'chatbubbles-outline',
      route: '/consultations/manage',
      order: 5,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_CONSULTATIONS_PENDING' },
    update: { parentId: documentRoot.id, order: 6 },
    create: {
      code: 'DOC_CONSULTATIONS_PENDING',
      name: 'Tham vấn chờ xử lý',
      icon: 'time-outline',
      route: '/consultations/pending',
      order: 6,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_CONSULTATIONS_PUBLIC' },
    update: { parentId: documentRoot.id, order: 7 },
    create: {
      code: 'DOC_CONSULTATIONS_PUBLIC',
      name: 'Phản hồi công khai',
      icon: 'people-outline',
      route: '/consultations/public-feedbacks',
      order: 7,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });
  await prisma.menu.upsert({
    where: { code: 'DOC_TRANSPARENCY' },
    update: { parentId: documentRoot.id, order: 8 },
    create: {
      code: 'DOC_TRANSPARENCY',
      name: 'Công khai tài chính',
      icon: 'wallet-outline',
      route: '/transparency/finance',
      order: 8,
      service: 'DOCUMENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: documentRoot.id,
      requiredPermissions: { create: [{ permissionId: permDocRead.id }] },
    },
  });

  // --- NHÁNH 5: QUẢN LÝ BÀI VIẾT (Content/Posts – CONTENT_SERVICE) – nhánh độc lập cho Hub ---
  const postsRoot = await prisma.menu.upsert({
    where: { code: 'POSTS_ROOT' },
    update: { parentId: menuSystem.id, order: 4, description: 'Tin tức, bài viết và nội dung cổng thông tin điện tử.', iconColor: '#7c3aed' },
    create: {
      code: 'POSTS_ROOT',
      name: 'Quản lý Bài viết',
      icon: 'newspaper-outline',
      route: null,
      order: 4,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: menuSystem.id,
      description: 'Tin tức, bài viết và nội dung cổng thông tin điện tử.',
      iconColor: '#7c3aed',
      requiredPermissions: { create: [{ permissionId: permNewsRead.id }] },
    },
  });

  await prisma.menu.upsert({
    where: { code: 'POSTS_MAIN' },
    update: { parentId: postsRoot.id, order: 0 },
    create: {
      code: 'POSTS_MAIN',
      name: 'Bài viết / Tin tức',
      icon: 'document-text-outline',
      route: '/',
      order: 0,
      service: 'CONTENT_SERVICE',
      application: 'ADMIN_PORTAL',
      parentId: postsRoot.id,
      requiredPermissions: { create: [{ permissionId: permNewsRead.id }] },
    },
  });

  console.log('   → Menu: SYS_ROOT → [PORTAL_ROOT | ADMIN_ROOT | HRM_ROOT | DOCUMENT_ROOT | POSTS_ROOT]');

  // ==========================================================
  // 5. NẠP CƠ CẤU TỔ CHỨC
  // ==========================================================
  console.log('🔹 5. Đang nạp Cơ cấu tổ chức (Materialized Path)...');

  const provinceType = await prisma.category.findUniqueOrThrow({ where: { group_code: { group: 'UNIT_TYPE', code: 'PROVINCE_PC' } } });
  const deptType = await prisma.category.findUniqueOrThrow({ where: { group_code: { group: 'UNIT_TYPE', code: 'DEPARTMENT' } } });
  const divType = await prisma.category.findUniqueOrThrow({ where: { group_code: { group: 'UNIT_TYPE', code: 'DIVISION' } } });

  // 5.1. Root: UBND Tỉnh (Thêm thông tin liên hệ)
  const rootUnit = await prisma.organizationUnit.upsert({
    where: { code: 'UBND_DAKLAK' },
    update: {},
    create: {
      code: 'UBND_DAKLAK',
      name: 'Ủy ban nhân dân Tỉnh Đắk Lắk',
      shortName: 'UBND Tỉnh', // <--- Bổ sung
      address: '09 Lê Duẩn, TP. Buôn Ma Thuột, Đắk Lắk', // <--- Bổ sung
      phoneNumber: '0262.385.1234', // <--- Bổ sung
      email: 'vanthu@daklak.gov.vn', // <--- Bổ sung
      website: 'https://daklak.gov.vn', // <--- Bổ sung
      typeId: provinceType.id,
      parentId: null,
      hierarchyPath: '/',
    },
  });
  await prisma.organizationUnit.update({
    where: { id: rootUnit.id },
    data: { hierarchyPath: `/${rootUnit.id}/` }
  });

  // 5.2. Child: Sở TT&TT
  const deptUnit = await prisma.organizationUnit.upsert({
    where: { code: 'STTTT_DL' },
    update: { parentId: rootUnit.id },
    create: {
      code: 'STTTT_DL',
      name: 'Sở Thông tin và Truyền thông',
      shortName: 'Sở TT&TT', // <--- Bổ sung
      address: '04 Lý Thường Kiệt, TP. Buôn Ma Thuột', // <--- Bổ sung
      phoneNumber: '0262.385.6789',
      email: 'sotttt@daklak.gov.vn',
      typeId: deptType.id,
      parentId: rootUnit.id,
      hierarchyPath: '',
    },
  });
  await prisma.organizationUnit.update({
    where: { id: deptUnit.id },
    data: { hierarchyPath: `/${rootUnit.id}/${deptUnit.id}/` }
  });

  // 5.3. Grandchild: Phòng CNTT
  const subUnit = await prisma.organizationUnit.upsert({
    where: { code: 'PHONG_CNTT' },
    update: { parentId: deptUnit.id },
    create: {
      code: 'PHONG_CNTT',
      name: 'Phòng Công nghệ thông tin',
      shortName: 'Phòng CNTT',
      typeId: divType.id,
      parentId: deptUnit.id,
      hierarchyPath: '',
    },
  });
  await prisma.organizationUnit.update({
    where: { id: subUnit.id },
    data: { hierarchyPath: `/${rootUnit.id}/${deptUnit.id}/${subUnit.id}/` }
  });

  // 5.4. Phòng Hành chính - Tổng hợp
  const subUnit2 = await prisma.organizationUnit.upsert({
    where: { code: 'PHONG_HCTH' },
    update: { parentId: deptUnit.id },
    create: {
      code: 'PHONG_HCTH',
      name: 'Phòng Hành chính - Tổng hợp',
      shortName: 'Phòng HC-TH',
      typeId: divType.id,
      parentId: deptUnit.id,
      hierarchyPath: '',
    },
  });
  await prisma.organizationUnit.update({
    where: { id: subUnit2.id },
    data: { hierarchyPath: `/${rootUnit.id}/${deptUnit.id}/${subUnit2.id}/` }
  });

  // ==========================================================
  // 6. TẠO USER & JOB POSITION (NHÂN SỰ THỰC TẾ)
  // ==========================================================
  console.log('🔹 6. Đang nạp Người dùng & Bổ nhiệm...');

  const giamDocTitle = await prisma.jobTitle.findUniqueOrThrow({ where: { code: 'GIAM_DOC' } });
  const chuyenVienTitle = await prisma.jobTitle.findUniqueOrThrow({ where: { code: 'CHUYEN_VIEN' } });
  const phoGiamDocTitle = await prisma.jobTitle.findUniqueOrThrow({ where: { code: 'PHO_GIAM_DOC' } });
  const truongPhongTitle = await prisma.jobTitle.findUniqueOrThrow({ where: { code: 'TRUONG_PHONG' } });

  // User Giám đốc Sở (Nguyễn Văn A)
  const userGiamDoc = await prisma.user.upsert({
    where: { email: 'giamdoc@daklak.gov.vn' },
    update: {},
    create: {
      email: 'giamdoc@daklak.gov.vn',
      fullName: 'Nguyễn Văn A',
      username: 'nguyenvana',
      phoneNumber: '0905111222', // <--- Bổ sung SĐT
      roles: { connect: [{ id: adminRole.id }] },
      jobPositions: {
        create: {
          unitId: deptUnit.id,
          jobTitleId: giamDocTitle.id,
          isPrimary: true,
        },
      },
    },
  });

  // User Chuyên viên (Trần Thị B)
  const userChuyenVien = await prisma.user.upsert({
    where: { email: 'chuyenvien@daklak.gov.vn' },
    update: { roles: { set: [{ id: userViewerRole.id }] } },
    create: {
      email: 'chuyenvien@daklak.gov.vn',
      fullName: 'Trần Thị B',
      username: 'tranthib',
      phoneNumber: '0905333444',
      roles: { connect: [{ id: userViewerRole.id }] },
      jobPositions: {
        create: {
          unitId: subUnit.id,
          jobTitleId: chuyenVienTitle.id,
          isPrimary: true,
        },
      },
    },
  });

  // User Phó Giám đốc (Lê Văn C)
  const userPhoGiamDoc = await prisma.user.upsert({
    where: { email: 'phogiamdoc@daklak.gov.vn' },
    update: {},
    create: {
      email: 'phogiamdoc@daklak.gov.vn',
      fullName: 'Lê Văn C',
      username: 'levanc',
      phoneNumber: '0905555666',
      roles: { connect: [{ id: managerRole.id }] },
      jobPositions: {
        create: {
          unitId: deptUnit.id,
          jobTitleId: phoGiamDocTitle.id,
          isPrimary: true,
        },
      },
    },
  });

  // User Trưởng phòng CNTT (Phạm Thị D)
  const userTruongPhong = await prisma.user.upsert({
    where: { email: 'truongphong@daklak.gov.vn' },
    update: {},
    create: {
      email: 'truongphong@daklak.gov.vn',
      fullName: 'Phạm Thị D',
      username: 'phamthid',
      phoneNumber: '0905777888',
      roles: { connect: [{ id: managerRole.id }] },
      jobPositions: {
        create: {
          unitId: subUnit.id,
          jobTitleId: truongPhongTitle.id,
          isPrimary: true,
        },
      },
    },
  });

  // ==========================================================
  // 6b. TẠO CREDENTIAL (MẬT KHẨU ĐĂNG NHẬP)
  // ==========================================================
  console.log('🔹 6b. Đang tạo mật khẩu đăng nhập (Credential)...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Helper function để upsert credential
  const upsertCreds = async (userId: number) => {
    await prisma.credential.upsert({
      where: { userId: userId },
      update: { passwordHash },
      create: { userId: userId, passwordHash },
    });
  };

  await upsertCreds(userGiamDoc.id);
  await upsertCreds(userChuyenVien.id);
  await upsertCreds(userPhoGiamDoc.id);
  await upsertCreds(userTruongPhong.id);

  // User Admin mẫu (luôn gán lại role ADMIN khi update để Chính sách hiệu lực có dữ liệu)
  const userAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { roles: { set: [{ id: adminRole.id }] } },
    create: {
      email: 'admin@example.com',
      fullName: 'Admin Test',
      username: 'admin',
      roles: { connect: [{ id: adminRole.id }] },
    },
  });
  await upsertCreds(userAdmin.id);

  // User admintest (tài khoản test admin – cùng role ADMIN để có Chính sách hiệu lực)
  const userAdminTest = await prisma.user.upsert({
    where: { email: 'admintest@example.com' },
    update: { roles: { set: [{ id: adminRole.id }] } },
    create: {
      email: 'admintest@example.com',
      fullName: 'Admin Test',
      username: 'admintest',
      roles: { connect: [{ id: adminRole.id }] },
    },
  });
  await upsertCreds(userAdminTest.id);

  console.log(`   → Mật khẩu mặc định cho tất cả user: ${DEFAULT_PASSWORD}`);
  console.log('   → Tài khoản mẫu: admin, admintest, nguyenvana, tranthib, levanc, phamthid');

  // ==========================================================
  // 6c. NHÓM NGƯỜI DÙNG (USER GROUPS)
  // ==========================================================
  console.log('🔹 6c. Đang tạo Nhóm người dùng...');

  await prisma.userGroup.upsert({
    where: { name: 'Ban lãnh đạo Sở' },
    update: {},
    create: {
      name: 'Ban lãnh đạo Sở',
      users: { connect: [{ id: userGiamDoc.id }, { id: userPhoGiamDoc.id }] },
      roles: { connect: [{ id: managerRole.id }] },
    },
  });

  await prisma.userGroup.upsert({
    where: { name: 'Phòng CNTT' },
    update: {},
    create: {
      name: 'Phòng CNTT',
      users: { connect: [{ id: userTruongPhong.id }, { id: userChuyenVien.id }] },
      roles: { connect: [{ id: userViewerRole.id }] },
    },
  });

  // ==========================================================
  // 7. THIẾT LẬP ĐỊNH BIÊN (STAFFING PLANS)
  // ==========================================================
  console.log('🔹 7. Đang thiết lập Định biên (Staffing Quota)...');

  // 7.1. Định biên tại Sở TT&TT
  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: deptUnit.id, jobTitleId: giamDocTitle.id } },
    update: { currentCount: 1 },
    create: {
      unitId: deptUnit.id,
      jobTitleId: giamDocTitle.id,
      quantity: 1,      // Chỉ tiêu 1
      currentCount: 1,  // Thực tế 1
      description: 'Theo QĐ thành lập Sở',
    },
  });

  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: deptUnit.id, jobTitleId: phoGiamDocTitle.id } },
    update: { currentCount: 1 }, // Có 1 phó GĐ (Lê Văn C)
    create: {
      unitId: deptUnit.id,
      jobTitleId: phoGiamDocTitle.id,
      quantity: 3,
      currentCount: 1,
    },
  });

  // 7.2. Định biên tại Phòng CNTT
  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: subUnit.id, jobTitleId: truongPhongTitle.id } },
    update: { currentCount: 1 }, // Có 1 TP (Phạm Thị D)
    create: {
      unitId: subUnit.id,
      jobTitleId: truongPhongTitle.id,
      quantity: 1,
      currentCount: 1,
    },
  });

  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: subUnit.id, jobTitleId: chuyenVienTitle.id } },
    update: { currentCount: 1 }, // Có 1 CV (Trần Thị B)
    create: {
      unitId: subUnit.id,
      jobTitleId: chuyenVienTitle.id,
      quantity: 5,
      currentCount: 1,
    },
  });

  // 7.3. Định biên tại UBND Tỉnh (root)
  const chuTichTitle = await prisma.jobTitle.findUniqueOrThrow({ where: { code: 'CHU_TICH' } });
  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: rootUnit.id, jobTitleId: chuTichTitle.id } },
    update: {},
    create: {
      unitId: rootUnit.id,
      jobTitleId: chuTichTitle.id,
      quantity: 1,
      currentCount: 0,
      description: 'Chủ tịch UBND Tỉnh',
    },
  });

  // 7.4. Định biên tại Phòng Hành chính - Tổng hợp
  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: subUnit2.id, jobTitleId: truongPhongTitle.id } },
    update: {},
    create: {
      unitId: subUnit2.id,
      jobTitleId: truongPhongTitle.id,
      quantity: 1,
      currentCount: 0,
    },
  });
  await prisma.organizationStaffing.upsert({
    where: { unitId_jobTitleId: { unitId: subUnit2.id, jobTitleId: chuyenVienTitle.id } },
    update: {},
    create: {
      unitId: subUnit2.id,
      jobTitleId: chuyenVienTitle.id,
      quantity: 3,
      currentCount: 0,
    },
  });

  console.log('✅ Nạp dữ liệu hoàn tất. Categories (MICROSERVICE), Menu (Cổng TT + Quản trị), PBAC.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });