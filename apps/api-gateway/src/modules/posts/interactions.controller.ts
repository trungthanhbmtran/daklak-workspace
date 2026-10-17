import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { InteractionsService } from './interactions.service';

@Controller('admin/interactions')
@UseGuards(JwtAuthGuard, PbacGuard)
export class InteractionsController {
  constructor(
    private readonly interactionsService: InteractionsService,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  // --- Comments Moderation ---
  @Get('comments')
  @RequirePolicy('manage', 'portal_interactions')
  async listComments(@Req() req: any, @Query() query: any) {
    return this.interactionsService.listComments(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Put('comments/:id/status')
  @RequirePolicy('manage', 'portal_interactions')
  async updateCommentStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interactionsService.updateCommentStatus(
      id,
      status,
      this.getGrpcMetadata(req),
    );
  }

  @Delete('comments/:id')
  @RequirePolicy('manage', 'portal_interactions')
  async deleteComment(@Req() req: any, @Param('id') id: string) {
    return this.interactionsService.deleteComment(id, this.getGrpcMetadata(req));
  }

  // --- Citizen Questions (Hỏi đáp) ---
  @Get('questions')
  @RequirePolicy('manage', 'portal_interactions')
  async listQuestions(@Req() req: any, @Query() query: any) {
    return this.interactionsService.listQuestions(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Post('questions/:id/answer')
  @RequirePolicy('manage', 'portal_interactions')
  async answerQuestion(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.interactionsService.answerQuestion(
      id,
      dto,
      req,
      this.getGrpcMetadata(req),
    );
  }

  @Get('questions/:id')
  async getQuestion(@Req() req: any, @Param('id') id: string) {
    return this.interactionsService.getQuestion(id, this.getGrpcMetadata(req));
  }

  // --- Citizen Feedback (Góp ý) ---
  @Get('feedbacks')
  @RequirePolicy('manage', 'portal_interactions')
  async listFeedbacks(@Req() req: any, @Query() query: any) {
    return this.interactionsService.listFeedbacks(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Put('feedbacks/:id/status')
  @RequirePolicy('manage', 'portal_interactions')
  async updateFeedbackStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interactionsService.updateFeedbackStatus(
      id,
      status,
      this.getGrpcMetadata(req),
    );
  }
}
