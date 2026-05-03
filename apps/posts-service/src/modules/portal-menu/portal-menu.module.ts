import { Module } from '@nestjs/common';
import { PortalMenuService } from './portal-menu.service';
import { PortalMenuController } from './portal-menu.controller';

@Module({
  controllers: [PortalMenuController],
  providers: [PortalMenuService],
  exports: [PortalMenuService],
})
export class PortalMenuModule {}
