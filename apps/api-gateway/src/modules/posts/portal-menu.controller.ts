import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Inject,
  Query,
  UseGuards,
  InternalServerErrorException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';

@Controller('admin/portal-menus')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PortalMenuController {
  private portalMenuService: any;

  constructor(
    @Inject(MICROSERVICES.PORTAL_MENU.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.portalMenuService = this.client.getService<any>(
      MICROSERVICES.PORTAL_MENU.SERVICE,
    );
  }

  @Post()
  @RequirePolicy('manage', 'portal_menu')
  async create(@Body() dto: any) {
    return firstValueFrom(this.portalMenuService.createPortalMenu(dto)).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    );
  }

  @Get()
  async findAll(@Query() query: any) {
    console.log('Gateway: Calling ListPortalMenus with query:', query);
    const result = await firstValueFrom(
      this.portalMenuService.listPortalMenus(query),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    console.log('Gateway: ListPortalMenus response received');
    return result;
  }

  @Get('quick-setup')
  async getQuickSetupData() {
    console.log('Gateway: Calling GetQuickSetupData');
    const result = await firstValueFrom(
      this.portalMenuService.getQuickSetupData({}),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    console.log('Gateway: GetQuickSetupData response received');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.portalMenuService.getPortalMenu({ id })).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    );
  }

  @Put(':id')
  @RequirePolicy('manage', 'portal_menu')
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(
      this.portalMenuService.updatePortalMenu({ id, ...dto }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Delete(':id')
  @RequirePolicy('manage', 'portal_menu')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.portalMenuService.deletePortalMenu({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }
}
