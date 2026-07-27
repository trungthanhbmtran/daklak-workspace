const fs = require('fs');

const nestApps = [
  'api-gateway', 'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service'
];

nestApps.forEach(app => {
  const pkgPath = `apps/${app}/package.json`;
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    
    // Add tsc-alias
    if (!pkg.devDependencies) pkg.devDependencies = {};
    pkg.devDependencies['tsc-alias'] = '^1.8.10';
    
    // Unify build script
    if (app === 'api-gateway') {
       pkg.scripts.build = "nest build && tsc && tsc-alias";
    } else {
       pkg.scripts.build = "npx prisma generate && nest build && tsc && tsc-alias";
    }
    
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`Updated ${pkgPath}`);
  }
});
