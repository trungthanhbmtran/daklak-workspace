const fs = require('fs');
const path = 'apps/workflow-service/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject serviceTask into govComplexTaskGraph nodes
const newNodesStr = `    { id: 'task_evaluate', type: 'user_task', position: { x: 1150, y: 250 }, data: { label: 'Nghiệm thu & Chấm KPI', targetStatus: 'WAITING_FOR_APPROVAL', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: "f1", name: "isApproved", action: "Đồng ý duyệt", type: "text" }, { id: "f2", name: "managerFeedback", action: "Phản hồi", type: "textarea" }]) } },
    { id: 'gateway_evaluate', type: 'exclusive_gateway', position: { x: 1450, y: 250 }, data: { label: 'Kết quả Nghiệm thu' } },
    { id: 'task_auto_kpi', type: 'serviceTask', position: { x: 1600, y: 250 }, data: { label: 'Tự động tính KPI', script: 'variables.kpiScore = (variables.isApproved === "true" || variables.isApproved === true) ? Math.floor(Math.random() * 20 + 80) : 0;' } },
    { id: 'end_done', type: 'end', position: { x: 1850, y: 250 }, data: { label: 'Hoàn thành', targetStatus: 'COMPLETED' } },`;

content = content.replace(
  /\{\s*id:\s*'task_evaluate'[\s\S]*?\{\s*id:\s*'end_done'[^}]+\}\s*\},\s*(?=\])/m,
  newNodesStr + "\n  "
);

// 2. Inject edges
const newEdgesStr = `    { id: 'e_gweval_reject', source: 'gateway_evaluate', target: 'task_process', type: 'custom', sourceHandle: 'false', action: 'REWORK', condition: 'variables.isApproved === false' },
    { id: 'e_gweval_kpi', source: 'gateway_evaluate', target: 'task_auto_kpi', type: 'custom', sourceHandle: 'true', action: 'APPROVE', condition: 'variables.isApproved === true' },
    { id: 'e_auto_done', source: 'task_auto_kpi', target: 'end_done', type: 'custom' },`;

content = content.replace(
  /\{\s*id:\s*'e_gweval_reject'[\s\S]*?\{\s*id:\s*'e_gweval_done'[^}]+\}\s*\},?\s*(?=\])/m,
  newEdgesStr + "\n  "
);

// 3. Inject ProcessInstance seeding
const seedLogic = `
      // 4. Seed Process Instance assigned to user (Phiên chạy tự động gán cho tôi)
      console.log('  -> Đang tạo phiên chạy (ProcessInstance) gán cho người dùng...');
      const defData = await (prisma as any).processDefinition.findUnique({ where: { code: 'TASK_PROCESSING_ID' } });
      if (defData) {
         const versionDataDB = await (prisma as any).processVersion.findFirst({ where: { definitionId: defData.id }, orderBy: { version: 'desc' } });
         if (versionDataDB) {
            const instance = await (prisma as any).processInstance.create({
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
            await (prisma as any).workflowTask.create({
               data: {
                  instanceId: instance.id,
                  nodeCode: 'task_evaluate',
                  title: 'Nghiệm thu & Chấm KPI',
                  status: 'PENDING',
                  assigneeId: 'admin' // Gán trực tiếp cho user đăng nhập hiện tại
               }
            });
            console.log('  -> Hoàn thành gán phiên chạy cho user [admin].');
         }
      }
      
      console.log('\\n🚀 Hoàn thành seed database!');`;

content = content.replace(
  /console\.log\('\\\\n.* HoAn thAnh seed database!'\);/g,
  seedLogic
);
content = content.replace( // Try another regex if encoding breaks
  /console\.log\('\\n.*Ho.{1,5}n th.{1,5}nh seed database!'\);/g,
  seedLogic
);

// Because of weird terminal char encodings in the regex target, let's just use string replace on a known safe substring:
content = content.replace(
  "      console.log('\\ndYZ% HoAn thAnh seed database!');",
  seedLogic
);

// Fallback replacement if the above fails
if (!content.includes("Đang tạo phiên chạy")) {
    content = content.replace(
        "      console.log('\\n🚀 Hoàn thành seed database!');",
        seedLogic
    );
}
// One more fallback, let's replace `} finally {` with the seedLogic + `} finally {`
if (!content.includes("Đang tạo phiên chạy")) {
    content = content.replace(
        "} finally {",
        seedLogic + "\n    } finally {"
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched seed successfully');
