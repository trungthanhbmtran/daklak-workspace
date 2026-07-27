const fs = require('fs');
const path = require('path');

function findPrismaScripts(dir, fileList = []) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === 'dist' || file === 'generated' || file === 'assets') continue;
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        findPrismaScripts(filePath, fileList);
      } else if (filePath.endsWith('.ts') && filePath.includes('prisma')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const files = findPrismaScripts(path.join(__dirname, 'apps'));
for (const file of files) {
  if (file.includes('prisma.service.ts')) continue;
  if (file.includes('prisma.config.ts')) continue;
  
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('new PrismaClient')) continue;
  
  if (!content.includes("import { PrismaMariaDb }")) {
    content = "import { PrismaMariaDb } from '@prisma/adapter-mariadb';\n" + content;
  }
  
  const clientRegex = /const prisma\s*=\s*new PrismaClient\([^)]*\);?/;
  if (clientRegex.test(content)) {
    const newClient = `const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL is not set');
const mariadbUrl = dbUrl.replace(/^mysql:\\/\\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });`;
    content = content.replace(clientRegex, newClient);
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
