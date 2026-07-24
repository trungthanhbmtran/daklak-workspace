import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ParticipantService {
  private readonly logger = new Logger(ParticipantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async addParticipant(conversationId: string, userId: string, role: string = 'MEMBER') {
    try {
      const participant = await this.prisma.participant.upsert({
        where: { conversationId_userId: { conversationId, userId } },
        update: { role },
        create: { conversationId, userId, role }
      });
      return participant;
    } catch (e) {
      this.logger.error('Error adding participant', e);
      throw new RpcException('Không thể thêm thành viên');
    }
  }

  async removeParticipant(conversationId: string, userId: string) {
    try {
      await this.prisma.participant.delete({
        where: { conversationId_userId: { conversationId, userId } }
      });
      return true;
    } catch (e) {
      this.logger.error('Error removing participant', e);
      return false;
    }
  }
}
