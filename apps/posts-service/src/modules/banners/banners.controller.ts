import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BannersService } from './banners.service';

@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @GrpcMethod('BannerService', 'CreateBanner')
  async createBanner(data: any) {
    const result = await this.bannersService.create(data);
    return { data: result, success: true };
  }

  @GrpcMethod('BannerService', 'GetBanner')
  async getBanner(data: { id: string }) {
    const result = await this.bannersService.findOne(data.id);
    return result;
  }

  @GrpcMethod('BannerService', 'ListBanners')
  async listBanners(query: any) {
    const { items, total } = await this.bannersService.findAll(query);
    return {
      data: items,
      meta: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
      },
      success: true
    };
  }

  @GrpcMethod('BannerService', 'UpdateBanner')
  async updateBanner(data: any) {
    const { id, ...rest } = data;
    const result = await this.bannersService.update(id, rest);
    return { data: result, success: true };
  }

  @GrpcMethod('BannerService', 'DeleteBanner')
  async deleteBanner(data: { id: string }) {
    await this.bannersService.remove(data.id);
    return { success: true };
  }
}
