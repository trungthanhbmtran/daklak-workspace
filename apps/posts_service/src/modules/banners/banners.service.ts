import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { BannersRepository } from './repositories/banners.repository';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { Banner } from '@generated/prisma/client';

@Injectable()
export class BannersService {
  constructor(private readonly bannersRepository: BannersRepository) {}

  private ensureDate(d: string | Date | undefined): Date | undefined {
    if (!d) return undefined;
    const date = new Date(d);
    return isNaN(date.getTime()) ? undefined : date;
  }

  private formatBanner(banner: Banner) {
    if (!banner) return null;
    return {
      ...banner,
      startAt: banner.startAt?.toISOString(),
      endAt: banner.endAt?.toISOString(),
      createdAt: banner.createdAt.toISOString(),
      updatedAt: banner.updatedAt.toISOString(),
    };
  }

  async create(data: CreateBannerDto) {
    try {
      const createData = {
        ...data,
        startAt: this.ensureDate(data.startAt),
        endAt: this.ensureDate(data.endAt),
      };
      const banner = await this.bannersRepository.create(
        createData as CreateBannerDto,
      );
      return {
        success: true,
        data: this.formatBanner(banner),
      };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  async findById(id: string) {
    try {
      const banner = await this.bannersRepository.findById(id);
      if (!banner) {
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Banner not found',
        });
      }
      return this.formatBanner(banner);
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  async update(id: string, data: UpdateBannerDto) {
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
        data: this.formatBanner(updated),
      };
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  async delete(id: string) {
    try {
      const deleted = await this.bannersRepository.delete(id);
      return { success: true, data: this.formatBanner(deleted) };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  async findAll(position?: string) {
    try {
      const banners =
        await this.bannersRepository.findActiveByPosition(position);
      return banners.map((banner) => this.formatBanner(banner));
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
