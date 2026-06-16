const fs = require('fs');
const code = fs.readFileSync('c:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/src/modules/tasks/tasks.service.ts', 'utf8');

function extractMethod(name) {
  const start = code.indexOf(`async ${name}(`);
  if (start === -1) return '';
  let braces = 0;
  let inMethod = false;
  let result = '';
  for (let i = start; i < code.length; i++) {
    const char = code[i];
    result += char;
    if (char === '{') {
      braces++;
      inMethod = true;
    } else if (char === '}') {
      braces--;
      if (inMethod && braces === 0) {
        return result;
      }
    }
  }
  return result;
}

console.log('--- createTask ---');
console.log(extractMethod('createTask'));
console.log('--- assignTask ---');
console.log(extractMethod('assignTask'));
console.log('--- addCoAssignees ---');
console.log(extractMethod('addCoAssignees'));
console.log('--- requestCoordination ---');
console.log(extractMethod('requestCoordination'));
