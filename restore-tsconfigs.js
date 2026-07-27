const fs = require('fs');
const { execSync } = require('child_process');

const nestApps = [
  'api-gateway', 'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service'
];

nestApps.forEach(app => {
  const tsconfigPath = `apps/${app}/tsconfig.json`;
  if (fs.existsSync(tsconfigPath)) {
    // Restore from git
    execSync(`git checkout HEAD~1 -- ${tsconfigPath}`);
    
    // Read and modify
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@core/*']) {
      // Just remove the Docker local path hack
      tsconfig.compilerOptions.paths['@core/*'] = ["../../shared/core/*"];
      
      // Also ensure baseUrl is present for relative paths
      if (!tsconfig.compilerOptions.baseUrl) {
          tsconfig.compilerOptions.baseUrl = "./";
      }
    }
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log(`Restored and fixed ${tsconfigPath}`);
  }
});
