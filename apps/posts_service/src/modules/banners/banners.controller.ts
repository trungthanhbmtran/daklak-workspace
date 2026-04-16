import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller()
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @GrpcMethod('BannerService', 'CreateBanner')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBanner(data: any) {
    try {
      const payload = {
        ...data,
        imageUrl: data.imageUrl ?? data.image_url,
        linkType: data.linkType ?? data.link_type,
        customUrl: data.customUrl ?? data.custom_url,
        orderIndex: data.orderIndex ?? data.order_index,
        metaTitle: data.metaTitle ?? data.meta_title,
        metaDescription: data.metaDescription ?? data.meta_description,
        startAt: data.startAt ?? data.start_at,
        endAt: data.endAt ?? data.end_at,
      };
      const result = await this.bannersService.create(payload);
      return { data: result, success: true };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('BannerService', 'GetBanner')
  async getBanner(data: { id: string }) {
    try {
      const banner = await this.bannersService.findById(data.id);
      if (!banner) throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Banner not found' });
      return banner;
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('BannerService', 'ListBanners')
  async listBanners(data: { position?: string }) {
    try {
      const banners = await this.bannersService.findAll(data.position);
      return { 
        data: banners, 
        success: true, 
        message: 'OK' 
      };
    } catch (error: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('BannerService', 'UpdateBanner')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBanner(data: any) {
    try {
      const { id, ...rest } = data;
      if (!id) throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'ID is required' });

      const payload = {
        ...rest,
        imageUrl: rest.imageUrl ?? rest.image_url,
        linkType: rest.linkType ?? rest.link_type,
        customUrl: rest.customUrl ?? rest.custom_url,
        orderIndex: rest.orderIndex ?? rest.order_index,
        metaTitle: rest.metaTitle ?? rest.meta_title,
        metaDescription: rest.metaDescription ?? rest.meta_description,
        startAt: rest.startAt ?? rest.start_at,
        endAt: rest.endAt ?? rest.end_at,
      };
      const result = await this.bannersService.update(id, payload);
      return { data: result, success: true };
    } catch (error: any) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }

  @GrpcMethod('BannerService', 'DeleteBanner')
  async deleteBanner(data: { id: string }) {
    try {
      if (!data.id) throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'ID is required' });
      await this.bannersService.delete(data.id);
      return { success: true };
    } catch (error: any) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: error.message });
    }
  }
}
