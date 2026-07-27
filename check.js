const fs = require('fs');
const apps = fs.readdirSync('apps');
apps.forEach(app => {
  const hasConfig = fs.existsSync(`apps/${app}/prisma.config.ts`);
  const hasSchemaFile = fs.existsSync(`apps/${app}/prisma/schema.prisma`);
  const hasSchemaDir = fs.existsSync(`apps/${app}/prisma/schema`);
  console.log(`${app}: config=${hasConfig}, schema.prisma=${hasSchemaFile}, schema_dir=${hasSchemaDir}`);
});
