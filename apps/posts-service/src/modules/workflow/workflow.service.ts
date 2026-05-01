import { Injectable, BadRequestException, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
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
export class WorkflowService implements OnModuleInit {
  private dynamicWorkflowService: any;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Inject('WORKFLOW_SERVICE') private client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.dynamicWorkflowService = this.client.getService<any>('WorkflowService');
  }

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
    if (!post) throw new BadRequestException('Post not found');

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

    // Trigger Dynamic Workflow on SUBMIT
    if (action === 'SUBMIT') {
      try {
        await firstValueFrom(this.dynamicWorkflowService.TriggerWorkflow({
          trigger: 'POST_SUBMIT',
          initialContext: { 
            postId, 
            title: updatedPost.title, 
            authorId: updatedPost.authorId,
            status: newStatus 
          },
          initiatorId: actorId,
        }));
      } catch (e) {
        // We don't want to block the post submission if the workflow service is down, 
        // but we should log it.
        console.error('Failed to trigger dynamic workflow:', e.message);
      }
    }

    return updatedPost;
  }
}
