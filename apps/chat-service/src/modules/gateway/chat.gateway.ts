import { 
  WebSocketGateway, 
  SubscribeMessage, 
  MessageBody, 
  ConnectedSocket, 
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../../infra/redis/redis.service';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.redisService.setPresence(userId, 'online');
      // Thông báo cho mọi người là user đã online
      this.server.emit('presence', { userId, status: 'online' });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.redisService.setPresence(userId, 'offline');
      // Thông báo cho mọi người là user đã offline
      this.server.emit('presence', { userId, status: 'offline' });
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    client.join(`room_${data.conversationId}`);
    return { event: 'joined', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    client.leave(`room_${data.conversationId}`);
    return { event: 'left', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.to(`room_${data.conversationId}`).emit('typing', { conversationId: data.conversationId, userId });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    const userId = client.handshake.query.userId as string;
    client.to(`room_${data.conversationId}`).emit('stop_typing', { conversationId: data.conversationId, userId });
  }

  // Phương thức này cho các Service gọi (ví dụ MessageService)
  broadcastMessage(conversationId: string, message: any) {
    this.server.to(`room_${conversationId}`).emit('new_message', message);
  }
}
