const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const dirs = fs.readdirSync(appsDir);

for (const dir of dirs) {
  const servicePath = path.join(appsDir, dir);
  const findPrismaService = (currentPath) => {
    if (!fs.existsSync(currentPath)) return null;
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        const res = findPrismaService(path.join(currentPath, file));
        if (res) return res;
      }
    } else if (currentPath.endsWith('prisma.service.ts')) {
      return currentPath;
    }
    return null;
  };

  const srcPath = path.join(servicePath, 'src');
  const prismaServicePath = findPrismaService(srcPath);

  if (prismaServicePath) {
    let content = fs.readFileSync(prismaServicePath, 'utf8');
    
    // Fix the adapter instantiation
    if (content.includes('new PrismaMariaDb({ url })')) {
        content = content.replace(/new\s+PrismaMariaDb\(\{\s*url\s*\}\)/g, 'new PrismaMariaDb(url)');
        fs.writeFileSync(prismaServicePath, content);
        console.log(`Fixed ${prismaServicePath}`);
    }
  }
}
