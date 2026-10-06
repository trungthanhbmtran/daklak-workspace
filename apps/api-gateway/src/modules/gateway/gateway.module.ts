import { Module } from '@nestjs/common';
import { GatewayConfigController } from './gateway.controller';
import { GatewayConfigService } from './gateway.service';

@Module({
  controllers: [GatewayConfigController],
  providers: [GatewayConfigService],
})
export class GatewayModule {}
