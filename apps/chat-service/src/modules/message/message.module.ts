import { Module } from "@nestjs/common";
import { MessageService } from "./message.service";
import { MessageController } from "./message.controller";
import { MessageRepository } from "./message.repository";
import { ParticipantModule } from "../participant/participant.module";

@Module({
  imports: [ParticipantModule],
  providers: [MessageService, MessageRepository],
  controllers: [MessageController],
  exports: [MessageService, MessageRepository],
})
export class MessageModule {}
