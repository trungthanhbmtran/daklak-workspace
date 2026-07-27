const fs = require('fs');

const nestApps = [
  'api-gateway', 'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service'
];

nestApps.forEach(app => {
  const dockerfilePath = `apps/${app}/Dockerfile`;
  if (fs.existsSync(dockerfilePath)) {
    let dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
    
    // Replace the CMD to point to the nested dist structure created by the new monorepo layout
    dockerfile = dockerfile.replace(/CMD \["node", "dist\/src\/main\.js"\]/g, `CMD ["node", "dist/apps/${app}/src/main.js"]`);
    // Also replace just in case it was "dist/main.js" for some reason
    dockerfile = dockerfile.replace(/CMD \["node", "dist\/main\.js"\]/g, `CMD ["node", "dist/apps/${app}/src/main.js"]`);
    
    fs.writeFileSync(dockerfilePath, dockerfile);
    console.log(`Updated CMD in ${dockerfilePath}`);
  }
});
