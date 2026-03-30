import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Banner, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';

@Injectable()
export class BannersRepository extends BaseRepository<Banner, CreateBannerDto, UpdateBannerDto, any> {
    constructor(prisma: PrismaService) {
        super(prisma, prisma.banner);
    }

    protected prepareQuery(query: any): { skip?: number; take?: number; where?: Prisma.BannerWhereInput; orderBy?: Prisma.BannerOrderByWithRelationInput } {
        return {
            where: query.where,
            orderBy: query.orderBy || { orderIndex: 'asc' },
        };
    }

    async findActiveByPosition(position?: string) {
        return this.prisma.banner.findMany({
            where: {
                status: true,
                position: position as any || undefined,
            },
            orderBy: { orderIndex: 'asc' }
        });
    }
}
