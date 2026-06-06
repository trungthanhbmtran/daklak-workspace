import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { parentId, translations, ...rest } = data;
    
    let parsedTranslations = {};
    if (translations) {
      try {
        parsedTranslations = typeof translations === 'string' ? JSON.parse(translations) : translations;
      } catch (e) {
        console.error('Error parsing translations in category create:', e);
      }
    }

    return this.prisma.category.create({
      data: {
        ...rest,
        translations: parsedTranslations,
        parentId: parentId || null,
        lft: 0,
        rgt: 0,
        depth: 0,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
    });
  }

  async update(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.translations && typeof updateData.translations === 'string') {
      try {
        updateData.translations = JSON.parse(updateData.translations);
      } catch (e) {
        console.error('Error parsing translations in category update:', e);
        delete updateData.translations;
      }
    }
    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  async getTree() {
    // Thuật toán O(N) Adjacency List cho cây danh mục không giới hạn độ sâu
    const allCategories = await this.prisma.category.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    const categoryMap = new Map<string, any>();
    const roots: any[] = [];

    // Khởi tạo map
    for (const cat of allCategories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Xây dựng cây
    for (const cat of allCategories) {
      const node = categoryMap.get(cat.id);
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          // Fallback nếu parent bị lỗi/xóa nhưng child vẫn còn
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
