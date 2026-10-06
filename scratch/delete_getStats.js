const fs = require('fs');
const path = 'C:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/posts/posts.service.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /async\s+getStats\s*\(query:\s*\{\s*categoryId\?:\s*string;\s*authorId\?:\s*string\s*\}\s*=\s*\{\}\)\s*\{[\s\S]*?return\s*\{\s*total,[\s\S]*?rejected,[\s\S]*?totalViews,[\s\S]*?\}\s*;\s*\}/;

if (regex.test(code)) {
  code = code.replace(regex, '');
  fs.writeFileSync(path, code);
  console.log("Deleted getStats successfully.");
} else {
  console.log("Regex not found in posts.service.ts");
}
