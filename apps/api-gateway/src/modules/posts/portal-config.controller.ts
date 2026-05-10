import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Inject,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@Controller('admin/portal-configs')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PortalConfigController {
  private configService: any;

  constructor(@Inject(MICROSERVICES.PORTAL_CONFIG.SYMBOL) private client: ClientGrpc) { }

  onModuleInit() {
    this.configService = this.client.getService<any>(MICROSERVICES.PORTAL_CONFIG.SERVICE);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: { code: string; name: string; description?: string }) {
    const res: any = await firstValueFrom(this.configService.create(dto));
    return { success: true, data: res.data };
  }

  @Get()
  async findAll() {
    const res: any = await firstValueFrom(this.configService.getAll({}));
    return { success: true, data: res.data || [] };
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { code?: string; name?: string; description?: string },
  ) {
    const res: any = await firstValueFrom(this.configService.update({ id, ...dto }));
    return { success: true, data: res.data };
  }
}
