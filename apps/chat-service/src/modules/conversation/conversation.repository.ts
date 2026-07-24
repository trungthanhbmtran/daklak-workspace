import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ConversationRepository {
  private readonly logger = new Logger(ConversationRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: { type: string; title?: string; participantIds: string[] }) {
    try {
      return await this.prisma.conversation.create({
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
    } catch (error) {
      this.logger.error('Error in create conversation repository', error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await this.prisma.conversation.findUnique({
        where: { id },
        include: { participants: true }
      });
    } catch (error) {
      this.logger.error('Error in findById conversation repository', error);
      throw error;
    }
  }
}
