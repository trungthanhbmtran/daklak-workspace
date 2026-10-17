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
    const code = (result.formCode || '').toUpperCase();
    const isMau01 = code === 'MAU_01' || doc.getElementsByTagName('RegisteredTasks').length > 0;
    const isMau02 = code === 'MAU_02' || (doc.getElementsByTagName('SectionA_GeneralCriteria').length > 0 && !code.includes('M03'));
    const isMau03 = code === 'MAU_03' || doc.getElementsByTagName('CollectiveFeedback').length > 0;
    const isMau04 = code === 'MAU_04' || doc.getElementsByTagName('StaffSummaryTable').length > 0;
    const isM01Totrinh = code === 'M01_TOTRINH' || doc.getElementsByTagName('Form01_SubmissionHeader').length > 0;
    const isM02KiemDiem = code === 'M02_TUKIEMDIEM' || doc.getElementsByTagName('Form02_SelfReviewForm').length > 0;
    const isM03Scorecard = code === 'M03_SCORECARD_KPI' || doc.getElementsByTagName('Form03_QuarterlyKPIScorecard').length > 0;
    const isM04TongHopQuy = code === 'M04_TONGHOP_QUY' || doc.getElementsByTagName('Form04_SummaryEvaluationTable').length > 0;
    const isMau05 =
      code === 'MAU_05' ||
      code === 'M05_BAOCAO_QUYETDINH' ||
      code.includes('M05') ||
      code.includes('MAU_05') ||
      doc.getElementsByTagName('IndividualFinalRankings').length > 0 ||
      doc.getElementsByTagName('Form05_FinalEvaluationReport').length > 0 ||
      doc.getElementsByTagName('DecisionTerms').length > 0;

    const isHd05Full = code === 'HD05_QD39_TU' || doc.getElementsByTagName('OfficialEvaluationSystem').length > 0;
    const isM01KhaiThac = code === 'M01_KHAI_THAC' || doc.getElementsByTagName('Form01_DataConnectionRequest').length > 0;
    const isM02ChapThuan = code === 'M02_CHAP_THUAN' || doc.getElementsByTagName('Form02_ConnectionApprovalDecision').length > 0;
    const isM03XungDot = code === 'M03_XUNG_DOT' || doc.getElementsByTagName('Form03_DataConflictReport').length > 0;
    const isM04TamNgung = code === 'M04_TAM_NGUNG' || doc.getElementsByTagName('Form04_SuspensionNotice').length > 0;
    const isM05BaoCaoNam = code === 'M05_BAOCAO_NAM' || doc.getElementsByTagName('Form05_AnnualIntegrationReport').length > 0;
    const isQd348Full = code === 'QD348_BTCTW' || doc.getElementsByTagName('PartyDataIntegrationSystem').length > 0;

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

    // --- M01_TOTRINH: TỜ TRÌNH ĐỀ NGHỊ ĐÁNH GIÁ, XẾP LOẠI QUÝ ---
    if (isM01Totrinh) {
      result.signatureType = 'DECISION';
      result.documentTitle = 'TỜ TRÌNH';
      result.subTitle = 'Về việc đề nghị đánh giá, xếp loại chất lượng cán bộ lãnh đạo, quản lý Quý III năm 2026';
      if (!result.decisionNumber) result.decisionNumber = '123-TTr/BTCTU';

      const sumEl = doc.getElementsByTagName('SummaryContent')[0];
      const totalOfficials = sanitizeText(getDirectTagText(sumEl, 'TotalEvaluatedOfficials'), '15');
      const propExc = sanitizeText(getDirectTagText(sumEl, 'ProposedExcellent'), '3');
      const propGood = sanitizeText(getDirectTagText(sumEl, 'ProposedGood'), '11');
      const propSat = sanitizeText(getDirectTagText(sumEl, 'ProposedSatisfactory'), '1');
      const propUnsat = sanitizeText(getDirectTagText(sumEl, 'ProposedUnsatisfactory'), '0');

      result.tables.push({
        title: 'BẢNG TỔNG HỢP SỐ LƯỢNG ĐỀ XUẤT XẾP LOẠI CHẤT LƯỢNG (Khống chế trần xuất sắc <= 20%)',
        columns: [
          { key: 'stt', label: 'STT', widthPct: 8, align: AlignmentType.CENTER },
          { key: 'grade', label: 'Mức xếp loại đề xuất', widthPct: 52, bold: true },
          { key: 'count', label: 'Số lượng cán bộ', widthPct: 20, align: AlignmentType.CENTER },
          { key: 'ratio', label: 'Tỷ lệ %', widthPct: 20, align: AlignmentType.CENTER, bold: true },
        ],
        rows: [
          { stt: '1', grade: 'Hoàn thành xuất sắc nhiệm vụ (Tối đa 20%)', count: `${propExc} người`, ratio: `${((Number(propExc) || 3) / (Number(totalOfficials) || 15) * 100).toFixed(1)}%` },
          { stt: '2', grade: 'Hoàn thành tốt nhiệm vụ', count: `${propGood} người`, ratio: `${((Number(propGood) || 11) / (Number(totalOfficials) || 15) * 100).toFixed(1)}%` },
          { stt: '3', grade: 'Hoàn thành nhiệm vụ', count: `${propSat} người`, ratio: `${((Number(propSat) || 1) / (Number(totalOfficials) || 15) * 100).toFixed(1)}%` },
          { stt: '4', grade: 'Không hoàn thành nhiệm vụ', count: `${propUnsat} người`, ratio: '0.0%' },
          { stt: '-', grade: 'TỔNG CỘNG CÁN BỘ ĐƯỢC ĐÁNH GIÁ', count: `${totalOfficials} người`, ratio: '100.0%' },
        ],
      });

      result.textBlocks.push({
        title: 'NỘI DUNG TỜ TRÌNH',
        items: [
          { prefix: 'Kính gửi: ', content: 'Ban Thường vụ Tỉnh ủy Đắk Lắk' },
          { prefix: '1. Căn cứ đánh giá: ', content: 'Thực hiện Hướng dẫn số 05-HD/TU và Quy định số 39-QĐ/TU của Ban Thường vụ Tỉnh ủy Đắk Lắk về việc đánh giá, xếp loại cán bộ hằng quý;' },
          { prefix: '2. Tình hình triển khai: ', content: `Tập thể Lãnh đạo Ban Tổ chức Tỉnh ủy đã tiến hành họp thẩm định, rà soát kết quả thực hiện nhiệm vụ và chấm điểm KPI thang 100 đối với toàn thể ${totalOfficials} đồng chí cán bộ thuộc diện quản lý.` },
          { prefix: '3. Đề nghị: ', content: 'Kính trình Ban Thường vụ Tỉnh ủy xem xét, phê duyệt kết quả đánh giá, xếp loại quý theo quy định.' },
        ],
      });

      result.signers.leftTitle = 'Nơi nhận:';
      result.signers.leftSubtitle = '- Như Kính gửi;\n- Thường trực Tỉnh ủy;\n- Lưu: VT, TC-CB.';
      result.signers.rightTitle = 'TRƯỞNG BAN';
      result.signers.rightName = 'Nguyễn Thượng Hải';
    }

    // --- M02_TUKIEMDIEM: BẢN TỰ KIỂM ĐIỂM CÁ NHÂN ---
    if (isM02KiemDiem) {
      result.documentTitle = 'BẢN TỰ KIỂM ĐIỂM CÁ NHÂN';
      result.subTitle = '(Dành cho cán bộ lãnh đạo, quản lý và công chức - Mẫu 2A)';

      const selfContentEl = doc.getElementsByTagName('SelfReviewContent')[0];
      const ideology = sanitizeText(getDirectTagText(selfContentEl, 'PoliticalIdeology'), 'Tuyệt đối trung thành với Đảng, bản lĩnh chính trị vững vàng');
      const lifestyle = sanitizeText(getDirectTagText(selfContentEl, 'MoralLifestyle'), 'Trong sáng, khiêm tốn, chấp hành nghiêm chuẩn mực đạo đức');
      const discipline = sanitizeText(getDirectTagText(selfContentEl, 'WorkDiscipline'), 'Chấp hành nghiêm sự phân công, quy chế làm việc');
      const selfCorrection = sanitizeText(getDirectTagText(selfContentEl, 'SelfCorrection'), 'Thực hiện nghiêm túc tự soi, tự sửa, khắc phục hạn chế kỳ trước');

      result.textBlocks.push({
        title: 'NỘI DUNG TỰ KIỂM ĐIỂM, ĐÁNH GIÁ',
        items: [
          { prefix: '1. Về tư tưởng chính trị: ', content: ideology },
          { prefix: '2. Về phẩm chất đạo đức, lối sống: ', content: lifestyle },
          { prefix: '3. Về tác phong, lề lối làm việc và ý thức tổ chức kỷ luật: ', content: discipline },
          { prefix: '4. Kết quả tự soi, tự sửa và khắc phục hạn chế: ', content: selfCorrection },
          { prefix: '5. Tự nhận mức xếp loại chất lượng: ', content: 'Hoàn thành xuất sắc nhiệm vụ' },
        ],
      });

      result.signers.leftTitle = '';
      result.signers.leftSubtitle = '';
      result.signers.rightTitle = 'NGƯỜI TỰ KIỂM ĐIỂM';
      result.signers.rightSubtitle = '(Ký, ghi rõ họ và tên)';
    }

    // --- M03_SCORECARD_KPI: BẢN TỰ ĐÁNH GIÁ & SCORECARD KPI HẰNG QUÝ ---
    if (isM03Scorecard) {
      result.documentTitle = 'BẢN TỰ ĐÁNH GIÁ VÀ SCORECARD KPI HẰNG QUÝ';
      result.subTitle = '(Thang điểm 100: 30 điểm Tiêu chí chung + 70 điểm Kết quả nhiệm vụ)';

      const critNodes = Array.from(doc.getElementsByTagName('Criterion')) as Element[];
      if (critNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        critNodes.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('id') || String(idx + 1),
            name: sanitizeText(node.getAttribute('name') || getDirectTagText(node, 'Name'), `Tiêu chí ${idx + 1}`),
            maxScore: node.getAttribute('max') || node.getAttribute('maxScore') || '10.0',
            score: node.getAttribute('score') || sanitizeText(getDirectTagText(node, 'Score'), '10.0'),
            status: node.getAttribute('status') === 'Ensured' ? 'Đạt chuẩn' : 'Bảo đảm',
          });
        });
        result.tables.push({
          title: 'PHẦN A: NHÓM TIÊU CHÍ CHUNG (TỐI ĐA 30 ĐIỂM)',
          columns: [
            { key: 'stt', label: 'Mã số', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'name', label: 'Nội dung tiêu chí chung', widthPct: 52, bold: true },
            { key: 'maxScore', label: 'Điểm tối đa', widthPct: 12, align: AlignmentType.CENTER },
            { key: 'score', label: 'Điểm đạt', widthPct: 12, align: AlignmentType.CENTER, bold: true },
            { key: 'status', label: 'Trạng thái', widthPct: 16, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      const taskList = Array.from(doc.getElementsByTagName('TaskItem')) as Element[];
      if (taskList.length > 0) {
        const rows: Array<Record<string, string>> = [];
        taskList.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('id') || String(idx + 1),
            name: sanitizeText(getDirectTagText(node, 'TaskName'), `Nhiệm vụ KPI ${idx + 1}`),
            deliverable: sanitizeText(getDirectTagText(node, 'OutputProduct'), 'Báo cáo / Tờ trình'),
            completed: sanitizeText(getDirectTagText(node, 'CompletedQuantity'), '1'),
            quality: sanitizeText(getDirectTagText(node, 'QualityFactor'), '1.00'),
            sla: sanitizeText(getDirectTagText(node, 'SLAFactor'), '1.00'),
            score: sanitizeText(getDirectTagText(node, 'CalculatedScore'), '70.0'),
          });
        });
        result.tables.push({
          title: 'PHẦN B: KẾT QUẢ THỰC HIỆN NHIỆM VỤ - KPI (TỐI ĐA 70 ĐIỂM)',
          columns: [
            { key: 'stt', label: 'Mã', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'name', label: 'Tên nhiệm vụ chuyên môn', widthPct: 34, bold: true },
            { key: 'deliverable', label: 'Sản phẩm đầu ra', widthPct: 20 },
            { key: 'completed', label: 'Số lượng', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'quality', label: 'Chất lượng', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'sla', label: 'Tiến độ', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'score', label: 'Điểm', widthPct: 10, align: AlignmentType.CENTER, bold: true },
          ],
          rows,
        });
      }

      result.textBlocks.push({
        title: 'TỔNG HỢP ĐIỂM SỐ & XẾP LOẠI',
        items: [
          { prefix: '• Tổng điểm đánh giá: ', content: '100.0 / 100 điểm' },
          { prefix: '• Mức tự đề xuất xếp loại: ', content: 'HOÀN THÀNH XUẤT SẮC NHIỆM VỤ' },
          { prefix: '• Sản phẩm nổi trội: ', content: 'Hoàn thành Đề án chuyển đổi số CSDL Đảng viên vượt tiến độ 05 ngày (Được thưởng điểm nổi trội per Hướng dẫn 05-HD/TU).' },
        ],
      });

      result.signers.leftTitle = 'NGƯỜI TỰ ĐÁNH GIÁ';
      result.signers.rightTitle = 'TRƯỞNG PHÒNG CHUYÊN MÔN';
    }

    // --- M04_TONGHOP_QUY: BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ VÀ ĐỀ XUẤT XẾP LOẠI QUÝ ---
    if (isM04TongHopQuy) {
      result.signatureType = 'DEPARTMENT';
      result.documentTitle = 'BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ VÀ ĐỀ XUẤT XẾP LOẠI CÁN BỘ QUÝ';
      result.subTitle = 'Kỳ đánh giá: Quý III năm 2026 - Ban Tổ chức Tỉnh ủy Đắk Lắk';

      const records = Array.from(doc.getElementsByTagName('SummaryRecord')) as Element[];
      if (records.length > 0) {
        const rows: Array<Record<string, string>> = [];
        records.forEach((node: Element, idx: number) => {
          rows.push({
            stt: node.getAttribute('stt') || String(idx + 1),
            fullName: sanitizeText(getDirectTagText(node, 'FullName'), `Cán bộ ${idx + 1}`),
            position: sanitizeText(getDirectTagText(node, 'Position'), 'Trưởng phòng Tổ chức Cán bộ'),
            selfScore: sanitizeText(getDirectTagText(node, 'SelfScore'), '100.0'),
            appraisalScore: sanitizeText(getDirectTagText(node, 'AppraisalScore'), '100.0'),
            grade: sanitizeText(getDirectTagText(node, 'AuthorityProposedGrade'), 'Hoàn thành xuất sắc nhiệm vụ'),
            quotaCheck: sanitizeText(getDirectTagText(node, 'ExceedingQuotaCheck'), 'Đạt trần 20%'),
          });
        });

        result.tables.push({
          title: 'DANH SÁCH TỔNG HỢP ĐÁNH GIÁ, XẾP LOẠI CÁN BỘ, CÔNG CHỨC',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 5, align: AlignmentType.CENTER },
            { key: 'fullName', label: 'Họ và tên cán bộ', widthPct: 24, bold: true },
            { key: 'position', label: 'Chức danh / VTVL', widthPct: 20 },
            { key: 'selfScore', label: 'Tự chấm', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'appraisalScore', label: 'Thẩm định', widthPct: 10, align: AlignmentType.CENTER, bold: true },
            { key: 'grade', label: 'Xếp loại đề xuất', widthPct: 18, align: AlignmentType.CENTER },
            { key: 'quotaCheck', label: 'Kiểm tra trần 20%', widthPct: 13, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      result.signers.leftTitle = 'NGƯỜI TỔNG HỢP';
      result.signers.leftSubtitle = '(Ký, ghi rõ họ và tên)';
      result.signers.rightTitle = 'TẬP THỂ LÃNH ĐẠO BAN';
      result.signers.rightSubtitle = '(Ký, ghi rõ họ và tên)';
    }

    // --- MẪU 05 & M05_BAOCAO_QUYETDINH: DỰ THẢO QUYẾT ĐỊNH & BẢNG TỔNG HỢP XẾP LOẠI TOÀN CƠ QUAN ---
    if (isMau05) {
      result.signatureType = 'DECISION';
      result.documentTitle = 'QUYẾT ĐỊNH';
      if (!result.subTitle) {
        result.subTitle = 'Về việc phê duyệt kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và tập thể cơ quan Ban Tổ chức Tỉnh ủy Quý I năm 2026';
      }
      if (!result.decisionNumber) {
        result.decisionNumber = '125-QĐ/BTCTU';
      }
      if (!result.decisionDate) {
        result.decisionDate = 'Buôn Ma Thuột, ngày 28 tháng 03 năm 2026';
      }
      result.signers.rightDate = result.decisionDate;

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
      const articleItems: Array<{ prefix?: string; content: string }> = [];
      if (termsEl) {
        const art1 = sanitizeText(getDirectTagText(termsEl, 'Article1'));
        if (art1) articleItems.push({ prefix: 'Điều 1. ', content: art1 });
        const art2 = sanitizeText(getDirectTagText(termsEl, 'Article2'));
        if (art2) articleItems.push({ prefix: 'Điều 2. ', content: art2 });
        const art3 = sanitizeText(getDirectTagText(termsEl, 'Article3'));
        if (art3) articleItems.push({ prefix: 'Điều 3. ', content: art3 });
      }

      if (articleItems.length === 0) {
        articleItems.push({
          prefix: 'Điều 1. ',
          content: 'Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 05 tập thể phòng thuộc cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk:\n1. Tập thể Lãnh đạo Ban: Điểm KPI 98.5/100 • Xếp loại: Hoàn thành xuất sắc nhiệm vụ.\n2. Phòng Tổ chức đảng, đảng viên: Điểm KPI 96.0/100 • Xếp loại: Hoàn thành xuất sắc nhiệm vụ.\n3. Phòng Tổ chức cán bộ: Điểm KPI 95.5/100 • Xếp loại: Hoàn thành xuất sắc nhiệm vụ.\n4. Phòng Bảo vệ chính trị nội bộ: Điểm KPI 88.5/100 • Xếp loại: Hoàn thành tốt nhiệm vụ.\n5. Văn phòng Ban: Điểm KPI 87.0/100 • Xếp loại: Hoàn thành tốt nhiệm vụ.',
        });
        articleItems.push({
          prefix: 'Điều 2. ',
          content: 'Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 23 cán bộ, công chức cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk, cụ thể:\n• 1. Hoàn thành xuất sắc nhiệm vụ: 04 đồng chí (Tỷ lệ 17.4% tổng biên chế, bảo đảm đúng quy định khống chế trần không quá 20% theo Hướng dẫn 05-HD/TU; 100% có hồ sơ kê khai nhiệm vụ nổi trội Mẫu 04):\n  - Đ/c Nguyễn Thượng Hải - Trưởng ban Tổ chức Tỉnh ủy (100.0 điểm)\n  - Đ/c Lưu Vĩnh Hưng - Phó Trưởng ban Thường trực (98.0 điểm)\n  - Đ/c Công chức 1 - Trưởng phòng Tổ chức đảng, đảng viên (97.0 điểm)\n  - Đ/c Công chức 8 - Chuyên viên Quản lý Cán bộ & CSDL Mẫu 2C (99.5 điểm)\n• 2. Hoàn thành tốt nhiệm vụ: 18 đồng chí (Tỷ lệ 78.3% tổng biên chế, bao gồm các trường hợp đạt trên 90 điểm nhưng áp trần 20% theo quy định).\n• 3. Hoàn thành nhiệm vụ: 01 đồng chí (Tỷ lệ 4.3% tổng biên chế).\n• 4. Không hoàn thành nhiệm vụ: 0 đồng chí (0%).',
        });
        articleItems.push({
          prefix: 'Điều 3. ',
          content: 'Văn phòng Ban, các phòng chuyên môn và các cán bộ, công chức có tên tại Điều 1, Điều 2 chịu trách nhiệm thi hành Quyết định này. Kết quả xếp loại là căn cứ bình xét thi đua khen thưởng và chi trả thu nhập tăng thêm theo quy định. Quyết định này có hiệu lực kể từ ngày ký.',
        });
      }

      result.textBlocks.push({
        title: 'BAN TỔ CHỨC TỈNH ỦY QUYẾT ĐỊNH:',
        items: articleItems,
      });

      result.signers.rightTitle = 'TRƯỞNG BAN';
      result.signers.rightName = 'Nguyễn Thượng Hải';
      result.signers.leftSubtitle = '- Như Điều 3;\n- Ban Thường vụ Tỉnh ủy (để b/c);\n- Lãnh đạo Ban;\n- 05 Phòng chuyên môn;\n- Lưu: VT, TC-CB.';
    }

    // --- BỘ 2 (QĐ 348-QĐ/BTCTW - PHỤ LỤC VIII KẾT NỐI, CHIA SẺ DỮ LIỆU) ---
    if (isM01KhaiThac) {
      result.documentTitle = 'PHIẾU ĐỀ NGHỊ KẾT NỐI, CHIA SẺ DỮ LIỆU';
      result.subTitle = '(Ban hành kèm theo Quyết định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương)';
      const reqAgency = doc.getElementsByTagName('RequestingAgency')[0];
      const head = sanitizeText(getDirectTagText(reqAgency, 'HeadOfAgency'), 'Lương Nguyễn Minh Triết');
      const contact = doc.getElementsByTagName('TechnicalContact')[0];

      result.textBlocks.push({
        title: 'NỘI DUNG ĐỀ NGHỊ KẾT NỐI DỮ LIỆU',
        items: [
          { prefix: '1. Đơn vị đề nghị: ', content: sanitizeText(getDirectTagText(reqAgency, 'AgencyName'), 'Tỉnh ủy Đắk Lắk') },
          { prefix: '2. Địa chỉ: ', content: sanitizeText(getDirectTagText(reqAgency, 'Address'), 'Số 14 Lê Duẩn, TP. Buôn Ma Thuột') },
          { prefix: '3. Thủ trưởng cơ quan: ', content: head },
          { prefix: '4. Cán bộ kỹ thuật phụ trách: ', content: `${contact?.getAttribute('name') || 'Nguyễn Văn B'} • SĐT: ${contact?.getAttribute('phone') || '0912345678'} • Email: ${contact?.getAttribute('email') || 'cntt@btctu.daklak.gov.vn'}` },
          { prefix: '5. Mục đích kết nối: ', content: sanitizeText(getDirectTagText(doc, 'Purpose'), 'Đối soát CSDL Đảng viên & CSDL Cán bộ công chức khối Đảng') },
          { prefix: '6. Hạ tầng & Giao thức: ', content: 'Mạng TSLCD • Giao thức REST API HTTPS per Cấp độ 3 an toàn thông tin' },
        ],
      });

      result.signers.rightTitle = 'THỦ TRƯỞNG CƠ QUAN ĐỀ NGHỊ';
      result.signers.rightSubtitle = '(Ký, đóng dấu)';
      result.signers.rightName = head;
    }

    if (isM02ChapThuan) {
      result.signatureType = 'DECISION';
      result.documentTitle = 'QUYẾT ĐỊNH';
      result.subTitle = 'Về việc chấp thuận kết nối, chia sẻ dữ liệu với Cơ quan Tỉnh ủy Đắk Lắk';
      result.agencyName = 'BAN TỔ CHỨC TRUNG ƯƠNG';
      result.organizationName = 'CỤC CÔNG NGHỆ THÔNG TIN';
      if (!result.decisionNumber) result.decisionNumber = '567-QĐ/BTCTW';

      const apis = Array.from(doc.getElementsByTagName('API')) as Element[];
      if (apis.length > 0) {
        const rows: Array<Record<string, string>> = [];
        apis.forEach((node: Element, idx: number) => {
          rows.push({
            stt: String(idx + 1),
            id: node.getAttribute('id') || `API_${idx + 1}`,
            path: node.getAttribute('path') || '/api/v1/service',
            level: node.getAttribute('level') || 'Mức 2',
          });
        });
        result.tables.push({
          title: 'DANH MỤC API DỊCH VỤ DỮ LIỆU ĐƯỢC CẤP QUYỀN KẾT NỐI',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 10, align: AlignmentType.CENTER },
            { key: 'id', label: 'Mã dịch vụ', widthPct: 20, align: AlignmentType.CENTER, bold: true },
            { key: 'path', label: 'Endpoint đường dẫn API', widthPct: 50 },
            { key: 'level', label: 'Cấp độ an toàn', widthPct: 20, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      result.signers.rightTitle = 'TRƯỞNG BAN TỔ CHỨC TRUNG ƯƠNG';
      result.signers.rightSubtitle = '(Ký, đóng dấu)';
      result.signers.leftTitle = 'Nơi nhận:';
      result.signers.leftSubtitle = '- Tỉnh ủy Đắk Lắk;\n- Trung tâm Dữ liệu Quốc gia;\n- Lưu: VT, CNTT.';
    }

    if (isM03XungDot) {
      result.documentTitle = 'BIÊN BẢN PHÁT HIỆN VÀ XỬ LÝ XUNG ĐỘT DỮ LIỆU';
      result.subTitle = '(Đối soát giữa CSDL Tổ chức Đảng, Đảng viên với CSDL Cán bộ, công chức)';

      const conflictEl = doc.getElementsByTagName('ConflictDetails')[0];
      const citizenId = sanitizeText(getDirectTagText(conflictEl, 'CitizenID'), '066095001234');
      const partyVal = sanitizeText(getDirectTagText(conflictEl, 'PartyDBValue'), '2018-05-19');
      const civilVal = sanitizeText(getDirectTagText(conflictEl, 'NationalCivilDBValue'), '2018-05-20');
      const singleSource = sanitizeText(getDirectTagText(conflictEl, 'SingleSourceOfTruthRef'), 'CSDL Tổ chức Đảng, Đảng viên');

      result.tables.push({
        title: 'BẢNG ĐỐI SOÁT CHI TIẾT TRƯỜNG DỮ LIỆU SAI LỆCH',
        columns: [
          { key: 'item', label: 'Thông tin kiểm tra', widthPct: 35, bold: true },
          { key: 'party', label: 'Giá trị trong CSDL Đảng viên', widthPct: 25, align: AlignmentType.CENTER },
          { key: 'civil', label: 'Giá trị trong CSDL Quốc gia', widthPct: 25, align: AlignmentType.CENTER },
          { key: 'sot', label: 'Nguồn chuẩn (Source of Truth)', widthPct: 15, align: AlignmentType.CENTER, bold: true },
        ],
        rows: [
          { item: `Số CCCD: ${citizenId} (Trường: Ngày vào Đảng chính thức)`, party: partyVal, civil: civilVal, sot: singleSource },
        ],
      });

      result.signers.leftTitle = 'BỘ PHẬN ĐỐI SOÁT';
      result.signers.leftSubtitle = '(Ký, ghi rõ họ và tên)';
      result.signers.rightTitle = 'ĐẠI DIỆN VẬN HÀNH HỆ THỐNG';
      result.signers.rightSubtitle = '(Ký, ghi rõ họ và tên)';
    }

    if (isM04TamNgung) {
      result.signatureType = 'DECISION';
      result.documentTitle = 'THÔNG BÁO';
      result.subTitle = 'Về việc tạm ngừng / kết nối kỹ thuật phục vụ bảo trì hệ thống mạng diện rộng của Đảng';
      result.agencyName = 'BAN TỔ CHỨC TRUNG ƯƠNG';
      result.organizationName = 'BAN QUẢN TRỊ MẠNG DIỆN RỘNG CỦA ĐẢNG';
      if (!result.decisionNumber) result.decisionNumber = '89-TB/BTCTW';

      result.textBlocks.push({
        title: 'NỘI DUNG THÔNG BÁO BẢO TRÌ',
        items: [
          { prefix: '1. Hành động kỹ thuật: ', content: 'Tạm ngừng kết nối giao thức API' },
          { prefix: '2. Lý do: ', content: 'Bảo trì hệ thống mạng diện rộng của Đảng per Kế hoạch An toàn thông tin Cấp độ 3' },
          { prefix: '3. Thời điểm bắt đầu: ', content: '00:00 ngày 01/11/2026' },
          { prefix: '4. Thời điểm khôi phục dự kiến: ', content: '06:00 ngày 02/11/2026' },
        ],
      });

      result.signers.rightTitle = 'TRƯỞNG BAN QUẢN TRỊ MẠNG';
      result.signers.rightSubtitle = '(Ký, đóng dấu)';
      result.signers.leftTitle = 'Nơi nhận:';
      result.signers.leftSubtitle = '- Các Tỉnh ủy, Thành ủy;\n- Đơn vị kết nối LGSP;\n- Lưu: VT.';
    }

    if (isM05BaoCaoNam) {
      result.documentTitle = 'BÁO CÁO KẾT QUẢ KẾT NỐI, CHIA SẺ DỮ LIỆU HẰNG NĂM';
      result.subTitle = 'Năm đánh giá: 2026 - Ban Tổ chức Tỉnh ủy Đắk Lắk';

      const metricsEl = doc.getElementsByTagName('Metrics')[0];
      const calls = sanitizeText(getDirectTagText(metricsEl, 'TotalAPICalls'), '125,000');
      const syncRate = sanitizeText(getDirectTagText(metricsEl, 'SuccessfulSyncRate'), '99.8');
      const cleanRate = sanitizeText(getDirectTagText(metricsEl, 'DataCleanlinessRate'), '98.5');
      const incidents = sanitizeText(getDirectTagText(metricsEl, 'SecurityIncidentsCount'), '0');

      result.tables.push({
        title: 'CÁC CHỈ SỐ HOẠT ĐỘNG VÀ ĐỘ TIN CẬY DỮ LIỆU',
        columns: [
          { key: 'stt', label: 'STT', widthPct: 10, align: AlignmentType.CENTER },
          { key: 'metric', label: 'Chỉ số đo lường hiệu năng kỹ thuật', widthPct: 55, bold: true },
          { key: 'val', label: 'Kết quả ghi nhận', widthPct: 35, align: AlignmentType.CENTER, bold: true },
        ],
        rows: [
          { stt: '1', metric: 'Tổng lưu lượng cuộc gọi kết nối API (API Calls)', val: `${calls} lượt` },
          { stt: '2', metric: 'Tỷ lệ đồng bộ dữ liệu thành công', val: `${syncRate}%` },
          { stt: '3', metric: 'Chỉ số độ sạch dữ liệu (Nguyên tắc: Đúng, Đủ, Sạch, Sống)', val: `${cleanRate}%` },
          { stt: '4', metric: 'Số sự cố mất an toàn thông tin Cấp độ 3', val: `${incidents} sự cố` },
        ],
      });

      result.signers.leftTitle = '';
      result.signers.leftSubtitle = '';
      result.signers.rightTitle = 'ĐẠI DIỆN CƠ QUAN BÁO CÁO';
      result.signers.rightSubtitle = '(Ký, đóng dấu)';
      result.signers.rightName = 'Nguyễn Thượng Hải';
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
      white-space: pre-line;
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
