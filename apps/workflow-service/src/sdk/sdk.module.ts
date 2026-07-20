import { Module } from '@nestjs/common';
import { DynamicSdkService } from './sdk.service';

@Module({
  providers: [DynamicSdkService],
  exports: [DynamicSdkService],
})
export class SdkModule {}
