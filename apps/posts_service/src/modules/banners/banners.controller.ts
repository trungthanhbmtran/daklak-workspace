import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller()
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    @GrpcMethod('BannerService', 'CreateBanner')
    @UsePipes(new ValidationPipe({ transform: true }))
    async createBanner(data: CreateBannerDto) {
        return this.bannersService.create(data);
    }

    @GrpcMethod('BannerService', 'GetBanner')
    async getBanner(data: { id: string }) {
        return this.bannersService.findById(data.id);
    }

    @GrpcMethod('BannerService', 'ListBanners')
    async listBanners(data: { position?: string }) {
        const banners = await this.bannersService.findAll(data.position);
        return { data: banners };
    }

    @GrpcMethod('BannerService', 'UpdateBanner')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateBanner(data: UpdateBannerDto & { id: string }) {
        return this.bannersService.update(data.id, data);
    }

    @GrpcMethod('BannerService', 'DeleteBanner')
    async deleteBanner(data: { id: string }) {
        await this.bannersService.delete(data.id);
        return { success: true };
    }
}
