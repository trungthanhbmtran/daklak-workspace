import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { RabbitmqService } from '../../infra/rabbitmq/rabbitmq.service';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmqService: RabbitmqService
  ) {}

  async createConversation(data: { type: string; title?: string; participantIds: string[] }) {
    if (!data.type) {
      throw new RpcException('Loại hội thoại là bắt buộc (DIRECT, GROUP, TASK)');
    }

    try {
      const conversation = await this.prisma.conversation.create({
        data: {
          type: data.type,
          title: data.title,
          participants: {
            create: data.participantIds.map(userId => ({ userId, role: 'MEMBER' }))
          }
        },
        include: {
          participants: true
        }
      });
      
      this.rabbitmqService.publishEvent('conversation.created', {
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        participantIds: data.participantIds,
        createdAt: conversation.createdAt,
      });
      
      return conversation;
    } catch (e) {
      this.logger.error('Error creating conversation', e);
      throw new RpcException('Không thể tạo cuộc hội thoại');
    }
  }

  async getConversation(id: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id },
      include: { participants: true }
    });
    if (!conv) {
      throw new RpcException('Cuộc hội thoại không tồn tại');
    }
    return conv;
  }
}
