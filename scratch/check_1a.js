const fs = require('fs');
const path = 'C:/Users/Admin/Desktop/daklak-workspace/docs/architecture/PERFORMANCE_EVALUATION.md';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\[ \]\s*\*\*Tối ưu 1A:\*\*/g,
  '[x] **Tối ưu 1A:**'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Checked off Tối ưu 1A in PERFORMANCE_EVALUATION.md');
