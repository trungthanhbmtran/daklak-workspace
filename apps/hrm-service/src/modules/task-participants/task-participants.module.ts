import { Module } from '@nestjs/common';
import { TaskParticipantsController } from './task-participants.controller';
import { TaskParticipantsService } from './task-participants.service';

@Module({
  controllers: [TaskParticipantsController],
  providers: [TaskParticipantsService],
})
export class TaskParticipantsModule {}
