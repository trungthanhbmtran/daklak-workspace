const mariadb = require('mariadb');
const fs = require('fs');

async function main() {
  console.log('Seeding Workflow definition for Task Processing...');

  const taskWorkflowDef = {
    nodes: [
      {
        id: 'node_start',
        type: 'start',
        position: { x: 250, y: 50 },
        data: { label: 'Bắt đầu' },
      },
      {
        id: 'node_processing',
        type: 'user_task',
        position: { x: 250, y: 150 },
        data: {
          label: 'Đang xử lý nghiệp vụ Giao việc',
          description: 'Quản lý các trạng thái: Giao việc, Tiếp nhận, Báo cáo, Duyệt/Trả lại',
          role: '',
          validationExpression: `
              if (actionName === 'ASSIGN') {
                 var isAdmin = userRoles.includes('SUPER_ADMIN');
                 var isManager = userRoles.includes('MANAGER');
                 return isAdmin || isManager;
              }
              if (actionName === 'IN_PROGRESS') {
                 return true;
              }
              if (actionName === 'DONE') {
                 return true; 
              }
              if (actionName === 'RETURNED' || actionName === 'APPROVED') {
                 var isAdmin = userRoles.includes('SUPER_ADMIN');
                 var isManager = userRoles.includes('MANAGER');
                 return isAdmin || isManager;
              }
              return true;
          `
        },
      },
      {
        id: 'node_end',
        type: 'end',
        position: { x: 250, y: 300 },
        data: { label: 'Kết thúc' },
      }
    ],
    edges: [
      { id: 'edge_1', source: 'node_start', target: 'node_processing' },
      { id: 'edge_2', source: 'node_processing', target: 'node_end' }
    ],
  };

  const pool = mariadb.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'mypassword',
    database: 'admin_workflow',
    connectionLimit: 5,
    allowPublicKeyRetrieval: true
  });

  let conn;
  try {
    conn = await pool.getConnection();
    const id = 'TASK_PROCESSING_ID';
    const code = 'TASK_PROCESSING';
    const name = 'Quy trình xử lý công việc (Động)';
    const desc = 'Luồng nghiệp vụ xử lý giao việc: Lãnh đạo giao, nhân viên thụ lý. Áp dụng luật kiểm tra động qua Expression.';
    const triggerType = 'MANUAL';
    const definitionStr = JSON.stringify(taskWorkflowDef);
    
    // Check if exists
    const rows = await conn.query("SELECT id FROM workflows WHERE id = ?", [id]);
    if (rows.length > 0) {
      console.log('Workflow exists, updating...');
      await conn.query(
        "UPDATE workflows SET name=?, description=?, definition=?, `trigger`=?, version=2, updatedAt=NOW() WHERE id=?",
        [name, desc, definitionStr, triggerType, id]
      );
    } else {
      console.log('Workflow does not exist, creating...');
      await conn.query(
        "INSERT INTO workflows (id, name, description, definition, `trigger`, active, version, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, true, 1, NOW(), NOW())",
        [id, name, desc, definitionStr, triggerType]
      );
    }
    console.log('✅ Upserted Workflow');
  } catch (err) {
    console.error('Error seeding workflow:', err);
    process.exit(1);
  } finally {
    if (conn) conn.end();
    await pool.end();
  }
}

main();
