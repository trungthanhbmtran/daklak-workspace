import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  // Lấy danh mục theo nhóm (trả về tất cả để Admin quản lý, kể cả tạm ẩn)
  async getByGroup(group: string) {
    return this.prisma.category.findMany({
      where: { group },
      orderBy: { order: 'asc' },
    });
  }

  async getAllGroups() {
    const groups = await this.prisma.categoryGroup.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Nếu bảng CategoryGroup trống (chưa seed), trả về danh sách group code từ Category như cũ làm fallback
    if (groups.length === 0) {
      const distinctGroups = await this.prisma.category.findMany({
        select: { group: true },
        distinct: ['group'],
      });
      return distinctGroups.map((g) => ({ code: g.group, name: g.group }));
    }

    return groups.map((g) => ({ code: g.code, name: g.name }));
  }

  // Tạo mới (Dành cho Admin cấu hình)
  async create(data: { group: string; code: string; name: string; description?: string; order?: number }) {
    return this.prisma.category.create({
      data: {
        group: data.group,
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        order: data.order ?? 0,
      },
    });
  }

  // Cập nhật
  async update(
    id: number,
    data: { code?: string; name?: string; description?: string; order?: number; isActive?: boolean },
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) return null;
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  // Xóa (không cho xóa dữ liệu hệ thống)
  async delete(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) return false;
    if (category.isSystem) {
      throw new Error('Không thể xóa danh mục hệ thống.');
    }
    await this.prisma.category.delete({ where: { id } });
    return true;
  }
}