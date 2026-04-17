import { Post as PrismaPost, PostStatus as PrismaPostStatus } from '@generated/prisma/client';
import { Post, DomainPostStatus } from '../domain/post.entity';
import { PostResponseDto } from '../dto/post-response.dto';

export class PostMapper {
  static toDomain(prismaPost: any): Post | null {
    if (!prismaPost) return null;

    return new Post({
      id: prismaPost.id,
      title: prismaPost.title,
      content: prismaPost.content || undefined,
      contentJson: prismaPost.contentJson || undefined,
      description: prismaPost.description || undefined,
      slug: prismaPost.slug,
      authorId: prismaPost.authorId,
      categoryId: prismaPost.categoryId || undefined,
      status: this.mapPrismaStatusToDomain(prismaPost.status),
      thumbnail: prismaPost.thumbnail || undefined,
      isFeatured: prismaPost.isFeatured,
      isNotification: prismaPost.isNotification,
      language: prismaPost.language || undefined,
      autoModerationStatus: prismaPost.autoModerationStatus || undefined,
      autoModerationNote: prismaPost.autoModerationNote || undefined,
      moderationNote: prismaPost.moderationNote || undefined,
      reviewerId: prismaPost.reviewerId || undefined,
      publishedAt: prismaPost.publishedAt || undefined,
      createdAt: prismaPost.createdAt,
      updatedAt: prismaPost.updatedAt,
      tags: prismaPost.tags,
      category: prismaPost.category,
    });
  }

  static toPersistence(domainPost: Post): any {
    const props = domainPost.props_copy;
    return {
      title: props.title,
      content: props.content,
      contentJson: props.contentJson,
      description: props.description,
      slug: props.slug,
      authorId: props.authorId,
      categoryId: props.categoryId,
      status: this.mapDomainStatusToPrisma(props.status),
      thumbnail: props.thumbnail,
      isFeatured: props.isFeatured,
      isNotification: props.isNotification,
      language: props.language,
      autoModerationStatus: props.autoModerationStatus,
      autoModerationNote: props.autoModerationNote,
      moderationNote: props.moderationNote,
      reviewerId: props.reviewerId,
      publishedAt: props.publishedAt,
    };
  }

  static toResponse(domainPost: Post): PostResponseDto {
    const props = domainPost.props_copy;
    return {
      ...props,
      publishedAt: props.publishedAt?.toISOString(),
      createdAt: props.createdAt.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
    };
  }

  private static mapPrismaStatusToDomain(status: PrismaPostStatus): DomainPostStatus {
    switch (status) {
      case PrismaPostStatus.draft: return DomainPostStatus.draft;
      case PrismaPostStatus.pending: return DomainPostStatus.pending;
      case PrismaPostStatus.approved: return DomainPostStatus.approved;
      case PrismaPostStatus.rejected: return DomainPostStatus.rejected;
      case PrismaPostStatus.published: return DomainPostStatus.published;
      case PrismaPostStatus.editing: return DomainPostStatus.editing;
      default: return DomainPostStatus.draft;
    }
  }

  private static mapDomainStatusToPrisma(status: DomainPostStatus): PrismaPostStatus {
    switch (status) {
      case DomainPostStatus.draft: return PrismaPostStatus.draft;
      case DomainPostStatus.pending: return PrismaPostStatus.pending;
      case DomainPostStatus.approved: return PrismaPostStatus.approved;
      case DomainPostStatus.rejected: return PrismaPostStatus.rejected;
      case DomainPostStatus.published: return PrismaPostStatus.published;
      case DomainPostStatus.editing: return PrismaPostStatus.editing;
      default: return PrismaPostStatus.draft;
    }
  }
}
