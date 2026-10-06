const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      // Exclude node_modules, dist, .git
      if (!f.includes('node_modules') && !f.includes('dist') && !f.includes('.git') && !f.includes('generated')) {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith('.ts')) {
        callback(path.join(dir, f));
      }
    }
  });
}

const workspace = 'C:/Users/Admin/Desktop/daklak-workspace/apps';

const results = [];

walkDir(workspace, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // N+1 Query in Loops: check for `for...of` or `while` containing `await this.prisma` or `await tx.`
  const loopRegex = /(?:for\s*\([\s\S]{1,100}\)|Promise\.all\([\s\S]{1,100}\.map|while\s*\([\s\S]{1,100}\))\s*\{([\s\S]*?)\}/g;
  
  let match;
  while ((match = loopRegex.exec(content)) !== null) {
    const loopBody = match[1];
    if (loopBody.includes('await this.prisma') || loopBody.includes('await tx.')) {
      results.push({
        type: 'N+1 Query Loop',
        file: filePath,
        code: match[0].substring(0, 150) + '...'
      });
    }
  }

  // Large Unchunked Promise.all: look for .map + Promise.all
  const mapRegex = /Promise\.all\(\s*([a-zA-Z0-9_]+)\.map\s*\(([\s\S]{1,100})=>/g;
  while ((match = mapRegex.exec(content)) !== null) {
      // It might not have DB calls, but it's a huge Promise.all risk
      results.push({
        type: 'Potential Large Promise.all without chunking',
        file: filePath,
        code: match[0]
      });
  }

  // O(N^2) Array finding inside another array: array.find or array.filter inside map/forEach/filter
  const nestedArrayRegex = /(?:\.map|\.filter|\.forEach)\s*\([\s\S]{1,50}=>[\s\S]{1,150}(?:\.find|\.filter)\s*\([\s\S]{1,50}=>/g;
  while ((match = nestedArrayRegex.exec(content)) !== null) {
      results.push({
        type: 'O(N^2) Nested Array Lookup',
        file: filePath,
        code: match[0]
      });
  }
});

console.log(JSON.stringify(results, null, 2));
