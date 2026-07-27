const fs = require('fs');
const path = require('path');

const seedsDir = path.join(__dirname, 'apps', 'user-service', 'prisma', 'seeds');

function injectAtStart(filename, injection) {
  const filepath = path.join(seedsDir, filename);
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Find the first line after `export async function ... {`
  const funcMatch = content.match(/export\s+async\s+function\s+\w+\(prisma[^)]*\)\s*\{/);
  if (funcMatch) {
    const insertIndex = funcMatch.index + funcMatch[0].length;
    content = content.slice(0, insertIndex) + '\n' + injection + '\n' + content.slice(insertIndex);
    fs.writeFileSync(filepath, content);
    console.log(`Injected into ${filename}`);
  }
}

// 04-roles.seed.ts
injectAtStart('04-roles.seed.ts', `
  const _resources = await prisma.resource.findMany();
  const resources: Record<string, any> = {};
  for (const r of _resources) resources[r.code] = r;
`);

// 05-users.seed.ts
injectAtStart('05-users.seed.ts', `
  const _roles = await prisma.role.findMany();
  const roleMap: Record<string, any> = {};
  for (const r of _roles) roleMap[r.code] = r;
  const superAdminRole = roleMap['SUPER_ADMIN'];
`);

// 06-job-titles.seed.ts
injectAtStart('06-job-titles.seed.ts', `
  const _unitTypes = await prisma.unitType.findMany();
  const unitTypeMap: Record<string, any> = {};
  for (const r of _unitTypes) unitTypeMap[r.code] = r;
`);

// 07-organizations-dak-lak-province.seed.ts
injectAtStart('07-organizations-dak-lak-province.seed.ts', `
  const _unitTypes = await prisma.unitType.findMany();
  const unitTypeMap: Record<string, any> = {};
  for (const r of _unitTypes) unitTypeMap[r.code] = r;
  const DEFAULT_PASSWORD = 'Admin@123';
`);

// 08-job-positions.seed.ts
injectAtStart('08-job-positions.seed.ts', `
  const _roles = await prisma.role.findMany();
  const roleMap: Record<string, any> = {};
  for (const r of _roles) roleMap[r.code] = r;
`);

// Fix user-service/prisma/seed.ts adapter
const seedTsPath = path.join(__dirname, 'apps', 'user-service', 'prisma', 'seed.ts');
let seedContent = fs.readFileSync(seedTsPath, 'utf8');
seedContent = seedContent.replace(/new PrismaMariaDb\(\{ url \}\)/g, 'new PrismaMariaDb(url)');
fs.writeFileSync(seedTsPath, seedContent);
console.log('Fixed PrismaMariaDb in seed.ts');

