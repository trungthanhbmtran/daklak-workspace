const fs = require('fs');
const path = require('path');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.next')) {
        search(p);
      }
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      if (/apiClient\.(get|post|put|delete|patch)\(['"`]\/admin\//.test(content)) {
        console.log(p);
      }
    }
  }
}

search('apps/admin_khcn');
