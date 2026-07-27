const fs = require('fs');
const path = require('path');
const appsDir = path.join(__dirname, 'apps');
const apps = fs.readdirSync(appsDir);

for (const app of apps) {
  const pkgPath = path.join(appsDir, app, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.scripts && pkg.scripts.build && pkg.scripts.build.includes('nest build')) {
      const copySnippet = 'node -e \"const fs=require(\'fs\'); const src=\'src/generated\'; if(fs.existsSync(src)){ [\'dist/src/generated\', \'dist/apps/' + app + '/src/generated\'].forEach(d => { fs.mkdirSync(d, {recursive:true}); fs.cpSync(src, d, {recursive:true}); }); }\"';
      
      pkg.scripts.build = 'npx prisma generate && nest build && ' + copySnippet + ' && tsc-alias';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('Fixed cp in ' + app);
    }
  }
}
