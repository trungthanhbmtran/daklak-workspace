const fs = require('fs');

const nestApps = [
  'api-gateway', 'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service'
];

nestApps.forEach(app => {
  const tsconfigPath = `apps/${app}/tsconfig.json`;
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@core/*']) {
      // Unify to a single standard path
      tsconfig.compilerOptions.paths['@core/*'] = ["../../shared/core/*"];
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
      console.log(`Updated ${tsconfigPath}`);
    }
  }
});
