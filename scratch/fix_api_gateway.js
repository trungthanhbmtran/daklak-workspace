const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Add ParseIntPipe
if (!code.includes('ParseIntPipe')) {
  code = code.replace(
    '} from \'@nestjs/common\';',
    '  ParseIntPipe,\n} from \'@nestjs/common\';'
  );
}

// 2. Fix parseInt(id, 10)
code = code.replace(/const taskId = parseInt\(id, 10\);/g, '');
code = code.replace(/taskId: taskId,/g, 'taskId: id,');
code = code.replace(/id: taskId,/g, 'id,');
code = code.replace(/id: parseInt\(id, 10\),/g, 'id,');

// 3. Fix getComments and getSubTasks which don't use ParseIntPipe yet
code = code.replace(
  /@Get\(':id\/comments'\)\n  async getComments\(@Req\(\) req: any, @Param\('id'\) id: string\) \{/g,
  "@Get(':id/comments')\n  async getComments(@Req() req: any, @Param('id', ParseIntPipe) id: number) {"
);

code = code.replace(
  /@Get\(':id\/subtasks'\)\n  async getSubTasks\(@Req\(\) req: any, @Param\('id'\) id: string\) \{/g,
  "@Get(':id/subtasks')\n  async getSubTasks(@Req() req: any, @Param('id', ParseIntPipe) id: number) {"
);

fs.writeFileSync(path, code);
console.log('Fixed API Gateway TS errors.');
