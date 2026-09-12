import { Module } from '@nestjs/common';
import { AiAssistantService } from './ai-assistant.service';
import { AiAssistantController } from './ai-assistant.controller';
import { PrismaService } from '@/database/prisma.service';

@Module({
  controllers: [AiAssistantController],
  providers: [AiAssistantService, PrismaService],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
