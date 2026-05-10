import { Module } from '@nestjs/common';
import { PortalConfigController } from './portal-config.controller';
import { PortalConfigService } from './portal-config.service';

@Module({
  controllers: [PortalConfigController],
  providers: [PortalConfigService],
  exports: [PortalConfigService],
})
export class PortalConfigModule {}
