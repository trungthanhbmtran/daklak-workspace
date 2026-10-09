import { Injectable, Logger } from '@nestjs/common';

export interface KpiVariables {
  Q: number; // Định mức (Quota)
  C: number; // Hoàn thành (Completed)
  W: number; // Trọng số (Weight)
  D: number; // Thời gian trễ (Delay)
  S: number; // Điểm đánh giá chất lượng (Score)
}

export interface KpiFormulaSettings {
  baseFormula: string;
  enableQualityScore: boolean;
  qualityWeight: number;
  enablePenalty: boolean;
  penaltyPerDay: number;
  customRules: Array<{
    domainCode: string;
    formula: string;
  }>;
}

export const SYSTEM_VARIABLES = [
  { code: 'Q', name: 'Định mức (Quota)', description: 'Số lượng chỉ tiêu bắt buộc theo vị trí việc làm' },
  { code: 'C', name: 'Hoàn thành (Completed)', description: 'Số lượng nhiệm vụ đã hoàn thành thực tế' },
  { code: 'W', name: 'Trọng số (Weight)', description: 'Mức độ quan trọng của nhóm nhiệm vụ' },
  { code: 'D', name: 'Thời gian trễ (Delay)', description: 'Tổng số ngày trễ hạn' },
  { code: 'S', name: 'Điểm đánh giá (Score)', description: 'Điểm chất lượng do cấp trên chấm' }
];

@Injectable()
export class KpiCalculatorEngine {
  private readonly logger = new Logger(KpiCalculatorEngine.name);

  /**
   * Tính toán điểm KPI dựa trên bộ dữ liệu thực tế và cấu hình công thức động.
   * Đây là Core Engine xử lý toán học an toàn.
   */
  public evaluateTaskScore(variables: KpiVariables, settings: KpiFormulaSettings, domainCode: string = 'GENERIC'): number {
    try {
      // 1. Xác định công thức sẽ sử dụng (Ưu tiên công thức ghi đè theo domain, nếu không có thì dùng base)
      let rawFormula = settings.baseFormula;
      if (settings.customRules && settings.customRules.length > 0) {
        const customRule = settings.customRules.find(r => r.domainCode === domainCode);
        if (customRule && customRule.formula.trim() !== '') {
          rawFormula = customRule.formula;
        }
      }

      // 2. Chống lỗi chia cho 0 (ZeroDivisionError)
      const safeVariables = { ...variables };
      if (safeVariables.Q === 0) {
        safeVariables.Q = 1; // Mặc định Quota = 1 nếu không có định mức để tránh NaN
      }

      // 3. Xử lý tính toán công thức Core
      let finalScore = this.safeEval(rawFormula, safeVariables);

      // 4. Áp dụng các Plugin / Chế độ cộng thêm nếu bật (Chất lượng / Trễ hạn)
      
      // 4.1 Điểm trừ trễ hạn (Penalty)
      if (settings.enablePenalty && safeVariables.D > 0) {
        const penaltyScore = safeVariables.D * (settings.penaltyPerDay || 0);
        finalScore -= penaltyScore;
      }

      // 4.2 Điểm chất lượng (Quality Score)
      if (settings.enableQualityScore && safeVariables.S > 0) {
        const qualityBonus = safeVariables.S * ((settings.qualityWeight || 0) / 100);
        finalScore += qualityBonus;
      }

      // 5. Đảm bảo điểm không bị âm vô lý (tùy vào rule của tổ chức, ở đây lấy max là 0)
      return Math.max(0, Number(finalScore.toFixed(2)));

    } catch (error) {
      this.logger.error(`Lỗi tính toán KPI: ${error.message}. Công thức: ${settings.baseFormula}`, error.stack);
      return 0;
    }
  }

  /**
   * Trình phân tích & thực thi công thức toán học an toàn.
   * Chỉ cho phép các biến Q, C, W, D, S và các toán tử cơ bản.
   */
  private safeEval(formula: string, variables: KpiVariables): number {
    // Tiền xử lý: Loại bỏ tất cả ký tự không hợp lệ (Bảo mật chống Injection)
    // Chỉ cho phép: Số, chữ cái biến (Q,C,W,D,S), khoảng trắng, toán tử (+-*/().)
    const sanitizedFormula = formula.replace(/[^0-9QCWDS+\-*/(). ]/g, '');

    // Thay thế các biến bằng giá trị thực tế
    let executableString = sanitizedFormula
      .replace(/Q/g, `(${variables.Q})`)
      .replace(/C/g, `(${variables.C})`)
      .replace(/W/g, `(${variables.W})`)
      .replace(/D/g, `(${variables.D})`)
      .replace(/S/g, `(${variables.S})`);

    // Thực thi chuỗi toán học an toàn bằng JS Function (đã bị sanitize trước đó)
    // eslint-disable-next-line no-new-func
    const evaluator = new Function(`"use strict"; return (${executableString});`);
    const result = evaluator();

    return Number.isFinite(result) ? result : 0;
  }
}
