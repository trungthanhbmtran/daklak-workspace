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
  Logger,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@Controller('admin/banners')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PostsBannerController implements OnModuleInit {
  private readonly logger = new Logger(PostsBannerController.name);
  private bannerService: any;

  constructor(
    @Inject(MICROSERVICES.BANNER.SYMBOL) private client: ClientGrpc,
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
    this.bannerService = this.client.getService<any>(
      MICROSERVICES.BANNER.SERVICE,
    );
  }

  @Post()
  async create(@Req() req: any, @Body() createDto: any) {
    return firstValueFrom(
      this.bannerService.createBanner(createDto, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        return null;
      },
    );
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return firstValueFrom(
      this.bannerService.listBanners(query, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.bannerService.getBanner({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return firstValueFrom(
      this.bannerService.updateBanner(
        { id, ...updateDto },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.bannerService.deleteBanner({ id }, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        return null;
      },
    );
  }
}
