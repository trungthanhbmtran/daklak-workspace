import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @GrpcMethod('CategoryService', 'CreateCategory')
  async createCategory(data: any) {
    const result = await this.categoriesService.create(data);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: { id: string }) {
    const result = await this.categoriesService.findOne(data.id);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories() {
    const result = await this.categoriesService.getTree();
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  async updateCategory(data: any) {
    const { id, ...rest } = data;
    const result = await this.categoriesService.update(id, rest);
    return { data: result };
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: { id: string }) {
    await this.categoriesService.remove(data.id);
    return { success: true };
  }

  @GrpcMethod('CategoryService', 'GetCategorySubTree')
  async getCategorySubTree(data: { id: string }) {
    const result = await this.categoriesService.findOne(data.id);
    return { data: [result] }; // Simplified
  }
}
