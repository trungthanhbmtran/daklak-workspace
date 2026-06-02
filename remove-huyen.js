const fs = require('fs');
const file = 'apps/user-service/prisma/seed.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove unitTypesData items
code = code.replace(/\s*\{ code: 'UBND_HUYEN', name: 'UBND Cấp Huyện', level: 2 \},/g, '');
code = code.replace(/\s*\{ code: 'HDND_HUYEN', name: 'HĐND Cấp Huyện', level: 2 \},/g, '');
code = code.replace(/\s*\{[^}]*code: 'PHONG_BAN_HUYEN'[^}]*\},/g, '');

// Remove from links types
code = code.replace(/'UBND_HUYEN',\s*/g, '');
code = code.replace(/'HDND_HUYEN',\s*/g, '');
code = code.replace(/'PHONG_BAN_HUYEN',\s*/g, '');
code = code.replace(/,\s*'UBND_HUYEN'/g, '');
code = code.replace(/,\s*'HDND_HUYEN'/g, '');
code = code.replace(/,\s*'PHONG_BAN_HUYEN'/g, '');

// Fix dangling commas in types arrays if any (e.g. types: [ 'UBND_TINH', ] -> types: [ 'UBND_TINH' ])
// This is handled by prettier, but let's be careful.

// Remove const ubndHuyenTypeId and phongTypeId
code = code.replace(/const ubndHuyenTypeId = unitTypeMap\['UBND_HUYEN'\]\.id;\s*/g, '');
code = code.replace(/const phongTypeId = unitTypeMap\['PHONG_BAN_HUYEN'\]\.id;/g, `const phongTypeId = unitTypeMap['PHONG_BAN_SO'].id; // fallback changed from HUYEN to SO`);

fs.writeFileSync(file, code);
console.log('Removed HUYEN from seed.ts');
