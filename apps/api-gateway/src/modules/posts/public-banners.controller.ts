import { Controller, Get, Inject, OnModuleInit, Query } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public Banners')
@Controller('public/banners')
export class PublicBannersController implements OnModuleInit {
  private bannerService: any;

  constructor(
    @Inject(MICROSERVICES.BANNER.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.bannerService = this.client.getService<any>(
      MICROSERVICES.BANNER.SERVICE,
    );
  }

  @Get()
  async findAll(@Query() query: any) {
    return firstValueFrom(this.bannerService.listBanners(query)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
