import { PrismaClient } from '../../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedJobPositions(prisma: PrismaClient) {
  const DEFAULT_PASSWORD = 'Admin@123';
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
  console.log('📦 Seeding Job Positions & Leaders (April 2026)...');

  const assignLeader = async (
    employeeCode: string | null,
    email: string,
    username: string,
    fullName: string,
    unitCode: string,
    jobTitleCode: string,
    isUnitLeader: boolean,
    monitoredUnitCodes?: string[],
    slotOrder: number = 1
  ) => {

    // Xác định PBAC Role theo chức vụ (hệ thống chính phủ)
    let pbacRoleCode = 'STAFF'; // Mặc định: Chuyên viên
    if (['GIAM_DOC', 'PHO_GIAM_DOC', 'CHU_TICH', 'PHO_CHU_TICH'].includes(jobTitleCode)) {
      pbacRoleCode = 'LEADER'; // Lãnh đạo cấp Sở/Tỉnh
    } else if ([
      'CHANH_VAN_PHONG', 'PHO_CHANH_VAN_PHONG',
      'TRUONG_PHONG', 'PHO_PHONG',
      'GIAM_DOC_TRUNG_TAM', 'PHO_GIAM_DOC_TRUNG_TAM'
    ].includes(jobTitleCode)) {
      pbacRoleCode = 'MANAGER'; // Trưởng đơn vị cấp phòng/trung tâm
    } else if (['NHAN_VIEN', 'BAO_VE', 'TAP_VU', 'LAI_XE'].includes(jobTitleCode)) {
      pbacRoleCode = 'STAFF'; // Nhân viên phục vụ (quyền cơ bản nhất)
    }
    // Còn lại (KE_TOAN, VAN_THU, VIEN_CHUC, CAN_SU...) giữ STAFF = Chuyên viên xử lý

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
        employeeCode,
        roles: { set: [], connect: rolesConnect }
      },
      create: {
        email,
        username,
        fullName,
        employeeCode,
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

      // Seed StaffingSlot and Monitored Units
      if (monitoredUnitCodes && monitoredUnitCodes.length > 0) {
        const staffing = await prisma.organizationStaffing.upsert({
          where: { unitId_jobTitleId: { unitId: unit.id, jobTitleId: jobTitle.id } },
          update: {},
          create: { unitId: unit.id, jobTitleId: jobTitle.id, quantity: 5 }
        });

        const slot = await prisma.staffingSlot.upsert({
          where: { staffingId_slotOrder: { staffingId: staffing.id, slotOrder } },
          update: { description: `Phụ trách bởi ${fullName}`, assignedEmployeeCode: employeeCode },
          create: {
            staffingId: staffing.id,
            slotOrder,
            description: `Phụ trách bởi ${fullName}`,
            assignedEmployeeCode: employeeCode
          }
        });

        const monitoredUnits = await prisma.organizationUnit.findMany({
          where: { code: { in: monitoredUnitCodes } }
        });

        if (monitoredUnits.length > 0) {
          await prisma.staffingSlotMonitoredUnit.deleteMany({ where: { slotId: slot.id } });
          await prisma.staffingSlotMonitoredUnit.createMany({
            data: monitoredUnits.map(mu => ({
              slotId: slot.id,
              unitId: mu.id
            })),
            skipDuplicates: true
          });
          console.log(`✅ Assigned monitored units to ${fullName} (Slot ${slot.slotOrder})`);
        }
      }
    }
  };

  // 1. UBND Tỉnh Đắk Lắk
  await assignLeader(
    null,
    'dohuuhuy@daklak.gov.vn',
    'dohuuhuy',
    'Đỗ Hữu Huy',
    'H15',
    'CHU_TICH',
    true,
  );
  // 2. Sở Nội vụ
  await assignLeader(
    'NV_010',
    'truongngoctuan@daklak.gov.vn',
    'truongngoctuan',
    'Trương Ngọc Tuấn',
    'SO_NV',
    'GIAM_DOC',
    true,
  );
  // 3. Sở Khoa học & Công nghệ
  await assignLeader(
    'NV_001',
    'buithanhtoan@daklak.gov.vn',
    'buithanhtoan',
    'Bùi Thanh Toàn',
    'H15.07',
    'GIAM_DOC',
    true,
    ['H15.07.05', 'H15.07.06', 'H15.07.07']
  );
  await assignLeader(
    'NV_002',
    'phamgiaviet@daklak.gov.vn',
    'phamgiaviet',
    'Phạm Gia Việt',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
    ['H15.07.10'],
    2
  );
  await assignLeader(
    'NV_003',
    'ralantruongthanhha@daklak.gov.vn',
    'ralantruongthanhha',
    'Ra Lan Trương Thanh Hà',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
    ['H15.07.08']
  );
  await assignLeader(
    'NV_004',
    'tranvanson@daklak.gov.vn',
    'tranvanson',
    'Trần Văn Sơn',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
    ['H15.07.09']
  );
  await assignLeader(
    'NV_005',
    'lamvumyhanh@daklak.gov.vn',
    'lamvumyhanh',
    'Lâm Vũ Mỹ Hạnh',
    'H15.07',
    'PHO_GIAM_DOC',
    true,
    ['H15.07.11']
  );
  // Bí thư Đảng bộ thường là Giám đốc
  await assignLeader(
    'NV_001',
    'buithanhtoan@daklak.gov.vn',
    'buithanhtoan',
    'Bùi Thanh Toàn',
    'H15.07',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    'NV_002',
    'phamgiaviet@daklak.gov.vn',
    'phamgiaviet',
    'Phạm Gia Việt',
    'H15.07',
    'PHO_BI_THU_DANG_BO',
    true,
  );

  // Lãnh đạo các phòng ban Sở KHCN
  await assignLeader(
    'NV_020',
    'nguyenvana@daklak.gov.vn',
    'nguyenvana',
    'Nguyễn Văn A',
    'H15.07.05',
    'CHANH_VAN_PHONG',
    true,
  );
  await assignLeader(
    'NV_021',
    'lethib@daklak.gov.vn',
    'lethib',
    'Lê Thị B',
    'H15.07.07',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_022',
    'tranvanc@daklak.gov.vn',
    'tranvanc',
    'Trần Văn C',
    'H15.07.08',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_023',
    'phamthid@daklak.gov.vn',
    'phamthid',
    'Phạm Thị D',
    'H15.07.09',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_024',
    'hoangvane@daklak.gov.vn',
    'hoangvane',
    'Hoàng Văn E',
    'H15.07.10',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_025',
    'vuthif@daklak.gov.vn',
    'vuthif',
    'Vũ Thị F',
    'H15.07.11',
    'TRUONG_PHONG',
    true,
  );

  // Lãnh đạo các Trung tâm thuộc Sở KHCN
  await assignLeader(
    'NV_026',
    'dovang@daklak.gov.vn',
    'dovang',
    'Đỗ Văn G',
    'H15.07.01',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'NV_028',
    'lyvani@daklak.gov.vn',
    'lyvani',
    'Lý Văn I',
    'H15.07.02',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'NV_100',
    'vonguyenhoangnam@daklak.gov.vn',
    'vonguyenhoangnam',
    'Võ Nguyễn Hoàng Nam',
    'H15.07.04',
    'GIAM_DOC',
    true,
  );
  await assignLeader(
    'NV_101',
    'lexuanquang@daklak.gov.vn',
    'lexuanquang',
    'Lê Xuân Quang',
    'H15.07.04',
    'PHO_GIAM_DOC',
    false,
  );
  await assignLeader(
    'NV_102',
    'tranduytan@daklak.gov.vn',
    'tranduytan',
    'Trần Duy Tân',
    'H15.07.04',
    'PHO_GIAM_DOC',
    false,
  );

  // Lãnh đạo các phòng thuộc Trung tâm
  await assignLeader(
    'NV_029',
    'truongphonghc_dmsm@daklak.gov.vn',
    'truongphonghc_dmsm',
    'Hoàng Văn HC',
    'H15.07.01.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_030',
    'truongphongut_dmsm@daklak.gov.vn',
    'truongphongut_dmsm',
    'Lê Thị UT',
    'H15.07.01.02',
    'TRUONG_PHONG',
    true,
  );


  await assignLeader(
    'NV_104',
    'lequangthanh@daklak.gov.vn',
    'lequangthanh',
    'Lê Quang Thanh',
    'H15.07.04.03',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_105',
    'letrongvu@daklak.gov.vn',
    'letrongvu',
    'Lê Trọng Vũ',
    'H15.07.04.02',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_103',
    'leanhtuan@daklak.gov.vn',
    'leanhtuan',
    'Lê Anh Tuấn',
    'H15.07.04.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_106',
    'chautrongphat@daklak.gov.vn',
    'chautrongphat',
    'Châu Trọng Phát',
    'H15.07.04.01',
    'KE_TOAN',
    false,
  );
  await assignLeader(
    'NV_109',
    'phamtheanh@daklak.gov.vn',
    'phamtheanh',
    'Phạm Thế Anh',
    'H15.07.04.03',
    'VIEN_CHUC',
    false,
  );
  await assignLeader(
    'NV_118',
    'nguyenvuhuy@daklak.gov.vn',
    'nguyenvuhuy',
    'Nguyễn Vũ Huy',
    'H15.07.04.03',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'NV_113',
    'lethithanhkieu@daklak.gov.vn',
    'lethithanhkieu',
    'Lê Thị Thanh Kiều',
    'H15.07.04.02',
    'VIEN_CHUC',
    false,
  );
  await assignLeader(
    'NV_033',
    'truongphonghc_kttdc@daklak.gov.vn',
    'truongphonghc_kttdc',
    'Nguyễn Văn HC',
    'H15.07.02.01',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_034',
    'truongphongdl_kttdc@daklak.gov.vn',
    'truongphongdl_kttdc',
    'Đinh Thị DL',
    'H15.07.02.02',
    'TRUONG_PHONG',
    true,
  );
  await assignLeader(
    'NV_035',
    'truongphongtn_kttdc@daklak.gov.vn',
    'truongphongtn_kttdc',
    'Vũ Văn TN',
    'H15.07.02.03',
    'TRUONG_PHONG',
    true,
  );

  // Thêm một số Phó Trưởng phòng (Ví dụ)
  await assignLeader(
    'NV_036',
    'phochvp_khcn@daklak.gov.vn',
    'phochvp_khcn',
    'Trương Văn Phó 1',
    'H15.07.05',
    'PHO_CHANH_VAN_PHONG',
    false,
  );
  await assignLeader(
    'NV_037',
    'photp_khtc_khcn@daklak.gov.vn',
    'photp_khtc_khcn',
    'Ngô Thị Phó 2',
    'H15.07.07',
    'PHO_TRUONG_PHONG',
    false,
  );

  // --- Bổ sung thêm các nhân viên và chuyên viên thuộc Trung tâm IOC ---
  await assignLeader('NV_107', 'nguyenthikimoanh@daklak.gov.vn', 'nguyenthikimoanh', 'Nguyễn Thị Kim Oanh', 'H15.07.04.01', 'VIEN_CHUC', false);
  await assignLeader('NV_108', 'vothihien@daklak.gov.vn', 'vothihien', 'Võ Thị Hiền', 'H15.07.04.01', 'VAN_THU', false);
  await assignLeader('NV_110', 'phandangvietvinhchuan@daklak.gov.vn', 'phandangvietvinhchuan', 'Phan Đăng Việt Vinh Chuẩn', 'H15.07.04.03', 'VIEN_CHUC', false);
  await assignLeader('NV_111', 'nguyenminhhoa@daklak.gov.vn', 'nguyenminhhoa', 'Nguyễn Minh Hóa', 'H15.07.04.02', 'VIEN_CHUC', false);
  await assignLeader('NV_112', 'chauhoakhanhtam@daklak.gov.vn', 'chauhoakhanhtam', 'Châu Hòa Khánh Tâm', 'H15.07.04.02', 'VIEN_CHUC', false);
  await assignLeader('NV_114', 'nguyenkieutrang@daklak.gov.vn', 'nguyenkieutrang', 'Nguyễn Kiều Trang', 'H15.07.04.01', 'NHAN_VIEN', false);
  await assignLeader('NV_115', 'hlisabya@daklak.gov.vn', 'hlisabya', 'H Lisa Byă', 'H15.07.04.01', 'NHAN_VIEN', false);
  await assignLeader('NV_116', 'nguyenthidiemquyen@daklak.gov.vn', 'nguyenthidiemquyen', 'Nguyễn Thị Diễm Quyên', 'H15.07.04.01', 'NHAN_VIEN', false);
  await assignLeader('NV_117', 'ysomenuol@daklak.gov.vn', 'ysomenuol', 'Y Sơm Êñuôl', 'H15.07.04.03', 'NHAN_VIEN', false);
  await assignLeader('NV_119', 'phungdinhhung@daklak.gov.vn', 'phungdinhhung', 'Phùng Đình Hưng', 'H15.07.04.03', 'NHAN_VIEN', false);
  await assignLeader('NV_120', 'kieuvuadrong@daklak.gov.vn', 'kieuvuadrong', 'Kiều Vũ Adrơng', 'H15.07.04.03', 'NHAN_VIEN', false);
  await assignLeader('NV_124', 'nguyensyhop@daklak.gov.vn', 'nguyensyhop', 'Nguyễn Sỹ Hợp', 'H15.07.04.01', 'BAO_VE', false);
  await assignLeader('NV_125', 'nguyentienquang@daklak.gov.vn', 'nguyentienquang', 'Nguyễn Tiến Quang', 'H15.07.04.01', 'BAO_VE', false);

  // 4. Sở Tài chính
  await assignLeader(
    'NV_011',
    'tranvantan@daklak.gov.vn',
    'tranvantan',
    'Trần Văn Tân',
    'H15.11',
    'GIAM_DOC',
    true,
  );
  // 5. Nhân viên Phòng Khai thác & Quản lý dữ liệu (H15.07.04.02)
  await assignLeader(
    'NV_123',
    'trantrungthanh@daklak.gov.vn',
    'trantrungthanh',
    'Trần Trung Thành',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'NV_121',
    'nguyenthiquynhmai@daklak.gov.vn',
    'nguyenthiquynhmai',
    'Nguyễn Thị Quỳnh Mai',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  await assignLeader(
    'NV_122',
    'nguyenquangtu@daklak.gov.vn',
    'nguyenquangtu',
    'Nguyễn Quang Tú',
    'H15.07.04.02',
    'NHAN_VIEN',
    false,
  );
  // 6. Phường Tân Lập
  await assignLeader(
    null,
    'vuvanhung@daklak.gov.vn',
    'vuvanhung',
    'Vũ Văn Hưng',
    'H15.52',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    null,
    'tranducnhat@daklak.gov.vn',
    'tranducnhat',
    'Trần Đức Nhật',
    'H15.52',
    'CHU_TICH',
    true,
  );
  // 7. Phường Tân An
  await assignLeader(
    null,
    'nguyenducvinh@daklak.gov.vn',
    'nguyenducvinh',
    'Nguyễn Đức Vinh',
    'H15.53',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    null,
    'phamtrungnghia@daklak.gov.vn',
    'phamtrungnghia',
    'Phạm Trung Nghĩa',
    'H15.53',
    'CHU_TICH',
    true,
  );
  // 9. Các giám đốc Sở mới (cập nhật từ 2026)
  await assignLeader(
    'NV_012',
    'caodinhhuy@daklak.gov.vn',
    'caodinhhuy',
    'Cao Đình Huy',
    'H15.14',
    'GIAM_DOC',
    true,
  );
  // 10. Các phường/xã còn lại
  await assignLeader(
    null,
    'nguyenthanhliem@daklak.gov.vn',
    'nguyenthanhliem',
    'Nguyễn Thanh Liêm',
    'H15.54',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    null,
    'nguyendinhtam@daklak.gov.vn',
    'nguyendinhtam',
    'Nguyễn Đình Tâm',
    'H15.54',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    null,
    'phamtienhung@daklak.gov.vn',
    'phamtienhung',
    'Phạm Tiến Hưng',
    'H15.55',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    null,
    'nguyenthehau@daklak.gov.vn',
    'nguyenthehau',
    'Nguyễn Thế Hậu',
    'H15.55',
    'CHU_TICH',
    true,
  );
  await assignLeader(
    null,
    'danggiaduan@daklak.gov.vn',
    'danggiaduan',
    'Đặng Gia Duẩn',
    'H15.56',
    'BI_THU_DANG_BO',
    true,
  );
  await assignLeader(
    null,
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


  
}
