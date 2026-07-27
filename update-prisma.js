const fs = require('fs');
const path = require('path');
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);
const PRISMA_VERSION = '^7.9.0';
let changedApps = [];

apps.forEach(app => {
  const pkgPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    let changed = false;

    // Check dependencies
    if (pkg.dependencies) {
      if (pkg.dependencies['prisma'] && pkg.dependencies['prisma'] !== PRISMA_VERSION) {
        pkg.dependencies['prisma'] = PRISMA_VERSION;
        changed = true;
      }
      if (pkg.dependencies['@prisma/client'] && pkg.dependencies['@prisma/client'] !== PRISMA_VERSION) {
        pkg.dependencies['@prisma/client'] = PRISMA_VERSION;
        changed = true;
      }
      if (pkg.dependencies['@prisma/adapter-mariadb'] && pkg.dependencies['@prisma/adapter-mariadb'] !== PRISMA_VERSION) {
        pkg.dependencies['@prisma/adapter-mariadb'] = PRISMA_VERSION;
        changed = true;
      }
    }

    // Check devDependencies
    if (pkg.devDependencies) {
      if (pkg.devDependencies['prisma'] && pkg.devDependencies['prisma'] !== PRISMA_VERSION) {
        pkg.devDependencies['prisma'] = PRISMA_VERSION;
        changed = true;
      }
      if (pkg.devDependencies['@prisma/client'] && pkg.devDependencies['@prisma/client'] !== PRISMA_VERSION) {
        pkg.devDependencies['@prisma/client'] = PRISMA_VERSION;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      changedApps.push(app);
    }
  }
});
console.log(changedApps.join(','));
