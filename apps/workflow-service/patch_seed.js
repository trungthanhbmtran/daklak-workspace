const fs = require('fs');

const file = 'C:/Users/Admin/Desktop/daklak-workspace/apps/workflow-service/prisma/seed.ts';
let code = fs.readFileSync(file, 'utf8');

const expressions = {
  node_assign: `if (userRoles.includes('TASK:MANAGE') || userRoles.includes('TASK:*')) return true;
if (actionName === 'ASSIGN' || actionName === 'EDIT') { return (isOwner || isDeptLeader) && userRoles.includes('TASK:EDIT'); }
if (actionName === 'DELETE') { return isOwner && isUnassigned && !hasChildren && userRoles.includes('TASK:DELETE'); }
if (actionName === 'ADD_SUBTASK') { return (isOwner || isAssignee) && (userRoles.includes('TASK:EDIT') || userRoles.includes('TASK:EXECUTE')); }
return false;`,

  node_in_progress: `if (userRoles.includes('TASK:MANAGE') || userRoles.includes('TASK:*')) return true;
if (actionName === 'IN_PROGRESS') return isAssignee && userRoles.includes('TASK:EXECUTE');
return false;`,

  node_coordinate: `if (userRoles.includes('TASK:MANAGE') || userRoles.includes('TASK:*')) return true;
if (actionName === 'COORDINATE' || actionName === 'DONE') return isAssignee && userRoles.includes('TASK:EXECUTE');
return false;`,

  node_monitor: `if (userRoles.includes('TASK:MANAGE') || userRoles.includes('TASK:*')) return true;
if (actionName === 'MONITOR') return (isSupervisor || isDeptLeader) && userRoles.includes('TASK:APPROVE');
return false;`,

  node_report: `if (userRoles.includes('TASK:MANAGE') || userRoles.includes('TASK:*')) return true;
if (actionName === 'DONE' || actionName === 'COMPLETE') return isAssignee && !hasChildren && userRoles.includes('TASK:EXECUTE');
return false;`,

  node_approve: `if (userRoles.includes('TASK:MANAGE') || userRoles.includes('TASK:*')) return true;
if (actionName === 'APPROVE' || actionName === 'RETURN' || actionName === 'RETURNED') return (isSupervisor || isDeptLeader || isOwner) && userRoles.includes('TASK:APPROVE');
return false;`
};

for (const [nodeId, expr] of Object.entries(expressions)) {
  const nodeSearch = `id: '${nodeId}',`;
  const nodeStart = code.indexOf(nodeSearch);
  if (nodeStart !== -1) {
    const dataStart = code.indexOf('data: {', nodeStart);
    if (dataStart !== -1) {
       // Insert validationExpression right after data: {
       const insertStr = ` validationExpression: \`${expr}\`,`;
       code = code.substring(0, dataStart + 7) + insertStr + code.substring(dataStart + 7);
    }
  }
}

fs.writeFileSync(file, code);
console.log('Successfully injected validationExpression to seed.ts');
