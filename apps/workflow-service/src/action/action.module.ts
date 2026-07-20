import { Module } from '@nestjs/common';
import { SdkModule } from '../sdk/sdk.module';
import { DynamicIntegrationAction } from './dynamic-integration.action';

@Module({
  imports: [SdkModule],
  providers: [DynamicIntegrationAction],
  exports: [DynamicIntegrationAction],
})
export class ActionModule {}
