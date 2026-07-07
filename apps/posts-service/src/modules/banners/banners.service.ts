import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { paginateArray } from '@/utils/pagination.util';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    const formattedData = this.formatBannerData(data);
    return this.prisma.banner.create({
      data: formattedData,
    });
  }

  async findOne(id: string) {
    return this.prisma.banner.findUnique({
      where: { id },
    });
  }

  async findAll(query: any) {
    const { search, position, status } = query;
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (position) where.position = position;
    if (status === true) where.status = true;
    // Note: We skip status = false default from gRPC to show all banners unless explicitly filtered

    const allItems = await this.prisma.banner.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
    });

    const paginated = paginateArray(allItems, page, limit);

    return { items: paginated.data, total: paginated.meta.pagination.total };
  }

  async update(id: string, data: any) {
    const formattedData = this.formatBannerData(data);
    return this.prisma.banner.update({
      where: { id },
      data: formattedData,
    });
  }

  async remove(id: string) {
    return this.prisma.banner.delete({
      where: { id },
    });
  }

  private formatBannerData(data: any) {
    const { startAt, endAt, name, slug, ...rest } = data;

    const formatted: any = {
      ...rest,
      name,
      slug: slug || name?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || `banner-${Date.now()}`,
    };

    if (startAt && startAt !== '') {
      formatted.startAt = new Date(startAt);
    } else {
      formatted.startAt = null;
    }

    if (endAt && endAt !== '') {
      formatted.endAt = new Date(endAt);
    } else {
      formatted.endAt = null;
    }

    // Ensure numeric fields are correctly typed
    if (formatted.orderIndex !== undefined) {
      formatted.orderIndex = Number(formatted.orderIndex);
    }

    return formatted;
  }
}
