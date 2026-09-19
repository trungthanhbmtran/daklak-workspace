const fs = require('fs');
const path = require('path');

function getFiles(dir, ext) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, ext));
    } else if (file.endsWith(ext)) {
      results.push(file);
    }
  });
  return results;
}

// 1. Extract API Endpoints
const controllers = getFiles('apps/api-gateway/src/modules', '.controller.ts');
let apis = [];
controllers.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let basePath = '';
  const controllerMatch = content.match(/@Controller\(['"]([^'"]+)['"]\)/);
  if (controllerMatch) basePath = controllerMatch[1];
  
  const methodRegex = /@(Get|Post|Patch|Put|Delete)\(['"]([^'"]*)['"]\)?/g;
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    const subPath = match[2] || '';
    const fullPath = subPath ? `/${basePath}/${subPath}` : `/${basePath}`;
    const moduleName = path.basename(path.dirname(file));
    const controllerName = path.basename(file, '.controller.ts');
    apis.push({ module: moduleName, controller: controllerName, method, path: fullPath.replace(/\/\//g, '/') });
  }
  
  // also handle @Get() without args
  const emptyMethodRegex = /@(Get|Post|Patch|Put|Delete)\(\)/g;
  while ((match = emptyMethodRegex.exec(content)) !== null) {
    const method = match[1].toUpperCase();
    apis.push({ module: path.basename(path.dirname(file)), controller: path.basename(file, '.controller.ts'), method, path: `/${basePath}` });
  }
});

fs.mkdirSync('scratch', { recursive: true });
fs.writeFileSync('scratch/apis.json', JSON.stringify(apis, null, 2));

// 2. Extract Frontend Pages
const adminPages = getFiles('apps/admin_khcn/app', 'page.tsx');
let routes = [];
adminPages.forEach(file => {
  let route = file.replace(/\\/g, '/').replace('apps/admin_khcn/app', '').replace('/page.tsx', '');
  if (route === '') route = '/';
  routes.push({ app: 'admin_khcn', path: route });
});

const portalPages = getFiles('apps/portal-goverment/app', 'page.tsx');
portalPages.forEach(file => {
  let route = file.replace(/\\/g, '/').replace('apps/portal-goverment/app', '').replace('/page.tsx', '');
  if (route === '') route = '/';
  routes.push({ app: 'portal-goverment', path: route });
});

fs.writeFileSync('scratch/pages.json', JSON.stringify(routes, null, 2));

console.log('Extraction complete. ' + apis.length + ' APIs and ' + routes.length + ' pages found.');
