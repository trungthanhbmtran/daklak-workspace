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
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { InteractionsService } from './interactions.service';

@Controller('admin/interactions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  // --- Comments Moderation ---
  @Get('comments')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async listComments(@Query() query: any) {
    return this.interactionsService.listComments(query);
  }

  @Put('comments/:id/status')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async updateCommentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interactionsService.updateCommentStatus(id, status);
  }

  @Delete('comments/:id')
  @Roles(Role.ADMIN)
  async deleteComment(@Param('id') id: string) {
    return this.interactionsService.deleteComment(id);
  }

  // --- Citizen Questions (Hỏi đáp) ---
  @Get('questions')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async listQuestions(@Query() query: any) {
    return this.interactionsService.listQuestions(query);
  }

  @Post('questions/:id/answer')
  @Roles(Role.ADMIN, Role.REVIEWER)
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
  @Roles(Role.ADMIN, Role.REVIEWER)
  async listFeedbacks(@Query() query: any) {
    return this.interactionsService.listFeedbacks(query);
  }

  @Put('feedbacks/:id/status')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async updateFeedbackStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.interactionsService.updateFeedbackStatus(id, status);
  }
}
