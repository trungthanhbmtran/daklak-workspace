const fs = require('fs');
const path = require('path');

const nestApps = [
  'chat-service', 'document-service', 
  'hrm-service', 'media-service', 'posts-service', 
  'report-service', 'user-service', 'workflow-service', 'notification_service'
];

nestApps.forEach(app => {
  // Update Prisma schema
  const prismaSchemaPath = path.join('apps', app, 'prisma', 'schema', 'main.prisma');
  if (fs.existsSync(prismaSchemaPath)) {
    let schema = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // Check if engineType is already there
    if (!schema.includes('engineType = "binary"')) {
      schema = schema.replace(
        /provider\s*=\s*"prisma-client-js"/,
        `provider = "prisma-client-js"\n  engineType = "binary"`
      );
      fs.writeFileSync(prismaSchemaPath, schema);
      console.log(`Updated schema in ${app}`);
    }
  }

  // Update Dockerfile to install openssl
  const dockerfilePath = path.join('apps', app, 'Dockerfile');
  if (fs.existsSync(dockerfilePath)) {
    let dockerfile = fs.readFileSync(dockerfilePath, 'utf8');
    
    if (!dockerfile.includes('apt-get install -y openssl')) {
      // Add openssl to builder stage
      dockerfile = dockerfile.replace(
        /# Bắt buộc cài openssl cho Prisma Engine\r?\n/,
        `# Bắt buộc cài openssl cho Prisma Engine\nRUN apt-get update -y && apt-get install -y openssl\n\n`
      );
      
      // Add openssl to runner stage
      dockerfile = dockerfile.replace(
        /FROM node:22-slim AS runner\r?\nWORKDIR \/app\r?\n/,
        `FROM node:22-slim AS runner\nWORKDIR /app\n\n# Bắt buộc cài openssl cho Prisma Engine (Runner)\nRUN apt-get update -y && apt-get install -y openssl\n`
      );
      
      fs.writeFileSync(dockerfilePath, dockerfile);
      console.log(`Updated Dockerfile in ${app}`);
    }
  }
});

// Also update api-gateway Dockerfile (it doesn't have prisma, but just in case or if it needs it)
// Wait, api-gateway doesn't use prisma, but let's check its Dockerfile
const apiGatewayDockerfilePath = path.join('apps', 'api-gateway', 'Dockerfile');
if (fs.existsSync(apiGatewayDockerfilePath)) {
    let dockerfile = fs.readFileSync(apiGatewayDockerfilePath, 'utf8');
    if (dockerfile.includes('# Bắt buộc cài openssl cho Prisma Engine') && !dockerfile.includes('apt-get install -y openssl')) {
      dockerfile = dockerfile.replace(
        /# Bắt buộc cài openssl cho Prisma Engine\r?\n/,
        `# Bắt buộc cài openssl cho Prisma Engine\nRUN apt-get update -y && apt-get install -y openssl\n\n`
      );
      dockerfile = dockerfile.replace(
        /FROM node:22-slim AS runner\r?\nWORKDIR \/app\r?\n/,
        `FROM node:22-slim AS runner\nWORKDIR /app\n\n# Bắt buộc cài openssl cho Prisma Engine (Runner)\nRUN apt-get update -y && apt-get install -y openssl\n`
      );
      fs.writeFileSync(apiGatewayDockerfilePath, dockerfile);
      console.log(`Updated Dockerfile in api-gateway`);
    }
}
