const fs = require('fs');
const file = 'apps/admin_khcn/features/system-admin/organization/components/OrganizationUnitEdit.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/'Huyện ủy',\s*/g, '');
code = code.replace(/'Phòng, Ban chuyên môn cấp Huyện',\s*/g, '');

fs.writeFileSync(file, code);
console.log('Removed Huyện from frontend Edit form');
