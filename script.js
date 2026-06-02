const fs = require('fs');
const file = 'apps/user-service/prisma/seed.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /{ code: 'PHONG_BAN_SO', name: 'Phòng chuyên môn cấp Sở', level: 3 },/g,
  `{ code: 'PHONG_BAN_SO', name: 'Phòng chuyên môn cấp Sở', level: 3 },\n    { code: 'PHONG_BAN_TRUNG_TAM', name: 'Phòng chuyên môn cấp Trung tâm', level: 4 },`
);

code = code.replace(
  /const links = \[\s*([\s\S]*?)\];/g,
  (match) => {
    return match + '\n\n  // Dynamically add PHONG_BAN_TRUNG_TAM to any link that supports PHONG_BAN_SO\n  for (const link of links) {\n    if (link.types.includes(\'PHONG_BAN_SO\') && !link.types.includes(\'PHONG_BAN_TRUNG_TAM\')) {\n      link.types.push(\'PHONG_BAN_TRUNG_TAM\');\n    }\n  }';
  }
);

const centerDepts = [
  'H15.07.01.01', 'H15.07.01.02', 
  'H15.07.04.01', 'H15.07.04.02', 'H15.07.04.03',
  'H15.07.02.01', 'H15.07.02.02', 'H15.07.02.03',
  'H15.07.03.01', 'H15.07.03.02', 'H15.07.03.03', 'H15.07.03.04', 'H15.07.03.05'
];

for (const codeStr of centerDepts) {
  const regex = new RegExp(`code: '${codeStr}',\\s*name: '([^']+)',\\s*typeCode: '([^']+)'`, 'g');
  code = code.replace(regex, `code: '${codeStr}',\n      name: '$1',\n      typeCode: 'PHONG_BAN_TRUNG_TAM'`);
}

fs.writeFileSync(file, code);
console.log('Done modifying seed.ts');
