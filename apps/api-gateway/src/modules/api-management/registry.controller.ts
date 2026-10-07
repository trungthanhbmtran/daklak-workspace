import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { GatewayRegistryService } from './registry.service';

@Controller()
export class GatewayRegistryController {
  private readonly logger = new Logger(GatewayRegistryController.name);

  constructor(private readonly registryService: GatewayRegistryService) {}

  @EventPattern('API_CONNECTION_DENY')
  async handleDeny(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.registryService.handleEmergencyDeny(data);
      channel.ack(originalMsg);
    } catch (e: any) {
      this.logger.error('Error handling API_CONNECTION_DENY', e.stack);
      // Nack and requeue
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern('API_REVISION_SYNC')
  async handleSync(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.registryService.syncRevision(data);
      channel.ack(originalMsg);
    } catch (e: any) {
      this.logger.error('Error handling API_REVISION_SYNC', e.stack);
      channel.nack(originalMsg, false, true);
    }
  }
}
