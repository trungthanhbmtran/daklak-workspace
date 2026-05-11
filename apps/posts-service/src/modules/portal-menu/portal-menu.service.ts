import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PortalMenuService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    let translations = {};
    if (data.translations) {
      try {
        translations = typeof data.translations === 'string' ? JSON.parse(data.translations) : data.translations;
      } catch (e) {
        console.error('Error parsing translations:', e);
      }
    }

    return this.prisma.portalMenu.create({
      data: {
        name: data.name,
        description: data.description,
        translations: translations,
        icon: data.icon,
        link: data.link,
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
    const where: any = { parentId: null };
    if (onlyActive) where.isActive = true;
    if (position && position !== 'ALL') where.position = position;

    return this.prisma.portalMenu.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      },
    });
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

    if (updateData.translations && typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (e) {
        console.error('Error parsing translations in update:', e);
        delete updateData.translations;
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
