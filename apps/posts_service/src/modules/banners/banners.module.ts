import { Module } from '@nestjs/common';
import { BannerService } from './banners.service';
import { BannersController } from './banners.controller';

@Module({
    controllers: [BannersController],
    providers: [BannerService],
    exports: [BannerService],
})
export class BannersModule { }
