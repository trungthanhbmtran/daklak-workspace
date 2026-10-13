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

    const isMau01 = result.formCode === 'MAU_01' || doc.getElementsByTagName('RegisteredTasks').length > 0;
    const isMau02 = result.formCode === 'MAU_02' || doc.getElementsByTagName('SectionA_GeneralCriteria').length > 0;
    const isMau03 = result.formCode === 'MAU_03' || doc.getElementsByTagName('CollectiveFeedback').length > 0;
    const isMau04 = result.formCode === 'MAU_04' || doc.getElementsByTagName('StaffSummaryTable').length > 0;
    const isMau05 =
      result.formCode === 'MAU_05' ||
      result.formCode.includes('M05') ||
      result.formCode.includes('MAU_05') ||
      doc.getElementsByTagName('IndividualFinalRankings').length > 0 ||
      doc.getElementsByTagName('Form05_FinalEvaluationReport').length > 0 ||
      doc.getElementsByTagName('DecisionTerms').length > 0;

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
          <div class="sig-title">${(data.signers.rightTitle || 'TRƯỞNG PHÒNG CHUYÊN MÔN').toUpperCase()}</div>
          ${data.signatureType === 'DECISION' ? `
            <div style="margin: 14px auto; display: flex; align-items: center; justify-content: center;">
              <div style="width: 76px; height: 76px; border: 2px solid rgba(220, 38, 38, 0.45); border-radius: 50%; color: #dc2626; font-size: 9.5px; font-weight: bold; text-transform: uppercase; display: flex; align-items: center; justify-content: center; text-align: center; padding: 4px; transform: rotate(12deg); user-select: none;">
                Ban Tổ chức Tỉnh ủy Đắk Lắk
              </div>
            </div>
          ` : `
            <div class="sig-sub">${data.signers.rightSubtitle || '(Ký, ghi rõ họ và tên)'}</div>
            <div class="sig-space"></div>
          `}
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
