const fs = require('fs');
const path = require('path');

function findPrismaFiles(dir, fileList = []) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        findPrismaFiles(filePath, fileList);
      } else if (filePath.endsWith('.prisma')) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const prismaFiles = findPrismaFiles(path.join(__dirname, 'apps'));
for (const file of prismaFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('url      = env("DATABASE_URL")')) {
    content = content.replace(/[\t ]*url[\t ]*=[\t ]*env\("DATABASE_URL"\)\n?/, '');
    fs.writeFileSync(file, content);
    console.log('Removed schema url from: ' + file);
  }
}
