const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const services = fs.readdirSync(appsDir);

for (const service of services) {
  const srcDir = path.join(appsDir, service, 'src');
  if (!fs.existsSync(srcDir)) continue;
  
  // Find prisma.service.ts
  const findPrismaService = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        const found = findPrismaService(fullPath);
        if (found) return found;
      } else if (file === 'prisma.service.ts') {
        return fullPath;
      }
    }
    return null;
  };

  const prismaServicePath = findPrismaService(srcDir);
  if (prismaServicePath) {
    let content = fs.readFileSync(prismaServicePath, 'utf8');
    
    // Calculate relative path from prisma.service.ts to src/generated/prisma/client
    const generatedDir = path.join(srcDir, 'generated', 'prisma', 'client');
    let relPath = path.relative(path.dirname(prismaServicePath), generatedDir).replace(/\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;

    // Replace @generated/prisma/client with relative path
    if (content.includes('@generated/prisma/client')) {
      content = content.replace(/@generated\/prisma\/client/g, relPath);
      fs.writeFileSync(prismaServicePath, content);
      console.log(`Replaced @generated in ${service}: ${relPath}`);
    }
  }
}
