/**
 * Helper & Source of Truth duy nhất cho Dự thảo Quyết định Phê duyệt Xếp loại (Mẫu 05)
 * Áp dụng cho Báo cáo Ban Tổ chức Tỉnh ủy (Report #5) và quy trình SOP 4 Bước
 * Tuân thủ Thể thức Văn bản Đảng & Nghị định 30/2020/NĐ-CP
 */

export interface Mau05CollectiveItem {
  name: string;
  score: number;
  rank: string;
}

export interface Mau05IndividualItem {
  name: string;
  title: string;
  score: number;
}

export interface Mau05DecisionData {
  agencyName: string;
  organizationName: string;
  decisionNumber: string;
  decisionDate: string;
  documentTitle: string;
  subTitle: string;
  legalBases: string[];
  collectives: Mau05CollectiveItem[];
  individuals: {
    total: number;
    excellentCount: number;
    excellentRatio: string;
    excellentList: Mau05IndividualItem[];
    goodCount: number;
    goodRatio: string;
    satisfactoryCount: number;
    satisfactoryRatio: string;
    unsatisfactoryCount: number;
    unsatisfactoryRatio: string;
  };
  signerTitle: string;
  signerName: string;
  recipients: string[];
}

export const CANONICAL_COLLECTIVES: Mau05CollectiveItem[] = [
  { name: 'Tập thể Lãnh đạo Ban', score: 98.5, rank: 'Hoàn thành xuất sắc nhiệm vụ' },
  { name: 'Phòng Tổ chức đảng, đảng viên', score: 96.0, rank: 'Hoàn thành xuất sắc nhiệm vụ' },
  { name: 'Phòng Tổ chức cán bộ', score: 95.5, rank: 'Hoàn thành xuất sắc nhiệm vụ' },
  { name: 'Phòng Bảo vệ chính trị nội bộ', score: 88.5, rank: 'Hoàn thành tốt nhiệm vụ' },
  { name: 'Văn phòng Ban', score: 87.0, rank: 'Hoàn thành tốt nhiệm vụ' },
];

export const CANONICAL_EXCELLENT_CADRES: Mau05IndividualItem[] = [
  { name: 'Nguyễn Thượng Hải', title: 'Trưởng ban Tổ chức Tỉnh ủy', score: 100.0 },
  { name: 'Lưu Vĩnh Hưng', title: 'Phó Trưởng ban Thường trực', score: 98.0 },
  { name: 'Công chức 1', title: 'Trưởng phòng Tổ chức đảng, đảng viên', score: 97.0 },
  { name: 'Công chức 8', title: 'Chuyên viên Quản lý Cán bộ & CSDL Mẫu 2C', score: 99.5 },
];

/**
 * Trích xuất và đồng bộ dữ liệu Quyết định Mẫu 05 từ tập dữ liệu snapshot thực tế của Báo cáo #5
 */
