import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MICROSERVICES } from '../../core/constants/services';
import { TranslateController } from './translate.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MICROSERVICES.TRANSLATE.SYMBOL,
        transport: Transport.GRPC,
        options: {
          package: MICROSERVICES.TRANSLATE.PACKAGE,
          protoPath: join(__dirname, '../../../../../shared/protos', MICROSERVICES.TRANSLATE.PROTO),
          url: MICROSERVICES.TRANSLATE.URL,
        },
      },
    ]),
  ],
  controllers: [TranslateController],
})
export class TranslateModule {}
