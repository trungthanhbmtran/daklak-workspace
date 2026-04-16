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
  async createBanner(data: CreateBannerDto) {
    try {
      const result = await this.bannersService.create(data);
      return result; // Result already contains { data, success, message }
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('BannerService', 'GetBanner')
  async getBanner(data: { id: string }) {
    try {
      const banner = await this.bannersService.findById(data.id);
      return { data: banner };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('BannerService', 'ListBanners')
  async listBanners(data: { position?: string }) {
    try {
      const banners = await this.bannersService.findAll(data.position);
      return {
        data: banners,
        success: true,
      };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('BannerService', 'UpdateBanner')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBanner(data: UpdateBannerDto & { id: string }) {
    try {
      const { id, ...rest } = data;
      if (!id)
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: 'ID is required',
        });

      const result = await this.bannersService.update(id, rest);
      return result;
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('BannerService', 'DeleteBanner')
  async deleteBanner(data: { id: string }) {
    try {
      if (!data.id)
        throw new RpcException({
          code: GrpcStatus.INVALID_ARGUMENT,
          message: 'ID is required',
        });
      await this.bannersService.delete(data.id);
      return { success: true };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