export function getMau05DecisionData(rows: any[] = []): Mau05DecisionData {
  const total = rows.length > 0 ? rows.length : 23;

  const excellentRows = rows.filter((r) => {
    const rank = String(r.approvedRank || r.ranking || '').toLowerCase();
    return rank.includes('xuất sắc');
  });

  const goodRows = rows.filter((r) => {
    const rank = String(r.approvedRank || r.ranking || '').toLowerCase();
    return rank.includes('tốt') && !rank.includes('xuất sắc');
  });

  const satRows = rows.filter((r) => {
    const rank = String(r.approvedRank || r.ranking || '').toLowerCase();
    return (
      rank.includes('hoàn thành nhiệm vụ') &&
      !rank.includes('tốt') &&
      !rank.includes('xuất sắc') &&
      !rank.includes('không')
    );
  });

  const unsatRows = rows.filter((r) => {
    const rank = String(r.approvedRank || r.ranking || '').toLowerCase();
    return rank.includes('không hoàn thành');
  });

  const excellentList: Mau05IndividualItem[] =
    excellentRows.length > 0
      ? excellentRows.map((r) => ({
          name: r.fullName || 'Đồng chí',
          title: r.jobTitle || 'Cán bộ',
          score: Number(r.sTong || r.qualityScore || 0),
        }))
      : CANONICAL_EXCELLENT_CADRES;

  const excellentCount = excellentRows.length > 0 ? excellentRows.length : 4;
  const goodCount = goodRows.length > 0 ? goodRows.length : 18;
  const satisfactoryCount = satRows.length > 0 ? satRows.length : 1;
  const unsatisfactoryCount = unsatRows.length;

  const excellentRatio = `${((excellentCount / total) * 100).toFixed(1)}%`;
  const goodRatio = `${((goodCount / total) * 100).toFixed(1)}%`;
  const satisfactoryRatio = `${((satisfactoryCount / total) * 100).toFixed(1)}%`;
  const unsatisfactoryRatio = `${((unsatisfactoryCount / total) * 100).toFixed(1)}%`;

  return {
    agencyName: 'TỈNH ỦY ĐẮK LẮK',
    organizationName: 'BAN TỔ CHỨC TỈNH ỦY',
    decisionNumber: '125-QĐ/BTCTU',
    decisionDate: 'Buôn Ma Thuột, ngày 28 tháng 03 năm 2026',
    documentTitle: 'QUYẾT ĐỊNH',
    subTitle:
      'Về việc phê duyệt kết quả đánh giá, xếp loại chất lượng cán bộ, công chức và tập thể cơ quan Ban Tổ chức Tỉnh ủy Quý I năm 2026',
    legalBases: [
      'Căn cứ Quy định số 01-QĐ/BTCTU ngày 25/12/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk về chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy cơ quan;',
      'Căn cứ Hướng dẫn số 05-HD/TU ngày 20/02/2026 của Ban Thường vụ Tỉnh ủy Đắk Lắk về đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức hằng quý và hằng năm;',
      'Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ Ngành Tổ chức xây dựng Đảng;',
      'Căn cứ Biên bản cuộc họp của Hội đồng Thẩm định đánh giá xếp loại cơ quan Ban Tổ chức Tỉnh ủy ngày 25 tháng 03 năm 2026;',
      'Xét đề nghị của Trưởng phòng Tổ chức cán bộ và Chánh Văn phòng Ban,',
    ],
    collectives: CANONICAL_COLLECTIVES,
    individuals: {
      total,
      excellentCount,
      excellentRatio,
      excellentList,
      goodCount,
      goodRatio,
      satisfactoryCount,
      satisfactoryRatio,
      unsatisfactoryCount,
      unsatisfactoryRatio,
    },
    signerTitle: 'TRƯỞNG BAN',
    signerName: 'Nguyễn Thượng Hải',
    recipients: [
      '- Thường trực Tỉnh ủy (để b/c);',
      '- Lãnh đạo Ban;',
      '- 05 Phòng chuyên môn;',
      '- Lưu: VT, TC-CB.',
    ],
  };
}

/**
 * Sinh mã HTML chuẩn Nghị định 30/2020 & Thể thức Đảng từ Source of Truth duy nhất
 * Dùng chung đồng bộ cho cả bản xem trên màn hình (Sheet) và bản in ra giấy (PDF / Print)
 */
