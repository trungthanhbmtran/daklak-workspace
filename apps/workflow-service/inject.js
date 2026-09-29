const fs = require('fs');
let c = fs.readFileSync('prisma/seed.ts', 'utf8');

const target = 'const processDefinitions = [';
const insert = `
const unexpectedTaskGraph = {
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 50, y: 250 }, data: { label: 'Bắt đầu' } },
    { id: 'task_propose', type: 'user_task', position: { x: 250, y: 250 }, data: { label: 'Đề xuất việc phát sinh (Nhân viên)', assignments: [{ unitScope: 'SELF' }], formSchema: JSON.stringify([{ id: 'f1', name: 'taskName', label: 'Tên công việc', type: 'text' }, { id: 'f2', name: 'description', label: 'Mô tả', type: 'textarea' }, { id: 'f3', name: 'dueDate', label: 'Đề xuất hạn chót', type: 'date' }]) } },
    { id: 'task_approve_proposal', type: 'user_task', position: { x: 550, y: 250 }, data: { label: 'Phê duyệt đề xuất (Lãnh đạo)', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: 'f1', name: 'isApproved', label: 'Đồng ý', type: 'text' }, { id: 'f2', name: 'reason', label: 'Lý do', type: 'textarea' }]) } },
    { id: 'gateway_proposal', type: 'exclusive_gateway', position: { x: 850, y: 250 }, data: { label: 'Quyết định' } },
    { id: 'end_rejected', type: 'end', position: { x: 850, y: 450 }, data: { label: 'Bị từ chối' } },
    { id: 'task_process', type: 'user_task', position: { x: 1150, y: 250 }, data: { label: 'Xử lý & Báo cáo (Nhân viên)', assignments: [{ unitScope: 'SELF' }] } },
    { id: 'task_evaluate', type: 'user_task', position: { x: 1450, y: 250 }, data: { label: 'Nghiệm thu (Lãnh đạo)', assignments: [{ unitScope: 'SAME_UNIT', rankOperator: 'exact', rankValue: 'minRank' }], formSchema: JSON.stringify([{ id: 'f1', name: 'isApproved', label: 'Đồng ý duyệt', type: 'text' }, { id: 'f2', name: 'kpiScore', label: 'Điểm KPI', type: 'number' }, { id: 'f3', name: 'managerFeedback', label: 'Phản hồi', type: 'textarea' }]) } },
    { id: 'gateway_evaluate', type: 'exclusive_gateway', position: { x: 1750, y: 250 }, data: { label: 'Kết quả Nghiệm thu' } },
    { id: 'end_done', type: 'end', position: { x: 2050, y: 250 }, data: { label: 'Hoàn thành' } },
  ],
  edges: [
    { id: 'e_start_propose', source: 'start_1', target: 'task_propose', type: 'custom' },
    { id: 'e_propose_approve', source: 'task_propose', target: 'task_approve_proposal', type: 'custom', label: 'SUBMIT' },
    { id: 'e_approve_gw', source: 'task_approve_proposal', target: 'gateway_proposal', type: 'custom', label: 'REVIEW' },
    { id: 'e_gw_reject', source: 'gateway_proposal', target: 'end_rejected', type: 'custom', sourceHandle: 'false', label: 'REJECT', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'false', logicalOp: '&&' }], expression: 'variables.isApproved === false' } },
    { id: 'e_gw_process', source: 'gateway_proposal', target: 'task_process', type: 'custom', sourceHandle: 'true', label: 'APPROVE', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'true', logicalOp: '&&' }], expression: 'variables.isApproved === true' } },
    { id: 'e_process_eval', source: 'task_process', target: 'task_evaluate', type: 'custom', label: 'SUBMIT_REPORT' },
    { id: 'e_eval_gweval', source: 'task_evaluate', target: 'gateway_evaluate', type: 'custom', label: 'EVALUATE' },
    { id: 'e_gweval_rework', source: 'gateway_evaluate', target: 'task_process', type: 'custom', sourceHandle: 'false', label: 'REWORK', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'false', logicalOp: '&&' }], expression: 'variables.isApproved === false' } },
    { id: 'e_gweval_done', source: 'gateway_evaluate', target: 'end_done', type: 'custom', sourceHandle: 'true', label: 'APPROVE', data: { conditions: [{ field: 'variables.isApproved', operator: '===', value: 'true', logicalOp: '&&' }], expression: 'variables.isApproved === true' } },
  ]
};

const processDefinitions = [
  {
    code: 'UNEXPECTED_TASK_PROCESSING',
    name: 'Quy trình Duyệt việc Phát sinh (Nhân viên tự tạo)',
    description: 'Quy trình để nhân viên tự đề xuất công việc, lãnh đạo duyệt để đưa vào kế hoạch, sau đó nhân viên thực hiện và lãnh đạo nghiệm thu cuối cùng.',
    isActive: true,
    version: {
      version: 1,
      status: 'PUBLISHED',
      graph: unexpectedTaskGraph,
    },
  },
`;

if (c.indexOf('UNEXPECTED_TASK_PROCESSING') === -1) {
  c = c.replace(target, insert);
  fs.writeFileSync('prisma/seed.ts', c);
  console.log('Injected successfully');
} else {
  console.log('Already injected');
}
