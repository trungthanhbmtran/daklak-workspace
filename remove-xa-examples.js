const fs = require('fs');
const file = 'apps/user-service/prisma/seed.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove the lines defining Thêm ví dụ UBND XÃ and all the associated code blocks
code = code.replace(/\/\/ Thêm ví dụ UBND XÃ[\s\S]*?\/\/ 10\. Các phòng\/xã còn lại/g, '// 10. Các phòng/xã còn lại');

fs.writeFileSync(file, code);
console.log('Removed UBND XA examples from seed.ts');
