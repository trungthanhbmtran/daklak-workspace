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
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Controller('admin/banners')
export class PostsBannerController {
  private bannerService: any;

  constructor(@Inject(MICROSERVICES.BANNER.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.bannerService = this.client.getService<any>(MICROSERVICES.BANNER.SERVICE);
  }

  @Post()
  async create(@Body() createDto: any) {
    return firstValueFrom(this.bannerService.createBanner(createDto));
  }

  @Get()
  async findAll(@Query() query: any) {
    return firstValueFrom(this.bannerService.listBanners(query));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.bannerService.getBanner({ id }));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return firstValueFrom(this.bannerService.updateBanner({ id, ...updateDto }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.bannerService.deleteBanner({ id }));
  }
}
