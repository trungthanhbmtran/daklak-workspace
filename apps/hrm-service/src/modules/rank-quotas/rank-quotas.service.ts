import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RankQuotasService {
  private cache = new Map<string, { data: any, expiresAt: number }>();
  private readonly CACHE_TTL_MS = 3600 * 1000; // 1 hour

  constructor(private prisma: PrismaService) { }

  async SaveRankQuotas(data: any) {
    const { rankCode, domainCode = 'GENERIC', quotas } = data;

    // Xóa định biên cũ của ngạch và chuyên ngành này
    await this.prisma.rankQuota.deleteMany({
      where: { rankCode, domainCode }
    });
    
    // Xóa cache
    this.cache.delete(rankCode);

    // Thêm định biên mới
    if (quotas && quotas.length > 0) {
      await this.prisma.rankQuota.createMany({
        data: quotas.map(q => ({
          rankCode,
          domainCode,
          taskName: q.taskName,
          unit: q.unit,
          targetValue: q.targetValue,
          weight: q.weight
        }))
      });
    }

    const savedQuotas = await this.prisma.rankQuota.findMany({
      where: { rankCode, domainCode }
    });

    return {
      success: true,
      message: 'Lưu định biên thành công',
      data: savedQuotas
    };
  }

  async GetRankQuotasByRank(data: any) {
    const { rankCode, domainCode = 'GENERIC' } = data;
    
    const cacheKey = `${rankCode}_${domainCode}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const quotas = await this.prisma.rankQuota.findMany({
      where: { rankCode, domainCode }
    });

    const result = {
      success: true,
      message: 'Lấy định biên thành công',
      data: quotas
    };
    
    this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.CACHE_TTL_MS });
    return result;
  }
}
