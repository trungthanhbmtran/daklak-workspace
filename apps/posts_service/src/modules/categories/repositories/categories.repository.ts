import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Category, Prisma } from '@generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesRepository extends BaseRepository<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.category);
  }

  protected prepareQuery(query: any): {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput;
  } {
    return {
      where: query.where,
      orderBy: query.orderBy || { lft: 'asc' },
    };
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    return this.prisma.$transaction(async (tx) => {
      let lft = 1;
      let depth = 0;

      if (data.parentId) {
        const parent = await tx.category.findUnique({
          where: { id: data.parentId },
        });
        if (parent) {
          lft = parent.rgt;
          depth = parent.depth + 1;

          // Shift other nodes
          await tx.category.updateMany({
            where: { rgt: { gte: lft } },
            data: { rgt: { increment: 2 } },
          });
          await tx.category.updateMany({
            where: { lft: { gte: lft } },
            data: { lft: { increment: 2 } },
          });
        }
      } else {
        const maxRgt = await tx.category.aggregate({
          _max: { rgt: true },
        });
        lft = (maxRgt._max.rgt || 0) + 1;
      }

      return tx.category.create({
        data: {
          ...data,
          lft,
          rgt: lft + 1,
          depth,
        },
      });
    });
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new Error('Category not found');

    // If parentId is changing, it's a move operation
    if (data.parentId !== undefined && data.parentId !== existing.parentId) {
      // Simplest move strategy: delete and re-insert
      // But we can just use the update method and then call a "rebuild" 
      // or implement the move logic.
      // For now, let's just update the fields and then rebuild if parent changed
      // or just update fields if parent didn't change.
      
      // Let's implement a full rebuild to keep it simple and correct for now
      // This is less efficient but much more reliable than complex node shifting logic
      const result = await this.prisma.category.update({
        where: { id },
        data,
      });
      await this.rebuildTree();
      return result;
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Category> {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.category.findUnique({ where: { id } });
      if (!target) throw new Error('Category not found');

      const width = target.rgt - target.lft + 1;
      const lft = target.lft;
      const rgt = target.rgt;

      // Delete target and descendants
      const deleted = await tx.category.deleteMany({
        where: {
          lft: { gte: lft },
          rgt: { lte: rgt },
        },
      });

      // Shift other nodes
      await tx.category.updateMany({
        where: { lft: { gt: rgt } },
        data: { lft: { decrement: width } },
      });
      await tx.category.updateMany({
        where: { rgt: { gt: rgt } },
        data: { rgt: { decrement: width } },
      });

      return target; // Return the target node info as it was deleted
    });
  }

  private async rebuildTree() {
    await this.prisma.$transaction(async (tx) => {
      const categories = await tx.category.findMany({
        orderBy: { orderIndex: 'asc' },
      });

      const build = async (parentId: string | null, left: number, depth: number): Promise<number> => {
        let right = left + 1;
        const children = categories.filter((c) => c.parentId === parentId);

        for (const child of children) {
          right = await build(child.id, right, depth + 1);
        }

        await tx.category.update({
          where: { id: parentId! }, // parentId is never null here for updates except root shift
          data: { lft: left, rgt: right, depth },
        });

        return right + 1;
      };

      // Root level categories
      const roots = categories.filter((c) => !c.parentId);
      let nextLeft = 1;
      for (const root of roots) {
        nextLeft = await build(root.id, nextLeft, 0);
      }
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });
  }

  async findAllFlat() {
    return this.prisma.category.findMany({
      orderBy: { lft: 'asc' },
    });
  }

  async findMany(where: Prisma.CategoryWhereInput) {
    return this.prisma.category.findMany({
      where,
      orderBy: { lft: 'asc' },
    });
  }

  async findSubTree(lft: number, rgt: number) {
    return this.prisma.category.findMany({
      where: {
        lft: { gte: lft },
        rgt: { lte: rgt },
      },
      orderBy: { lft: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.category.findMany({
      where: { status: true },
      orderBy: { lft: 'asc' },
    });
  }
}
