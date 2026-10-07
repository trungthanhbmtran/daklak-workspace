const fs = require('fs');
const path = require('path');

function processFile(p) {
  let content = fs.readFileSync(p, 'utf8');
  if (/axios\.(get|post|put|delete|patch)\((['"`])\/admin\//.test(content)) {
    console.log('axios:', p);
  }
}

function searchAndFix(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules') && !p.includes('.next')) {
        searchAndFix(p);
      }
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      processFile(p);
    }
  }
}

searchAndFix('apps/admin_khcn');
