const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mypassword', // or 'root' depending on docker compose
    database: 'admin_workflow',
    port: 3306
  });

  try {
    const [rows] = await conn.execute("SELECT id, definition_id, version, graph FROM process_versions WHERE definition_id = 'cmuu017910000uceqxrsxrn96' ORDER BY version DESC LIMIT 1");
    if(rows.length > 0 && rows[0].graph) {
       console.log("edges parsed:", JSON.stringify(rows[0].graph.edges, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) conn.end();
  }
}
main();
