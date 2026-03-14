import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { CategoriesService } from './categories.service';

function toItem(c: any) {
  return {
    id: c.id,
    group: c.group,
    code: c.code,
    name: c.name,
    description: c.description ?? '',
    order: c.order,
    isSystem: c.isSystem ?? false,
    isActive: c.isActive ?? true,
  };
}

@Controller()
export class CategoriesController {
  constructor(private readonly catService: CategoriesService) {}

  @GrpcMethod('CategoryService', 'GetByGroup')
  async getByGroup(data: { group: string }) {
    const list = await this.catService.getByGroup(data.group || '');
    return { data: list.map((c: any) => toItem(c)) };
  }

  @GrpcMethod('CategoryService', 'Create')
  async create(data: { group: string; code: string; name: string; description?: string; order?: number }) {
    const category = await this.catService.create({
      group: data.group,
      code: data.code,
      name: data.name,
      description: data.description,
      order: data.order,
    });
    return {
      id: category.id,
      group: category.group,
      code: category.code,
      name: category.name,
      order: category.order,
      isActive: category.isActive ?? true,
    };
  }

  @GrpcMethod('CategoryService', 'Update')
  async update(data: { id: number; code?: string; name?: string; description?: string; order?: number; isActive?: boolean }) {
    const category = await this.catService.update(data.id, {
      code: data.code,
      name: data.name,
      description: data.description,
      order: data.order,
      isActive: data.isActive,
    });
    if (!category) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Category not found' });
    }
    return toItem(category);
  }

  @GrpcMethod('CategoryService', 'Delete')
  async delete(data: { id: number }) {
    try {
      const ok = await this.catService.delete(data.id);
      return { success: ok, message: 'Đã xóa danh mục' };
    } catch (e: any) {
      if (e.message?.includes('hệ thống')) {
        throw new RpcException({ code: GrpcStatus.FAILED_PRECONDITION, message: e.message });
      }
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }
}
