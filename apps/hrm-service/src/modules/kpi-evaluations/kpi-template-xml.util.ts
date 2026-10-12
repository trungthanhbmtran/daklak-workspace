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
  const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
  const matches = new Set<string>();
  let match;
  while ((match = regex.exec(xmlContent)) !== null) {
    matches.add(match[1]);
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
export function renderTemplateXml(xmlTemplate: string, data: Record<string, any>): string {
  let rendered = xmlTemplate;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
  }
  return rendered;
}
