const fs = require('fs');
let content = fs.readFileSync('docker-compose.prod.yml', 'utf8');
content = content.replace(/command:\s+npx\s+prisma\s+migrate\s+deploy/g, 'command: >-\n      sh -c "npx prisma migrate deploy && npx prisma db seed"');
fs.writeFileSync('docker-compose.prod.yml', content);
