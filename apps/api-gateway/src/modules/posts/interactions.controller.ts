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
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';
import { InteractionsService } from './interactions.service';

@Controller('admin/interactions')
@UseGuards(JwtAuthGuard, PbacGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  // --- Comments Moderation ---
  @Get('comments')
  @RequirePolicy('manage', 'portal_interactions')
  async listComments(@Query() query: any) {
    return this.interactionsService.listComments(query);
  }

  @Put('comments/:id/status')
  @RequirePolicy('manage', 'portal_interactions')
  async updateCommentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interactionsService.updateCommentStatus(id, status);
  }

  @Delete('comments/:id')
  @RequirePolicy('manage', 'portal_interactions')
  async deleteComment(@Param('id') id: string) {
    return this.interactionsService.deleteComment(id);
  }

  // --- Citizen Questions (Hỏi đáp) ---
  @Get('questions')
  @RequirePolicy('manage', 'portal_interactions')
  async listQuestions(@Query() query: any) {
    return this.interactionsService.listQuestions(query);
  }

  @Post('questions/:id/answer')
  @RequirePolicy('manage', 'portal_interactions')
  async answerQuestion(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.interactionsService.answerQuestion(id, dto, req);
  }

  @Get('questions/:id')
  async getQuestion(@Param('id') id: string) {
    return this.interactionsService.getQuestion(id);
  }

  // --- Citizen Feedback (Góp ý) ---
  @Get('feedbacks')
  @RequirePolicy('manage', 'portal_interactions')
  async listFeedbacks(@Query() query: any) {
    return this.interactionsService.listFeedbacks(query);
  }

  @Put('feedbacks/:id/status')
  @RequirePolicy('manage', 'portal_interactions')
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interactionsService.updateFeedbackStatus(id, status);
  }
}
