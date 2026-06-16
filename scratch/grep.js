const fs = require('fs');
const lines = fs.readFileSync('c:/Users/Admin/Desktop/daklak-workspace/apps/api-gateway/src/modules/hrm/tasks.controller.ts', 'utf8').split('\n');
lines.forEach((l, i) => {
  if(l.includes('ParseIntPipe')) {
    console.log(i + 1, l.trim());
  }
});
