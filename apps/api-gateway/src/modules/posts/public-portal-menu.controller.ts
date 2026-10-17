import {
  Controller,
  Get,
  Inject,
  Query,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { getInternalGrpcMetadata } from '../../core/utils/internal-metadata.util';

@ApiTags('Public Portal Menus')
@Controller('public/portal-menus')
export class PublicPortalMenuController implements OnModuleInit {
  private readonly logger = new Logger(PublicPortalMenuController.name);
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
    return firstValueFrom(this.portalMenuService.listPortalMenus(query, getInternalGrpcMetadata())).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        return null;
      },
    );
  }

  @Get('tree')
  async getTree(@Query() query: any) {
    // The listPortalMenus RPC already returns a hierarchical tree structure O(N)
    return firstValueFrom(this.portalMenuService.listPortalMenus(query, getInternalGrpcMetadata())).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        return null;
      },
    );
  }
}
