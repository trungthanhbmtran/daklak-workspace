import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { BannerService } from './banners.service';

@Controller()
export class BannersController {
    constructor(private readonly bannerService: BannerService) { }

    @GrpcMethod('BannerService', 'CreateBanner')
    async createBanner(data: any) {
        const banner = await this.bannerService.create(data);
        return { success: true, data: banner };
    }

    @GrpcMethod('BannerService', 'ListBanners')
    async listBanners(data: any) {
        return this.bannerService.findAll(data);
    }

    @GrpcMethod('BannerService', 'GetBanner')
    async getBanner(data: { id: string }) {
        const banner = await this.bannerService.findById(data.id);
        return { success: true, data: banner };
    }

    @GrpcMethod('BannerService', 'UpdateBanner')
    async updateBanner(data: any) {
        const banner = await this.bannerService.update(data.id, data);
        return { success: true, data: banner };
    }

    @GrpcMethod('BannerService', 'DeleteBanner')
    async deleteBanner(data: { id: string }) {
        await this.bannerService.delete(data.id);
        return { success: true };
    }
}
