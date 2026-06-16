const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Ensure ParseIntPipe is imported correctly
if (!code.includes('ParseIntPipe,')) {
  code = code.replace(
    /} from '@nestjs\/common';/,
    '  ParseIntPipe,\n} from \'@nestjs/common\';'
  );
}

// Replace all usages of 'taskId' with 'id' because we use 'id' from ParseIntPipe now
code = code.replace(/taskId/g, 'id');

fs.writeFileSync(path, code);
console.log('Fixed ParseIntPipe and taskId.');
