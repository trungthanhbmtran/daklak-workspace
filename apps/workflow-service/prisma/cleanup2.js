const fs = require('fs');

let content = fs.readFileSync('c:/Users/Admin/Desktop/daklak-workspace/apps/workflow-service/prisma/seed.ts', 'utf8');

// We want to remove any line containing:
// if (actionName === 'CHAT') ...
// if (actionName === 'EDIT') ...
// if (actionName === 'DELETE') ...
// if (actionName === 'ADD_SUBTASK') ...
// if (actionName === 'COORDINATE') ...

const lines = content.split('\n');
const newLines = [];

for (const line of lines) {
    if (line.includes("if (actionName === 'CHAT'") || 
        line.includes("if (actionName === 'CHAT' || actionName === 'EDIT'") ||
        line.includes("if (actionName === 'EDIT'") ||
        line.includes("if (actionName === 'DELETE'") ||
        line.includes("if (actionName === 'ADD_SUBTASK'") ||
        line.includes("if (actionName === 'COORDINATE'")) {
        // Skip this line if it's purely one of the auxiliary actions we want to remove
        if (line.includes("if (actionName === 'PLAN_ASSIGNMENT' || actionName === 'EDIT')")) {
            // Edge case: PLAN_ASSIGNMENT || EDIT -> keep it but remove EDIT?
            // Actually, if we just remove " || actionName === 'EDIT'", that's safer.
            newLines.push(line.replace(" || actionName === 'EDIT'", ""));
        } else if (line.includes("if (actionName === 'ASSIGN' || actionName === 'EDIT')")) {
            newLines.push(line.replace(" || actionName === 'EDIT'", ""));
        } else {
            continue;
        }
    } else {
        newLines.push(line);
    }
}

fs.writeFileSync('c:/Users/Admin/Desktop/daklak-workspace/apps/workflow-service/prisma/seed.ts', newLines.join('\n'));
console.log('Cleaned up seed.ts auxiliary actions');
