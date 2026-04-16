import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod('CategoryService', 'CreateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCategory(data: CreateCategoryDto) {
    try {
      const result = await this.categoryService.create(data);
      return { data: result };
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
      let result: any[];
      switch (mode) {
        case 'flat': {
          const flatCategories = await this.categoryService.getAllFlat();
          result = flatCategories.map((cat) => ({
            ...cat,
            children: [],
          }));
          break;
        }
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
        case 'forPost': {
          const activeCategories = await this.categoryService.getAllForPost();
          result = activeCategories.map((cat) => ({
            ...cat,
            children: [],
          }));
          break;
        }
        default: {
          const defaultCategories = await this.categoryService.getAllFlat();
          result = defaultCategories.map((cat) => ({
            ...cat,
            children: [],
          }));
        }
      }
      return { data: result };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(data: UpdateCategoryDto & { id: string }) {
    try {
      const { id, ...rest } = data;
      if (!id)
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: 'ID is required',
        });

      const result = await this.categoryService.update(id, rest);
      return { data: result };
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
