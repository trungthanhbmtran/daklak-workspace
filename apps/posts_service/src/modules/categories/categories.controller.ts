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
    return this.categoryService.create(data);
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: { id: string }) {
    return this.categoryService.findById(data.id);
  }

  @GrpcMethod('CategoryService', 'GetCategorySubTree')
  async getCategorySubTree(data: { id: string }) {
    const result = await this.categoryService.getSubTree(data.id);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories(data: { mode: string; id?: string }) {
    let result;
    switch (data.mode) {
      case 'flat':
        result = await this.categoryService.getAllFlat();
        break;
      case 'tree':
        result = await this.categoryService.getFullTree();
        break;
      case 'subtree':
        result = await this.categoryService.getSubTree(data.id!);
        break;
      case 'forPost':
        result = await this.categoryService.getAllForPost();
        break;
      default:
        result = await this.categoryService.getAllFlat();
    }
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateCategory(data: UpdateCategoryDto & { id: string }) {
    return this.categoryService.update(data.id, data);
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: { id: string }) {
    await this.categoryService.delete(data.id);
    return { success: true };
  }
}
