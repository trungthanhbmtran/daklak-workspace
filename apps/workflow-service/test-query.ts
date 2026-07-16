const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.workflowDefinition.findFirst({
  where: { code: 'TASK_PROCESSING_DEFAULT' },
  include: { nodes: true }
}).then((res: any) => {
  console.log(JSON.stringify(res.nodes, null, 2));
  p.$disconnect();
});
