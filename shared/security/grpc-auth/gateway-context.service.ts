import {
  Global,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientGrpc,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { Metadata, status } from '@grpc/grpc-js';
import { firstValueFrom, Observable, timeout } from 'rxjs';
import { join } from 'path';
import Redis from 'ioredis';
import {
  AuthState,
  GatewayContext,
  InvalidGatewayContext,
  validateGatewayContext,
  verifyGatewayContextToken,
} from '../gateway-context';

@Injectable()
export class GatewayContextService implements OnModuleInit, OnModuleDestroy {
  public get userClient() { return this.user; }
  private readonly client = ClientProxyFactory.create({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(
        process.env.PROTO_PATH || join(process.cwd(), '../../shared/protos'),
        'users/user.proto',
      ),
      url:
        process.env.USER_SERVICE_ADDR ||
        process.env.USER_GRPC_URL ||
        'user-service:50051',
      loader: { keepCase: false, defaults: true },
    },
  }) as unknown as ClientGrpc & { close(): void };
  private readonly redis = new Redis(
    process.env.REDIS_URL || 'redis://redis:6379',
    {
      db: Number(process.env.REDIS_DB || 0),
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      commandTimeout: 5000,
    },
  );
  private user!: { GetAuthState(data: { id: number; sessionId: string }): Observable<AuthState>; FindOne(data: { id: number }): Observable<any>; };
  onModuleInit() {
    this.user = this.client.getService('UserService');
    this.redis.on('error', () => undefined);
  }
  async verify(metadata: Metadata): Promise<GatewayContext> {
    const header = metadata?.get?.('authorization')?.[0];
    if (typeof header !== 'string' || !header.startsWith('Bearer '))
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Authentication required',
      });
    try {
      return await validateGatewayContext(
        header.slice(7),
        process.env.JWT_PUBLIC_KEY || '',
        (id, sessionId) =>
          firstValueFrom(
            this.user.GetAuthState({ id, sessionId }).pipe(timeout(5000)),
          ),
        (key) => this.redis.get(key),
      );
    } catch (error) {
      throw new RpcException({
        code:
          error instanceof InvalidGatewayContext
            ? status.UNAUTHENTICATED
            : status.UNAVAILABLE,
        message: 'Authentication unavailable or invalid',
      });
    }
  }

  async verifyFast(metadata: Metadata): Promise<GatewayContext> {
    const header = metadata?.get?.('authorization')?.[0];
    if (typeof header !== 'string' || !header.startsWith('Bearer '))
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Authentication required',
      });
    try {
      
      return verifyGatewayContextToken(header.slice(7), process.env.JWT_PUBLIC_KEY || '');
    } catch (error) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid delegation token signature',
      });
    }
  }

  async getPolicyCache(userId: number, pv: number): Promise<{ permissionsFlatten: string[], employeeCode?: string, unitId?: number } | null> {
    const key = `policy:${userId}:${pv}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setPolicyCache(userId: number, pv: number, data: { permissionsFlatten: string[], employeeCode?: string, unitId?: number }): Promise<void> {
    const key = `policy:${userId}:${pv}`;
    // TTL = 1 hour (3600 seconds)
    await this.redis.set(key, JSON.stringify(data), 'EX', 3600);
  }

  onModuleDestroy() {
    this.redis.disconnect();
    this.client.close();
  }
}
@Global()
@Module({
  providers: [GatewayContextService],
  exports: [GatewayContextService],
})
export class InternalAuthModule {}






