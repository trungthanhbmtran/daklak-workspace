import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class BannerService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        return this.prisma.banner.create({ data });
    }

    async findById(id: string) {
        const banner = await this.prisma.banner.findUnique({ where: { id } });
        if (!banner) throw new RpcException({ code: 5, message: 'Banner not found' });
        return banner;
    }

    async findAll(query: any) {
        const skip = ((query.page || 1) - 1) * (query.limit || 10);
        const take = query.limit || 10;

        const [items, total] = await Promise.all([
            this.prisma.banner.findMany({
                skip,
                take,
                orderBy: { orderIndex: 'asc' },
            }),
            this.prisma.banner.count(),
        ]);

        return {
            rows: items,
            count: total,
        };
    }

    async update(id: string, data: any) {
        return this.prisma.banner.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return this.prisma.banner.delete({ where: { id } });
    }
}
