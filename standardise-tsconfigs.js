const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const dirs = fs.readdirSync(appsDir);

for (const dir of dirs) {
  const tsconfigPath = path.join(appsDir, dir, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
    }
    
    if (!tsconfig.compilerOptions.paths) {
      tsconfig.compilerOptions.paths = {};
    }
    
    // Standardize paths
    tsconfig.compilerOptions.paths['@core/*'] = ["../../shared/core/*", "./shared/core/*"];
    tsconfig.compilerOptions.paths['@/*'] = ["src/*"];
    tsconfig.compilerOptions.paths['@generated/*'] = ["src/generated/*"];
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log(`Updated paths in ${dir}/tsconfig.json`);
  }
}
