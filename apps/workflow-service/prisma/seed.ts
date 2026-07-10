import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  console.log('Seeding Workflow definition for Task Processing...');


  const basePermissions = {
    CHAT: ['PARTICIPANT'],
    MONITOR: ['PARTICIPANT', 'ADMIN', 'ROLE:TASK:APPROVE', 'ROLE:TASK:*', 'ROLE:TASK:MANAGE'],
    EDIT: ['OWNER', 'DEPT_LEADER', 'ROLE:TASK:EDIT', 'ROLE:TASK:*'],
    DELETE: ['OWNER', 'ROLE:TASK:DELETE', 'ROLE:TASK:*'],
  };

  const fullPermissions = {
    ...basePermissions,
    ADD_SUBTASK: ['OWNER', 'ASSIGNEE', 'ROLE:TASK:EDIT', 'ROLE:TASK:EXECUTE', 'ROLE:TASK:*'],
    COORDINATE: ['OWNER', 'ASSIGNEE'],
  };

  const taskWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 150 }, data: { label: 'Bắt đầu' } },
      {
        id: 'node_plan_assignment',
        type: 'user_task',
        position: { x: 250, y: 150 },
        data: { 
          validationExpression: 'return false;',
          permissions: {
            ...basePermissions,
            PLAN_ASSIGNMENT: ['OWNER', 'DEPT_LEADER', 'ROLE:TASK:MANAGE', 'ROLE:TASK:*']
          },
          label: 'Phương án phân công', description: 'Lãnh đạo xác định định biên và cơ cấu phòng ban chịu trách nhiệm', actionName: 'PLAN_ASSIGNMENT', sendNotification: false, assignmentStrategy: 'BY_DEPARTMENT', targetStatus: 'TODO' 
        }
      },
      {
        id: 'node_assign',
        type: 'user_task',
        position: { x: 500, y: 150 },
        data: { 
          validationExpression: 'return false;',
          permissions: {
            ...fullPermissions,
            ASSIGN: ['OWNER', 'DEPT_LEADER', 'ROLE:TASK:MANAGE', 'ROLE:TASK:*']
          },
          label: 'Chính thức Giao việc', description: 'Lãnh đạo/Quản lý thực hiện giao việc', actionName: 'ASSIGN', sendNotification: true, assignmentStrategy: 'ANY', targetStatus: 'TODO' 
        }
      },
      { id: 'gw_split', type: 'parallel_gateway', position: { x: 750, y: 150 }, data: { label: 'Tách luồng' } },
      {
        id: 'node_in_progress',
        type: 'user_task',
        position: { x: 1000, y: 150 },
        data: { 
          validationExpression: 'return false;',
          permissions: {
            ...fullPermissions,
            IN_PROGRESS: ['ASSIGNEE', 'ROLE:TASK:MANAGE', 'ROLE:TASK:*']
          },
          label: 'Tiếp nhận & Thực hiện', targetStatus: 'IN_PROGRESS', description: 'Nhân viên thụ lý và thực hiện công việc chính, bao gồm trao đổi chat', actionName: 'IN_PROGRESS', sendNotification: true, assignmentStrategy: 'ANY' 
        }
      },
      {
        id: 'node_monitor',
        type: 'user_task',
        position: { x: 1000, y: 300 },
        data: { 
          validationExpression: 'return false;',
          permissions: {
            ...fullPermissions,
          },
          label: 'Lãnh đạo theo dõi', description: 'Lãnh đạo giám sát tiến độ công việc', actionName: 'MONITOR', sendNotification: false, assignmentStrategy: 'DIRECT_MANAGER', targetStatus: 'IN_PROGRESS' 
        }
      },
      { id: 'gw_join', type: 'parallel_gateway', position: { x: 1250, y: 150 }, data: { label: 'Gộp luồng' } },
      {
        id: 'node_report',
        type: 'user_task',
        position: { x: 1500, y: 150 },
        data: { 
          validationExpression: `
            if (actionName === 'DONE' || actionName === 'COMPLETE') return (typeof isAssignee !== 'undefined' ? isAssignee : false) && !(typeof hasChildren !== 'undefined' ? hasChildren : false) && userRoles.includes('TASK:EXECUTE');
            return false;
          `,
          permissions: {
            ...fullPermissions,
            COMPLETE: ['ROLE:TASK:MANAGE', 'ROLE:TASK:*'],
            DONE: ['ROLE:TASK:MANAGE', 'ROLE:TASK:*']
          },
          label: 'Tổng hợp kết quả', targetStatus: 'PENDING_APPROVAL', autoProgress: 100, description: 'Nhân viên báo cáo kết quả hoàn thành', actionName: 'COMPLETE', sendNotification: true, assignmentStrategy: 'BY_DEPARTMENT', notification: { title: 'Yêu cầu nghiệm thu công việc', template: 'Nhân sự đã báo cáo hoàn thành công việc. Vui lòng kiểm tra và nghiệm thu.', recipientExpression: '[supervisorCode, assignerCode, creatorEmployeeCode]' } 
        }
      },
      {
        id: 'node_approve',
        type: 'user_task',
        position: { x: 1750, y: 150 },
        data: { 
          validationExpression: 'return false;',
          permissions: {
            ...fullPermissions,
            APPROVE: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ROLE:TASK:MANAGE', 'ROLE:TASK:*'],
            RETURN: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ROLE:TASK:MANAGE', 'ROLE:TASK:*'],
            RETURNED: ['SUPERVISOR', 'DEPT_LEADER', 'OWNER', 'ROLE:TASK:MANAGE', 'ROLE:TASK:*']
          },
          label: 'Nghiệm thu / Trả lại', description: 'Lãnh đạo phê duyệt hoặc trả lại kết quả', actionName: 'APPROVE', sendNotification: true, assignmentStrategy: 'DIRECT_MANAGER' 
        }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 2000, y: 150 }, data: { label: 'Quyết định' } },
      { id: 'node_end', type: 'end', position: { x: 2250, y: 150 }, data: { label: 'Kết thúc', targetStatus: 'DONE', sendNotification: true, notification: { title: 'Công việc đã được nghiệm thu', template: 'Công việc của bạn đã được duyệt hoàn thành.', recipientExpression: '[assigneeCode]' } } }
    ],
    edges: [
      { id: 'edge_start', source: 'node_start', target: 'node_plan_assignment', type: 'smoothstep', animated: true },
      { id: 'edge_plan_assign', source: 'node_plan_assignment', target: 'node_assign', type: 'smoothstep', animated: true },
      { id: 'edge_assign_gw', source: 'node_assign', target: 'gw_split', type: 'smoothstep', animated: true },
      { id: 'edge_gw_main', source: 'gw_split', target: 'node_in_progress', type: 'smoothstep', animated: true, label: 'Thực hiện/Chat' },
      { id: 'edge_gw_monitor', source: 'gw_split', target: 'node_monitor', type: 'smoothstep', animated: true, label: 'Theo dõi' },
      { id: 'edge_progress_gw', source: 'node_in_progress', target: 'gw_join', type: 'smoothstep', animated: true },
      { id: 'edge_monitor_instruct', source: 'node_monitor', target: 'node_in_progress', type: 'smoothstep', animated: true, label: 'Chỉ đạo' },
      { id: 'edge_gw_report', source: 'gw_join', target: 'node_report', type: 'smoothstep', animated: true },
      { id: 'edge_report_approve', source: 'node_report', target: 'node_approve', type: 'smoothstep', animated: true },
      { id: 'edge_approve_gw', source: 'node_approve', target: 'gw_approve', type: 'smoothstep', animated: true },
      { id: 'edge_gw_end', source: 'gw_approve', target: 'node_end', type: 'smoothstep', animated: true, label: 'APPROVED' },
      { id: 'edge_gw_return', source: 'gw_approve', target: 'node_in_progress', type: 'smoothstep', animated: true, label: 'REJECTED', data: { sideEffects: ['RETURN_TASK'] } }
    ],
  };

  const docTransferWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 150 }, data: { label: 'Bắt đầu' } },
      {
        id: 'node_receive',
        type: 'user_task',
        position: { x: 250, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Tiếp nhận & Vào sổ', description: 'Văn thư tiếp nhận văn bản', actionName: 'RECEIVE', sendNotification: false, assignmentStrategy: 'ANY', targetStatus: 'TODO' }
      },
      {
        id: 'node_route',
        type: 'user_task',
        position: { x: 500, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Lãnh đạo Bút phê', description: 'Lãnh đạo cơ quan điều chuyển văn bản', actionName: 'ROUTE', sendNotification: true, assignmentStrategy: 'DIRECT_MANAGER', notification: { title: 'Có văn bản cần phê duyệt', template: 'Văn bản "{{taskTitle}}" đang chờ ý kiến chỉ đạo của bạn.', recipientExpression: '[supervisorCode]' } }
      },
      { id: 'gw_route', type: 'exclusive_gateway', position: { x: 750, y: 150 }, data: { label: 'Điều chuyển' } },
      {
        id: 'node_assign_staff',
        type: 'user_task',
        position: { x: 1000, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Trưởng phòng phân công', description: 'Lãnh đạo phòng ban giao việc cho chuyên viên', actionName: 'ASSIGN_STAFF', sendNotification: true, assignmentStrategy: 'BY_DEPARTMENT', notification: { title: 'Có văn bản cần phân công', template: 'Đã có chỉ đạo cho văn bản "{{taskTitle}}". Vui lòng phân công chuyên viên xử lý.', recipientExpression: '[assigneeCode]' } }
      },
      {
        id: 'node_process',
        type: 'user_task',
        position: { x: 1250, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Chuyên viên xử lý', targetStatus: 'IN_PROGRESS', description: 'Chuyên viên thụ lý dự thảo phản hồi', actionName: 'PROCESS', sendNotification: true, assignmentStrategy: 'ANY', notification: { title: 'Bạn được giao xử lý văn bản', template: 'Bạn vừa được phân công thụ lý văn bản "{{taskTitle}}".', recipientExpression: '[assigneeCode]' } }
      },
      {
        id: 'node_approve',
        type: 'user_task',
        position: { x: 1500, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Duyệt kết quả', targetStatus: 'PENDING_APPROVAL', autoProgress: 100, description: 'Lãnh đạo duyệt dự thảo', actionName: 'APPROVE', sendNotification: true, assignmentStrategy: 'DIRECT_MANAGER', notification: { title: 'Trình duyệt kết quả xử lý', template: 'Chuyên viên đã hoàn thành xử lý văn bản "{{taskTitle}}". Vui lòng kiểm tra.', recipientExpression: '[supervisorCode, assignerCode]' } }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 1750, y: 150 }, data: { label: 'Quyết định' } },
      {
        id: 'node_issue',
        type: 'user_task',
        position: { x: 2000, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Ban hành / Lưu trữ', description: 'Văn thư ban hành văn bản đi hoặc lưu trữ', actionName: 'ISSUE', sendNotification: true, assignmentStrategy: 'ANY', notification: { title: 'Văn bản đã được duyệt', template: 'Văn bản "{{taskTitle}}" đã được duyệt và sẵn sàng để ban hành.', recipientExpression: '[creatorEmployeeCode]' } }
      },
      { id: 'node_end', type: 'end', position: { x: 2250, y: 150 }, data: { label: 'Kết thúc', targetStatus: 'DONE', sendNotification: true, notification: { title: 'Văn bản đã ban hành', template: 'Quá trình xử lý văn bản "{{taskTitle}}" đã hoàn tất.', recipientExpression: '[assigneeCode, assignerCode]' } } }
    ],
    edges: [
      { id: 'edge_start', source: 'node_start', target: 'node_receive', type: 'smoothstep', animated: true },
      { id: 'edge_recv_route', source: 'node_receive', target: 'node_route', type: 'smoothstep', animated: true },
      { id: 'edge_route_gw', source: 'node_route', target: 'gw_route', type: 'smoothstep', animated: true },
      { id: 'edge_gw_assign', source: 'gw_route', target: 'node_assign_staff', type: 'smoothstep', animated: true, label: 'Giao Phòng ban' },
      { id: 'edge_gw_issue', source: 'gw_route', target: 'node_issue', type: 'smoothstep', animated: true, label: 'Lưu trữ biết' }, // Lãnh đạo chỉ đạo lưu trữ không cần xử lý
      { id: 'edge_assign_process', source: 'node_assign_staff', target: 'node_process', type: 'smoothstep', animated: true },
      { id: 'edge_process_approve', source: 'node_process', target: 'node_approve', type: 'smoothstep', animated: true },
      { id: 'edge_approve_gw', source: 'node_approve', target: 'gw_approve', type: 'smoothstep', animated: true },
      { id: 'edge_gw_end_issue', source: 'gw_approve', target: 'node_issue', type: 'smoothstep', animated: true, label: 'APPROVED' },
      { id: 'edge_gw_return', source: 'gw_approve', target: 'node_process', type: 'smoothstep', animated: true, label: 'REJECTED', data: { sideEffects: ['RETURN_TASK'] } },
      { id: 'edge_issue_end', source: 'node_issue', target: 'node_end', type: 'smoothstep', animated: true }
    ],
  };

  const articleWorkflowDef = {
    nodes: [
      { id: 'node_start', type: 'start', position: { x: 50, y: 150 }, data: { label: 'Bắt đầu' } },
      {
        id: 'node_draft',
        type: 'user_task',
        position: { x: 250, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Soạn thảo', description: 'Tác giả soạn thảo bản thảo bài viết', actionName: 'SUBMIT_DRAFT', sendNotification: true, assignmentStrategy: 'ANY', targetStatus: 'IN_PROGRESS', notification: { title: 'Yêu cầu viết bài', template: 'Bạn được phân công soạn thảo bài viết "{{taskTitle}}".', recipientExpression: '[assigneeCode]' } }
      },
      {
        id: 'node_edit',
        type: 'user_task',
        position: { x: 500, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Biên tập', description: 'Biên tập viên chỉnh sửa nội dung bài viết', actionName: 'EDIT_ARTICLE', sendNotification: true, assignmentStrategy: 'BY_DEPARTMENT', targetStatus: 'REVIEWING', notification: { title: 'Có bài viết chờ biên tập', template: 'Bài viết "{{taskTitle}}" vừa được nộp và đang chờ bạn biên tập.', recipientExpression: '[supervisorCode, assignerCode]' } }
      },
      { id: 'gw_edit', type: 'exclusive_gateway', position: { x: 750, y: 150 }, data: { label: 'Đạt yêu cầu?' } },
      {
        id: 'node_approve',
        type: 'user_task',
        position: { x: 1000, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Lãnh đạo duyệt', targetStatus: 'PENDING_APPROVAL', autoProgress: 100, description: 'Tổng biên tập phê duyệt bài viết', actionName: 'APPROVE', sendNotification: true, assignmentStrategy: 'DIRECT_MANAGER', notification: { title: 'Có bài viết chờ phê duyệt', template: 'Bài viết "{{taskTitle}}" đã được biên tập và cần sự phê duyệt của bạn.', recipientExpression: '[creatorEmployeeCode]' } }
      },
      { id: 'gw_approve', type: 'exclusive_gateway', position: { x: 1250, y: 150 }, data: { label: 'Quyết định' } },
      {
        id: 'node_publish',
        type: 'user_task',
        position: { x: 1500, y: 150 },
        data: { allowChat: true, allowAddSubtask: true, allowCoordinate: true, allowEdit: true, allowDelete: true, label: 'Xuất bản', description: 'Xuất bản bài viết lên cổng thông tin', actionName: 'PUBLISH', sendNotification: true, assignmentStrategy: 'ANY', notification: { title: 'Yêu cầu xuất bản bài viết', template: 'Bài viết "{{taskTitle}}" đã được duyệt và sẵn sàng để xuất bản.', recipientExpression: '[assigneeCode]' } }
      },
      { id: 'node_end', type: 'end', position: { x: 1750, y: 150 }, data: { label: 'Kết thúc', targetStatus: 'DONE', sendNotification: true, notification: { title: 'Bài viết đã xuất bản', template: 'Quá trình biên tập bài viết "{{taskTitle}}" đã hoàn tất.', recipientExpression: '[assignerCode, creatorEmployeeCode]' } } }
    ],
    edges: [
      { id: 'edge_start', source: 'node_start', target: 'node_draft', type: 'smoothstep', animated: true },
      { id: 'edge_draft_edit', source: 'node_draft', target: 'node_edit', type: 'smoothstep', animated: true },
      { id: 'edge_edit_gw', source: 'node_edit', target: 'gw_edit', type: 'smoothstep', animated: true },
      { id: 'edge_gw_approve', source: 'gw_edit', target: 'node_approve', type: 'smoothstep', animated: true, label: 'APPROVED' },
      { id: 'edge_gw_return_draft', source: 'gw_edit', target: 'node_draft', type: 'smoothstep', animated: true, label: 'REJECTED', data: { sideEffects: ['RETURN_TASK'] } },
      { id: 'edge_approve_gw', source: 'node_approve', target: 'gw_approve', type: 'smoothstep', animated: true },
      { id: 'edge_gw_publish', source: 'gw_approve', target: 'node_publish', type: 'smoothstep', animated: true, label: 'APPROVED' },
      { id: 'edge_gw_return_edit', source: 'gw_approve', target: 'node_edit', type: 'smoothstep', animated: true, label: 'REJECTED', data: { sideEffects: ['RETURN_TASK'] } },
      { id: 'edge_publish_end', source: 'node_publish', target: 'node_end', type: 'smoothstep', animated: true }
    ],
  };

  async function seedWorkflow(code: string, name: string, description: string, definition: any) {
    // Delete existing instances to avoid relation conflicts
    await prisma.workflowInstance.deleteMany({ where: { workflow: { code } } });
    await prisma.workflowDefinition.deleteMany({ where: { code } });

    await prisma.workflowDefinition.create({
      data: {
        code,
        name,
        description,
        version: 1,
        status: 'Published',
        nodes: {
          create: definition.nodes.map((n: any) => ({
            id: `${code}_${n.id}`,
            nodeKey: n.id,
            type: n.type,
            name: n.data?.label || n.id,
            x: n.position?.x || 0,
            y: n.position?.y || 0,
            properties: n.data || {}
          }))
        },
        edges: {
          create: definition.edges.map((e: any) => ({
            sourceNodeId: `${code}_${e.source}`,
            targetNodeId: `${code}_${e.target}`,
            condition: e.data?.expression || e.label || ''
          }))
        }
      }
    });
  }


  await seedWorkflow(
    'TASK_PROCESSING_ID',
    'Quy trình xử lý công việc (Tách luồng) v3',
    'Luồng nghiệp vụ xử lý giao việc đã được tách riêng thành các bước: Giao, Tiếp nhận, Báo cáo, Duyệt.',
    taskWorkflowDef
  );

  await seedWorkflow(
    'DOCUMENT_TRANSFER_ID',
    'Quy trình Điều chuyển & Xử lý Văn bản',
    'Quy trình dành riêng cho việc tiếp nhận, bút phê, xử lý và ban hành văn bản.',
    docTransferWorkflowDef
  );

  await seedWorkflow(
    'ARTICLE_MANAGEMENT_ID',
    'Quy trình Biên tập & Xuất bản',
    'Quy trình kiểm duyệt và xuất bản bài viết, tin tức cho cổng thông tin.',
    articleWorkflowDef
  );

  console.log('✅ Upserted Workflows');
  await app.close();
}

main()
  .catch((e) => {
    console.error('Error seeding workflow:', e);
    process.exit(1);
  });