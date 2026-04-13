import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { BannersRepository } from './repositories/banners.repository';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from '@generated/prisma/client';

@Injectable()
export class BannersService {
  constructor(private readonly bannersRepository: BannersRepository) {}

  async create(data: CreateBannerDto): Promise<any> {
    const createData = {
      ...data,
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
    };
    const banner = await this.bannersRepository.create(createData as any);
    return {
      success: true,
      message: 'Tạo banner thành công',
      data: {
        ...banner,
        startAt: banner.startAt?.toISOString(),
        endAt: banner.endAt?.toISOString(),
        createdAt: banner.createdAt?.toISOString(),
        updatedAt: banner.updatedAt?.toISOString(),
      },
    };
  }

  async findById(id: string): Promise<any> {
    const banner = await this.bannersRepository.findById(id);
    if (!banner) {
      throw new RpcException({ code: 5, message: 'Banner not found' });
    }
    return {
      ...banner,
      startAt: banner.startAt?.toISOString(),
      endAt: banner.endAt?.toISOString(),
      createdAt: banner.createdAt?.toISOString(),
      updatedAt: banner.updatedAt?.toISOString(),
    };
  }

  async update(id: string, data: UpdateBannerDto): Promise<any> {
    await this.findById(id); // Check existence
    const updateData = {
      ...data,
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
    };
    const updated = await this.bannersRepository.update(id, updateData as any);
    return {
      success: true,
      message: 'Cập nhật banner thành công',
      data: {
        ...updated,
        startAt: updated.startAt?.toISOString(),
        endAt: updated.endAt?.toISOString(),
        createdAt: updated.createdAt?.toISOString(),
        updatedAt: updated.updatedAt?.toISOString(),
      },
    };
  }

  async delete(id: string): Promise<Banner> {
    await this.findById(id); // Check existence
    return this.bannersRepository.delete(id);
  }

  async findAll(position?: string): Promise<any> {
    const banners = await this.bannersRepository.findActiveByPosition(position);
    return banners.map((banner) => ({
      ...banner,
      startAt: banner.startAt?.toISOString(),
      endAt: banner.endAt?.toISOString(),
      createdAt: banner.createdAt?.toISOString(),
      updatedAt: banner.updatedAt?.toISOString(),
    }));
  }
}
