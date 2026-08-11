import { Injectable, BadRequestException, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientGrpc } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { firstValueFrom } from 'rxjs';

export const WORKFLOW_RMQ_CLIENT = 'WORKFLOW_RMQ_CLIENT';
export const WORKFLOW_PACKAGE = 'WORKFLOW_PACKAGE';

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
  private workflowService: any;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    @Inject(WORKFLOW_RMQ_CLIENT) private client: ClientProxy,
    @Inject(WORKFLOW_PACKAGE) private grpcClient: ClientGrpc,
  ) { }

  onModuleInit() {
    this.workflowService = this.grpcClient.getService<any>('WorkflowService');
  }

  // --- Helper to validate action via Workflow-Service ---
  private async validateTransition(postId: string, actorId: string, actionName: string, currentStatus: string): Promise<string> {
    // Determine workflow configuration
    const workflowId = 'POST_WORKFLOW_ID'; // Hardcode or resolve via config
    const currentNodeId = currentStatus; // Using status as nodeId for simplicity

    const validateRes = await firstValueFrom<any>(
      this.workflowService.ValidateAction({
        workflowId,
        currentNodeId,
        actionName,
        userId: actorId,
      })
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });

    if (!validateRes || !validateRes.allowed) {
      throw new BadRequestException(validateRes?.reason || `Action ${actionName} is not allowed from status ${currentStatus}`);
    }

    const nextNodeRes = await firstValueFrom<any>(
      this.workflowService.GetNextNode({
        workflowId,
        currentNodeId,
        actionName,
      })
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });

    if (!nextNodeRes || !nextNodeRes.nextNodeId) {
      throw new BadRequestException(`Could not determine next state for action ${actionName}`);
    }

    // In a real system we might parse nextNodeData, but for posts we map nodeId to PostStatus
    return nextNodeRes.nextNodeId as string;
  }

  // --- Atomic Business Actions ---

  async submit(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'SUBMIT', oldStatus);

    const updatedPost = await this.updateStatus(postId, nextStatus as PostStatus);
    await this.logModeration(postId, actorId, oldStatus, nextStatus as PostStatus, 'SUBMIT', note);
    await this.logAudit(postId, actorId, 'SUBMIT', { note });
    this.triggerDynamicWorkflow(updatedPost, actorId);
    return updatedPost;
  }

  async review(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'REVIEW', oldStatus);

    const updatedPost = await this.updateStatus(postId, nextStatus as PostStatus);
    await this.logModeration(postId, actorId, oldStatus, nextStatus as PostStatus, 'REVIEW', note);
    await this.logAudit(postId, actorId, 'REVIEW', { note });
    return updatedPost;
  }

  async approve(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'APPROVE', oldStatus);

    const updatedPost = await this.updateStatus(postId, nextStatus as PostStatus);
    await this.logModeration(postId, actorId, oldStatus, nextStatus as PostStatus, 'APPROVE', note);
    await this.logAudit(postId, actorId, 'APPROVE', { note });
    return updatedPost;
  }

  async reject(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'REJECT', oldStatus);

    const updatedPost = await this.updateStatus(postId, nextStatus as PostStatus);
    await this.logModeration(postId, actorId, oldStatus, nextStatus as PostStatus, 'REJECT', note);
    await this.logAudit(postId, actorId, 'REJECT', { note });
    return updatedPost;
  }

  async publish(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'PUBLISH', oldStatus);

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        status: nextStatus as PostStatus,
        publishedAt: new Date(),
      },
    });
    await this.logAudit(postId, actorId, 'PUBLISH', { note });
    return updatedPost;
  }

  async unpublish(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'UNPUBLISH', oldStatus);

    const updatedPost = await this.updateStatus(postId, nextStatus as PostStatus);
    await this.logAudit(postId, actorId, 'UNPUBLISH', { note });
    return updatedPost;
  }

  async archive(postId: string, actorId: string, note?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new BadRequestException('Post not found');
    const oldStatus = post.status;
    const nextStatus = await this.validateTransition(postId, actorId, 'ARCHIVE', oldStatus);

    const updatedPost = await this.updateStatus(postId, nextStatus as PostStatus);
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

