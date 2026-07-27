const fs = require('fs');
const path = require('path');
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);

for (const app of apps) {
  const pkgPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.scripts && pkg.scripts.build) {
      if (pkg.scripts.build.includes('tsc && tsc-alias')) {
        pkg.scripts.build = pkg.scripts.build.replace('tsc && tsc-alias', 'tsc-alias');
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log('Fixed ' + app);
      }
    }
  }
}
