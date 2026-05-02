import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) { }

  // Lấy tất cả danh mục của tất cả các nhóm
  async getAll() {
    return this.prisma.category.findMany({
      orderBy: [
        { group: 'asc' },
        { order: 'asc' },
      ],
    });
  }

  // Lấy danh mục theo nhóm (trả về tất cả để Admin quản lý, kể cả tạm ẩn)
  async getByGroup(group: string) {
    return this.prisma.category.findMany({
      where: { group },
      orderBy: { order: 'asc' },
    });
  }

  async getAllGroups() {
    // 1. Lấy tất cả các nhóm đã được định nghĩa tên (CategoryGroup)
    const definedGroups = await this.prisma.categoryGroup.findMany({
      where: { isActive: true },
    });

    // 2. Lấy tất cả các mã nhóm thực tế đang có trong bảng dữ liệu (Category)
    const actualGroups = await this.prisma.category.findMany({
      select: { group: true },
      distinct: ['group'],
    });

    // 3. Hợp nhất mã nhóm từ cả 2 nguồn để không bỏ sót bất kỳ nhóm nào
    const allCodes = Array.from(new Set([
      ...definedGroups.map(g => g.code),
      ...actualGroups.map(g => g.group)
    ]));

    // 4. Map lại thành đối tượng { code, name } và kèm theo thứ tự sắp xếp
    const result = allCodes.map(code => {
      const defined = definedGroups.find(dg => dg.code === code);
      return {
        code,
        name: defined?.name || code, // Nếu chưa có tên hiển thị thì dùng mã code
        order: defined?.order ?? 999,
      };
    });

    // 5. Sắp xếp theo thứ tự đã định nghĩa (order)
    return result.sort((a, b) => a.order - b.order);
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