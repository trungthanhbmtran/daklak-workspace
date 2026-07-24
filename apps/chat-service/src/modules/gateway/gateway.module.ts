import { Module, Global } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Global()
@Module({
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class GatewayModule {}
