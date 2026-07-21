import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TranslateService } from './translate.service';

@Controller('admin/translate')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  @Post()
  async translate(@Body() body: { text: string; targetLang: string }) {
    return this.translateService.translate(body.text, body.targetLang);
  }

  @Post('sync')
  async translateSync(@Body() body: { text: string; targetLang: string }) {
    return this.translateService.translateSyncDirect(body.text, body.targetLang);
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.translateService.getJobStatus(jobId);
  }

  @EventPattern('translate_task')
  async handleTranslateTask(data: {
    jobId: string;
    text: string;
    targetLang: string;
  }) {
    return this.translateService.handleTranslateTask(data);
  }
}
