import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConversationService } from './conversation.service';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @GrpcMethod('ChatService', 'CreateConversation')
  async createConversation(data: any) {
    const conv = await this.conversationService.createConversation({
      type: data.type,
      title: data.title,
      participantIds: data.participantIds || []
    });
    
    return {
      id: conv.id,
      type: conv.type,
      title: conv.title,
      createdAt: conv.createdAt.toISOString()
    };
  }

  @GrpcMethod('ChatService', 'GetConversation')
  async getConversation(data: any) {
    const conv = await this.conversationService.getConversation(data.id);
    
    return {
      id: conv.id,
      type: conv.type,
      title: conv.title,
      createdAt: conv.createdAt.toISOString()
    };
  }
}
