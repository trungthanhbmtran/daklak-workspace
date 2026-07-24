import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ConversationRepository } from './conversation.repository';

@Module({
  providers: [ConversationService, ConversationRepository],
  controllers: [ConversationController],
  exports: [ConversationService, ConversationRepository]
})
export class ConversationModule {}
