import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';
import {
  DEFAULT_KPI_FORMULA_SETTINGS,
  KpiCalculatorEngine,
  KpiFormulaSettings,
  KpiVariables,
  SYSTEM_VARIABLES,
} from './kpi-calculator.engine';

@Injectable()
export class TaskKpiService {
  private readonly SETTINGS_CACHE_KEY = 'SYSTEM_KPI_FORMULA_SETTINGS';
  private readonly CACHE_TTL_MS = 30_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: AppCacheService,
    private readonly kpiEngine: KpiCalculatorEngine,
  ) {}

  private normalizeSettings(data: any): KpiFormulaSettings {
    const settings: KpiFormulaSettings = {
      baseFormula: String(data?.baseFormula ?? DEFAULT_KPI_FORMULA_SETTINGS.baseFormula).trim(),
      enableQualityScore: data?.enableQualityScore ?? DEFAULT_KPI_FORMULA_SETTINGS.enableQualityScore,
      qualityWeight: Number(data?.qualityWeight ?? DEFAULT_KPI_FORMULA_SETTINGS.qualityWeight),
      enablePenalty: data?.enablePenalty ?? DEFAULT_KPI_FORMULA_SETTINGS.enablePenalty,
      penaltyPerDay: Number(data?.penaltyPerDay ?? DEFAULT_KPI_FORMULA_SETTINGS.penaltyPerDay),
      customRules: Array.isArray(data?.customRules) ? data.customRules.map((rule: any) => ({
        name: String(rule?.name || '').trim(),
        domainCode: String(rule?.domainCode || '').trim().toUpperCase(),
        formula: String(rule?.formula || '').trim(),
      })) : [],
    };

    if (!Number.isFinite(settings.qualityWeight) || settings.qualityWeight < 0 || settings.qualityWeight > 100) {
      throw new RpcException({ code: 3, message: 'Tỷ trọng chất lượng phải nằm trong khoảng 0–100%.' });
    }
    if (!Number.isFinite(settings.penaltyPerDay) || settings.penaltyPerDay < 0 || settings.penaltyPerDay > 1000) {
      throw new RpcException({ code: 3, message: 'Điểm trừ mỗi ngày phải là số từ 0 đến 1000.' });
    }
    const baseValidation = this.kpiEngine.validateFormula(settings.baseFormula);
    if (!baseValidation.valid) throw new RpcException({ code: 3, message: `Công thức chung: ${baseValidation.error}` });

    const seenDomains = new Set<string>();
    for (const rule of settings.customRules) {
      if (!/^[A-Z][A-Z0-9_-]{0,49}$/.test(rule.domainCode)) {
        throw new RpcException({ code: 3, message: 'Mã nhóm ngoại lệ chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.' });
      }
      if (seenDomains.has(rule.domainCode)) {
        throw new RpcException({ code: 3, message: `Mã nhóm ${rule.domainCode} đang được khai báo nhiều lần.` });
      }
      seenDomains.add(rule.domainCode);
      const validation = this.kpiEngine.validateFormula(rule.formula);
      if (!validation.valid) throw new RpcException({ code: 3, message: `Công thức ${rule.name || rule.domainCode}: ${validation.error}` });
    }
    return settings;
  }

  async upsertTaskKpiSetting(data: any) {
    const settings = this.normalizeSettings(data);
    const organizationId = 'DEFAULT';
    const current = await this.prisma.kpiFormulaConfig.findUnique({ where: { organizationId } });
    const version = (current?.version || 0) + 1;
    const changedBy = data?.changedBy ? String(data.changedBy) : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.kpiFormulaConfig.upsert({
        where: { organizationId },
        create: { organizationId, version, settings: settings as any, updatedBy: changedBy },
        update: { version, settings: settings as any, updatedBy: changedBy },
      });
      await tx.kpiFormulaConfigVersion.create({
        data: { organizationId, version, settings: settings as any, changedBy },
      });
    });
    await this.cache.set(this.SETTINGS_CACHE_KEY, settings, this.CACHE_TTL_MS);
    return { success: true, message: 'Đã lưu cấu hình công thức KPI', data: { ...settings, version } };
  }

  async getTaskKpiSetting() {
    const cached = await this.cache.get<KpiFormulaSettings & { version?: number }>(this.SETTINGS_CACHE_KEY);
    if (cached) return { success: true, data: cached };

    const persisted = await this.prisma.kpiFormulaConfig.findUnique({ where: { organizationId: 'DEFAULT' } });
    const settings = persisted
      ? { ...(persisted.settings as unknown as KpiFormulaSettings), version: persisted.version }
      : { ...DEFAULT_KPI_FORMULA_SETTINGS, customRules: [] };
    await this.cache.set(this.SETTINGS_CACHE_KEY, settings, this.CACHE_TTL_MS);
    return { success: true, data: settings };
  }

  async getSystemVariables() {
    return { success: true, data: SYSTEM_VARIABLES };
  }

  async listSettingsVersions() {
    const versions = await this.prisma.kpiFormulaConfigVersion.findMany({
      where: { organizationId: 'DEFAULT' },
      orderBy: { version: 'desc' },
      take: 20,
    });
    return {
      success: true,
      data: versions.map((item) => ({
        version: item.version,
        settingsJson: JSON.stringify(item.settings),
        changedBy: item.changedBy || '',
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  previewFormula(payload: { settings?: any; variables?: Partial<KpiVariables>; domainCode?: string }) {
    try {
      const settings = this.normalizeSettings(payload.settings || DEFAULT_KPI_FORMULA_SETTINGS);
      const variables: KpiVariables = {
        Q: Number(payload.variables?.Q ?? 10),
        C: Number(payload.variables?.C ?? 8),
        W: Number(payload.variables?.W ?? 1),
        D: Number(payload.variables?.D ?? 2),
        S: Number(payload.variables?.S ?? 80),
      };
      const score = this.kpiEngine.evaluateTaskScore(variables, settings, payload.domainCode || 'GENERIC');
      return { success: true, valid: true, score, variables };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tính thử công thức.';
      return { success: true, valid: false, error: message };
    }
  }

  async evaluateKpiScore(variables: KpiVariables, domainCode?: string) {
    const { data: settings } = await this.getTaskKpiSetting();
    const score = this.kpiEngine.evaluateTaskScore(variables, settings as KpiFormulaSettings, domainCode);
    return { success: true, score };
  }

  evaluateTaskScore(variables: KpiVariables, settings: KpiFormulaSettings, domainCode: string) {
    return this.kpiEngine.evaluateTaskScore(variables, settings, domainCode);
  }
}
