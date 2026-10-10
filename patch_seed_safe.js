const fs = require('fs');
const path = 'apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

const additionalSeed = `
async function seedCustomInstance(prisma) {
  console.log('  -> Đang tạo phiên chạy (ProcessInstance) gán cho người dùng...');
  const defData = await prisma.processDefinition.findUnique({ where: { code: 'TASK_PROCESSING_ID' } });
  if (defData) {
     const versionDataDB = await prisma.processVersion.findFirst({ where: { definitionId: defData.id }, orderBy: { version: 'desc' } });
     if (versionDataDB) {
        
        // Cập nhật graph thêm serviceTask (Rule Engine Script)
        const graph = versionDataDB.graph;
        
        // Xóa end node cũ nếu có
        const oldEndIndex = graph.nodes.findIndex(n => n.id === 'end_done');
        const endNode = oldEndIndex > -1 ? graph.nodes.splice(oldEndIndex, 1)[0] : { id: 'end_done', type: 'end', position: { x: 1850, y: 250 }, data: { label: 'Hoàn thành', targetStatus: 'COMPLETED' } };
        
        // Sửa X của end node
        endNode.position.x = 2050;
        
        // Thêm serviceTask
        graph.nodes.push({ id: 'task_auto_kpi', type: 'serviceTask', position: { x: 1750, y: 250 }, data: { label: 'Tự động tính KPI', script: 'variables.kpiScore = (variables.isApproved === "true" || variables.isApproved === true) ? Math.floor(Math.random() * 20 + 80) : 0;', targetStatus: 'WAITING_FOR_APPROVAL' } });
        graph.nodes.push(endNode);

        // Cập nhật edges
        const oldEdgeIndex = graph.edges.findIndex(e => e.id === 'e_gweval_done');
        if (oldEdgeIndex > -1) {
           graph.edges[oldEdgeIndex].target = 'task_auto_kpi';
        }
        graph.edges.push({ id: 'e_auto_done', source: 'task_auto_kpi', target: 'end_done', type: 'custom' });
        
        await prisma.processVersion.update({
           where: { id: versionDataDB.id },
           data: { graph }
        });

        // Xóa instance cũ để seed lại
        await prisma.processInstance.deleteMany({ where: { startedBy: 'admin' } });

        // Tạo process instance mới
        const instance = await prisma.processInstance.create({
           data: {
              definitionId: defData.id,
              versionId: versionDataDB.id,
              organizationId: 'DEFAULT_ORG',
              status: 'IN_PROGRESS',
              currentNodeCode: 'task_evaluate',
              variables: { taskName: 'Công việc chạy thử nghiệm KPI Tự động', isAccepted: true },
              startedBy: 'admin',
              stateVersion: 1
           }
        });
        
        await prisma.workflowTask.create({
           data: {
              instanceId: instance.id,
              nodeCode: 'task_evaluate',
              title: 'Nghiệm thu & Chấm KPI',
              status: 'PENDING',
              assigneeId: 'admin'
           }
        });
        console.log('  -> Hoàn thành gán phiên chạy cho user [admin].');
     }
  }
}
`;

content = content.replace(
  '  } finally {',
  '    await seedCustomInstance(prisma);\n  } finally {'
);

content += '\n' + additionalSeed;

fs.writeFileSync(path, content, 'utf8');
console.log('Patched safely');
