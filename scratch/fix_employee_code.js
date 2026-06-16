const fs = require('fs');
const path = 'c:\\Users\\Admin\\Desktop\\daklak-workspace\\apps\\hrm-service\\src\\modules\\tasks\\tasks.service.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Update createTask
code = code.replace(
  /creatorUserId,\n          planId\n        \}\n      \}\);/g,
  'creatorUserId,\n          creatorEmployeeCode: data.currentUserCode,\n          planId\n        }\n      });'
);

code = code.replace(
  /participantsData\.push\(\{ taskId: newTask\.id, userId: assigneeUid, participantRole: TaskRole\.ASSIGNEE \}\);/g,
  'participantsData.push({ taskId: newTask.id, userId: assigneeUid, employeeCode: assigneeCode, participantRole: TaskRole.ASSIGNEE });'
);

code = code.replace(
  /participantsData\.push\(\{ taskId: newTask\.id, userId: assignerUid, participantRole: TaskRole\.OWNER \}\);/g,
  'participantsData.push({ taskId: newTask.id, userId: assignerUid, employeeCode: assignerCode, participantRole: TaskRole.OWNER });'
);

code = code.replace(
  /participantsData\.push\(\{ taskId: newTask\.id, userId: supervisorUid, participantRole: TaskRole\.APPROVER \}\);/g,
  'participantsData.push({ taskId: newTask.id, userId: supervisorUid, employeeCode: data.supervisorCode, participantRole: TaskRole.APPROVER });'
);


// 2. Update assignTask
// In assignTask, there is a section mapping participantsData
code = code.replace(
  /participantsData\.push\(\{ taskId: id, userId: codeToUidMap\.get\(assigneeCode\)\!, participantRole: TaskRole\.ASSIGNEE \}\);/g,
  'participantsData.push({ taskId: id, userId: codeToUidMap.get(assigneeCode)!, employeeCode: assigneeCode, participantRole: TaskRole.ASSIGNEE });'
);

code = code.replace(
  /participantsData\.push\(\{ taskId: id, userId: codeToUidMap\.get\(assignerCode\)\!, participantRole: TaskRole\.OWNER \}\);/g,
  'participantsData.push({ taskId: id, userId: codeToUidMap.get(assignerCode)!, employeeCode: assignerCode, participantRole: TaskRole.OWNER });'
);

code = code.replace(
  /participantsData\.push\(\{ taskId: id, userId: codeToUidMap\.get\(c\)\!, participantRole: TaskRole\.COORDINATOR \}\);/g,
  'participantsData.push({ taskId: id, userId: codeToUidMap.get(c)!, employeeCode: c, participantRole: TaskRole.COORDINATOR });'
);

// 3. Update addCoAssignees
code = code.replace(
  /data: coassigneeCodes\n          \.map\(c => \(\{ taskId: id, userId: codeToUidMap\.get\(c\)\!, participantRole: TaskRole\.COORDINATOR \}\)\)/g,
  'data: coassigneeCodes\n          .map(c => ({ taskId: id, userId: codeToUidMap.get(c)!, employeeCode: c, participantRole: TaskRole.COORDINATOR }))'
);

// 4. Update requestCoordination
code = code.replace(
  /data\.push\(\{ taskId: id, userId: codeToUidMap\.get\(data\.assigneeCode\)\!, participantRole: TaskRole\.ASSIGNEE \}\);/g,
  'data.push({ taskId: id, userId: codeToUidMap.get(data.assigneeCode)!, employeeCode: data.assigneeCode, participantRole: TaskRole.ASSIGNEE });'
);

code = code.replace(
  /data\.push\(\{ taskId: id, userId: codeToUidMap\.get\(c\)\!, participantRole: TaskRole\.COORDINATOR \}\);/g,
  'data.push({ taskId: id, userId: codeToUidMap.get(c)!, employeeCode: c, participantRole: TaskRole.COORDINATOR });'
);


fs.writeFileSync(path, code);
console.log('Fixed tasks.service.ts employeeCode');
