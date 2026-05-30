import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting test seed for JobTitles and Organizations...');

  // 1. Lấy các lĩnh vực thử nghiệm (Domain)
  const domainCDS = await prisma.category.findFirst({ where: { code: 'CHUYEN_DOI_SO', group: 'DOMAIN' } });
  const domainDLS = await prisma.category.findFirst({ where: { code: 'DU_LIEU_SO', group: 'DOMAIN' } });
  const domainNS = await prisma.category.findFirst({ where: { code: 'NGAN_SACH', group: 'DOMAIN' } });

  // 2. Lấy các chức danh
  const phogiamdoc = await prisma.jobTitle.findUnique({ where: { code: 'PHO_GIAM_DOC' } });
  const giamdoc = await prisma.jobTitle.findUnique({ where: { code: 'GIAM_DOC' } });

  // 3. Lấy các phòng ban
  const phongKHTC = await prisma.organizationUnit.findUnique({ where: { code: 'SO_KHCN_KHTC' } });
  const phongQLCN = await prisma.organizationUnit.findUnique({ where: { code: 'SO_KHCN_QLCN' } });

  if (phogiamdoc && domainCDS && phongQLCN) {
    // Cập nhật chức danh Phó Giám đốc: Quản lý lĩnh vực Chuyển đổi số, theo dõi phòng Quản lý công nghệ
    await prisma.jobTitle.update({
      where: { id: phogiamdoc.id },
      data: {
        domainId: domainCDS.id,
      },
    });

    // Cập nhật phạm vi quản lý (Monitored Units)
    await prisma.jobTitleMonitoredUnit.upsert({
      where: { jobTitleId_unitId: { jobTitleId: phogiamdoc.id, unitId: phongQLCN.id } },
      update: {},
      create: { jobTitleId: phogiamdoc.id, unitId: phongQLCN.id },
    });
    
    // Gán lĩnh vực cho phòng ban
    await prisma.unitDomain.upsert({
      where: { unitId_domainId: { unitId: phongQLCN.id, domainId: domainCDS.id } },
      update: {},
      create: { unitId: phongQLCN.id, domainId: domainCDS.id },
    });

    console.log('✅ Đã cập nhật Phó Giám đốc: Lĩnh vực Chuyển đổi số, Theo dõi phòng QLCN');
  }

  if (giamdoc && domainNS && phongKHTC) {
    await prisma.jobTitle.update({
      where: { id: giamdoc.id },
      data: {
        domainId: domainNS.id,
      },
    });

    await prisma.jobTitleMonitoredUnit.upsert({
      where: { jobTitleId_unitId: { jobTitleId: giamdoc.id, unitId: phongKHTC.id } },
      update: {},
      create: { jobTitleId: giamdoc.id, unitId: phongKHTC.id },
    });

    await prisma.unitDomain.upsert({
      where: { unitId_domainId: { unitId: phongKHTC.id, domainId: domainNS.id } },
      update: {},
      create: { unitId: phongKHTC.id, domainId: domainNS.id },
    });

    console.log('✅ Đã cập nhật Giám đốc: Lĩnh vực Ngân sách, Theo dõi phòng KHTC');
  }

  console.log('🎉 Hoàn tất cập nhật dữ liệu thử nghiệm!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
