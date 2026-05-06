import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Inject,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@Controller('admin/interactions')
@UseGuards(JwtAuthGuard, RbacGuard)
export class InteractionsController {
  private interactionService: any;

  constructor(@Inject(MICROSERVICES.INTERACTION.SYMBOL) private client: ClientGrpc) { }

  onModuleInit() {
    this.interactionService = this.client.getService<any>(MICROSERVICES.INTERACTION.SERVICE);
  }

  // --- Comments Moderation ---
  @Get('comments')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async listComments(@Query() query: any) {
    const response: any = await firstValueFrom(this.interactionService.listComments(query));
    return {
      success: true,
      data: response.data || [],
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  @Put('comments/:id/status')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async updateCommentStatus(@Param('id') id: string, @Body('status') status: string) {
    return firstValueFrom(this.interactionService.updateCommentStatus({ id, status }));
  }

  @Delete('comments/:id')
  @Roles(Role.ADMIN)
  async deleteComment(@Param('id') id: string) {
    return firstValueFrom(this.interactionService.deleteComment({ id }));
  }

  // --- Citizen Questions (Hỏi đáp) ---
  @Get('questions')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async listQuestions(@Query() query: any) {
    const response: any = await firstValueFrom(this.interactionService.listQuestions(query));
    return {
      success: true,
      data: response.data || [],
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  @Post('questions/:id/answer')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async answerQuestion(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return firstValueFrom(this.interactionService.answerQuestion({
      id,
      ...dto,
      answeredById: req.user.id
    }));
  }

  @Get('questions/:id')
  async getQuestion(@Param('id') id: string) {
    return firstValueFrom(this.interactionService.getQuestion({ id }));
  }

  // --- Citizen Feedback (Góp ý) ---
  @Get('feedbacks')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async listFeedbacks(@Query() query: any) {
    const response: any = await firstValueFrom(this.interactionService.listFeedbacks(query));
    return {
      success: true,
      data: response.data || [],
      meta: {
        total: response.meta?.pagination?.total || 0,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      },
    };
  }

  @Put('feedbacks/:id/status')
  @Roles(Role.ADMIN, Role.REVIEWER)
  async updateFeedbackStatus(@Param('id') id: string, @Body('status') status: string) {
    return firstValueFrom(this.interactionService.updateFeedbackStatus({ id, status }));
  }
}
