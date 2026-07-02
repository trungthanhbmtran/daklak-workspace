const fs = require('fs');
let c = fs.readFileSync('apps/hrm-service/src/modules/tasks/tasks.service.ts', 'utf8');
c = c.replace(/this\.notificationClient\.emit\(([\s\S]*?)\);/g, 'this.notificationClient.emit($1).subscribe();');
fs.writeFileSync('apps/hrm-service/src/modules/tasks/tasks.service.ts', c);
