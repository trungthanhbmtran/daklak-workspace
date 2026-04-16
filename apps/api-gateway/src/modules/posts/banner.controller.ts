import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Lấy danh sách banner' })
  @ApiResponse({ status: 200, description: 'Danh sách banner và thông tin phân trang' })
  async listBanners(@Query() query: any) {
    try {
      const req = {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 10,
        search: query.search,
        position: query.position,
        status: query.status !== undefined ? query.status === 'true' : undefined,
      };
      return await firstValueFrom(this.bannerService.ListBanners(req));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết banner theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết banner' })
  async getBanner(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.bannerService.GetBanner({ id }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo banner mới' })
  @ApiResponse({ status: 201, description: 'Banner đã được tạo thành công' })
  async createBanner(@Body() body: any) {
    try {
      return await firstValueFrom(this.bannerService.CreateBanner(body));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật banner' })
  @ApiResponse({ status: 200, description: 'Banner đã được cập nhật thành công' })
  async updateBanner(@Param('id') id: string, @Body() body: any) {
    try {
      return await firstValueFrom(this.bannerService.UpdateBanner({ id, ...body }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa banner' })
  @ApiResponse({ status: 200, description: 'Banner đã được xóa thành công' })
  async deleteBanner(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.bannerService.DeleteBanner({ id }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    const message = error.details || error.message || 'Internal Server Error';
    if (error.code === 3) throw new BadRequestException(message);
    if (error.code === 5) throw new NotFoundException(message);
    throw new BadRequestException(message);
  }
}
