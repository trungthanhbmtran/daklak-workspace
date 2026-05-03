import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InteractionsService } from './interactions.service';

@Controller()
export class InteractionsController {
  constructor(private readonly service: InteractionsService) {}

  // --- Comments ---
  @GrpcMethod('InteractionService', 'CreateComment')
  async createComment(data: any) {
    const result = await this.service.createComment(data);
    return this.mapComment(result);
  }

  @GrpcMethod('InteractionService', 'ListComments')
  async listComments(query: any) {
    const { items, total } = await this.service.listComments(query);
    return {
      data: items.map(i => this.mapComment(i)),
      meta: { total, page: query.page || 1, limit: query.limit || 10 }
    };
  }

  @GrpcMethod('InteractionService', 'UpdateCommentStatus')
  async updateCommentStatus(data: { id: string, status: string }) {
    const result = await this.service.updateCommentStatus(data.id, data.status);
    return this.mapComment(result);
  }

  @GrpcMethod('InteractionService', 'DeleteComment')
  async deleteComment(data: { id: string }) {
    return this.service.deleteComment(data.id);
  }

  // --- Questions ---
  @GrpcMethod('InteractionService', 'CreateQuestion')
  async createQuestion(data: any) {
    const result = await this.service.createQuestion(data);
    return this.mapQuestion(result);
  }

  @GrpcMethod('InteractionService', 'ListQuestions')
  async listQuestions(query: any) {
    const { items, total } = await this.service.listQuestions(query);
    return {
      data: items.map(i => this.mapQuestion(i)),
      meta: { total, page: query.page || 1, limit: query.limit || 10 }
    };
  }

  @GrpcMethod('InteractionService', 'AnswerQuestion')
  async answerQuestion(data: any) {
    const result = await this.service.answerQuestion(data);
    return this.mapQuestion(result);
  }

  @GrpcMethod('InteractionService', 'GetQuestion')
  async getQuestion(data: { id: string }) {
    const result = await this.service.getQuestion(data.id);
    return this.mapQuestion(result);
  }

  // --- Feedback ---
  @GrpcMethod('InteractionService', 'CreateFeedback')
  async createFeedback(data: any) {
    const result = await this.service.createFeedback(data);
    return this.mapFeedback(result);
  }

  @GrpcMethod('InteractionService', 'ListFeedbacks')
  async listFeedbacks(query: any) {
    const { items, total } = await this.service.listFeedbacks(query);
    return {
      data: items.map(i => this.mapFeedback(i)),
      meta: { total, page: query.page || 1, limit: query.limit || 10 }
    };
  }

  @GrpcMethod('InteractionService', 'UpdateFeedbackStatus')
  async updateFeedbackStatus(data: { id: string, status: string }) {
    const result = await this.service.updateFeedbackStatus(data.id, data.status);
    return this.mapFeedback(result);
  }

  private mapComment(c: any) {
    return {
      ...c,
      createdAt: c.createdAt?.toISOString(),
      updatedAt: c.updatedAt?.toISOString(),
      replies: c.replies?.map((r: any) => this.mapComment(r)) || [],
    };
  }

  private mapQuestion(q: any) {
    return {
      ...q,
      answeredAt: q.answeredAt?.toISOString(),
      createdAt: q.createdAt?.toISOString(),
      updatedAt: q.updatedAt?.toISOString(),
    };
  }

  private mapFeedback(f: any) {
    return {
      ...f,
      createdAt: f.createdAt?.toISOString(),
      updatedAt: f.updatedAt?.toISOString(),
    };
  }
}
