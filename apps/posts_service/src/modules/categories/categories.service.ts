import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@generated/prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  private formatCategory(category: any) {
    if (!category) return null;
    return {
      ...category,
      parentId: category.parentId || '',
      description: category.description || '',
      thumbnail: category.thumbnail || '',
      customUrl: category.customUrl || '',
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      createdAt:
        category.createdAt instanceof Date
          ? category.createdAt.toISOString()
          : category.createdAt,
      updatedAt:
        category.updatedAt instanceof Date
          ? category.updatedAt.toISOString()
          : category.updatedAt,
    };
  }

  async create(data: CreateCategoryDto): Promise<any> {
    if (data.parentId === '') {
      data.parentId = null;
    }
    const result = await this.categoriesRepository.create(data);
    return this.formatCategory(result);
  }

  async findById(id: string): Promise<any> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new RpcException({ code: 5, message: 'Category not found' });
    }
    return this.formatCategory(category);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<any> {
    await this.findById(id); // Check existence
    if (data.parentId === '') {
      data.parentId = null;
    }
    const result = await this.categoriesRepository.update(id, data);
    return this.formatCategory(result);
  }

  async delete(id: string): Promise<any> {
    const category = await this.findById(id); // Check existence
    const result = await this.categoriesRepository.delete(id);
    return this.formatCategory(result);
  }

  async getAllFlat(): Promise<any[]> {
    const categories = await this.categoriesRepository.findAllFlat();
    return categories.map((cat) => this.formatCategory(cat));
  }

  async getFullTree(): Promise<any[]> {
    const categories = await this.categoriesRepository.findAllFlat();
    return this.buildTree(categories);
  }

  async getSubTree(id: string): Promise<any[]> {
    const root = await this.categoriesRepository.findById(id);
    if (!root) {
      throw new RpcException({ code: 5, message: 'Category not found' });
    }
    const descendants = await this.categoriesRepository.findSubTree(
      root.lft,
      root.rgt,
    );
    return this.buildTree(descendants, root.parentId);
  }

  async getAllForPost(): Promise<any[]> {
    const categories = await this.categoriesRepository.findActive();
    return categories.map((cat) => this.formatCategory(cat));
  }

  private buildTree(nodes: any[], parentId: string | null = null): any[] {
    return nodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({
        ...this.formatCategory(node),
        children: this.buildTree(nodes, node.id),
      }));
  }
}
