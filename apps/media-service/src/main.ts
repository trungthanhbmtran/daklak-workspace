import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';

function getProtoPath() {
  const root = process.env.PROTO_PATH || join(process.cwd(), '..', '..', 'shared', 'protos');
  
  const envPath = process.env.PROTO_PATH ? join(process.env.PROTO_PATH, 'media/media.proto') : null;
  if (envPath && existsSync(envPath)) return envPath;
  
  const tries = [
    join(__dirname, '../../protos/media/media.proto'),
    join(__dirname, '../protos/media/media.proto'),
    join(__dirname, '../../../shared/protos/media/media.proto'),
    join(process.cwd(), 'protos/media/media.proto'),
    join(process.cwd(), '../protos/media/media.proto'),
  ];
  for (const p of tries) {
    if (existsSync(p)) return p;
  }
  throw new Error(`media.proto not found`);
}

async function bootstrap() {
  const protoPath = getProtoPath();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['media'],
        protoPath: getProtoPath(),
        url: process.env.GRPC_URL ?? '0.0.0.0:50059',
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
          includeDirs: [join(process.cwd(), 'protos'), '/app/protos'],
        },
      },
    },
  );

  await app.listen();
  console.log(
    'Media Service (gRPC) listening on',
    process.env.GRPC_URL ?? '0.0.0.0:50059'
  );
  console.log('Loaded proto from', protoPath);
}
bootstrap();
