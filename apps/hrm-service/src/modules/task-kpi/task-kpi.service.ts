import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AppCacheService } from '../../core/cache/app-cache.service';
import { KpiCalculatorEngine, KpiFormulaSettings, KpiVariables, SYSTEM_VARIABLES } from './kpi-calculator.engine';

@Injectable()
export class TaskKpiService {
  private readonly SETTINGS_CACHE_KEY = 'SYSTEM_KPI_FORMULA_SETTINGS';

  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
    private kpiEngine: KpiCalculatorEngine
  ) {}

  async upsertTaskKpiSetting(data: any) {
    // Lưu cấu hình xuống cache để dùng chung cho toàn bộ hệ thống
    const settings: KpiFormulaSettings = {
      baseFormula: data.baseFormula || '(C / Q) * W * 100',
      enableQualityScore: data.enableQualityScore ?? true,
      qualityWeight: data.qualityWeight || 30,
      enablePenalty: data.enablePenalty ?? true,
      penaltyPerDay: data.penaltyPerDay || 2,
      customRules: data.customRules || []
    };

    await this.cache.set(this.SETTINGS_CACHE_KEY, settings);
    return { success: true, message: 'Lưu cấu hình công thức KPI thành công', data: settings };
  }

  async getTaskKpiSetting() {
    let settings = await this.cache.get<KpiFormulaSettings>(this.SETTINGS_CACHE_KEY);
    if (!settings) {
      settings = {
        baseFormula: '(C / Q) * W * 100',
        enableQualityScore: true,
        qualityWeight: 30,
        enablePenalty: true,
        penaltyPerDay: 2,
        customRules: []
      };
    }
    return { success: true, data: settings };
  }

  async getSystemVariables() {
    return { success: true, data: SYSTEM_VARIABLES };
  }

  /**
   * Endpoint để test công thức với dữ liệu mẫu (hoặc dùng sau này để batch processing)
   */
  async evaluateKpiScore(variables: KpiVariables, domainCode?: string) {
    const { data: settings } = await this.getTaskKpiSetting();
    const score = this.kpiEngine.evaluateTaskScore(variables, settings as KpiFormulaSettings, domainCode);
    return { success: true, score };
  }
}
