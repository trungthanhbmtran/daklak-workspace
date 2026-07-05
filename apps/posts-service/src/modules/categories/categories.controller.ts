import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';

function sanitizeCategory(cat: any): any {
  if (!cat) {
    return {
      id: '',
      name: '',
      slug: '',
      parentId: '',
      lft: 0,
      rgt: 0,
      depth: 0,
      thumbnail: '',
      linkType: '',
      customUrl: '',
      target: '_self',
      orderIndex: 0,
      children: [],
      description: '',
      status: true,
      isGovStandard: false,
      attachmentId: '',
    };
  }
  const sanitized: any = {
    id: cat.id || '',
    name: cat.name || '',
    slug: cat.slug || '',
    parentId: cat.parentId || '',
    lft: Number(cat.lft) || 0,
    rgt: Number(cat.rgt) || 0,
    depth: Number(cat.depth) || 0,
    thumbnail: cat.thumbnail || '',
    linkType: cat.linkType || 'standard',
    customUrl: cat.customUrl || '',
    target: cat.target || '_self',
    orderIndex: Number(cat.orderIndex) || 0,
    description: cat.description || '',
    status: cat.status === true || cat.status === 1,
    isGovStandard: cat.isGovStandard === true || cat.isGovStandard === 1,
    attachmentId: cat.attachmentId || '',
    translations: cat.translations ? JSON.stringify(cat.translations) : '{}',
    createdAt: cat.createdAt ? (typeof cat.createdAt === 'string' ? cat.createdAt : cat.createdAt.toISOString()) : '',
    updatedAt: cat.updatedAt ? (typeof cat.updatedAt === 'string' ? cat.updatedAt : cat.updatedAt.toISOString()) : '',
  };

  // Only include children if it's an array and filter out any null/undefined
  if (Array.isArray(cat.children)) {
    sanitized.children = cat.children
      .filter((c: any) => !!c)
      .map((c: any) => sanitizeCategory(c))
      .filter((c: any) => !!c);
  } else {
    sanitized.children = [];
  }

  return sanitized;
}

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

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
  async listCategories(data: any) {
    const mode = data?.mode || 'flat';
    console.log(`CategoryService.ListCategories called with mode: ${mode}`);
    try {
      if (mode === 'tree') {
        const result = await this.categoriesService.getTree();
        const sanitized = (result || []).map(cat => sanitizeCategory(cat)).filter(c => !!c);
        return { data: sanitized };
      } else {
        const result = await this.categoriesService.findAll({
          skip: data.skip,
          take: data.take,
          search: data.search
        });
        const sanitized = (result.data || []).map(cat => sanitizeCategory(cat)).filter(c => !!c);
        return { data: sanitized, meta: { total: result.total } };
      }
    } catch (error) {
      console.error('Error in listCategories:', error);
      throw error;
    }
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
