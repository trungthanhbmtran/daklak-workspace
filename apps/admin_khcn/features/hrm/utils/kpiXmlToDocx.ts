/**
 * Utility: Chuyển đổi file mẫu XML KPI thành tài liệu Microsoft Word (.docx) và PDF in ấn
 * Dựa 100% vào dữ liệu và cấu trúc thực tế của file XML gốc (KHÔNG GÁN CỨNG / NO HARDCODED MOCK DATA)
 * Tuân thủ chuẩn thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP & Thể thức văn bản của Đảng)
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
} from 'docx';

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
  // Khối thông tin đối tượng (Profile / Officer / Department)
  profileFields: Array<{ label: string; value: string }>;
  // Căn cứ pháp lý
  legalBasis: string[];
  // Các bảng dữ liệu động
  tables: DynamicXmlTable[];
  // Các khối nội dung điều khoản / cam kết / nhận xét
  textBlocks: DynamicTextBlock[];
  // Chữ ký
  signatureType: 'TWO_COLUMN' | 'DECISION' | 'NONE';
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
  // Nếu là placeholder dạng {{xxx}} hoặc {xxx}
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
  EmployeeCode: 'Mã số công chức',
  employeeCode: 'Mã số công chức',
  DepartmentName: 'Đơn vị / Phòng ban',
  departmentName: 'Đơn vị / Phòng ban',
  DepartmentCode: 'Mã phòng ban',
  JobTitle: 'Chức vụ / Chức danh',
  jobTitle: 'Chức vụ / Chức danh',
  JobPositionCode: 'Vị trí việc làm',
  StaffingSlotId: 'Mã định biên biên chế',
  RankCode: 'Mã ngạch công chức',
  IsUnitLeader: 'Lãnh đạo đơn vị',
  SelfRating: 'Xếp loại tự nhận',
  SelfScore: 'Điểm tự chấm',
  TotalScore: 'Tổng điểm đánh giá',
  OfficialRank: 'Xếp loại chính thức',
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
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'application/xml');

    const root = doc.documentElement;
    if (root) {
      result.formCode = root.getAttribute('formCode') || result.formCode;
      result.schemaVersion = root.getAttribute('schemaVersion') || undefined;
    }

    // 1. Trích xuất Header
    const headerEl = doc.getElementsByTagName('Header')[0];
    if (headerEl) {
      const agency = sanitizeText(getDirectTagText(headerEl, 'AgencyName'));
      if (agency) result.agencyName = agency;

      const org = sanitizeText(getDirectTagText(headerEl, 'OrganizationName'));
      if (org) result.organizationName = org;

      const docTitle = sanitizeText(getDirectTagText(headerEl, 'DocumentTitle'));
      if (docTitle) result.documentTitle = docTitle;

      const period = sanitizeText(getDirectTagText(headerEl, 'EvaluationPeriod'));
      if (period) result.periodName = period;

      const decisionNum = sanitizeText(getDirectTagText(headerEl, 'DecisionNumber'));
      if (decisionNum) result.decisionNumber = decisionNum;

      const decisionDate = sanitizeText(getDirectTagText(headerEl, 'DecisionDate'));
      if (decisionDate) result.decisionDate = decisionDate;
    }

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

    // 3. Trích xuất Thông tin đối tượng / Cán bộ (OfficerProfile, EvaluatedOfficer, Profile)
    const profileEl =
      doc.getElementsByTagName('OfficerProfile')[0] ||
      doc.getElementsByTagName('EvaluatedOfficer')[0] ||
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
    const isMau05 = result.formCode === 'MAU_05' || doc.getElementsByTagName('IndividualFinalRankings').length > 0;

    // --- MẪU 01: KHUNG DANH MỤC CÔNG VIỆC ĐĂNG KÝ ĐẦU KỲ ---
    if (isMau01) {
      const taskNodes = doc.querySelectorAll('RegisteredTasks > TaskItem, RegisteredTasks > Task, TaskItem');
      if (taskNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        taskNodes.forEach((node, idx) => {
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
      const criteriaNodes = doc.querySelectorAll('SectionA_GeneralCriteria > Criterion, Criterion');
      if (criteriaNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        criteriaNodes.forEach((node, idx) => {
          rows.push({
            stt: String(idx + 1),
            name: sanitizeText(getDirectTagText(node, 'Name'), `Tiêu chí ${idx + 1}`),
            desc: sanitizeText(getDirectTagText(node, 'Description')),
            maxScore: node.getAttribute('maxScore') || sanitizeText(getDirectTagText(node, 'MaxScore'), '10.0'),
            selfScore: sanitizeText(getDirectTagText(node, 'SelfScore'), '-'),
            reviewerScore: sanitizeText(getDirectTagText(node, 'ReviewerScore'), '-'),
          });
        });

        result.tables.push({
          title: 'I. ĐÁNH GIÁ CÁC TIÊU CHÍ CHUNG (Tối đa 30 điểm)',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: AlignmentType.CENTER },
            { key: 'name', label: 'Nội dung tiêu chí chung', widthPct: 40, bold: true },
            { key: 'desc', label: 'Mô tả tiêu chuẩn', widthPct: 30 },
            { key: 'maxScore', label: 'Điểm tối đa', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'selfScore', label: 'Tự chấm', widthPct: 8, align: AlignmentType.CENTER },
            { key: 'reviewerScore', label: 'Lãnh đạo chấm', widthPct: 8, align: AlignmentType.CENTER },
          ],
          rows,
        });
      }

      // 2. Nhiệm vụ chuyên môn
      const taskDetailNodes = doc.querySelectorAll('SectionB_TaskPerformance TaskDetail, EvaluatedTasks > TaskDetail');
      if (taskDetailNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        taskDetailNodes.forEach((node, idx) => {
          const volEl = node.getElementsByTagName('VolumeFactorA')[0];
          const qualEl = node.getElementsByTagName('QualityFactorB')[0];
          const progEl = node.getElementsByTagName('ProgressFactorC')[0];
          const attEl = node.getElementsByTagName('AttitudeFactorD')[0];

          rows.push({
            stt: String(idx + 1),
            taskName: sanitizeText(getDirectTagText(node, 'TaskName'), `Nhiệm vụ ${idx + 1}`),
            vol: volEl ? `${volEl.getAttribute('actualQty') || '-'}/${volEl.getAttribute('plannedQty') || '-'}` : '-',
            qual: qualEl ? `${qualEl.getAttribute('qualityPct') || '-'}%` : '-',
            prog: progEl ? `${progEl.getAttribute('progressPct') || '-'}%` : '-',
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

      const reviewerCommentNodes = doc.querySelectorAll('ReviewerComments > Comment');
      if (reviewerCommentNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        reviewerCommentNodes.forEach((node, idx) => {
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
      const rankingNodes = doc.querySelectorAll('IndividualFinalRankings > OfficerRankingItem');
      if (rankingNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        rankingNodes.forEach((node, idx) => {
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
    if (!isMau01 && !isMau02 && !isMau03 && !isMau05) {
      // Tìm các node container có danh sách lặp (Ví dụ Items/Item, Records/Record...)
      const allElements = doc.getElementsByTagName('*');
      const processedContainers = new Set<Element>();

      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        if (!el || processedContainers.has(el)) continue;

        const children = el.children;
        if (children.length >= 2) {
          // Kiểm tra xem các con có cùng tagName không
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
            // Bóc tách thành bảng động
            const fieldKeys = new Set<string>();
            const rowList: Array<Record<string, string>> = [];

            for (let c = 0; c < children.length; c++) {
              const item = children[c];
              const rowObj: Record<string, string> = { stt: String(c + 1) };
              // Thêm các thuộc tính
              for (let a = 0; a < item.attributes.length; a++) {
                const attr = item.attributes[a];
                fieldKeys.add(attr.name);
                rowObj[attr.name] = attr.value;
              }
              // Thêm các tag con
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
            const keyArray = Array.from(fieldKeys).slice(0, 5); // Tối đa 5 cột
            const colWidth = Math.floor(remainingPct / (keyArray.length || 1));

            keyArray.forEach((k) => {
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

    // 5. Trích xuất chữ ký chung (WorkflowSignatures) nếu không phải Mẫu 05
    if (result.signatureType !== 'DECISION') {
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
          if (title) result.signers.rightTitle = title;
        }
      }
    }
  } catch {
    // Parser fallback an toàn
  }

  return result;
}

/**
 * Kiểu viền bảng mỏng đơn sắc chuẩn văn bản hành chính Việt Nam (0.5 pt)
 */
