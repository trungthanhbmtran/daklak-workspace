const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mypassword',
    database: 'admin_workflow',
    port: 3306
  });

  const [rows] = await connection.execute('SELECT id, name FROM workflows ORDER BY createdAt DESC');
  await connection.end();

  console.log(JSON.stringify(rows, null, 2));
}

main().catch(console.error);
