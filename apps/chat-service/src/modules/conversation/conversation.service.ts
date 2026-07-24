import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RabbitmqService } from '../../infra/rabbitmq/rabbitmq.service';
import { ConversationRepository } from './conversation.repository';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly rabbitmqService: RabbitmqService
  ) {}

  async createConversation(data: CreateConversationDto): Promise<ConversationResponseDto> {
    if (!data.type) {
      throw new RpcException('Loại hội thoại là bắt buộc (DIRECT, GROUP, TASK)');
    }

    try {
      const conversation = await this.conversationRepository.create(data);
      
      this.rabbitmqService.publishEvent('conversation.created', {
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        participantIds: data.participantIds,
        createdAt: conversation.createdAt,
      });

      return new ConversationResponseDto({
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString()
      });
    } catch (e) {
      this.logger.error('Error creating conversation', e);
      throw new RpcException('Không thể tạo cuộc hội thoại');
    }
  }

  async getConversation(id: string): Promise<ConversationResponseDto> {
    const conv = await this.conversationRepository.findById(id);
    if (!conv) {
      throw new RpcException('Cuộc hội thoại không tồn tại');
    }
    return new ConversationResponseDto({
      id: conv.id,
      type: conv.type,
      title: conv.title,
      createdAt: conv.createdAt.toISOString()
    });
  }
}
