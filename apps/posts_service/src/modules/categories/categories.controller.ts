import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { LinkType } from '@generated/prisma/client';

interface CategoryInput extends CreateCategoryDto {
  parent_id?: string;
  link_type?: string;
  custom_url?: string;
  order_index?: number;
  meta_title?: string;
  meta_description?: string;
  is_gov_standard?: boolean;
}

@Controller()
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) { }

  @GrpcMethod('CategoryService', 'CreateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCategory(data: CategoryInput) {
    try {
      const payload: CreateCategoryDto = {
        ...data,
        parentId: data.parentId ?? data.parent_id,
        linkType: (data.linkType ?? data.link_type) as LinkType,
        customUrl: data.customUrl ?? data.custom_url,
        orderIndex: data.orderIndex ?? data.order_index,
        metaTitle: data.metaTitle ?? data.meta_title,
        metaDescription: data.metaDescription ?? data.meta_description,
        isGovStandard: data.isGovStandard ?? data.is_gov_standard,
      };
      const result = await this.categoryService.create(payload);
      return { data: result };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: { id: string }) {
    try {
      const result = await this.categoryService.findById(data.id);
      if (!result)
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Category not found',
        });
      return { data: result };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('CategoryService', 'GetCategorySubTree')
  async getCategorySubTree(data: { id: string }) {
    try {
      const result = await this.categoryService.getSubTree(data.id);
      return { data: result };
    } catch (error: any) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories(data: { mode?: string; id?: string }) {
    try {
      const { mode, id } = data;
      let result;
      switch (mode) {
        case 'flat':
          const flatCategories = await this.categoryService.getAllFlat();
          result = flatCategories.map((cat) => ({
            ...cat,
            children: [],
          }));
          break;
        case 'tree':
          result = await this.categoryService.getFullTree();
          break;
        case 'subtree':
          if (!id)
            throw new RpcException({
              code: GrpcStatus.INVALID_ARGUMENT,
              message: 'ID is required for subtree mode',
            });
          result = await this.categoryService.getSubTree(id);
          break;
        case 'forPost':
          const activeCategories = await this.categoryService.getAllForPost();
          result = activeCategories.map((cat) => ({
            ...cat,
            children: [],
          }));
          break;
        default:
          const defaultCategories = await this.categoryService.getAllFlat();
          result = defaultCategories.map((cat) => ({
            ...cat,
            children: [],
          }));
      }
      return { data: result };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(data: CategoryInput & { id: string }) {
    try {
      const { id, ...rest } = data;
      if (!id)
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: 'ID is required',
        });

      const payload: UpdateCategoryDto = {
        ...rest,
        parentId: rest.parentId ?? rest.parent_id,
        linkType: (rest.linkType ?? rest.link_type) as LinkType,
        customUrl: rest.customUrl ?? rest.custom_url,
        orderIndex: rest.orderIndex ?? rest.order_index,
        metaTitle: rest.metaTitle ?? rest.meta_title,
        metaDescription: rest.metaDescription ?? rest.meta_description,
        isGovStandard: rest.isGovStandard ?? rest.is_gov_standard,
      };

      const result = await this.categoryService.update(id, payload);
      return { data: result };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: { id: string }) {
    try {
      if (!data.id)
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: 'ID is required',
        });
      await this.categoryService.delete(data.id);
      return { success: true };
    } catch (error: any) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
