import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';

function sanitizeCategory(cat: any): any {
  if (!cat) return null;
  return {
    id: cat.id || '',
    name: cat.name || '',
    slug: cat.slug || '',
    parentId: cat.parentId || '',
    lft: cat.lft || 0,
    rgt: cat.rgt || 0,
    depth: cat.depth || 0,
    thumbnail: cat.thumbnail || '',
    linkType: cat.linkType || 'standard',
    customUrl: cat.customUrl || '',
    target: cat.target || '_self',
    orderIndex: cat.orderIndex || 0,
    description: cat.description || '',
    status: cat.status !== undefined ? cat.status : true,
    isGovStandard: cat.isGovStandard !== undefined ? cat.isGovStandard : false,
    attachmentId: cat.attachmentId || '',
    children: Array.isArray(cat.children) 
      ? cat.children.filter((c: any) => !!c).map(sanitizeCategory) 
      : [],
    postsCount: (cat as any)._count?.posts || cat.postsCount || 0,
  };
}

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @GrpcMethod('CategoryService', 'CreateCategory')
  async createCategory(data: any) {
    const result = await this.categoriesService.create(data);
    return { data: sanitizeCategory(result) };
  }

  @GrpcMethod('CategoryService', 'GetCategory')
  async getCategory(data: { id: string }) {
    const result = await this.categoriesService.findOne(data.id);
    return { data: sanitizeCategory(result) };
  }

  @GrpcMethod('CategoryService', 'ListCategories')
  async listCategories() {
    const result = await this.categoriesService.getTree();
    return { data: (result || []).map(sanitizeCategory).filter(Boolean) };
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  async updateCategory(data: any) {
    const { id, ...rest } = data;
    const result = await this.categoriesService.update(id, rest);
    return { data: sanitizeCategory(result) };
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(data: { id: string }) {
    await this.categoriesService.remove(data.id);
    return { success: true };
  }

  @GrpcMethod('CategoryService', 'GetCategorySubTree')
  async getCategorySubTree(data: { id: string }) {
    const result = await this.categoriesService.findOne(data.id);
    const sanitized = sanitizeCategory(result);
    return { data: sanitized ? [sanitized] : [] };
  }
}
