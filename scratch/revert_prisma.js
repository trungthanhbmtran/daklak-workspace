const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('apps/hrm-service/prisma/schema/*.prisma'),
  ...glob.sync('apps/user-service/prisma/schema/*.prisma'),
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');

  let lines = content.split('\n');
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

    newLines.push(line);
  }

  // Now we need to add @id and @unique back to the respective fields
  for (let i = 0; i < newLines.length; i++) {
    let line = newLines[i];
    
    for (const field of currentCompositeIds) {
      let fieldRegex = new RegExp(`^\\s+${field}\\s+`);
      if (fieldRegex.test(line) && !line.includes('@id')) {
        // Find where the type definition ends and append @id
        newLines[i] = line.replace(/(\w+\??)(\s+@\w+)*$/, '$1 @id$2');
        // Actually simpler: just append if no trailing stuff, but some might have @default
        // Let's just append at the end of the line
        if(!newLines[i].includes('@id')) newLines[i] = newLines[i] + ' @id';
      }
    }

    for (const field of currentCompositeUniques) {
      let fieldRegex = new RegExp(`^\\s+${field}\\s+`);
      if (fieldRegex.test(line) && !line.includes('@unique')) {
        if(!newLines[i].includes('@unique')) newLines[i] = newLines[i] + ' @unique';
      }
    }
  }

  fs.writeFileSync(file, newLines.join('\n'), 'utf-8');
  console.log(`Reverted ${file}`);
}
