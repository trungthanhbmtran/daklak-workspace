import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';

@Injectable()
export class TaskCatalogService {
  constructor(private prisma: PrismaService, private cache: AppCacheService) { }

  // --- RANK QUOTAS ---
  async saveRankQuotas(data: any) {
    const { rankCode, domainCode = 'GENERIC', quotas } = data;
    await this.prisma.rankQuota.deleteMany({ where: { rankCode, domainCode } });
    await this.cache.delete(rankCode + '_' + domainCode);

    if (quotas && quotas.length > 0) {
      await this.prisma.rankQuota.createMany({
        data: quotas.map((q: any) => ({
          rankCode,
          domainCode,
          taskName: q.taskName,
          unit: q.unit,
          targetValue: q.targetValue,
          weight: q.weight
        }))
      });
    }

    return {
      success: true,
      message: 'Lưu định biên thành công',
      data: await this.prisma.rankQuota.findMany({ where: { rankCode, domainCode } })
    };
  }

  async getRankQuotasByRank(data: any) {
    const { rankCode, domainCode = 'GENERIC' } = data;
    const cacheKey = `${rankCode}_${domainCode}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const quotas = await this.prisma.rankQuota.findMany({ where: { rankCode, domainCode } });
    const result = { success: true, message: 'Lấy định biên thành công', data: quotas };
    await this.cache.set(cacheKey, result);
    return result;
  }

  // --- TASK TEMPLATES ---
  async findTaskTemplates(query: any) {
    const cacheKey = JSON.stringify(query);
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const where: any = {};
    if (query.classification) where.classification = query.classification;
    if (query.rank) where.rank = query.rank;

    const templates = await this.prisma.taskRankTemplate.findMany({
      where, orderBy: { createdAt: 'desc' },
    });

    const result = {
      success: true,
      message: 'Lấy danh sách nhiệm vụ mẫu thành công',
      data: templates,
      meta: { pagination: { total: templates.length, page: 1, pageSize: templates.length, totalPages: 1 } }
    };
    await this.cache.set(cacheKey, result);
    return result;
  }

  async createTaskTemplate(data: any) {
    await this.cache.clear();
    const t = await this.prisma.taskRankTemplate.create({
      data: {
        classification: data.classification,
        rank: data.rank,
        taskName: data.taskName,
        defaultUnit: data.defaultUnit,
        defaultWeight: data.defaultWeight,
      }
    });
    return { success: true, message: 'Thêm thành công', data: t };
  }

  async updateTaskTemplate(id: number, data: any) {
    await this.cache.clear();
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
    return { success: true, message: 'Cập nhật thành công', data: t };
  }

  async deleteTaskTemplate(id: number) {
    await this.cache.clear();
    await this.prisma.taskRankTemplate.delete({ where: { id } });
    return { success: true, message: 'Xóa thành công' };
  }

  async bulkUpdateTaskTemplates(templates: any[]) {
    await this.cache.clear();
    await this.prisma.$transaction(async (tx) => {
      await tx.taskRankTemplate.deleteMany({});
      if (templates && templates.length > 0) {
        await tx.taskRankTemplate.createMany({
          data: templates.map((t: any) => ({
            classification: t.classification,
            rank: t.rank,
            taskName: t.taskName,
            defaultUnit: t.defaultUnit,
            defaultWeight: t.defaultWeight,
          }))
        });
      }
    });
    return { success: true, message: 'Cập nhật thư viện thành công' };
  }
}
