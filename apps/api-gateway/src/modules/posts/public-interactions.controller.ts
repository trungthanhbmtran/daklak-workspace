import { Controller, Get, Post, Body, Inject, Query, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public Interactions')
@Controller('public/interactions')
export class PublicInteractionsController implements OnModuleInit {
  private interactionService: any;

  constructor(@Inject(MICROSERVICES.INTERACTION.SYMBOL) private client: ClientGrpc) { }

  onModuleInit() {
    this.interactionService = this.client.getService<any>(MICROSERVICES.INTERACTION.SERVICE);
  }

  @Get('questions')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi đã được trả lời và công khai' })
  async listQuestions(@Query() query: any) {
    const req = {
      ...query,
      onlyPublic: true,
      status: 'ANSWERED',
    };
    if (req.page) req.page = parseInt(req.page);
    if (req.limit) req.limit = parseInt(req.limit);

    const response: any = await firstValueFrom(this.interactionService.listQuestions(req));
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

  @Post('questions')
  @ApiOperation({ summary: 'Gửi câu hỏi của công dân' })
  async createQuestion(@Body() dto: any) {
    const res = await firstValueFrom(this.interactionService.createQuestion(dto));
    return {
      success: true,
      data: res,
    };
  }
}
