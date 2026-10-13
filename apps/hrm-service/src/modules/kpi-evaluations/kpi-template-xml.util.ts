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
  // --- BỘ MẪU GỐC HÀNH CHÍNH CỦA BAN TỔ CHỨC TỈNH ỦY (MAU_01 -> MAU_05) ---
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

  // --- BỘ 1: CẤU TRÚC XML ĐÁNH GIÁ, XẾP LOẠI CÁN BỘ HẰNG QUÝ (HD 05-HD/TU & QĐ 39-QĐ/TU) ---
  {
    formCode: 'HD05_QD39_TU',
    name: 'Quy trình XML Đánh giá, xếp loại cán bộ hằng quý (Trọn bộ HD 05-HD/TU & QĐ 39-QĐ/TU)',
    description: 'Tích hợp toàn bộ quy trình từ Tờ trình, Bản tự kiểm điểm, Phiếu chấm điểm KPI thang 100 (30đ Tiêu chí chung + 70đ KPI) đến Bảng tổng hợp và Báo cáo quyết định xếp loại.',
    fileName: 'hd05-qd39-tu-full.xml',
    category: 'Đánh giá cán bộ hằng quý (HD05-TU / QĐ39-TU)',
    targetRole: 'Toàn thể lãnh đạo, quản lý và cán bộ, công chức',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M01_TOTRINH',
    name: 'Mẫu 01: Tờ trình đề nghị đánh giá, xếp loại quý',
    description: 'Tờ trình đề nghị đánh giá, xếp loại quý kèm tổng hợp số lượng, tỷ lệ xuất sắc (tối đa 20%).',
    fileName: 'm01-totrinh.xml',
    category: 'Đánh giá cán bộ hằng quý (HD05-TU / QĐ39-TU)',
    targetRole: 'Ban Tổ chức Tỉnh ủy / Lãnh đạo cơ quan',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M02_TUKIEMDIEM',
    name: 'Mẫu 02: Bản tự kiểm điểm cá nhân (2A: Lãnh đạo; 2B: Công chức; 2C: Khác)',
    description: 'Tự kiểm điểm tư tưởng chính trị, đạo đức lối sống, kỷ luật công tác và tự soi, tự sửa.',
    fileName: 'm02-tukiemdiem.xml',
    category: 'Đánh giá cán bộ hằng quý (HD05-TU / QĐ39-TU)',
    targetRole: 'Cán bộ lãnh đạo, quản lý và công chức',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M03_SCORECARD_KPI',
    name: 'Mẫu 03: Bản tự đánh giá & Scorecard KPI hằng quý (Thang điểm 100)',
    description: 'Phiếu chấm điểm KPI thang 100: Phần A 30đ Tiêu chí chung + Phần B 70đ KPI Nhiệm vụ (chỉ số A, B, C, D) và Sản phẩm nổi trội.',
    fileName: 'm03-scorecard-kpi.xml',
    category: 'Đánh giá cán bộ hằng quý (HD05-TU / QĐ39-TU)',
    targetRole: 'Toàn thể cán bộ, công chức, viên chức',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M04_TONGHOP_QUY',
    name: 'Mẫu 04: Bảng tổng hợp kết quả đánh giá và đề xuất xếp loại quý',
    description: 'Bảng tổng hợp điểm tự chấm, điểm thẩm định, kiểm soát tỷ lệ 20% xuất sắc và đề xuất mức xếp loại quý.',
    fileName: 'm04-tonghop-quy.xml',
    category: 'Đánh giá cán bộ hằng quý (HD05-TU / QĐ39-TU)',
    targetRole: 'Ban Thường vụ Tỉnh ủy / Tập thể Lãnh đạo Ban',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M05_BAOCAO_QUYETDINH',
    name: 'Mẫu 05: Báo cáo / Quyết định phê duyệt mức xếp loại chất lượng quý',
    description: 'Báo cáo / Quyết định phê duyệt số lượng xếp loại và cảnh báo chế tài nếu 2 quý liên tiếp không hoàn thành để điều chuyển.',
    fileName: 'm05-baocao-quyetdinh.xml',
    category: 'Đánh giá cán bộ hằng quý (HD05-TU / QĐ39-TU)',
    targetRole: 'Ban Thường vụ Tỉnh ủy / Trưởng ban Tổ chức Tỉnh ủy',
    schemaVersion: '1.0',
  },

  // --- BỘ 2: CẤU TRÚC XML KẾT NỐI, CHIA SẺ DỮ LIỆU CSDL ĐẢNG & CÁN BỘ (QĐ 348-QĐ/BTCTW) ---
  {
    formCode: 'QD348_BTCTW',
    name: 'Bộ cấu trúc XML Kết nối, chia sẻ dữ liệu CSDL Đảng & Cán bộ (QĐ 348-QĐ/BTCTW - Phụ lục VIII)',
    description: 'Áp dụng cho các module kỹ thuật tích hợp API/LGSP số hóa dữ liệu giữa Ban Tổ chức Tỉnh ủy với Trung tâm Dữ liệu Quốc gia.',
    fileName: 'qd348-btctw-full.xml',
    category: 'Kết nối CSDL Đảng & Cán bộ (QĐ348-BTCTW)',
    targetRole: 'Cơ quan Đảng, LGSP & Quản trị dữ liệu',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M01_KHAI_THAC',
    name: 'Mẫu 01: Phiếu đề nghị kết nối, chia sẻ dữ liệu (QĐ 348-QĐ/BTCTW)',
    description: 'Phiếu đề nghị kết nối, khai thác dữ liệu qua mạng TSLCD và giao thức REST API HTTPS.',
    fileName: 'm01-khai-thac.xml',
    category: 'Kết nối CSDL Đảng & Cán bộ (QĐ348-BTCTW)',
    targetRole: 'Đơn vị khai thác / Cán bộ kỹ thuật CNTT',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M02_CHAP_THUAN',
    name: 'Mẫu 02: Quyết định chấp thuận kết nối, chia sẻ dữ liệu',
    description: 'Quyết định phê duyệt danh mục API Service và yêu cầu bảo đảm an toàn thông tin Cấp độ 3 của Ban Tổ chức Trung ương.',
    fileName: 'm02-chap-thuan.xml',
    category: 'Kết nối CSDL Đảng & Cán bộ (QĐ348-BTCTW)',
    targetRole: 'Ban Tổ chức Trung ương / Cơ quan thẩm quyền',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M03_XUNG_DOT',
    name: 'Mẫu 03: Biên bản phát hiện xung đột dữ liệu',
    description: 'Biên bản ghi nhận sai lệch giữa CSDL Đảng viên với CSDL Quốc gia về cán bộ, công chức per Single Source of Truth.',
    fileName: 'm03-xung-dot.xml',
    category: 'Kết nối CSDL Đảng & Cán bộ (QĐ348-BTCTW)',
    targetRole: 'Bộ phận đối soát dữ liệu & Vận hành tích hợp',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M04_TAM_NGUNG',
    name: 'Mẫu 04: Thông báo tạm ngừng / chấm dứt kết nối',
    description: 'Thông báo tạm dừng kết nối API phục vụ bảo trì hệ thống mạng diện rộng của Đảng hoặc xử lý sự cố.',
    fileName: 'm04-tam-ngung.xml',
    category: 'Kết nối CSDL Đảng & Cán bộ (QĐ348-BTCTW)',
    targetRole: 'Ban Tổ chức Trung ương / Ban Quản trị mạng',
    schemaVersion: '1.0',
  },
  {
    formCode: 'M05_BAOCAO_NAM',
    name: 'Mẫu 05: Báo cáo kết quả kết nối, chia sẻ dữ liệu hằng năm',
    description: 'Báo cáo tổng kết lưu lượng API call, tỷ lệ đồng bộ thành công, độ sạch dữ liệu (Đúng, Đủ, Sạch, Sống) và sự cố an toàn thông tin.',
    fileName: 'm05-baocao-nam.xml',
    category: 'Kết nối CSDL Đảng & Cán bộ (QĐ348-BTCTW)',
    targetRole: 'Ban Tổ chức Tỉnh ủy / Đơn vị tích hợp LGSP',
    schemaVersion: '1.0',
  },
];

