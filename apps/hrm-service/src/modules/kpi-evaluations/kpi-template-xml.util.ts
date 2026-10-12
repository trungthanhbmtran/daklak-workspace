import * as fs from 'fs';
import * as path from 'path';

export interface FormTemplateMeta {
  formCode: string;
  name: string;
  description: string;
  fileName: string;
  category: string;
  targetRole: string;
  schemaVersion: string;
}

export const DEFAULT_KPI_FORM_TEMPLATES: FormTemplateMeta[] = [
  {
    formCode: 'MAU_01',
    name: 'Bản đăng ký khung danh mục sản phẩm, công việc chuẩn đầu kỳ',
    description: 'Áp dụng cho chuyên viên và cán bộ đăng ký khung khối lượng, độ khó và hạn định công việc đầu kỳ đánh giá.',
    fileName: 'mau-01-dang-ky-dau-ky.xml',
    category: 'Đăng ký đầu kỳ',
    targetRole: 'Chuyên viên / Cán bộ chuyên môn',
    schemaVersion: '1.0',
  },
  {
    formCode: 'MAU_02',
    name: 'Bản tự đánh giá, chấm điểm KPI/OKR cá nhân định kỳ',
    description: 'Phiếu tự chấm điểm 30đ tiêu chí chung và 70đ kết quả công việc 4 thành tố (Khối lượng, Chất lượng, Tiến độ, Thái độ).',
    fileName: 'mau-02-tu-danh-gia-ca-nhan.xml',
    category: 'Tự đánh giá cá nhân',
    targetRole: 'Toàn thể 22 VTVL cán bộ công chức',
    schemaVersion: '1.0',
  },
  {
    formCode: 'MAU_03',
    name: 'Bản nhận xét, đánh giá của cấp ủy và tập thể lãnh đạo phòng',
    description: 'Phiếu nhận xét ưu/khuyết điểm, xếp loại của Chi bộ và đánh giá của Lãnh đạo phòng trực tiếp.',
    fileName: 'mau-03-nhan-xet-tap-the.xml',
    category: 'Đánh giá tập thể',
    targetRole: 'Chi ủy Chi bộ & Lãnh đạo Phòng',
    schemaVersion: '1.0',
  },
  {
    formCode: 'MAU_04',
    name: 'Bảng tổng hợp kết quả đánh giá tập thể phòng & nhiệm vụ nổi trội',
    description: 'Tổng hợp phân bổ xếp loại của phòng, trừ điểm chất lượng (-5%, -15%, -35%) và cộng thưởng việc nổi trội (+10%).',
    fileName: 'mau-04-tong-hop-phong.xml',
    category: 'Tổng hợp phòng ban',
    targetRole: 'Trưởng phòng / Chánh Văn phòng',
    schemaVersion: '1.0',
  },
  {
    formCode: 'MAU_05',
    name: 'Dự thảo quyết định & Bảng tổng hợp xếp loại toàn cơ quan',
    description: 'Quyết định chốt xếp loại của Trưởng ban, áp dụng trần 20% Hoàn thành xuất sắc và trần Người đứng đầu.',
    fileName: 'mau-05-tong-hop-co-quan.xml',
    category: 'Quyết định cơ quan',
    targetRole: 'Trưởng ban & Hội đồng Thi đua Ban',
    schemaVersion: '1.0',
  },
];

const TEMPLATES_DIR = path.resolve(__dirname, '../../../templates/kpi-forms');

/**
 * Đọc nội dung file XML mẫu từ ổ đĩa
 */
export function getTemplateXmlContent(formCode: string): string {
  const meta = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === formCode);
  const fileName = meta ? meta.fileName : `${formCode.toLowerCase()}.xml`;
  const filePath = path.join(TEMPLATES_DIR, fileName);

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }

  // Fallback XML cơ bản nếu file chưa tồn tại
  return `<?xml version="1.0" encoding="UTF-8"?>
<KpiFormDocument xmlns="http://btctu.daklak.gov.vn/kpi/v1" formCode="${formCode}" schemaVersion="1.0">
  <Header>
    <AgencyName>TỈNH ỦY ĐẮK LẮK</AgencyName>
    <OrganizationName>BAN TỔ CHỨC TỈNH ỦY</OrganizationName>
    <DocumentTitle>${meta?.name || formCode}</DocumentTitle>
  </Header>
  <Body>
    <Placeholder>Nội dung đang được cập nhật</Placeholder>
  </Body>
</KpiFormDocument>`;
}

/**
 * Lưu / cập nhật nội dung XML mẫu
 */
export function saveTemplateXmlContent(formCode: string, xmlContent: string): boolean {
  const meta = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === formCode);
  const fileName = meta ? meta.fileName : `${formCode.toLowerCase()}.xml`;
  
  if (!fs.existsSync(TEMPLATES_DIR)) {
    fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
  }

  const filePath = path.join(TEMPLATES_DIR, fileName);
  fs.writeFileSync(filePath, xmlContent, 'utf8');
  return true;
}

/**
 * Trích xuất danh sách các biến {{placeholder}} trong XML
 */
