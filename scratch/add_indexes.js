const fs = require('fs');

function addIndexToPrismaModel(filePath, modelName, indexStr) {
  let code = fs.readFileSync(filePath, 'utf8');
  const modelRegex = new RegExp(`model\\s+${modelName}\\s+\\{([\\s\\S]*?)\\}`, 'g');
  
  code = code.replace(modelRegex, (match, p1) => {
    if (!p1.includes(indexStr)) {
      return `model ${modelName} {${p1}\n  ${indexStr}\n}`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, code);
  console.log(`Added index to ${modelName} in ${filePath}`);
}

addIndexToPrismaModel(
  'C:/Users/Admin/Desktop/daklak-workspace/apps/hrm-service/prisma/schema/task.prisma',
  'Task',
  '@@index([isDeleted, status, dueDate])'
);

addIndexToPrismaModel(
  'C:/Users/Admin/Desktop/daklak-workspace/apps/document-service/prisma/schema/document.prisma',
  'Document',
  '@@index([status, isIncoming, isPublic])'
);

