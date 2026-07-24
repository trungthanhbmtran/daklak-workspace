import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { Observable, Subject } from 'rxjs';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @GrpcMethod('ChatService', 'GetMessages')
  async getMessages(data: any) {
    const messages = await this.messageService.getMessages(data.conversationId, data.limit, data.offset);
    return {
      items: messages.map(m => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        type: m.type,
        content: m.content,
        createdAt: m.createdAt.toISOString()
      }))
    };
  }

  @GrpcMethod('ChatService', 'MarkRead')
  async markRead(data: any) {
    const success = await this.messageService.markRead(data.messageId, data.userId);
    return { success };
  }

  @GrpcMethod('ChatService', 'SendMessage')
  async sendMessage(data: any) {
    const savedMsg = await this.messageService.saveMessage({
      conversationId: data.conversationId,
      senderId: data.senderId,
      type: data.type,
      content: data.content
    });
    
    return {
      id: savedMsg.id,
      conversationId: savedMsg.conversationId,
      senderId: savedMsg.senderId,
      type: savedMsg.type,
      content: savedMsg.content,
      createdAt: savedMsg.createdAt.toISOString()
    };
  }

  // NOTE: Streaming endpoints in gRPC (like Chat) are typically handled via @GrpcStreamMethod
  // But for simple Request-Response, @GrpcMethod is fine.
  @GrpcMethod('ChatService', 'Chat')
  chat(data$: Observable<any>): Observable<any> {
    const subject = new Subject<any>();
    
    data$.subscribe({
      next: async (msg) => {
        // Lưu message vào DB
        const savedMsg = await this.messageService.saveMessage({
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          type: msg.type,
          content: msg.content
        });
        
        // Broadcast hoặc gửi lại (trong hệ thống thật sẽ dùng Redis Pub/Sub hoặc RabbitMQ)
        subject.next({
          conversationId: savedMsg.conversationId,
          senderId: savedMsg.senderId,
          type: savedMsg.type,
          content: savedMsg.content
        });
      },
      complete: () => subject.complete(),
      error: (err) => subject.error(err)
    });

    return subject.asObservable();
  }
}
