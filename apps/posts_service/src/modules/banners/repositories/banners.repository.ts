import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Banner, Prisma, BannerPosition } from '@generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';

@Injectable()
export class BannersRepository extends BaseRepository<
  Banner,
  CreateBannerDto,
  UpdateBannerDto,
  unknown
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.banner);
  }

  protected prepareQuery(query: any): {
    skip?: number;
    take?: number;
    where?: Prisma.BannerWhereInput;
    orderBy?: Prisma.BannerOrderByWithRelationInput;
  } {
    return {
      where: (query as { where?: Prisma.BannerWhereInput }).where,
      orderBy: (query as { orderBy?: Prisma.BannerOrderByWithRelationInput })
        .orderBy || { orderIndex: 'asc' },
    };
  }

  async findActiveByPosition(position?: string) {
    return this.prisma.banner.findMany({
      where: {
        status: true,
        position: (position as BannerPosition) || undefined,
      },
      orderBy: { orderIndex: 'asc' },
    });
  }
}
