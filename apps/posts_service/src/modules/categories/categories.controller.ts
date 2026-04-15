import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod('CategoryService', 'CreateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCategory(data: CreateCategoryDto) {
    const result = await this.categoryService.create(data);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: { id: string }) {
    const result = await this.categoryService.findById(data.id);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'GetCategorySubTree')
  async getCategorySubTree(data: { id: string }) {
    const result = await this.categoryService.getSubTree(data.id);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories(data: { mode?: string; id?: string }) {
    const { mode, id } = data;
    let result;
    switch (mode) {
      case 'flat':
        const flatCategories = await this.categoryService.getAllFlat();
        result = flatCategories.map(cat => ({
          ...cat,
          children: []
        }));
        break;
      case 'tree':
        result = await this.categoryService.getFullTree();
        break;
      case 'subtree':
        result = await this.categoryService.getSubTree(data.id!);
        break;
      case 'forPost':
        const activeCategories = await this.categoryService.getAllForPost();
        result = activeCategories.map(cat => ({
          ...cat,
          children: []
        }));
        break;
      default:
        const defaultCategories = await this.categoryService.getAllFlat();
        result = defaultCategories.map(cat => ({
          ...cat,
          children: []
        }));
    }
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(data: UpdateCategoryDto & { id: string }) {
    const { id, ...updateData } = data;
    const result = await this.categoryService.update(id, updateData);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: { id: string }) {
    await this.categoryService.delete(data.id);
    return { success: true };
  }
}
