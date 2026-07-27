const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const dirs = fs.readdirSync(appsDir);

for (const dir of dirs) {
  const servicePath = path.join(appsDir, dir);
  // Find prisma.service.ts
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
  
  // Find prisma.module.ts
  const findPrismaModule = (currentPath) => {
    if (!fs.existsSync(currentPath)) return null;
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      for (const file of files) {
        const res = findPrismaModule(path.join(currentPath, file));
        if (res) return res;
      }
    } else if (currentPath.endsWith('prisma.module.ts')) {
      return currentPath;
    }
    return null;
  };

  const srcPath = path.join(servicePath, 'src');
  const prismaServicePath = findPrismaService(srcPath);
  const prismaModulePath = findPrismaModule(srcPath);

  if (prismaServicePath) {
    let content = fs.readFileSync(prismaServicePath, 'utf8');

    // 1. Ensure OnModuleInit, OnModuleDestroy are imported
    if (!content.includes('OnModuleInit')) {
        content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]@nestjs\/common['"]/, 'import { $1, OnModuleInit, OnModuleDestroy } from \'@nestjs/common\'');
    }
    
    // 2. Ensure PrismaClient uses @generated path
    content = content.replace(/import\s+{\s*PrismaClient\s*}\s+from\s+['"]\.\.\/.*?generated\/prisma\/client['"]/g, 'import { PrismaClient } from \'@generated/prisma/client\'');

    // 3. Update adapter config
    content = content.replace(/new\s+PrismaMariaDb\(\s*url\s*\)/g, 'new PrismaMariaDb({ url })');

    // 4. Ensure it implements OnModuleInit, OnModuleDestroy
    if (!content.includes('implements OnModuleInit, OnModuleDestroy')) {
        content = content.replace(/extends\s+PrismaClient(\s*{)/g, 'extends PrismaClient\n  implements OnModuleInit, OnModuleDestroy$1');
    }

    // 5. Ensure connection methods
    if (!content.includes('onModuleInit()')) {
        const methods = `
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
`;
        content = content.replace(/}\s*$/g, `${methods}\n}`);
    }

    fs.writeFileSync(prismaServicePath, content);
    console.log(`Updated ${prismaServicePath}`);
  }

  if (prismaModulePath) {
    let content = fs.readFileSync(prismaModulePath, 'utf8');

    // 1. Ensure @Global() is imported
    if (!content.includes('Global')) {
        content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]@nestjs\/common['"]/, 'import { Global, $1 } from \'@nestjs/common\'');
    }

    // 2. Add @Global() decorator
    if (!content.includes('@Global()')) {
        content = content.replace(/@Module\({/g, '@Global()\n@Module({');
    }

    fs.writeFileSync(prismaModulePath, content);
    console.log(`Updated ${prismaModulePath}`);
  }
}
