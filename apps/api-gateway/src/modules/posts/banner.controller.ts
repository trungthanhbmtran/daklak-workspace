import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Posts - Banners')
@Controller('admin/banners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class BannerController implements OnModuleInit {
  private bannerService: any;

  constructor(@Inject(MICROSERVICES.BANNER.SYMBOL) private readonly client: any) {}

  onModuleInit() {
    this.bannerService = this.client.getService(MICROSERVICES.BANNER.SERVICE);
  }

  @Get()
  async listBanners(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      position: query.position,
      status: query.status,
    };
    return firstValueFrom(this.bannerService.ListBanners(req));
  }

  @Get(':id')
  async getBanner(@Param('id') id: string) {
    return firstValueFrom(this.bannerService.GetBanner({ id }));
  }

  @Post()
  async createBanner(@Body() body: any) {
    return firstValueFrom(this.bannerService.CreateBanner(body));
  }

  @Put(':id')
  async updateBanner(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.bannerService.UpdateBanner({ id, ...body }));
  }

  @Delete(':id')
  async deleteBanner(@Param('id') id: string) {
    return firstValueFrom(this.bannerService.DeleteBanner({ id }));
  }
}
