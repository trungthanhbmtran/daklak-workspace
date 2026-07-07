const fs = require('fs');
const path = require('path');

function replaceInFiles() {
  const dir = 'c:/Users/Admin/Desktop/daklak-workspace/apps';
  
  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (fullPath.includes('node_modules') || fullPath.includes('dist')) continue;
        walk(fullPath);
      } else if (fullPath.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('shared/utils/pagination.util')) {
          const newContent = content.replace(/['"][\.\/]+shared\/utils\/pagination\.util['"]/g, "'@/utils/pagination.util'");
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log('Updated: ' + fullPath);
        }
      }
    }
  }
  walk(dir);
}
replaceInFiles();
