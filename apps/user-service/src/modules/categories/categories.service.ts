import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Lấy tất cả danh mục của tất cả các nhóm (tự động hợp nhất bản dịch)
  async getAll(lang?: string) {
    const targetLang = lang || 'vi';
    const items = await this.prisma.category.findMany({
      orderBy: [{ groupCode: 'asc' }, { order: 'asc' }],
      include: {
        translations: {
          where: { langCode: targetLang },
        },
      },
    });

    return {
      data: items.map((item) => {
        const trans = item.translations?.[0];
        return {
          id: item.id,
          group: item.groupCode,
          code: item.code,
          order: item.order,
          isActive: item.isActive,
          name: trans?.name || '',
          description: trans?.description || '',
        };
      }),
      total: items.length
    };
  }

  // Lấy danh mục theo nhóm (tự động hợp nhất bản dịch)
  async getByGroup(
    group: string,
    lang?: string,
    opts?: {
      search?: string;
      limit?: number;
      skip?: number;
      selectedIds?: number[];
    },
  ) {
    const targetLang = lang || 'vi';
    const { search, limit, skip, selectedIds = [] } = opts ?? {};
    const hasSelected = selectedIds.length > 0;

    // 1. Luôn fetch selected items (dù không khớp search) để đảm bảo chúng xuất hiện
    const selectedItems = hasSelected
      ? await this.prisma.category.findMany({
          where: { groupCode: group, id: { in: selectedIds } },
          include: { translations: { where: { langCode: targetLang } } },
          orderBy: { order: 'asc' },
        })
      : [];

    // 2. Fetch search results (loại trừ các ID đã có trong selected)
    const excludeIds = selectedItems.map((i) => i.id);
    const where: any = {
      groupCode: group,
      isActive: true,
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      ...(search?.trim()
        ? {
            translations: {
              some: {
                langCode: targetLang,
                name: { contains: search.trim() },
              },
            },
          }
        : {}),
    };

    const [searchItems, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: { order: 'asc' },
        take:
          limit && limit > 0
            ? Math.max(limit - selectedItems.length, 0)
            : undefined,
        skip: skip && skip > 0 ? skip : undefined,
        include: { translations: { where: { langCode: targetLang } } },
      }),
      this.prisma.category.count({ where }),
    ]);

    // 3. Merge: selected first, rồi search results
    const mapItem = (item: any, selected: boolean) => {
      const trans = item.translations?.[0];
      return {
        id: item.id,
        group: item.groupCode,
        code: item.code,
        order: item.order,
        isSystem: item.isSystem,
        isActive: item.isActive,
        createdAt: item.createdAt,
        name: trans?.name || '',
        description: trans?.description || '',
        selected,
      };
    };

    return {
      data: [
        ...selectedItems.map((i) => mapItem(i, true)),
        ...searchItems.map((i) => mapItem(i, false)),
      ],
      total: totalCount + selectedItems.length,
    };
  }

  async getAllGroups() {
    // 1. Lấy tất cả các nhóm đã được định nghĩa tên (CategoryGroup)
    const definedGroups = await this.prisma.categoryGroup.findMany({
      where: { isActive: true },
    });

    // 2. Lấy tất cả các mã nhóm thực tế đang có trong bảng dữ liệu (Category)
    const actualGroups = await this.prisma.category.findMany({
      select: { groupCode: true },
      distinct: ['groupCode'],
    });

    // 3. Hợp nhất mã nhóm từ cả 2 nguồn để không bỏ sót bất kỳ nhóm nào
    const allCodes = Array.from(
      new Set([
        ...definedGroups.map((g) => g.code),
        ...actualGroups.map((g) => g.groupCode),
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
        groupCode: data.group,
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
      group: created.groupCode,
      code: created.code,
      order: created.order,
      isActive: created.isActive,
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
      group: updatedCategory.groupCode,
      code: updatedCategory.code,
      order: updatedCategory.order,
      isActive: updatedCategory.isActive,
      name: trans?.name || '',
      description: trans?.description || '',
    };
  }

  // Xóa danh mục
  async delete(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) return false;
    await this.prisma.category.delete({ where: { id } });
    return true;
  }
}
