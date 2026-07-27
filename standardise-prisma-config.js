const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const dirs = fs.readdirSync(appsDir);

for (const dir of dirs) {
  const servicePath = path.join(appsDir, dir);
  const prismaConfigPath = path.join(servicePath, 'prisma.config.ts');
  const packageJsonPath = path.join(servicePath, 'package.json');
  
  if (fs.existsSync(prismaConfigPath)) {
    let content = fs.readFileSync(prismaConfigPath, 'utf8');
    
    // Replace old imports
    content = content.replace(/import\s+"dotenv\/config";\n?/g, '');
    content = content.replace(/import\s+\*\s+as\s+dotenv\s+from\s+['"]dotenv['"];\n?(dotenv\.config\(\);\n?)?/g, '');
    
    // Make sure `env` is imported from `prisma/config`
    if (content.includes('import { defineConfig } from "prisma/config"')) {
        content = content.replace('import { defineConfig } from "prisma/config"', 'import { defineConfig, env } from "prisma/config"');
    } else if (!content.includes('import { defineConfig, env }')) {
        // Just in case it's somewhat different
        content = content.replace(/import\s+\{\s*defineConfig\s*\}\s+from\s+['"]prisma\/config['"]/, 'import { defineConfig, env } from "prisma/config"');
    }
    
    // Update seed command
    content = content.replace(/seed:\s*['"][^'"]+['"]/g, 'seed: "tsx prisma/seed.ts"');
    
    // Update datasource URL if it uses process.env
    content = content.replace(/url:\s*process\.env\.(DATABASE_URL|\[['"]DATABASE_URL['"]\])/g, 'url: env("DATABASE_URL")');

    fs.writeFileSync(prismaConfigPath, content);
    console.log(`Updated ${prismaConfigPath}`);
  }
  
  if (fs.existsSync(packageJsonPath)) {
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.prisma && packageJson.prisma.seed) {
        delete packageJson.prisma.seed;
        if (Object.keys(packageJson.prisma).length === 0) {
            delete packageJson.prisma;
        }
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`Cleaned up package.json for ${dir}`);
    }
  }
}
