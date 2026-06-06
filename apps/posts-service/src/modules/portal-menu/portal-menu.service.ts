import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { generateSlug } from '../../utils/slug.util';

@Injectable()
export class PortalMenuService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    let translations: any = {};
    if (data.translations) {
      try {
        translations = typeof data.translations === 'string' ? JSON.parse(data.translations) : data.translations;
      } catch (e) {
        console.error('Error parsing translations:', e);
      }
    }

    // Auto generate slug/link for translations if missing
    for (const [lang, trans] of Object.entries(translations)) {
      const t: any = trans;
      if (t.name && !t.slug) {
        t.slug = generateSlug(t.name);
      }
    }

    // Auto generate link if not provided and it's a URL or CUSTOM_PAGE
    let finalLink = data.link;
    if (!finalLink && data.name && (data.type === 'URL' || data.type === 'CUSTOM_PAGE')) {
      finalLink = data.type === 'CUSTOM_PAGE' ? `/tuy-bien/${generateSlug(data.name)}` : `/${generateSlug(data.name)}`;
    }

    return this.prisma.portalMenu.create({
      data: {
        name: data.name,
        description: data.description,
        translations: translations,
        icon: data.icon,
        link: finalLink,
        order: data.order || 0,
        parentId: data.parentId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        target: data.target || '_self',
        type: data.type || 'URL',
        referenceId: data.referenceId,
        position: data.position || 'HORIZONTAL',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.portalMenu.findUnique({
      where: { id },
      include: { children: { orderBy: { order: 'asc' } } },
    });
  }

  async findAll(onlyActive = false, position?: string) {
    const where: any = {};
    // Sửa lỗi Prisma cũ: áp dụng isActive cho toàn bộ cây thay vì chỉ Root
    if (onlyActive) where.isActive = true;

    // Lấy toàn bộ mảng phẳng
    const allMenus = await this.prisma.portalMenu.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    const menuMap = new Map<string, any>();
    const roots: any[] = [];

    // Khởi tạo Node
    for (const menu of allMenus) {
      menuMap.set(menu.id, { ...menu, children: [] });
    }

    // Xây dựng Cây O(N)
    for (const menu of allMenus) {
      const node = menuMap.get(menu.id);
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        // Lọc Position chỉ áp dụng cho Root Level
        let match = true;
        if (position && position !== 'ALL' && node.position !== position) match = false;
        if (match) roots.push(node);
      }
    }

    return roots;
  }

  async update(id: string, data: any) {
    const allowedFields = [
      'name',
      'description',
      'translations',
      'icon',
      'link',
      'order',
      'parentId',
      'isActive',
      'target',
      'type',
      'referenceId',
      'position',
    ];

    const updateData: any = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    if (updateData.parentId === '') {
      updateData.parentId = null;
    }
    if (updateData.referenceId === '') {
      updateData.referenceId = null;
    }

    if (updateData.translations) {
      if (typeof updateData.translations === 'string') {
        try {
          updateData.translations = JSON.parse(updateData.translations);
        } catch (e) {
          console.error('Error parsing translations in update:', e);
          delete updateData.translations;
        }
      }

      if (updateData.translations && typeof updateData.translations === 'object') {
        for (const [lang, trans] of Object.entries(updateData.translations)) {
          const t: any = trans;
          if (t.name && !t.slug) {
            t.slug = generateSlug(t.name);
          }
        }
      }
    }

    // Auto generate link if not provided and it's a URL or CUSTOM_PAGE
    if (updateData.name && !updateData.link) {
      // Only do this if we are actively changing the link to empty, or if we know the type requires it
      const type = updateData.type || 'URL';
      if (updateData.link === '' && (type === 'URL' || type === 'CUSTOM_PAGE')) {
        updateData.link = type === 'CUSTOM_PAGE' ? `/tuy-bien/${generateSlug(updateData.name)}` : `/${generateSlug(updateData.name)}`;
      }
    }

    return this.prisma.portalMenu.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.prisma.portalMenu.delete({ where: { id } });
    return { success: true };
  }

  async getQuickSetupData() {
    return {
      docGroups: [
        { id: "INCOMING", name: "Văn bản đến", path: "/van-ban/den", icon: "FileText", order: 1 },
        { id: "OUTGOING", name: "Văn bản đi", path: "/van-ban/di", icon: "FileText", order: 2 },
        { id: "INTERNAL", name: "Văn bản nội bộ", path: "/van-ban/noi-bo", icon: "FileText", order: 3 },
        { id: "FINANCE", name: "Công khai tài chính", path: "/van-ban/tai-chinh", icon: "FileText", order: 4 },
        { id: "CONSULTATION", name: "Lấy ý kiến dự thảo", path: "/lay-y-kien", icon: "FileText", order: 5 }
      ],
      complianceModules: [
        { id: "OPEN_DATA", name: "Dữ liệu mở", path: "/cong-khai/du-lieu-mo", icon: "Globe", order: 1 },
        { id: "BIDDING", name: "Đấu thầu, mua sắm công", path: "/cong-khai/dau-thau", icon: "Globe", order: 2 },
        { id: "STRATEGY", name: "Chiến lược, quy hoạch", path: "/cong-khai/quy-hoach", icon: "Globe", order: 3 },
        { id: "SATISFACTION", name: "Khảo sát sự hài lòng", path: "/dich-vu-cong/khao-sat", icon: "Globe", order: 4 },
        { id: "SITEMAP", name: "Sơ đồ trang (Sitemap)", path: "/sitemap", icon: "Globe", order: 5 },
        { id: "ENGLISH", name: "Phiên bản tiếng Anh", path: "/en", icon: "Globe", order: 6 }
      ],
      defaultPages: [
        { id: "HOME", name: "Trang chủ", path: "/", icon: "Home", order: 1 },
        { id: "NEWS", name: "Tin tức & Sự kiện", path: "/tin-tuc", icon: "Newspaper", order: 2 },
        { id: "DOCS", name: "Văn bản quy phạm", path: "/van-ban", icon: "FileText", order: 3 },
        { id: "CONTACT", name: "Liên hệ", path: "/lien-he", icon: "Phone", order: 10 }
      ]
    };
  }
}
