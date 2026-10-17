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
  Req,
  UseGuards,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@Controller('admin/portal-menus')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PortalMenuController {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  private portalMenuService: any;

  constructor(
    @Inject(MICROSERVICES.PORTAL_MENU.SYMBOL) private client: ClientGrpc,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  onModuleInit() {
    this.portalMenuService = this.client.getService<any>(
      MICROSERVICES.PORTAL_MENU.SERVICE,
    );
  }

  @Post()
  @RequirePolicy('manage', 'portal_menu')
  async create(@Req() req: any, @Body() dto: any) {
    return firstValueFrom(
      this.portalMenuService.createPortalMenu(dto, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    const result = await firstValueFrom(
      this.portalMenuService.listPortalMenus(query, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    return result;
  }

  @Get('quick-setup')
  async getQuickSetupData(@Req() req: any) {
    const result = await firstValueFrom(
      this.portalMenuService.getQuickSetupData({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
    return result;
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.portalMenuService.getPortalMenu({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Put(':id')
  @RequirePolicy('manage', 'portal_menu')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return firstValueFrom(
      this.portalMenuService.updatePortalMenu(
        { id, ...dto },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  @Delete(':id')
  @RequirePolicy('manage', 'portal_menu')
  async remove(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.portalMenuService.deletePortalMenu(
        { id },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }
}
