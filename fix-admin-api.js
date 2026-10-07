const fs = require('fs');
const path = require('path');

function processFile(p) {
  let content = fs.readFileSync(p, 'utf8');
  let original = content;
  
  // allow whitespace between ( and quote
  content = content.replace(/apiClient\.(get|post|put|delete|patch)\(\s*(['"`])\/admin\//g, "apiClient.$1($2/");
  
  if (content !== original) {
    fs.writeFileSync(p, content, 'utf8');
    console.log('Fixed', p);
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
