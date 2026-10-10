const fs = require('fs');
const path = 'apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

const bindingLogic = `
  console.log('  -> Đang tạo ProcessBinding cho TASK_MANAGEMENT...');
  const taskType = await prisma.processType.findUnique({ where: { code: 'TASK_MANAGEMENT' } });
  if (defData && taskType) {
    // Clear old bindings
    await prisma.processBinding.deleteMany({
      where: { processTypeId: taskType.id }
    });
    // Create new binding
    await prisma.processBinding.create({
      data: {
        processTypeId: taskType.id,
        definitionId: defData.id,
        trigger: 'ON_CREATE',
        status: 'ACTIVE',
        createdBy: 'admin'
      }
    });
    console.log('  -> Đã tạo ProcessBinding thành công!');
  }
`;

content = content.replace(
  "console.log('  -> Hoàn thành gán phiên chạy cho user [admin].');",
  "console.log('  -> Hoàn thành gán phiên chạy cho user [admin].');\n" + bindingLogic
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched safely');
