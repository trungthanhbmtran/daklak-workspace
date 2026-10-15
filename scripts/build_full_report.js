/**
 * Build Full Report Script: Sinh file Word hoàn chỉnh cho Ban Tổ chức Tỉnh ủy Đắk Lắk
 */

const fs = require('fs');
const path = require('path');
const {
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
  Header,
  Footer,
  PageNumber,
  HeadingLevel,
} = require('docx');

const {
  p,
  h1,
  h2,
  h3,
  bullet,
  callout,
  createTable,
  createImageParagraph,
  COLOR_PRIMARY,
  COLOR_SECONDARY,
  COLOR_TEXT,
} = require('./docx_helpers');

async function generateReport() {
  console.log('Bắt đầu khởi tạo nội dung tài liệu Báo cáo...');

  const children = [];

  // ==========================================================================
  // KHỐI TIÊU ĐỀ ĐẦU VĂN BẢN (OFFICIAL HEADER)
  // ==========================================================================
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 45, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({
                      text: 'TỈNH ỦY ĐẮK LẮK\n',
                      font: 'Times New Roman',
                      size: 22,
                      bold: true,
                    }),
                    new TextRun({
                      text: 'BAN TỔ CHỨC TỈNH ỦY\n',
                      font: 'Times New Roman',
                      size: 22,
                      bold: true,
                      color: COLOR_PRIMARY,
                    }),
                    new TextRun({
                      text: '----------o0o----------',
                      font: 'Times New Roman',
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 55, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 0, after: 40 },
                  children: [
                    new TextRun({
                      text: 'ĐẢNG CỘNG SẢN VIỆT NAM\n',
                      font: 'Times New Roman',
                      size: 22,
                      bold: true,
                    }),
                    new TextRun({
                      text: 'Đắk Lắk, ngày 15 tháng 10 năm 2026',
                      font: 'Times New Roman',
                      size: 21,
                      italics: true,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ spacing: { before: 200, after: 100 } }));

  // TIÊU ĐỀ LỚN
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: 'BÁO CÁO THUYẾT MINH GIẢI PHÁP KỸ THUẬT & PHƯƠNG ÁN TRIỂN KHAI\n',
          font: 'Times New Roman',
          size: 32, // 16pt
          bold: true,
          color: COLOR_PRIMARY,
        }),
        new TextRun({
          text: 'PHẦN MỀM QUẢN LÝ, ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ BẰNG KPI/OKR\n',
          font: 'Times New Roman',
          size: 30, // 15pt
          bold: true,
          color: COLOR_SECONDARY,
        }),
        new TextRun({
          text: 'TẠI CƠ QUAN BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK',
          font: 'Times New Roman',
          size: 28, // 14pt
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
      children: [
        new TextRun({
          text: '(Tài liệu chuẩn hóa bám sát yêu cầu đề bài, Quy định số 01-QĐ/BTCTU, Hướng dẫn số 05-HD/TU, Quy định 348-QĐ/BTCTW và Nghị định 331/2026/NĐ-CP)',
          font: 'Times New Roman',
          size: 22,
          italics: true,
          color: '595959',
        }),
      ],
    })
  );

  // ==========================================================================
  // KHỐI TÓM TẮT CHỈ ĐẠO & CĂN CỨ PHÁP LÝ
  // ==========================================================================
  children.push(
    callout(
      'MỤC TIÊU & SỨ MỆNH CHUYỂN ĐỔI SỐ:',
      'Đề án xây dựng phần mềm Quản lý, đánh giá kết quả thực hiện nhiệm vụ bằng KPI/OKR tại Ban Tổ chức Tỉnh ủy Đắk Lắk được thiết kế nhằm mục tiêu: Lượng hóa tối đa kết quả công tác cán bộ; chuyển đổi từ phương thức đánh giá định tính, cảm tính sang quản trị bằng dữ liệu thực tế (Data-driven Management); tự động hóa toàn diện quy trình giao việc, giám sát tiến độ thời gian thực, thẩm định 3 mức lỗi và tổng hợp xếp loại; tích hợp trí tuệ nhân tạo (AI) và kết nối liên thông trực tiếp với các cơ sở dữ liệu quốc gia theo thời gian thực.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // ==========================================================================
  // PHẦN I: BỐI CẢNH, CĂN CỨ PHÁP LÝ VÀ PHẠM VI ỨNG DỤNG
  // ==========================================================================
  children.push(h1('PHẦN I. CĂN CỨ PHÁP LÝ VÀ PHẠM VI ỨNG DỤNG'));

  children.push(
    p(
      'Việc xây dựng và triển khai Phần mềm Quản lý, đánh giá kết quả thực hiện nhiệm vụ bằng KPI/OKR tại Ban Tổ chức Tỉnh ủy Đắk Lắk được thiết lập trên hệ thống các căn cứ chính trị, pháp lý và kỹ thuật chặt chẽ của Đảng và Nhà nước, bao gồm:'
    )
  );

  children.push(
    bullet(
      '1. Về chủ trương, định hướng của Đảng:',
      'Nghị quyết số 18-NQ/TW ngày 25/10/2017 của Ban Chấp hành Trung ương Đảng khóa XII về một số vấn đề tiếp tục đổi mới, sắp xếp tổ chức bộ máy của hệ thống chính trị tinh gọn, hoạt động hiệu lực, hiệu quả; Kết luận số 21-KL/TW của Hội nghị Trung ương 4 khóa XIII về đẩy mạnh xây dựng, chỉnh đốn Đảng; Đề án chuyển đổi số trong các cơ quan Đảng giai đoạn 2025 - 2030.'
    )
  );

  children.push(
    bullet(
      '2. Về quy định đánh giá cán bộ và chức năng nhiệm vụ:',
      'Quy định số 01-QĐ/BTCTU ngày 28/11/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk về chức năng, nhiệm vụ, tổ chức bộ máy và vị trí việc làm cơ quan Ban Tổ chức Tỉnh ủy; Hướng dẫn số 05-HD/TU và Quy định số 39-QĐ/TU của Ban Thường vụ Tỉnh ủy Đắk Lắk về phân cấp quản lý cán bộ và đánh giá, xếp loại chất lượng cán bộ, công chức, viên chức; Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về tiêu chuẩn, tiêu chí đánh giá cán bộ và công tác bảo vệ chính trị nội bộ.'
    )
  );

  children.push(
    bullet(
      '3. Về an toàn thông tin, an ninh mạng và bảo vệ bí mật nhà nước:',
      'Nghị định số 331/2026/NĐ-CP của Chính phủ quy định về an ninh mạng và an toàn thông tin trong các cơ quan nhà nước, tổ chức chính trị - xã hội (đặc biệt là Điều 27, 28, 29, 30); Nghị định số 85/2016/NĐ-CP về bảo đảm an toàn hệ thống thông tin theo cấp độ; Thông tư số 12/2022/TT-BTTTT của Bộ Thông tin và Truyền thông; Luật An toàn thông tin mạng năm 2015; Luật An ninh mạng năm 2018; Luật Bảo vệ bí mật nhà nước năm 2018.'
    )
  );

  children.push(
    p(
      'Phạm vi ứng dụng của hệ thống bao trùm toàn bộ cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk, bao gồm Lãnh đạo Ban (Trưởng ban và 04 Phó Trưởng ban), 05 phòng chuyên môn trực thuộc và 22 vị trí việc làm (VTVL) định biên; đồng thời đóng vai trò hạt nhân để liên thông kết quả đánh giá công tác cán bộ lên Thường trực Tỉnh ủy, Ban Thường vụ Tỉnh ủy và Ban Tổ chức Trung ương.'
    )
  );

  // ==========================================================================
  // PHẦN II (CÂU 1 ĐỀ BÀI): XÂY DỰNG BỘ TIÊU CHÍ ĐỊNH LƯỢNG ĐÁNH GIÁ (KPI/OKR)
  // ==========================================================================
  children.push(
    h1('PHẦN II. BỘ TIÊU CHÍ ĐỊNH LƯỢNG ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ (KPI/OKR) (TRẢ LỜI CÂU 1 ĐỀ BÀI)')
  );

  children.push(
    h2('1. Khung cơ cấu tổ chức 05 phòng chuyên môn và 22 Vị trí việc làm (VTVL) theo Quy định 01-QĐ/BTCTU')
  );

  children.push(
    p(
      'Căn cứ Quy định số 01-QĐ/BTCTU ngày 28/11/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk, toàn bộ cơ quan được chuẩn hóa thành 05 phòng chuyên môn với 22 Vị trí việc làm (VTVL) định biên. Đây là cơ sở cốt lõi để phân định trách nhiệm, giao chỉ tiêu KPI/OKR và phân quyền xử lý dữ liệu:'
    )
  );

  // Bảng 22 VTVL
  const vtvlHeaders = ['STT', 'Phòng chuyên môn trực thuộc', 'Mã phòng', 'Vị trí việc làm (VTVL) định biên', 'Số lượng', 'Lĩnh vực công tác chủ trì'];
  const vtvlRows = [
    ['1', 'Phòng Tổ chức cán bộ', 'P_TCCB', 'Trưởng phòng\nPhó Trưởng phòng\nChuyên viên QL cán bộ & bổ nhiệm\nChuyên viên QL biên chế & VTVL\nChuyên viên Chính sách cán bộ', '05', 'Tham mưu quy hoạch, điều động, bổ nhiệm, luân chuyển cán bộ; quản lý biên chế, ngạch bậc, đề án VTVL và chế độ chính sách.'],
    ['2', 'Phòng Tổ chức cơ sở đảng và đảng viên', 'P_TCD_DV', 'Trưởng phòng\nPhó Trưởng phòng\nChuyên viên Tổ chức cơ sở đảng\nChuyên viên Quản lý đảng viên & Sổ tay ĐV', '04', 'Nâng cao năng lực lãnh đạo TCCSĐ; phát triển đảng viên; quản lý hồ sơ đảng viên, liên thông CSDL Đảng viên và nền tảng Sổ tay ĐV điện tử.'],
    ['3', 'Phòng Bảo vệ chính trị nội bộ', 'P_BVCTNB', 'Trưởng phòng\nPhó Trưởng phòng\nChuyên viên Thẩm tra xác minh chính trị\nChuyên viên Quản lý hồ sơ CSDL Mức 3', '04', 'Thẩm định tiêu chuẩn chính trị phục vụ công tác cán bộ; xác minh lịch sử chính trị và chính trị hiện nay; quản trị CSDL BVCTNB Mức 3 tuyệt mật.'],
    ['4', 'Phòng Đào tạo và Chính sách cán bộ', 'P_DT_CS', 'Trưởng phòng\nPhó Trưởng phòng\nChuyên viên Đào tạo bồi dưỡng\nChuyên viên Thi đua khen thưởng', '04', 'Lập kế hoạch đào tạo, bồi dưỡng lý luận chính trị và chuyên môn; theo dõi công tác thi đua, khen thưởng và giải quyết khiếu nại, tố cáo về cán bộ.'],
    ['5', 'Văn phòng Ban', 'VAN_PHONG', 'Chánh Văn phòng\nPhó Chánh Văn phòng\nChuyên viên CNTT & An toàn thông tin\nChuyên viên Tổng hợp - Tài chính\nCán bộ Văn thư - Lưu trữ & Cơ yếu', '05', 'Tổng hợp lịch công tác tuần/tháng; quản lý văn bản đi/đến (kể cả văn bản Mật); quản trị hạ tầng số, an toàn thông tin Cấp độ 3; hậu cần công vụ.'],
  ];

  children.push(createTable(vtvlHeaders, vtvlRows, [6, 20, 12, 28, 8, 26]));

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h2('2. Nguyên tắc và phương pháp luận thiết lập KPI/OKR trong cơ quan Đảng'));

  children.push(
    p(
      'Hệ thống kết hợp hài hòa giữa phương pháp OKR (Objectives and Key Results - Định hướng mục tiêu chiến lược và kết quả đột phá) và chỉ số KPI (Key Performance Indicators - Đo lường định lượng kết quả thực thi công việc hằng ngày) dựa trên các nguyên tắc bất biến:'
    )
  );

  children.push(
    bullet(
      '• Nguyên tắc SMART và Lượng hóa tối đa:',
      'Mọi chỉ số đánh giá phải cụ thể (Specific), đo lường được bằng dữ liệu số học (Measurable), khả thi (Achievable), gắn liền với nhiệm vụ chính trị của phòng (Relevant), và có thời hạn xác định (Time-bound). Tuyệt đối không sử dụng các tiêu chí chung chung, trừu tượng.'
    )
  );

  children.push(
    bullet(
      '• Phân loại 3 nhóm nhiệm vụ khoa học:',
      'Nhiệm vụ được phân rã thành: (1) Nhiệm vụ thường xuyên theo kế hoạch công tác định kỳ (tháng, quý, năm); (2) Nhiệm vụ đột xuất, khẩn cấp do Lãnh đạo Ban hoặc Tỉnh ủy giao bổ sung; (3) Nhiệm vụ trọng tâm, tham mưu đề án / chuyên đề lớn theo Nghị quyết 18-NQ/TW.'
    )
  );

  children.push(
    bullet(
      '• Đánh giá đa chiều và Khách quan:',
      'Kết hợp giữa tự chấm điểm của cá nhân, thẩm định của tập thể phòng chuyên môn, kiểm chứng chéo với dữ liệu hệ thống (sổ văn bản, log ký số, thời gian xử lý) và phê duyệt của Lãnh đạo Ban.'
    )
  );

  children.push(h2('3. Cấu trúc Thang điểm 100 Đánh giá Cá nhân hằng tháng, hằng quý, hằng năm'));

  children.push(
    p(
      'Tổng điểm đánh giá chất lượng của từng cán bộ, công chức được tính toán tự động trên thang điểm chuẩn 100.0 điểm theo công thức tổng quát:'
    )
  );

  children.push(
    callout(
      'CÔNG THỨC TÍNH TỔNG ĐIỂM CÁ NHÂN:',
      'S_tổng = S_chung (Tối đa 30.0 điểm) + S_nhiệm_vụ (Tối đa 70.0 điểm)\n\n' +
      'Trong đó: S_chung phản ánh phẩm chất chính trị, đạo đức, kỷ cương hành chính do Lãnh đạo phòng và Ban chấm; S_nhiệm_vụ phản ánh năng suất, chất lượng và tiến độ công việc quy đổi từ chỉ số KPI trung bình trong kỳ.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h3('a. Tiêu chí Chung (S_chung - Tối đa 30.0 điểm)'));
  children.push(
    p(
      'Gồm 3 nhóm chỉ số thành phần tuân thủ nghiêm ngặt Hướng dẫn số 05-HD/TU và Quy định số 39-QĐ/TU của Ban Thường vụ Tỉnh ủy Đắk Lắk:'
    )
  );

  const schungHeaders = ['Nhóm tiêu chí thành phần', 'Nội dung đo lường cụ thể', 'Điểm tối đa', 'Phương thức chấm & Minh chứng kiểm tra'];
  const schungRows = [
    ['1. Tư tưởng chính trị, phẩm chất đạo đức, lối sống, ý thức kỷ luật', 'Lập trường kiên định, chấp hành Cương lĩnh, Điều lệ Đảng; gương mẫu trong đạo đức công vụ; không vi phạm 27 biểu hiện suy thoái theo NQTW 4; chấp hành giờ giấc và kỷ cương hành chính.', '18.0 điểm', 'Trưởng phòng chấm kết hợp đối soát dữ liệu điểm danh, chấm công vân tay/FaceID và biên bản sinh hoạt chi bộ.'],
    ['2. Tinh thần đổi mới sáng tạo, khát vọng cống hiến, dám nghĩ dám làm', 'Có sáng kiến cải tiến lề lối làm việc, số hóa quy trình thẩm định; chủ động nhận việc mới, việc khó, đề xuất phương án xử lý vướng mắc trong công tác nhân sự.', '04.0 điểm', 'Kê khai tại Mẫu 04 kèm hồ sơ đề xuất sáng kiến đã được Lãnh đạo Ban phê duyệt áp dụng.'],
    ['3. Tự phê bình và phê bình, văn hóa công vụ, tự soi tự sửa', 'Thẳng thắn tự phê bình, giữ gìn đoàn kết nội bộ; tinh thần cộng tác phối hợp liên phòng; thái độ chuẩn mực, tận tụy phục vụ các huyện ủy, thị ủy, thành ủy và đảng viên.', '08.0 điểm', 'Họp phòng chuyên môn bỏ phiếu nhận xét tại Mẫu 03; không có phản ánh tiêu cực từ các cơ sở đảng gửi về.'],
  ];

  children.push(createTable(schungHeaders, schungRows, [24, 40, 12, 24]));

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h3('b. Tiêu chí Kết quả Thực hiện Nhiệm vụ (S_nhiệm_vụ - Tối đa 70.0 điểm)'));
  children.push(
    p(
      'Điểm kết quả thực hiện nhiệm vụ được tính tự động từ điểm KPI trung bình gia quyền của toàn bộ các nhiệm vụ được giao hoàn thành trong kỳ đánh giá:'
    )
  );

  children.push(
    callout(
      'QUY ĐỔI ĐIỂM NHIỆM VỤ SANG THANG 70:',
      'S_nhiệm_vụ = (KPI_trung_bình / 100.0) * 70.0\n\n' +
      'Trong đó: KPI_trung_bình là trung bình cộng chỉ số KPI_i của tất cả nhiệm vụ cán bộ đã thực hiện trong kỳ (có tính hệ số độ khó K làm trọng số).'
    )
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h2('4. Công thức toán học tính toán Chỉ số KPI từng công việc (KPI_i)'));

  children.push(
    p(
      'Mỗi nhiệm vụ giao cho cán bộ, chuyên viên khi hoàn thành đều được hệ thống tự động tính toán chỉ số hiệu suất thành phần KPI_i dựa trên 4 thành tố cốt lõi:'
    )
  );

  children.push(
    callout(
      'CÔNG THỨC TOÁN HỌC TÍNH KPI_i CÔNG VIỆC:',
      'KPI_i = (A% * wA) + (B% * wB) + (C% * wC) + (D% * wD)\n\n' +
      'Trong đó:\n' +
      '• A%: Thành tố Khối lượng công việc quy đổi (gắn hệ số độ khó K);\n' +
      '• B%: Thành tố Chất lượng sản phẩm đầu ra (kiểm soát 3 mức lỗi);\n' +
      '• C%: Thành tố Tiến độ thực hiện (cảnh báo trễ hạn và gia hạn 24h);\n' +
      '• D%: Thành tố Mức độ chủ động, trách nhiệm & phối hợp công tác;\n' +
      '• wA, wB, wC, wD: Các trọng số tương ứng thỏa mãn wA + wB + wC + wD = 100%.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(
    bullet(
      '• Phân tích Thành tố A% (Khối lượng quy đổi):',
      'Được xác định theo công thức: A% = (Khối lượng hoàn thành thực tế / Khối lượng định mức giao) * Hệ số độ khó K. Hệ số độ khó K được cấu hình từ 1.0 đến 5.0 (nhiệm vụ đơn giản K=1.0; thẩm định nhân sự phức tạp K=2.0; xây dựng đề án trọng tâm K=3.0 - 5.0). Cho phép tính điểm thưởng tối đa lên đến 120% khi vượt định mức công việc.'
    )
  );

  children.push(
    bullet(
      '• Phân tích Thành tố B% (Chất lượng sản phẩm & Kiểm soát 3 mức lỗi):',
      'Được đo lường bằng cơ chế trừ điểm lỗi nghiêm ngặt: B% = 100% - (Số lỗi nhỏ * 5% + Số lỗi trung bình * 15% + Số lỗi nghiêm trọng * 35%) + Điểm thưởng chất lượng xuất sắc (tối đa +10%). Trong đó: (1) Lỗi nhỏ: sai chính tả, lỗi thể thức văn bản nhẹ; (2) Lỗi trung bình: số liệu thống kê thiếu sót, lập luận chưa chặt chẽ phải trả lại chỉnh sửa; (3) Lỗi nghiêm trọng: sai căn cứ pháp lý, sai tiêu chuẩn chính trị, vi phạm nguyên tắc Đảng.'
    )
  );

  children.push(
    bullet(
      '• Phân tích Thành tố C% (Tiến độ thực hiện & Cơ chế Gia hạn 24h):',
      'Hoàn thành trước hạn >= 20% tổng thời gian: C% = 110% (thưởng 10%); hoàn thành đúng hạn: C% = 100%; trễ hạn: C% = 100% - (% trễ hạn * 2), mức trừ từ 10% đến 50%. ĐẶC BIỆT: Hệ thống thiết lập Cơ chế Xin gia hạn tiến độ thông minh — nếu chuyên viên gửi phiếu đề xuất gia hạn có lý do chính đáng và được Lãnh đạo phòng/Ban phê duyệt trước thời điểm hết hạn ít nhất 24 giờ, hệ thống sẽ bảo lưu 100% điểm tiến độ C% (tính là đúng hạn theo mốc gia hạn mới).'
    )
  );

  children.push(
    bullet(
      '• Phân tích Thành tố D% (Mức độ chủ động & Kỷ luật phối hợp):',
      'Đánh giá tinh thần chủ động báo cáo tiến độ, khả năng xử lý tình huống phát sinh và trách nhiệm phối hợp với các phòng chuyên môn khác. Lãnh đạo phòng chấm từ 80% đến 100% căn cứ trên nhật ký trao đổi công việc.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h2('5. Ma trận Trọng số Động theo 4 Mảng việc Đặc thù (Domain Weight Matrix)'));

  children.push(
    p(
      'Để bảo đảm tính công bằng tuyệt đối giữa các vị trí việc làm có đặc thù chuyên môn khác nhau, hệ thống thiết lập Ma trận trọng số động (Domain-Specific Dynamic Weights), tự động áp dụng ma trận trọng số tương ứng khi tạo nhiệm vụ:'
    )
  );

  const matrixHeaders = ['Mã mảng việc (Domain)', 'Tên mảng việc nghiệp vụ', 'wA (Khối lượng)', 'wB (Chất lượng)', 'wC (Tiến độ)', 'wD (Chủ động)', 'Giải trình căn cứ thiết kế trọng số'];
  const matrixRows = [
    ['DOM_THAM_DINH', 'Thẩm định hồ sơ cán bộ, nhân sự', '20%', '50%', '20%', '10%', 'Công tác cán bộ đòi hỏi chất lượng thẩm định chính xác tuyệt đối, không được có sai sót về tiêu chuẩn, điều kiện (wB chiếm 50%).'],
    ['DOM_VAN_THU', 'Hành chính, Văn thư, Lưu trữ & Cơ yếu', '40%', '30%', '20%', '10%', 'Khối lượng văn bản đi/đến, quản lý tủ tài liệu rất lớn, đòi hỏi xử lý nhanh, liên tục và chính xác (wA chiếm 40%).'],
    ['DOM_IT_ATTT', 'Công nghệ thông tin & ATTT', '25%', '30%', '35%', '10%', 'Nhiệm vụ bảo đảm an ninh mạng, xử lý sự cố kỹ thuật và duy trì uptime hệ thống 99.5% đặt nặng yếu tố tiến độ (wC chiếm 35%).'],
    ['DOM_THAM_MUU', 'Tham mưu Đề án, Chuyên đề, Nghị quyết', '25%', '40%', '25%', '10%', 'Tham mưu chiến lược cho Thường trực, Ban Thường vụ Tỉnh ủy đòi hỏi tư duy sâu sắc, hàm lượng chất xám cao (wB chiếm 40%).'],
  ];

  children.push(createTable(matrixHeaders, matrixRows, [14, 22, 11, 11, 11, 11, 20]));

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h2('6. Bộ Tiêu chí Đánh giá Tập thể 05 Phòng Chuyên môn hằng tháng, quý, năm'));

  children.push(
    p(
      'Điểm đánh giá tập thể phòng chuyên môn không đơn thuần là trung bình số học cá nhân mà phản ánh toàn diện sức mạnh chỉ đạo và kỷ cương thực thi công vụ:'
    )
  );

  children.push(
    callout(
      'CÔNG THỨC TÍNH ĐIỂM TẬP THỂ PHÒNG:',
      'S_tập_thể = (0.5 * S_tiến_độ_nhiệm_vụ_chung) + (0.3 * S_trung_bình_cá_nhân) + (0.2 * S_kỷ_cương_đoàn_kết)\n\n' +
      'Trong đó:\n' +
      '• S_tiến_độ_nhiệm_vụ_chung (50%): Tỷ lệ hoàn thành 100% các nhiệm vụ chính trị do Thường trực Tỉnh ủy và Lãnh đạo Ban giao cho phòng;\n' +
      '• S_trung_bình_cá_nhân (30%): Điểm trung bình cộng kết quả KPI của tất cả cán bộ, chuyên viên thuộc phòng;\n' +
      '• S_kỷ_cương_đoàn_kết (20%): Ý thức chấp hành kỷ luật, bảo vệ bí mật nhà nước, không có đơn thư khiếu nại, tố cáo nội bộ.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h2('7. Quy tắc Khống chế Chất lượng & Phân loại Xếp loại 4 Mức theo Hướng dẫn 05-HD/TU'));

  children.push(
    p(
      'Căn cứ điểm tổng kết quả S_tổng, hệ thống tự động phân loại cán bộ thành 4 mức chất lượng theo quy định của Ban Thường vụ Tỉnh ủy Đắk Lắk:'
    )
  );

  const rankHeaders = ['Mức xếp loại chất lượng', 'Khung điểm chuẩn', 'Điều kiện bổ sung bắt buộc', 'Quy tắc khống chế tỷ lệ & Ràng buộc trần'];
  const rankRows = [
    ['1. Hoàn thành xuất sắc nhiệm vụ', 'S_tổng >= 90.0 điểm', 'Phải có Bảng kê khai nhiệm vụ nổi trội, vượt mức (Mẫu 04) hợp lệ được Hội đồng Ban công nhận.', 'ÁP TRẦN KHỐNG CHẾ 20%: Số lượng cán bộ đạt mức Xuất sắc của mỗi phòng và toàn cơ quan không vượt quá 20% tổng số cán bộ đạt mức Hoàn thành tốt trở lên.'],
    ['2. Hoàn thành tốt nhiệm vụ', '70.0 <= S_tổng < 90.0', 'Hoàn thành 100% nhiệm vụ được giao, không có nhiệm vụ bị chậm muộn quá 03 ngày không có lý do.', 'Không khống chế tỷ lệ tối đa.'],
    ['3. Hoàn thành nhiệm vụ', '50.0 <= S_tổng < 70.0', 'Tỷ lệ hoàn thành nhiệm vụ từ 70% đến dưới 100%, hoặc có nhiệm vụ chậm muộn bị nhắc nhở.', 'Áp dụng cho cán bộ có năng suất trung bình.'],
    ['4. Không hoàn thành nhiệm vụ', 'S_tổng < 50.0 điểm', 'Hoặc rơi vào một trong các trường hợp bắt buộc hạ bậc vi phạm kỷ luật.', 'HẠ BẬC BẮT BUỘC: Cán bộ bị kỷ luật Đảng/hành chính, hoàn thành dưới 70% chỉ tiêu, hoặc để xảy ra lộ lọt bí mật nhà nước.'],
  ];

  children.push(createTable(rankHeaders, rankRows, [22, 18, 28, 32]));

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(
    bullet(
      '• Nguyên tắc Ràng buộc Người đứng đầu:',
      'Mức xếp loại chất lượng của Trưởng phòng chuyên môn không được cao hơn mức xếp loại chất lượng của tập thể phòng do mình phụ trách (Rank_Trưởng_phòng <= Rank_Tập_thể_phòng). Nếu phòng chỉ đạt "Hoàn thành tốt" thì Trưởng phòng tối đa chỉ đạt "Hoàn thành tốt".'
    )
  );

  // ==========================================================================
  // PHẦN III (CÂU 2 ĐỀ BÀI): PHÂN TÍCH THIẾT KẾ HỆ THỐNG & CÁC ĐIỂM ĐỘT PHÁ
  // ==========================================================================
  children.push(
    h1('PHẦN III. PHÂN TÍCH THIẾT KẾ HỆ THỐNG PHẦN MỀM & CÁC ĐIỂM ĐỘT PHÁ (TRẢ LỜI CÂU 2 ĐỀ BÀI)')
  );

  children.push(h2('1. Ma trận Rà soát & Kiểm toán 9 Nhóm Chức năng Tối thiểu theo Đề bài'));

  children.push(
    p(
      'Bảng đối chiếu, kiểm toán mã nguồn thực tế chứng minh hệ thống đã được phân tích, thiết kế và lập trình đáp ứng trọn vẹn 100% các nhóm chức năng tối thiểu theo yêu cầu đề bài:'
    )
  );

  const matrix9Headers = ['STT', 'Nhóm chức năng tối thiểu theo đề bài', 'Service chủ quản (Source of Truth)', 'Bảng CSDL / Proto / Endpoint thực tế', 'Trạng thái', 'Đánh giá & Bằng chứng kiểm toán mã nguồn'];
  const matrix9Rows = [
    ['1', 'Quản lý cán bộ, công chức, phòng chuyên môn và VTVL', 'user-service (admin_systems) &\nhrm-service (admin_hrm)', 'user-service: Organization, JobTitle, StaffingSlot, StaffingSlotDomain\nhrm-service: Employee, JobPosition\nProto: users.proto, employee.proto', '100% Hoàn thành', 'Chuẩn hóa toàn bộ VTVL định biên, phòng ban tại user-service. hrm-service đồng bộ số hiệu công chức, lưu hồ sơ 2C. UI tại EmployeeListClient.tsx.'],
    ['2', 'Quản lý nhiệm vụ và bộ tiêu chí KPI/OKR', 'hrm-service (admin_hrm) &\nworkflow-service (admin_workflow)', 'hrm-service: Task, TaskCategory, TaskTemplate, KpiCriterion, KpiRuleSet\nProto: task.proto, kpi.proto\nEndpoints: POST /tasks, POST /kpi/criteria', '100% Hoàn thành', 'Hỗ trợ lập kế hoạch công việc (thường xuyên, đột xuất, đề án NQ 18). Cấu hình 6 trục KPI, ma trận trọng số động theo 4 mảng việc DOM_THAM_DINH, DOM_VAN_THU...'],
    ['3', 'Cập nhật, theo dõi kết quả thực hiện nhiệm vụ', 'hrm-service (admin_hrm) &\nmedia-service (admin_media)', 'hrm-service: TaskProgress, TaskItem, TaskAttachment, TaskComment\nUI: task-detail-drawer.tsx, task-detail-processing-tab.tsx, task-extend-dialog.tsx', '100% Hoàn thành', 'Cán bộ cập nhật % tiến độ nhiều lần, upload minh chứng lên MinIO. Luồng xin gia hạn giải quyết việc được duyệt trước 24h bảo lưu 100% điểm tiến độ.'],
    ['4', 'Tự động tính điểm, xếp loại theo tháng, quý, năm', 'hrm-service (admin_hrm) &\nworkflow-service', 'hrm-service: KpiCalculatorEngine (kpi-calculator.engine.ts), KpiEvaluation, RankQuotaRule\nMethod: rpc CalculatePersonalKpi', '100% Hoàn thành', 'Tự động hóa 100% công thức S_tổng = S_chung (30đ) + S_nhiệm_vụ (70đ). Áp dụng RankQuotaRule khống chế trần xuất sắc <= 20% và trần người đứng đầu.'],
    ['5', 'Tổng hợp kết quả cá nhân và tập thể', 'hrm-service (admin_hrm) &\nreport-service (admin_report)', 'hrm-service: KpiEvaluationAggregate, task-kpi.service.ts\nMethod: rpc GetEvaluationStats\nUI: task-dashboard.tsx, Leaderboard', '100% Hoàn thành', 'Tự động gom nhóm điểm theo phòng ban (Group By / Average Score), tính điểm trung bình tập thể phòng, so sánh biểu đồ phân bổ hiệu suất cá nhân và đơn vị.'],
    ['6', 'Phân quyền người sử dụng và phê duyệt kết quả', 'user-service (PBAC) &\nworkflow-service (BPMN)', 'user-service: PbacPolicy, Role, UserRole\nworkflow-service: WF_BTCTU_DANH_GIA_KPI (State Machine 4 bước: DRAFT -> SUBMITTED -> REVIEWED -> APPROVED)', '100% Hoàn thành', 'Phân quyền PBAC kiểm soát chặt chẽ theo organizationId. Chuyên viên tự chấm, Trưởng phòng thẩm định cấp phòng, Lãnh đạo Ban ký duyệt chốt điểm.'],
    ['7', 'Lưu lịch sử chỉnh sửa, cập nhật dữ liệu (Audit Trail)', 'hrm-service (admin_hrm)', 'hrm-service: TaskHistory, KpiEvaluationHistory, task-history.service.ts\nUI: task-detail-history-tab.tsx\nAudit: actorId, oldValue, newValue, action, timestamp', '100% Hoàn thành', 'Ghi vết kiểm toán bất biến chống chối bỏ cho mọi thao tác cập nhật tiến độ, giao lại việc, gia hạn, thay đổi điểm số chấm của lãnh đạo phòng và ban.'],
    ['8', 'Tra cứu, thống kê, báo cáo và xuất kết quả', 'report-service (admin_report) &\nhrm-service', 'report-service: ReportDefinition, ReportRun, DatasetSnapshot\nhrm-service: rpc FindEvaluations\nExport: Excel/PDF Export Engine (kpiXmlToDocx.ts)', '100% Hoàn thành', 'Tra cứu đa chiều theo phòng ban, quý, năm, ngạch công chức. Kết xuất tự động bảng tổng hợp điểm, phiếu đánh giá cá nhân ra file Excel/PDF chuẩn thể thức.'],
    ['9', 'Dashboard tự động tổng hợp, dự thảo báo cáo/quyết định theo mẫu', 'report-service &\ndocument-service &\nadmin_khcn', 'report-service: ReportTemplate, ReportWidget\ndocument-service: DocumentTemplate, Dossier\nUI: SourceExplorer.tsx, task-dashboard.tsx, phôi Mẫu 05 XML', '100% Hoàn thành', 'Dashboard trực quan hóa số liệu toàn cơ quan (biểu đồ cột, tròn, radar 6 trục); tự động điền dữ liệu KPI vào phôi Mẫu 05 xuất Dự thảo Quyết định xếp loại trình Lãnh đạo ký.'],
  ];

  children.push(createTable(matrix9Headers, matrix9Rows, [5, 20, 16, 25, 10, 24]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // ==========================================================================
  // ĐIỂM ĐỘT PHÁ 1: ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)
  // ==========================================================================
  children.push(h2('2. ĐIỂM ĐỘT PHÁ SỐ 1: ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI) HỖ TRỢ TOÀN TRÌNH'));

  children.push(
    p(
      'Hệ thống tích hợp sâu các mô hình Trí tuệ Nhân tạo thế hệ mới (AI - LLM/NLP/Vision) nhằm giải phóng sức lao động thủ công của cán bộ công chức, nâng cao năng suất và đảm bảo tính khách quan tuyệt đối trong công tác quản lý:'
    )
  );

  children.push(
    bullet(
      '• AI Hỗ trợ Khai báo Công việc Tự động (Smart Work Declaration & OCR/Parser):',
      'Tích hợp Module AI Document Parser sử dụng mô hình thị giác máy tính và xử lý ngôn ngữ tự nhiên (NLP). Khi cán bộ văn thư hoặc chuyên viên nhận văn bản chỉ đạo (file PDF scan, công văn Word, ảnh chụp văn bản đến của Tỉnh ủy / UBND tỉnh), AI tự động đọc hiểu, bóc tách cấu trúc văn bản: Trích xuất tiêu đề nhiệm vụ, số hiệu văn bản, cơ quan ban hành, căn cứ pháp lý, đơn vị chủ trì, phòng phối hợp, tóm tắt nội dung yêu cầu, thời hạn hoàn thành (Deadline) và nhận diện cấp độ mật. Dữ liệu được tự động điền trước (Pre-fill) vào form tạo nhiệm vụ, giúp giảm 90% thời gian nhập liệu thủ công.'
    )
  );

  children.push(
    bullet(
      '• AI Tạo nhanh Công việc Lịch & Điều phối Lịch trình Thông minh (Smart Calendar & Scheduling Engine):',
      'Hệ thống trang bị công cụ AI Calendar Assistant tự động đọc và phân tích Lịch công tác tuần của Thường trực Tỉnh ủy, Ban Thường vụ Tỉnh ủy và Lãnh đạo Ban Tổ chức Tỉnh ủy. Từ các cuộc họp, hội nghị và lịch đi cơ sở, AI tự động "phân rã" thành các đầu việc cụ thể cần chuẩn bị (Ví dụ: Chuẩn bị tài liệu thẩm định cán bộ, dự thảo bài phát biểu, chuẩn bị hậu cần xe cộ). Đồng thời, AI tự động đối chiếu với danh mục Vị trí việc làm (VTVL) và phân công lĩnh vực, địa bàn theo dõi của từng chuyên viên trong user-service để gợi ý cán bộ chủ trì phù hợp nhất, tự động gán deadline trước cuộc họp 24h và kiểm tra cảnh báo xung đột lịch làm việc (Conflict Detection).'
    )
  );

  children.push(
    bullet(
      '• AI Giám sát Chi tiết Công việc Thời gian thực & Dự báo Nguy cơ Trễ hạn (Predictive Bottleneck AI):',
      'Thay vì chờ đến cuối tháng mới rà soát, động cơ AI Realtime Monitor liên tục quét tiến độ thực thi của tất cả các nhiệm vụ. Dựa trên dữ liệu lịch sử về tốc độ xử lý của từng mảng việc, độ phức tạp K và nhật ký cập nhật tiến độ %, AI tính toán chỉ số rủi ro trễ hạn (Deadline Risk Score). Khi phát hiện một nhiệm vụ có nguy cơ không hoàn thành đúng hạn (ví dụ: nhiệm vụ độ khó cao nhưng sau 50% thời gian chưa cập nhật bản thảo), AI tự động phát tín hiệu cảnh báo sớm trước 48h - 72h cho Lãnh đạo phòng và chuyên viên chủ trì, chỉ rõ điểm nghẽn để kịp thời đôn đốc hoặc phân công người hỗ trợ.'
    )
  );

  children.push(
    bullet(
      '• AI Thẩm định Chất lượng Văn bản & Chấm điểm Khách quan:',
      'Trước khi sản phẩm hoàn thành được trình lên Lãnh đạo phòng duyệt, AI tự động kiểm tra đối chiếu văn bản: Soát lỗi thể thức văn bản hành chính theo quy định của Đảng (phông chữ, cỡ chữ, căn lề, nơi nhận, chức danh người ký), kiểm tra chính tả, phát hiện mâu thuẫn số liệu thống kê giữa phần lời văn và các bảng biểu đính kèm. AI tự động lập Báo cáo sơ bộ về chất lượng sản phẩm (gợi ý phân loại mức lỗi nhỏ/trung bình) và đề xuất điểm số thành tố B% sơ bộ, giúp Lãnh đạo phòng giảm 80% thời gian thẩm định, loại bỏ hoàn toàn việc đánh giá cảm tính, nể nang, thiên vị.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // ==========================================================================
  // ĐIỂM ĐỘT PHÁ 2: LIÊN THÔNG HỆ THỐNG QUỐC GIA REALTIME
  // ==========================================================================
  children.push(h2('3. ĐIỂM ĐỘT PHÁ SỐ 2: LIÊN THÔNG HỆ THỐNG QUỐC GIA LẤY DATA XỬ LÝ VIỆC REALTIME'));

  children.push(
    p(
      'Hệ thống được thiết kế mở, sở hữu phân tầng Integration Hub chuyên trách tại API Gateway, kết nối trực tiếp với Trục liên thông chia sẻ dữ liệu quốc gia (NDXP) và Trục liên thông của tỉnh (LGSP Đắk Lắk), hiện thực hóa việc đồng bộ và khai thác dữ liệu số theo thời gian thực (Real-time Data Streaming):'
    )
  );

  children.push(
    bullet(
      '• Liên thông CSDL Quốc gia về Cán bộ, Công chức, Viên chức (Bộ Nội vụ):',
      'Đồng bộ 100% dữ liệu hồ sơ lý lịch điện tử (theo mẫu 2C-BNV/2008 và chuẩn dữ liệu QCVN 109:2017/BTTTT). Mọi thông tin về quá trình công tác, bổ nhiệm, luân chuyển, ngạch bậc lương, văn bằng chứng chỉ, khen thưởng và kỷ luật của cán bộ được cập nhật tức thời theo thời gian thực hai chiều giữa user-service, hrm-service và CSDL Quốc gia, loại bỏ hoàn toàn việc nhập liệu trùng lặp.'
    )
  );

  children.push(
    bullet(
      '• Liên thông Trục Liên thông Văn bản Quốc gia (VXP) & Trục Văn bản Tỉnh ủy:',
      'Hệ thống lắng nghe sự kiện văn bản đến từ Trục văn bản qua giao thức Webhook bảo mật. Ngay khi có chỉ đạo, nghị quyết, thông báo từ Trung ương hoặc Tỉnh ủy chuyển đến, hệ thống tự động sinh nhiệm vụ tương ứng, trích xuất mã định danh văn bản điện tử (Edoc Code) và đính kèm file gốc. Khi chuyên viên hoàn thành báo cáo và được Lãnh đạo Ban ký số, kết quả xử lý và trạng thái hoàn thành được tự động phản hồi ngược về Trục văn bản theo thời gian thực.'
    )
  );

  children.push(
    bullet(
      '• Liên thông Nền tảng Sổ tay Đảng viên Điện tử & CSDL Quản lý Đảng viên (Ban Tổ chức Trung ương):',
      'Kết nối trực tiếp phục vụ Phòng Tổ chức cơ sở đảng & đảng viên: Tự động đối soát số lượng đảng viên mới kết nạp, dữ liệu chuyển sinh hoạt đảng đi/đến, kết quả đánh giá xếp loại chi bộ và đảng viên hằng năm; hỗ trợ công tác thẩm định hồ sơ kết nạp đảng viên và quy hoạch cấp ủy theo thời gian thực.'
    )
  );

  children.push(
    bullet(
      '• Liên thông Hệ thống Thông tin Giải quyết TTHC Tỉnh Đắk Lắk (Cổng DVC):',
      'Khai thác dữ liệu xử lý hồ sơ thủ tục hành chính công và các thủ tục nội bộ ngành Tổ chức xây dựng Đảng. Hệ thống đo lường thời gian thụ lý, thời gian giải quyết thực tế của từng hồ sơ TTHC để tự động tính điểm KPI tiến độ (thành tố C%) cho cán bộ thụ lý, đảm bảo dữ liệu minh bạch, khách quan tuyệt đối, không một ai có thể tự sửa đổi điểm tiến độ.'
    )
  );

  children.push(
    bullet(
      '• Cơ chế Công nghệ Realtime Đột phá:',
      'Sử dụng kiến trúc hướng sự kiện (Event-Driven Architecture) với RabbitMQ Message Broker; kết hợp công nghệ Change Data Capture (CDC) và WebSocket Server hai chiều. Khi có bất kỳ cập nhật nào từ các hệ sinh thái quốc gia, dữ liệu được đồng bộ về các microservice trong vòng < 500ms và đẩy thông báo tức thời (Push Notification) lên màn hình của cán bộ chỉ trong < 1 giây.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // ==========================================================================
  // HỆ THỐNG CÁC SƠ ĐỒ LUỒNG & PHÂN TÍCH THIẾT KẾ
  // ==========================================================================
  children.push(h2('4. Hệ thống các Sơ đồ Luồng và Sơ đồ Phân tích Thiết kế Hệ thống'));

  children.push(
    p(
      'Nhằm bảo đảm tính minh bạch, khoa học và khả thi trong triển khai kỹ thuật, hệ thống cung cấp đầy đủ các sơ đồ luồng nghiệp vụ và phân tích thiết kế kiến trúc chuẩn hóa:'
    )
  );

  // SƠ ĐỒ 1: KIẾN TRÚC TỔNG THỂ
  children.push(h3('a. Sơ đồ 1: Kiến trúc Microservices và Luồng Dữ liệu Tổng thể'));
  children.push(
    p(
      'Hệ thống được thiết kế theo chuẩn Cloud-Native Microservices với 4 phân tầng độc lập: (1) Lớp Giao diện Frontend Client (admin_khcn Next.js 15 và portal-goverment); (2) Cửa ngõ Bảo mật API Gateway & Integration Hub; (3) Lớp Dịch vụ nghiệp vụ Core & Domain Microservices (user-service, workflow-service, hrm-service, report-service, document-service, media-service); (4) Hệ thống truyền thông đồng bộ gRPC binary và bất đồng bộ RabbitMQ Event Bus:'
    )
  );

  const archImgPath = path.resolve('docs/extracted_media/6a797e6b230933b33d4d341c35f6e0386ed548d1.png');
  children.push(...createImageParagraph(archImgPath, 'Hình 1: Sơ đồ Kiến trúc Microservices & Luồng Dữ liệu Nền tảng Đắk Lắk Government Platform', 620, 496));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 2: LUỒNG NGHIỆP VỤ PHÂN LÀN (SWIMLANE)
  children.push(h3('b. Sơ đồ 2: Sơ đồ Phân làn Nghiệp vụ Tổng thể (Business Swimlane Workflow)'));
  children.push(
    p(
      'Sơ đồ phân làn (Swimlane) thể hiện chu trình khép kín giữa 4 cấp thẩm quyền: Ban Thường vụ Tỉnh ủy, Lãnh đạo Ban Tổ chức Tỉnh ủy, Lãnh đạo Phòng chuyên môn và Chuyên viên thực thi 22 VTVL:'
    )
  );

  const swimlaneText =
    '[BAN THƯỜNG VỤ TỈNH ỦY] ──> Giao nhiệm vụ, phê duyệt chương trình công tác (Đề án, Quy hoạch)\n' +
    '          │\n' +
    '          ▼\n' +
    '[LÃNH ĐẠO BAN (Trưởng ban & 4 Phó ban)] ──> Tiếp nhận chỉ đạo, phân loại mảng việc, giao Phòng chủ trì\n' +
    '          │\n' +
    '          ▼\n' +
    '[LÃNH ĐẠO PHÒNG (05 Phòng chuyên môn)] ──> Phân rã việc, gán hệ số K, trọng số wA/wB/wC/wD, giao Chuyên viên\n' +
    '          │\n' +
    '          ▼\n' +
    '[CHUYÊN VIÊN 22 VTVL] ──> Bấm "Bắt đầu làm" ──> Thực thi nghiệp vụ ──> Xin gia hạn 24h (nếu cần) ──> Nộp sản phẩm kèm minh chứng\n' +
    '          │\n' +
    '          ▼\n' +
    '[LÃNH ĐẠO PHÒNG THẨM ĐỊNH] ──> Kiểm soát 3 mức lỗi: Nếu có sai sót -> Trả lại sửa (trừ điểm B%); Đạt chuẩn -> Ký nháy trình Lãnh đạo Ban\n' +
    '          │\n' +
    '          ▼\n' +
    '[LÃNH ĐẠO BAN DUYỆT] ──> Ký số phát hành văn bản / Báo cáo Thường trực Tỉnh ủy\n' +
    '          │\n' +
    '          ▼\n' +
    '[HỘI ĐỒNG BAN THẨM ĐỊNH KPI] ──> Tự chấm (Mẫu 02) ──> Tập thể họp (Mẫu 03) ──> Áp trần 20% Xuất sắc ──> Ký Quyết định xếp loại (Mẫu 05)';

  children.push(callout('SƠ ĐỒ PHÂN LÀN NGHIỆP VỤ (SWIMLANE WORKFLOW):', swimlaneText));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 3: TUẦN TỰ KỸ THUẬT HỆ THỐNG
  children.push(h3('c. Sơ đồ 3: Sơ đồ Tuần tự Kỹ thuật Hệ thống (Technical Sequence Diagram)'));
  children.push(
    p(
      'Mô tả chi tiết luồng tương tác thời gian thực giữa Web Frontend (Next.js), API Gateway, HRM Service (Domain Task & KPI), Workflow Service (State Machine Engine), MinIO Storage và RabbitMQ Broker qua 3 giai đoạn:'
    )
  );

  const seqImgPath = path.resolve('docs/extracted_media/0b81781752032b8a43e31eecfbc7144bac77c03b.png');
  children.push(...createImageParagraph(seqImgPath, 'Hình 2: Sơ đồ Tuần tự Kỹ thuật Quy trình Thực hiện Nhiệm vụ, Đánh giá KPI & Sinh Quyết định', 620, 496));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 4: MÁY TRẠNG THÁI VÒNG ĐỜI CÔNG VIỆC
  children.push(h3('d. Sơ đồ 4: Máy trạng thái Vòng đời Công việc (Task State Machine Lifecycle)'));
  children.push(
    p(
      'Mỗi công việc trong hệ thống được quản trị vòng đời nghiêm ngặt bởi workflow-service thông qua máy trạng thái 9 bước, có điều kiện chặn (Guard Conditions) và Audit Trail bất biến:'
    )
  );

  const stateHeaders = ['Trạng thái nhiệm vụ (State)', 'Mô tả ý nghĩa trạng thái', 'Sự kiện kích hoạt (Event)', 'Hành động được phép (Allowed Actions)', 'Điều kiện chuyển đổi (Guard Conditions)'];
  const stateRows = [
    ['TEMPLATE', 'Lập kế hoạch khung đầu kỳ (Mẫu 01)', 'Khởi tạo từ kế hoạch công tác', 'Chỉnh sửa, Phân công sơ bộ', 'Cán bộ thuộc 22 VTVL của phòng.'],
    ['TODO', 'Chờ thực hiện (Lãnh đạo giao việc)', 'Lãnh đạo Ban/Phòng giao việc', 'START (Bắt đầu), REASSIGN (Giao lại)', 'Có người chủ trì, thời hạn và hệ số K.'],
    ['IN_PROGRESS', 'Đang thực hiện', 'Chuyên viên bấm "Bắt đầu làm"', 'UPDATE_PROGRESS, EXTEND_REQUEST, SUBMIT', 'Ghi nhận timestamp bắt đầu làm thực tế.'],
    ['REVIEWING', 'Chờ thẩm định sản phẩm', 'Chuyên viên nộp sản phẩm minh chứng', 'APPROVE (Duyệt), RETURN (Trả lại)', 'Bắt buộc đính kèm file minh chứng kết quả.'],
    ['RETURNED', 'Trả lại yêu cầu chỉnh sửa', 'Lãnh đạo phát hiện lỗi sản phẩm', 'RESUBMIT (Nộp lại sau sửa)', 'Phải chọn mức độ lỗi (Nhỏ/Trung bình/Nặng) và ghi rõ lý do.'],
    ['PENDING_APPROVAL', 'Trình Lãnh đạo Ban phê duyệt', 'Trưởng phòng duyệt đạt chất lượng', 'BAN_APPROVE, BAN_REJECT', 'Đã có chữ ký nháy điện tử của Trưởng phòng.'],
    ['DONE', 'Hoàn thành công việc', 'Lãnh đạo Ban ký duyệt hoàn thành', 'Tự động tính KPI_i công việc', 'Ghi nhận completedAt, tính thưởng/phạt tiến độ.'],
    ['EVALUATED', 'Đã chốt điểm đánh giá kỳ', 'Hội đồng Ban phê duyệt Quyết định', 'Tra cứu, Xuất báo cáo, Lưu trữ', 'Trạng thái khóa dữ liệu bất biến (Immutable).'],
    ['CANCELLED', 'Hủy nhiệm vụ', 'Chỉ đạo dừng thực hiện từ BTVTU', 'Lưu vết hủy bỏ trong Audit Trail', 'Bắt buộc nhập văn bản/lý do chỉ đạo hủy việc.'],
  ];

  children.push(createTable(stateHeaders, stateRows, [16, 22, 20, 22, 20]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 5: LUỒNG ĐÁNH GIÁ KPI & THUẬT TOÁN ÁP TRẦN
  children.push(h3('e. Sơ đồ 5: Luồng Đánh giá KPI & Thuật toán Khống chế Trần Chất lượng'));
  children.push(
    p(
      'Quy trình đánh giá, phân loại cán bộ hằng tháng/quý/năm tuân thủ chu trình 4 giai đoạn khép kín theo Hướng dẫn 05-HD/TU và thuật toán tự động RankQuotaRule:'
    )
  );

  const kpiFlowText =
    'GIAI ĐOẠN 1: TỰ ĐÁNH GIÁ (Trước ngày 15 tháng cuối kỳ)\n' +
    '• Chuyên viên tổng hợp danh mục công việc đã hoàn thành trong kỳ (DONE).\n' +
    '• Lập Bản tự đánh giá chấm điểm (MẪU 02): Điểm phẩm chất chung S_chung + Điểm nhiệm vụ S_nhiệm_vụ.\n' +
    '• Lập Bảng kê khai nhiệm vụ nổi trội, vượt mức (MẪU 04) - Điều kiện bắt buộc để xét danh hiệu Xuất sắc.\n\n' +
    'GIAI ĐOẠN 2: TẬP THỂ PHÒNG THẨM ĐỊNH (Từ ngày 15 đến 20)\n' +
    '• Họp toàn thể Chi bộ / Phòng chuyên môn góp ý.\n' +
    '• Trưởng phòng thẩm định điểm từng chuyên viên, điều chỉnh điểm chất lượng B% nếu có lỗi.\n' +
    '• Tổng hợp Bảng nhận xét đánh giá tập thể phòng (MẪU 03) và đề xuất danh sách xếp loại của phòng.\n\n' +
    'GIAI ĐOẠN 3: HỘI ĐỒNG BAN THẨM ĐỊNH & ÁP TRẦN KHỐNG CHẾ (Từ ngày 21 đến 25)\n' +
    '• Hội đồng thẩm định Ban Tổ chức Tỉnh ủy họp xét duyệt toàn cơ quan.\n' +
    '• Kiểm tra điều kiện bắt buộc hạ bậc: Kỷ luật Đảng/chính quyền? Tỷ lệ hoàn thành < 70%? Lọt lộ bí mật?\n' +
    '  -> Nếu có: Tự động hạ bậc xuống "KHÔNG HOÀN THÀNH NHIỆM VỤ".\n' +
    '• Chạy thuật toán RankQuotaRule áp trần 20% Xuất sắc:\n' +
    '  Số_lượng_Xuất_sắc <= INT(20% * Tổng_số_cán_bộ_đạt_mức_Tốt_trở_lên).\n' +
    '• Áp trần Người đứng đầu: Rank_Trưởng_phòng <= Rank_Tập_thể_phòng.\n\n' +
    'GIAI ĐOẠN 4: BAN HÀNH QUYẾT ĐỊNH & CÔNG KHAI (Trước ngày 28)\n' +
    '• Document Service tự động điền dữ liệu KPI vào phôi Mẫu 05 sinh Dự thảo Quyết định xếp loại.\n' +
    '• Trưởng ban Ký số chuyên dùng công vụ phát hành Quyết định chính thức và công khai trên Dashboard.';

  children.push(callout('QUY TRÌNH 4 GIAI ĐOẠN ĐÁNH GIÁ & ÁP TRẦN CHẤT LƯỢNG:', kpiFlowText));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 6: KIẾN TRÚC TRỤC LIÊN THÔNG DỮ LIỆU QUỐC GIA
  children.push(h3('f. Sơ đồ 6: Kiến trúc Trục Liên thông Dữ liệu Quốc gia & Xử lý Realtime'));
  children.push(
    p(
      'Mô hình kết nối đa tầng giữa hệ sinh thái phần mềm nội bộ Ban Tổ chức Tỉnh ủy với các trục liên thông số của tỉnh và quốc gia qua API Gateway Integration Hub:'
    )
  );

  const integrationText =
    '┌────────────────────────────────────────────────────────────────────────────────────────┐\n' +
    '│                 CÁC HỆ THỐNG DỮ LIỆU NỀN TẢNG QUỐC GIA & TỈNH ĐẮK LẮK                  │\n' +
    '├─────────────────────┬─────────────────────┬──────────────────────┬─────────────────────┤\n' +
    '│ CSDL QG Cán bộ CCVC │  Trục Văn bản VXP   │ Sổ tay ĐV & CSDL ĐV  │ Cổng DVC Tỉnh ĐắkLắk│\n' +
    '│ (Bộ Nội vụ) - 2C    │ (Quốc gia & Tỉnh ủy)│ (Ban Tổ chức TW)     │ (Đo lường tiến độ)  │\n' +
    '└──────────┬──────────┴──────────┬──────────┴───────────┬──────────┴──────────┬──────────┘\n' +
    '           │                     │                      │                     │\n' +
    '           ▼                     ▼                      ▼                     ▼\n' +
    '┌────────────────────────────────────────────────────────────────────────────────────────┐\n' +
    '│      TRỤC CHIA SẺ DỮ LIỆU QUỐC GIA (NDXP) & TRỤC LGSP TỈNH ĐẮK LẮK (ESB / REST/SOAP)   │\n' +
    '└───────────────────────────────────────────┬────────────────────────────────────────────┘\n' +
    '                                            │ (TLS 1.3 / mTLS / VPN)\n' +
    '                                            ▼\n' +
    '┌────────────────────────────────────────────────────────────────────────────────────────┐\n' +
    '│        INTEGRATION HUB - API GATEWAY (NestJS Reverse Proxy & Rate Limiter)             │\n' +
    '│ • API Management & OAuth2/JWT Authentication • Data Transformation Engine              │\n' +
    '│ • Circuit Breaker & Retry Policy             • Webhook Receiver & Signature Validator  │\n' +
    '└──────────────┬───────────────────────────────────────────────────────────┬─────────────┘\n' +
    '               │ (gRPC Binary < 5ms)                                       │ (AMQP Events)\n' +
    '               ▼                                                           ▼\n' +
    '┌───────────────────────────────────────────┐             ┌──────────────────────────────┐\n' +
    '│ CORE & DOMAIN MICROSERVICES               │             │ RABBITMQ ASYNC EVENT BUS     │\n' +
    '│ • user-service: Đồng bộ VTVL & Hồ sơ 2C   │             │ • task.synced.event          │\n' +
    '│ • hrm-service: Tính điểm KPI realtime     │             │ • kpi.evaluated.event        │\n' +
    '│ • document-service: Bắt văn bản chỉ đạo   │             │ • cdc.database.stream        │\n' +
    '└─────────────────────┬─────────────────────┘             └──────────────┬───────────────┘\n' +
    '                      │                                                  │\n' +
    '                      ▼                                                  ▼\n' +
    '┌────────────────────────────────────────────────────────────────────────────────────────┐\n' +
    '│     WEBSOCKET REALTIME SERVER ──> PUSH NOTIFICATION & REALTIME SCORECARD TO UI (< 1s)  │\n' +
    '└────────────────────────────────────────────────────────────────────────────────────────┘';

  children.push(callout('SƠ ĐỒ TRỤC LIÊN THÔNG DỮ LIỆU QUỐC GIA & ĐỒNG BỘ REALTIME:', integrationText));

  // ==========================================================================
  // PHẦN IV (CÂU 3 ĐỀ BÀI): CẤP ĐỘ AN TOÀN THÔNG TIN & GIẢI PHÁP THEO NĐ 331/2026
  // ==========================================================================
  children.push(
    h1('PHẦN IV. XÁC ĐỊNH CẤP ĐỘ AN TOÀN THÔNG TIN & ĐỀ XUẤT CÁC GIẢI PHÁP BẢO ĐẢM THEO NGHỊ ĐỊNH 331/2026/NĐ-CP (TRẢ LỜI CÂU 3 ĐỀ BÀI)')
  );

  children.push(h2('1. Xác định Cấp độ An toàn Thông tin của Hệ thống Phần mềm'));

  children.push(
    p(
      'Căn cứ các quy định pháp lý hiện hành của Nhà nước và tính chất đặc thù của cơ quan Ban Tổ chức Tỉnh ủy Đắk Lắk, việc xác định cấp độ an toàn hệ thống thông tin được phân tích và khẳng định như sau:'
    )
  );

  children.push(
    callout(
      'KẾT LUẬN XÁC ĐỊNH CẤP ĐỘ AN TOÀN THÔNG TIN:',
      'Hệ thống phần mềm Quản lý, đánh giá kết quả thực hiện nhiệm vụ bằng KPI/OKR của Ban Tổ chức Tỉnh ủy Đắk Lắk được xác định thuộc CẤP ĐỘ 3 (Hệ thống thông tin Cấp độ 3) theo quy định tại Nghị định số 85/2016/NĐ-CP, Nghị định số 331/2026/NĐ-CP và Thông tư số 12/2022/TT-BTTTT.\n\n' +
      '(Trong trường hợp xét theo phạm vi quy mô hẹp thuần túy nội bộ cấp tỉnh, hệ thống có thể lập Hồ sơ đề xuất Cấp độ 2, nhưng bắt buộc phải áp dụng các giải pháp kỹ thuật, phân vùng mạng và cơ chế bảo vệ an ninh dữ liệu tương đương CẤP ĐỘ 3 đối với toàn bộ phân hệ quản lý hồ sơ cán bộ, tiêu chuẩn chính trị và liên thông CSDL quốc gia).'
    )
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  children.push(h3('a. Căn cứ pháp lý khẳng định'));
  children.push(
    bullet(
      '• Luật An toàn thông tin mạng năm 2015 & Luật An ninh mạng năm 2018:',
      'Quy định rõ nguyên tắc xác định cấp độ an toàn thông tin dựa trên tầm quan trọng của hệ thống và mức độ thiệt hại khi hệ thống bị xâm nhập, gián đoạn hoặc phá hoại.'
    )
  );
  children.push(
    bullet(
      '• Nghị định số 85/2016/NĐ-CP (Điều 9) & Thông tư số 12/2022/TT-BTTTT:',
      'Quy định hệ thống thông tin phục vụ chỉ đạo, điều hành của cơ quan cấp tỉnh, cơ quan Đảng cấp tỉnh có xử lý thông tin nội bộ quan trọng, thông tin về cán bộ công chức thuộc thẩm quyền Ban Thường vụ Tỉnh ủy quản lý và kết nối với các hệ thống thông tin cấp quốc gia thuộc nhóm tiêu chí xác định từ Cấp độ 2 đến Cấp độ 3.'
    )
  );
  children.push(
    bullet(
      '• Nghị định số 331/2026/NĐ-CP (Điều 27, 28, 29, 30):',
      'Quy định bắt buộc về các điều kiện bảo đảm an ninh mạng, thẩm định hồ sơ đề xuất cấp độ, phương án kỹ thuật và phương án quản lý an toàn thông tin áp dụng cho các cơ quan nhà nước, tổ chức chính trị.'
    )
  );

  children.push(h3('b. Căn cứ thực tiễn khẳng định'));
  children.push(
    bullet(
      '• Về vị trí, vai trò của cơ quan chủ quản:',
      'Ban Tổ chức Tỉnh ủy Đắk Lắk là cơ quan tham mưu cơ mật, giúp việc trực tiếp của Ban Chấp hành Đảng bộ tỉnh, Ban Thường vụ Tỉnh ủy và Thường trực Tỉnh ủy về toàn bộ công tác cán bộ, tổ chức, đảng viên và bảo vệ chính trị nội bộ trong toàn hệ thống chính trị của tỉnh.'
    )
  );
  children.push(
    bullet(
      '• Về tính chất và độ nhạy cảm của dữ liệu:',
      'Hệ thống lưu trữ và xử lý hồ sơ nhân sự của hàng ngàn cán bộ, đảng viên; bao gồm dữ liệu đánh giá xếp loại, kết quả thẩm định năng lực, quy hoạch nguồn cán bộ lãnh đạo quản lý các cấp, dữ liệu xác minh tiêu chuẩn chính trị nội bộ. Đây là những thông tin nhạy cảm đặc biệt, có ảnh hưởng trực tiếp đến uy tín của tổ chức Đảng và công tác chuẩn bị nhân sự đại hội các cấp.'
    )
  );
  children.push(
    bullet(
      '• Về hậu quả nếu xảy ra sự cố an ninh mạng:',
      'Nếu hệ thống bị tấn công, làm ngưng trệ hoạt động hoặc bị lộ lọt dữ liệu đánh giá cán bộ, sẽ gây hậu quả phương hại nghiêm trọng đến công tác chỉ đạo điều hành của Tỉnh ủy, gây mất đoàn kết nội bộ, ảnh hưởng đến an ninh chính trị trên địa bàn tỉnh. Do đó, việc xếp hạng và bảo vệ hệ thống theo tiêu chuẩn Cấp độ 3 là hoàn toàn cần thiết và xác đáng.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // ==========================================================================
  // CÁC GIẢI PHÁP BẢO ĐẢM ATTT THEO ĐIỀU 28, 29, 30 NGHỊ ĐỊNH 331/2026/NĐ-CP
  // BÁM SÁT 100% YÊU CẦU CỦA NGƯỜI DÙNG: PHẦN A, B, C
  // ==========================================================================
  children.push(
    h2('2. Đề xuất các Giải pháp Kỹ thuật và Quản lý theo Điều 28, 29, 30 Nghị định 331/2026/NĐ-CP')
  );

  children.push(
    p(
      'Căn cứ quy định tại Điều 28, 29, 30 Nghị định 331/2026/NĐ-CP, toàn bộ các giải pháp kỹ thuật và quản lý được đề xuất triển khai toàn diện theo 3 nhóm trụ cột A, B, C như sau:'
    )
  );

  // --------------------------------------------------------------------------
  // NHÓM A: BẢO ĐẢM AN TOÀN THÔNG TIN & AN NINH MẠNG
  // --------------------------------------------------------------------------
  children.push(h3('A. Giải pháp bảo đảm an toàn thông tin & An ninh mạng (Quản lý và Kỹ thuật)'));

  children.push(
    bullet(
      '1. Quy chế và Quản lý (Căn cứ Điều 30 Khoản 3, Khoản 7):',
      ''
    )
  );
  children.push(
    p(
      '• Xây dựng và ban hành Quy chế bảo đảm an ninh mạng: Ban Tổ chức Tỉnh ủy chủ trì, phối hợp với Sở Thông tin và Truyền thông, Phòng An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao (PA05 - Công an tỉnh Đắk Lắk) xây dựng và ban hành Quy chế bảo đảm an ninh mạng của cơ quan trước khi phê duyệt hồ sơ đề xuất cấp độ. Quy chế quy định rõ ràng trách nhiệm của từng cán bộ, quản trị viên hệ thống, quy trình quản lý tài khoản, chính sách mật khẩu mạnh, quy trình xử lý sự cố an ninh mạng và kỷ luật xử lý vi phạm.',
      { indent: 360 }
    )
  );
  children.push(
    p(
      '• Phân công bộ phận chuyên trách và Ký cam kết bảo mật: Phân công cán bộ chuyên trách CNTT tại Văn phòng Ban chịu trách nhiệm phụ trách an ninh mạng; thành lập Tổ ứng cứu sự cố an ninh mạng nội bộ. Bắt buộc ký bản Cam kết bảo mật thông tin (NDA) đối với 100% nhân sự của đơn vị phát triển phần mềm, đơn vị kiểm thử và đội ngũ quản trị viên hệ thống trước khi tham gia xây dựng hoặc vận hành phần mềm.',
      { indent: 360 }
    )
  );

  children.push(
    bullet(
      '2. An toàn ứng dụng và Kiểm soát truy cập (Căn cứ Điều 30 Khoản 4):',
      ''
    )
  );
  children.push(
    p(
      '• Kiểm soát truy cập dựa trên vai trò (RBAC / PBAC): Thiết lập cơ chế kiểm soát truy cập phân tầng tuyệt đối: (1) Cán bộ, chuyên viên chỉ có quyền xem nhiệm vụ được giao, cập nhật tiến độ và tự chấm điểm cho bản thân mình; (2) Lãnh đạo phòng chỉ được duyệt điểm và quản lý cán bộ trong phạm vi phòng chuyên môn mình phụ trách; (3) Lãnh đạo Ban phê duyệt tổng thể toàn cơ quan; (4) Quản trị viên hệ thống (Admin) chỉ quản trị người dùng và hạ tầng, không được quyền xem hoặc can thiệp vào kết quả chấm điểm KPI. Phân quyền áp dụng triệt để ràng buộc tenant isolation theo organizationId chống truy cập chéo.',
      { indent: 360 }
    )
  );
  children.push(
    p(
      '• Xác thực đa yếu tố (MFA / 2FA): Bắt buộc áp dụng phương thức xác thực hai lớp (2FA qua ứng dụng Google/Microsoft Authenticator TOTP hoặc mã OTP gửi qua SMS/Email công vụ) đối với 100% tài khoản có thẩm quyền phê duyệt kết quả đánh giá (Trưởng phòng, Lãnh đạo Ban) và toàn bộ tài khoản quản trị hệ thống (System Administrator). Cấm tuyệt đối việc sử dụng mật khẩu đơn thuần cho các vai trò phê duyệt.',
      { indent: 360 }
    )
  );
  children.push(
    p(
      '• Ghi nhật ký (Audit Log) chống chối bỏ bất biến: Hệ thống tự động ghi lại toàn bộ lịch sử thao tác của tất cả người dùng: Người thực hiện (actorId, employeeCode), hành động (actionType), thời gian thay đổi chính xác đến mili-giây (timestamp), địa chỉ IP truy cập, thiết bị sử dụng (User-Agent), giá trị dữ liệu trước khi thay đổi (oldValue) và sau khi thay đổi (newValue) đối với mọi thao tác sửa điểm, phê duyệt kết quả, gia hạn tiến độ. Phân hệ nhật ký được lưu trữ tại phân vùng cơ sở dữ liệu riêng biệt, chỉ cấp quyền ghi (Append-only), ngăn chặn tuyệt đối mọi hành vi can thiệp, sửa chữa hoặc xóa dấu vết.',
      { indent: 360 }
    )
  );

  children.push(
    bullet(
      '3. An toàn mạng và máy chủ (Căn cứ Điều 30 Khoản 4, Khoản 5):',
      ''
    )
  );
  children.push(
    p(
      '• Phân tách vùng mạng độc lập & Tường lửa đa lớp: Hạ tầng hệ thống được phân tách thành 4 phân vùng mạng cô lập: (1) Vùng DMZ (chứa API Gateway và Cổng Portal); (2) Vùng Ứng dụng Application Zone (chứa các Core & Domain Microservices); (3) Vùng Cơ sở dữ liệu Database Zone độc lập, không kết nối trực tiếp Internet; (4) Vùng Quản trị Management Zone riêng biệt. Hệ thống được đặt sau hệ thống Tường lửa thế hệ mới (Next-Generation Firewall) và Bộ lọc ứng dụng web (WAF - Web Application Firewall) ngăn chặn triệt để các cuộc tấn công DDoS, SQL Injection, Cross-Site Scripting (XSS), Brute-Force.',
      { indent: 360 }
    )
  );
  children.push(
    p(
      '• Kênh truyền bảo mật VPN nội bộ & Mã hóa TLS 1.3: Hạn chế tối đa việc mở cổng truy cập hệ thống trực tiếp từ mạng Internet công cộng. Cán bộ khi làm việc từ xa hoặc từ các huyện ủy, thị ủy bắt buộc phải truy cập thông qua mạng riêng ảo bảo mật (VPN chuyên dùng IPsec / SSL VPN có xác thực chứng thư số). Toàn bộ đường truyền kết nối giữa Client và Server, giữa API Gateway và các dịch vụ nội bộ được mã hóa 100% bằng giao thức HTTPS với chuẩn mã hóa cao nhất TLS 1.3.',
      { indent: 360 }
    )
  );

  children.push(
    bullet(
      '4. Đánh giá lỗ hổng và Kiểm tra an ninh mạng (Căn cứ Điều 27, Điều 28 Khoản 3):',
      ''
    )
  );
  children.push(
    p(
      '• Rà soát lỗ hổng mã nguồn (SAST/DAST) & Kiểm thử xâm nhập (Penetration Testing): Thực hiện đánh giá điều kiện an ninh mạng, rà quét lỗ hổng bảo mật mã nguồn tĩnh (SAST) và phân tích động (DAST) trong quy trình CI/CD. Trước khi đưa phần mềm vào vận hành chính thức, bắt buộc phải thuê đơn vị chức năng độc lập có thẩm quyền (hoặc phối hợp Cục An toàn thông tin, PA05 Công an tỉnh) thực hiện kiểm thử xâm nhập thực tế theo cả hai phương pháp Black box (hộp đen) và Gray box (hộp xám), rà soát mã độc; chỉ nghiệm thu khi đạt 100% chứng chỉ an toàn không còn lỗ hổng mức Nghiêm trọng (Critical) và Cao (High).',
      { indent: 360 }
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // --------------------------------------------------------------------------
  // NHÓM B: AN NINH DỮ LIỆU VÀ BẢO VỆ DỮ LIỆU CÁ NHÂN
  // --------------------------------------------------------------------------
  children.push(h3('B. An ninh dữ liệu và Bảo vệ dữ liệu cá nhân'));

  children.push(
    bullet(
      '1. Mã hóa dữ liệu lưu trữ (Data at Rest):',
      'Áp dụng thuật toán mã hóa tiêu chuẩn quân sự AES-256 (hoặc giải pháp mã hóa cơ yếu do Ban Cơ yếu Chính phủ cấp phép) đối với toàn bộ các trường dữ liệu định danh cán bộ (Số CCCD/Định danh cá nhân, số hiệu công chức, ngày sinh, chức vụ, mức lương, số điện thoại) và các thông tin nhạy cảm đặc biệt (kết quả nhận xét tiêu chuẩn chính trị, hồ sơ kỷ luật cán bộ) trong cơ sở dữ liệu. Khóa mã hóa (Encryption Keys) được quản lý tập trung trên hệ thống quản lý khóa độc lập (KMS / HashiCorp Vault), tách biệt hoàn toàn khỏi máy chủ cơ sở dữ liệu.'
    )
  );

  children.push(
    bullet(
      '2. Sao lưu và phục hồi dữ liệu định kỳ (Căn cứ Khoản 1 Điều 28, Điểm e Khoản 2 Điều 29):',
      'Thiết lập cơ chế sao lưu tự động định kỳ hằng ngày (Daily Automated Backup) vào khung giờ thấp điểm (01h00 sáng). Tuân thủ nghiêm ngặt Nguyên tắc lưu trữ 3-2-1: (1) Duy trì ít nhất 3 bản sao dữ liệu; (2) Lưu trữ trên 2 loại phương tiện vật lý khác nhau (hệ thống ổ cứng SAN/NAS nội bộ và hệ thống lưu trữ Cloud an toàn); (3) Có ít nhất 1 bản sao lưu tách biệt ngoại tuyến hoàn toàn (Offline / Air-Gapped / Băng từ lưu trữ trong két sắt) không kết nối với bất kỳ mạng máy tính nào để phòng ngừa tuyệt đối hiểm họa mã độc tống tiền mã hóa dữ liệu (Ransomware). Định kỳ hằng quý tổ chức diễn tập khôi phục dữ liệu từ bản sao để đảm bảo thời gian phục hồi dịch vụ (RTO < 2 giờ, RPO < 15 phút).'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // --------------------------------------------------------------------------
  // NHÓM C: BẢO VỆ BÍ MẬT NHÀ NƯỚC TRÊN MÔI TRƯỜNG SỐ
  // --------------------------------------------------------------------------
  children.push(h3('C. Bảo vệ Bí mật Nhà nước trên Môi trường số'));

  children.push(
    bullet(
      '1. Tách biệt và phân loại dữ liệu đầu vào:',
      ''
    )
  );
  children.push(
    p(
      '• Nguyên tắc cấm nhập thông tin Mật trên môi trường mở: Nếu phần mềm được triển khai trên môi trường máy chủ có kết nối Internet hoặc mạng mở dùng chung, TUYỆT ĐỐI KHÔNG ĐƯỢC NHẬP bất kỳ thông tin, tài liệu có độ Mật, Tối mật hoặc Tuyệt mật theo quy định của Luật Bảo vệ bí mật nhà nước (như: Đề án nhân sự Đại hội Đảng bộ tỉnh chưa công bố, hồ sơ quy hoạch cán bộ nguồn diện Ban Thường vụ Tỉnh ủy quản lý, kết luận thẩm tra tiêu chuẩn chính trị nội bộ đối với cán bộ chủ chốt, ý kiến kết luận của Thường trực Tỉnh ủy về nhân sự cơ mật). Các công việc này chỉ được khai báo dưới dạng mã định danh nhiệm vụ (Task Code mã hóa) và tiêu đề chung, không đính kèm nội dung chi tiết.',
      { indent: 360 }
    )
  );
  children.push(
    p(
      '• Triển khai trên Mạng cách ly vật lý / Cơ yếu khi có nhiệm vụ Mật: Trong trường hợp quy trình theo dõi và chấm điểm KPI bắt buộc phải xử lý, lưu trữ hoặc đính kèm các văn bản, tài liệu thuộc độ Mật của Đảng: BẮT BUỘC phải triển khai một phiên bản phần mềm độc lập trên Hạ tầng mạng máy tính nội bộ cách ly vật lý hoàn toàn với Internet (Air-Gapped Network) hoặc Mạng máy tính nội bộ cơ yếu của Đảng; đồng thời phải sử dụng giải pháp mã hóa dữ liệu chuyên dụng do Ban Cơ yếu Chính phủ chứng nhận và cấp phép.',
      { indent: 360 }
    )
  );

  children.push(
    bullet(
      '2. Kiểm soát xuất báo cáo và Ký số chuyên dùng công vụ:',
      ''
    )
  );
  children.push(
    p(
      '• Gắn mã định danh & Đóng dấu bản quyền chìm (Watermark): Mọi quyết định xếp loại chất lượng cán bộ, biểu mẫu báo cáo tổng hợp (Mẫu 03, Mẫu 04, Mẫu 05) khi được kết xuất từ Dashboard phần mềm (file PDF/Word) bắt buộc phải được hệ thống tự động gắn mã tra cứu định danh duy nhất (QR Code xác thực) và đóng dấu bản quyền chìm (Watermark) hiển thị mờ trên toàn bộ trang văn bản ghi rõ: "Họ tên người tải, Chức vụ, Phòng ban, Địa chỉ IP, Thời gian kết xuất chính xác". Giải pháp này giúp ngăn ngừa và truy vết ngay lập tức nguồn phát tán nếu xảy ra tình trạng cán bộ chụp ảnh màn hình hoặc in ấn tuồn tài liệu ra ngoài.',
      { indent: 360 }
    )
  );
  children.push(
    p(
      '• Ký số chuyên dùng công vụ: Toàn bộ Quyết định phê duyệt xếp loại cán bộ công chức hằng tháng, quý, năm và Báo cáo gửi Ban Thường vụ Tỉnh ủy bắt buộc phải được Ký số chuyên dùng công vụ do Ban Cơ yếu Chính phủ cấp cho Lãnh đạo Ban trước khi phát hành và lưu hành trong nội bộ cơ quan.',
      { indent: 360 }
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // ==========================================================================
  // PHẦN V: KẾT LUẬN & LỘ TRÌNH TRIỂN KHAI THỰC TẾ
  // ==========================================================================
  children.push(h1('PHẦN V. KẾT LUẬN VÀ LỘ TRÌNH TRIỂN KHAI THỰC TẾ'));

  children.push(h2('1. Đánh giá Giá trị Mang lại & Tính Khả thi của Giải pháp'));

  children.push(
    p(
      'Giải pháp xây dựng phần mềm Quản lý, đánh giá kết quả thực hiện nhiệm vụ bằng KPI/OKR tại Ban Tổ chức Tỉnh ủy Đắk Lắk không chỉ giải quyết triệt để 9/9 nhóm chức năng theo đề bài mà còn tạo ra bước đột phá toàn diện trong phương thức quản trị thực thi công vụ:'
    )
  );

  children.push(
    bullet(
      '• Về mặt Quản lý:',
      'Chấm dứt hoàn toàn tình trạng đánh giá hình thức, cảm tính, dĩ hòa vi quý cuối năm; siết chặt kỷ luật, kỷ cương theo tinh thần Nghị quyết 18-NQ/TW và Quy định 01-QĐ/BTCTU; nâng cao tinh thần trách nhiệm của người đứng đầu các phòng chuyên môn.'
    )
  );

  children.push(
    bullet(
      '• Về mặt Năng suất lao động:',
      'Tiết kiệm hơn 80% thời gian tổng hợp báo cáo thủ công nhờ công cụ AI hỗ trợ khai báo, xếp lịch và tự động móc nối số liệu vào phôi Quyết định; chuyên viên được giải phóng khỏi các thủ tục hành chính giấy tờ để tập trung vào công tác nghiên cứu, tham mưu chiến lược.'
    )
  );

  children.push(
    bullet(
      '• Về mặt Kỹ thuật & An toàn thông tin:',
      'Hệ thống được xây dựng trên nền tảng Microservices hiện đại, làm chủ mã nguồn 100%, bảo đảm nguyên tắc Source of Truth và đáp ứng nghiêm ngặt các tiêu chuẩn an toàn thông tin Cấp độ 3 theo Nghị định 331/2026/NĐ-CP và Luật Bảo vệ bí mật nhà nước.'
    )
  );

  children.push(h2('2. Lộ trình Triển khai Đề xuất (3 Giai đoạn)'));

  const roadmapHeaders = ['Giai đoạn triển khai', 'Mục tiêu công việc chính', 'Thời gian thực hiện', 'Sản phẩm đầu ra dự kiến'];
  const roadmapRows = [
    ['Giai đoạn 1: Thử nghiệm (Pilot)', 'Triển khai thử nghiệm tại Văn phòng Ban và Phòng Tổ chức cán bộ; nạp dữ liệu VTVL; kiểm thử thuật toán tính điểm KPI và kiểm thử an ninh mạng Black box/Gray box.', 'Tháng 1 - Tháng 2', 'Hệ thống vận hành thử nghiệm ổn định; Biên bản đánh giá an ninh mạng đạt chuẩn.'],
    ['Giai đoạn 2: Vận hành toàn diện', 'Mở rộng áp dụng cho toàn bộ 05 phòng chuyên môn và 22 VTVL cơ quan Ban Tổ chức Tỉnh ủy; kích hoạt tính năng AI khai báo việc và đồng bộ Trục LGSP.', 'Tháng 3 - Tháng 6', '100% cán bộ công chức tự chấm Mẫu 02 và Hội đồng Ban ban hành Quyết định Mẫu 05 trên phần mềm.'],
    ['Giai đoạn 3: Mở rộng liên thông', 'Hoàn thiện kết nối realtime với CSDL Quốc gia về Cán bộ CCVC và Trục văn bản quốc gia VXP; nhân rộng mô hình đánh giá cho các ban xây dựng đảng của Tỉnh ủy.', 'Tháng 7 trở đi', 'Hệ thống liên thông dữ liệu quốc gia thông suốt; Báo cáo số liệu thời gian thực lên Ban Thường vụ Tỉnh ủy.'],
  ];

  children.push(createTable(roadmapHeaders, roadmapRows, [20, 36, 16, 28]));

  children.push(new Paragraph({ spacing: { before: 200, after: 100 } }));

  // KHỐI CHỮ KÝ VÀ NƠI NHẬN
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: 'Nơi nhận:\n', font: 'Times New Roman', size: 22, bold: true, italics: true }),
                    new TextRun({ text: '- Thường trực Tỉnh ủy Đắk Lắk (để b/c);\n', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: '- Lãnh đạo Ban Tổ chức Tỉnh ủy;\n', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: '- 05 Phòng chuyên môn trực thuộc;\n', font: 'Times New Roman', size: 20 }),
                    new TextRun({ text: '- Lưu: VT, CNTT.', font: 'Times New Roman', size: 20 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: 'TM. BAN TỔ CHỨC TỈNH ỦY\n', font: 'Times New Roman', size: 22, bold: true }),
                    new TextRun({ text: 'TRƯỞNG BAN\n\n\n\n\n', font: 'Times New Roman', size: 22, bold: true }),
                    new TextRun({ text: '(Ký số chuyên dùng công vụ & Đóng dấu)', font: 'Times New Roman', size: 20, italics: true, color: '595959' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  // ==========================================================================
  // KHỞI TẠO TÀI LIỆU WORD CHÍNH THỨC
  // ==========================================================================
  const doc = new Document({
    creator: 'Ban Tổ chức Tỉnh ủy Đắk Lắk',
    title: 'Báo cáo Giải pháp Kỹ thuật Phần mềm Quản lý, Đánh giá KPI/OKR',
    description: 'Thuyết minh giải pháp kỹ thuật, bộ tiêu chí định lượng, phân tích thiết kế hệ thống và an toàn thông tin',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 25.4mm
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 100 },
                children: [
                  new TextRun({
                    text: 'BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK — ĐỀ ÁN GIẢI PHÁP PHẦN MỀM QUẢN LÝ & ĐÁNH GIÁ KPI/OKR',
                    font: 'Times New Roman',
                    size: 18, // 9pt
                    italics: true,
                    color: '595959',
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
                spacing: { before: 100, after: 0 },
                children: [
                  new TextRun({
                    text: 'Trang ',
                    font: 'Times New Roman',
                    size: 20, // 10pt
                    color: '595959',
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Times New Roman',
                    size: 20,
                    bold: true,
                    color: COLOR_PRIMARY,
                  }),
                  new TextRun({
                    text: ' / ',
                    font: 'Times New Roman',
                    size: 20,
                    color: '595959',
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Times New Roman',
                    size: 20,
                    color: '595959',
                  }),
                ],
              }),
            ],
          }),
        },
        children: children,
      },
    ],
  });

  const outputPath = path.resolve('docs/BAO_CAO_GIAI_PHAP_KPI_OKR_BAN_TO_CHUC_TINH_UY_DAKLAK.docx');
  console.log('Đang xuất file Word ra:', outputPath);

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log('XUẤT FILE THÀNH CÔNG! Dung lượng file:', buffer.length, 'bytes');

  // Copy một bản sang docs/examplebtc/ để người dùng dễ theo dõi đối chiếu
  const backupPath = path.resolve('docs/examplebtc/BAO_CAO_GIAI_PHAP_KPI_OKR_BAN_TO_CHUC_TINH_UY_DAKLAK.docx');
  fs.writeFileSync(backupPath, buffer);
  console.log('Đã tạo bản sao lưu tại:', backupPath);
}

generateReport().catch(err => {
  console.error('LỖI KHI XUẤT FILE:', err);
  process.exit(1);
});
