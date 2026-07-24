import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');
const chatProtoPath = join(protoRoot, 'chat', 'chat.proto');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHAT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'chat',
          protoPath: chatProtoPath,
          url: process.env.CHAT_GRPC_URL ?? '0.0.0.0:50061',
          loader: {
            keepCase: false,
            longs: String,
            enums: String,
            defaults: true,
            includeDirs: [protoRoot],
          },
        },
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway],
})
export class ChatModule {}
