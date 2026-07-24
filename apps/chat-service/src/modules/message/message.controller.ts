import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MessageService } from './message.service';
import { Observable, Subject } from 'rxjs';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @GrpcMethod('ChatService', 'GetMessages')
  async getMessages(data: { conversationId: string; limit: number; offset: number }): Promise<{ items: MessageResponseDto[] }> {
    const messages = await this.messageService.getMessages(data.conversationId, data.limit, data.offset);
    return { items: messages };
  }

  @GrpcMethod('ChatService', 'MarkRead')
  async markRead(data: { messageId: string; userId: string }): Promise<{ success: boolean }> {
    const success = await this.messageService.markRead(data.messageId, data.userId);
    return { success };
  }

  @GrpcMethod('ChatService', 'SendMessage')
  async sendMessage(data: CreateMessageDto): Promise<MessageResponseDto> {
    return await this.messageService.saveMessage(data);
  }

  // NOTE: Streaming endpoints in gRPC (like Chat) are typically handled via @GrpcStreamMethod
  // But for simple Request-Response, @GrpcMethod is fine.
  @GrpcMethod('ChatService', 'Chat')
  chat(data$: Observable<CreateMessageDto>): Observable<MessageResponseDto> {
    const subject = new Subject<MessageResponseDto>();
    
    data$.subscribe({
      next: async (msg) => {
        // Lưu message vào DB
        const savedMsg = await this.messageService.saveMessage(msg);
        
        // Broadcast hoặc gửi lại
        subject.next(savedMsg);
      },
      complete: () => subject.complete(),
      error: (err) => subject.error(err)
    });

    return subject.asObservable();
  }
}
