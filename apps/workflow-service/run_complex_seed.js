const mariadb = require('mariadb');
const fs = require('fs');

async function main() {
  const code = fs.readFileSync('C:/Users/Admin/Desktop/daklak-workspace/apps/workflow-service/prisma/seed.ts', 'utf8');
  
  // Extract taskWorkflowDef using basic parsing or regex, or just run it via Function
  // We can convert the TS object to JS and evaluate it.
  const startIdx = code.indexOf('const taskWorkflowDef = {');
  if (startIdx === -1) throw new Error('taskWorkflowDef not found');
  
  let openBraces = 0;
  let endIdx = -1;
  let isInsideString = false;
  let stringChar = '';

  for (let i = startIdx + 'const taskWorkflowDef = '.length; i < code.length; i++) {
    const char = code[i];
    
    if (isInsideString) {
      if (char === stringChar && code[i - 1] !== '\\') {
        isInsideString = false;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === '\`') {
      isInsideString = true;
      stringChar = char;
      continue;
    }

    if (char === '{') openBraces++;
    else if (char === '}') {
      openBraces--;
      if (openBraces === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx === -1) throw new Error('End of taskWorkflowDef not found');

  const objStr = code.substring(startIdx + 'const taskWorkflowDef = '.length, endIdx + 1);
  
  // Evaluate the string to an object
  // Since it's raw JS object string, we can use eval or new Function
  const obj = new Function('return ' + objStr)();

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
    const name = 'Quy trình xử lý công việc (Tách luồng) v3';
    const desc = 'Luồng nghiệp vụ xử lý giao việc đã được tách riêng thành các bước: Giao, Tiếp nhận, Báo cáo, Duyệt.';
    const triggerType = 'MANUAL';
    const definitionStr = JSON.stringify(obj);

    const rows = await conn.query("SELECT id FROM workflows WHERE id = ?", [id]);
    if (rows.length > 0) {
      await conn.query(
        "UPDATE workflows SET name=?, description=?, definition=?, \`trigger\`=?, version=3, updatedAt=NOW() WHERE id=?",
        [name, desc, definitionStr, triggerType, id]
      );
      console.log('✅ Updated TASK_PROCESSING_ID to v3 complex workflow');
    } else {
      await conn.query(
        "INSERT INTO workflows (id, name, description, definition, \`trigger\`, active, version, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, true, 3, NOW(), NOW())",
        [id, name, desc, definitionStr, triggerType]
      );
      console.log('✅ Inserted TASK_PROCESSING_ID v3 complex workflow');
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (conn) conn.end();
    await pool.end();
  }
}

main();
