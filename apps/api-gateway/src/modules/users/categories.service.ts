import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

function toFrontendItem(c: any) {
  return {
    id: c.id,
    group: c.group ?? '',
    code: c.code ?? '',
    name: c.name ?? '',
    sort: c.order ?? 0,
    active: (c.isActive ?? c.is_active ?? true) ? 1 : 0,
    description: c.description ?? '',
  };
}

@Injectable()
export class CategoriesService implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.categoryService = this.client.getService(MICROSERVICES.SYS_CATEGORY.SERVICE);
  }

  async getGroups() {
    try {
      const res: any = await firstValueFrom(
        this.categoryService.GetAllGroups({}),
      );
      return { success: true, data: res.groups };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Chưa thể kết nối tới dịch vụ danh mục',
      };
    }
  }

  async updateGroup(code: string, body: { name: string; order?: number }) {
    try {
      const res: any = await firstValueFrom(
        this.categoryService.UpdateGroup({
          code,
          name: body.name,
          order: body.order ?? 0,
        }),
      );
      return { success: true, data: res };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi cập nhật nhóm danh mục',
      };
    }
  }

  async getByGroup(
    group?: string,
    q?: string,
    limit?: string,
    skip?: string,
    selectedIds?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const selectedIdsArr = selectedIds
      ? selectedIds
          .split(',')
          .map(Number)
          .filter((n) => !isNaN(n) && n > 0)
      : [];

    if (!group) {
      const result: any = await firstValueFrom(
        this.categoryService.GetAllCategories({}),
      ).catch((e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      });
      return {
        success: true,
        data: result?.data,
        meta: { total: result?.total || result?.data?.length || 0 },
      };
    }
    const result: any = await firstValueFrom(
      this.categoryService.GetByGroup({
        group: group || '',
        search: q || '',
        take: limitNum,
        skip: skipNum,
        selectedIds: selectedIdsArr,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return {
      success: true,
      data: result?.data,
      meta: { total: result?.total || result?.data?.length || 0 },
    };
  }

  async create(body: {
    group: string;
    code: string;
    name: string;
    description?: string;
    order?: number;
  }) {
    const res = await firstValueFrom(
      this.categoryService.Create({
        group: body.group,
        code: body.code,
        name: body.name,
        description: body.description,
        order: body.order,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return { success: true, data: toFrontendItem(res as any) };
  }

  async update(
    id: number,
    body: {
      code?: string;
      name?: string;
      description?: string;
      order?: number;
      sort?: number;
      active?: number;
    },
  ) {
    const payload = {
      id,
      code: body.code,
      name: body.name,
      description: body.description,
      order: body.order ?? body.sort,
      isActive: body.active !== undefined ? !!body.active : undefined,
    };
    const res = await firstValueFrom(
      this.categoryService.Update(payload),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return { success: true, data: toFrontendItem(res as any) };
  }

  async delete(id: number) {
    const res = (await firstValueFrom(
      this.categoryService.Delete({ id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    })) as any;
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'Đã xóa danh mục',
    };
  }

  // Cho PublicCategoriesController
  async publicGetByGroup(query: any) {
    const group = query.group;
    const lang = query.lang || 'vi';
    const limitNum = query.limit ? parseInt(query.limit, 10) : 50;
    const skipNum = query.skip ? parseInt(query.skip, 10) : 0;

    if (!group) {
      const result: any = await firstValueFrom(
        this.categoryService.GetAllCategories({ lang }),
      ).catch((e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      });
      return {
        success: true,
        data: result?.data,
        meta: { total: result?.total || result?.data?.length || 0 },
      };
    }
    const result: any = await firstValueFrom(
      this.categoryService.GetByGroup({
        group: group || '',
        lang,
        search: query.q || '',
        take: limitNum,
        skip: skipNum,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return {
      success: true,
      data: result?.data,
      meta: { total: result?.total || result?.data?.length || 0 },
    };
  }
}
