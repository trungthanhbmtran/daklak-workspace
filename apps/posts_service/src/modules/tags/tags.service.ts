import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.tag.create({ data });
    }

    async findById(id: string) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) throw new RpcException({ code: 5, message: 'Tag not found' });
        return tag;
    }

    async findAll(query: any) {
        const skip = ((query.page || 1) - 1) * (query.limit || 10);
        const take = query.limit || 10;

        const [items, total] = await Promise.all([
            this.prisma.tag.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.tag.count(),
        ]);

        return {
            rows: items,
            count: total,
        };
    }

    async update(id: string, data: any) {
        return this.prisma.tag.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return this.prisma.tag.delete({ where: { id } });
    }
}
