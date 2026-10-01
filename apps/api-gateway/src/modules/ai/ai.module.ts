import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MICROSERVICES } from '../../core/constants/services';
import { AiGatewayController } from './ai.controller';
import { AuthModule } from '../auth/auth.module'; // for JWT guard if needed

const protoRoot =
  process.env.PROTO_PATH ?? join(process.cwd(), '..', '..', 'shared', 'protos');

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.AI.SYMBOL,
        transport: Transport.GRPC,
        options: {
          package: MICROSERVICES.AI.PACKAGE,
          protoPath: join(protoRoot, MICROSERVICES.AI.PROTO),
          url: MICROSERVICES.AI.URL,
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
    AuthModule,
  ],
  controllers: [AiGatewayController],
})
export class AiGatewayModule {}
