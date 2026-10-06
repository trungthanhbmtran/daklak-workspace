const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('apps/hrm-service/prisma/schema/*.prisma'),
  ...glob.sync('apps/user-service/prisma/schema/*.prisma'),
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  let lines = content.split(/\r?\n/);
  let newLines = [];
  
  let currentCompositeIds = [];
  let currentCompositeUniques = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Catch @@id([field, organizationId])
    let idMatch = line.match(/@@id\(\[\s*(\w+)\s*,\s*organizationId\s*\]\)/);
    if (idMatch) {
      currentCompositeIds.push(idMatch[1]);
      continue; // remove this line
    }

    // Catch @@unique([field, organizationId])
    let uniqueMatch = line.match(/@@unique\(\[\s*(\w+)\s*,\s*organizationId\s*\]\)/);
    if (uniqueMatch) {
      currentCompositeUniques.push(uniqueMatch[1]);
      continue; // remove this line
    }
    
    // Restore relations: fields: [xxx, organizationId] -> fields: [xxx]
    if (line.includes('@relation')) {
      line = line.replace(/fields:\s*\[([^\]]+),\s*organizationId\]/, 'fields: [$1]');
      line = line.replace(/references:\s*\[([^\]]+),\s*organizationId\]/, 'references: [$1]');
    }

    // Fix the \r issue by removing any trailing whitespace before processing
    line = line.trimEnd();

    // Catch existing @id / @unique that were wrongly appended with \r
    line = line.replace(/\r\s*@id$/, ' @id');
    line = line.replace(/\r\s*@unique$/, ' @unique');
    
    // In case it was already appended wrong, let's try to fix it, or just use git checkout!
    newLines.push(line);
  }

  fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
}
