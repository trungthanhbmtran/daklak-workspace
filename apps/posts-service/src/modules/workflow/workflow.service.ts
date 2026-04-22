import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { AuditService } from '../audit/audit.service';

export enum PostStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REJECTED = 'REJECTED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async canTransition(postId: string, action: string, actorRole: string): Promise<boolean> {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');

    const status = post.status as PostStatus;

    // Transition Rules
    switch (action) {
      case 'SUBMIT':
        return [PostStatus.DRAFT, PostStatus.REJECTED].includes(status);
      case 'REVIEW':
        return status === PostStatus.SUBMITTED;
      case 'APPROVE':
      case 'REJECT':
        return status === PostStatus.UNDER_REVIEW;
      case 'PUBLISH':
        return [PostStatus.APPROVED, PostStatus.UNPUBLISHED].includes(status);
      case 'UNPUBLISH':
        return status === PostStatus.PUBLISHED;
      case 'ARCHIVE':
        return status !== PostStatus.ARCHIVED;
      default:
        return false;
    }
  }

  async transition(postId: string, action: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    const oldStatus = post.status;
    let newStatus: PostStatus;

    switch (action) {
      case 'SUBMIT':
        newStatus = PostStatus.SUBMITTED;
        break;
      case 'REVIEW':
        newStatus = PostStatus.UNDER_REVIEW;
        break;
      case 'APPROVE':
        newStatus = PostStatus.APPROVED;
        break;
      case 'REJECT':
        newStatus = PostStatus.REJECTED;
        break;
      case 'PUBLISH':
        newStatus = PostStatus.PUBLISHED;
        break;
      case 'UNPUBLISH':
        newStatus = PostStatus.UNPUBLISHED;
        break;
      case 'ARCHIVE':
        newStatus = PostStatus.ARCHIVED;
        break;
      default:
        throw new BadRequestException('Invalid workflow action');
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: newStatus,
        publishedAt: action === 'PUBLISH' ? new Date() : undefined,
      },
    });

    // Log Moderation if it's an approval/rejection
    if (['APPROVE', 'REJECT', 'REVIEW'].includes(action)) {
      await this.prisma.moderationLog.create({
        data: {
          postId,
          reviewerId: actorId,
          oldStatus,
          newStatus,
          decision: action,
          note,
        },
      });
    }

    // Log Audit
    await this.auditService.log({
      postId,
      actorId,
      action: `${action}_POST`,
      entityId: postId,
      metadata: { oldStatus, newStatus, note },
    });

    return updatedPost;
  }
}
