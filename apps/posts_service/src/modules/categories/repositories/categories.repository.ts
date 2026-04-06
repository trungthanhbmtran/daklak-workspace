import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Category, Prisma } from '@generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesRepository extends BaseRepository<Category, CreateCategoryDto, UpdateCategoryDto, any> {
    constructor(prisma: PrismaService) {
        super(prisma, prisma.category);
    }

    protected prepareQuery(query: any): { skip?: number; take?: number; where?: Prisma.CategoryWhereInput; orderBy?: Prisma.CategoryOrderByWithRelationInput } {
        return {
            where: query.where,
            orderBy: query.orderBy || { lft: 'asc' },
        };
    }

    async findById(id: string): Promise<Category | null> {
        return this.prisma.category.findUnique({
            where: { id },
            include: { children: true, parent: true }
        });
    }

    async findAllFlat() {
        return this.prisma.category.findMany({
            orderBy: { lft: 'asc' }
        });
    }

    async findMany(where: Prisma.CategoryWhereInput) {
        return this.prisma.category.findMany({
            where,
            orderBy: { lft: 'asc' }
        });
    }

    async findSubTree(lft: number, rgt: number) {
        return this.prisma.category.findMany({
            where: {
                lft: { gte: lft },
                rgt: { lte: rgt }
            },
            orderBy: { lft: 'asc' }
        });
    }

    async findActive() {
        return this.prisma.category.findMany({
            where: { status: true },
            orderBy: { lft: 'asc' }
        });
    }
}
