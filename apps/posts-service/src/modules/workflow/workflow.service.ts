import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { AuditService } from '../audit/audit.service';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';

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
    @Inject(WORKFLOW_RMQ_CLIENT) private client: ClientProxy,
  ) { }

  // --- Atomic Business Actions ---

  async submit(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;

    const updatedPost = await this.updateStatus(postId, PostStatus.SUBMITTED);

    // Ghi log phê duyệt để theo dõi lịch sử
    await this.logModeration(postId, actorId, oldStatus, PostStatus.SUBMITTED, 'SUBMIT', note);
    await this.logAudit(postId, actorId, 'SUBMIT', { note });

    // Kích hoạt quy trình động (không làm nghẽn luồng chính nếu lỗi)
    this.triggerDynamicWorkflow(updatedPost, actorId);

    return updatedPost;
  }

  async review(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const updatedPost = await this.updateStatus(postId, PostStatus.UNDER_REVIEW);
    await this.logModeration(postId, actorId, oldStatus, PostStatus.UNDER_REVIEW, 'REVIEW', note);
    await this.logAudit(postId, actorId, 'REVIEW', { note });
    return updatedPost;
  }

  async approve(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const updatedPost = await this.updateStatus(postId, PostStatus.APPROVED);
    await this.logModeration(postId, actorId, oldStatus, PostStatus.APPROVED, 'APPROVE', note);
    await this.logAudit(postId, actorId, 'APPROVE', { note });
    return updatedPost;
  }

  async reject(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const updatedPost = await this.updateStatus(postId, PostStatus.REJECTED);
    await this.logModeration(postId, actorId, oldStatus, PostStatus.REJECTED, 'REJECT', note);
    await this.logAudit(postId, actorId, 'REJECT', { note });
    return updatedPost;
  }

  async publish(postId: string, actorId: string, note?: string) {
    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
    await this.logAudit(postId, actorId, 'PUBLISH', { note });
    return updatedPost;
  }

  async unpublish(postId: string, actorId: string, note?: string) {
    const updatedPost = await this.updateStatus(postId, PostStatus.UNPUBLISHED);
    await this.logAudit(postId, actorId, 'UNPUBLISH', { note });
    return updatedPost;
  }

  async archive(postId: string, actorId: string, note?: string) {
    const updatedPost = await this.updateStatus(postId, PostStatus.ARCHIVED);
    await this.logAudit(postId, actorId, 'ARCHIVE', { note });
    return updatedPost;
  }

  // --- Internal Helpers ---

  private async updateStatus(postId: string, status: PostStatus) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { status },
    });
  }

  private async logModeration(postId: string, reviewerId: string, oldStatus: string, newStatus: PostStatus, decision: string, note?: string) {
    return this.prisma.moderationLog.create({
      data: {
        postId,
        reviewerId,
        oldStatus,
        newStatus,
        decision,
        note,
      },
    });
  }

  private async logAudit(postId: string, actorId: string, action: string, metadata?: any) {
    return this.auditService.log({
      postId,
      actorId,
      action: `${action}_POST`,
      entityId: postId,
      metadata,
    });
  }

  private triggerDynamicWorkflow(post: any, actorId: string) {
    try {
      this.client.emit('workflow.instance.start_requested', {
        code: 'POST_SUBMIT',
        payload: {
          businessKey: post.id,
          organizationId: 'DEFAULT',
          startedBy: actorId,
          variables: {
            postId: post.id,
            title: post.title,
            authorId: post.authorId,
            status: post.status
          }
        }
      });
    } catch (e) {
      console.error('Failed to trigger dynamic workflow via RMQ:', e.message);
    }
  }
}

