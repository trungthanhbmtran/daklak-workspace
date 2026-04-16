import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../database/repositories/base.repository';
import { PostTranslate, Prisma } from '@generated/prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTranslationDto } from '../dto/create-translation.dto';
import { UpdateTranslationDto } from '../dto/update-translation.dto';

@Injectable()
export class TranslationsRepository extends BaseRepository<
  PostTranslate,
  CreateTranslationDto,
  UpdateTranslationDto,
  unknown
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.postTranslate);
  }

  protected prepareQuery(query: {
    where?: Prisma.PostTranslateWhereInput;
    orderBy?: Prisma.PostTranslateOrderByWithRelationInput;
  }): {
    skip?: number;
    take?: number;
    where?: Prisma.PostTranslateWhereInput;
    orderBy?: Prisma.PostTranslateOrderByWithRelationInput;
  } {
    return {
      where: (query as { where?: Prisma.PostTranslateWhereInput }).where,
      orderBy: (
        query as { orderBy?: Prisma.PostTranslateOrderByWithRelationInput }
      ).orderBy || { createdAt: 'desc' },
    };
  }

  async findByPostId(postId: string) {
    return this.prisma.postTranslate.findMany({
      where: { postId },
      orderBy: { language: 'asc' },
    });
  }

  async findByPostAndLang(postId: string, language: string) {
    return this.prisma.postTranslate.findUnique({
      where: {
        postId_language: { postId, language },
      },
    });
  }

  async upsert(data: CreateTranslationDto) {
    return this.prisma.postTranslate.upsert({
      where: {
        postId_language: { postId: data.postId, language: data.language },
      },
      create: {
        postId: data.postId,
        language: data.language,
        title: data.title,
        description: data.description || '',
        contentJson: (data.contentJson as Prisma.InputJsonValue) || {},
        status: data.status,
      },
      update: {
        title: data.title,
        description: data.description || '',
        contentJson: (data.contentJson as Prisma.InputJsonValue) || {},
        status: data.status,
      },
    });
  }
}