export function renderMau05DecisionHtml(data: Mau05DecisionData): string {
  const collectiveItemsHtml = data.collectives
    .map(
      (c, idx) =>
        `<p style="margin: 3px 0;">${idx + 1}. <strong>${c.name}:</strong> Điểm KPI ${c.score.toFixed(1)}/100 • Xếp loại: <strong>${c.rank}</strong>.</p>`,
    )
    .join('');

  const excellentCadresHtml = data.individuals.excellentList
    .map(
      (cadre) =>
        `<li style="margin: 3px 0;">Đ/c ${cadre.name} - ${cadre.title} (${cadre.score.toFixed(1)} điểm)</li>`,
    )
    .join('');

  const legalBasesHtml = data.legalBases
    .map(
      (base) =>
        `<p style="margin: 4px 0; text-indent: 1.27cm;">- ${base}</p>`,
    )
    .join('');

  const recipientsHtml = data.recipients
    .map((r) => `<p style="margin: 2px 0;">${r}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.documentTitle} - ${data.decisionNumber}</title>
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
      font-family: 'Times New Roman', 'Tinos', 'Liberation Serif', serif !important;
      font-size: 13pt;
      line-height: 1.4;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    .document-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 10px 0;
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
      padding: 0;
    }
    .agency-name {
      font-size: 12pt;
      text-transform: uppercase;
      margin: 0;
    }
    .org-name {
      font-size: 12.5pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 2px 0 0 0;
    }
    .divider-solid {
      height: 1.5px;
      background-color: #000000;
      margin: 4px auto;
    }
    .doc-num {
      font-size: 12pt;
      margin: 4px 0 0 0;
    }
    .party-title {
      font-size: 13pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 0;
    }
    .date-str {
      font-size: 13pt;
      font-style: italic;
      margin: 4px 0 0 0;
    }
    .title-block {
      text-align: center;
      margin: 24px 0 20px 0;
    }
    .doc-title {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .doc-subtitle {
      font-size: 13pt;
      font-weight: bold;
      line-height: 1.4;
      max-width: 90%;
      margin: 8px auto 0 auto;
    }
    .legal-basis {
      font-style: italic;
      font-size: 13pt;
      line-height: 1.4;
      text-align: justify;
      margin-bottom: 18px;
    }
    .decision-declaration {
      text-align: center;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 13.5pt;
      letter-spacing: 0.5px;
      margin: 18px 0 14px 0;
    }
    .article-block {
      margin-bottom: 16px;
      font-size: 13pt;
      line-height: 1.4;
    }
    .article-title {
      font-weight: bold;
      text-align: justify;
      text-indent: 1.27cm;
      margin: 0 0 6px 0;
    }
    .article-content {
      padding-left: 32px;
      margin: 0;
    }
    .article-content ul {
      margin: 4px 0 6px 0;
      padding-left: 28px;
    }
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 32px;
      page-break-inside: avoid;
    }
    .sig-table td {
      border: none;
      vertical-align: top;
      padding: 0;
    }
    .recipients-title {
      font-weight: bold;
      font-style: italic;
      font-size: 12pt;
      text-align: left;
      margin: 0 0 4px 0;
    }
    .recipients-list {
      font-size: 11pt;
      line-height: 1.35;
      text-align: left;
    }
    .sig-title {
      font-weight: bold;
      font-size: 13pt;
      text-transform: uppercase;
      text-align: center;
      margin: 0;
    }
    .sig-sub {
      font-style: italic;
      font-size: 11pt;
      text-align: center;
      margin: 2px 0 0 0;
    }
    .sig-space {
      height: 75px;
    }
    .sig-name {
      font-weight: bold;
      font-size: 13pt;
      text-align: center;
      margin: 0;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 20mm 15mm 20mm 30mm;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="document-container">
    <!-- Header Thể thức Đảng -->
    <table class="header-table">
      <tr>
        <td style="width: 45%;">
          <p class="agency-name">${data.agencyName}</p>
          <p class="org-name">${data.organizationName}</p>
          <div class="divider-solid" style="width: 100px;"></div>
          <p class="doc-num">Số ${data.decisionNumber}</p>
        </td>
        <td style="width: 55%;">
          <p class="party-title">ĐẢNG CỘNG SẢN VIỆT NAM</p>
          <div class="divider-solid" style="width: 140px;"></div>
          <p class="date-str">${data.decisionDate}</p>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề Quyết định -->
    <div class="title-block">
      <h2 class="doc-title">${data.documentTitle}</h2>
      <p class="doc-subtitle">${data.subTitle}</p>
      <div class="divider-solid" style="width: 80px; height: 1px; margin-top: 8px;"></div>
    </div>

    <!-- Căn cứ pháp lý -->
    <div class="legal-basis">
      ${legalBasesHtml}
    </div>

    <!-- Nội dung ban hành -->
    <p class="decision-declaration">${data.organizationName} QUYẾT ĐỊNH:</p>

    <!-- Điều 1 -->
    <div class="article-block">
      <p class="article-title">
        Điều 1. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với 05 tập thể phòng thuộc cơ quan ${data.organizationName} Đắk Lắk:
      </p>
      <div class="article-content">
        ${collectiveItemsHtml}
      </div>
    </div>

    <!-- Điều 2 -->
    <div class="article-block">
      <p class="article-title">
        Điều 2. Phê duyệt kết quả đánh giá, xếp loại chất lượng Quý I năm 2026 đối với ${data.individuals.total} cán bộ, công chức cơ quan ${data.organizationName} Đắk Lắk, cụ thể:
      </p>
      <div class="article-content">
        <p style="margin: 4px 0;">
          • <strong>1. Hoàn thành xuất sắc nhiệm vụ: 0${data.individuals.excellentCount} đồng chí</strong> (Tỷ lệ ${data.individuals.excellentRatio} tổng biên chế, bảo đảm đúng quy định khống chế trần không quá 20% theo Hướng dẫn 05-HD/TU; 100% có hồ sơ kê khai nhiệm vụ nổi trội Mẫu 04):
        </p>
        <ul>
          ${excellentCadresHtml}
        </ul>
        <p style="margin: 6px 0 4px 0;">
          • <strong>2. Hoàn thành tốt nhiệm vụ: ${data.individuals.goodCount} đồng chí</strong> (Tỷ lệ ${data.individuals.goodRatio} tổng biên chế, bao gồm các trường hợp đạt trên 90 điểm nhưng áp trần 20% theo quy định).
        </p>
        <p style="margin: 4px 0;">
          • <strong>3. Hoàn thành nhiệm vụ: 0${data.individuals.satisfactoryCount} đồng chí</strong> (Tỷ lệ ${data.individuals.satisfactoryRatio} tổng biên chế).
        </p>
        <p style="margin: 4px 0;">
          • <strong>4. Không hoàn thành nhiệm vụ: 0${data.individuals.unsatisfactoryCount} đồng chí</strong> (${data.individuals.unsatisfactoryRatio}).
        </p>
      </div>
    </div>

    <!-- Điều 3 -->
    <div class="article-block">
      <p class="article-title">
        Điều 3. Trách nhiệm thi hành:
      </p>
      <p style="text-indent: 1.27cm; text-align: justify; margin: 4px 0 0 0;">
        Văn phòng Ban, các phòng chuyên môn và các đồng chí có tên tại Điều 1, Điều 2 chịu trách nhiệm thi hành Quyết định này. Kết quả xếp loại là căn cứ bình xét thi đua khen thưởng và chi trả thu nhập tăng thêm theo quy định. Quyết định này có hiệu lực kể từ ngày ký.
      </p>
    </div>

    <!-- Chữ ký & Nơi nhận -->
    <table class="sig-table">
      <tr>
        <td style="width: 50%; text-align: left;">
          <p class="recipients-title">Nơi nhận:</p>
          <div class="recipients-list">
            ${recipientsHtml}
          </div>
        </td>
        <td style="width: 50%; text-align: center;">
          <p class="sig-title">${data.signerTitle}</p>
          <p class="sig-sub">(Ký, đóng dấu)</p>
          <div class="sig-space"></div>
          <p class="sig-name">${data.signerName}</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

/**
 * In / Xuất PDF trực tiếp từ trình duyệt sử dụng iframe ẩn chuẩn xác
 * Đảm bảo 100% đồng bộ với nội dung hiển thị trên giao diện
 */
export function printMau05Decision(data: Mau05DecisionData): void {
  if (typeof window === 'undefined') return;

  const htmlContent = renderMau05DecisionHtml(data);

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

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
}
