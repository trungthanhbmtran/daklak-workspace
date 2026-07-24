import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { RabbitmqService } from '../../infra/rabbitmq/rabbitmq.service';
import { ChatGateway } from '../gateway/chat.gateway';
import { MessageRepository } from './message.repository';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly rabbitmqService: RabbitmqService,
    private readonly chatGateway: ChatGateway
  ) {}

  async getMessages(conversationId: string, limit: number, offset: number): Promise<MessageResponseDto[]> {
    if (!conversationId) {
      throw new RpcException('conversationId là bắt buộc');
    }
    const messages = await this.messageRepository.findByConversationId(conversationId, limit, offset);
    return messages.map(msg => new MessageResponseDto({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      type: msg.type,
      content: msg.content,
      createdAt: msg.createdAt.toISOString()
    }));
  }

  async saveMessage(data: CreateMessageDto): Promise<MessageResponseDto> {
    try {
      const msg = await this.messageRepository.create(data);
      
      this.rabbitmqService.publishEvent('message.created', msg);
      this.chatGateway.broadcastMessage(msg.conversationId, msg);
      
      return new MessageResponseDto({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        type: msg.type,
        content: msg.content,
        createdAt: msg.createdAt.toISOString()
      });
    } catch (e) {
      this.logger.error('Error saving message', e);
      throw new RpcException('Không thể lưu tin nhắn');
    }
  }

  async markRead(messageId: string, userId: string) {
    try {
      await this.messageRepository.upsertReadReceipt(messageId, userId);
      return true;
    } catch (e) {
      this.logger.error('Error marking message read', e);
      return false;
    }
  }
}
