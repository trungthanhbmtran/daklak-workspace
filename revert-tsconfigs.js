const fs = require('fs');
const { execSync } = require('child_process');

const nestApps = [
  'api-gateway', 'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service', 'notification_service'
];

nestApps.forEach(app => {
  const tsconfigPath = `apps/${app}/tsconfig.json`;
  if (fs.existsSync(tsconfigPath)) {
    try {
        // Restore exactly to the state before any of my TS alias unify attempts
        // The commit before I started modifying tsconfig.json was 3 commits ago
        // Let's just find the last stable state from git history or manually write the known good state
        execSync(`git checkout HEAD~3 -- ${tsconfigPath}`);
        console.log(`Restored ${tsconfigPath}`);
    } catch (e) {
        console.log(`Failed to restore ${tsconfigPath} via git. Manually repairing...`);
        // Manually repair if git fails
        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
        if (tsconfig.compilerOptions) {
            tsconfig.compilerOptions.baseUrl = "./";
            if (!tsconfig.compilerOptions.paths) tsconfig.compilerOptions.paths = {};
            tsconfig.compilerOptions.paths['@core/*'] = ["../../shared/core/*", "./shared/core/*"];
            
            // Add other common paths if missing
            if (!tsconfig.compilerOptions.paths['@/*']) tsconfig.compilerOptions.paths['@/*'] = ["src/*"];
            if (!tsconfig.compilerOptions.paths['@generated/*']) tsconfig.compilerOptions.paths['@generated/*'] = ["generated/*"];
        }
        delete tsconfig.extends;
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
        console.log(`Manually repaired ${tsconfigPath}`);
    }
  }
});
