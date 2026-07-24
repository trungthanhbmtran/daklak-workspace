import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { RabbitmqService } from '../../infra/rabbitmq/rabbitmq.service';
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly chatGateway: ChatGateway
  ) {}

  async getMessages(conversationId: string, limit: number, offset: number) {
    if (!conversationId) {
      throw new RpcException('conversationId là bắt buộc');
    }
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit > 0 ? limit : 20,
      skip: offset > 0 ? offset : 0,
    });
    return messages;
  }

  async saveMessage(data: { conversationId: string; senderId: string; type: string; content: string }) {
    try {
      const msg = await this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          type: data.type || 'TEXT',
          content: data.content,
        }
      });
      
      this.rabbitmqService.publishEvent('message.created', msg);
      this.chatGateway.broadcastMessage(msg.conversationId, msg);
      
      return msg;
    } catch (e) {
      this.logger.error('Error saving message', e);
      throw new RpcException('Không thể lưu tin nhắn');
    }
  }

  async markRead(messageId: string, userId: string) {
    try {
      await this.prisma.readReceipt.upsert({
        where: { messageId_userId: { messageId, userId } },
        update: { readAt: new Date() },
        create: { messageId, userId }
      });
      return true;
    } catch (e) {
      this.logger.error('Error marking message read', e);
      return false;
    }
  }
}
