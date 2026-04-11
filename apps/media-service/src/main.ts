import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { existsSync } from 'fs';

function getProtoPath() {
  const base = process.env.PROTO_PATH || join(process.cwd(), 'protos');
  const proto = join(base, 'media/media.proto');

  if (existsSync(proto)) return proto;

  throw new Error(`media.proto not found at ${proto}`);
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
          includeDirs: [process.env.PROTO_PATH || join(process.cwd(), 'protos')],
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