import { EMBEDDED_KPI_FORM_XML } from './kpi-templates-embedded.data';

const CANDIDATE_TEMPLATE_DIRS = [
  path.resolve(__dirname, '../../../templates/kpi-forms'),
  path.resolve(__dirname, '../../../../templates/kpi-forms'),
  path.resolve(__dirname, '../../templates/kpi-forms'),
  path.resolve(process.cwd(), 'templates/kpi-forms'),
  path.resolve(process.cwd(), 'apps/hrm-service/templates/kpi-forms'),
  path.resolve(process.cwd(), 'dist/apps/hrm-service/templates/kpi-forms'),
];

export function isPlaceholderXml(xmlContent?: string | null): boolean {
  if (!xmlContent || typeof xmlContent !== 'string') return true;
  const trimmed = xmlContent.trim();
  if (!trimmed || trimmed.length < 350) return true;

  // Kiểm tra các mẫu placeholder hoặc thẻ rỗng
  if (
    trimmed.includes('<Placeholder>') ||
    trimmed.includes('<Placeholder ') ||
    trimmed.includes('Nội dung đang được cập nhật') ||
    trimmed.includes('<Body>{{content}}</Body>') ||
    trimmed.includes('<Body></Body>') ||
    trimmed.includes('<Body/>') ||
    trimmed.includes('formCode="NEW_TEMPLATE"')
  ) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra xem nội dung XML có đầy đủ "ruột" biểu mẫu thực tế hay không
 */
export function hasValidFormContent(formCode: string, xmlContent?: string | null): boolean {
  if (!xmlContent || isPlaceholderXml(xmlContent)) return false;

  const trimmed = xmlContent.trim();
  // Một mẫu chuẩn thực tế luôn có tối thiểu 450 ký tự và chứa các thẻ nghiệp vụ
  if (trimmed.length < 450) return false;

  // Nếu là một trong các mẫu chuẩn hệ thống, đối chiếu các thẻ nghiệp vụ cốt lõi
  const isDefaultTemplate = DEFAULT_KPI_FORM_TEMPLATES.some((t) => t.formCode === formCode);
  if (isDefaultTemplate) {
    const hasBusinessTags =
      trimmed.includes('<RegisteredTasks') ||
      trimmed.includes('<SectionA') ||
      trimmed.includes('<SectionB') ||
      trimmed.includes('<CollectiveFeedback') ||
      trimmed.includes('<StaffRankDistribution') ||
      trimmed.includes('<IndividualFinalRankings') ||
      trimmed.includes('<Form01_') ||
      trimmed.includes('<Form02_') ||
      trimmed.includes('<Form03_') ||
      trimmed.includes('<Form04_') ||
      trimmed.includes('<Form05_') ||
      trimmed.includes('<OfficialEvaluationSystem') ||
      trimmed.includes('<PartyDataIntegrationSystem') ||
      trimmed.includes('<SummaryContent>') ||
      trimmed.includes('<PersonalInformation>') ||
      trimmed.includes('<SectionA_GeneralCriteria') ||
      trimmed.includes('<SummaryList>') ||
      trimmed.includes('<FinalApprovalResults>') ||
      trimmed.includes('<RequestingAgency>') ||
      trimmed.includes('<ApprovedAPIServices>');

    if (!hasBusinessTags) return false;
  }

  return true;
}


/**
 * Đọc nội dung file XML mẫu từ ổ đĩa hoặc bộ nhúng sẵn
 */
export function getTemplateXmlContent(formCode: string): string {
  const meta = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === formCode);
  const fileName = meta ? meta.fileName : `${formCode.toLowerCase()}.xml`;

  // 1. Thử tìm trên đĩa từ các candidate path
  for (const dir of CANDIDATE_TEMPLATE_DIRS) {
    try {
      const filePath = path.join(dir, fileName);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content && content.trim() && !isPlaceholderXml(content)) {
          return content;
        }
      }
    } catch {
      // Bỏ qua lỗi truy cập đĩa
    }
  }

  // 2. Tra cứu trong bộ dữ liệu XML tích hợp sẵn (100% Sẵn sàng trong mọi môi trường Docker/Local)
  if (EMBEDDED_KPI_FORM_XML[fileName]) {
    return EMBEDDED_KPI_FORM_XML[fileName];
  }
  if (EMBEDDED_KPI_FORM_XML[formCode]) {
    return EMBEDDED_KPI_FORM_XML[formCode];
  }

  // 3. Fallback tối thiểu nếu là mẫu mới chưa định nghĩa
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

  for (const dir of CANDIDATE_TEMPLATE_DIRS) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filePath = path.join(dir, fileName);
      fs.writeFileSync(filePath, xmlContent, 'utf8');
      return true;
    } catch {
      // Thử path tiếp theo
    }
  }
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
