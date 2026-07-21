import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class InteractionsService implements OnModuleInit {
  private interactionGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.INTERACTION.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.interactionGrpcService = this.client.getService<any>(
      MICROSERVICES.INTERACTION.SERVICE,
    );
  }

  // --- Comments Moderation ---
  async listComments(query: any) {
    const response: any = await firstValueFrom(
      this.interactionGrpcService.listComments(query),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return {
      success: true,
      data: response.data,
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  async updateCommentStatus(id: string, status: string) {
    return firstValueFrom(
      this.interactionGrpcService.updateCommentStatus({ id, status }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async deleteComment(id: string) {
    return firstValueFrom(this.interactionGrpcService.deleteComment({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  // --- Citizen Questions (Hỏi đáp) ---
  async listQuestions(query: any) {
    const response: any = await firstValueFrom(
      this.interactionGrpcService.listQuestions(query),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return {
      success: true,
      data: response.data,
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  async answerQuestion(id: string, dto: any, req: any) {
    return firstValueFrom(
      this.interactionGrpcService.answerQuestion({
        id,
        ...dto,
        answeredById: req.user.id,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getQuestion(id: string) {
    return firstValueFrom(this.interactionGrpcService.getQuestion({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  // --- Citizen Feedback (Góp ý) ---
  async listFeedbacks(query: any) {
    const response: any = await firstValueFrom(
      this.interactionGrpcService.listFeedbacks(query),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    return {
      success: true,
      data: response.data,
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  async updateFeedbackStatus(id: string, status: string) {
    return firstValueFrom(
      this.interactionGrpcService.updateFeedbackStatus({ id, status }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
