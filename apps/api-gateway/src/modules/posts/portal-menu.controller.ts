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
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@Controller('admin/portal-menus')
@UseGuards(JwtAuthGuard, RbacGuard)
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
  @Roles(Role.ADMIN)
  async create(@Body() dto: any) {
    return firstValueFrom(this.portalMenuService.createPortalMenu(dto)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  @Get()
  async findAll(@Query() query: any) {
    console.log('Gateway: Calling ListPortalMenus with query:', query);
    const result = await firstValueFrom(
      this.portalMenuService.listPortalMenus(query),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
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
      console.error('RPC Call Failed', e.message);
      return null;
    });
    console.log('Gateway: GetQuickSetupData response received');
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.portalMenuService.getPortalMenu({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(
      this.portalMenuService.updatePortalMenu({ id, ...dto }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.portalMenuService.deletePortalMenu({ id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
