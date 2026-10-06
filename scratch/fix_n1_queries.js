const fs = require('fs');

const servicePath = 'C:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/src/modules/tasks/tasks.service.ts';
let content = fs.readFileSync(servicePath, 'utf8');

const regex = /\/\/ 4\. Execute queries[\s\S]*?for\s*\(const\s+p\s+of\s+participantsToDelete\)\s*\{[\s\S]*?\}[\s\S]*?if\s*\(participantsToCreate\.length\s*>\s*0\)\s*\{[\s\S]*?\}[\s\S]*?for\s*\(const\s+u\s+of\s+participantsToUpdate\)\s*\{[\s\S]*?\}/;

const replacementStr = `// 4. Execute queries
        if (participantsToDelete.length > 0) {
          await tx.taskParticipant.deleteMany({
            where: {
              OR: participantsToDelete.map(p => ({
                taskId: id, employeeCode: p.employeeCode, participantRole: p.participantRole
              }))
            }
          });
        }
        if (participantsToCreate.length > 0) {
          await tx.taskParticipant.createMany({ data: participantsToCreate, skipDuplicates: true });
        }
        if (participantsToUpdate.length > 0) {
          await Promise.all(participantsToUpdate.map(u => tx.taskParticipant.update({ where: u.where, data: u.data })));
        }`;

if (regex.test(content)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync(servicePath, content);
  console.log('Fixed N+1 queries in executeAssignTaskTransaction.');
} else {
  console.log('Regex did not match!');
}
