import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { BannersRepository } from './repositories/banners.repository';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from '@generated/prisma/client';

@Injectable()
export class BannersService {
  constructor(private readonly bannersRepository: BannersRepository) {}

  private ensureDate(d: any) {
    if (!d) return undefined;
    const date = new Date(d);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private formatBanner(banner: any) {
    if (!banner) return null;
    return {
      ...banner,
      title: banner.name, // Keep for compatibility
      startAt:
        banner.startAt instanceof Date
          ? banner.startAt.toISOString()
          : banner.startAt,
      endAt:
        banner.endAt instanceof Date
          ? banner.endAt.toISOString()
          : banner.endAt,
      createdAt:
        banner.createdAt instanceof Date
          ? banner.createdAt.toISOString()
          : banner.createdAt,
      updatedAt:
        banner.updatedAt instanceof Date
          ? banner.updatedAt.toISOString()
          : banner.updatedAt,
    };
  }

  async create(data: CreateBannerDto): Promise<any> {
    try {
      const createData = {
        ...data,
        startAt: this.ensureDate(data.startAt),
        endAt: this.ensureDate(data.endAt),
      };
      const banner = await this.bannersRepository.create(createData as any);
      return {
        success: true,
        message: 'Tạo banner thành công',
        data: this.formatBanner(banner),
      };
    } catch (error) {
      throw new RpcException({
        code: 13,
        message: `Lỗi tạo banner: ${error.message}`,
      });
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const banner = await this.bannersRepository.findById(id);
      if (!banner) {
        throw new RpcException({ code: 5, message: 'Banner không tìm thấy' });
      }
      return this.formatBanner(banner);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: 13,
        message: `Lỗi truy vấn banner: ${error.message}`,
      });
    }
  }

  async update(id: string, data: UpdateBannerDto): Promise<any> {
    try {
      await this.findById(id); // Check existence
      const updateData = {
        ...data,
        startAt: this.ensureDate(data.startAt),
        endAt: this.ensureDate(data.endAt),
      };
      const updated = await this.bannersRepository.update(
        id,
        updateData as any,
      );
      return {
        success: true,
        message: 'Cập nhật banner thành công',
        data: this.formatBanner(updated),
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: 13,
        message: `Lỗi cập nhật banner: ${error.message}`,
      });
    }
  }

  async delete(id: string): Promise<any> {
    try {
      await this.findById(id); // Check existence
      const deleted = await this.bannersRepository.delete(id);
      return { success: true, data: this.formatBanner(deleted) };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: 13,
        message: `Lỗi xóa banner: ${error.message}`,
      });
    }
  }

  async findAll(position?: string): Promise<any> {
    try {
      const banners =
        await this.bannersRepository.findActiveByPosition(position);
      return (banners || []).map((banner) => this.formatBanner(banner));
    } catch (error) {
      throw new RpcException({
        code: 13,
        message: `Lỗi lấy danh sách banner: ${error.message}`,
      });
    }
  }
}
