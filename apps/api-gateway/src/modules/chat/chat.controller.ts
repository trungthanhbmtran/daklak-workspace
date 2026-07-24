import { Controller, Get, Post, Body, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';

interface ChatServiceClient {
  createConversation(data: any): Observable<any>;
  getConversation(data: any): Observable<any>;
  getMessages(data: any): Observable<any>;
  sendMessage(data: any): Observable<any>;
}

@Controller('chat')
export class ChatController implements OnModuleInit {
  private chatService: ChatServiceClient;

  constructor(@Inject('CHAT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatServiceClient>('ChatService');
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
  sendMessage(@Body() body: any) {
    return this.chatService.sendMessage(body);
  }
}
