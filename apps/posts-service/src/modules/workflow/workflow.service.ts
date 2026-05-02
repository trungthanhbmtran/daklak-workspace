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

  // --- Atomic Business Actions ---

  async submit(postId: string, actorId: string, note?: string) {
    const post = await this.updateStatus(postId, PostStatus.SUBMITTED);
    await this.logAudit(postId, actorId, 'SUBMIT', { note });
    await this.triggerDynamicWorkflow(post, actorId);
    return post;
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

  private async triggerDynamicWorkflow(post: any, actorId: string) {
    try {
      await firstValueFrom(this.dynamicWorkflowService.TriggerWorkflow({
        trigger: 'POST_SUBMIT',
        initialContext: {
          postId: post.id,
          title: post.title,
          authorId: post.authorId,
          status: post.status
        },
        initiatorId: actorId,
      }));
    } catch (e) {
      console.error('Failed to trigger dynamic workflow:', e.message);
    }
  }
}
