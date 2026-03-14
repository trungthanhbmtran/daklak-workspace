import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        // Nested set logic should be handled here or via Prisma middleware/hooks
        // For now, implementing basic creation
        return this.prisma.category.create({ data });
    }

    async findById(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { children: true, parent: true }
        });
        if (!category) throw new RpcException({ code: 5, message: 'Category not found' });
        return category;
    }

    async update(id: string, data: any) {
        return this.prisma.category.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        // Should also handle descendants if using nested set
        return this.prisma.category.delete({ where: { id } });
    }

    async getAllFlat() {
        return this.prisma.category.findMany({
            orderBy: { lft: 'asc' }
        });
    }

    async getFullTree() {
        const categories = await this.prisma.category.findMany({
            orderBy: { lft: 'asc' }
        });
        return this.buildTree(categories);
    }

    async getSubTree(id: string) {
        const root = await this.findById(id);
        const descendants = await this.prisma.category.findMany({
            where: {
                lft: { gte: root.lft },
                rgt: { lte: root.rgt }
            },
            orderBy: { lft: 'asc' }
        });
        return this.buildTree(descendants);
    }

    async getAllForPost() {
        return this.prisma.category.findMany({
            where: { status: true },
            orderBy: { lft: 'asc' }
        });
    }

    private buildTree(nodes: any[], parentId: string | null = null): any[] {
        return nodes
            .filter(node => node.parentId === parentId)
            .map(node => ({
                ...node,
                children: this.buildTree(nodes, node.id)
            }));
    }
}
