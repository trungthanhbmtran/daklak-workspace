import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoryService } from './category.service';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod('CategoryService', 'CreateCategory')
  createCategory(data: any) {
    return this.categoryService.create(data);
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  getCategory(data: { id: string }) {
    return this.categoryService.findOne(data.id);
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  listCategories(data: any) {
    return this.categoryService.findAll(data);
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  updateCategory(data: any) {
    return this.categoryService.update(data.id, data);
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  deleteCategory(data: { id: string }) {
    return this.categoryService.remove(data.id);
  }
}
