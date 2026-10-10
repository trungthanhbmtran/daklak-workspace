const fs = require('fs');
const path = 'apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

const newTaskManagementType = `
  {
    code: 'TASK_MANAGEMENT',
    name: 'Quản lý công việc',
    description: 'Nghiệp vụ Quản lý công việc và giao việc',
    ownerService: 'hrm-service',
    validTriggers: ['Tạo công việc', 'Chuyển xử lý'],
    validActions: ['ACCEPT', 'COMPLETE', 'REWORK'],
    isActive: true,
  },`;

content = content.replace(
  'const processTypes = [',
  'const processTypes = [' + newTaskManagementType
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added TASK_MANAGEMENT ProcessType');
