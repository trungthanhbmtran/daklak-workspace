import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { Inject, Logger } from '@nestjs/common';
import { RedisService } from '../../core/redis/redis.service';

@WebSocketGateway({ namespace: '/admin/chat', path: '/api/v1/admin/chat/socket.io', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      let token: string | undefined;

      // 1. Parse cookie
      const cookieHeader = client.handshake.headers.cookie;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((res, item) => {
          const parts = item.split('=');
          res[parts[0].trim()] = parts[1]?.trim();
          return res;
        }, {} as Record<string, string>);
        token = cookies['accessToken'];
      }

      // 2. Parse Auth header
      if (!token && client.handshake.headers.authorization) {
        const auth = client.handshake.headers.authorization;
        if (auth.startsWith('Bearer ')) {
          token = auth.split(' ')[1];
        }
      }

      if (!token) {
        this.logger.warn(`Client disconnected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      const secret =
        process.env.JWT_SECRET ||
        process.env.ACCESS_TOKEN_SECRET ||
        'super-secret';

      const decoded = jwt.verify(token, secret) as any;
      const userId = parseInt(decoded.sub, 10);

      if (isNaN(userId)) {
        this.logger.warn(`Client disconnected: Invalid token payload (${client.id})`);
        client.disconnect();
        return;
      }

      // We trust the JWT token for socket connections
      const employeeCode = decoded.employeeCode || decoded.employee_code || String(userId);

      // Attach user info to socket
      (client as any).user = {
        id: userId,
        employeeCode: employeeCode,
      };

      // Set presence
      await this.redisService.set(`presence:${employeeCode}`, 'online', 3600); // 1 hour TTL
      
      this.logger.log(`Client connected: ${employeeCode} (${client.id})`);

    } catch (err) {
      this.logger.error(`WebSocket Authentication Error: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = (client as any).user;
    if (user && user.employeeCode) {
      this.logger.log(`Client disconnected: ${user.employeeCode} (${client.id})`);
      await this.redisService.del(`presence:${user.employeeCode}`);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    if (!data || !data.conversationId) return { event: 'error', data: 'No conversationId provided' };
    client.join(`room_${data.conversationId}`);
    return { event: 'joined', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    if (!data || !data.conversationId) return;
    client.leave(`room_${data.conversationId}`);
    return { event: 'left', data: { conversationId: data.conversationId } };
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    if (!data || !data.conversationId) return;
    const user = (client as any).user;
    if (user) {
      client.to(`room_${data.conversationId}`).emit('typing', { conversationId: data.conversationId, userId: user.employeeCode });
    }
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(@MessageBody() data: { conversationId: string }, @ConnectedSocket() client: Socket) {
    if (!data || !data.conversationId) return;
    const user = (client as any).user;
    if (user) {
      client.to(`room_${data.conversationId}`).emit('stop_typing', { conversationId: data.conversationId, userId: user.employeeCode });
    }
  }

  broadcastMessage(conversationId: string, message: any) {
    this.logger.log(`Broadcasting new_message to room_${conversationId}`);
    this.server.to(`room_${conversationId}`).emit('new_message', message);
  }
}
