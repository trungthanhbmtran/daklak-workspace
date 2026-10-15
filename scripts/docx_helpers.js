/**
 * Script sinh file Word (.docx) Báo cáo Giải pháp Kỹ thuật Phần mềm Quản lý & Đánh giá KPI/OKR
 * Ban Tổ chức Tỉnh ủy Đắk Lắk
 * 
 * Bám sát 100% đề bài trong yeucau.md và yêu cầu người dùng:
 * - Trả lời trọn vẹn Câu 1, Câu 2, Câu 3.
 * - Nêu bật các điểm đột phá: Ứng dụng AI (khai báo, tạo nhanh việc lịch, giám sát chi tiết đánh giá hiệu quả),
 *   Liên thông hệ thống quốc gia lấy data xử lý việc realtime.
 * - Cung cấp đầy đủ các sơ đồ luồng, phân tích thiết kế hệ thống kèm hình ảnh nhúng trực tiếp.
 * - Câu 3 bám sát Điều 28, 29, 30 Nghị định 331/2026/NĐ-CP (Phần A, B, C).
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
  ImageRun,
  HeadingLevel,
} = require('docx');

// Helper định dạng màu sắc & border
const COLOR_PRIMARY = '003366'; // Xanh Navy đậm cơ quan nhà nước
const COLOR_SECONDARY = '1F497D'; // Slate Blue
const COLOR_ACCENT = 'B0C4DE'; // Light Steel Blue
const COLOR_TEXT = '262626'; // Text xám đậm dễ đọc
const COLOR_MUTED = '595959';
const COLOR_ROW_ALT = 'F4F7FA'; // Nền dòng chẵn bảng
const COLOR_CALLOUT_BG = 'F0F4F8'; // Nền callout box

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: COLOR_ACCENT };
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };

// Helper tạo đoạn văn thường
function p(text, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [
        new TextRun({
          text: String(text),
          font: 'Times New Roman',
          size: opts.size || 24, // 12pt
          bold: !!opts.bold,
          italics: !!opts.italics,
          color: opts.color || COLOR_TEXT,
        }),
      ];

  return new Paragraph({
    alignment: opts.alignment || AlignmentType.JUSTIFIED,
    spacing: {
      before: opts.spaceBefore !== undefined ? opts.spaceBefore : 60,
      after: opts.spaceAfter !== undefined ? opts.spaceAfter : 100,
      line: opts.lineSpacing !== undefined ? opts.lineSpacing : 280, // 1.25 line spacing
    },
    indent: opts.indent ? { left: opts.indent } : undefined,
    children: runs,
  });
}

// Helper Heading 1
function h1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.LEFT,
    spacing: { before: 300, after: 140 },
    children: [
      new TextRun({
        text: title,
        font: 'Times New Roman',
        size: 30, // 15pt
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

// Helper Heading 2
function h2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: title,
        font: 'Times New Roman',
        size: 26, // 13pt
        bold: true,
        color: COLOR_SECONDARY,
      }),
    ],
  });
}

// Helper Heading 3
function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: 'Times New Roman',
        size: 24, // 12pt
        bold: true,
        italics: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

// Helper Bullet list item
function bullet(boldPrefix, content) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text: boldPrefix + ' ',
        font: 'Times New Roman',
        size: 24,
        bold: true,
        color: COLOR_TEXT,
      }),
      new TextRun({
        text: content,
        font: 'Times New Roman',
        size: 24,
        color: COLOR_TEXT,
      }),
    ],
  });
}

// Helper tạo Callout Box (hộp ghi chú nhấn mạnh)
function callout(title, content) {
  const runs = [
    new TextRun({
      text: title + '\n',
      font: 'Times New Roman',
      size: 24,
      bold: true,
      color: COLOR_PRIMARY,
    }),
    new TextRun({
      text: content,
      font: 'Times New Roman',
      size: 23,
      italics: true,
      color: COLOR_TEXT,
    }),
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: noBorder,
              bottom: noBorder,
              right: noBorder,
              left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_PRIMARY },
            },
            shading: { fill: COLOR_CALLOUT_BG },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60, line: 260 },
                children: runs,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Helper tạo Bảng chuyên nghiệp
function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Dòng Tiêu đề (Header Row)
  const headerCells = headers.map((h, i) => {
    return new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
      shading: { fill: COLOR_SECONDARY },
      borders: {
        top: thinBorder,
        bottom: thinBorder,
        left: thinBorder,
        right: thinBorder,
      },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: h,
              font: 'Times New Roman',
              size: 22, // 11pt
              bold: true,
              color: 'FFFFFF',
            }),
          ],
        }),
      ],
    });
  });

  tableRows.push(new TableRow({ tableHeader: true, children: headerCells }));

  // Các dòng dữ liệu
  rows.forEach((row, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    const cells = row.map((c, colIdx) => {
      const isFirstCol = colIdx === 0;
      return new TableCell({
        width: colWidths[colIdx] ? { size: colWidths[colIdx], type: WidthType.PERCENTAGE } : undefined,
        shading: isAlt ? { fill: COLOR_ROW_ALT } : undefined,
        borders: {
          top: thinBorder,
          bottom: thinBorder,
          left: thinBorder,
          right: thinBorder,
        },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: String(c).split('\n').map((line, lineIdx) => {
          return new Paragraph({
            alignment: isFirstCol && row.length > 3 ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: { before: lineIdx === 0 ? 0 : 30, after: 30, line: 240 },
            children: [
              new TextRun({
                text: line,
                font: 'Times New Roman',
                size: 21,
                color: COLOR_TEXT,
              }),
            ],
          });
        }),
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

// Helper nhúng ảnh
function createImageParagraph(imagePath, caption, width = 600, height = 480) {
  if (!fs.existsSync(imagePath)) {
    return p(`[Không tìm thấy ảnh tại: ${imagePath}]`, { italics: true, color: 'FF0000' });
  }

  const imageBuffer = fs.readFileSync(imagePath);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 60 },
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: { width, height },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 180 },
      children: [
        new TextRun({
          text: caption,
          font: 'Times New Roman',
          size: 21, // 10.5pt
          bold: true,
          italics: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
  ];
}

console.log('Helpers initialized successfully.');

module.exports = {
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
};
