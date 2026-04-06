import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { BannersRepository } from './repositories/banners.repository';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from '@generated/prisma/client';

@Injectable()
export class BannersService {
    constructor(private readonly bannersRepository: BannersRepository) { }

    async create(data: CreateBannerDto): Promise<Banner> {
        const createData = {
            ...data,
            startAt: data.startAt ? new Date(data.startAt) : undefined,
            endAt: data.endAt ? new Date(data.endAt) : undefined,
        };
        return this.bannersRepository.create(createData as any);
    }

    async findById(id: string): Promise<Banner> {
        const banner = await this.bannersRepository.findById(id);
        if (!banner) {
            throw new RpcException({ code: 5, message: 'Banner not found' });
        }
        return banner;
    }

    async update(id: string, data: UpdateBannerDto): Promise<Banner> {
        await this.findById(id); // Check existence
        const updateData = {
            ...data,
            startAt: data.startAt ? new Date(data.startAt) : undefined,
            endAt: data.endAt ? new Date(data.endAt) : undefined,
        };
        return this.bannersRepository.update(id, updateData as any);
    }

    async delete(id: string): Promise<Banner> {
        await this.findById(id); // Check existence
        return this.bannersRepository.delete(id);
    }

    async findAll(position?: string): Promise<Banner[]> {
        return this.bannersRepository.findActiveByPosition(position);
    }
}
