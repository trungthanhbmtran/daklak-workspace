import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
  Logger,
  OnModuleInit,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ClientGrpc,
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { Observable, firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { ChatGateway } from './chat.gateway';

interface ChatServiceClient {
  createConversation(data: any, metadata?: any): Observable<any>;
  getConversation(data: any, metadata?: any): Observable<any>;
  getMessages(data: any, metadata?: any): Observable<any>;
  sendMessage(data: any, metadata?: any): Observable<any>;
}

interface EmployeeServiceClient {
  GetEmployeeByCode(data: { code: string }): Observable<any>;
  ListEmployees(data: any): Observable<any>;
}

@Controller('admin/chat')
@UseGuards(JwtAuthGuard)
export class ChatController implements OnModuleInit {
  private readonly logger = new Logger(ChatController.name);
  private chatService: ChatServiceClient;
  private employeeService: EmployeeServiceClient;

  constructor(
    @Inject('CHAT_PACKAGE') private client: ClientGrpc,
    @Inject('EMPLOYEE_PACKAGE') private employeeClient: ClientGrpc,
    private readonly chatGateway: ChatGateway,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  onModuleInit() {
    this.chatService = this.client.getService<ChatServiceClient>('ChatService');
    this.employeeService =
      this.employeeClient.getService<EmployeeServiceClient>('EmployeeHandlers');
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
      this.logger.error(
        `Error broadcasting message: ${err?.message || err}`,
        err?.stack,
      );
    } finally {
      channel.ack(originalMsg);
    }
  }

  @Post('conversation')
  createConversation(@Req() req: any, @Body() body: any) {
    return this.chatService.createConversation(body, this.getGrpcMetadata(req));
  }

  @Get('conversation/:id')
  getConversation(@Req() req: any, @Param('id') id: string) {
    return this.chatService.getConversation(
      { id },
      this.getGrpcMetadata(req),
    );
  }

  @Get('conversation/:id/messages')
  async getMessages(
    @Req() req: any,
    @Param('id') conversationId: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const res = await firstValueFrom(
      this.chatService.getMessages(
        {
          conversationId,
          limit: limit ? Number(limit) : 20,
          offset: offset ? Number(offset) : 0,
        },
        this.getGrpcMetadata(req),
      ),
    );

    if (res && res.data && Array.isArray(res.data)) {
      const uniqueSenderIds = [
        ...new Set(res.data.map((m: any) => m.senderId).filter(Boolean)),
      ];
      const nameMap: Record<string, string> = {};

      if (uniqueSenderIds.length > 0) {
        try {
          const empListRes = await firstValueFrom<any>(
            this.employeeService.ListEmployees({
              page: 1,
              pageSize: uniqueSenderIds.length,
              codes: uniqueSenderIds,
            }),
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
    // Chống spoofing: senderId LUÔN lấy từ user đã xác thực, bỏ qua giá trị client gửi lên
    if (req.user) {
      body.senderId = req.user.employeeCode || req.user.username;
    }
    return this.chatService.sendMessage(body, this.getGrpcMetadata(req));
  }
}
