import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { Tag, Prisma } from '@generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class TagsRepository extends BaseRepository<
  Tag,
  CreateTagDto,
  UpdateTagDto,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.tag);
  }

  protected prepareQuery(query: any): {
    skip?: number;
    take?: number;
    where?: Prisma.TagWhereInput;
    orderBy?: Prisma.TagOrderByWithRelationInput;
  } {
    return {
      where: query.where,
      orderBy: query.orderBy || { createdAt: 'desc' },
    };
  }

  async findMany(where: Prisma.TagWhereInput) {
    return this.prisma.tag.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.findMany({ status: 'active' });
  }
}
