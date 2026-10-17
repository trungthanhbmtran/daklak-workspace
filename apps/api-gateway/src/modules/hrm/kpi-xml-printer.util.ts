import { DOMParser } from '@xmldom/xmldom';

export interface DynamicTableColumn {
  key: string;
  label: string;
  widthPct: number;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
}

export interface DynamicXmlTable {
  title?: string;
  columns: DynamicTableColumn[];
  rows: Array<Record<string, string>>;
}

export interface DynamicTextBlock {
  title: string;
  items: Array<{
    prefix?: string;
    content: string;
  }>;
}

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
  isPartyAgency: boolean;
  profileFields: Array<{
    label: string;
    value: string;
  }>;
  legalBasis: string[];
  tables: DynamicXmlTable[];
  textBlocks: DynamicTextBlock[];
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

function sanitizeText(val?: string | null, placeholderReplacement = ''): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\{\{.*\}\}$/.test(trimmed) || /^\{.*\}$/.test(trimmed)) {
    return placeholderReplacement;
  }
  return trimmed;
}

function getDirectTagText(parent: any, tagName: string): string {
  if (!parent) return '';
  const elements = parent.getElementsByTagName ? parent.getElementsByTagName(tagName) : [];
  if (!elements || elements.length === 0) return '';
  const el = elements[0];
  return el?.textContent?.trim() || '';
}

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
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'application/xml');
    const root = doc.documentElement;
    if (root) {
      result.formCode = root.getAttribute('formCode') || root.getAttribute('id') || result.formCode;
      result.schemaVersion = root.getAttribute('schemaVersion') || undefined;
    }

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

    const fullOrgText = `${result.agencyName} ${result.organizationName}`.toUpperCase();
    result.isPartyAgency = fullOrgText.includes('TỈNH ỦY') || fullOrgText.includes('ĐẢNG') || fullOrgText.includes('CHI BỘ') || fullOrgText.includes('BTCTU');

    const legalEl = doc.getElementsByTagName('LegalBasis')[0];
    if (legalEl) {
      const items = legalEl.childNodes;
      for (let i = 0; i < items.length; i++) {
        const node: any = items[i];
        if (node.nodeType === 1) {
          const text = sanitizeText(node.textContent);
          if (text) {
            result.legalBasis.push(text.startsWith('Căn cứ') ? text : `Căn cứ ${text}`);
          }
        }
      }
    }

    const profileEl =
      doc.getElementsByTagName('OfficerProfile')[0] ||
      doc.getElementsByTagName('EvaluatedOfficer')[0] ||
      doc.getElementsByTagName('PersonalInformation')[0] ||
      doc.getElementsByTagName('Profile')[0];

    if (profileEl) {
      const children = profileEl.childNodes;
      for (let i = 0; i < children.length; i++) {
        const node: any = children[i];
        if (node.nodeType === 1) {
          const tagName = node.tagName;
          const rawVal = node.textContent?.trim() || '';
          const cleanVal = sanitizeText(rawVal, '........................................................');
          if (cleanVal) {
            const label = TAG_LABEL_MAP[tagName] || tagName;
            result.profileFields.push({ label, value: cleanVal });
          }
        }
      }
    }

    // 4. Nhận diện loại biểu mẫu theo formCode hoặc root tag
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

    // --- MẪU 01: KHUNG DANH MỤC SẢN PHẨM / NHIỆM VỤ ĐĂNG KÝ ĐẦU KỲ ---
    if (isMau01) {
      const taskNodes = Array.from(doc.getElementsByTagName('TaskItem'));
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
            { key: 'stt', label: 'STT', widthPct: 6, align: 'center' },
            { key: 'taskName', label: 'Tên nhiệm vụ / Sản phẩm đăng ký', widthPct: 34, bold: true },
            { key: 'domainName', label: 'Mảng công việc', widthPct: 15, align: 'center' },
            { key: 'plannedQty', label: 'Chỉ tiêu', widthPct: 10, align: 'center' },
            { key: 'difficultyK', label: 'Độ khó (K)', widthPct: 8, align: 'center' },
            { key: 'weight', label: 'Trọng số (W)', widthPct: 8, align: 'center' },
            { key: 'targetDeadline', label: 'Hạn hoàn thành', widthPct: 19, align: 'center' },
          ],
          rows,
        });
      }

      const commitmentsEl = doc.getElementsByTagName('GeneralCommitments')[0];
      if (commitmentsEl) {
        const commitItems: Array<{ content: string }> = [];
        const children = commitmentsEl.childNodes;
        for (let i = 0; i < children.length; i++) {
          const node: any = children[i];
          if (node.nodeType === 1) {
            const text = sanitizeText(node.textContent);
            if (text) commitItems.push({ content: text });
          }
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
      const criteriaNodes = Array.from(doc.getElementsByTagName('Criterion'));
      if (criteriaNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        criteriaNodes.forEach((node, idx) => {
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
            { key: 'stt', label: 'STT', widthPct: 6, align: 'center' },
            { key: 'name', label: 'Nội dung tiêu chí chung', widthPct: 38, bold: true },
            { key: 'desc', label: 'Mô tả tiêu chuẩn', widthPct: 32 },
            { key: 'maxScore', label: 'Điểm chuẩn', widthPct: 8, align: 'center' },
            { key: 'selfScore', label: 'Tự chấm', widthPct: 8, align: 'center', bold: true },
            { key: 'reviewerScore', label: 'Tổ chức chấm', widthPct: 8, align: 'center', bold: true },
          ],
          rows,
        });
      }

      const kpiNodes = Array.from(doc.getElementsByTagName('EvaluatedTask'));
      if (kpiNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        kpiNodes.forEach((node, idx) => {
          rows.push({
            stt: String(idx + 1),
            taskName: sanitizeText(getDirectTagText(node, 'TaskName'), `Nhiệm vụ KPI ${idx + 1}`),
            actualOutput: sanitizeText(getDirectTagText(node, 'ActualDeliverable') || getDirectTagText(node, 'Deliverable'), 'Đã hoàn thành'),
            kpiScore: sanitizeText(getDirectTagText(node, 'KpiScore') || getDirectTagText(node, 'Score'), '10.0'),
            weightedScore: sanitizeText(getDirectTagText(node, 'WeightedScore'), '10.0'),
          });
        });

        result.tables.push({
          title: 'II. KẾT QUẢ THỰC HIỆN CÁC NHIỆM VỤ CHUYÊN MÔN / KPI (Tối đa 70 điểm)',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: 'center' },
            { key: 'taskName', label: 'Tên nhiệm vụ KPI', widthPct: 44, bold: true },
            { key: 'actualOutput', label: 'Sản phẩm đầu ra thực tế', widthPct: 26 },
            { key: 'kpiScore', label: 'Điểm KPI', widthPct: 12, align: 'center' },
            { key: 'weightedScore', label: 'Điểm quy đổi', widthPct: 12, align: 'center', bold: true },
          ],
          rows,
        });
      }
    }

    // --- MẪU 03: BẢN NHẬN XÉT CỦA CHI BỘ VÀ TẬP THỂ LÃNH ĐẠO ---
    if (isMau03) {
      const fbEl = doc.getElementsByTagName('CollectiveFeedback')[0];
      if (fbEl) {
        const fbItems: Array<{ prefix?: string; content: string }> = [];
        const chiBo = sanitizeText(getDirectTagText(fbEl, 'ChiBoComments'));
        if (chiBo) fbItems.push({ prefix: '1. Ý kiến nhận xét của Chi bộ: ', content: chiBo });

        const lanhDao = sanitizeText(getDirectTagText(fbEl, 'DepartmentLeaderComments'));
        if (lanhDao) fbItems.push({ prefix: '2. Ý kiến của Lãnh đạo Phòng: ', content: lanhDao });

        const uuDiem = sanitizeText(getDirectTagText(fbEl, 'Strengths'));
        if (uuDiem) fbItems.push({ prefix: '3. Ưu điểm nổi bật: ', content: uuDiem });

        const tonTai = sanitizeText(getDirectTagText(fbEl, 'Weaknesses'));
        if (tonTai) fbItems.push({ prefix: '4. Tồn tại, hạn chế: ', content: tonTai });

        const xepLoai = sanitizeText(getDirectTagText(fbEl, 'ProposedRank'));
        if (xepLoai) fbItems.push({ prefix: '5. Đề xuất mức xếp loại: ', content: xepLoai });

        if (fbItems.length > 0) {
          result.textBlocks.push({
            title: 'NỘI DUNG NHẬN XÉT CỦA CHI BỘ VÀ TẬP THỂ LÃNH ĐẠO',
            items: fbItems,
          });
        }
      }
    }

    // --- MẪU 04: BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ TẬP THỂ PHÒNG ---
    if (isMau04) {
      const staffNodes = Array.from(doc.getElementsByTagName('StaffRecord'));
      if (staffNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        staffNodes.forEach((node, idx) => {
          rows.push({
            stt: String(idx + 1),
            fullName: sanitizeText(getDirectTagText(node, 'FullName'), `Cán bộ ${idx + 1}`),
            jobTitle: sanitizeText(getDirectTagText(node, 'JobTitle'), 'Chuyên viên'),
            totalScore: sanitizeText(getDirectTagText(node, 'TotalScore'), '85.0'),
            proposedRank: sanitizeText(getDirectTagText(node, 'ProposedRank'), 'Hoàn thành tốt nhiệm vụ'),
            notes: sanitizeText(getDirectTagText(node, 'Notes'), ''),
          });
        });

        result.tables.push({
          title: 'BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ CÁN BỘ TRONG PHÒNG',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 6, align: 'center' },
            { key: 'fullName', label: 'Họ và tên cán bộ', widthPct: 30, bold: true },
            { key: 'jobTitle', label: 'Vị trí việc làm', widthPct: 20 },
            { key: 'totalScore', label: 'Tổng điểm', widthPct: 12, align: 'center', bold: true },
            { key: 'proposedRank', label: 'Xếp loại đề xuất', widthPct: 22, align: 'center' },
            { key: 'notes', label: 'Ghi chú', widthPct: 10, align: 'center' },
          ],
          rows,
        });
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
          { key: 'stt', label: 'STT', widthPct: 8, align: 'center' },
          { key: 'grade', label: 'Mức xếp loại đề xuất', widthPct: 52, bold: true },
          { key: 'count', label: 'Số lượng cán bộ', widthPct: 20, align: 'center' },
          { key: 'ratio', label: 'Tỷ lệ %', widthPct: 20, align: 'center', bold: true },
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

      const critNodes = Array.from(doc.getElementsByTagName('Criterion'));
      if (critNodes.length > 0) {
        const rows: Array<Record<string, string>> = [];
        critNodes.forEach((node, idx) => {
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
            { key: 'stt', label: 'Mã số', widthPct: 8, align: 'center' },
            { key: 'name', label: 'Nội dung tiêu chí chung', widthPct: 52, bold: true },
            { key: 'maxScore', label: 'Điểm tối đa', widthPct: 12, align: 'center' },
            { key: 'score', label: 'Điểm đạt', widthPct: 12, align: 'center', bold: true },
            { key: 'status', label: 'Trạng thái', widthPct: 16, align: 'center' },
          ],
          rows,
        });
      }

      const taskList = Array.from(doc.getElementsByTagName('TaskItem'));
      if (taskList.length > 0) {
        const rows: Array<Record<string, string>> = [];
        taskList.forEach((node, idx) => {
          rows.push({
            stt: node.getAttribute('id') || String(idx + 1),
            name: sanitizeText(getDirectTagText(node, 'TaskName'), `Nhiệm vụ KPI ${idx + 1}`),
            deliverable: sanitizeText(getDirectTagText(node, 'OutputProduct'), 'Báo cáo / Tờ trình'),
            planned: sanitizeText(getDirectTagText(node, 'PlannedQuantity'), '1'),
            completed: sanitizeText(getDirectTagText(node, 'CompletedQuantity'), '1'),
            quality: sanitizeText(getDirectTagText(node, 'QualityFactor'), '1.00'),
            sla: sanitizeText(getDirectTagText(node, 'SLAFactor'), '1.00'),
            score: sanitizeText(getDirectTagText(node, 'CalculatedScore'), '70.0'),
          });
        });
        result.tables.push({
          title: 'PHẦN B: KẾT QUẢ THỰC HIỆN NHIỆM VỤ - KPI (TỐI ĐA 70 ĐIỂM)',
          columns: [
            { key: 'stt', label: 'Mã', widthPct: 6, align: 'center' },
            { key: 'name', label: 'Tên nhiệm vụ chuyên môn', widthPct: 34, bold: true },
            { key: 'deliverable', label: 'Sản phẩm đầu ra', widthPct: 20 },
            { key: 'completed', label: 'Số lượng', widthPct: 10, align: 'center' },
            { key: 'quality', label: 'Chất lượng', widthPct: 10, align: 'center' },
            { key: 'sla', label: 'Tiến độ', widthPct: 10, align: 'center' },
            { key: 'score', label: 'Điểm', widthPct: 10, align: 'center', bold: true },
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

      const records = Array.from(doc.getElementsByTagName('SummaryRecord'));
      if (records.length > 0) {
        const rows: Array<Record<string, string>> = [];
        records.forEach((node, idx) => {
          rows.push({
            stt: node.getAttribute('stt') || String(idx + 1),
            fullName: sanitizeText(getDirectTagText(node, 'FullName'), `Cán bộ ${idx + 1}`),
            position: sanitizeText(getDirectTagText(node, 'Position'), 'Trưởng phòng Tổ chức Cán bộ'),
            selfScore: sanitizeText(getDirectTagText(node, 'SelfScore'), '100.0'),
            appraisalScore: sanitizeText(getDirectTagText(node, 'AppraisalScore'), '100.0'),
            grade: sanitizeText(getDirectTagText(node, 'AuthorityProposedGrade'), 'Hoàn thành xuất sắc nhiệm vụ'),
            quotaCheck: sanitizeText(getDirectTagText(node, 'ExceedingQuotaCheck'), 'Đạt trần 20%'),
            notes: sanitizeText(getDirectTagText(node, 'Notes'), '-'),
          });
        });

        result.tables.push({
          title: 'DANH SÁCH TỔNG HỢP ĐÁNH GIÁ, XẾP LOẠI CÁN BỘ, CÔNG CHỨC',
          columns: [
            { key: 'stt', label: 'STT', widthPct: 5, align: 'center' },
            { key: 'fullName', label: 'Họ và tên cán bộ', widthPct: 22, bold: true },
            { key: 'position', label: 'Chức danh / VTVL', widthPct: 18 },
            { key: 'selfScore', label: 'Tự chấm', widthPct: 9, align: 'center' },
            { key: 'appraisalScore', label: 'Thẩm định', widthPct: 9, align: 'center', bold: true },
            { key: 'grade', label: 'Xếp loại đề xuất', widthPct: 18, align: 'center' },
            { key: 'quotaCheck', label: 'Kiểm tra trần 20%', widthPct: 19, align: 'center' },
          ],
          rows,
        });
      }

      result.signers.leftTitle = 'NGƯỜI TỔNG HỢP';
      result.signers.leftSubtitle = '(Ký, ghi rõ họ và tên)';
      result.signers.rightTitle = 'TẬP THỂ LÃNH ĐẠO BAN';
      result.signers.rightSubtitle = '(Ký, ghi rõ họ và tên)';
    }

    // --- MẪU 05 & M05_BAOCAO_QUYETDINH: QUYẾT ĐỊNH PHÊ DUYỆT XẾP LOẠI CHẤT LƯỢNG ---
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

      if (result.legalBasis.length === 0) {
        result.legalBasis = [
          'Căn cứ Quy định số 01-QĐ/BTCTU ngày 25/12/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk về chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy cơ quan',
          'Căn cứ Hướng dẫn số 05-HD/TU ngày 20/02/2026 của Ban Thường vụ Tỉnh ủy Đắk Lắk về đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức hằng quý và hằng năm',
          'Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ Ngành Tổ chức xây dựng Đảng',
          'Căn cứ Biên bản cuộc họp của Hội đồng Thẩm định đánh giá xếp loại cơ quan Ban Tổ chức Tỉnh ủy ngày 25 tháng 03 năm 2026',
          'Xét đề nghị của Trưởng phòng Tổ chức cán bộ và Chánh Văn phòng Ban'
        ];
      }

      const articleItems: Array<{ prefix?: string; content: string }> = [];
      const articles = Array.from(doc.getElementsByTagName('Article'));
      if (articles.length > 0) {
        articles.forEach((node, idx) => {
          const num = node.getAttribute('number') || String(idx + 1);
          const title = node.getAttribute('title') || '';
          const content = sanitizeText(node.textContent);
          articleItems.push({
            prefix: `Điều ${num}.${title ? ` (${title})` : ''} `,
            content,
          });
        });
      } else {
        const decTerms = doc.getElementsByTagName('DecisionTerms')[0];
        const art1 = sanitizeText(getDirectTagText(decTerms, 'Article1'));
        const art2 = sanitizeText(getDirectTagText(decTerms, 'Article2'));
        const art3 = sanitizeText(getDirectTagText(decTerms, 'Article3'));
        if (art1 || art2 || art3) {
          if (art1) articleItems.push({ prefix: 'Điều 1. ', content: art1 });
          if (art2) articleItems.push({ prefix: 'Điều 2. ', content: art2 });
          if (art3) articleItems.push({ prefix: 'Điều 3. ', content: art3 });
        }
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

      const apis = Array.from(doc.getElementsByTagName('API'));
      if (apis.length > 0) {
        const rows: Array<Record<string, string>> = [];
        apis.forEach((node, idx) => {
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
            { key: 'stt', label: 'STT', widthPct: 10, align: 'center' },
            { key: 'id', label: 'Mã dịch vụ', widthPct: 20, align: 'center', bold: true },
            { key: 'path', label: 'Endpoint đường dẫn API', widthPct: 50 },
            { key: 'level', label: 'Cấp độ an toàn', widthPct: 20, align: 'center' },
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
          { key: 'party', label: 'Giá trị trong CSDL Đảng viên', widthPct: 25, align: 'center' },
          { key: 'civil', label: 'Giá trị trong CSDL Quốc gia', widthPct: 25, align: 'center' },
          { key: 'sot', label: 'Nguồn chuẩn (Source of Truth)', widthPct: 15, align: 'center', bold: true },
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
          { key: 'stt', label: 'STT', widthPct: 10, align: 'center' },
          { key: 'metric', label: 'Chỉ số đo lường hiệu năng kỹ thuật', widthPct: 55, bold: true },
          { key: 'val', label: 'Kết quả ghi nhận', widthPct: 35, align: 'center', bold: true },
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

    const sigEl = doc.getElementsByTagName('Signatures')[0] || doc.getElementsByTagName('SigningBlock')[0];
    if (sigEl) {
      const leftTitle = sanitizeText(getDirectTagText(sigEl, 'LeftSignerTitle') || getDirectTagText(sigEl, 'LeftTitle'));
      if (leftTitle) result.signers.leftTitle = leftTitle;

      const leftSub = sanitizeText(getDirectTagText(sigEl, 'LeftSignerSubtitle') || getDirectTagText(sigEl, 'LeftSubtitle'));
      if (leftSub) result.signers.leftSubtitle = leftSub;

      const leftName = sanitizeText(getDirectTagText(sigEl, 'LeftSignerName') || getDirectTagText(sigEl, 'LeftName'));
      if (leftName) result.signers.leftName = leftName;

      const rightTitle = sanitizeText(getDirectTagText(sigEl, 'RightSignerTitle') || getDirectTagText(sigEl, 'RightTitle'));
      if (rightTitle) result.signers.rightTitle = rightTitle;

      const rightSub = sanitizeText(getDirectTagText(sigEl, 'RightSignerSubtitle') || getDirectTagText(sigEl, 'RightSubtitle'));
      if (rightSub) result.signers.rightSubtitle = rightSub;

      const rightName = sanitizeText(getDirectTagText(sigEl, 'RightSignerName') || getDirectTagText(sigEl, 'RightName'));
      if (rightName) result.signers.rightName = rightName;

      const dateStr = sanitizeText(getDirectTagText(sigEl, 'RightDate') || getDirectTagText(sigEl, 'SignDate'));
      if (dateStr) result.signers.rightDate = dateStr;
    }
  } catch {
    // Graceful fallback
  }

  return result;
}

export function generatePrintDocumentHtml(data: ParsedXmlDocumentData): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.documentTitle} - ${data.formCode}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap');
    @page {
      size: A4 portrait;
      margin: 20mm 15mm 20mm 30mm;
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
      margin-top: 2px;
    }
    .divider-solid {
      height: 1.5px;
      background-color: #000000;
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
      border: 1px solid #000000;
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
        background: #ffffff !important;
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
    ${data.subTitle ? `<div class="doc-subtitle" style="font-size: 13.5pt; font-weight: bold; text-align: center; margin-bottom: 18px;">${data.subTitle}</div>` : ''}
    ${data.periodName ? `<div class="doc-period">(Kỳ đánh giá: ${data.periodName})</div>` : ''}

    ${data.profileFields.length > 0 ? `
      <div class="profile-list">
        ${data.profileFields.map((f) => `<div class="profile-item"><span class="profile-label">${f.label}:</span> ${f.value}</div>`).join('')}
      </div>
    ` : ''}

    ${data.legalBasis.length > 0 ? `
      <div class="legal-basis">
        ${data.legalBasis.map((b, idx) => `<div>${b}${idx === data.legalBasis.length - 1 ? '.' : ';'}</div>`).join('')}
      </div>
    ` : ''}

    ${data.tables.map((t) => `
      ${t.title ? `<div class="section-title">${t.title}</div>` : ''}
      <table class="data-table">
        <thead>
          <tr>
            ${t.columns.map((c) => `<th style="width: ${c.widthPct}%;">${c.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${t.rows.map((r) => `
            <tr>
              ${t.columns.map((c) => `<td style="text-align: ${c.align || 'left'}; font-weight: ${c.bold ? 'bold' : 'normal'};">${r[c.key] || ''}</td>`).join('')}
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
          <div class="sig-title">${(data.signers.rightTitle || (data.signatureType === 'DECISION' ? 'TRƯỞNG BAN' : 'TRƯỞNG PHÒNG CHUYÊN MÔN')).toUpperCase()}</div>
          <div class="sig-sub">${data.signers.rightSubtitle || (data.signatureType === 'DECISION' ? '(Ký, đóng dấu)' : '(Ký, ghi rõ họ và tên)')}</div>
          <div class="sig-space" style="height: 75px;"></div>
          <div class="sig-name">${data.signers.rightName || ''}</div>
        </td>
      </tr>
    </table>
  </div>

  <script>
    window.onload = function() {
      if (window.location.search.includes('autoPrint=true') || window.location.search.includes('autoprint=1')) {
        setTimeout(function() { window.print(); }, 350);
      }
    };
  </script>
</body>
</html>`;
}

export function renderKpiXmlToPrintHtml(xmlContent: string, templateTitleFallback?: string): string {
  const data = parseKpiXml(xmlContent, templateTitleFallback);
  return generatePrintDocumentHtml(data);
}

export const KpiXmlPrinterUtil = {
  renderKpiXmlToPrintHtml,
  generatePrintableHtml: renderKpiXmlToPrintHtml,
  parseKpiXml,
  generatePrintDocumentHtml,
};
