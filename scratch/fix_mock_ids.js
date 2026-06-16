const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\admin_khcn\\features\\hrm\\components\\work-plans\\tasks\\list\\TaskListClient.tsx';

let code = fs.readFileSync(path, 'utf8');

// Replace 'mock-X' with -X
code = code.replace(/'mock-1'/g, '-1');
code = code.replace(/'mock-2'/g, '-2');
code = code.replace(/'mock-3'/g, '-3');
code = code.replace(/'mock-4'/g, '-4');
code = code.replace(/'mock-5'/g, '-5');

// Any other 'mock-X' ?
code = code.replace(/'mock-6'/g, '-6');
code = code.replace(/'mock-7'/g, '-7');

fs.writeFileSync(path, code);
console.log('Fixed mock IDs in TaskListClient.tsx');