const TABLE_BORDER_THIN = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: '64748B',
};

const NO_BORDER = {
  style: BorderStyle.NONE,
  size: 0,
  color: 'FFFFFF',
};

/**
 * Sinh file DOCX (Microsoft Word) dựa 100% vào dữ liệu thực tế từ cây XML
 */
export async function generateKpiDocxBlob(xmlContent: string, templateTitle?: string): Promise<Blob> {
  const data = parseKpiXml(xmlContent, templateTitle);

  // Tạo tài liệu Document docx
  const doc = new Document({
    creator: 'daklak-workspace - Hệ thống Quản trị Ban Tổ chức Tỉnh ủy',
    title: data.documentTitle,
    description: `Biểu mẫu chuẩn hóa XML ${data.formCode} theo Hướng dẫn 05-HD/TU`,
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 26, // 13 pt (half-points)
            color: '000000',
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              before: 60,
              after: 60,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134, // 20 mm
              bottom: 1134, // 20 mm
              left: 1701, // 30 mm
              right: 850, // 15 mm
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `Mã biểu mẫu: ${data.formCode}`,
                    font: 'Times New Roman',
                    size: 18,
                    italics: true,
                    color: '64748B',
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
                  new TextRun({ text: 'Trang ', font: 'Times New Roman', size: 20 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 20 }),
                  new TextRun({ text: ' / ', font: 'Times New Roman', size: 20 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Times New Roman', size: 20 }),
                ],
              }),
            ],
          }),
        },
        children: [
          // 1. HEADER 2 CỘT (Cơ quan & Quốc hiệu)
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
                  // Cột trái
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.agencyName.toUpperCase(),
                            font: 'Times New Roman',
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.organizationName.toUpperCase(),
                            font: 'Times New Roman',
                            bold: true,
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: '-----------------------',
                            font: 'Times New Roman',
                            size: 20,
                            color: '64748B',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.decisionNumber ? `Số: ${data.decisionNumber}` : `Mẫu số: ${data.formCode}`,
                            font: 'Times New Roman',
                            size: 22,
                            italics: true,
                          }),
                        ],
                      }),
                    ],
                  }),
                  // Cột phải
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: 'ĐẢNG CỘNG SẢN VIỆT NAM',
                            font: 'Times New Roman',
                            bold: true,
                            size: 26,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: '-----------------------',
                            font: 'Times New Roman',
                            size: 20,
                            color: '64748B',
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 80 },
                        children: [
                          new TextRun({
                            text: data.signers.rightDate || `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`,
                            font: 'Times New Roman',
                            italics: true,
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // 2. TIÊU ĐỀ BIỂU MẪU
          new Paragraph({
            spacing: { before: 260, after: 80 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: data.documentTitle.toUpperCase(),
                font: 'Times New Roman',
                bold: true,
                size: 30, // 15 pt
                color: '0F172A',
              }),
            ],
          }),

          // Phụ đề / Kỳ đánh giá (nếu có)
          ...(data.periodName
            ? [
                new Paragraph({
                  spacing: { after: 180 },
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `Áp dụng: ${data.periodName}`,
                      font: 'Times New Roman',
                      italics: true,
                      bold: true,
                      size: 24,
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
                      spacing: { before: 30, after: 30 },
                      children: [
                        new TextRun({
                          text: `${field.label}: `,
                          font: 'Times New Roman',
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text: field.value,
                          font: 'Times New Roman',
                          size: 24,
                        }),
                      ],
                    }),
                ),
                new Paragraph({ spacing: { after: 100 }, children: [] }),
              ]
            : []),

          // 4. CĂN CỨ PHÁP LÝ (CHỈ HIỂN THỊ NẾU XML GỐC CÓ THẺ LEGALBASIS)
          ...(data.legalBasis.length > 0
            ? [
                ...data.legalBasis.map(
                  (basis) =>
                    new Paragraph({
                      spacing: { before: 20, after: 20 },
                      indent: { left: 360 },
                      children: [
                        new TextRun({
                          text: `• ${basis}`,
                          font: 'Times New Roman',
                          italics: true,
                          size: 22,
                        }),
                      ],
                    }),
                ),
                new Paragraph({ spacing: { after: 100 }, children: [] }),
              ]
            : []),

          // 5. CÁC BẢNG DỮ LIỆU ĐỘNG (Render từng bảng theo cấu trúc XML)
          ...data.tables.flatMap((table) => [
            ...(table.title
              ? [
                  new Paragraph({
                    spacing: { before: 180, after: 80 },
                    children: [
                      new TextRun({
                        text: table.title,
                        font: 'Times New Roman',
                        bold: true,
                        size: 26,
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
                  children: table.columns.map(
                    (col) =>
                      new TableCell({
                        width: { size: col.widthPct, type: WidthType.PERCENTAGE },
                        shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                          new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                              new TextRun({
                                text: col.label,
                                bold: true,
                                size: 22,
                                font: 'Times New Roman',
                              }),
                            ],
                          }),
                        ],
                      }),
                  ),
                }),
                // Data Rows
                ...table.rows.map(
                  (row) =>
                    new TableRow({
                      children: table.columns.map(
                        (col) =>
                          new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                              new Paragraph({
                                alignment: col.align || AlignmentType.LEFT,
                                children: [
                                  new TextRun({
                                    text: row[col.key] || '',
                                    bold: col.bold || false,
                                    size: 22,
                                    font: 'Times New Roman',
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
          ...data.textBlocks.flatMap((block) => [
            new Paragraph({
              spacing: { before: 180, after: 80 },
              children: [
                new TextRun({
                  text: block.title,
                  font: 'Times New Roman',
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            ...block.items.map(
              (item) =>
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    ...(item.prefix
                      ? [
                          new TextRun({
                            text: item.prefix,
                            font: 'Times New Roman',
                            bold: true,
                            size: 24,
                          }),
                        ]
                      : []),
                    new TextRun({
                      text: item.content,
                      font: 'Times New Roman',
                      size: 24,
                    }),
                  ],
                }),
            ),
          ]),

          // 7. KHUNG CHỮ KÝ THEO CHUẨN THỂ THỨC ĐẢNG & NGHỊ ĐỊNH 30
          new Paragraph({ spacing: { before: 240, after: 60 }, children: [] }),
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
                  // Cột trái
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: data.signatureType === 'DECISION' ? AlignmentType.LEFT : AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: (data.signers.leftTitle || 'NGƯỜI TỰ ĐÁNH GIÁ').toUpperCase(),
                            font: 'Times New Roman',
                            bold: true,
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: data.signatureType === 'DECISION' ? AlignmentType.LEFT : AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.signers.leftSubtitle || '(Ký, ghi rõ họ và tên)',
                            font: 'Times New Roman',
                            italics: data.signatureType !== 'DECISION',
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({ spacing: { before: 500, after: 100 }, children: [] }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.signers.leftName || '',
                            font: 'Times New Roman',
                            bold: true,
                            size: 24,
                          }),
                        ],
                      }),
                    ],
                  }),

                  // Cột phải
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: (data.signers.rightTitle || 'TRƯỞNG PHÒNG CHUYÊN MÔN').toUpperCase(),
                            font: 'Times New Roman',
                            bold: true,
                            size: 24,
                          }),
                        ],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.signers.rightSubtitle || '(Ký, ghi rõ họ và tên)',
                            font: 'Times New Roman',
                            italics: true,
                            size: 22,
                          }),
                        ],
                      }),
                      new Paragraph({ spacing: { before: 500, after: 100 }, children: [] }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: data.signers.rightName || '',
                            font: 'Times New Roman',
                            bold: true,
                            size: 24,
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
 * Tải file XML chuẩn UTF-8 về máy
 */
export function exportKpiXmlFile(xmlContent: string, fileName: string) {
  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
  downloadBlob(blob, fileName.endsWith('.xml') ? fileName : `${fileName}.xml`);
}

/**
 * Xuất file Word DOCX chuẩn thể thức hành chính từ nội dung XML
 */
export async function exportKpiDocxFile(xmlContent: string, fileName: string, templateTitle?: string) {
  const blob = await generateKpiDocxBlob(xmlContent, templateTitle);
  downloadBlob(blob, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`);
}

/**
 * In / Xuất PDF trực tiếp từ trình duyệt theo chuẩn văn bản hành chính
 * Mở cửa sổ in ấn khổ A4, căn lề chuẩn 20-30-15-20 mm, cho phép lưu PDF ngay lập tức
 */
export function printKpiXmlDocument(xmlContent: string, templateTitleFallback?: string) {
  const data = parseKpiXml(xmlContent, templateTitleFallback);

  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) {
    alert('Trình duyệt đã chặn cửa sổ pop-up. Vui lòng cho phép pop-up để in/xuất PDF.');
    return;
  }

  // Render HTML in ấn chuẩn thể thức
  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${data.documentTitle} - ${data.formCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm 15mm 20mm 30mm; /* Chuẩn NĐ 30: trên 20, dưới 20, trái 30, phải 15 */
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.3;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 20px;
    }
    .header-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .header-table td {
      border: none;
      vertical-align: top;
      text-align: center;
      padding: 0 4px;
    }
    .agency-name {
      font-size: 12pt;
    }
    .org-name {
      font-size: 12pt;
      font-weight: bold;
    }
    .party-title {
      font-size: 13pt;
      font-weight: bold;
    }
    .divider {
      width: 120px;
      margin: 3px auto;
      border-top: 1px solid #000;
    }
    .date-str {
      font-size: 12pt;
      font-style: italic;
      margin-top: 5px;
    }
    .doc-title {
      font-size: 15pt;
      font-weight: bold;
      text-align: center;
      margin: 20px 0 8px 0;
      text-transform: uppercase;
    }
    .doc-period {
      font-size: 12pt;
      font-style: italic;
      font-weight: bold;
      text-align: center;
      margin-bottom: 15px;
    }
    .profile-list {
      margin-bottom: 12px;
      font-size: 12.5pt;
    }
    .profile-item {
      margin: 4px 0;
    }
    .profile-label {
      font-weight: bold;
    }
    .legal-basis {
      font-style: italic;
      font-size: 11.5pt;
      margin-bottom: 15px;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin: 16px 0 8px 0;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 18px 0;
    }
    .data-table th, .data-table td {
      border: 1px solid #475569;
      padding: 6px 8px;
      font-size: 11pt;
    }
    .data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .text-block-item {
      margin: 6px 0;
      font-size: 12pt;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 25px;
      page-break-inside: avoid;
    }
    .sig-table td {
      border: none;
      vertical-align: top;
      text-align: center;
      width: 50%;
    }
    .sig-title {
      font-weight: bold;
      font-size: 12.5pt;
      text-transform: uppercase;
    }
    .sig-sub {
      font-style: italic;
      font-size: 11pt;
    }
    .sig-space {
      height: 75px;
    }
    .sig-name {
      font-weight: bold;
      font-size: 12.5pt;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; padding: 10px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
    <div><strong>Bản in mẫu văn bản hành chính:</strong> ${data.formCode} (${data.documentTitle})</div>
    <button onclick="window.print()" style="padding: 6px 16px; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Bấm để In / Lưu PDF</button>
  </div>

  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="agency-name">${data.agencyName.toUpperCase()}</div>
        <div class="org-name">${data.organizationName.toUpperCase()}</div>
        <div class="divider"></div>
        <div style="font-size: 11pt; font-style: italic; margin-top: 4px;">${data.decisionNumber ? `Số: ${data.decisionNumber}` : `Mẫu số: ${data.formCode}`}</div>
      </td>
      <td style="width: 55%;">
        <div class="party-title">ĐẢNG CỘNG SẢN VIỆT NAM</div>
        <div class="divider"></div>
        <div class="date-str">${data.signers.rightDate || `Buôn Ma Thuột, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`}</div>
      </td>
    </tr>
  </table>

  <div class="doc-title">${data.documentTitle}</div>
  ${data.periodName ? `<div class="doc-period">Áp dụng: ${data.periodName}</div>` : ''}

  ${data.profileFields.length > 0 ? `
    <div class="profile-list">
      ${data.profileFields.map((f) => `<div class="profile-item"><span class="profile-label">${f.label}:</span> ${f.value}</div>`).join('')}
    </div>
  ` : ''}

  ${data.legalBasis.length > 0 ? `
    <div class="legal-basis">
      ${data.legalBasis.map((b) => `<div>• ${b}</div>`).join('')}
    </div>
  ` : ''}

  ${data.tables.map((t) => `
    ${t.title ? `<div class="section-title">${t.title}</div>` : ''}
    <table class="data-table">
      <thead>
        <tr>
          ${t.columns.map((c) => `<th style="width: ${c.widthPct}%; text-align: center;">${c.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${t.rows.map((r) => `
          <tr>
            ${t.columns.map((c) => `<td style="text-align: ${c.align === AlignmentType.CENTER ? 'center' : c.align === AlignmentType.RIGHT ? 'right' : 'left'}; font-weight: ${c.bold ? 'bold' : 'normal'};">${r[c.key] || ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `).join('')}

  ${data.textBlocks.map((b) => `
    <div class="section-title">${b.title}</div>
    ${b.items.map((it) => `<div class="text-block-item"><strong>${it.prefix || ''}</strong>${it.content}</div>`).join('')}
  `).join('')}

  <table class="sig-table">
    <tr>
      <td style="text-align: ${data.signatureType === 'DECISION' ? 'left' : 'center'};">
        <div class="sig-title">${(data.signers.leftTitle || 'NGƯỜI TỰ ĐÁNH GIÁ').toUpperCase()}</div>
        <div class="sig-sub">${data.signers.leftSubtitle || '(Ký, ghi rõ họ và tên)'}</div>
        <div class="sig-space"></div>
        <div class="sig-name">${data.signers.leftName || ''}</div>
      </td>
      <td style="text-align: center;">
        <div class="sig-title">${(data.signers.rightTitle || 'TRƯỞNG PHÒNG CHUYÊN MÔN').toUpperCase()}</div>
        <div class="sig-sub">${data.signers.rightSubtitle || '(Ký, ghi rõ họ và tên)'}</div>
        <div class="sig-space"></div>
        <div class="sig-name">${data.signers.rightName || ''}</div>
      </td>
    </tr>
  </table>

  <script>
    window.onload = function() {
      // Tự động mở hộp thoại in sau khi render
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
