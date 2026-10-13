/**
 * Utility: Chuyển đổi và xuất các biểu mẫu XML thành tài liệu Microsoft Word (.docx), XML UTF-8 và Bản in PDF
 * Tuân thủ 100% Thể thức và Kỹ thuật trình bày văn bản hành chính theo Nghị định 30/2020/NĐ-CP (Phụ lục I)
 * và Thể thức văn bản của cơ quan Đảng (Hướng dẫn 36-HD/VPTW & Quy định 01-QĐ/BTCTU)
 *
 * KHẮC PHỤC TRIỆT ĐỂ LỖI FONT CHỮ:
 * 1. Khai báo đồng bộ thuộc tính font Times New Roman (ascii, hAnsi, cs, eastAsia) cho mọi TextRun và Document Styles,
 *    loại trừ triệt để hiện tượng Word tự động fallback sang Calibri/SimSun cho các ký tự tiếng Việt có dấu.
 * 2. Xuất file XML chuẩn mã hóa UTF-8 có Byte Order Mark (BOM \uFEFF) giúp Windows Notepad, Word, Excel hiển thị chính xác.
 * 3. Bản in / PDF sử dụng Times New Roman nhúng, căn lề chuẩn A4 (20mm, 20mm, 30mm, 15mm), đường kẻ ngang liền thanh mảnh.
 */
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  Header,
  Footer,
  PageNumber,
  UnderlineType,
} from 'docx';

/**
 * Định nghĩa font Times New Roman chuẩn Unicode TCVN 6909:2001 theo Nghị định 30/2020/NĐ-CP
 * Khai báo đầy đủ cho cả ASCII, High-ANSI, Complex Script và East Asian để tránh lỗi font chữ tiếng Việt
 */
export const FONT_TIMES_NEW_ROMAN = {
  name: 'Times New Roman',
  ascii: 'Times New Roman',
  hAnsi: 'Times New Roman',
  cs: 'Times New Roman',
  eastAsia: 'Times New Roman',
};

/**
 * Helper tạo TextRun chuẩn Times New Roman không bị lỗi font tiếng Việt
 */
export function createTrTextRun(options: {
  text: string;
  size?: number; // Đơn vị: half-points (26 = 13 pt, 28 = 14 pt, 24 = 12 pt, 30 = 15 pt)
  bold?: boolean;
  italics?: boolean;
  underline?: { type?: (typeof UnderlineType)[keyof typeof UnderlineType]; color?: string };
  color?: string;
}): TextRun {
  return new TextRun({
    text: options.text,
    font: FONT_TIMES_NEW_ROMAN,
    size: options.size ?? 26, // Mặc định 13 pt theo NĐ 30/2020
    bold: options.bold ?? false,
    italics: options.italics ?? false,
    underline: options.underline,
    color: options.color ?? '000000',
  });
}

// Cấu trúc một cột trong bảng động
export interface DynamicTableColumn {
  key: string;
  label: string;
  widthPct: number;
  align?: (typeof AlignmentType)[keyof typeof AlignmentType];
  bold?: boolean;
}

// Cấu trúc một bảng dữ liệu trích xuất từ XML
export interface DynamicXmlTable {
  title?: string;
  columns: DynamicTableColumn[];
  rows: Array<Record<string, string>>;
}

// Cấu trúc một khối văn bản / điều khoản / nhận xét
export interface DynamicTextBlock {
  title: string;
  items: Array<{
    prefix?: string;
    content: string;
  }>;
}

// Cấu trúc tài liệu bóc tách hoàn toàn từ XML gốc
export interface ParsedXmlDocumentData {
  formCode: string;
  schemaVersion?: string;
  agencyName: string;
  organizationName: string;
  documentTitle: string;
  subTitle?: string;
  decisionNumber?: string;
  decisionDate?: string;
  periodName?: string;
  datePlaceString?: string;
  isPartyAgency: boolean; // Cơ quan Đảng hay cơ quan Nhà nước
  // Khối thông tin đối tượng (Profile / Officer / Department)
  profileFields: Array<{ label: string; value: string }>;
  // Căn cứ pháp lý
  legalBasis: string[];
  // Các bảng dữ liệu động
  tables: DynamicXmlTable[];
  // Các khối nội dung điều khoản / cam kết / nhận xét
  textBlocks: DynamicTextBlock[];
  // Chữ ký
  signatureType: 'TWO_COLUMN' | 'DECISION' | 'DEPARTMENT' | 'NONE';
  signers: {
    leftTitle?: string;
    leftSubtitle?: string;
    leftName?: string;
    rightTitle?: string;
    rightSubtitle?: string;
    rightName?: string;
    rightDate?: string;
  };
}

/**
 * Helper: Làm sạch text, loại bỏ placeholder {{...}} nếu là biểu mẫu trống
 */
function sanitizeText(val: string | null | undefined, placeholderReplacement = ''): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\{\{.*\}\}$/.test(trimmed) || /^\{.*\}$/.test(trimmed)) {
    return placeholderReplacement;
  }
  return trimmed;
}

/**
 * Helper: Trích xuất nội dung text của tag con đầu tiên
 */
function getDirectTagText(parent: Element | null, tagName: string): string {
  if (!parent) return '';
  const el = parent.getElementsByTagName(tagName)[0];
  if (!el || !el.textContent) return '';
  return el.textContent.trim();
}

/**
 * Ánh xạ tên thuộc tính XML sang nhãn tiếng Việt chuẩn hành chính
 */
const TAG_LABEL_MAP: Record<string, string> = {
  FullName: 'Họ và tên cán bộ',
  fullName: 'Họ và tên cán bộ',
  EmployeeName: 'Họ và tên cán bộ',
  EmployeeCode: 'Mã số công chức',
  employeeCode: 'Mã số công chức',
  CitizenID: 'Số CCCD / Mã định danh',
  DepartmentName: 'Đơn vị / Phòng ban',
  departmentName: 'Đơn vị / Phòng ban',
  DepartmentCode: 'Mã phòng ban',
  JobTitle: 'Chức vụ / Chức danh',
  jobTitle: 'Chức vụ / Chức danh',
  PartyPosition: 'Chức vụ Đảng',
  GovernmentPosition: 'Chức vụ chính quyền',
  JobPositionCode: 'Vị trí việc làm',
  StaffingSlotId: 'Mã định biên biên chế',
  RankCode: 'Mã ngạch công chức',
  IsUnitLeader: 'Lãnh đạo đơn vị',
  SelfRating: 'Xếp loại tự nhận',
  SelfScore: 'Điểm tự chấm',
  TotalScore: 'Tổng điểm đánh giá',
  OfficialRank: 'Xếp loại chính thức',
  ProposedRank: 'Xếp loại đề xuất',
  EvaluationPeriod: 'Kỳ đánh giá',
  PeriodYear: 'Năm công tác',
  PeriodQuarter: 'Quý đánh giá',
  HeadOfAgencyName: 'Thủ trưởng cơ quan',
  BranchName: 'Tên chi bộ',
};

/**
 * Parser chính: Bóc tách toàn diện từ XML gốc thành Document Data
 */
