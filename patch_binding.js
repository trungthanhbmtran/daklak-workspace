const fs = require('fs');
const path = 'apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

const bindingLogic = `
      // 3. Seed ProcessBindings
      console.log('\\n🔹 Seeding ProcessBindings...');
      const taskDef = await prisma.processDefinition.findUnique({ where: { code: 'TASK_PROCESSING_ID' } });
      const taskType = await prisma.processType.findUnique({ where: { code: 'TASK_MANAGEMENT' } });
      if (taskDef && taskType) {
        await prisma.processBinding.create({
          data: {
            processTypeId: taskType.id,
            definitionId: taskDef.id,
            trigger: 'ON_CREATE',
            status: 'ACTIVE',
            createdBy: 'admin'
          }
        });
        console.log('  ✅ Created binding between TASK_MANAGEMENT and TASK_PROCESSING_ID');
      }
`;

content = content.replace(
  "console.log('\\ndYZ% HoAn thAnh seed database!');",
  bindingLogic + "\n      console.log('\\n🚀 Hoàn thành seed database!');"
);
// Handle encoded versions just in case
content = content.replace(
  "console.log('\\ndYs? HoAn thAnh seed database!');",
  bindingLogic + "\n      console.log('\\n🚀 Hoàn thành seed database!');"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added binding logic');
