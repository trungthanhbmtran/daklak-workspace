const fs = require('fs');
const file = 'apps/user-service/prisma/seed.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove XA
code = code.replace(/\s*\{ code: 'UBND_XA', name: 'UBND Cấp Xã\/Phường', level: 3 \},/g, '');
code = code.replace(/\s*\{ code: 'HDND_XA', name: 'HĐND Cấp Xã', level: 3 \},/g, '');

// Remove from links types
code = code.replace(/'UBND_XA',\s*/g, '');
code = code.replace(/'HDND_XA',\s*/g, '');
code = code.replace(/,\s*'UBND_XA'/g, '');
code = code.replace(/,\s*'HDND_XA'/g, '');

code = code.replace(/const ubndXaTypeId = unitTypeMap\['UBND_XA'\]\.id;\s*/g, '');

fs.writeFileSync(file, code);
console.log('Removed XA from seed.ts');
