import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';

@Module({
  providers: [MessageService, MessageRepository],
  controllers: [MessageController],
  exports: [MessageService, MessageRepository]
})
export class MessageModule {}
