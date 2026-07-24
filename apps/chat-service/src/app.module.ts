import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InfraModule } from './infra/infra.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { ParticipantModule } from './modules/participant/participant.module';
import { PresenceModule } from './modules/presence/presence.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    InfraModule,
    ConversationModule,
    MessageModule,
    ParticipantModule,
    PresenceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
