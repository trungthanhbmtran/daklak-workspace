import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import * as redisStore from 'cache-manager-redis-store';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'change-me-in-production'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '24h') },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST', 'redis'),
        port: parseInt(config.get('REDIS_PORT') ?? '6379', 10),
        ttl: 600,
      }),
      inject: [ConfigService],
    }),
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE', // Tên để Inject vào Service
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: process.env.NOTIFICATION_QUEUE || 'notifications', // Cùng queue với notification_service
          queueOptions: {
            durable: false, // Queue tạm thời hay bền vững
          },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
