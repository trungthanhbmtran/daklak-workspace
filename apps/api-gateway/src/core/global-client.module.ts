import { Global, Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { MICROSERVICES } from './constants/services';
import { join } from 'path';

const PROTO_ROOT =
  process.env.PROTO_PATH || join(__dirname, '../../../../../shared/protos');

@Global()
@Module({
  providers: [
    {
      provide: MICROSERVICES.USER.SYMBOL,
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            package: MICROSERVICES.USER.PACKAGE,
            protoPath: join(PROTO_ROOT, MICROSERVICES.USER.PROTO),
            url: MICROSERVICES.USER.URL,
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              includeDirs: [PROTO_ROOT],
            },
          },
        });
      },
    },
    {
      provide: MICROSERVICES.PBAC.SYMBOL,
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            package: MICROSERVICES.PBAC.PACKAGE,
            protoPath: join(PROTO_ROOT, MICROSERVICES.PBAC.PROTO),
            url: MICROSERVICES.PBAC.URL,
            loader: {
              keepCase: false,
              longs: String,
              enums: String,
              defaults: true,
              includeDirs: [PROTO_ROOT],
            },
          },
        });
      },
    },
  ],
  exports: [MICROSERVICES.USER.SYMBOL, MICROSERVICES.PBAC.SYMBOL],
})
export class GlobalClientModule {}
