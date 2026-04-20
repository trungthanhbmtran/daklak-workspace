import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

const protoRoot = process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

const postsDir = join(protoRoot, 'posts');
const protoPath = [
  join(postsDir, 'post.proto'),
  join(postsDir, 'category.proto'),
  join(postsDir, 'tag.proto'),
  join(postsDir, 'banner.proto'),
];

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: ['post', 'category', 'tag', 'banner'],
        protoPath,
        url: process.env.GRPC_URL ?? '0.0.0.0:50055',
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
  app.enableShutdownHooks();

  await app.listen();
  console.log('Post Service (gRPC) listening on', process.env.GRPC_URL ?? '0.0.0.0:50055');
}
bootstrap();
