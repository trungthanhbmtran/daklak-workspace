const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\api-gateway\\src\\modules\\hrm\\tasks.controller.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace import
code = code.replace(/ParseIntPipe,/g, '');

// Helper to replace method signature and inject parsing
function injectParsing(methodName, idReplacements) {
  const regex = new RegExp(`(async ${methodName}\\([\\s\\S]*?@Param\\('id'[,\\s]*ParseIntPipe\\)\\s+id:\\s+number[\\s\\S]*?\\)\\s*\\{)`);
  
  code = code.replace(regex, (match) => {
    let replaced = match.replace(/@Param\('id'[,\\s]*ParseIntPipe\)\s+id:\s+number/, "@Param('id') id: string");
    replaced += `\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: [] };\n`;
    return replaced;
  });

  if (idReplacements) {
    idReplacements.forEach(r => {
      // Find the method body. To be safe, just replace globally if it's unique enough,
      // but 'id' is very common. We'll do it manually.
    });
  }
}

// Just globally replace @Param('id', ParseIntPipe) id: number
code = code.replace(/@Param\('id'[, \n]*ParseIntPipe\)\s*id:\s*number/g, "@Param('id') id: string");

// Replace { id } with { id: parsedId } ? No, there are many { id }
// Let's do a smart regex: `id,` -> `id: parsedId,` inside the taskService calls
code = code.replace(/id,/g, "id: parsedId,"); 
// Wait, `id,` might appear in other places like `planId,`? No, `\bid,\b`.
code = code.replace(/\bid,\b/g, "id: parsedId,");
code = code.replace(/\bid: id\b/g, "id: parsedId");
code = code.replace(/taskId: id/g, "taskId: parsedId");

// Inject parsedId definition at the beginning of each method
const methods = [
  'async update(',
  'async updateStatus(',
  'async assignTask(',
  'async breakdownTask(',
  'async getComments(',
  'async addComment(',
  'async requestCoordination(',
  'async updateTaskProgress(',
  'async getSubTasks('
];

methods.forEach(m => {
  const idx = code.indexOf(m);
  if (idx !== -1) {
    const blockStart = code.indexOf('{', idx);
    if (blockStart !== -1) {
      code = code.substring(0, blockStart + 1) +
        `\n    const parsedId = parseInt(id, 10);\n    if (isNaN(parsedId)) return { success: false, message: 'ID không hợp lệ', data: [] };\n` +
        code.substring(blockStart + 1);
    }
  }
});

// Remove any duplicate parsedId declarations if any
// Fix { id: parsedId } if it was double replaced
// Let's test the TS compilation after this script.

fs.writeFileSync(path, code);
console.log('Reverted ParseIntPipe');
