import {
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class InteractionsService implements OnModuleInit {
  private readonly logger = new Logger(InteractionsService.name);
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
  async listComments(query: any, metadata?: any) {
    const response: any = await firstValueFrom(
      this.interactionGrpcService.listComments(query, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
    return {
      data: response.data,
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  async updateCommentStatus(id: string, status: string, metadata?: any) {
    return firstValueFrom(
      this.interactionGrpcService.updateCommentStatus({ id, status }, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  async deleteComment(id: string, metadata?: any) {
    return firstValueFrom(
      this.interactionGrpcService.deleteComment({ id }, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  // --- Citizen Questions (Hỏi đáp) ---
  async listQuestions(query: any, metadata?: any) {
    const response: any = await firstValueFrom(
      this.interactionGrpcService.listQuestions(query, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
    return {
      data: response.data,
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  async answerQuestion(id: string, dto: any, req: any, metadata?: any) {
    return firstValueFrom(
      this.interactionGrpcService.answerQuestion(
        {
          id,
          ...dto,
          answeredById: req.user.id,
        },
        metadata,
      ),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  async getQuestion(id: string, metadata?: any) {
    return firstValueFrom(
      this.interactionGrpcService.getQuestion({ id }, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  // --- Citizen Feedback (Góp ý) ---
  async listFeedbacks(query: any, metadata?: any) {
    const response: any = await firstValueFrom(
      this.interactionGrpcService.listFeedbacks(query, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
    return {
      data: response.data,
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  async updateFeedbackStatus(id: string, status: string, metadata?: any) {
    return firstValueFrom(
      this.interactionGrpcService.updateFeedbackStatus(
        { id, status },
        metadata,
      ),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }
}
