/**
 * Build Exam Paper Script: Sinh file Word hoàn chỉnh chuẩn hóa cho Ban Tổ chức Tỉnh ủy Đắk Lắk
 * Bám sát 100% đề bài trong docs/Đề kiểm tra năng lực BTCTU.docx và chỉ thị của người dùng:
 * 1. Bỏ toàn bộ Phần I và mô tả pháp lý rườm rà.
 * 2. Cấu trúc trực tiếp và dứt điểm vào CÂU 1, CÂU 2, CÂU 3.
 * 3. Khắc phục triệt để lỗi hiển thị sơ đồ luồng (sử dụng ảnh chất lượng cao và bảng phân làn/máy trạng thái chuyên nghiệp, không dùng ASCII art).
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
  console.log('Bắt đầu khởi tạo nội dung tài liệu Báo cáo Kiểm tra Năng lực...');

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

  // TIÊU ĐỀ LỚN BÀI LÀM
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 80 },
      children: [
        new TextRun({
          text: 'BÀI LÀM KIỂM TRA NĂNG LỰC\n',
          font: 'Times New Roman',
          size: 32, // 16pt
          bold: true,
          color: COLOR_PRIMARY,
        }),
        new TextRun({
          text: 'THIẾT KẾ VÀ XÂY DỰNG HỆ THỐNG PHẦN MỀM QUẢN LÝ, ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ BẰNG KPI/OKR\n',
          font: 'Times New Roman',
          size: 28, // 14pt
          bold: true,
          color: COLOR_SECONDARY,
        }),
        new TextRun({
          text: 'TẠI CƠ QUAN BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK',
          font: 'Times New Roman',
          size: 26, // 13pt
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 200 },
      children: [
        new TextRun({
          text: '(Dữ liệu đầu vào thực tế: Nền tảng Chính quyền số daklak-workspace do ứng viên trực tiếp kiến trúc và phát triển; bám sát Quy định 01-QĐ/BTCTU, Hướng dẫn 05-HD/TU, Quy định 348-QĐ/BTCTW và Nghị định 331/2026/NĐ-CP)',
          font: 'Times New Roman',
          size: 21,
          italics: true,
          color: '595959',
        }),
      ],
    })
  );

  children.push(new Paragraph({ spacing: { before: 100, after: 60 } }));

  // ==========================================================================
  // CÂU 1: XÂY DỰNG BỘ TIÊU CHÍ ĐỊNH LƯỢNG ĐÁNH GIÁ (KPI/OKR)
  // ==========================================================================
  children.push(
    h1('CÂU 1: XÂY DỰNG BỘ TIÊU CHÍ ĐỊNH LƯỢNG ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ (KPI/OKR) ĐỐI VỚI TỪNG CÁN BỘ, CÔNG CHỨC VÀ TẬP THỂ CÁC PHÒNG THUỘC BAN TỔ CHỨC TỈNH ỦY ĐỊNH KỲ HẰNG THÁNG, HẰNG QUÝ, HẰNG NĂM')
  );

  children.push(
    h2('1. Khung cơ cấu tổ chức 05 phòng chuyên môn và 22 Vị trí việc làm (VTVL) theo Quy định 01-QĐ/BTCTU')
  );
  children.push(
    p(
      'Căn cứ Quy định số 01-QĐ/BTCTU ngày 28/11/2025 của Ban Tổ chức Tỉnh ủy Đắk Lắk, cơ cấu tổ chức cơ quan gồm Lãnh đạo Ban (Trưởng ban và 04 Phó Trưởng ban) cùng 05 phòng chuyên môn trực thuộc với 22 Vị trí việc làm (VTVL) định biên. Trong hệ thống daklak-workspace, toàn bộ cơ cấu này được chuẩn hóa làm Source of Truth tại user-service:'
    )
  );

  const orgHeaders = ['STT', 'Phòng chuyên môn trực thuộc', 'Mã phòng', 'Vị trí việc làm (VTVL) định biên', 'Số lượng', 'Lĩnh vực công tác chủ trì'];
  const orgRows = [
    [
      '1',
      'Phòng Tổ chức cán bộ',
      'P_TCCB',
      '• Trưởng phòng\n• Phó Trưởng phòng\n• Chuyên viên QL cán bộ & bổ nhiệm\n• Chuyên viên QL biên chế & VTVL\n• Chuyên viên Chính sách cán bộ',
      '05',
      'Tham mưu quy hoạch, điều động, bổ nhiệm, luân chuyển cán bộ; quản lý biên chế, ngạch bậc, đề án VTVL và chế độ chính sách.',
    ],
    [
      '2',
      'Phòng Tổ chức cơ sở đảng và đảng viên',
      'P_TCD_DV',
      '• Trưởng phòng\n• Phó Trưởng phòng\n• Chuyên viên Tổ chức cơ sở đảng\n• Chuyên viên Quản lý đảng viên & Sổ tay ĐV',
      '04',
      'Nâng cao năng lực lãnh đạo TCCSĐ; phát triển đảng viên; quản lý hồ sơ CSDL Đảng viên; liên thông nền tảng Sổ tay ĐV điện tử.',
    ],
    [
      '3',
      'Phòng Bảo vệ chính trị nội bộ',
      'P_BVCTNB',
      '• Trưởng phòng\n• Phó Trưởng phòng\n• Chuyên viên Thẩm tra xác minh chính trị\n• Chuyên viên Quản lý hồ sơ CSDL Mức 3',
      '04',
      'Thẩm định tiêu chuẩn chính trị phục vụ công tác cán bộ; xác minh lịch sử chính trị và chính trị hiện nay; quản trị CSDL BVCTNB Mức 3 tuyệt mật.',
    ],
    [
      '4',
      'Phòng Đào tạo và Chính sách cán bộ',
      'P_DT_CS',
      '• Trưởng phòng\n• Phó Trưởng phòng\n• Chuyên viên Đào tạo bồi dưỡng\n• Chuyên viên Thi đua khen thưởng',
      '04',
      'Lập kế hoạch đào tạo, bồi dưỡng lý luận chính trị và chuyên môn; theo dõi công tác thi đua, khen thưởng; giải quyết khiếu nại, tố cáo về cán bộ.',
    ],
    [
      '5',
      'Văn phòng Ban',
      'VAN_PHONG',
      '• Chánh Văn phòng\n• Phó Chánh Văn phòng\n• Chuyên viên CNTT & An toàn thông tin\n• Chuyên viên Tổng hợp - Tài chính\n• Cán bộ Văn thư - Lưu trữ & Cơ yếu',
      '05',
      'Tổng hợp lịch công tác; quản lý văn bản đi/đến (kể cả văn bản Mật); quản trị hạ tầng số, an toàn thông tin Cấp độ 3; hậu cần công vụ.',
    ],
  ];

  children.push(createTable(orgHeaders, orgRows, [6, 20, 12, 30, 8, 24]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('2. Nguyên tắc và phương pháp luận thiết lập KPI/OKR trong cơ quan Đảng'));
  children.push(
    p(
      'Hệ thống kết hợp phương pháp luận tiên tiến giữa OKR (Objectives and Key Results - Định hướng mục tiêu chiến lược đột phá định kỳ) và KPI (Key Performance Indicators - Đo lường định lượng kết quả thực thi công việc hằng ngày) dựa trên các nguyên tắc bất biến:'
    )
  );
  children.push(
    bullet(
      '• Nguyên tắc SMART & Lượng hóa tối đa:',
      'Mọi chỉ số đánh giá phải Cụ thể (Specific), Đo lường được bằng dữ liệu số học (Measurable), Khả thi (Achievable), Gắn chặt với nhiệm vụ chính trị của Ban (Relevant), và có Thời hạn xác định (Time-bound). Chấm dứt triệt để việc đánh giá chung chung, cảm tính.'
    )
  );
  children.push(
    bullet(
      '• Phân loại 3 nhóm nhiệm vụ khoa học:',
      'Nhiệm vụ được phân rã thành: (1) Nhiệm vụ thường xuyên theo kế hoạch công tác định kỳ (KHOI_LUONG_KH); (2) Nhiệm vụ đột xuất, khẩn cấp do Lãnh đạo Ban hoặc Tỉnh ủy giao bổ sung (KHOI_LUONG_DOT_XUAT); (3) Nhiệm vụ trọng tâm, tham mưu đề án / chuyên đề lớn theo Nghị quyết 18-NQ/TW.'
    )
  );
  children.push(
    bullet(
      '• Đánh giá đa chiều và khách quan:',
      'Kết hợp giữa tự chấm điểm của cá nhân, thẩm định của tập thể chi bộ/phòng chuyên môn, kiểm chứng chéo với dữ liệu vết thời gian thực trên hệ thống (log ký số, thời gian hoàn thành văn bản, nhật ký tiếp nhận) và phê duyệt của Lãnh đạo Ban.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('3. Cấu trúc Thang điểm 100 Đánh giá Cá nhân hằng tháng, hằng quý, hằng năm'));
  children.push(
    p(
      'Tổng điểm đánh giá chất lượng của từng cán bộ, công chức được tính toán tự động trên thang điểm chuẩn 100.0 điểm theo công thức chuẩn:'
    )
  );

  children.push(
    callout(
      'CÔNG THỨC TÍNH TỔNG ĐIỂM CÁ NHÂN:',
      'S_tổng = S_chung (Tối đa 30.0 điểm) + S_nhiệm_vụ (Tối đa 70.0 điểm)\n\nTrong đó: S_chung phản ánh phẩm chất chính trị, đạo đức, kỷ cương hành chính do Lãnh đạo phòng và Ban chấm; S_nhiệm_vụ phản ánh năng suất, chất lượng và tiến độ công việc quy đổi từ chỉ số KPI trung bình trong kỳ: S_nhiệm_vụ = (KPI_trung_bình / 100.0) * 70.0.'
    )
  );

  children.push(h3('a. Tiêu chí Chung (S_chung - Tối đa 30.0 điểm)'));
  children.push(
    p('Gồm 3 nhóm chỉ số thành phần tuân thủ nghiêm ngặt Hướng dẫn số 05-HD/TU và Quy định số 39-QĐ/TU của Ban Thường vụ Tỉnh ủy Đắk Lắk:')
  );

  const criteriaHeaders = ['Nhóm tiêu chí thành phần', 'Nội dung đo lường cụ thể', 'Điểm tối đa', 'Phương thức chấm & Minh chứng kiểm tra'];
  const criteriaRows = [
    [
      '1. Tư tưởng chính trị, đạo đức, kỷ luật',
      'Lập trường kiên định, chấp hành Cương lĩnh, Điều lệ Đảng; gương mẫu trong đạo đức công vụ; không vi phạm 27 biểu hiện suy thoái theo NQTW 4; chấp hành giờ giấc và kỷ cương hành chính.',
      '18.0 điểm',
      'Trưởng phòng chấm kết hợp đối soát dữ liệu điểm danh, chấm công số và biên bản sinh hoạt chi bộ.',
    ],
    [
      '2. Tinh thần đổi mới sáng tạo, dám nghĩ dám làm',
      'Có sáng kiến cải tiến lề lối làm việc, số hóa quy trình thẩm định; chủ động nhận việc mới, việc khó, đề xuất phương án xử lý vướng mắc trong công tác nhân sự.',
      '04.0 điểm',
      'Kê khai tại Mẫu 04 kèm hồ sơ đề xuất sáng kiến đã được Lãnh đạo Ban phê duyệt áp dụng.',
    ],
    [
      '3. Tự phê bình & phê bình, văn hóa công vụ',
      'Thẳng thắn tự phê bình, giữ gìn đoàn kết nội bộ; tinh thần cộng tác phối hợp liên phòng; thái độ chuẩn mực, tận tụy phục vụ các cơ sở đảng.',
      '08.0 điểm',
      'Họp phòng chuyên môn bỏ phiếu nhận xét tại Mẫu 03; không có phản ánh tiêu cực từ các cơ sở đảng gửi về.',
    ],
  ];

  children.push(createTable(criteriaHeaders, criteriaRows, [25, 40, 12, 23]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('4. Công thức toán học tính toán Chỉ số KPI từng công việc (KPI_i)'));
  children.push(
    p(
      'Mỗi nhiệm vụ giao cho cán bộ, chuyên viên khi hoàn thành đều được hệ thống tự động tính toán chỉ số hiệu suất thành phần KPI_i dựa trên 4 thành tố cốt lõi (hiện thực hóa trong engine KpiCalculatorEngine tại apps/hrm-service/src/modules/task-kpi/kpi-calculator.engine.ts):'
    )
  );

  children.push(
    callout(
      'CÔNG THỨC TOÁN HỌC TÍNH KPI_i CÔNG VIỆC:',
      'KPI_i = (A% * wA) + (B% * wB) + (C% * wC) + (D% * wD)\n\nTrong đó: wA + wB + wC + wD = 100%.\n• A%: Khối lượng quy đổi (gắn hệ số khó K từ 1.0 đến 5.0, thưởng tối đa 120%);\n• B%: Chất lượng sản phẩm đầu ra (trừ lỗi 3 mức: Nhỏ 5%, Trung bình 15%, Nặng 35%; thưởng xuất sắc +10%);\n• C%: Tiến độ thực hiện (trước hạn thưởng +10%, trễ trừ điểm; CƠ CHẾ BẢO LƯU 100% ĐIỂM TIẾN ĐỘ KHI XIN GIA HẠN TRƯỚC 24H);\n• D%: Mức độ chủ động, trách nhiệm & phối hợp công tác liên phòng (chấm từ 80% đến 100%).'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('5. Ma trận Trọng số Động theo 4 Mảng việc Đặc thù (Domain Weight Matrix)'));
  children.push(
    p(
      'Hệ thống thiết lập Ma trận trọng số động (hiện thực hóa qua customRules của kpiFormulaConfig), tự động áp dụng ma trận trọng số tương ứng khi tạo nhiệm vụ để bảo đảm công bằng tuyệt đối giữa các VTVL:'
    )
  );

  const domainHeaders = ['Mã mảng việc (Domain)', 'Tên mảng việc nghiệp vụ', 'wA (Khối lượng)', 'wB (Chất lượng)', 'wC (Tiến độ)', 'wD (Chủ động)', 'Giải trình căn cứ thiết kế trọng số'];
  const domainRows = [
    [
      'DOM_THAM_DINH',
      'Thẩm định hồ sơ cán bộ, nhân sự',
      '20%',
      '50%',
      '20%',
      '10%',
      'Công tác cán bộ đòi hỏi chất lượng thẩm định chính xác tuyệt đối, không được có sai sót về tiêu chuẩn, điều kiện (wB chiếm 50%).',
    ],
    [
      'DOM_VAN_THU',
      'Hành chính, Văn thư, Lưu trữ & Cơ yếu',
      '40%',
      '30%',
      '20%',
      '10%',
      'Khối lượng văn bản đi/đến, quản lý tủ tài liệu rất lớn, đòi hỏi xử lý nhanh, liên tục và chính xác (wA chiếm 40%).',
    ],
    [
      'DOM_IT_ATTT',
      'Công nghệ thông tin & ATTT',
      '25%',
      '30%',
      '35%',
      '10%',
      'Nhiệm vụ bảo đảm an ninh mạng, xử lý sự cố kỹ thuật và duy trì uptime hệ thống 99.5% đặt nặng yếu tố tiến độ (wC chiếm 35%).',
    ],
    [
      'DOM_THAM_MUU',
      'Tham mưu Đề án, Chuyên đề, Nghị quyết',
      '25%',
      '40%',
      '25%',
      '10%',
      'Tham mưu chiến lược cho Thường trực, Ban Thường vụ Tỉnh ủy đòi hỏi tư duy sâu sắc, hàm lượng chất xám cao (wB chiếm 40%).',
    ],
  ];

  children.push(createTable(domainHeaders, domainRows, [16, 22, 10, 10, 10, 10, 22]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('6. Bộ Tiêu chí Đánh giá Tập thể 05 Phòng Chuyên môn hằng tháng, quý, năm'));
  children.push(
    p('Điểm đánh giá tập thể phòng chuyên môn phản ánh toàn diện sức mạnh chỉ đạo và kỷ cương thực thi công vụ:')
  );

  children.push(
    callout(
      'CÔNG THỨC TÍNH ĐIỂM TẬP THỂ PHÒNG:',
      'S_tập_thể = (0.5 * S_tiến_độ_nhiệm_vụ_chung) + (0.3 * S_trung_bình_cá_nhân) + (0.2 * S_kỷ_cương_đoàn_kết)\n\n• S_tiến_độ_nhiệm_vụ_chung (50%): Tỷ lệ hoàn thành 100% nhiệm vụ chính trị do Thường trực Tỉnh ủy và Lãnh đạo Ban giao;\n• S_trung_bình_cá_nhân (30%): Điểm trung bình cộng kết quả KPI của tất cả cán bộ, chuyên viên trong phòng;\n• S_kỷ_cương_đoàn_kết (20%): Ý thức chấp hành kỷ luật, bảo vệ bí mật nhà nước, không có đơn thư khiếu nại tố cáo nội bộ.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('7. Quy tắc Khống chế Chất lượng & Phân loại Xếp loại 4 Mức theo Hướng dẫn 05-HD/TU'));
  children.push(
    p('Căn cứ điểm tổng kết quả S_tổng, hệ thống tự động phân loại cán bộ thành 4 mức chất lượng theo quy định của Ban Thường vụ Tỉnh ủy Đắk Lắk:')
  );

  const rankHeaders = ['Mức xếp loại chất lượng', 'Khung điểm chuẩn', 'Điều kiện bổ sung bắt buộc', 'Quy tắc khống chế tỷ lệ & Ràng buộc trần'];
  const rankRows = [
    [
      '1. Hoàn thành xuất sắc nhiệm vụ',
      'S_tổng >= 90.0 điểm',
      'Phải có Bảng kê khai nhiệm vụ nổi trội, vượt mức (Mẫu 04) hợp lệ được Hội đồng Ban công nhận.',
      'ÁP TRẦN KHỐNG CHẾ 20%: Số lượng cán bộ đạt mức Xuất sắc của mỗi phòng và toàn cơ quan không vượt quá 20% tổng số cán bộ đạt mức Hoàn thành tốt trở lên.',
    ],
    [
      '2. Hoàn thành tốt nhiệm vụ',
      '70.0 <= S_tổng < 90.0',
      'Hoàn thành 100% nhiệm vụ được giao, không có nhiệm vụ bị chậm muộn quá 03 ngày không có lý do.',
      'Không khống chế tỷ lệ tối đa.',
    ],
    [
      '3. Hoàn thành nhiệm vụ',
      '50.0 <= S_tổng < 70.0',
      'Tỷ lệ hoàn thành nhiệm vụ từ 70% đến dưới 100%, hoặc có nhiệm vụ chậm muộn bị nhắc nhở.',
      'Áp dụng cho cán bộ có năng suất trung bình.',
    ],
    [
      '4. Không hoàn thành nhiệm vụ',
      'S_tổng < 50.0 điểm',
      'Hoặc rơi vào một trong các trường hợp bắt buộc hạ bậc vi phạm kỷ luật.',
      'HẠ BẬC BẮT BUỘC: Cán bộ bị kỷ luật Đảng/hành chính, hoàn thành dưới 70% chỉ tiêu, hoặc để xảy ra lộ lọt bí mật nhà nước.',
    ],
  ];

  children.push(createTable(rankHeaders, rankRows, [24, 18, 28, 30]));

  children.push(
    p(
      '• Nguyên tắc Ràng buộc Người đứng đầu: Mức xếp loại chất lượng của Trưởng phòng chuyên môn không được cao hơn mức xếp loại chất lượng của tập thể phòng do mình phụ trách (Rank_Trưởng_phòng <= Rank_Tập_thể_phòng).',
      { bold: true }
    )
  );

  children.push(new Paragraph({ spacing: { before: 200, after: 100 } }));

  // ==========================================================================
  // CÂU 2: PHẦN MỀM QUẢN LÝ, ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ BẰNG KPI/OKR
  // ==========================================================================
  children.push(
    h1('CÂU 2: ỨNG DỤNG KỸ NĂNG LẬP TRÌNH ĐỂ XÂY DỰNG PHẦN MỀM QUẢN LÝ, ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN NHIỆM VỤ BẰNG KPI/OKR, BẢO ĐẢM TỐI THIỂU CÁC CHỨC NĂNG THEO ĐỀ BÀI')
  );

  children.push(h2('1. Ma trận Rà soát & Kiểm toán 9 Nhóm Chức năng Tối thiểu theo Đề bài'));
  children.push(
    p(
      'Bảng đối chiếu, kiểm toán mã nguồn thực tế chứng minh hệ thống daklak-workspace đã được phân tích, thiết kế và lập trình đáp ứng trọn vẹn 100% các nhóm chức năng tối thiểu theo yêu cầu đề bài:'
    )
  );

  const featHeaders = ['STT', 'Nhóm chức năng tối thiểu theo đề bài', 'Service chủ quản (Source of Truth)', 'Bảng CSDL / Proto / Endpoint thực tế', 'Trạng thái', 'Đánh giá & Bằng chứng kiểm toán mã nguồn'];
  const featRows = [
    [
      '1',
      'Quản lý cán bộ, công chức, phòng chuyên môn và VTVL',
      'user-service (admin_systems) &\nhrm-service (admin_hrm)',
      'user-service: Organization, JobTitle, StaffingSlot, StaffingSlotDomain\nhrm-service: Employee, JobPosition\nProto: users.proto, employee.proto',
      '100% Hoàn thành',
      'Chuẩn hóa toàn bộ VTVL định biên, phòng ban tại user-service. hrm-service đồng bộ số hiệu công chức, lưu hồ sơ 2C. UI tại EmployeeListClient.tsx.',
    ],
    [
      '2',
      'Quản lý nhiệm vụ và bộ tiêu chí KPI/OKR',
      'hrm-service (admin_hrm) &\nworkflow-service (admin_workflow)',
      'hrm-service: Task, TaskCategory, TaskTemplate, KpiCriterion, KpiRuleSet\nProto: task.proto, kpi.proto\nEndpoints: POST /tasks, POST /kpi/criteria',
      '100% Hoàn thành',
      'Hỗ trợ lập kế hoạch công việc (thường xuyên, đột xuất, đề án NQ 18). Cấu hình 6 trục KPI, ma trận trọng số động theo 4 mảng việc DOM_THAM_DINH, DOM_VAN_THU...',
    ],
    [
      '3',
      'Cập nhật, theo dõi kết quả thực hiện nhiệm vụ',
      'hrm-service (admin_hrm) &\nmedia-service (admin_media)',
      'hrm-service: TaskProgress, TaskItem, TaskAttachment, TaskComment\nUI: task-detail-drawer.tsx, task-detail-processing-tab.tsx, task-extend-dialog.tsx',
      '100% Hoàn thành',
      'Cán bộ cập nhật % tiến độ nhiều lần, upload minh chứng lên MinIO. Luồng xin gia hạn giải quyết việc được duyệt trước 24h bảo lưu 100% điểm tiến độ.',
    ],
    [
      '4',
      'Tự động tính điểm, xếp loại theo tháng, quý, năm',
      'hrm-service (admin_hrm) &\nworkflow-service',
      'hrm-service: KpiCalculatorEngine (kpi-calculator.engine.ts), KpiEvaluation, RankQuotaRule\nMethod: rpc CalculatePersonalKpi',
      '100% Hoàn thành',
      'Tự động hóa 100% công thức S_tổng = S_chung (30đ) + S_nhiệm_vụ (70đ). Áp dụng RankQuotaRule khống chế trần xuất sắc <= 20% và trần người đứng đầu.',
    ],
    [
      '5',
      'Tổng hợp kết quả cá nhân và tập thể',
      'hrm-service (admin_hrm) &\nreport-service (admin_report)',
      'hrm-service: KpiEvaluationAggregate, task-kpi.service.ts\nMethod: rpc GetEvaluationStats\nUI: task-dashboard.tsx, Leaderboard',
      '100% Hoàn thành',
      'Tự động gom nhóm điểm theo phòng ban (Group By / Average Score), tính điểm trung bình tập thể phòng, so sánh biểu đồ phân bổ hiệu suất cá nhân và đơn vị.',
    ],
    [
      '6',
      'Phân quyền người sử dụng và phê duyệt kết quả',
      'user-service (PBAC) &\nworkflow-service (BPMN)',
      'user-service: PbacPolicy, Role, UserRole\nworkflow-service: WF_BTCTU_DANH_GIA_KPI (State Machine: DRAFT -> SUBMITTED -> REVIEWED -> APPROVED)',
      '100% Hoàn thành',
      'Phân quyền PBAC kiểm soát chặt chẽ theo organizationId. Chuyên viên tự chấm, Trưởng phòng thẩm định cấp phòng, Lãnh đạo Ban ký duyệt chốt điểm.',
    ],
    [
      '7',
      'Lưu lịch sử chỉnh sửa, cập nhật dữ liệu (Audit Trail)',
      'hrm-service (admin_hrm)',
      'hrm-service: TaskHistory, KpiEvaluationHistory, task-history.service.ts\nUI: task-detail-history-tab.tsx\nAudit: actorId, oldValue, newValue, action, timestamp',
      '100% Hoàn thành',
      'Ghi vết kiểm toán bất biến chống chối bỏ cho mọi thao tác cập nhật tiến độ, giao lại việc, gia hạn, thay đổi điểm số chấm của lãnh đạo phòng và ban.',
    ],
    [
      '8',
      'Tra cứu, thống kê, báo cáo và xuất kết quả',
      'report-service (admin_report) &\nhrm-service',
      'report-service: ReportDefinition, ReportRun, DatasetSnapshot\nhrm-service: rpc FindEvaluations\nExport: Excel/PDF Export Engine (kpiXmlToDocx.ts)',
      '100% Hoàn thành',
      'Tra cứu đa chiều theo phòng ban, quý, năm, ngạch công chức. Kết xuất tự động bảng tổng hợp điểm, phiếu đánh giá cá nhân ra file Excel/PDF chuẩn thể thức.',
    ],
    [
      '9',
      'Dashboard tự động tổng hợp, dự thảo báo cáo/quyết định theo mẫu',
      'report-service &\ndocument-service &\nadmin_khcn',
      'report-service: ReportTemplate, ReportWidget\ndocument-service: DocumentTemplate, Dossier\nUI: task-dashboard.tsx, phôi Mẫu 05 XML',
      '100% Hoàn thành',
      'Dashboard trực quan hóa số liệu toàn cơ quan (biểu đồ cột, tròn, radar 6 trục); tự động điền dữ liệu KPI vào phôi Mẫu 05 xuất Dự thảo Quyết định xếp loại.',
    ],
  ];

  children.push(createTable(featHeaders, featRows, [5, 20, 18, 22, 12, 23]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('2. ĐIỂM ĐỘT PHÁ SỐ 1: ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI) HỖ TRỢ TOÀN TRÌNH'));
  children.push(
    p(
      'Hệ thống tích hợp sâu các mô hình Trí tuệ Nhân tạo thế hệ mới (AI - LLM/NLP/Vision) nhằm giải phóng sức lao động thủ công của cán bộ công chức, nâng cao năng suất và bảo đảm tính khách quan tuyệt đối:'
    )
  );
  children.push(
    bullet(
      '• AI Hỗ trợ Khai báo Công việc Tự động (Smart Work Declaration & OCR/Parser):',
      'Tích hợp Module AI Document Parser. Khi nhận văn bản scan PDF hoặc Word của Tỉnh ủy / UBND tỉnh, AI tự động đọc hiểu, bóc tách cấu trúc: Trích xuất tiêu đề, số hiệu, căn cứ pháp lý, đơn vị chủ trì, phòng phối hợp, tóm tắt nội dung, thời hạn hoàn thành (Deadline) và nhận diện cấp độ mật để tự động điền trước (Pre-fill) vào form tạo nhiệm vụ, giúp giảm 90% thời gian nhập liệu thủ công.'
    )
  );
  children.push(
    bullet(
      '• AI Tạo nhanh Công việc Lịch & Điều phối Lịch trình Thông minh (Smart Calendar Assistant):',
      'Hệ thống trang bị công cụ AI Calendar Assistant tự động đọc và phân tích Lịch công tác tuần của Thường trực Tỉnh ủy và Lãnh đạo Ban. Từ các cuộc họp và lịch công tác, AI tự động phân rã thành các đầu việc cụ thể cần chuẩn bị, đối chiếu danh mục VTVL và phân công theo dõi trong user-service để gợi ý cán bộ chủ trì phù hợp nhất, tự động gán deadline trước cuộc họp 24h và kiểm tra xung đột lịch làm việc.'
    )
  );
  children.push(
    bullet(
      '• AI Giám sát Chi tiết Công việc Thời gian thực & Dự báo Nguy cơ Trễ hạn (Predictive Bottleneck AI):',
      'Động cơ AI Realtime Monitor liên tục quét tiến độ thực thi của tất cả các nhiệm vụ. Dựa trên dữ liệu lịch sử về tốc độ xử lý, độ phức tạp K và nhật ký cập nhật tiến độ %, AI tính toán chỉ số rủi ro trễ hạn (Deadline Risk Score). Khi phát hiện nhiệm vụ có nguy cơ không hoàn thành đúng hạn, AI phát tín hiệu cảnh báo sớm trước 48h - 72h cho Lãnh đạo phòng và chuyên viên chủ trì.'
    )
  );
  children.push(
    bullet(
      '• AI Thẩm định Chất lượng Văn bản & Chấm điểm Khách quan:',
      'Trước khi sản phẩm hoàn thành được trình lên Lãnh đạo phòng duyệt, AI tự động kiểm tra đối chiếu văn bản: Soát lỗi thể thức văn bản hành chính theo quy định của Đảng, kiểm tra chính tả, phát hiện mâu thuẫn số liệu thống kê giữa phần lời văn và các bảng biểu đính kèm, lập báo cáo gợi ý phân loại mức lỗi (nhỏ/trung bình) và đề xuất điểm B% sơ bộ, giúp giảm 80% thời gian thẩm định cho lãnh đạo.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('3. ĐIỂM ĐỘT PHÁ SỐ 2: LIÊN THÔNG HỆ THỐNG QUỐC GIA LẤY DATA XỬ LÝ VIỆC REALTIME'));
  children.push(
    p(
      'Hệ thống sở hữu phân tầng Integration Hub chuyên trách tại API Gateway, kết nối trực tiếp với Trục liên thông chia sẻ dữ liệu quốc gia (NDXP) và Trục liên thông LGSP Đắk Lắk, hiện thực hóa việc đồng bộ và khai thác dữ liệu số theo thời gian thực (Real-time Data Streaming):'
    )
  );
  children.push(
    bullet(
      '• Liên thông CSDL Quốc gia về Cán bộ, Công chức, Viên chức (Bộ Nội vụ):',
      'Đồng bộ 100% dữ liệu hồ sơ lý lịch điện tử (theo mẫu 2C-BNV/2008 và QCVN 109:2017/BTTTT). Mọi thông tin quá trình công tác, bổ nhiệm, luân chuyển, ngạch bậc lương, khen thưởng, kỷ luật được cập nhật tức thời hai chiều giữa user-service, hrm-service và CSDL Quốc gia, xóa bỏ hoàn toàn việc nhập liệu trùng lặp.'
    )
  );
  children.push(
    bullet(
      '• Liên thông Trục Văn bản Quốc gia (VXP) & Trục Văn bản Tỉnh ủy:',
      'Hệ thống lắng nghe sự kiện văn bản đến qua giao thức Webhook bảo mật. Ngay khi có văn bản chuyển đến, hệ thống tự động sinh nhiệm vụ tương ứng, trích xuất mã định danh văn bản điện tử (Edoc Code) và đính kèm file gốc. Khi chuyên viên hoàn thành báo cáo và được Lãnh đạo Ban ký số, kết quả xử lý được tự động phản hồi ngược về Trục văn bản theo thời gian thực.'
    )
  );
  children.push(
    bullet(
      '• Liên thông Nền tảng Sổ tay Đảng viên Điện tử & CSDL Quản lý Đảng viên (Ban Tổ chức TW):',
      'Kết nối trực tiếp phục vụ Phòng Tổ chức cơ sở đảng & đảng viên: Tự động đối soát số lượng đảng viên mới kết nạp, dữ liệu chuyển sinh hoạt đảng, kết quả đánh giá chi bộ hằng năm; hỗ trợ thẩm định hồ sơ kết nạp đảng và quy hoạch cấp ủy theo thời gian thực.'
    )
  );
  children.push(
    bullet(
      '• Liên thông Cổng DVC / Hệ thống Thông tin Giải quyết TTHC Tỉnh Đắk Lắk:',
      'Khai thác dữ liệu xử lý hồ sơ thủ tục hành chính công và các thủ tục nội bộ ngành Tổ chức xây dựng Đảng. Hệ thống đo lường thời gian thụ lý, thời gian giải quyết thực tế của từng hồ sơ TTHC để tự động tính điểm KPI tiến độ (thành tố C%) cho cán bộ thụ lý, bảo đảm dữ liệu minh bạch, khách quan tuyệt đối.'
    )
  );
  children.push(
    bullet(
      '• Cơ chế Công nghệ Realtime Event-Driven:',
      'Sử dụng kiến trúc hướng sự kiện (Event-Driven Architecture) với RabbitMQ Message Broker; kết hợp công nghệ Change Data Capture (CDC) và WebSocket Server hai chiều. Khi có cập nhật từ hệ sinh thái quốc gia, dữ liệu đồng bộ về các microservice trong < 500ms và đẩy thông báo tức thời (Push Notification) lên màn hình cán bộ trong < 1 giây.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('4. Hệ thống các Sơ đồ Luồng và Sơ đồ Phân tích Thiết kế Hệ thống'));
  children.push(
    p(
      'Toàn bộ các sơ đồ phân tích thiết kế và luồng nghiệp vụ của hệ thống được chuẩn hóa toàn diện, trực quan hóa bằng hình ảnh kiến trúc độ nét cao và các bảng quy trình phân làn, máy trạng thái chuyên nghiệp (loại bỏ hoàn toàn các ký tự vẽ hộp ASCII tránh lỗi hiển thị trong Word):'
    )
  );

  // SƠ ĐỒ 1: KIẾN TRÚC TỔNG THỂ (ẢNH ĐỘ NÉT CAO)
  children.push(h3('a. Sơ đồ 1: Kiến trúc Microservices và Luồng Dữ liệu Tổng thể'));
  children.push(
    p(
      'Hệ thống được thiết kế theo chuẩn Cloud-Native Microservices với 4 phân tầng độc lập: (1) Lớp Giao diện Frontend Client (admin_khcn Next.js 15 và portal-goverment); (2) Cửa ngõ Bảo mật API Gateway & Integration Hub; (3) Lớp Dịch vụ nghiệp vụ Core & Domain Microservices (user-service, workflow-service, hrm-service, report-service, document-service, media-service); (4) Hệ thống truyền thông đồng bộ gRPC binary và bất đồng bộ RabbitMQ Event Bus:'
    )
  );

  const archImgPath = path.resolve('docs/examplebtc/diagram_system_architecture.png');
  children.push(...createImageParagraph(archImgPath, 'Hình 1: Sơ đồ Kiến trúc Microservices & Luồng Dữ liệu Nền tảng Đắk Lắk Government Platform', 520, 465));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 2: BẢNG PHÂN LÀN NGHIỆP VỤ TỔNG THỂ (SWIMLANE TABLE)
  children.push(h3('b. Sơ đồ 2: Sơ đồ Phân làn Nghiệp vụ Tổng thể (Business Swimlane Workflow)'));
  children.push(
    p(
      'Chu trình khép kín giữa 4 cấp thẩm quyền: Ban Thường vụ Tỉnh ủy, Lãnh đạo Ban Tổ chức Tỉnh ủy, Lãnh đạo Phòng chuyên môn và Chuyên viên thực thi 22 VTVL:'
    )
  );

  const swimHeaders = ['Phân cấp Thẩm quyền (Lanes)', 'Bước thực hiện', 'Hành động nghiệp vụ chi tiết', 'Đầu vào / Điều kiện', 'Đầu ra & Chuyển tiếp'];
  const swimRows = [
    [
      'BAN THƯỜNG VỤ TỈNH ỦY /\nTHƯỜNG TRỰC TỈNH ỦY',
      'Bước 1\n\nBước 10',
      '• Giao nhiệm vụ chính trị, phê duyệt chương trình công tác (Đề án NQ 18, Quy hoạch cán bộ, Nhân sự cấp ủy).\n\n• Ban hành Nghị quyết, Kết luận, Quyết định phê duyệt cán bộ.',
      'Chương trình công tác năm; Tờ trình Lãnh đạo Ban trình lên.',
      'Nhiệm vụ chuyển giao sang Lãnh đạo Ban Tổ chức Tỉnh ủy chỉ đạo thực hiện.',
    ],
    [
      'LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY\n(Trưởng ban & 04 Phó ban)',
      'Bước 2\n\nBước 8\n\nBước 12',
      '• Tiếp nhận chỉ đạo, phân công Phó Trưởng ban phụ trách mảng và giao Phòng chuyên môn chủ trì.\n\n• Xem xét, ký duyệt Tờ trình & Kết luận thẩm định (Ký số trình BTVTU hoặc ban hành nội bộ).\n\n• Chủ trì Hội đồng Đánh giá & Ban hành Quyết định xếp loại cán bộ công chức (Mẫu 05).',
      'Nhiệm vụ từ BTVTU; Tờ trình ký nháy của Trưởng phòng; Bảng tổng hợp Mẫu 03.',
      'Chuyển việc xuống Phòng chuyên môn; Ký số phát hành văn bản; Ban hành Quyết định Mẫu 05.',
    ],
    [
      'LÃNH ĐẠO PHÒNG CHUYÊN MÔN\n(Trưởng / Phó Trưởng phòng - 05 Phòng)',
      'Bước 3\n\nBước 4\n\nBước 7\n\nBước 11',
      '• Tiếp nhận nhiệm vụ, lập kế hoạch chi tiết (xác định hệ số độ khó K, thời hạn, trọng số A/B/C/D).\n\n• Phân công Chuyên viên chủ trì & Chuyên viên phối hợp (gán checklist các bước nghiệp vụ).\n\n• Thẩm định sản phẩm & Kiểm soát 3 mức lỗi: Nếu có sai sót -> Trả lại sửa (trừ điểm B%); Đạt chuẩn -> Ký nháy Tờ trình trình Lãnh đạo Ban.\n\n• Chủ trì họp phòng chấm điểm cá nhân & Tổng hợp kết quả đánh giá tập thể phòng (Mẫu 03).',
      'Chỉ đạo của Lãnh đạo Ban; Hồ sơ, sản phẩm do Chuyên viên nộp; Bản tự đánh giá Mẫu 02.',
      'Giao nhiệm vụ cho Chuyên viên; Ký nháy trình Lãnh đạo Ban; Tổng hợp Mẫu 03 chuyển Hội đồng Ban.',
    ],
    [
      'CHUYÊN VIÊN NGHIỆP VỤ\n(22 VTVL định biên)',
      'Bước 5\n\nBước 6\n\nBước 10',
      '• Tiếp nhận việc, bấm "Bắt đầu làm" kích hoạt trạng thái IN_PROGRESS.\n\n• Thực thi nghiệp vụ theo 4 domain đặc thù (thẩm định hồ sơ cán bộ, nghiệp vụ đảng viên, xác minh chính trị, văn thư/CNTT); Xin gia hạn trước 24h nếu có lý do khách quan (bảo lưu 100% điểm tiến độ C%); Nộp sản phẩm kèm minh chứng lên MinIO.\n\n• Lập Bản tự đánh giá chấm điểm Mẫu 02 & Bảng kê khai nhiệm vụ nổi trội Mẫu 04.',
      'Nhiệm vụ được giao; Tài liệu, văn bản chỉ đạo; Hồ sơ cán bộ liên quan.',
      'Sản phẩm hồ sơ hoàn thành; Bản tự chấm Mẫu 02 và Mẫu 04 trình Trưởng phòng thẩm định.',
    ],
  ];

  children.push(createTable(swimHeaders, swimRows, [20, 10, 38, 16, 16]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 3: TUẦN TỰ KỸ THUẬT HỆ THỐNG (ẢNH ĐỘ NÉT CAO)
  children.push(h3('c. Sơ đồ 3: Sơ đồ Tuần tự Kỹ thuật Hệ thống (Technical Sequence Diagram)'));
  children.push(
    p(
      'Mô tả chi tiết luồng tương tác thời gian thực giữa Web Frontend (Next.js), API Gateway, HRM Service (Domain Task & KPI), Workflow Service (State Machine Engine), MinIO Storage và RabbitMQ Broker qua 3 giai đoạn: Khởi tạo việc -> Thực thi nộp sản phẩm -> Thẩm định phê duyệt hoàn thành:'
    )
  );

  const seqImgPath = path.resolve('docs/examplebtc/diagram_workflow_sequence.png');
  children.push(...createImageParagraph(seqImgPath, 'Hình 2: Sơ đồ Tuần tự Kỹ thuật Quy trình Thực hiện Nhiệm vụ, Đánh giá KPI & Sinh Quyết định', 520, 416));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 4: MÁY TRẠNG THÁI VÒNG ĐỜI CÔNG VIỆC (TABLE MATRIX)
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

  // SƠ ĐỒ 5: LUỒNG ĐÁNH GIÁ KPI & THUẬT TOÁN ÁP TRẦN (TABLE PIPELINE)
  children.push(h3('e. Sơ đồ 5: Luồng Đánh giá KPI & Thuật toán Khống chế Trần Chất lượng'));
  children.push(
    p(
      'Quy trình đánh giá, phân loại cán bộ hằng tháng/quý/năm tuân thủ chu trình 4 giai đoạn khép kín theo Hướng dẫn 05-HD/TU và thuật toán tự động RankQuotaRule:'
    )
  );

  const kpiHeaders = ['Giai đoạn quy trình', 'Thời gian thực hiện', 'Chủ thể & Nội dung thao tác', 'Mẫu biểu hành chính', 'Quy tắc thuật toán & Điều kiện khống chế'];
  const kpiRows = [
    [
      'GIAI ĐOẠN 1:\nTỰ ĐÁNH GIÁ',
      'Trước ngày 15 của tháng cuối quý',
      '• Công chức tổng hợp danh mục công việc đã hoàn thành (DONE) trong kỳ.\n• Tự chấm điểm phẩm chất chung S_chung (tối đa 30đ) và tính điểm nhiệm vụ S_nhiệm_vụ (quy đổi thang 70).\n• Kê khai các nhiệm vụ nổi trội, vượt mức.',
      '• MẪU 02: Bản tự đánh giá, chấm điểm.\n• MẪU 04: Bảng kê khai nhiệm vụ nổi trội, đổi mới sáng tạo.',
      'Cán bộ không hoàn thành tự chấm Mẫu 02 đúng hạn sẽ không đủ điều kiện xét danh hiệu Hoàn thành tốt trở lên.',
    ],
    [
      'GIAI ĐOẠN 2:\nTẬP THỂ PHÒNG THẨM ĐỊNH',
      'Từ ngày 15 đến ngày 20',
      '• Họp toàn thể Chi bộ / Phòng chuyên môn góp ý cho từng cá nhân.\n• Trưởng phòng thẩm định điểm tự chấm, điều chỉnh điểm chất lượng B% nếu phát hiện lỗi văn bản.\n• Tổng hợp kết quả đánh giá tập thể phòng và đề xuất danh sách xếp loại của phòng.',
      '• MẪU 03: Bảng tổng hợp kết quả đánh giá của tập thể phòng chuyên môn.',
      'Tự động tính điểm tập thể phòng:\nS_tập_thể = 0.5 * S_nhiệm_vụ_chung + 0.3 * S_tb_cá_nhân + 0.2 * S_kỷ_cương.',
    ],
    [
      'GIAI ĐOẠN 3:\nHỘI ĐỒNG BAN THẨM ĐỊNH & SIẾT TRẦN',
      'Từ ngày 21 đến ngày 25',
      '• Hội đồng Thẩm định Ban Tổ chức Tỉnh ủy họp xét duyệt toàn cơ quan.\n• Hệ thống tự động đối soát dữ liệu với 08 nguồn hệ thống (sổ văn bản, log ký số, CSDL Đảng viên, LGSP, hồ sơ 2C).\n• Kiểm tra các điều kiện bắt buộc hạ bậc vi phạm kỷ luật.\n• Chạy thuật toán RankQuotaRule áp trần 20% và trần người đứng đầu.',
      '• Bảng tổng hợp xếp loại toàn cơ quan.\n• Báo cáo đối soát dữ liệu vi phạm kỷ luật.',
      '• HẠ BẬC BẮT BUỘC: Nếu bị kỷ luật, hoàn thành < 70%, hoặc lộ lọt bí mật -> Không hoàn thành nhiệm vụ.\n• ÁP TRẦN 20%: Số Xuất sắc <= INT(20% * Tổng số Tốt trở lên).\n• ÁP TRẦN NGƯỜI ĐỨNG ĐẦU: Rank_Trưởng_phòng <= Rank_Tập_thể_phòng.',
    ],
    [
      'GIAI ĐOẠN 4:\nBAN HÀNH QUYẾT ĐỊNH & CÔNG KHAI',
      'Trước ngày 28 của kỳ đánh giá',
      '• Document Service tự động điền dữ liệu điểm số, xếp loại vào phôi Quyết định.\n• Trưởng ban Ký số chuyên dùng công vụ ban hành Quyết định chính thức.\n• Hệ thống tự động công khai kết quả trên Dashboard và gửi báo cáo lên Ban Thường vụ Tỉnh ủy.',
      '• MẪU 05: Quyết định công nhận kết quả đánh giá, xếp loại cán bộ CCVC.',
      'Khóa bất biến dữ liệu đánh giá kỳ (chuyển sang trạng thái EVALUATED, ghi vết kiểm toán Audit Trail chống sửa đổi).',
    ],
  ];

  children.push(createTable(kpiHeaders, kpiRows, [16, 14, 32, 18, 20]));

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));

  // SƠ ĐỒ 6: KIẾN TRÚC TRỤC LIÊN THÔNG QUỐC GIA (TABLE ARCHITECTURE)
  children.push(h3('f. Sơ đồ 6: Kiến trúc Trục Liên thông Dữ liệu Quốc gia & Xử lý Realtime'));
  children.push(
    p(
      'Mô hình kết nối đa tầng giữa hệ sinh thái phần mềm nội bộ Ban Tổ chức Tỉnh ủy với các trục liên thông số của tỉnh và quốc gia qua API Gateway Integration Hub:'
    )
  );

  const interopHeaders = ['Phân tầng Kiến trúc Liên thông', 'Hệ thống thành phần kết nối', 'Phương thức & Giao thức truyền thông', 'Cơ chế An toàn & Bảo mật', 'Chỉ tiêu Kỹ thuật & Độ trễ'];
  const interopRows = [
    [
      'TẦNG 1:\nHỆ THỐNG DỮ LIỆU NỀN TẢNG QUỐC GIA & TỈNH ĐẮK LẮK',
      '• CSDL Quốc gia về Cán bộ CCVC (Bộ Nội vụ) - Hồ sơ mẫu 2C\n• Trục Liên thông Văn bản Quốc gia (VXP) & Trục Tỉnh ủy\n• Nền tảng Sổ tay ĐV điện tử & CSDL Quản lý Đảng viên (Ban Tổ chức TW)\n• Cổng Dịch vụ công / Hệ thống giải quyết TTHC Tỉnh Đắk Lắk',
      'RESTful APIs, Webhook, SOAP/WSDL, Message Queue AMQP',
      'Chứng chỉ số SSL chuyên dùng cơ yếu, Mạng chuyên dùng CPNet, Xác thực mTLS hai chiều.',
      'Đồng bộ dữ liệu hai chiều; Chuẩn hóa cấu trúc danh mục theo QCVN 109:2017/BTTTT.',
    ],
    [
      'TẦNG 2:\nTRỤC TÍCH HỢP CHIA SẺ DỮ LIỆU (NDXP & LGSP)',
      '• Trục chia sẻ dữ liệu quốc gia (NDXP)\n• Trục LGSP Tỉnh Đắk Lắk (Enterprise Service Bus - ESB)',
      'Enterprise Service Bus (ESB), RESTful APIs, Secure Webhook',
      'Đường truyền mạng riêng ảo VPN IPsec chuyên dụng tỉnh Đắk Lắk; Quản lý Token truy cập OAuth 2.0.',
      'Bảo đảm tính sẵn sàng cao (High Availability 99.5%); Băng thông ưu tiên cho luồng văn bản khẩn.',
    ],
    [
      'TẦNG 3:\nINTEGRATION HUB - API GATEWAY (NestJS)',
      '• Cửa ngõ API Gateway daklak-workspace\n• Data Transformation Engine & Protocol Adapter\n• Rate Limiter & Circuit Breaker',
      'Reverse Proxy HTTP/JSON, gRPC Client với GatewayContextToken',
      'JWT Authentication & PBAC Policy Check; Mã hóa kênh truyền TLS 1.3; Kiểm soát chống tấn công DDoS/Brute-force.',
      'Thời gian phân giải định tuyến và xử lý gRPC nội bộ < 5ms; Tự động thử lại (Retry Policy) khi mạng gián đoạn.',
    ],
    [
      'TẦNG 4:\nCORE MICROSERVICES & REALTIME BROKER',
      '• user-service (Đồng bộ VTVL & Hồ sơ 2C)\n• hrm-service (Tính điểm KPI & Giao việc realtime)\n• document-service (Bắt văn bản chỉ đạo & Phôi Quyết định)\n• RabbitMQ Message Broker & WebSocket Server (Socket.IO)',
      'gRPC Binary Proto3 (nội bộ), AMQP 0-9-1 (Message Broker), WebSocket (hai chiều)',
      'Phân vùng mạng ứng dụng cô lập (Application Zone); RBAC/PBAC Tenant Scoping; Mã hóa dữ liệu lưu trữ AES-256.',
      'Bắn sự kiện bất đồng bộ qua RabbitMQ; Đẩy thông báo tức thời (Push Notification) lên màn hình cán bộ < 1 giây.',
    ],
  ];

  children.push(createTable(interopHeaders, interopRows, [20, 26, 18, 20, 16]));

  children.push(new Paragraph({ spacing: { before: 200, after: 100 } }));

  // ==========================================================================
  // CÂU 3: CẤP ĐỘ AN TOÀN THÔNG TIN & ĐỀ XUẤT GIẢI PHÁP THEO QUY ĐỊNH
  // ==========================================================================
  children.push(
    h1('CÂU 3: XÁC ĐỊNH CẤP ĐỘ AN TOÀN THÔNG TIN CỦA HỆ THỐNG PHẦN MỀM VÀ ĐỀ XUẤT CÁC GIẢI PHÁP BẢO ĐẢM AN TOÀN THÔNG TIN, AN NINH MẠNG, AN NINH DỮ LIỆU VÀ BẢO VỆ BÍ MẬT NHÀ NƯỚC THEO QUY ĐỊNH')
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
      'Hệ thống phần mềm Quản lý, đánh giá kết quả thực hiện nhiệm vụ bằng KPI/OKR của Ban Tổ chức Tỉnh ủy Đắk Lắk được xác định thuộc CẤP ĐỘ 3 (Hệ thống thông tin Cấp độ 3) theo quy định tại Nghị định số 85/2016/NĐ-CP (Điều 9), Nghị định số 331/2026/NĐ-CP (Điều 27, 28, 29, 30), Thông tư số 12/2022/TT-BTTTT và Tiêu chuẩn Quốc gia TCVN 11930:2017.\n\n(Trong trường hợp xét theo quy mô hẹp thuần túy nội bộ tỉnh là Cấp độ 2, thì toàn bộ các giải pháp kỹ thuật, phân vùng mạng và an ninh dữ liệu BẮT BUỘC PHẢI ÁP DỤNG TIÊU CHUẨN CẤP ĐỘ 3 đối với phân hệ quản lý hồ sơ cán bộ, tiêu chuẩn chính trị nội bộ và liên thông CSDL quốc gia).'
    )
  );

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
      'Quy định bắt buộc về các điều kiện bảo đảm an ninh mạng, thẩm định hồ sơ đề xuất cấp độ, kiểm tra an ninh mạng trước khi đưa vào vận hành, phương án kỹ thuật và phương án quản lý an toàn thông tin áp dụng cho các cơ quan nhà nước, tổ chức chính trị.'
    )
  );
  children.push(
    bullet(
      '• Luật Bảo vệ bí mật nhà nước năm 2018 & Quy định 348-QĐ/BTCTW:',
      'Quy định nghiêm ngặt về quản lý, bảo vệ thông tin phục vụ công tác cán bộ, tiêu chuẩn chính trị nội bộ và danh mục bí mật nhà nước trong ngành Tổ chức xây dựng Đảng.'
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
      'Hệ thống lưu trữ và xử lý hồ sơ nhân sự của hàng ngàn cán bộ, đảng viên; bao gồm dữ liệu đánh giá xếp loại thực chất, kết quả thẩm định năng lực, quy hoạch nguồn cán bộ lãnh đạo quản lý các cấp, dữ liệu xác minh tiêu chuẩn chính trị nội bộ Mức 3 (lịch sử chính trị và chính trị hiện nay). Đây là những thông tin nhạy cảm đặc biệt, có ảnh hưởng trực tiếp đến uy tín của tổ chức Đảng và công tác chuẩn bị nhân sự đại hội các cấp.'
    )
  );
  children.push(
    bullet(
      '• Về hậu quả nếu xảy ra sự cố an ninh mạng:',
      'Nếu hệ thống bị tấn công, làm ngưng trệ hoạt động hoặc bị lộ lọt dữ liệu đánh giá cán bộ, sẽ gây hậu quả phương hại nghiêm trọng đến công tác chỉ đạo điều hành của Tỉnh ủy, gây mất đoàn kết nội bộ, ảnh hưởng đến an ninh chính trị trên địa bàn tỉnh. Do đó, việc xếp hạng và bảo vệ hệ thống theo tiêu chuẩn Cấp độ 3 là hoàn toàn cần thiết và xác đáng.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 140, after: 60 } }));
  children.push(h2('2. Đề xuất các Giải pháp Kỹ thuật và Quản lý Toàn diện theo 03 Trụ cột'));
  children.push(
    p('Căn cứ quy định tại Điều 28, 29, 30 Nghị định 331/2026/NĐ-CP và TCVN 11930:2017, toàn bộ các giải pháp được thiết kế toàn diện theo 03 nhóm trụ cột A, B, C:')
  );

  // TRỤ CỘT A
  children.push(h3('A. Giải pháp bảo đảm an toàn thông tin & An ninh mạng (Quản lý và Kỹ thuật)'));
  children.push(
    bullet(
      '1. Quy chế và Quản lý (Điều 30 Khoản 3, Khoản 7):',
      'Ban Tổ chức Tỉnh ủy chủ trì, phối hợp với PA05 Công an tỉnh Đắk Lắk và Sở TTTT ban hành Quy chế bảo đảm an ninh mạng cơ quan trước khi phê duyệt hồ sơ đề xuất cấp độ; thành lập Tổ ứng cứu sự cố an ninh mạng nội bộ. Bắt buộc ký bản Cam kết bảo mật thông tin (NDA) đối với 100% nhân sự của đơn vị phát triển phần mềm, kiểm thử và đội ngũ quản trị viên hệ thống.'
    )
  );
  children.push(
    bullet(
      '2. An toàn ứng dụng và Kiểm soát truy cập (Điều 30 Khoản 4):',
      'Thiết lập kiểm soát truy cập PBAC nghiêm ngặt: Chuyên viên chỉ xem việc cá nhân; Lãnh đạo phòng duyệt trong phạm vi phòng chuyên môn phụ trách; Lãnh đạo Ban duyệt toàn cơ quan; Admin chỉ quản trị hạ tầng, tuyệt đối không được xem hay can thiệp vào điểm số KPI. Bắt buộc xác thực đa yếu tố (MFA / 2FA qua TOTP hoặc OTP công vụ) cho 100% tài khoản duyệt điểm và quản trị. Hệ thống tự động ghi nhật ký Audit Log bất biến (Append-only) chống chối bỏ lưu actorId, actionType, timestamp chính xác đến mili-giây, IP, oldValue và newValue.'
    )
  );
  children.push(
    bullet(
      '3. An toàn mạng và máy chủ (Điều 30 Khoản 4, Khoản 5):',
      'Hạ tầng hệ thống được phân tách thành 4 phân vùng mạng cô lập: Vùng DMZ (API Gateway, Portal), Vùng Ứng dụng Application Zone (App Microservices), Vùng Cơ sở dữ liệu Database Zone độc lập, và Vùng Quản trị Management Zone riêng biệt. Hệ thống được đặt sau Tường lửa thế hệ mới (Next-Gen Firewall) và WAF ngăn chặn DDoS, SQL Injection, XSS, Brute-Force. Kênh truyền bảo mật VPN nội bộ có xác thực chứng thư số; mã hóa 100% đường truyền bằng giao thức HTTPS chuẩn TLS 1.3.'
    )
  );
  children.push(
    bullet(
      '4. Đánh giá lỗ hổng và Kiểm tra an ninh mạng (Điều 27, Điều 28 Khoản 3):',
      'Tích hợp công cụ rà soát lỗ hổng mã nguồn tĩnh (SAST) và phân tích động (DAST) trong quy trình CI/CD. Trước khi vận hành chính thức, bắt buộc phải thuê đơn vị chức năng độc lập có thẩm quyền (hoặc phối hợp Cục An toàn thông tin, PA05 Công an tỉnh) thực hiện kiểm thử xâm nhập thực tế theo cả hai phương pháp Black box và Gray box; chỉ nghiệm thu khi đạt 100% chứng chỉ an toàn không còn lỗ hổng mức Critical và High.'
    )
  );

  // TRỤ CỘT B
  children.push(h3('B. An ninh dữ liệu và Bảo vệ dữ liệu cá nhân'));
  children.push(
    bullet(
      '1. Mã hóa dữ liệu lưu trữ (Data at Rest):',
      'Áp dụng thuật toán mã hóa tiêu chuẩn quân sự AES-256 (hoặc giải pháp cơ yếu do Ban Cơ yếu Chính phủ cấp phép) đối với toàn bộ dữ liệu định danh cán bộ (Số CCCD, số hiệu công chức, ngày sinh, chức vụ, mức lương, số điện thoại) và các thông tin nhạy cảm đặc biệt (kết quả nhận xét tiêu chuẩn chính trị, hồ sơ kỷ luật). Khóa mã hóa được quản lý tập trung trên hệ thống quản lý khóa độc lập (KMS / HashiCorp Vault), tách biệt hoàn toàn khỏi máy chủ CSDL.'
    )
  );
  children.push(
    bullet(
      '2. Sao lưu và phục hồi dữ liệu định kỳ 3-2-1 (Điều 28 Khoản 1, Điều 29 Khoản 2):',
      'Thiết lập cơ chế sao lưu tự động định kỳ hằng ngày vào 01h00 sáng. Tuân thủ nghiêm ngặt Nguyên tắc lưu trữ 3-2-1: (1) Duy trì ít nhất 3 bản sao dữ liệu; (2) Lưu trữ trên 2 loại phương tiện vật lý khác nhau (SAN/NAS nội bộ và Cloud an toàn); (3) Có ít nhất 1 bản sao lưu tách biệt ngoại tuyến hoàn toàn (Offline / Air-Gapped / Băng từ lưu trong két sắt chống cháy) không kết nối mạng để phòng ngừa tuyệt đối hiểm họa Ransomware. Định kỳ hằng quý diễn tập khôi phục dữ liệu để bảo đảm thời gian phục hồi dịch vụ (RTO < 2 giờ, RPO < 15 phút).'
    )
  );

  // TRỤ CỘT C
  children.push(h3('C. Bảo vệ Bí mật Nhà nước trên Môi trường số'));
  children.push(
    bullet(
      '1. Tách biệt và phân loại dữ liệu đầu vào:',
      'Nguyên tắc cấm nhập thông tin Mật trên môi trường mở: Nếu phần mềm triển khai trên môi trường máy chủ kết nối Internet, TUYỆT ĐỐI KHÔNG ĐƯỢC NHẬP bất kỳ tài liệu có độ Mật, Tối mật hoặc Tuyệt mật (Đề án nhân sự Đại hội, quy hoạch nguồn diện BTVTU quản lý, kết luận thẩm tra tiêu chuẩn chính trị nội bộ). Các công việc này chỉ được khai báo dưới dạng mã định danh nhiệm vụ (Task Code mã hóa) và tiêu đề chung. Trong trường hợp bắt buộc phải xử lý tài liệu Mật của Đảng: BẮT BUỘC triển khai một phiên bản phần mềm độc lập trên Hạ tầng mạng máy tính nội bộ cách ly vật lý hoàn toàn với Internet (Air-Gapped Network) hoặc Mạng cơ yếu Đảng, sử dụng giải pháp mã hóa của Ban Cơ yếu Chính phủ.'
    )
  );
  children.push(
    bullet(
      '2. Kiểm soát xuất báo cáo và Ký số chuyên dùng công vụ:',
      'Gắn mã định danh & Đóng dấu bản quyền chìm (Watermark): Mọi quyết định xếp loại và báo cáo tổng hợp (Mẫu 03, Mẫu 04, Mẫu 05) khi kết xuất ra file PDF/Word bắt buộc tự động gắn mã QR tra cứu định danh duy nhất và đóng dấu chìm Watermark mờ hiển thị: "Họ tên người tải, Chức vụ, Phòng ban, Địa chỉ IP, Thời gian kết xuất chính xác" nhằm ngăn ngừa và truy vết ngay lập tức nguồn phát tán nếu xảy ra tình trạng chụp ảnh tuồn tài liệu ra ngoài. Toàn bộ Quyết định xếp loại và Báo cáo gửi Ban Thường vụ Tỉnh ủy bắt buộc phải được Ký số chuyên dùng công vụ do Ban Cơ yếu Chính phủ cấp cho Lãnh đạo Ban trước khi phát hành chính thức.'
    )
  );

  children.push(new Paragraph({ spacing: { before: 200, after: 100 } }));

  // ==========================================================================
  // KHỐI KÝ TÊN XÁC NHẬN CỦA ỨNG VIÊN
  // ==========================================================================
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
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: 'Nơi nhận:\n',
                      font: 'Times New Roman',
                      size: 21,
                      bold: true,
                      italics: true,
                    }),
                    new TextRun({
                      text: '- Thường trực Tỉnh ủy Đắk Lắk (để b/c);\n- Hội đồng Kiểm tra Năng lực BTCTU;\n- 05 Phòng chuyên môn trực thuộc;\n- Lưu: VT, CNTT.',
                      font: 'Times New Roman',
                      size: 20,
                      italics: true,
                    }),
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
                  children: [
                    new TextRun({
                      text: 'ỨNG VIÊN KIẾN TRÚC SƯ XÂY DỰNG HỆ THỐNG\n',
                      font: 'Times New Roman',
                      size: 22,
                      bold: true,
                      color: COLOR_PRIMARY,
                    }),
                    new TextRun({
                      text: '(Đã ký xác nhận mã nguồn và cam kết triển khai)',
                      font: 'Times New Roman',
                      size: 20,
                      italics: true,
                      color: '595959',
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

  // Tạo tài liệu docx
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (72 * 20)
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
                    text: 'BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK — BÀI LÀM KIỂM TRA NĂNG LỰC HỆ THỐNG KPI/OKR',
                    font: 'Times New Roman',
                    size: 18, // 9pt
                    italics: true,
                    color: '7F7F7F',
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
  const examOutputPath = path.resolve('docs/BAI_LAM_KIEM_TRA_NANG_LUC_BTCTU.docx');
  console.log('Đang xuất file Word ra:', outputPath);

  const buffer = await Packer.toBuffer(doc);
  console.log('Đã nén tài liệu Word thành công! Dung lượng:', buffer.length, 'bytes');

  const targets = [
    { name: 'Báo cáo giải pháp', path: outputPath },
    { name: 'Bài làm kiểm tra năng lực', path: examOutputPath },
    { name: 'Bài làm kiểm tra năng lực (bản cập nhật mới)', path: path.resolve('docs/BAI_LAM_KIEM_TRA_NANG_LUC_BTCTU_CAP_NHAT.docx') },
    { name: 'Bản đối chiếu examplebtc', path: path.resolve('docs/examplebtc/BAO_CAO_GIAI_PHAP_KPI_OKR_BAN_TO_CHUC_TINH_UY_DAKLAK.docx') },
  ];

  for (const target of targets) {
    try {
      fs.writeFileSync(target.path, buffer);
      console.log(`[SUCCESS] Đã ghi ${target.name} tại: ${target.path}`);
    } catch (err) {
      if (err.code === 'EBUSY') {
        console.warn(`[WARNING] File đang bị khóa bởi ứng dụng khác: ${target.path}`);
      } else {
        console.error(`[ERROR] Lỗi khi ghi ${target.path}:`, err.message);
      }
    }
  }
}

generateReport().catch(err => {
  console.error('LỖI KHI XUẤT FILE:', err);
  process.exit(1);
});
