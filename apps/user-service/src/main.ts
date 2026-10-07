import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

const userDir = join(protoRoot, 'users');
const protoPath = [
  join(userDir, 'user.proto'),
  join(userDir, 'pbac.proto'),
  join(userDir, 'categories.proto'),
  join(userDir, 'menus.proto'),
  join(userDir, 'organization.proto'),
  join(userDir, 'auth.proto'),
  join(userDir, 'system_config.proto'),
  join(userDir, 'user_config.proto'),
  join(userDir, 'ai_assistant.proto'),
  join(userDir, 'ai.proto'),
  
  join(protoRoot,  'api-management.proto'),
];

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: [
          'user',
          'pbac',
          'category',
          'menu',
          'organization',
          'users',
          'auth',
          'user_config',
          
          'api_management.v2',
        ],
        protoPath,
        url: process.env.GRPC_URL ?? '0.0.0.0:50051',
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          includeDirs: [protoRoot],
        },
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();

  await app.listen();
  console.log(
    'User Service (gRPC) listening on',
    process.env.GRPC_URL ?? '0.0.0.0:50051',
  );
}
void bootstrap();
