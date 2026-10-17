import { Injectable, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";
import { RabbitmqService } from "../../infra/rabbitmq/rabbitmq.service";
import { ParticipantService } from "../participant/participant.service";
import { MessageRepository } from "./message.repository";
import { CreateMessageDto } from "./dto/create-message.dto";
import { MessageResponseDto } from "./dto/message-response.dto";

export interface ChatActor {
  employeeCode?: string;
  username?: string;
  isSystem?: boolean;
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly rabbitmqService: RabbitmqService,
    private readonly participantService: ParticipantService,
  ) {}

  // Khóa định danh khớp quy ước senderId của Gateway (employeeCode || username)
  private actorKeys(actor?: ChatActor): string[] {
    return [actor?.employeeCode, actor?.username].filter(
      (key): key is string => !!key,
    );
  }

  // Chống IDOR: chỉ participant mới được đọc/ghi trong conversation.
  // Trả NOT_FOUND thay vì PERMISSION_DENIED để không lộ sự tồn tại của conversation.
  private async assertParticipant(conversationId: string, actor?: ChatActor) {
    if (actor?.isSystem) return;

    for (const key of this.actorKeys(actor)) {
      if (await this.participantService.isParticipant(conversationId, key)) {
        return;
      }
    }

    throw new RpcException({
      code: status.NOT_FOUND,
      message: "Conversation not found",
    });
  }

  async getMessages(
    conversationId: string,
    limit: number,
    offset: number,
    actor?: ChatActor,
  ): Promise<MessageResponseDto[]> {
    if (!conversationId) {
      throw new RpcException("conversationId là bắt buộc");
    }
    await this.assertParticipant(conversationId, actor);

    const messages = await this.messageRepository.findByConversationId(
      conversationId,
      limit,
      offset,
    );
    return messages.map(
      (msg) =>
        new MessageResponseDto({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          type: msg.type,
          content: msg.content,
          createdAt: msg.createdAt.toISOString(),
        }),
    );
  }

  async saveMessage(
    data: CreateMessageDto,
    actor?: ChatActor,
  ): Promise<MessageResponseDto> {
    await this.assertParticipant(data.conversationId, actor);

    // Chống spoofing: người gửi luôn là user đã xác thực (trừ lời gọi nội bộ hệ thống)
    const payload: CreateMessageDto = actor?.isSystem
      ? data
      : { ...data, senderId: this.actorKeys(actor)[0] };

    try {
      const msg = await this.messageRepository.create(payload);

      this.rabbitmqService.publishEvent("message.created", msg);

      return new MessageResponseDto({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        type: msg.type,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      });
    } catch (e) {
      this.logger.error("Error saving message", e);
      throw new RpcException("Không thể lưu tin nhắn");
    }
  }

  async markRead(messageId: string, requestedUserId: string, actor?: ChatActor) {
    const conversationId =
      await this.messageRepository.findConversationIdById(messageId);
    if (!conversationId) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: "Message not found",
      });
    }
    await this.assertParticipant(conversationId, actor);

    // userId trong payload chỉ được tin với lời gọi nội bộ hệ thống
    const userId = actor?.isSystem
      ? requestedUserId
      : this.actorKeys(actor)[0];

    try {
      await this.messageRepository.upsertReadReceipt(messageId, userId);
      return true;
    } catch (e) {
      this.logger.error("Error marking message read", e);
      return false;
    }
  }
}
