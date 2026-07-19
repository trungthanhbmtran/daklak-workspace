import { Controller, Get, Inject, OnModuleInit, Query } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public Portal Menus')
@Controller('public/portal-menus')
export class PublicPortalMenuController implements OnModuleInit {
  private portalMenuService: any;

  constructor(
    @Inject(MICROSERVICES.PORTAL_MENU.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.portalMenuService = this.client.getService<any>(
      MICROSERVICES.PORTAL_MENU.SERVICE,
    );
  }

  @Get()
  async findAll(@Query() query: any) {
    return firstValueFrom(this.portalMenuService.listPortalMenus(query)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }
}
