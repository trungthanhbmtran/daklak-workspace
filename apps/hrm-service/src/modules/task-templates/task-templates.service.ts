import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskTemplatesService {
  private cache = new Map<string, { data: any, expiresAt: number }>();
  private readonly CACHE_TTL_MS = 3600 * 1000; // 1 hour

  constructor(private prisma: PrismaService) { }

  async findAll(query: any) {
    const cacheKey = JSON.stringify(query);
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const where: any = {};
    if (query.classification) where.classification = query.classification;
    if (query.rank) where.rank = query.rank;

    const templates = await this.prisma.taskRankTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const result = {
      success: true,
      message: 'Lấy danh sách nhiệm vụ mẫu thành công',
      data: templates.map(t => ({
        ...t,
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      })),
      meta: {
        pagination: {
          total: templates.length,
          page: 1,
          pageSize: templates.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    };

    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
    return result;
  }

  async create(data: any) {
    this.cache.clear();
    const t = await this.prisma.taskRankTemplate.create({
      data: {
        classification: data.classification,
        rank: data.rank,
        taskName: data.taskName,
        defaultUnit: data.defaultUnit,
        defaultWeight: data.defaultWeight,
      }
    });
    return {
      success: true,
      message: 'Thêm nhiệm vụ mẫu thành công',
      data: {
        ...t,
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      }
    };
  }

  async bulkUpdate(templates: any[]) {
    this.cache.clear();
    // Để an toàn, chúng ta có thể xóa hết template hiện tại và tạo lại.
    // Vì bảng này chỉ chứa cấu hình mẫu, không ảnh hưởng dữ liệu transaction.
    await this.prisma.$transaction(async (tx) => {
      await tx.taskRankTemplate.deleteMany({});
      if (templates.length > 0) {
        await tx.taskRankTemplate.createMany({
          data: templates.map(t => ({
            classification: t.classification,
            rank: t.rank,
            taskName: t.taskName,
            defaultUnit: t.defaultUnit,
            defaultWeight: t.defaultWeight,
          }))
        });
      }
    });

    return {
      success: true,
      message: 'Cập nhật thư viện định biên thành công',
    };
  }

  async update(id: number, data: any) {
    this.cache.clear();
    const t = await this.prisma.taskRankTemplate.update({
      where: { id },
      data: {
        classification: data.classification,
        rank: data.rank,
        taskName: data.taskName,
        defaultUnit: data.defaultUnit,
        defaultWeight: data.defaultWeight,
      }
    });
    return {
      success: true,
      message: 'Cập nhật nhiệm vụ mẫu thành công',
      data: {
        ...t,
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      }
    };
  }

  async delete(id: number) {
    this.cache.clear();
    await this.prisma.taskRankTemplate.delete({ where: { id } });
    return { success: true, message: 'Xóa nhiệm vụ mẫu thành công' };
  }
}
