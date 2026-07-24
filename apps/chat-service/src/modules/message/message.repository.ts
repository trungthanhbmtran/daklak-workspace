import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger(MessageRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMessageDto) {
    try {
      return await this.prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          type: data.type || 'TEXT',
          content: data.content,
        }
      });
    } catch (error) {
      this.logger.error('Error in create message repository', error);
      throw error;
    }
  }

  async findByConversationId(conversationId: string, limit: number, offset: number) {
    try {
      return await this.prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: limit > 0 ? limit : 20,
        skip: offset > 0 ? offset : 0,
      });
    } catch (error) {
      this.logger.error('Error in findByConversationId message repository', error);
      throw error;
    }
  }

  async upsertReadReceipt(messageId: string, userId: string) {
    try {
      return await this.prisma.readReceipt.upsert({
        where: { messageId_userId: { messageId, userId } },
        update: { readAt: new Date() },
        create: { messageId, userId }
      });
    } catch (error) {
      this.logger.error('Error in upsertReadReceipt message repository', error);
      throw error;
    }
  }
}
