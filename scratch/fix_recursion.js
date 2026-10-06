const fs = require('fs');
const path = 'C:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/posts/posts.service.ts';
let code = fs.readFileSync(path, 'utf8');

const regex = /public\s+async\s+translateLexicalRecursive\s*\(data:\s*any,\s*translateFn:\s*\(\s*s:\s*string\s*\)\s*=>\s*Promise<string>\s*\):\s*Promise<any>\s*\{[\s\S]*?return\s+data;\s*\}/;

const newFunc = `public async translateLexicalRecursive(data: any, translateFn: (s: string) => Promise<string>, depth = 0): Promise<any> {
    if (!data) return data;
    if (depth > 50) return data; // Prevent Stack Overflow (Algorithm Rule)

    if (depth % 10 === 0 && depth > 0) {
      await new Promise(resolve => setImmediate(resolve)); // Node.js Event Loop Protection
    }

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        data[i] = await this.translateLexicalRecursive(data[i], translateFn, depth + 1);
      }
    } else if (typeof data === 'object') {
      if (data.type === 'text' && typeof data.text === 'string') {
        data.text = await this.translateOnlyTextTags(data.text, translateFn);
      }

      for (const key of Object.keys(data)) {
        if (typeof data[key] === 'object' && data[key] !== null) {
          data[key] = await this.translateLexicalRecursive(data[key], translateFn, depth + 1);
        }
      }
    }

    return data;
  }`;

if (regex.test(code)) {
  code = code.replace(regex, newFunc);
  fs.writeFileSync(path, code);
  console.log("Fixed translateLexicalRecursive stack overflow risk with regex.");
} else {
  console.log("Regex not found in posts.service.ts");
}
