import { Module } from '@nestjs/common';
import { BannersService } from './banners.service';
import { BannersController } from './banners.controller';
import { BannersRepository } from './repositories/banners.repository';

@Module({
    controllers: [BannersController],
    providers: [BannersService, BannersRepository],
    exports: [BannersService],
})
export class BannersModule { }
