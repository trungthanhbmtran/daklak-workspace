import { Injectable } from '@nestjs/common';

export interface KpiVariables {
  Q: number;
  C: number;
  W: number;
  D: number;
  S: number;
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
    name?: string;
  }>;
}

export const DEFAULT_KPI_FORMULA_SETTINGS: KpiFormulaSettings = {
  baseFormula: '(C / Q) * W * 100',
  enableQualityScore: true,
  qualityWeight: 30,
  enablePenalty: true,
  penaltyPerDay: 2,
  customRules: [],
};

export const SYSTEM_VARIABLES = [
  { code: 'Q', name: 'Định mức được giao', description: 'Tổng khối lượng kế hoạch × hệ số khó × tỷ lệ đóng góp trong kỳ.' },
  { code: 'C', name: 'Khối lượng đã hoàn thành', description: 'Tổng khối lượng thực hiện, tính theo tiến độ và tỷ lệ đóng góp.' },
  { code: 'W', name: 'Hệ số trọng số', description: 'Hệ số mặc định bằng 1; có thể điều chỉnh trực tiếp trong công thức.' },
  { code: 'D', name: 'Số ngày trễ', description: 'Tổng số ngày nhiệm vụ trễ hạn trong kỳ.' },
  { code: 'S', name: 'Điểm chất lượng', description: 'Điểm chất lượng trung bình từ 0 đến 100 nếu nhiệm vụ có dữ liệu đánh giá.' },
];

type FormulaOperator = '+' | '-' | '*' | '/' | '(' | ')';
type FormulaToken = { type: 'number'; value: number } | { type: 'variable'; value: keyof KpiVariables } | { type: 'operator'; value: FormulaOperator };

function tokenize(formula: string): FormulaToken[] {
  if (typeof formula !== 'string' || formula.trim().length === 0) throw new Error('Hãy nhập công thức.');
  if (formula.length > 256) throw new Error('Công thức không được dài quá 256 ký tự.');

  formula = formula.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  const tokens: FormulaToken[] = [];
  let position = 0;
  while (position < formula.length) {
    if (/\s/.test(formula[position])) { position += 1; continue; }
    const rest = formula.slice(position);
    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)/);
    if (number) {
      const value = Number(number[0]);
      if (!Number.isFinite(value)) throw new Error('Giá trị số trong công thức không hợp lệ.');
      tokens.push({ type: 'number', value });
      position += number[0].length;
    } else if (/^[QqCcWwDdSs]$/.test(formula[position])) {
      tokens.push({ type: 'variable', value: formula[position].toUpperCase() as keyof KpiVariables });
      position += 1;
    } else if (/^[()+\-*/]$/.test(formula[position])) {
      tokens.push({ type: 'operator', value: formula[position] as FormulaOperator });
      position += 1;
    } else {
      throw new Error(`Ký tự "${formula[position]}" không được hỗ trợ. Chỉ dùng Q, C, W, D, S, số và + − × ÷ ( ).`);
    }
    if (tokens.length > 128) throw new Error('Công thức có quá nhiều thành phần.');
  }
  return tokens;
}

class FormulaParser {
  private position = 0;
  private depth = 0;
  constructor(private readonly tokens: FormulaToken[], private readonly variables: KpiVariables) {}

  parse(): number {
    const value = this.expression();
    if (this.position !== this.tokens.length) throw new Error('Công thức còn thành phần chưa được xử lý.');
    if (!Number.isFinite(value)) throw new Error('Kết quả công thức không phải số hữu hạn.');
    return value;
  }

  private expression(): number {
    let value = this.term();
    while (this.match('+') || this.match('-')) {
      const operator = this.previous();
      const right = this.term();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  private term(): number {
    let value = this.unary();
    while (this.match('*') || this.match('/')) {
      const operator = this.previous();
      const right = this.unary();
      if (operator === '/' && right === 0) throw new Error('Không thể chia cho 0. Kiểm tra biến ở mẫu số.');
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }

  private unary(): number {
    if (this.match('+')) return this.unary();
    if (this.match('-')) return -this.unary();
    return this.primary();
  }

  private primary(): number {
    const token = this.advance();
    if (!token) throw new Error('Công thức chưa hoàn chỉnh.');
    if (token.type === 'number') return token.value;
    if (token.type === 'variable') return this.variables[token.value];
    if (token.value === '(') {
      this.depth += 1;
      if (this.depth > 24) throw new Error('Công thức lồng quá nhiều ngoặc.');
      const value = this.expression();
      if (!this.match(')')) throw new Error('Thiếu dấu đóng ngoặc ).');
      this.depth -= 1;
      return value;
    }
    throw new Error('Thiếu toán hạng trước toán tử.');
  }

  private match(value: FormulaOperator): boolean {
    if (this.tokens[this.position]?.type !== 'operator' || this.tokens[this.position]?.value !== value) return false;
    this.position += 1;
    return true;
  }

  private advance(): FormulaToken | undefined { return this.tokens[this.position++]; }
  private previous(): string { return (this.tokens[this.position - 1] as Extract<FormulaToken, { type: 'operator' }>).value; }
}

@Injectable()
export class KpiCalculatorEngine {
  validateFormula(formula: string): { valid: boolean; error?: string } {
    try {
      const sample: KpiVariables = { Q: 10, C: 8, W: 1, D: 2, S: 80 };
      new FormulaParser(tokenize(formula), sample).parse();
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error instanceof Error ? error.message : 'Công thức không hợp lệ.' };
    }
  }

  evaluateTaskScore(variables: KpiVariables, settings: KpiFormulaSettings, domainCode = 'GENERIC'): number {
    const selectedRule = settings.customRules?.find((rule) => rule.domainCode === domainCode && rule.formula.trim());
    const formula = selectedRule?.formula || settings.baseFormula;
    const values = { ...variables };
    for (const code of ['Q', 'C', 'W', 'D', 'S'] as const) {
      if (!Number.isFinite(values[code])) throw new Error(`Giá trị biến ${code} không hợp lệ.`);
    }
    if (values.Q < 0 || values.C < 0 || values.D < 0 || values.S < 0) throw new Error('Q, C, D và S không được âm.');

    let finalScore = new FormulaParser(tokenize(formula), values).parse();
    if (settings.enablePenalty && values.D > 0) finalScore -= values.D * settings.penaltyPerDay;
    if (settings.enableQualityScore && values.S > 0) finalScore += values.S * (settings.qualityWeight / 100);
    if (!Number.isFinite(finalScore)) throw new Error('Kết quả tính KPI không hợp lệ.');
    return Math.max(0, Number(finalScore.toFixed(2)));
  }
}
