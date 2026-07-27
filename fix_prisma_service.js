const fs = require('fs');
const path = require('path');

function findPrismaServices(dir, fileList = []) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === 'dist' || file === 'generated' || file === 'assets') continue;
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        findPrismaServices(filePath, fileList);
      } else if (filePath.endsWith('prisma.service.ts')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const files = findPrismaServices(path.join(__dirname, 'apps'));
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes("import { PrismaMariaDb }")) {
    content = "import { PrismaMariaDb } from '@prisma/adapter-mariadb';\n" + content;
  }
  
  const constructorRegex = /constructor\s*\([^)]*\)\s*\{([\s\S]*?)super\([^)]*\);?([\s\S]*?)\}/;
  if (constructorRegex.test(content)) {
    const newConstructor = `constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL is not set');
    const mariadbUrl = dbUrl.replace(/^mysql:\\/\\//, 'mariadb://');
    const adapter = new PrismaMariaDb(mariadbUrl);
    super({ adapter });
  }`;
    content = content.replace(constructorRegex, newConstructor);
  }
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
