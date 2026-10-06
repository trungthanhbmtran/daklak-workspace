const fs = require('fs');
const glob = require('glob');

const files = [
  ...glob.sync('../apps/hrm-service/prisma/schema/*.prisma'),
  ...glob.sync('../apps/user-service/prisma/schema/*.prisma'),
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const outLines = [];
  
  let inModel = false;
  let hasOrgId = false;
  let singleIdField = null;
  let singleUniques = [];
  let addedOrgField = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    if (/^model\s+(\w+)\s*\{/.test(line)) {
      inModel = true;
      hasOrgId = false;
      singleIdField = null;
      singleUniques = [];
      addedOrgField = false;
      outLines.push(line);
      continue;
    }
    
    if (inModel && line.trim() === '}') {
      if (!hasOrgId && !addedOrgField) {
        outLines.push('  organizationId String @default("DEFAULT") @map("organization_id")');
        if (singleIdField) {
          outLines.push(`  @@id([${singleIdField}, organizationId])`);
        }
        for (const u of singleUniques) {
          outLines.push(`  @@unique([${u}, organizationId])`);
        }
      }
      outLines.push(line);
      inModel = false;
      continue;
    }
    
    if (inModel) {
      if (/\borganizationId\b/.test(line)) {
        hasOrgId = true;
      }
      
      if (!hasOrgId && !addedOrgField && line.trim().startsWith('@@')) {
        outLines.push('  organizationId String @default("DEFAULT") @map("organization_id")');
        if (singleIdField) {
          outLines.push(`  @@id([${singleIdField}, organizationId])`);
          singleIdField = null;
        }
        for (const u of singleUniques) {
          outLines.push(`  @@unique([${u}, organizationId])`);
        }
        singleUniques = [];
        addedOrgField = true;
      }

      if (line.includes('@id') && !line.trim().startsWith('@@')) {
        const fieldMatch = line.match(/^\s+(\w+)\s+/);
        if (fieldMatch) singleIdField = fieldMatch[1];
        line = line.replace(/@id\s*/, '');
      }

      if (line.includes('@unique') && !line.trim().startsWith('@@')) {
        const fieldMatch = line.match(/^\s+(\w+)\s+/);
        if (fieldMatch) singleUniques.push(fieldMatch[1]);
        line = line.replace(/@unique\s*/, '');
      }

      if (line.includes('@@id([')) {
        line = line.replace(/@@id\(\[(.*?)\]\)/, '@@id([$1, organizationId])');
      }

      if (line.includes('@@unique([')) {
        line = line.replace(/@@unique\(\[(.*?)\](.*?)\)/, (m, g1, g2) => {
          if (g1.includes('organizationId')) return m;
          return `@@unique([${g1}, organizationId]${g2})`;
        });
      }

      if (line.includes('@relation')) {
        line = line.replace(/fields:\s*\[(.*?)\]/, (m, g1) => {
          if (g1.includes('organizationId')) return m;
          return `fields: [${g1}, organizationId]`;
        });
        line = line.replace(/references:\s*\[(.*?)\]/, (m, g1) => {
          if (g1.includes('organizationId')) return m;
          return `references: [${g1}, organizationId]`;
        });
      }
    }
    
    outLines.push(line);
  }
  
  fs.writeFileSync(file, outLines.join('\n'), 'utf-8');
  console.log(`Updated ${file}`);
}
