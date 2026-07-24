import { Controller, Get, Post, Body, Param, Query, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientGrpc, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';

interface ChatServiceClient {
  createConversation(data: any): Observable<any>;
  getConversation(data: any): Observable<any>;
  getMessages(data: any): Observable<any>;
  sendMessage(data: any): Observable<any>;
}

@Controller('admin/chat')
@UseGuards(JwtAuthGuard)
export class ChatController implements OnModuleInit {
  private chatService: ChatServiceClient;

  constructor(
    @Inject('CHAT_PACKAGE') private client: ClientGrpc,
    private readonly chatGateway: ChatGateway
  ) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatServiceClient>('ChatService');
  }

  @EventPattern('message.created')
  async handleMessageCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    // Broadcast message via WebSockets
    if (data && data.conversationId) {
      this.chatGateway.broadcastMessage(data.conversationId, data);
    }
    
    channel.ack(originalMsg);
  }

  @Post('conversation')
  createConversation(@Body() body: any) {
    return this.chatService.createConversation(body);
  }

  @Get('conversation/:id')
  getConversation(@Param('id') id: string) {
    return this.chatService.getConversation({ id });
  }

  @Get('conversation/:id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.chatService.getMessages({
      conversationId,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
  }

  @Post('message')
  sendMessage(@Req() req: any, @Body() body: any) {
    // Tự động gán người gửi là user đang đăng nhập nếu chưa có
    if (!body.senderId && req.user) {
      body.senderId = req.user.employeeCode || req.user.username;
    }
    return this.chatService.sendMessage(body);
  }
}
