import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('AI Service')
@Controller('admin/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  async generateText(@Body() body: { prompt: string }) {
    if (!body.prompt) {
      return { status: 'error', message: 'Prompt is required' };
    }

    try {
      const result = await this.aiService.generateText(body.prompt);
      return { status: 'success', data: result };
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }
}
