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

async function main() {
  console.log('🌱 STARTING COMPREHENSIVE POSTS-SERVICE SEED');

  const authorId = '00000000-0000-0000-0000-000000000000'; // Default system author

  // ==========================================================
  // 1. CATEGORIES
  // ==========================================================
  console.log('📦 Seeding Categories...');
  const categoryData = [
    {
      name: 'Giới thiệu', translations: { en: { name: 'About Us' } }, slug: 'gioi-thieu', orderIndex: 1, isGovStandard: true,
      children: [
        { name: 'Sơ đồ tổ chức', translations: { en: { name: 'Organizational Chart' } }, slug: 'so-do-to-chuc', orderIndex: 1, isGovStandard: true },
        { name: 'Chức năng nhiệm vụ', translations: { en: { name: 'Functions & Duties' } }, slug: 'chuc-nang-nhiem-vu', orderIndex: 2, isGovStandard: true },
        { name: 'Lãnh đạo cơ quan', translations: { en: { name: 'Agency Leadership' } }, slug: 'lanh-dao-co-quan', orderIndex: 3, isGovStandard: true },
      ]
    },
    {
      name: 'Tin tức & Sự kiện', translations: { en: { name: 'News & Events' } }, slug: 'tin-tuc', orderIndex: 2, isGovStandard: true,
      children: [
        { name: 'Tin nổi bật', translations: { en: { name: 'Featured News' } }, slug: 'tin-noi-bat', orderIndex: 1, isGovStandard: true },
        { name: 'Hoạt động lãnh đạo', translations: { en: { name: 'Leadership Activities' } }, slug: 'hoat-dong-lanh-dao', orderIndex: 2, isGovStandard: true },
        { name: 'Thông báo', translations: { en: { name: 'Notifications' } }, slug: 'thong-bao', orderIndex: 3, isGovStandard: true },
        { name: 'Điểm tin báo chí', translations: { en: { name: 'Press Clippings' } }, slug: 'diem-tin', orderIndex: 4, isGovStandard: true },
      ]
    },
    {
      name: 'Chỉ đạo điều hành', translations: { en: { name: 'Leadership & Management' } }, slug: 'chi-dao', orderIndex: 3, isGovStandard: true,
      children: [
        { name: 'Văn bản quy phạm', translations: { en: { name: 'Legal Documents' } }, slug: 'van-ban-quy-pham', orderIndex: 1, isGovStandard: true },
        { name: 'Văn bản chỉ đạo điều hành', translations: { en: { name: 'Management Documents' } }, slug: 'van-ban-chi-dao', orderIndex: 2, isGovStandard: true },
        { name: 'Chương trình, kế hoạch công tác', translations: { en: { name: 'Work Programs & Plans' } }, slug: 'ke-hoach-cong-tac', orderIndex: 3, isGovStandard: true },
      ]
    },
    {
      name: 'Công khai minh bạch', translations: { en: { name: 'Transparency & Accountability' } }, slug: 'cong-khai', orderIndex: 4, isGovStandard: true,
      children: [
        { name: 'Dự án đầu tư', translations: { en: { name: 'Investment Projects' } }, slug: 'du-an-dau-tu', orderIndex: 1, isGovStandard: true },
        { name: 'Đấu thầu, mua sắm công', translations: { en: { name: 'Bidding & Procurement' } }, slug: 'dau-thau', orderIndex: 2, isGovStandard: true },
        { name: 'Công khai ngân sách', translations: { en: { name: 'Budget Transparency' } }, slug: 'ngan-sach', orderIndex: 3, isGovStandard: true },
        { name: 'Dữ liệu mở', translations: { en: { name: 'Open Data' } }, slug: 'du-lieu-mo', orderIndex: 4, isGovStandard: true },
      ]
    }
  ];

  const categoryMap: Record<string, any> = {};

  const seedCategories = async (items: any[], parentId: string | null = null) => {
    for (const item of items) {
      const category = await (prisma as any).category.upsert({
        where: { slug: item.slug },
        update: {
          name: item.name,
          translations: item.translations || {},
          orderIndex: item.orderIndex,
          isGovStandard: item.isGovStandard,
          parentId: parentId
        },
        create: {
          name: item.name,
          translations: item.translations || {},
          slug: item.slug,
          orderIndex: item.orderIndex,
          isGovStandard: item.isGovStandard,
          parentId: parentId,
          status: true
        }
      });
      categoryMap[item.slug] = category;
      if (item.children) {
        await seedCategories(item.children, category.id);
      }
    }
  };

  await seedCategories(categoryData);
  console.log('✅ Categories seeded');

  // ==========================================================
  // 2. SAMPLE POSTS
  // ==========================================================
  console.log('📦 Seeding Sample Posts...');
  const posts = [
    {
      title: 'UBND tỉnh họp thường kỳ tháng 5/2024',
      slug: 'ubnd-tinh-hop-thuong-ky-thang-5-2024',
      description: 'Sáng nay, dưới sự chủ trì của Chủ tịch UBND tỉnh, phiên họp thường kỳ tháng 5 đã diễn ra...',
      content: 'Nội dung chi tiết về phiên họp thường kỳ...',
      categoryId: categoryMap['hoat-dong-lanh-dao']?.id,
      status: 'PUBLISHED',
      isFeatured: true
    },
    {
      title: 'Thông báo về việc nghỉ lễ Quốc khánh 2/9',
      slug: 'thong-bao-nghi-le-quoc-khanh-2-9',
      description: 'Căn cứ quy định của Bộ luật Lao động, UBND tỉnh thông báo lịch nghỉ lễ như sau...',
      content: 'Nội dung chi tiết thông báo nghỉ lễ...',
      categoryId: categoryMap['thong-bao']?.id,
      status: 'PUBLISHED',
      isNotification: true
    }
  ];

  for (const post of posts) {
    if (!post.categoryId) continue;
    await (prisma as any).post.upsert({
      where: { slug: post.slug },
      update: post,
      create: { ...post, authorId, publishedAt: new Date() }
    });
  }
  console.log('✅ Posts seeded');

  // ==========================================================
  // 3. BANNERS
  // ==========================================================
  console.log('📦 Seeding Banners...');
  const banners = [
    { name: 'Banner Chính - Chào mừng', slug: 'banner-main', imageUrl: 'https://placehold.co/1200x400?text=Welcome+to+Portal', position: 'top', orderIndex: 1 },
    { name: 'Banner Tuyên truyền NQ 12', slug: 'banner-nq12', imageUrl: 'https://placehold.co/1200x400?text=Tuyen+truyen+NQ+12', position: 'top', orderIndex: 2 }
  ];

  for (const b of banners) {
    await (prisma as any).banner.upsert({
      where: { slug: b.slug },
      update: b,
      create: b
    });
  }
  console.log('✅ Banners seeded');

  // ==========================================================
  // 4. PORTAL MENUS (Compliance Tree)
  // ==========================================================
  console.log('📦 Seeding Portal Menus...');
  const portalMenus = [
    // --- HORIZONTAL MENU (MAIN NAV) ---
    { name: 'Trang chủ', translations: { en: { name: 'Home' } }, link: '/', order: 1, type: 'URL', position: 'HORIZONTAL' },
    {
      name: 'Giới thiệu', translations: { en: { name: 'About Us' } }, link: '/chuyen-muc/gioi-thieu', order: 2, type: 'CATEGORY', position: 'HORIZONTAL',
      children: [
        { name: 'Sơ đồ tổ chức', translations: { en: { name: 'Organizational Chart' } }, link: '/chuyen-muc/so-do-to-chuc', order: 1, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Chức năng nhiệm vụ', translations: { en: { name: 'Functions & Duties' } }, link: '/chuyen-muc/chuc-nang-nhiem-vu', order: 2, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Lãnh đạo cơ quan', translations: { en: { name: 'Agency Leadership' } }, link: '/chuyen-muc/lanh-dao-co-quan', order: 3, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Thông tin tiếp công dân', translations: { en: { name: 'Citizen Reception' } }, link: '/chuyen-muc/tiep-cong-dan', order: 4, type: 'CATEGORY', position: 'HORIZONTAL' },
      ]
    },
    {
      name: 'Tin tức & Sự kiện', translations: { en: { name: 'News & Events' } }, link: '/chuyen-muc/tin-tuc', order: 3, type: 'CATEGORY', position: 'HORIZONTAL',
      children: [
        { name: 'Tin nổi bật', translations: { en: { name: 'Featured News' } }, link: '/chuyen-muc/tin-noi-bat', order: 1, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Hoạt động lãnh đạo', translations: { en: { name: 'Leadership Activities' } }, link: '/chuyen-muc/hoat-dong-lanh-dao', order: 2, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Thông báo', translations: { en: { name: 'Notifications' } }, link: '/chuyen-muc/thong-bao', order: 3, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Điểm tin báo chí', translations: { en: { name: 'Press Clippings' } }, link: '/chuyen-muc/diem-tin', order: 4, type: 'CATEGORY', position: 'HORIZONTAL' },
      ]
    },
    {
      name: 'Chỉ đạo & Điều hành', translations: { en: { name: 'Leadership & Management' } }, link: '/chuyen-muc/chi-dao', order: 4, type: 'CATEGORY', position: 'HORIZONTAL',
      children: [
        { name: 'Văn bản quy phạm', translations: { en: { name: 'Legal Documents' } }, link: '/chuyen-muc/van-ban-quy-pham', order: 1, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Văn bản chỉ đạo, điều hành', translations: { en: { name: 'Management Documents' } }, link: '/chuyen-muc/van-ban-chi-dao', order: 2, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Chương trình, kế hoạch công tác', translations: { en: { name: 'Work Programs & Plans' } }, link: '/chuyen-muc/ke-hoach-cong-tac', order: 3, type: 'CATEGORY', position: 'HORIZONTAL' },
      ]
    },
    {
      name: 'Công khai & Minh bạch', translations: { en: { name: 'Transparency & Accountability' } }, link: '/chuyen-muc/cong-khai', order: 5, type: 'CATEGORY', position: 'HORIZONTAL',
      children: [
        { name: 'Dự án đầu tư', translations: { en: { name: 'Investment Projects' } }, link: '/chuyen-muc/du-an-dau-tu', order: 1, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Đấu thầu, mua sắm công', translations: { en: { name: 'Bidding & Procurement' } }, link: '/chuyen-muc/dau-thau', order: 2, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Công khai ngân sách', translations: { en: { name: 'Budget Transparency' } }, link: '/chuyen-muc/ngan-sach', order: 3, type: 'CATEGORY', position: 'HORIZONTAL' },
        { name: 'Dữ liệu mở', translations: { en: { name: 'Open Data' } }, link: '/chuyen-muc/du-lieu-mo', order: 4, type: 'CATEGORY', position: 'HORIZONTAL' },
      ]
    },
    {
      name: 'Dịch vụ công', translations: { en: { name: 'Public Services' } }, link: '/dich-vu-cong', order: 6, type: 'URL', position: 'HORIZONTAL',
      children: [
        { name: 'Tra cứu thủ tục hành chính', translations: { en: { name: 'Search Admin Procedures' } }, link: '/dich-vu-cong/thu-tuc', order: 1, type: 'URL', position: 'HORIZONTAL' },
        { name: 'Tra cứu kết quả giải quyết hồ sơ', translations: { en: { name: 'Search Record Results' } }, link: '/dich-vu-cong/tra-cuu-ho-so', order: 2, type: 'URL', position: 'HORIZONTAL' },
        { name: 'Dịch vụ công trực tuyến', translations: { en: { name: 'Online Public Services' } }, link: 'https://dichvucong.daklak.gov.vn', order: 3, type: 'URL', target: '_blank', position: 'HORIZONTAL' },
        { name: 'Khảo sát mức độ hài lòng', translations: { en: { name: 'Satisfaction Survey' } }, link: '/dich-vu-cong/khao-sat', order: 4, type: 'URL', position: 'HORIZONTAL' },
      ]
    },
    // --- VERTICAL MENU (SIDEBAR / QUICK LINKS) ---
    {
      name: 'Liên kết nhanh', translations: { en: { name: 'Quick Links' } }, link: '#', order: 1, type: 'URL', position: 'VERTICAL',
      children: [
        { name: 'Tra cứu hồ sơ', translations: { en: { name: 'Search Application' } }, link: '/tra-cuu', order: 1, type: 'URL', position: 'VERTICAL' },
        { name: 'Đăng ký trực tuyến', translations: { en: { name: 'Online Registration' } }, link: '/dang-ky', order: 2, type: 'URL', position: 'VERTICAL' },
        { name: 'Hỏi đáp trực tuyến', translations: { en: { name: 'Online Q&A' } }, link: '/hoi-dap', order: 3, type: 'URL', position: 'VERTICAL' },
      ]
    },
    {
      name: 'Công cụ tiện ích', translations: { en: { name: 'Utilities' } }, link: '#', order: 2, type: 'URL', position: 'VERTICAL',
      children: [
        { name: 'Sơ đồ trang (Sitemap)', translations: { en: { name: 'Sitemap' } }, link: '/sitemap', order: 1, type: 'URL', position: 'VERTICAL' },
        { name: 'Phiên bản tiếng Anh', translations: { en: { name: 'English Version' } }, link: '/en', order: 2, type: 'URL', position: 'VERTICAL' },
        { name: 'Hỗ trợ người khuyết tật', translations: { en: { name: 'Accessibility Support' } }, link: '/accessibility', order: 3, type: 'URL', position: 'VERTICAL' },
      ]
    }
  ];

  const seedPortalMenus = async (items: any[], parentId: string | null = null) => {
    for (const item of items) {
      const existing = await (prisma as any).portalMenu.findFirst({
        where: { name: item.name, parentId, position: item.position }
      });

      let menu;
      if (existing) {
        menu = await (prisma as any).portalMenu.update({
          where: { id: existing.id },
          data: {
            translations: item.translations || {},
            link: item.link,
            order: item.order,
            type: item.type,
            position: item.position,
            target: item.target || '_self'
          }
        });
      } else {
        menu = await (prisma as any).portalMenu.create({
          data: {
            name: item.name,
            translations: item.translations || {},
            link: item.link,
            order: item.order,
            type: item.type,
            position: item.position,
            target: item.target || '_self',
            parentId,
            isActive: true
          }
        });
      }

      if (item.children) {
        await seedPortalMenus(item.children, menu.id);
      }
    }
  };

  await seedPortalMenus(portalMenus);
  console.log('✅ Portal Menus seeded');

  console.log('🎉 POSTS-SERVICE SEED COMPLETED SUCCESSFULLY');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });