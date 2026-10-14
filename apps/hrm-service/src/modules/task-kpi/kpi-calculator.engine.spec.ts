import { KpiCalculatorEngine, DEFAULT_KPI_FORMULA_SETTINGS, KpiFormulaSettings } from './kpi-calculator.engine';

describe('KpiCalculatorEngine - Đánh giá KPI Ban Tổ chức Tỉnh ủy', () => {
  let engine: KpiCalculatorEngine;

  beforeEach(() => {
    engine = new KpiCalculatorEngine();
  });

  describe('1. Kiểm thử Công thức cơ bản (Base Formula Evaluation)', () => {
    it('tính đúng điểm KPI theo công thức chuẩn (C / Q) * W * 100', () => {
      // Q = 10 nhiệm vụ định mức, C = 10 nhiệm vụ hoàn thành, W = 1, D = 0, S = 0
      const vars = { Q: 10, C: 10, W: 1, D: 0, S: 0 };
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        enableQualityScore: false,
        enablePenalty: false,
      };
      const result = engine.evaluateTaskScore(vars, settings);
      expect(result).toBe(100);
    });

    it('tính đúng khi hoàn thành vượt định mức (C > Q)', () => {
      // Q = 8, C = 10, W = 1 => (10 / 8) * 1 * 100 = 125
      const vars = { Q: 8, C: 10, W: 1, D: 0, S: 0 };
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        enableQualityScore: false,
        enablePenalty: false,
      };
      const result = engine.evaluateTaskScore(vars, settings);
      expect(result).toBe(125);
    });

    it('tính đúng khi hoàn thành một phần nhiệm vụ (C < Q)', () => {
      // Q = 10, C = 7.5, W = 1 => 75 điểm
      const vars = { Q: 10, C: 7.5, W: 1, D: 0, S: 0 };
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        enableQualityScore: false,
        enablePenalty: false,
      };
      const result = engine.evaluateTaskScore(vars, settings);
      expect(result).toBe(75);
    });

    it('tính đúng khi hệ số trọng số W = 1.25 (Nhiệm vụ trọng tâm Nghị quyết 18)', () => {
      // Q = 5, C = 5, W = 1.25 => (5/5) * 1.25 * 100 = 125
      const vars = { Q: 5, C: 5, W: 1.25, D: 0, S: 0 };
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        enableQualityScore: false,
        enablePenalty: false,
      };
      const result = engine.evaluateTaskScore(vars, settings);
      expect(result).toBe(125);
    });
  });

  describe('2. Kiểm thử Ma trận trọng số 4 Mảng nghiệp vụ BTCTU', () => {
    it('Mảng Thẩm định cán bộ (DOM_THAM_DINH): Ưu tiên chất lượng (B% = 50%)', () => {
      // Công thức mảng thẩm định: (C / Q) * 50
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        customRules: [
          {
            domainCode: 'DOM_THAM_DINH',
            formula: '(C / Q) * 50',
            name: 'Mảng Thẩm định',
          },
        ],
        enableQualityScore: true,
        qualityWeight: 50, // 50%
        enablePenalty: false,
      };
      // Q = 10, C = 10 (50đ), S = 90 (45đ) => 95đ
      const vars = { Q: 10, C: 10, W: 1, D: 0, S: 90 };
      const result = engine.evaluateTaskScore(vars, settings, 'DOM_THAM_DINH');
      expect(result).toBe(95);
    });

    it('Mảng Văn thư - Lưu trữ (DOM_VAN_THU): Ưu tiên khối lượng xử lý (40%)', () => {
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        customRules: [
          {
            domainCode: 'DOM_VAN_THU',
            formula: '(C / Q) * 60',
            name: 'Mảng Văn thư',
          },
        ],
        enableQualityScore: true,
        qualityWeight: 40,
        enablePenalty: false,
      };
      const vars = { Q: 200, C: 200, W: 1, D: 0, S: 85 };
      // 60 + 85 * 0.4 = 60 + 34 = 94
      const result = engine.evaluateTaskScore(vars, settings, 'DOM_VAN_THU');
      expect(result).toBe(94);
    });

    it('Mảng CNTT & ATTT Cấp độ 3 (DOM_IT_ATTT): Ưu tiên tiến độ & Phạt trễ', () => {
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        customRules: [
          {
            domainCode: 'DOM_IT_ATTT',
            formula: '(C / Q) * 65',
            name: 'Mảng CNTT',
          },
        ],
        enableQualityScore: true,
        qualityWeight: 35,
        enablePenalty: true,
        penaltyPerDay: 3,
      };
      // Q = 15, C = 15 (65đ), S = 90 (31.5đ), D = 1 (trừ 3đ) => 65 + 31.5 - 3 = 93.5
      const vars = { Q: 15, C: 15, W: 1, D: 1, S: 90 };
      const result = engine.evaluateTaskScore(vars, settings, 'DOM_IT_ATTT');
      expect(result).toBe(93.5);
    });
  });

  describe('3. Kiểm thử Khấu trừ điểm trễ hạn (Deadline Penalties)', () => {
    it('trừ điểm chính xác theo số ngày trễ D với penaltyPerDay', () => {
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        enableQualityScore: false,
        enablePenalty: true,
        penaltyPerDay: 2,
      };
      // Trễ 3 ngày => trừ 6 điểm => 100 - 6 = 94
      const vars = { Q: 10, C: 10, W: 1, D: 3, S: 0 };
      const result = engine.evaluateTaskScore(vars, settings);
      expect(result).toBe(94);
    });

    it('không bị trừ điểm khi nhiệm vụ hoàn thành đúng hạn hoặc trước hạn (D = 0)', () => {
      const settings: KpiFormulaSettings = {
        ...DEFAULT_KPI_FORMULA_SETTINGS,
        enableQualityScore: false,
        enablePenalty: true,
        penaltyPerDay: 2,
      };
      const vars = { Q: 10, C: 10, W: 1, D: 0, S: 0 };
      const result = engine.evaluateTaskScore(vars, settings);
      expect(result).toBe(100);
    });
  });

  describe('4. Kiểm thử Bắt lỗi cú pháp & Ngoại lệ (Validation & Error Handling)', () => {
    it('báo lỗi khi chuỗi công thức rỗng', () => {
      const res = engine.validateFormula('');
      expect(res.valid).toBe(false);
      expect(res.error).toBe('Hãy nhập công thức.');
    });

    it('báo lỗi khi công thức chứa ký tự lạ không hợp lệ', () => {
      const res = engine.validateFormula('C * 100 + @invalid');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('không được hỗ trợ');
    });

    it('báo lỗi khi đóng mở ngoặc không khớp', () => {
      const res = engine.validateFormula('(C / Q * 100');
      expect(res.valid).toBe(false);
    });

    it('validateFormula trả về valid: true cho công thức hợp lệ', () => {
      const res = engine.validateFormula('(C / Q) * W * 100');
      expect(res.valid).toBe(true);
    });

    it('validateFormula trả về valid: false khi chia cho 0', () => {
      const res = engine.validateFormula('C / 0');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Không thể chia cho 0');
    });
  });
});