export function extractPlaceholders(xmlContent: string): string[] {
  const matches = new Set<string>();
  const eachRegex = /\{\{#each\s+([a-zA-Z0-9_./-]+)\s*\}\}/g;
  const placeholderRegex = /\{\{\s*([a-zA-Z0-9_@./-]+)\s*\}\}/g;
  let match;
  while ((match = eachRegex.exec(xmlContent)) !== null) matches.add(match[1]);
  while ((match = placeholderRegex.exec(xmlContent)) !== null) {
    const expression = match[1];
    if (expression !== '@index' && expression !== '@number') {
      matches.add(expression);
    }
  }
  return Array.from(matches);
}

/**
 * Kiểm tra cú pháp XML hợp lệ
 */
export function validateXmlSyntax(xmlString: string): { isValid: boolean; error?: string } {
  if (!xmlString || typeof xmlString !== 'string' || !xmlString.trim()) {
    return { isValid: false, error: 'Nội dung XML không được để trống' };
  }

  // Kiểm tra header XML
  if (!xmlString.trim().startsWith('<?xml')) {
    return { isValid: false, error: 'Thiếu khai báo XML declaration <?xml version="1.0"...?> ở đầu file' };
  }

  // Kiểm tra cân bằng thẻ đơn giản (Stack check)
  const tagRegex = /<\/?([a-zA-Z0-9_:-]+)(?:\s+[^>]*?)?(\/?)>/g;
  const stack: string[] = [];
  let match;

  while ((match = tagRegex.exec(xmlString)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    const isSelfClosing = match[2] === '/' || fullTag.endsWith('/>');
    const isClosing = fullTag.startsWith('</');

    if (fullTag.startsWith('<?') || fullTag.startsWith('<!--') || fullTag.startsWith('<![')) {
      continue;
    }

    if (isSelfClosing) {
      continue;
    } else if (isClosing) {
      if (stack.length === 0) {
        return { isValid: false, error: `Thẻ đóng </${tagName}> không có thẻ mở tương ứng` };
      }
      const last = stack.pop();
      if (last !== tagName) {
        return { isValid: false, error: `Sai thứ tự đóng thẻ: mong muốn </${last}> nhưng gặp </${tagName}>` };
      }
    } else {
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    return { isValid: false, error: `Còn ${stack.length} thẻ chưa được đóng, thẻ ngoài cùng: <${stack[0]}>` };
  }

  return { isValid: true };
}

/**
 * Render template XML với data đối tượng
 */
type TemplateScope = { value: unknown; index: number };

function escapeXmlValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPathValue(value: unknown, pathParts: string[]): unknown {
  return pathParts.reduce<unknown>((current, part) => {
    if (current === null || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[part];
  }, value);
}

function resolveTemplateValue(expression: string, root: Record<string, unknown>, scopes: TemplateScope[]): unknown {
  if (expression === '@index') return scopes[scopes.length - 1]?.index;
  if (expression === '@number') {
    const index = scopes[scopes.length - 1]?.index;
    return index === undefined ? undefined : index + 1;
  }

  let scopeOffset = 0;
  let target = expression;
  if (target.startsWith('this.')) {
    target = target.slice(5);
  } else if (target === 'this') {
    return scopes[scopes.length - 1]?.value;
  } else {
    while (target.startsWith('../')) {
      scopeOffset += 1;
      target = target.slice(3);
    }
    if (scopeOffset > 0) {
      const scope = scopes[scopes.length - 1 - scopeOffset];
      return scope ? getPathValue(scope.value, target.split('.')) : undefined;
    }
    return getPathValue(root, target.split('.'));
  }

  const current = scopes[scopes.length - 1];
  return current ? getPathValue(current.value, target.split('.')) : undefined;
}

function renderTemplateFragment(template: string, root: Record<string, unknown>, scopes: TemplateScope[]): string {
  const eachStart = /\{\{#each\s+([a-zA-Z0-9_./-]+)\s*\}\}/g;
  let output = '';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = eachStart.exec(template)) !== null) {
    output += template.slice(cursor, match.index);
    const collection = resolveTemplateValue(match[1], root, scopes);
    let depth = 1;
    let tokenCursor = eachStart.lastIndex;
    const tokenRegex = /\{\{#each\s+[a-zA-Z0-9_./-]+\s*\}\}|\{\{\/each\s*\}\}/g;
    tokenRegex.lastIndex = tokenCursor;
    let token: RegExpExecArray | null;
    while ((token = tokenRegex.exec(template)) !== null) {
      if (token[0].startsWith('{{#each')) depth += 1;
      else depth -= 1;
      if (depth === 0) break;
    }

    if (!token) {
      output += template.slice(match.index);
      cursor = template.length;
      break;
    }

    const body = template.slice(tokenCursor, token.index);
    if (Array.isArray(collection)) {
      output += collection.map((item, index) => renderTemplateFragment(body, root, [...scopes, { value: item, index }])).join('');
    }
    cursor = tokenRegex.lastIndex;
    eachStart.lastIndex = cursor;
  }

  if (cursor < template.length) output += template.slice(cursor);
  return output.replace(/\{\{\s*([a-zA-Z0-9_@./-]+)\s*\}\}/g, (_placeholder, expression: string) => {
    return escapeXmlValue(resolveTemplateValue(expression, root, scopes));
  });
}

/** Render placeholders and {{#each collection}} sections with XML-escaped values. */
export function renderTemplateXml(xmlTemplate: string, data: Record<string, any>): string {
  return renderTemplateFragment(xmlTemplate, data, []);
}
