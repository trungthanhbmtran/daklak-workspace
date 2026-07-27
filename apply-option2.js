const fs = require('fs');

// 1. Create tsconfig.base.json at root
const baseTsconfig = {
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@core/*": ["shared/core/*"]
    }
  }
};
fs.writeFileSync('tsconfig.base.json', JSON.stringify(baseTsconfig, null, 2) + '\n');
console.log('Created tsconfig.base.json');

const nestApps = [
  'api-gateway', 'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service'
];

nestApps.forEach(app => {
  const tsconfigPath = `apps/${app}/tsconfig.json`;
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    tsconfig.extends = "../../tsconfig.base.json";
    
    if (tsconfig.compilerOptions) {
      delete tsconfig.compilerOptions.paths;
      delete tsconfig.compilerOptions.baseUrl;
    }
    
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log(`Updated ${tsconfigPath}`);
  }

  const dockerfilePath = `apps/${app}/Dockerfile`;
  if (fs.existsSync(dockerfilePath)) {
    let lines = fs.readFileSync(dockerfilePath, 'utf8').split('\n');
    
    let newLines = [];
    let skip = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Look for the COPY package section to replace it
      if (line.includes(`COPY apps/${app}/package*.json ./`)) {
        newLines.push(`COPY package*.json ./`);
        newLines.push(`COPY tsconfig.base.json ./`);
        newLines.push(`COPY shared ./shared`);
        newLines.push(`COPY apps/${app} ./apps/${app}`);
        newLines.push(`WORKDIR /app/apps/${app}`);
        skip = true;
        continue;
      }
      
      // When skipping, look for RUN npm ci
      if (skip) {
        if (line.includes('RUN npm ci')) {
          newLines.push(line);
          skip = false;
          // Skip the old source copying lines that come after it
          let j = i + 1;
          while (j < lines.length && (lines[j].trim() === '' || lines[j].includes('COPY apps/') || lines[j].includes('COPY shared/') || lines[j].includes('[MONOREPO]'))) {
             i++;
             j++;
          }
        }
        continue;
      }
      
      // Replace Runner stage paths
      if (line.includes('COPY --chown=app:app --from=builder /app/dist ./dist')) {
        line = `COPY --chown=app:app --from=builder /app/apps/${app}/dist ./dist`;
      }
      if (line.includes('COPY --chown=app:app --from=builder /app/prisma ./prisma')) {
        line = `COPY --chown=app:app --from=builder /app/apps/${app}/prisma ./prisma`;
      }
      if (line.includes('COPY --chown=app:app --from=builder /app/shared/protos ./protos')) {
        line = `COPY --chown=app:app --from=builder /app/shared/protos ./protos`;
      }
      
      newLines.push(line);
    }
    
    fs.writeFileSync(dockerfilePath, newLines.join('\n'));
    console.log(`Updated ${dockerfilePath}`);
  }
});
