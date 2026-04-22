import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { BannersService } from './banners.service';
import { status } from '@grpc/grpc-js';

@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @GrpcMethod('BannerService', 'CreateBanner')
  async createBanner(data: any) {
    const result = await this.bannersService.create(data);
    return { data: result, success: true };
  }

  @GrpcMethod('BannerService', 'GetBanner')
  async getBanner(data: { id: string }) {
    const result = await this.bannersService.findOne(data.id);
    if (!result) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Banner with ID ${data.id} not found`,
      });
    }
    return result;
  }

  @GrpcMethod('BannerService', 'ListBanners')
  async listBanners(query: any) {
    const { items, total } = await this.bannersService.findAll(query);
    
    // Aligned with common.PaginationMeta proto
    const pageSize = Number(query.limit) || 10;
    const currentPage = Number(query.page) || 1;
    
    return {
      data: items || [],
      meta: {
        pagination: {
          total: total || 0,
          page: currentPage,
          pageSize: pageSize,
          totalPages: Math.ceil((total || 0) / pageSize),
        }
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
