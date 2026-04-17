import { Global, Module } from '@nestjs/common';
import { CensorService } from './censor.service';

@Global()
@Module({
  providers: [CensorService],
  exports: [CensorService],
})
export class CensorModule {}
