import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Lấy tất cả danh mục của tất cả các nhóm (tự động hợp nhất bản dịch)
  async getAll(lang?: string) {
    const targetLang = lang || 'vi';
    const items = await this.prisma.category.findMany({
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
      include: {
        translations: {
          where: { langCode: targetLang },
        },
      },
    });

    return items.map((item) => {
      const trans = item.translations?.[0];
      return {
        id: item.id,
        group: item.group,
        code: item.code,
        order: item.order,
        isSystem: item.isSystem,
        isActive: item.isActive,
        createdAt: item.createdAt,
        name: trans?.name || '',
        description: trans?.description || '',
      };
    });
  }

  // Lấy danh mục theo nhóm (tự động hợp nhất bản dịch)
  async getByGroup(group: string, lang?: string) {
    const targetLang = lang || 'vi';
    const items = await this.prisma.category.findMany({
      where: { group },
      orderBy: { order: 'asc' },
      include: {
        translations: {
          where: { langCode: targetLang },
        },
      },
    });

    return items.map((item) => {
      const trans = item.translations?.[0];
      return {
        id: item.id,
        group: item.group,
        code: item.code,
        order: item.order,
        isSystem: item.isSystem,
        isActive: item.isActive,
        createdAt: item.createdAt,
        name: trans?.name || '',
        description: trans?.description || '',
      };
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
    const allCodes = Array.from(
      new Set([
        ...definedGroups.map((g) => g.code),
        ...actualGroups.map((g) => g.group),
      ]),
    );

    // 4. Map lại thành đối tượng { code, name } và kèm theo thứ tự sắp xếp
    const result = allCodes.map((code) => {
      const defined = definedGroups.find((dg) => dg.code === code);
      return {
        code,
        name: defined?.name || code, // Nếu chưa có tên hiển thị thì dùng mã code
        order: defined?.order ?? 999,
      };
    });

    // 5. Sắp xếp theo thứ tự đã định nghĩa (order)
    return result.sort((a, b) => a.order - b.order);
  }

  // Tạo mới (Tạo danh mục + Bản dịch mặc định Tiếng Việt 'vi')
  async create(data: {
    group: string;
    code: string;
    name: string;
    description?: string;
    order?: number;
  }) {
    const created = await this.prisma.category.create({
      data: {
        group: data.group,
        code: data.code,
        order: data.order ?? 0,
        translations: {
          create: {
            langCode: 'vi',
            name: data.name,
            description: data.description ?? null,
          },
        },
      },
      include: {
        translations: {
          where: { langCode: 'vi' },
        },
      },
    });

    const trans = created.translations?.[0];
    return {
      id: created.id,
      group: created.group,
      code: created.code,
      order: created.order,
      isSystem: created.isSystem,
      isActive: created.isActive,
      createdAt: created.createdAt,
      name: trans?.name || '',
      description: trans?.description || '',
    };
  }

  // Cập nhật (Cập nhật danh mục + Cập nhật hoặc Upsert bản dịch Tiếng Việt 'vi')
  async update(
    id: number,
    data: {
      code?: string;
      name?: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    },
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) return null;

    // 1. Cập nhật các trường chung của Category
    await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // 2. Cập nhật hoặc Upsert bản dịch mặc định 'vi'
    if (data.name !== undefined || data.description !== undefined) {
      await this.prisma.categoryTranslation.upsert({
        where: { categoryId_langCode: { categoryId: id, langCode: 'vi' } },
        update: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
        },
        create: {
          categoryId: id,
          langCode: 'vi',
          name: data.name ?? '',
          description: data.description ?? null,
        },
      });
    }

    // 3. Trả về đối tượng sau cập nhật cùng với bản dịch Tiếng Việt
    const updatedCategory = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: {
          where: { langCode: 'vi' },
        },
      },
    });

    if (!updatedCategory) return null;
    const trans = updatedCategory.translations?.[0];
    return {
      id: updatedCategory.id,
      group: updatedCategory.group,
      code: updatedCategory.code,
      order: updatedCategory.order,
      isSystem: updatedCategory.isSystem,
      isActive: updatedCategory.isActive,
      createdAt: updatedCategory.createdAt,
      name: trans?.name || '',
      description: trans?.description || '',
    };
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
