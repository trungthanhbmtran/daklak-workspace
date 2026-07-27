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
    
    // Check if it already has the root npm ci
    if (!dockerfile.includes('RUN npm ci\nWORKDIR /app/apps/')) {
        // Find WORKDIR /app/apps/${app} and insert RUN npm ci before it
        dockerfile = dockerfile.replace(
            `WORKDIR /app/apps/${app}`,
            `# Install root dependencies so shared/core can resolve them\nRUN npm ci\n\nWORKDIR /app/apps/${app}`
        );
        fs.writeFileSync(dockerfilePath, dockerfile);
        console.log(`Updated ${dockerfilePath}`);
    }
  }
});
