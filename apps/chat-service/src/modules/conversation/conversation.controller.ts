import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @GrpcMethod('ChatService', 'CreateConversation')
  async createConversation(data: CreateConversationDto): Promise<ConversationResponseDto> {
    return await this.conversationService.createConversation({
      type: data.type,
      title: data.title,
      participantIds: data.participantIds || []
    });
  }

  @GrpcMethod('ChatService', 'GetConversation')
  async getConversation(data: { id: string }): Promise<ConversationResponseDto> {
    return await this.conversationService.getConversation(data.id);
  }
}
