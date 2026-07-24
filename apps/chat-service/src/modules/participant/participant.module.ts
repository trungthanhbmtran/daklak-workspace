import { Module } from '@nestjs/common';
import { ParticipantService } from './participant.service';

@Module({
  providers: [ParticipantService],
  exports: [ParticipantService]
})
export class ParticipantModule {}
