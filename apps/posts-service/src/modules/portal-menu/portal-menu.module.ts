import { Module } from '@nestjs/common';
import { PortalMenuController } from './portal-menu.controller';
import { PortalMenuService } from './portal-menu.service';

@Module({
  controllers: [PortalMenuController],
  providers: [PortalMenuService],
  exports: [PortalMenuService],
})
export class PortalMenuModule {}