export function parseKpiXml(xmlContent: string, templateTitleFallback?: string): ParsedXmlDocumentData {
  const result: ParsedXmlDocumentData = {
    formCode: 'BIEU_MAU_XML',
    agencyName: 'TỈNH ỦY ĐẮK LẮK',
    organizationName: 'BAN TỔ CHỨC TỈNH ỦY',
    documentTitle: templateTitleFallback || 'BIỂU MẪU ĐÁNH GIÁ, XẾP LOẠI CHẤT LƯỢNG',
    isPartyAgency: true,
    profileFields: [],
    legalBasis: [],
    tables: [],
    textBlocks: [],
    signatureType: 'TWO_COLUMN',
    signers: {
      leftTitle: 'NGƯỜI TỰ ĐÁNH GIÁ',
      leftSubtitle: '(Ký, ghi rõ họ và tên)',
      leftName: '',
      rightTitle: 'TRƯỞNG PHÒNG CHUYÊN MÔN',
      rightSubtitle: '(Ký, ghi rõ họ và tên)',
      rightName: '',
      rightDate: `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
    },
  };

  if (!xmlContent || !xmlContent.trim()) return result;

  try {
    const DOMParserConstructor: any =
      typeof DOMParser !== 'undefined'
        ? DOMParser
        : typeof require !== 'undefined'
          ? (() => {
              try {
                return require('@xmldom/xmldom').DOMParser;
              } catch {
                return null;
              }
            })()
          : null;

    if (!DOMParserConstructor) return result;
    const parser = new DOMParserConstructor();
    const doc = parser.parseFromString(xmlContent, 'application/xml');

    const root = doc.documentElement;
    if (root) {
      result.formCode = root.getAttribute('formCode') || root.getAttribute('id') || result.formCode;
      result.schemaVersion = root.getAttribute('schemaVersion') || undefined;
    }

    // 1. Trích xuất Header
    const headerEl = doc.getElementsByTagName('Header')[0] || doc.getElementsByTagName('Form01_SubmissionHeader')[0];
    if (headerEl) {
      const agency = sanitizeText(getDirectTagText(headerEl, 'AgencyName'));
      if (agency) result.agencyName = agency;

      const org = sanitizeText(getDirectTagText(headerEl, 'OrganizationName'));
      if (org) result.organizationName = org;

      const docTitle = sanitizeText(getDirectTagText(headerEl, 'DocumentTitle'));
      if (docTitle) result.documentTitle = docTitle;

      const period = sanitizeText(getDirectTagText(headerEl, 'EvaluationPeriod'));
      if (period) result.periodName = period;

      const decisionNum = sanitizeText(getDirectTagText(headerEl, 'DecisionNumber') || getDirectTagText(headerEl, 'SubmissionNumber'));
      if (decisionNum) result.decisionNumber = decisionNum;

      const decisionDate = sanitizeText(getDirectTagText(headerEl, 'DecisionDate') || getDirectTagText(headerEl, 'SubmissionDate'));
      if (decisionDate) result.decisionDate = decisionDate;
    }

    // Xác định cơ quan Đảng hay cơ quan Nhà nước
    const fullOrgText = `${result.agencyName} ${result.organizationName}`.toUpperCase();
    result.isPartyAgency = fullOrgText.includes('TỈNH ỦY') || fullOrgText.includes('ĐẢNG') || fullOrgText.includes('CHI BỘ') || fullOrgText.includes('BTCTU');

    // 2. Trích xuất Căn cứ pháp lý (LegalBasis)
    const legalEl = doc.getElementsByTagName('LegalBasis')[0];
    if (legalEl) {
      const items = legalEl.children;
      for (let i = 0; i < items.length; i++) {
        const text = sanitizeText(items[i]?.textContent);
        if (text) {
          result.legalBasis.push(text.startsWith('Căn cứ') ? text : `Căn cứ ${text}`);
        }
      }
    }

    // 3. Trích xuất Thông tin đối tượng / Cán bộ (OfficerProfile, PersonalInformation, Profile)
    const profileEl =
      doc.getElementsByTagName('OfficerProfile')[0] ||
      doc.getElementsByTagName('EvaluatedOfficer')[0] ||
      doc.getElementsByTagName('PersonalInformation')[0] ||
      doc.getElementsByTagName('Profile')[0];

    if (profileEl) {
      const children = profileEl.children;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        const tagName = node.tagName;
        const rawVal = node.textContent?.trim() || '';
        const cleanVal = sanitizeText(rawVal, '........................................................');
        if (cleanVal) {
          const label = TAG_LABEL_MAP[tagName] || tagName;
          result.profileFields.push({ label, value: cleanVal });
        }
      }
    }

    // 4. PHÂN TÍCH CÁC BẢNG DỮ LIỆU ĐẶC THÙ & ĐỘNG
    const isMau01 = result.formCode === 'MAU_01' || doc.getElementsByTagName('RegisteredTasks').length > 0;
    const isMau02 = result.formCode === 'MAU_02' || doc.getElementsByTagName('SectionA_GeneralCriteria').length > 0;
    const isMau03 = result.formCode === 'MAU_03' || doc.getElementsByTagName('CollectiveFeedback').length > 0;
    const isMau04 = result.formCode === 'MAU_04' || doc.getElementsByTagName('StaffSummaryTable').length > 0;
    const isMau05 = result.formCode === 'MAU_05' || doc.getElementsByTagName('IndividualFinalRankings').length > 0;

    // --- MẪU 01: KHUNG DANH MỤC CÔNG VIỆC ĐĂNG KÝ ĐẦU KỲ ---
    if (isMau01) {
      const taskNodes = Array.from(doc.querySelectorAll('RegisteredTasks > TaskItem, RegisteredTasks > Task, TaskItem')) as Element[];
      if (taskNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        taskNodes.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('orderNumber') || String(idx + 1),
            taskName: sanitizeText(getDirectTagText(node, 'TaskName'), `Nhiệm vụ chuyên môn ${idx + 1}`),
            domainName: sanitizeText(getDirectTagText(node, 'DomainName') || getDirectTagText(node, 'DomainCode'), 'Chung'),
            plannedQty: sanitizeText(getDirectTagText(node, 'PlannedQuantity') || getDirectTagText(node, 'PlannedQty'), '1'),
            difficultyK: sanitizeText(getDirectTagText(node, 'DifficultyFactor') || getDirectTagText(node, 'DifficultyK'), '1.0'),
            weight: sanitizeText(getDirectTagText(node, 'TaskWeight') || getDirectTagText(node, 'Weight'), '1.0'),
            targetDeadline: sanitizeText(getDirectTagText(node, 'TargetDeadline'), 'Trong kỳ'),
            deliverable: sanitizeText(getDirectTagText(node, 'ExpectedDeliverable'), 'Báo cáo / Văn bản'),
          });
        });

        result.tables.push({
          title: 'I. KHUNG DANH MỤC SẢN PHẨM / NHIỆM VỤ ĐĂNG KÝ ĐẦU KỲ',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'taskName', label: 'Tên nhiệm vụ / Sản phẩm đăng ký', widthPct: 34, bold: true },
            { key: 'domainName', label: 'Mảng công việc', widthPct: 15, align: AlignmentType.CENTER },
            { key: 'plannedQty', label: 'Chỉ tiêu', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'difficultyK', label: 'Độ khó (K)', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'weight', label: 'Trọng số (W)', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'targetDeadline', label: 'Hạn hoàn thành', widthPct: 19, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      // Cam kết chung Mẫu 01
      const commitmentsEl = doc.getElementsByTagName('GeneralCommitments')[0];
      if (commitmentsEl) {
        const commitItems: Array<{ content: string }> = [];
        const children = commitmentsEl.children;
        for (let i = 0; i < children.length; i++) {
          const text = sanitizeText(children[i]?.textContent);
          if (text) commitItems.push({ content: text });
        }
        if (commitItems.length > 0) {
          result.textBlocks.push({
            title: 'II. CAM KẾT VÀ NGHĨA VỤ CỦA CÁN BỘ, CÔNG CHỨC',
            items: commitItems,
          });
        }
      }
    }

    // --- MẪU 02: TỰ ĐÁNH GIÁ, CHẤM ĐIỂM KPI CÁ NHÂN ---
    if (isMau02) {
      // 1. Tiêu chí chung
      const criteriaNodes = Array.from(doc.querySelectorAll('SectionA_GeneralCriteria > Criterion, Criterion')) as Element[];
      if (criteriaNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        criteriaNodes.forEach((node: Element, idx: number) => {
          rows.push({
            stt: String(idx + 1),
            name: sanitizeText(getDirectTagText(node, 'Name') || node.getAttribute('name'), `Tiêu chí ${idx + 1}`),
            desc: sanitizeText(getDirectTagText(node, 'Description')),
            maxScore: node.getAttribute('maxScore') || node.getAttribute('max') || sanitizeText(getDirectTagText(node, 'MaxScore'), '10.0'),
            selfScore: sanitizeText(getDirectTagText(node, 'SelfScore') || node.getAttribute('score'), '-'),
            reviewerScore: sanitizeText(getDirectTagText(node, 'ReviewerScore'), '-'),
          });
        });

        result.tables.push({
          title: 'I. ĐÁNH GIÁ CÁC TIÊU CHÍ CHUNG (Tối đa 30 điểm)',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'name', label: 'Nội dung tiêu chí chung', widthPct: 38, bold: true },
            { key: 'desc', label: 'Mô tả tiêu chuẩn', widthPct: 32 },
            { key: 'maxScore', label: 'Điểm tối đa', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'selfScore', label: 'Tự chấm', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'reviewerScore', label: 'Lãnh đạo chấm', widthPct: 8, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      // 2. Nhiệm vụ chuyên môn
      const taskDetailNodes = Array.from(doc.querySelectorAll('SectionB_TaskPerformance TaskDetail, EvaluatedTasks > TaskDetail, SectionB_TaskKPI TaskItem')) as Element[];
      if (taskDetailNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        taskDetailNodes.forEach((node: Element, idx: number) => {
          const volEl = node.getElementsByTagName('VolumeFactorA')[0];
          const qualEl = node.getElementsByTagName('QualityFactorB')[0];
          const progEl = node.getElementsByTagName('ProgressFactorC')[0];
          const attEl = node.getElementsByTagName('AttitudeFactorD')[0];

          rows.push({
            stt: String(idx + 1),
            taskName: sanitizeText(getDirectTagText(node, 'TaskName'), `Nhiệm vụ ${idx + 1}`),
            vol: volEl ? `${volEl.getAttribute('actualQty') || '-'}/${volEl.getAttribute('plannedQty') || '-'}` : sanitizeText(getDirectTagText(node, 'CompletedQuantity'), '-'),
            qual: qualEl ? `${qualEl.getAttribute('qualityPct') || '-'}%` : sanitizeText(getDirectTagText(node, 'QualityFactor'), '-'),
            prog: progEl ? `${progEl.getAttribute('progressPct') || '-'}%` : sanitizeText(getDirectTagText(node, 'SLAFactor'), '-'),
            att: attEl ? `${attEl.getAttribute('score') || '-'}` : '-',
            score: sanitizeText(getDirectTagText(node, 'TaskKpiScore'), '-'),
          });
        });

        result.tables.push({
          title: 'II. KẾT QUẢ THỰC HIỆN NHIỆM VỤ CHUYÊN MÔN THEO 4 THÀNH TỐ (Tối đa 70 điểm)',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'taskName', label: 'Tên nhiệm vụ chuyên môn', widthPct: 44, bold: true },
            { key: 'vol', label: 'Khối lượng (A)', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'qual', label: 'Chất lượng (B)', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'prog', label: 'Tiến độ (C)', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'att', label: 'Thái độ (D)', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'score', label: 'Điểm KPI', widthPct: 10, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      // 3. Tổng hợp kết quả Mẫu 02
      const summaryEl = doc.getElementsByTagName('SummaryResults')[0];
      if (summaryEl) {
        const generalTotal = sanitizeText(getDirectTagText(summaryEl, 'GeneralScoreTotal'), '-');
        const taskTotal = sanitizeText(getDirectTagText(summaryEl, 'TaskScoreTotal'), '-');
        const totalSelf = sanitizeText(getDirectTagText(summaryEl, 'TotalScoreSelf'), '-');
        const totalFinal = sanitizeText(getDirectTagText(summaryEl, 'TotalScoreFinal'), '-');
        const selfClass = sanitizeText(getDirectTagText(summaryEl, 'SelfClassification'), '-');
        const propClass = sanitizeText(getDirectTagText(summaryEl, 'ProposedClassification'), '-');

        result.tables.push({
          title: 'III. TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ ĐỊNH KỲ',
          columns: [
            { key: 'item', label: 'Nội dung thành phần điểm', widthPct: 50, bold: true },
            { key: 'valSelf', label: 'Điểm cá nhân tự chấm', widthPct: 25, align: AlignmentType.CENTER },
            { key: 'valFinal', label: 'Điểm Lãnh đạo thẩm định', widthPct: 25, align: AlignmentType.CENTER },
          ],
          rows: [
            { item: '1. Điểm tiêu chí chung (nhóm tư tưởng, tác phong, ATTT)', valSelf: generalTotal, valFinal: generalTotal },
            { item: '2. Điểm kết quả thực hiện nhiệm vụ chuyên môn', valSelf: taskTotal, valFinal: taskTotal },
            { item: 'TỔNG ĐIỂM CHẤM (100 điểm)', valSelf: totalSelf, valFinal: totalFinal },
            { item: 'XẾP LOẠI CHẤT LƯỢNG ĐỀ XUẤT', valSelf: selfClass, valFinal: propClass },
          ],
        });
      }
    }

    // --- MẪU 03: BẢN NHẬN XÉT, ĐÁNH GIÁ CỦA CẤP ỦY & TẬP THỂ PHÒNG ---
    if (isMau03) {
      const partyEl = doc.getElementsByTagName('PartyBranchComments')[0];
      if (partyEl) {
        result.textBlocks.push({
          title: 'I. Ý KIẾN NHẬN XÉT CỦA CHI BỘ NƠI CÔNG TÁC',
          items: [
            { prefix: '1. Về lập trường tư tưởng chính trị: ', content: sanitizeText(getDirectTagText(partyEl, 'PoliticalStance'), 'Gương mẫu, tuyệt đối trung thành với Đảng và Tổ quốc.') },
            { prefix: '2. Về phẩm chất đạo đức, lối sống: ', content: sanitizeText(getDirectTagText(partyEl, 'EthicalQualities'), 'Trong sạch, giữ gìn đoàn kết nội bộ, không vi phạm quy định.') },
            { prefix: '3. Mối quan hệ với quần chúng, đồng nghiệp: ', content: sanitizeText(getDirectTagText(partyEl, 'CommunityRelations'), 'Hòa đồng, gương mẫu, được tín nhiệm cao.') },
            { prefix: '4. Đánh giá xếp loại của Chi bộ: ', content: sanitizeText(getDirectTagText(partyEl, 'PartyBranchRating'), 'Đảng viên Hoàn thành xuất sắc nhiệm vụ') },
          ],
        });
      }

      const deptLeaderEl = doc.getElementsByTagName('DepartmentLeadershipComments')[0];
      if (deptLeaderEl) {
        result.textBlocks.push({
          title: 'II. Ý KIẾN NHẬN XÉT CỦA LÃNH ĐẠO PHÒNG CHUYÊN MÔN',
          items: [
            { prefix: '1. Thái độ làm việc, ý thức trách nhiệm: ', content: sanitizeText(getDirectTagText(deptLeaderEl, 'WorkAttitudeComment'), 'Tận tụy, chủ động, chấp hành nghiêm túc sự phân công.') },
            { prefix: '2. Kết quả hoàn thành chức trách, nhiệm vụ: ', content: sanitizeText(getDirectTagText(deptLeaderEl, 'TaskExecutionComment'), 'Đạt chất lượng cao, đúng tiến độ.') },
            { prefix: '3. Phối hợp công tác trong tập thể: ', content: sanitizeText(getDirectTagText(deptLeaderEl, 'TeamCoordinationComment'), 'Tích cực hỗ trợ đồng nghiệp hoàn thành nhiệm vụ chung.') },
            { prefix: '4. Những tồn tại, hạn chế (nếu có): ', content: sanitizeText(getDirectTagText(deptLeaderEl, 'IdentifiedShortcomings'), 'Không có khuyết điểm lớn.') },
            { prefix: '5. Phương hướng khắc phục và phát triển: ', content: sanitizeText(getDirectTagText(deptLeaderEl, 'ImprovementDirections'), 'Tiếp tục phát huy năng lực chuyên môn và nghiên cứu chuyển đổi số.') },
          ],
        });
      }

      const reviewerCommentNodes = Array.from(doc.querySelectorAll('ReviewerComments > Comment')) as Element[];
      if (reviewerCommentNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        reviewerCommentNodes.forEach((node: Element, idx: number) => {
          rows.push({
            stt: String(idx + 1),
            reviewerName: sanitizeText(getDirectTagText(node, 'ReviewerName'), `Thành viên ${idx + 1}`),
            reviewerTitle: sanitizeText(getDirectTagText(node, 'ReviewerTitle'), 'Chuyên viên'),
            content: sanitizeText(getDirectTagText(node, 'Content'), 'Nhất trí với kết quả tự đánh giá.'),
          });
        });

        result.tables.push({
          title: 'III. Ý KIẾN GÓP Ý CỦA CÁC THÀNH VIÊN TRONG PHÒNG',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'reviewerName', label: 'Người nhận xét', widthPct: 22, bold: true },
            { key: 'reviewerTitle', label: 'Chức danh', widthPct: 20, align: AlignmentType.CENTER },
            { key: 'content', label: 'Nội dung nhận xét, góp ý', widthPct: 50 },
          ],
          rows,
        });
      }
    }

    // --- MẪU 04: BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ TẬP THỂ PHÒNG & VIỆC NỔI TRỘI ---
    if (isMau04) {
      result.signatureType = 'DEPARTMENT';
      result.signers.leftTitle = 'NGƯỜI TỔNG HỢP';
      result.signers.leftSubtitle = '(Ký, ghi rõ họ và tên)';
      result.signers.rightTitle = 'TRƯỞNG PHÒNG CHUYÊN MÔN';
      result.signers.rightSubtitle = '(Ký, ghi rõ họ và tên)';

      // 1. Thống kê xếp loại phòng
      const deptStatEl = doc.getElementsByTagName('DepartmentStatistics')[0];
      if (deptStatEl) {
        const totalStaff = deptStatEl.getAttribute('totalStaff') || '-';
        const evaluatedStaff = deptStatEl.getAttribute('evaluatedStaff') || '-';
        const distEl = deptStatEl.getElementsByTagName('StaffRankDistribution')[0];
        const excEl = distEl?.getElementsByTagName('ExcellentCount')[0];

        result.tables.push({
          title: 'I. THỐNG KÊ PHÂN BỔ XẾP LOẠI CỦA PHÒNG (Khống chế trần xuất sắc <= 20%)',
          columns: [
            { key: 'metric', label: 'Chỉ tiêu thống kê', widthPct: 60, bold: true },
            { key: 'value', label: 'Số lượng / Tỷ lệ thực tế', widthPct: 40, align: AlignmentType.CENTER },
          ],
          rows: [
            { metric: 'Tổng số cán bộ, công chức thuộc phòng', value: `${totalStaff} người` },
            { metric: 'Số cán bộ, công chức được đánh giá, xếp loại', value: `${evaluatedStaff} người` },
            { metric: 'Đề xuất Hoàn thành xuất sắc nhiệm vụ (Tối đa 20%)', value: `${excEl?.getAttribute('proposed') || '-'} / ${excEl?.getAttribute('maxAllowed') || '-'} người (${excEl?.getAttribute('quotaPercent') || '20'}%)` },
            { metric: 'Đề xuất Hoàn thành tốt nhiệm vụ', value: `${sanitizeText(getDirectTagText(distEl, 'GoodCount'), '0')} người` },
            { metric: 'Đề xuất Hoàn thành nhiệm vụ', value: `${sanitizeText(getDirectTagText(distEl, 'FairCount'), '0')} người` },
            { metric: 'Đề xuất Không hoàn thành nhiệm vụ', value: `${sanitizeText(getDirectTagText(distEl, 'PoorCount'), '0')} người` },
          ],
        });
      }

      // 2. Bảng tổng hợp chi tiết cán bộ phòng
      const staffRows = Array.from(doc.querySelectorAll('StaffSummaryTable > StaffRow')) as Element[];
      if (staffRows.length > 0) {
        const rows: Array<Record<string, string>> = [];
        staffRows.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('orderNumber') || String(idx + 1),
            empCode: sanitizeText(getDirectTagText(node, 'EmployeeCode'), '-'),
            fullName: sanitizeText(getDirectTagText(node, 'FullName'), `Cán bộ ${idx + 1}`),
            jobTitle: sanitizeText(getDirectTagText(node, 'JobTitle'), 'Chuyên viên'),
            genScore: sanitizeText(getDirectTagText(node, 'GeneralScore'), '-'),
            taskScore: sanitizeText(getDirectTagText(node, 'TaskScore'), '-'),
            totalScore: sanitizeText(getDirectTagText(node, 'TotalScore'), '-'),
            proposedRank: sanitizeText(getDirectTagText(node, 'ProposedRank'), 'Hoàn thành tốt nhiệm vụ'),
          });
        });

        result.tables.push({
          title: 'II. BẢNG TỔNG HỢP ĐÁNH GIÁ, XẾP LOẠI TỪNG CÁN BỘ, CÔNG CHỨC',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'fullName', label: 'Họ và tên cán bộ', widthPct: 26, bold: true },
            { key: 'jobTitle', label: 'Chức danh', widthPct: 16, align: AlignmentType.CENTER },
            { key: 'genScore', label: 'Tiêu chí chung (30đ)', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'taskScore', label: 'Nhiệm vụ (70đ)', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'totalScore', label: 'Tổng điểm', widthPct: 10, align: AlignmentType.CENTER, bold: true },
            { key: 'proposedRank', label: 'Xếp loại đề xuất', widthPct: 18, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      // 3. Kê khai nhiệm vụ nổi trội
      const outstandingNodes = Array.from(doc.querySelectorAll('OutstandingTasksRegistry > RegistryItem')) as Element[];
      if (outstandingNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        outstandingNodes.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('orderNumber') || String(idx + 1),
            empName: sanitizeText(getDirectTagText(node, 'EmployeeName'), `Cán bộ ${idx + 1}`),
            taskTitle: sanitizeText(getDirectTagText(node, 'TaskTitle'), '-'),
            achieve: sanitizeText(getDirectTagText(node, 'AchievementsSummary'), '-'),
            bonus: `+${sanitizeText(getDirectTagText(node, 'BonusScoreAdded'), '10')}%`,
          });
        });

        result.tables.push({
          title: 'III. KÊ KHAI SẢN PHẨM / NHIỆM VỤ NỔI TRỘI, VƯỢT MỨC ĐƯỢC THƯỞNG ĐIỂM (+10%)',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'empName', label: 'Họ và tên cán bộ', widthPct: 22, bold: true },
            { key: 'taskTitle', label: 'Nhiệm vụ nổi trội', widthPct: 32 },
            { key: 'achieve', label: 'Thành tích vượt mức', widthPct: 30 },
            { key: 'bonus', label: 'Điểm thưởng', widthPct: 10, align: AlignmentType.CENTER, bold: true },
          ],
          rows,
        });
      }

      // Chữ ký Mẫu 04
      const deptSigEl = doc.getElementsByTagName('DepartmentSignatures')[0];
      if (deptSigEl) {
        const compEl = deptSigEl.getElementsByTagName('Compiler')[0];
        if (compEl) {
          result.signers.leftName = sanitizeText(getDirectTagText(compEl, 'Name'), '');
          const compTitle = sanitizeText(getDirectTagText(compEl, 'Title'));
          if (compTitle) result.signers.leftTitle = compTitle.toUpperCase();
        }
        const headEl = deptSigEl.getElementsByTagName('DepartmentHead')[0];
        if (headEl) {
          result.signers.rightName = sanitizeText(getDirectTagText(headEl, 'Name'), '');
          const headTitle = sanitizeText(getDirectTagText(headEl, 'Title'));
          if (headTitle) result.signers.rightTitle = headTitle.toUpperCase();
        }
      }
    }

    // --- MẪU 05: DỰ THẢO QUYẾT ĐỊNH & BẢNG TỔNG HỢP XẾP LOẠI TOÀN CƠ QUAN ---
    if (isMau05) {
      result.signatureType = 'DECISION';

      // 1. Thống kê tỷ lệ khống chế xuất sắc 20%
      const statEl = doc.getElementsByTagName('AgencyStatisticsSummary')[0];
      if (statEl) {
        const quotaEl = statEl.getElementsByTagName('ExcellentQuotaControl')[0];
        if (quotaEl) {
          result.tables.push({
            title: 'KIỂM SOÁT TỶ LỆ XẾP LOẠI XUẤT SẮC TOÀN CƠ QUAN (Khống chế <= 20%)',
            columns: [
              { key: 'indicator', label: 'Chỉ tiêu kiểm soát', widthPct: 60, bold: true },
              { key: 'val', label: 'Số lượng / Tỷ lệ thực tế', widthPct: 40, align: AlignmentType.CENTER },
            ],
            rows: [
              { indicator: 'Tổng số cán bộ, công chức đạt mức "Hoàn thành tốt nhiệm vụ" trở lên', val: sanitizeText(getDirectTagText(quotaEl, 'GoodOrBetterTotal'), '0') },
              { indicator: 'Số lượng tối đa được xếp loại "Hoàn thành xuất sắc nhiệm vụ" (tối đa 20%)', val: sanitizeText(getDirectTagText(quotaEl, 'MaxExcellentAllowed20Pct'), '0') },
              { indicator: 'Số lượng đề xuất xếp loại "Hoàn thành xuất sắc nhiệm vụ" thực tế', val: sanitizeText(getDirectTagText(quotaEl, 'ActualExcellentApproved'), '0') },
              { indicator: 'Tình trạng tuân thủ trần định mức', val: sanitizeText(getDirectTagText(quotaEl, 'QuotaComplianceStatus'), 'Đạt chuẩn (Hợp lệ)') },
            ],
          });
        }
      }

      // 2. Bảng xếp loại cá nhân toàn cơ quan
      const rankingNodes = Array.from(doc.querySelectorAll('IndividualFinalRankings > OfficerRankingItem')) as Element[];
      if (rankingNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        rankingNodes.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('orderNumber') || String(idx + 1),
            empCode: sanitizeText(getDirectTagText(node, 'EmployeeCode'), '-'),
            fullName: sanitizeText(getDirectTagText(node, 'FullName'), `Công chức ${idx + 1}`),
            deptName: sanitizeText(getDirectTagText(node, 'DepartmentName'), 'Ban Tổ chức Tỉnh ủy'),
            jobTitle: sanitizeText(getDirectTagText(node, 'JobTitle'), 'Chuyên viên'),
            totalScore: sanitizeText(getDirectTagText(node, 'TotalScore'), '-'),
            officialRank: sanitizeText(getDirectTagText(node, 'OfficialRank'), 'Hoàn thành tốt nhiệm vụ'),
          });
        });

        result.tables.push({
          title: 'BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI CÁN BỘ, CÔNG CHỨC',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'fullName', label: 'Họ và tên cán bộ', widthPct: 24, bold: true },
            { key: 'empCode', label: 'Mã số', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'deptName', label: 'Đơn vị công tác', widthPct: 22 },
            { key: 'jobTitle', label: 'Chức danh', widthPct: 14 },
            { key: 'totalScore', label: 'Tổng điểm', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'officialRank', label: 'Xếp loại chính thức', widthPct: 14, align: AlignmentType.CENTER, bold: true },
          ],
          rows,
        });
      }

      // 3. Các điều khoản quyết định
      const termsEl = doc.getElementsByTagName('DecisionTerms')[0];
      if (termsEl) {
        const termItems: Array<{ prefix: string; content: string }> = [];
        const art1 = sanitizeText(getDirectTagText(termsEl, 'Article1'));
        if (art1) termItems.push({ prefix: 'Điều 1. ', content: art1 });
        const art2 = sanitizeText(getDirectTagText(termsEl, 'Article2'));
        if (art2) termItems.push({ prefix: 'Điều 2. ', content: art2 });
        const art3 = sanitizeText(getDirectTagText(termsEl, 'Article3'));
        if (art3) termItems.push({ prefix: 'Điều 3. ', content: art3 });

        if (termItems.length > 0) {
          result.textBlocks.push({
            title: 'QUYẾT ĐỊNH:',
            items: termItems,
          });
        }
      }

      // Chữ ký Mẫu 05: Thủ trưởng cơ quan ban hành
      const promEl = doc.getElementsByTagName('PromulgationSignature')[0];
      if (promEl) {
        result.signers.rightTitle = sanitizeText(getDirectTagText(promEl, 'SignerTitle'), 'TRƯỞNG BAN TỔ CHỨC TỈNH ỦY');
        result.signers.rightName = sanitizeText(getDirectTagText(promEl, 'SignerName'), '');
        result.signers.leftTitle = 'Nơi nhận:';
        result.signers.leftSubtitle = '- Thường trực Tỉnh ủy (để b/c);\n- Lãnh đạo Ban;\n- Các phòng chuyên môn;\n- Lưu: VT, TC-CB.';
      }
    }

    // --- GENERIC XML: Nếu không khớp mẫu chuẩn nào, tự động quét cây XML ---
    if (!isMau01 && !isMau02 && !isMau03 && !isMau04 && !isMau05) {
      const allElements = doc.getElementsByTagName('*');
      const processedContainers = new Set<Element>();

      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        if (!el || processedContainers.has(el)) continue;

        const children = el.children;
        if (children.length >= 2) {
          const firstChildTag = children[0].tagName;
          let isHomogeneous = true;
          for (let c = 1; c < children.length; c++) {
            if (children[c].tagName !== firstChildTag) {
              isHomogeneous = false;
              break;
            }
          }

          if (isHomogeneous && children.length > 0) {
            processedContainers.add(el);
            const fieldKeys = new Set<string>();
            const rowList: Array<Record<string, string>> = [];

            for (let c = 0; c < children.length; c++) {
              const item = children[c];
              const rowObj: Record<string, string> = { stt: String(c + 1) };
              for (let a = 0; a < item.attributes.length; a++) {
                const attr = item.attributes[a];
                fieldKeys.add(attr.name);
                rowObj[attr.name] = attr.value;
              }
              for (let sub = 0; sub < item.children.length; sub++) {
                const subNode = item.children[sub];
                fieldKeys.add(subNode.tagName);
                rowObj[subNode.tagName] = subNode.textContent?.trim() || '';
              }
              rowList.push(rowObj);
            }

            const columns: DynamicTableColumn[] = [
              { key: 'stt', label: 'STT', widthPct: 8, align: AlignmentType.CENTER },
            ];
            const remainingPct = 92;
            const keyArray = Array.from(fieldKeys).slice(0, 5);
            const colWidth = Math.floor(remainingPct / (keyArray.length || 1));

            keyArray.forEach((k: string) => {
              columns.push({
                key: k,
                label: TAG_LABEL_MAP[k] || k,
                widthPct: colWidth,
              });
            });

            result.tables.push({
              title: `DANH SÁCH ${el.tagName.toUpperCase()}`,
              columns,
              rows: rowList,
            });
          }
        }
      }
    }

    // 5. Trích xuất chữ ký chung (WorkflowSignatures) nếu chưa có chữ ký đặc thù
    if (result.signatureType !== 'DECISION' && result.signatureType !== 'DEPARTMENT') {
      const sigsEl = doc.getElementsByTagName('WorkflowSignatures')[0];
      if (sigsEl) {
        const offSign = sigsEl.getElementsByTagName('OfficerConfirmation')[0] || sigsEl.getElementsByTagName('OfficerSignature')[0];
        if (offSign) {
          result.signers.leftName = sanitizeText(getDirectTagText(offSign, 'SignerName'), '');
        }

        const deptSign = sigsEl.getElementsByTagName('DepartmentLeaderApproval')[0] || sigsEl.getElementsByTagName('DepartmentReviewerSignature')[0];
        if (deptSign) {
          result.signers.rightName = sanitizeText(getDirectTagText(deptSign, 'ApproverName') || getDirectTagText(deptSign, 'ReviewerName'), '');
          const title = sanitizeText(getDirectTagText(deptSign, 'ApproverTitle') || getDirectTagText(deptSign, 'ReviewerTitle'));
          if (title) result.signers.rightTitle = title.toUpperCase();
        }
      }
    }
  } catch {
    // Parser fallback an toàn
  }

  return result;
}

/**
 * Kiểu viền bảng mỏng đơn sắc chuẩn văn bản hành chính Việt Nam (0.5 pt, màu đen)
 */
const TABLE_BORDER_THIN = {
  style: BorderStyle.SINGLE,
  size: 4, // 0.5 pt
  color: '000000',
};

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

/**
 * Sinh file DOCX (Microsoft Word) dựa 100% vào dữ liệu thực tế từ cây XML
 * Chuẩn hóa 100% thể thức văn bản hành chính Việt Nam theo Nghị định 30/2020/NĐ-CP
 */
export async function generateKpiDocxBlob(xmlContent: string, templateTitle?: string): Promise<Blob> {
  const data = parseKpiXml(xmlContent, templateTitle);

  // Tạo tài liệu Document docx
  const doc = new Document({
    creator: 'Hệ thống Quản trị DakLak Workspace - Nghị định 30/2020/NĐ-CP',
    title: data.documentTitle,
    description: `Biểu mẫu chuẩn hóa XML ${data.formCode} theo Hướng dẫn 05-HD/TU & Nghị định 30/2020/NĐ-CP`,
    styles: {
      default: {
        document: {
          run: {
            font: FONT_TIMES_NEW_ROMAN,
            size: 26, // 13 pt
            color: '000000',
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing theo chuẩn NĐ 30/2020
              before: 60, // 3 pt
              after: 60, // 3 pt
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // Khổ A4 chuẩn: 210 mm
              height: 16838, // Khổ A4 chuẩn: 297 mm
            },
            margin: {
              top: 1134, // 20 mm (Nghị định 30: 20-25 mm)
              bottom: 1134, // 20 mm (Nghị định 30: 20-25 mm)
              left: 1701, // 30 mm (Nghị định 30: 30-35 mm)
              right: 850, // 15 mm (Nghị định 30: 15-20 mm)
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  createTrTextRun({
                    text: `Mã biểu mẫu: ${data.formCode}`,
                    size: 18,
                    italics: true,
                    color: '475569',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  createTrTextRun({ text: 'Trang ', size: 22 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT_TIMES_NEW_ROMAN, size: 22 }),
                  createTrTextRun({ text: ' / ', size: 22 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_TIMES_NEW_ROMAN, size: 22 }),
                ],
              }),
            ],
          }),
        },
        children: [
          // 1. HEADER 2 CỘT CHUẨN NGHỊ ĐỊNH 30/2020 & THỂ THỨC ĐẢNG
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: NO_BORDER,
              bottom: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
              insideHorizontal: NO_BORDER,
              insideVertical: NO_BORDER,
            },
            rows: [
              new TableRow({
                children: [
                  // CỘT TRÁI: Tên cơ quan, tổ chức ban hành văn bản
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 20 },
                        children: [
                          createTrTextRun({
                            text: data.agencyName.toUpperCase(),
                            size: 24, // 12 pt, in hoa, đứng
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 20 },
                        children: [
                          createTrTextRun({
                            text: data.organizationName.toUpperCase(),
                            bold: true,
                            size: 24, // 12 pt, in hoa, đứng, đậm
                          }),
                        ],
                      }),
                      // Đường kẻ ngang nét liền thanh mảnh dưới tên cơ quan ban hành (bằng 1/3 - 1/2 dòng chữ)
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 40 },
                        children: [
                          createTrTextRun({
                            text: '\u00A0'.repeat(12),
                            underline: {
                              type: UnderlineType.SINGLE,
                              color: '000000',
                            },
                            size: 20,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 0 },
                        children: [
                          createTrTextRun({
                            text: data.decisionNumber ? `Số: ${data.decisionNumber}` : `Mẫu số: ${data.formCode}`,
                            size: 24, // 12 pt, đứng
                          }),
                        ],
                      }),
                    ],
                  }),

                  // CỘT PHẢI: Quốc hiệu và Tiêu ngữ (hoặc Thể thức Đảng)
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    children: data.isPartyAgency
                      ? [
                          // Thể thức văn bản của Đảng
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 20 },
                            children: [
                              createTrTextRun({
                                text: 'ĐẢNG CỘNG SẢN VIỆT NAM',
                                bold: true,
                                size: 26, // 13 pt, in hoa, đậm
                              }),
                            ],
                          }),
                          // Đường kẻ ngang nét liền dưới tiêu đề Đảng
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 40 },
                            children: [
                              createTrTextRun({
                                text: '\u00A0'.repeat(16),
                                underline: {
                                  type: UnderlineType.SINGLE,
                                  color: '000000',
                                },
                                size: 20,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 40, after: 0 },
                            children: [
                              createTrTextRun({
                                text: data.signers.rightDate || `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
                                italics: true,
                                size: 26, // 13 pt, nghiêng
                              }),
                            ],
                          }),
                        ]
                      : [
                          // Thể thức Quốc hiệu Nhà nước theo Nghị định 30/2020
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 20 },
                            children: [
                              createTrTextRun({
                                text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                                bold: true,
                                size: 24, // 12 pt, in hoa, đứng, đậm
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 20 },
                            children: [
                              createTrTextRun({
                                text: 'Độc lập - Tự do - Hạnh phúc',
                                bold: true,
                                size: 26, // 13 pt, in thường, đứng, đậm
                              }),
                            ],
                          }),
                          // Đường kẻ ngang nét liền bằng độ dài dòng chữ
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 0, after: 40 },
                            children: [
                              createTrTextRun({
                                text: '\u00A0'.repeat(20),
                                underline: {
                                  type: UnderlineType.SINGLE,
                                  color: '000000',
                                },
                                size: 20,
                              }),
                            ],
                          }),
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 40, after: 0 },
                            children: [
                              createTrTextRun({
                                text: data.signers.rightDate || `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
                                italics: true,
                                size: 26, // 13 pt, nghiêng
                              }),
                            ],
                          }),
                        ],
                  }),
                ],
              }),
            ],
          }),

          // 2. TIÊU ĐỀ BIỂU MẪU (In hoa, cỡ 14-15 pt, đứng, đậm, căn giữa)
          new Paragraph({
            spacing: { before: 280, after: 60 },
            alignment: AlignmentType.CENTER,
            children: [
              createTrTextRun({
                text: data.documentTitle.toUpperCase(),
                bold: true,
                size: 30, // 15 pt
                color: '000000',
              }),
            ],
          }),

          // Phụ đề / Kỳ đánh giá (nếu có)
          ...(data.periodName
            ? [
                new Paragraph({
                  spacing: { before: 0, after: 180 },
                  alignment: AlignmentType.CENTER,
                  children: [
                    createTrTextRun({
                      text: `(Kỳ đánh giá: ${data.periodName})`,
                      bold: true,
                      italics: true,
                      size: 26, // 13 pt
                    }),
                  ],
                }),
              ]
            : []),

          // 3. THÔNG TIN CÁN BỘ / ĐỐI TƯỢNG (Nếu trong XML có các trường thông tin)
          ...(data.profileFields.length > 0
            ? [
                ...data.profileFields.map(
                  (field) =>
                    new Paragraph({
                      spacing: { before: 40, after: 40 },
                      indent: { firstLine: 720 }, // Thụt đầu dòng 1.27 cm
                      alignment: AlignmentType.LEFT,
                      children: [
                        createTrTextRun({
                          text: `${field.label}: `,
                          bold: true,
                          size: 26, // 13 pt
                        }),
                        createTrTextRun({
                          text: field.value,
                          size: 26,
                        }),
                      ],
                    }),
                ),
                new Paragraph({ spacing: { before: 40, after: 80 }, children: [] }),
              ]
            : []),

          // 4. CĂN CỨ PHÁP LÝ (Cỡ 13-14 pt, nghiêng, thụt đầu dòng 1.27 cm)
          ...(data.legalBasis.length > 0
            ? [
                ...data.legalBasis.map(
                  (basis: string, bIdx: number) =>
                    new Paragraph({
                      spacing: { before: 30, after: 30 },
                      indent: { firstLine: 720 },
                      alignment: AlignmentType.JUSTIFIED,
                      children: [
                        createTrTextRun({
                          text: `${basis}${bIdx === data.legalBasis.length - 1 ? '.' : ';'}`,
                          italics: true,
                          size: 26, // 13 pt
                        }),
                      ],
                    }),
                ),
                new Paragraph({ spacing: { before: 40, after: 80 }, children: [] }),
              ]
            : []),

          // 5. CÁC BẢNG DỮ LIỆU ĐỘNG (Render từng bảng theo cấu trúc XML)
          ...data.tables.flatMap((table: DynamicXmlTable) => [
            ...(table.title
              ? [
                  new Paragraph({
                    spacing: { before: 200, after: 80 },
                    alignment: AlignmentType.LEFT,
                    children: [
                      createTrTextRun({
                        text: table.title,
                        bold: true,
                        size: 26, // 13 pt, đậm
                      }),
                    ],
                  }),
                ]
              : []),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: TABLE_BORDER_THIN,
                bottom: TABLE_BORDER_THIN,
                left: TABLE_BORDER_THIN,
                right: TABLE_BORDER_THIN,
                insideHorizontal: TABLE_BORDER_THIN,
                insideVertical: TABLE_BORDER_THIN,
              },
              rows: [
                // Header Table
                new TableRow({
                  tableHeader: true,
                  cantSplit: true,
                  children: table.columns.map(
                    (col: DynamicTableColumn) =>
                      new TableCell({
                        width: { size: col.widthPct, type: WidthType.PERCENTAGE },
                        shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 60, after: 60 },
                            children: [
                              createTrTextRun({
                                text: col.label,
                                bold: true,
                                size: 24, // 12 pt trong bảng
                              }),
                            ],
                          }),
                        ],
                      }),
                  ),
                }),
                // Data Rows
                ...table.rows.map(
                  (row: Record<string, string>) =>
                    new TableRow({
                      cantSplit: true,
                      children: table.columns.map(
                        (col: DynamicTableColumn) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                              new Paragraph({
                                alignment: col.align || AlignmentType.LEFT,
                                spacing: { before: 40, after: 40 },
                                children: [
                                  createTrTextRun({
                                    text: row[col.key] || '',
                                    bold: col.bold || false,
                                    size: 24, // 12 pt
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ),
                    }),
                ),
              ],
            }),
          ]),

          // 6. CÁC KHỐI VĂN BẢN ĐIỀU KHOẢN / CAM KẾT / NHẬN XÉT
          ...data.textBlocks.flatMap((block: DynamicTextBlock) => [
            new Paragraph({
              spacing: { before: 200, after: 80 },
              alignment: AlignmentType.LEFT,
              children: [
                createTrTextRun({
                  text: block.title,
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            ...block.items.map(
              (item) =>
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  indent: { firstLine: 720 },
                  alignment: AlignmentType.JUSTIFIED,
                  children: [
                    ...(item.prefix
                      ? [
                          createTrTextRun({
                            text: item.prefix,
                            bold: true,
                            size: 26,
                          }),
                        ]
                      : []),
                    createTrTextRun({
                      text: item.content,
                      size: 26,
                    }),
                  ],
                }),
            ),
          ]),

          // 7. KHUNG CHỮ KÝ THEO CHUẨN THỂ THỨC ĐẢNG & NGHỊ ĐỊNH 30/2020
          new Paragraph({ spacing: { before: 260, after: 60 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: NO_BORDER,
              bottom: NO_BORDER,
              left: NO_BORDER,
              right: NO_BORDER,
              insideHorizontal: NO_BORDER,
              insideVertical: NO_BORDER,
            },
            rows: [
              new TableRow({
                cantSplit: true,
                children: [
                  // CỘT TRÁI (Nơi nhận hoặc Người tự đánh giá / Người lập)
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    children:
                      data.signatureType === 'DECISION'
                        ? [
                            // Nơi nhận trong văn bản Quyết định
                            new Paragraph({
                              alignment: AlignmentType.LEFT,
                              spacing: { before: 0, after: 20 },
                              children: [
                                createTrTextRun({
                                  text: 'Nơi nhận:',
                                  bold: true,
                                  italics: true,
                                  size: 24, // 12 pt
                                }),
                              ],
                            }),
                            new Paragraph({
                              alignment: AlignmentType.LEFT,
                              spacing: { before: 0, after: 20 },
                              children: [
                                createTrTextRun({
                                  text: data.signers.leftSubtitle || '- Như Điều 3;\n- Ban Thường vụ Tỉnh ủy (b/c);\n- Lãnh đạo Ban;\n- Lưu: VT, TC-CB.',
                                  size: 22, // 11 pt
                                }),
                              ],
                            }),
                          ]
                        : [
                            // Người tự đánh giá / Người lập biểu
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              spacing: { before: 0, after: 20 },
                              children: [
                                createTrTextRun({
                                  text: (data.signers.leftTitle || 'NGƯỜI TỰ ĐÁNH GIÁ').toUpperCase(),
                                  bold: true,
                                  size: 26, // 13 pt, in hoa, đậm
                                }),
                              ],
                            }),
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              spacing: { before: 0, after: 20 },
                              children: [
                                createTrTextRun({
                                  text: data.signers.leftSubtitle || '(Ký, ghi rõ họ và tên)',
                                  italics: true,
                                  size: 24, // 12 pt, nghiêng
                                }),
                              ],
                            }),
                            // Khoảng trống 4 dòng để ký tên
                            new Paragraph({ spacing: { before: 800, after: 0 }, children: [] }),
                            new Paragraph({
                              alignment: AlignmentType.CENTER,
                              spacing: { before: 0, after: 0 },
                              children: [
                                createTrTextRun({
                                  text: data.signers.leftName || '',
                                  bold: true,
                                  size: 26, // 13 pt, đậm
                                }),
                              ],
                            }),
                          ],
                  }),

                  // CỘT PHẢI (Lãnh đạo phê duyệt / Trưởng phòng / Trưởng ban)
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    verticalAlign: VerticalAlign.TOP,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 20 },
                        children: [
                          createTrTextRun({
                            text: (data.signers.rightTitle || 'TRƯỞNG PHÒNG CHUYÊN MÔN').toUpperCase(),
                            bold: true,
                            size: 26, // 13 pt, in hoa, đậm
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 20 },
                        children: [
                          createTrTextRun({
                            text: data.signers.rightSubtitle || '(Ký, ghi rõ họ và tên)',
                            italics: true,
                            size: 24, // 12 pt, nghiêng
                          }),
                        ],
                      }),
                      // Khoảng trống 4 dòng để ký tên
                      new Paragraph({ spacing: { before: 800, after: 0 }, children: [] }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 0, after: 0 },
                        children: [
                          createTrTextRun({
                            text: data.signers.rightName || '',
                            bold: true,
                            size: 26, // 13 pt, đậm
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Tải file trực tiếp về máy tính người dùng
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Tải file XML chuẩn UTF-8 có Byte Order Mark (BOM \uFEFF)
 * Ngăn chặn triệt để lỗi font chữ tiếng Việt khi mở trên Windows Notepad, Excel, Word
 */
export function exportKpiXmlFile(xmlContent: string, fileName: string) {
  const contentWithBom = xmlContent.startsWith('\uFEFF') ? xmlContent : `\uFEFF${xmlContent}`;
  const blob = new Blob([contentWithBom], { type: 'application/xml;charset=utf-8' });
  downloadBlob(blob, fileName.endsWith('.xml') ? fileName : `${fileName}.xml`);
}

/**
 * Xuất file Word DOCX chuẩn thể thức hành chính theo Nghị định 30/2020 từ nội dung XML
 */
export async function exportKpiDocxFile(xmlContent: string, fileName: string, templateTitle?: string) {
  const blob = await generateKpiDocxBlob(xmlContent, templateTitle);
  downloadBlob(blob, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
}

/**
 * Tạo nội dung HTML văn bản hành chính thuần túy chuẩn Nghị định 30/2020/NĐ-CP
 * Chỉ bao gồm 100% nội dung văn bản, không có bất kỳ nút bấm, banner hay điều khiển dư thừa nào
 */
export function generatePrintDocumentHtml(data: ParsedXmlDocumentData): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>${data.documentTitle} - ${data.formCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    @page {
      size: A4 portrait;
      margin: 20mm 15mm 20mm 30mm; /* Chuẩn NĐ 30/2020: trên 20mm, dưới 20mm, trái 30mm, phải 15mm */
    }
    * {
      box-sizing: border-box;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Times New Roman', 'Tinos', Times, serif !important;
      font-size: 13pt;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .document-container {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      text-align: center;
      padding: 0 6px;
    }
    .agency-name {
      font-size: 12pt;
      text-transform: uppercase;
    }
    .org-name {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .party-title {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .state-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
    }
    .motto {
      font-size: 13pt;
      font-weight: bold;
    }
    .divider-solid {
      height: 1px;
      background-color: #000;
      margin: 4px auto 6px auto;
    }
    .date-str {
      font-size: 13pt;
      font-style: italic;
      margin-top: 6px;
    }
    .doc-num {
      font-size: 12pt;
      margin-top: 4px;
    }
    .doc-title {
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      margin: 24px 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-period {
      font-size: 13pt;
      font-style: italic;
      font-weight: bold;
      text-align: center;
      margin-bottom: 18px;
    }
    .profile-list {
      margin-bottom: 16px;
      font-size: 13pt;
    }
    .profile-item {
      margin: 5px 0;
      text-indent: 1.27cm;
    }
    .profile-label {
      font-weight: bold;
    }
    .legal-basis {
      font-style: italic;
      font-size: 13pt;
      margin-bottom: 16px;
      text-align: justify;
    }
    .legal-basis div {
      margin: 4px 0;
      text-indent: 1.27cm;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin: 18px 0 8px 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 20px 0;
      page-break-inside: auto;
    }
    .data-table th, .data-table td {
      border: 1px solid #000;
      padding: 6px 8px;
      font-size: 11.5pt;
      line-height: 1.25;
    }
    .data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .data-table tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    .text-block-item {
      margin: 6px 0;
      font-size: 13pt;
      text-align: justify;
      text-indent: 1.27cm;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 30px;
      page-break-inside: avoid;
    }
    .sig-table td {
      border: none;
      vertical-align: top;
      width: 50%;
    }
    .sig-title {
      font-weight: bold;
      font-size: 13pt;
      text-transform: uppercase;
    }
    .sig-sub {
      font-style: italic;
      font-size: 12pt;
    }
    .sig-space {
      height: 80px;
    }
    .sig-name {
      font-weight: bold;
      font-size: 13pt;
    }
    .recipients-title {
      font-weight: bold;
      font-style: italic;
      font-size: 12pt;
      text-align: left;
    }
    .recipients-content {
      font-size: 11pt;
      text-align: left;
      line-height: 1.3;
      white-space: pre-line;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 20mm 15mm 20mm 30mm;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="document-container">
    <table class="header-table">
      <tr>
        <td style="width: 45%;">
          <div class="agency-name">${data.agencyName}</div>
          <div class="org-name">${data.organizationName}</div>
          <div class="divider-solid" style="width: 110px;"></div>
          <div class="doc-num">${data.decisionNumber ? `Số: ${data.decisionNumber}` : `Mẫu số: ${data.formCode}`}</div>
        </td>
        <td style="width: 55%;">
          ${data.isPartyAgency ? `
            <div class="party-title">ĐẢNG CỘNG SẢN VIỆT NAM</div>
            <div class="divider-solid" style="width: 130px;"></div>
          ` : `
            <div class="state-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div class="motto">Độc lập - Tự do - Hạnh phúc</div>
            <div class="divider-solid" style="width: 160px;"></div>
          `}
          <div class="date-str">${data.signers.rightDate || `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`}</div>
        </td>
      </tr>
    </table>

    <div class="doc-title">${data.documentTitle}</div>
    ${data.periodName ? `<div class="doc-period">(Kỳ đánh giá: ${data.periodName})</div>` : ''}

    ${data.profileFields.length > 0 ? `
      <div class="profile-list">
        ${data.profileFields.map((f: { label: string; value: string }) => `<div class="profile-item"><span class="profile-label">${f.label}:</span> ${f.value}</div>`).join('')}
      </div>
    ` : ''}

    ${data.legalBasis.length > 0 ? `
      <div class="legal-basis">
        ${data.legalBasis.map((b: string, idx: number) => `<div>${b}${idx === data.legalBasis.length - 1 ? '.' : ';'}</div>`).join('')}
      </div>
    ` : ''}

    ${data.tables.map((t: DynamicXmlTable) => `
      ${t.title ? `<div class="section-title">${t.title}</div>` : ''}
      <table class="data-table">
        <thead>
          <tr>
            ${t.columns.map((c: DynamicTableColumn) => `<th style="width: ${c.widthPct}%;">${c.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${t.rows.map((r: Record<string, string>) => `
            <tr>
              ${t.columns.map((c: DynamicTableColumn) => `<td style="text-align: ${c.align === AlignmentType.CENTER ? 'center' : c.align === AlignmentType.RIGHT ? 'right' : 'left'}; font-weight: ${c.bold ? 'bold' : 'normal'};">${r[c.key] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `).join('')}

    ${data.textBlocks.map((b: DynamicTextBlock) => `
      <div class="section-title">${b.title}</div>
      ${b.items.map((it) => `<div class="text-block-item"><strong>${it.prefix || ''}</strong>${it.content}</div>`).join('')}
    `).join('')}

    <table class="sig-table">
      <tr>
        <td style="text-align: ${data.signatureType === 'DECISION' ? 'left' : 'center'};">
          ${data.signatureType === 'DECISION' ? `
            <div class="recipients-title">Nơi nhận:</div>
            <div class="recipients-content">${data.signers.leftSubtitle || '- Như Điều 3;\n- Ban Thường vụ Tỉnh ủy (b/c);\n- Lãnh đạo Ban;\n- Lưu: VT, TC-CB.'}</div>
          ` : `
            <div class="sig-title">${(data.signers.leftTitle || 'NGƯỜI TỰ ĐÁNH GIÁ').toUpperCase()}</div>
            <div class="sig-sub">${data.signers.leftSubtitle || '(Ký, ghi rõ họ và tên)'}</div>
            <div class="sig-space"></div>
            <div class="sig-name">${data.signers.leftName || ''}</div>
          `}
        </td>
        <td style="text-align: center;">
          <div class="sig-title">${(data.signers.rightTitle || 'TRƯỞNG PHÒNG CHUYÊN MÔN').toUpperCase()}</div>
          <div class="sig-sub">${data.signers.rightSubtitle || '(Ký, ghi rõ họ và tên)'}</div>
          <div class="sig-space"></div>
          <div class="sig-name">${data.signers.rightName || ''}</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * In / Xuất PDF trực tiếp từ trình duyệt theo chuẩn văn bản hành chính Nghị định 30/2020/NĐ-CP
 * In trực tiếp qua iframe ẩn chuyên dụng: CHỈ IN NỘI DUNG VĂN BẢN, KHÔNG IN NỘI DUNG DƯ THỪA XUNG QUANH
 */
export function printKpiXmlDocument(xmlContent: string, templateTitleFallback?: string) {
  if (typeof window === 'undefined') return;

  const data = parseKpiXml(xmlContent, templateTitleFallback);
  const htmlContent = generatePrintDocumentHtml(data);

  // Tạo một iframe ẩn chuyên dụng để kích hoạt in trực tiếp
  // Không mở cửa sổ pop-up thừa, không có banner, nút bấm hay các viền điều khiển xung quanh
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc || !iframe.contentWindow) {
    // Fallback an toàn nếu trình duyệt chặn tạo context iframe
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Đợi nạp font và DOM hoàn tất rồi kích hoạt hộp thoại in ngay lập tức
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      // Tự động dọn dẹp iframe sau khi đóng hộp thoại in
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
}
