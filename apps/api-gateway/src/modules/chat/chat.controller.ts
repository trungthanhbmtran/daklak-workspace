import { Controller, Get, Post, Body, Param, Query, Inject, OnModuleInit, UseGuards, Req } from '@nestjs/common';
import { ClientGrpc, EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';

interface ChatServiceClient {
  createConversation(data: any): Observable<any>;
  getConversation(data: any): Observable<any>;
  getMessages(data: any): Observable<any>;
  sendMessage(data: any): Observable<any>;
}

interface EmployeeServiceClient {
  GetEmployeeByCode(data: { code: string }): Observable<any>;
  ListEmployees(data: any): Observable<any>;
}

@Controller('admin/chat')
@UseGuards(JwtAuthGuard)
export class ChatController implements OnModuleInit {
  private chatService: ChatServiceClient;
  private employeeService: EmployeeServiceClient;

  constructor(
    @Inject('CHAT_PACKAGE') private client: ClientGrpc,
    @Inject('EMPLOYEE_PACKAGE') private employeeClient: ClientGrpc,
    private readonly chatGateway: ChatGateway
  ) {}

  onModuleInit() {
    this.chatService = this.client.getService<ChatServiceClient>('ChatService');
    this.employeeService = this.employeeClient.getService<EmployeeServiceClient>('EmployeeHandlers');
  }

  @EventPattern('message.created')
  async handleMessageCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    try {
      // Broadcast message via WebSockets
      if (data && data.conversationId) {
        this.chatGateway.broadcastMessage(data.conversationId, data);
      }
    } catch (err) {
      console.error('Error broadcasting message:', err);
    } finally {
      channel.ack(originalMsg);
    }
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
  async getMessages(
    @Param('id') conversationId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const res = await firstValueFrom(
      this.chatService.getMessages({
        conversationId,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
      })
    );

    if (res && res.data && Array.isArray(res.data)) {
      const uniqueSenderIds = [...new Set(res.data.map((m: any) => m.senderId).filter(Boolean))];
      const nameMap: Record<string, string> = {};

      if (uniqueSenderIds.length > 0) {
        try {
          const empListRes = await firstValueFrom<any>(
            this.employeeService.ListEmployees({
              page: 1,
              pageSize: uniqueSenderIds.length,
              codes: uniqueSenderIds
            })
          );
          
          if (empListRes?.success && empListRes.data) {
            empListRes.data.forEach((emp: any) => {
              nameMap[emp.employeeCode] = emp.fullName || emp.employeeName;
            });
          }
        } catch (error) {
          // ignore if failed
        }
      }

      res.data = res.data.map((m: any) => ({
        ...m,
        senderName: nameMap[m.senderId] || m.senderId,
      }));
    }

    return res;
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
