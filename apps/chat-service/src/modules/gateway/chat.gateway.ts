import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { RedisService } from '../../infra/redis/redis.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly redisService: RedisService) {}

  async handleConnection(client: Socket) {
    // In a real app, you would extract user ID from JWT token or headers
    // For this implementation, we expect client to send userId in handshake query or auth
    const userId = client.handshake.query.userId as string || client.handshake.auth.userId;
    
    if (userId) {
      client.data.userId = userId;
      await this.redisService.setUserOnline(userId, client.id);
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Notify others about presence
      this.server.emit('presence', { userId, status: 'online' });
    } else {
      this.logger.log(`Client connected: ${client.id} (No userId provided)`);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      await this.redisService.setUserOffline(userId);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
      
      // Notify others about presence
      this.server.emit('presence', { userId, status: 'offline', lastSeen: Date.now() });
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    if (data?.conversationId) {
      client.join(`conversation_${data.conversationId}`);
      this.logger.debug(`Client ${client.id} joined room conversation_${data.conversationId}`);
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    if (data?.conversationId) {
      client.leave(`conversation_${data.conversationId}`);
      this.logger.debug(`Client ${client.id} left room conversation_${data.conversationId}`);
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const userId = client.data.userId;
    if (userId && data?.conversationId) {
      await this.redisService.setUserTyping(data.conversationId, userId);
      // Broadcast to room except sender
      client.to(`conversation_${data.conversationId}`).emit('typing', {
        conversationId: data.conversationId,
        userId
      });
    }
  }

  @SubscribeMessage('stop_typing')
  async handleStopTyping(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const userId = client.data.userId;
    if (userId && data?.conversationId) {
      await this.redisService.stopUserTyping(data.conversationId, userId);
      // Broadcast to room except sender
      client.to(`conversation_${data.conversationId}`).emit('stop_typing', {
        conversationId: data.conversationId,
        userId
      });
    }
  }

  // Method to be called by other services to broadcast messages
  broadcastMessage(conversationId: string, message: any) {
    this.server.to(`conversation_${conversationId}`).emit('new_message', message);
  }
}
