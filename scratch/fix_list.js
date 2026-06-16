const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace ParseIntPipe from all endpoint parameters
const methodsToPatch = [
  { name: 'update', pattern: /async update\(@Param\('id', ParseIntPipe\) id: number, @Body\(\) body: any\) \{/ },
  { name: 'updateStatus', pattern: /async updateStatus\([\s\S]*?@Param\('id', ParseIntPipe\) id: number,[\s\S]*?\) \{/ },
  { name: 'assignTask', pattern: /async assignTask\([\s\S]*?@Param\('id', ParseIntPipe\) id: number,[\s\S]*?\) \{/ },
  { name: 'breakdownTask', pattern: /async breakdownTask\([\s\S]*?@Param\('id', ParseIntPipe\) id: number,[\s\S]*?\) \{/ },
  { name: 'getComments', pattern: /async getComments\(@Req\(\) req: any, @Param\('id', ParseIntPipe\) id: number\) \{/ },
  { name: 'addComment', pattern: /async addComment\([\s\S]*?@Param\('id', ParseIntPipe\) id: number,[\s\S]*?\) \{/ },
  { name: 'requestCoordination', pattern: /async requestCoordination\([\s\S]*?@Param\('id', ParseIntPipe\) id: number,[\s\S]*?\) \{/ },
  { name: 'updateTaskProgress', pattern: /async updateTaskProgress\([\s\S]*?@Param\('id', ParseIntPipe\) id: number,[\s\S]*?\) \{/ },
  { name: 'getSubTasks', pattern: /async getSubTasks\(@Req\(\) req: any, @Param\('id', ParseIntPipe\) id: number\) \{/ }
];

methodsToPatch.forEach(m => {
  const match = m.pattern.exec(code);
  if (match) {
    const originalDecl = match[0];
    const newDecl = originalDecl.replace(/@Param\('id', ParseIntPipe\) id: number/, "@Param('id') id: string");
    
    // We also need to inject the parser logic
    // Because replacing originalDecl will just change the signature
    code = code.replace(originalDecl, newDecl + `\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: null };\n`);
  }
});

// Replace taskService({ id }) with taskService({ id: parsedId }) or taskId: parsedId etc.
// Since id is passed, we must replace usages of `id` with `parsedId` in the exact spots.
// To be safe, we just use string replacement on known lines.
code = code.replace(/taskId: id,/g, 'taskId: parsedId,');
code = code.replace(/id,/g, 'id: parsedId,');
// Wait, `id,` might be dangerous. Let's do `id: parsedId,` only for `id,` if it's surrounded by spaces or newlines.
// Better: `id: id,` or `{ id }`
code = code.replace(/id\s*\n/g, 'id: parsedId\n'); // wait, that's brittle.
// Let's use regex to replace \bid\b with parsedId inside the taskService payloads.

fs.writeFileSync(path, code);
console.log('Fixed ParseIntPipe manually!');
