const fs = require('fs');
const path = './apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

// Using regex to remove validationExpression fields
content = content.replace(/validationExpression:\s*(['"`]).*?\1,\s*/g, '');

fs.writeFileSync(path, content);
console.log('Validation expressions removed successfully.');
