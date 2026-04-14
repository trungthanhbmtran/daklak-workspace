import { Injectable, NotFoundException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from '@generated/prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    if (data.parentId === '') data.parentId = null;
    return this.categoriesRepository.create(data);
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category)
      throw new RpcException({ code: 5, message: 'Category not found' });
    return category;
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    await this.findById(id); // Check existence
    if (data.parentId === '') data.parentId = null;
    return this.categoriesRepository.update(id, data);
  }

  async delete(id: string): Promise<Category> {
    await this.findById(id); // Check existence
    return this.categoriesRepository.delete(id);
  }

  async getAllFlat(): Promise<Category[]> {
    return this.categoriesRepository.findAllFlat();
  }

  async getFullTree(): Promise<any[]> {
    const categories = await this.categoriesRepository.findAllFlat();
    return this.buildTree(categories);
  }

  async getSubTree(id: string): Promise<any[]> {
    const root = await this.findById(id);
    const descendants = await this.categoriesRepository.findSubTree(
      root.lft,
      root.rgt,
    );
    return this.buildTree(descendants, root.parentId);
  }

  async getAllForPost(): Promise<Category[]> {
    return this.categoriesRepository.findActive();
  }

  private buildTree(nodes: Category[], parentId: string | null = null): any[] {
    return nodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({
        ...node,
        children: this.buildTree(nodes, node.id),
      }));
  }
}
