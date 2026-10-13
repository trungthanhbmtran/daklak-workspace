import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';

@Injectable()
export class TaskCatalogService {
  constructor(private prisma: PrismaService, private cache: AppCacheService) { }

  // --- RANK QUOTAS ---
  async saveRankQuotas(data: any) {
    const { rankCode, domainCode = 'GENERIC', quotas, departmentId, unitCode } = data;
    const deptId = departmentId ? Number(departmentId) : null;
    const deleteWhere: any = { rankCode, domainCode };
    if (deptId != null && deptId > 0) {
      deleteWhere.departmentId = deptId;
    } else {
      deleteWhere.departmentId = null;
    }
    await this.prisma.rankQuota.deleteMany({ where: deleteWhere });
    await this.cache.delete(`${rankCode}_${domainCode}_${deptId ?? 'ALL'}`);
    await this.cache.delete(`${rankCode}_${domainCode}`);

    if (quotas && quotas.length > 0) {
      await this.prisma.rankQuota.createMany({
        data: quotas.map((q: any) => {
          const targetVal = Number(q.targetValue ?? q.monthlyTarget ?? 1);
          const monthly = Number(q.monthlyTarget ?? targetVal);
          const quarterly = Number(q.quarterlyTarget ?? (monthly * 3));
          const yearly = Number(q.yearlyTarget ?? (monthly * 12));
          return {
            rankCode,
            domainCode,
            departmentId: deptId,
            unitCode: unitCode || null,
            taskName: q.taskName,
            unit: q.unit || 'Lượt',
            targetValue: targetVal,
            monthlyTarget: monthly,
            quarterlyTarget: quarterly,
            yearlyTarget: yearly,
            weight: Number(q.weight ?? 1),
          };
        }),
      });
    }

    return {
      success: true,
      message: 'Lưu định biên thành công',
      data: await this.prisma.rankQuota.findMany({ where: deleteWhere }),
    };
  }

  async getRankQuotasByRank(data: any) {
    const { rankCode, domainCode = 'GENERIC', departmentId } = data;
    const deptId = departmentId ? Number(departmentId) : null;
    const cacheKey = `${rankCode}_${domainCode}_${deptId ?? 'ALL'}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    let quotas: any[] = [];
    if (deptId != null && deptId > 0) {
      quotas = await this.prisma.rankQuota.findMany({
        where: { rankCode, domainCode, departmentId: deptId },
      });
    }

    // Nếu bộ phận chưa có định biên riêng, fallback sang định biên mẫu chung theo ngạch (departmentId: null)
    if (!quotas || quotas.length === 0) {
      quotas = await this.prisma.rankQuota.findMany({
        where: { rankCode, domainCode, departmentId: null },
      });
    }

    const normalized = quotas.map((q) => ({
      ...q,
      monthlyTarget: q.monthlyTarget || q.targetValue || 1,
      quarterlyTarget: q.quarterlyTarget || (q.monthlyTarget ? q.monthlyTarget * 3 : q.targetValue * 3),
      yearlyTarget: q.yearlyTarget || (q.monthlyTarget ? q.monthlyTarget * 12 : q.targetValue * 12),
    }));

    const result = { success: true, message: 'Lấy định biên thành công', data: normalized };
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
      meta: {
        pagination: {
          total: templates.length,
          page: 1,
          pageSize: templates.length || 20,
          totalPages: 1
        }
      }
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

  async bulkUpdateTaskTemplates(templates: any[], classification?: string) {
    await this.cache.clear();
    await this.prisma.$transaction(async (tx) => {
      if (classification) {
        await tx.taskRankTemplate.deleteMany({ where: { classification } });
      } else {
        await tx.taskRankTemplate.deleteMany({});
      }
      if (templates && templates.length > 0) {
        await tx.taskRankTemplate.createMany({
          data: templates.map((t: any) => ({
            classification: t.classification || classification,
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
