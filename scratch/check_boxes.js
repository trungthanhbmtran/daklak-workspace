const fs = require('fs');
const path = 'C:/Users/Admin/Desktop/daklak-workspace/docs/architecture/PERFORMANCE_EVALUATION.md';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  { search: /\[ \]\s*Gom mảng ID để gọi/, replace: '[x] Gom mảng ID để gọi' },
  { search: /\[ \]\s*Đối với update, sử dụng `Promise.all\(\)`/, replace: '[x] Đối với update, sử dụng `Promise.all()`' },
  { search: /\[ \]\s*Bổ sung tham số `depthLimit`/, replace: '[x] Bổ sung tham số `depthLimit`' },
  { search: /\[ \]\s*Tích hợp cơ chế Yield/, replace: '[x] Tích hợp cơ chế Yield' },
  { search: /\[ \]\s*Rà soát thủ công và xóa triệt để hàm `getStats`/, replace: '[x] Rà soát thủ công và xóa triệt để hàm `getStats`' },
  { search: /\[ \]\s*Thêm Compound Index `@@index\(\[isDeleted, status, dueDate\]\)`/, replace: '[x] Thêm Compound Index `@@index([isDeleted, status, dueDate])`' },
  { search: /\[ \]\s*Thêm Compound Index `@@index\(\[isDeleted, isIncoming, status\]\)`/, replace: '[x] Thêm Compound Index `@@index([isDeleted, isIncoming, status])`' },
];

let replaced = false;
for (const r of replacements) {
  if (r.search.test(content)) {
    content = content.replace(r.search, r.replace);
    replaced = true;
  }
}

if (replaced) {
  fs.writeFileSync(path, content, 'utf8');
  console.log('Checked off items in PERFORMANCE_EVALUATION.md');
} else {
  console.log('No items matched for checking off.');
}
