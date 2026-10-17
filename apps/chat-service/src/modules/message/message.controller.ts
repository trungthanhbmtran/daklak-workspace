import { Controller, Logger, UseGuards } from "@nestjs/common";
import { GrpcMethod, Payload } from "@nestjs/microservices";
import { GrpcAuthGuard } from "../../../../../shared/security/grpc-auth/grpc-auth.guard";
import { CurrentUser } from "../../../../../shared/security/grpc-auth/decorators";
import { ChatActor, MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Controller()
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(private readonly messageService: MessageService) {}

  @UseGuards(GrpcAuthGuard)
  @GrpcMethod("ChatService", "GetMessages")
  async getMessages(
    @Payload() data: { conversationId: string; limit: number; offset: number },
    @CurrentUser() user: ChatActor,
  ) {
    const messages = await this.messageService.getMessages(
      data.conversationId,
      data.limit || 50,
      data.offset || 0,
      user,
    );
    return { messages };
  }

  @UseGuards(GrpcAuthGuard)
  @GrpcMethod("ChatService", "SendMessage")
  async sendMessage(
    @Payload() data: CreateMessageDto,
    @CurrentUser() user: ChatActor,
  ) {
    const message = await this.messageService.saveMessage(data, user);
    return message;
  }

  @UseGuards(GrpcAuthGuard)
  @GrpcMethod("ChatService", "MarkRead")
  async markRead(
    @Payload() data: { messageId: string; userId: string },
    @CurrentUser() user: ChatActor,
  ) {
    await this.messageService.markRead(data.messageId, data.userId, user);
    return { success: true };
  }
}
