const fs = require('fs');
const hrmSeed = fs.readFileSync('apps/hrm-service/prisma/seed.ts', 'utf8');

const regex = /departmentId:\s*unitMap\['([^']+)'\],\s*jobTitleId:\s*jobMap\['([^']+)'\]/g;
const counts = {};
let match;
while ((match = regex.exec(hrmSeed)) !== null) {
  const unit = match[1];
  const jt = match[2];
  const key = unit + '|' + jt;
  counts[key] = (counts[key] || 0) + 1;
}

let codeToAdd = '\n    // --- AUTO-GENERATED STAFFING FROM HRM-SERVICE ---\n';
for (const [key, count] of Object.entries(counts)) {
  const [unit, jt] = key.split('|');
  codeToAdd += `    await setStaffing('${unit}', '${jt}', ${count});\n`;
}

const userSeedFile = 'apps/user-service/prisma/seed.ts';
let userSeed = fs.readFileSync(userSeedFile, 'utf8');
userSeed = userSeed.replace(/\/\/ ==========================================================\n\s*\/\/ 10\. CATEGORIES/g, codeToAdd + '\n    // ==========================================================\n    // 10. CATEGORIES');

fs.writeFileSync(userSeedFile, userSeed);
console.log('Added staffing slots to user-service seed!');
