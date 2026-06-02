const fs = require('fs');
const file = 'apps/user-service/prisma/seed.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/await prisma\.organizationUnit\.upsert\(\{\s*where: \{ code: 'H15\.5[1-6]' \},[\s\S]*?\}\);/g, '');

fs.writeFileSync(file, code);
console.log('Removed UBND XA models from seed.ts');
