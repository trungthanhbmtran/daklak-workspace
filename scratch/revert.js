const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace ParseIntPipe imports
code = code.replace(/ParseIntPipe,\n/g, '');
code = code.replace(/ParseIntPipe/g, '');

const paramRegex = /@Param\('id'[^)]*\)\s+id:\s+number/g;

code = code.replace(paramRegex, "@Param('id') id: string");

// We also need to inject the isNaN check.
// We can find the start of each block `{` after `@Param('id') id: string` 
// and inject the check, and change `id` to `parsedId` in the body.
// But wait, the simplest way is to just do `id` as `any` and pass it to firstValueFrom. 
// No, microservice expects `id` to be a number.
// If I redefine `id` inside the method it will conflict with the parameter `id`.
// Let's just do manual replacements for each method.

const methods = [
  'update',
  'updateStatus',
  'assignTask',
  'breakdownTask',
  'getComments',
  'addComment',
  'requestCoordination',
  'updateTaskProgress',
  'getSubTasks'
];

methods.forEach(m => {
  const methodStartPattern = new RegExp(`async ${m}\\([\\s\\S]*?\\)\\s*\\{`);
  const match = methodStartPattern.exec(code);
  if (match) {
    const injectStr = `
    const parsedId = parseInt(id as any, 10);
    if (isNaN(parsedId)) {
      return { success: false, message: 'ID không hợp lệ', data: [] };
    }
    const taskId = parsedId;
`;
    // We need to replace `id` with `parsedId` in the method body?
    // Actually, because we passed `id` to `taskService.X({ id: id })` or `{ id }`, 
    // it's safer to just let the script do it manually.
  }
});

// Since the file is relatively small, I will just use regex to replace `{ id }` or `id,` or `taskId: id`
// Wait, I will write the precise replace for each one.
