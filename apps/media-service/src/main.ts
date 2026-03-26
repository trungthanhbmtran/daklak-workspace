import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';

function getProtoPath() {
  // First, check for an absolute proto path override via env for Docker/k8s; fallback to project root
  const envProtoPath = process.env.PROTO_PATH
    ? join(process.env.PROTO_PATH, 'media/media.proto')
    : null;
  if (envProtoPath && existsSync(envProtoPath)) {
    return envProtoPath;
  }
  // Next, try dist/protos or src/protos relative to current file
  const tryPaths = [
    join(__dirname, '../../protos/media/media.proto'),
    join(__dirname, '../protos/media/media.proto'),
    join(__dirname, '../../../protos/media/media.proto'), // fallback if structure differs
  ];
  for (const path of tryPaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  throw new Error(
    `media.proto not found. Checked paths: ${[envProtoPath, ...tryPaths].filter(Boolean).join(', ')}`
  );
}

async function bootstrap() {
  const protoPath = getProtoPath();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['media', 'storage'],
        protoPath,
        url: process.env.GRPC_URL ?? '0.0.0.0:50059',
        loader: {
          keepCase: false,
          longs: String,
          enums: String,
          defaults: true,
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
