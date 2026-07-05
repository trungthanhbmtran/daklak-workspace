const fs = require('fs');
const path = './apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/(type:\s*'user_task'[\s\S]*?data:\s*\{)(\s*)/g, '$1 allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, ');

fs.writeFileSync(path, content);
console.log('Seed file updated successfully.');
