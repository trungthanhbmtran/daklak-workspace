import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedOrganizationsDakLakProvince(prisma: PrismaClient) {

  const _unitTypes = await prisma.unitType.findMany();
  const unitTypeMap: Record<string, any> = {};
  for (const r of _unitTypes) unitTypeMap[r.code] = r;
  const DEFAULT_PASSWORD = 'Admin@123';


  
  console.log('📦 Seeding Organization Units...');
  const ubndTinhTypeId = unitTypeMap['UBND_TINH'].id;
  const soTypeId = unitTypeMap['SO_NGANH'].id;
  const phongTypeId = unitTypeMap['PHONG_BAN_SO'].id; // fallback changed from HUYEN to SO
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
  console.log(`👉 Admin: admin@sys.com / ${DEFAULT_PASSWORD}`);
  console.log(`👉 OrgAdmin: orgadmin@daklak.gov.vn / ${DEFAULT_PASSWORD}`);

  console.log('📦 Seeding Departments for Organizations...');

  // helper tạo phòng ban
  const createDept = async (
    parentCode: string,
    dept: { code: string; name: string; typeCode?: string; domainCodes?: string[] },
  ) => {
    const parent = await prisma.organizationUnit.findUnique({
      where: { code: parentCode },
    });
    if (!parent) return;

    const tId = dept.typeCode ? unitTypeMap[dept.typeCode]?.id : phongTypeId;

    const unit = await prisma.organizationUnit.upsert({
      where: { code: dept.code },
      update: { parentId: parent.id, typeId: tId },
      create: {
        code: dept.code,
        name: dept.name,
        parentId: parent.id,
        typeId: tId,
      },
    });

    if (dept.domainCodes && dept.domainCodes.length > 0) {
      const domains = await prisma.category.findMany({
        where: { groupCode: 'DOMAIN', code: { in: dept.domainCodes } }
      });
      if (domains.length > 0) {
        await prisma.unitDomain.deleteMany({ where: { unitId: unit.id } });
        await prisma.unitDomain.createMany({
          data: domains.map(d => ({ unitId: unit.id, domainId: d.id })),
          skipDuplicates: true
        });
      }
    }
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
    domainCodes: ['QUAN_LY_KHOA_HOC', 'UNG_DUNG_KHCN'],
  });
  await createDept('H15.07', {
    code: 'H15.07.09',
    name: 'Phòng Chuyển đổi số',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['CHUYEN_DOI_SO', 'DU_LIEU_SO', 'AN_TOAN_THONG_TIN', 'CONG_NGHE_THONG_TIN'],
  });
  await createDept('H15.07', {
    code: 'H15.07.10',
    name: 'Phòng Quản lý Công nghệ và Đổi mới sáng tạo',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['QUAN_LY_CONG_NGHE', 'DOI_MOI_SANG_TAO', 'SO_HUU_TRI_TUE'],
  });
  await createDept('H15.07', {
    code: 'H15.07.11',
    name: 'Phòng Quản lý Tiêu chuẩn - Đo lường - Chất lượng',
    typeCode: 'PHONG_BAN_SO',
    domainCodes: ['TIEU_CHUAN_DO_LUONG_CHAT_LUONG', 'AN_TOAN_BUC_XA_HAT_NHAN'],
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
    // 1. Quản trị tối cao - toàn quyền hệ thống
    {
      code: 'SUPER_ADMIN',
      name: 'Quản trị viên cấp cao',
      scope: 'GLOBAL',
      perms: ['ALL']
    },

    // 2. Quản trị nghiệp vụ hệ thống - quản lý user, cấu hình, danh mục
    {
      code: 'ADMIN',
      name: 'Quản trị hệ thống',
      scope: 'GLOBAL',
      perms: [
        'USER.*', 'ROLE.*', 'RESOURCE.*', 'MENU.*',
        'ORGANIZATION.*', 'CATEGORY.*', 'SYSTEM.*', 'NOTIFICATION.*'
      ]
    },

    // 3. Lãnh đạo (Giám đốc, Phó GD, Chủ tịch, Phó CT UBND)
    // Phạm vi: TOÀN TỔ CHỨC - đọc + xử lý + phê duyệt mọi nghiệp vụ
    {
      code: 'LEADER',
      name: 'Lãnh đạo',
      scope: 'ORGANIZATION',
      perms: [
        'HRM_EMPLOYEE.*',
        'DOCUMENT.*', 'DOC_INCOMING.*', 'DOC_OUTGOING.*', 'DOC_INTERNAL.*',
        'DOC_PROCESSING.*', 'DOC_PUBLISH.*', 'DOC_TRANSPARENCY.*',
        'DOC_CONSULTATION.*', 'DOC_MINUTES.*', 'DOC_CATEGORIES.*',
        'PLAN.*', 'TASK.*', 'OBJECTIVE.*', 'KPI.*', 'REPORT.*', 'WORKFLOW.*'
      ]
    },

    // 4. Quản lý (Trưởng phòng, Phó trưởng phòng, Giám đốc Trung tâm)
    // Phạm vi: PHÒNG BAN - quản lý công việc, phân công nhiệm vụ
    {
      code: 'MANAGER',
      name: 'Quản lý',
      scope: 'DEPARTMENT',
      perms: [
        'HRM_EMPLOYEE.VIEW', 'HRM_EMPLOYEE.READ', 'HRM_EMPLOYEE.MANAGE',
        'ORGANIZATION.VIEW', 'ORGANIZATION.READ',
        'DOCUMENT.VIEW', 'DOCUMENT.READ', 'DOCUMENT.PROCESS', 'DOCUMENT.ASSIGN',
        'DOC_INCOMING.VIEW', 'DOC_INCOMING.READ', 'DOC_INCOMING.PROCESS', 'DOC_INCOMING.ASSIGN',
        'DOC_OUTGOING.VIEW', 'DOC_OUTGOING.READ', 'DOC_OUTGOING.PROCESS',
        'DOC_INTERNAL.VIEW', 'DOC_INTERNAL.READ', 'DOC_INTERNAL.PROCESS',
        'DOC_PROCESSING.VIEW', 'DOC_PROCESSING.READ', 'DOC_PROCESSING.PROCESS',
        'DOC_PUBLISH.VIEW', 'DOC_PUBLISH.READ',
        'DOC_TRANSPARENCY.VIEW', 'DOC_TRANSPARENCY.READ',
        'DOC_CONSULTATION.VIEW', 'DOC_CONSULTATION.READ',
        'DOC_MINUTES.VIEW', 'DOC_MINUTES.READ',
        'DOC_CATEGORIES.VIEW', 'DOC_CATEGORIES.READ',
        'PLAN.VIEW', 'PLAN.READ', 'PLAN.UPDATE',
        'TASK.VIEW', 'TASK.READ', 'TASK.CREATE', 'TASK.UPDATE', 'TASK.ASSIGN', 'TASK.COMPLETE', 'TASK.EVALUATE',
        'OBJECTIVE.VIEW', 'OBJECTIVE.READ', 'OBJECTIVE.UPDATE',
        'KPI.VIEW', 'KPI.READ',
        'REPORT.VIEW', 'REPORT.READ',
        'WORKFLOW.VIEW', 'WORKFLOW.READ'
      ]
    },

    // 5. Nhân viên (Chuyên viên, Viên chức, Cán sự, Nhân viên xử lý)
    // Phạm vi: SELF & DEPARTMENT - xử lý công việc được giao, soạn thảo văn bản
    {
      code: 'STAFF',
      name: 'Nhân viên',
      scope: 'DEPARTMENT',
      perms: [
        'HRM_EMPLOYEE.VIEW', 'HRM_EMPLOYEE.READ',
        'DOCUMENT.VIEW', 'DOCUMENT.READ', 'DOCUMENT.PROCESS',
        'DOC_INCOMING.VIEW', 'DOC_INCOMING.READ', 'DOC_INCOMING.PROCESS',
        'DOC_OUTGOING.VIEW', 'DOC_OUTGOING.READ', 'DOC_OUTGOING.PROCESS',
        'DOC_INTERNAL.VIEW', 'DOC_INTERNAL.READ', 'DOC_INTERNAL.PROCESS',
        'DOC_PROCESSING.VIEW', 'DOC_PROCESSING.READ', 'DOC_PROCESSING.PROCESS',
        'DOC_PUBLISH.VIEW', 'DOC_PUBLISH.READ',
        'DOC_TRANSPARENCY.VIEW', 'DOC_TRANSPARENCY.READ',
        'DOC_CONSULTATION.VIEW', 'DOC_CONSULTATION.READ',
        'DOC_MINUTES.VIEW', 'DOC_MINUTES.READ',
        'DOC_CATEGORIES.VIEW', 'DOC_CATEGORIES.READ',
        'TASK.VIEW', 'TASK.READ', 'TASK.UPDATE', 'TASK.COMPLETE', 'TASK.COMMENT',
        'KPI.VIEW', 'KPI.READ',
        'WORKFLOW.VIEW', 'WORKFLOW.READ'
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

  
}
