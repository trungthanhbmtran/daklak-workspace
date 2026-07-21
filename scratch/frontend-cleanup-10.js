const fs = require('fs');
const glob = require('glob');

function cleanFallbacks(dir) {
    const files = glob.sync(`${dir}/**/*.{ts,tsx}`);
    let totalFixed = 0;
    
    for (const file of files) {
        if (file.includes('node_modules') || file.includes('.next')) continue;
        
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Replace Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
        content = content.replace(/Array\.isArray\(res\?\.data\)\s*\?\s*res\.data\s*:\s*\(Array\.isArray\(res\)\s*\?\s*res\s*:\s*\[\]\)/g, 'res.data');
        
        // Replace Array.isArray(res?.data) ? res.data : []
        content = content.replace(/Array\.isArray\(res\?\.data\)\s*\?\s*res\.data\s*:\s*\[\]/g, 'res.data');
        
        // Replace res?.data || []
        content = content.replace(/res\?\.data\s*\|\|\s*\[\]/g, 'res.data');
        
        // Replace res.data || []
        content = content.replace(/res\.data\s*\|\|\s*\[\]/g, 'res.data');
        
        // Replace res?.data ?? res
        content = content.replace(/\(res\?\.data\s*\?\?\s*res\)/g, 'res.data');
        
        // Replace res?.data ?? null
        content = content.replace(/res\?\.data\s*\?\?\s*null/g, 'res.data');
        
        // Replace res?.data || null
        content = content.replace(/res\?\.data\s*\|\|\s*null/g, 'res.data');
        
        // Replace res?.data directly (only in safe context like return res?.data;)
        content = content.replace(/return\s+res\?\.data\s*;/g, 'return res.data;');
        content = content.replace(/const\s+(\w+)\s*=\s*res\?\.data\s*;/g, 'const $1 = res.data;');

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Cleaned fallbacks in', file);
            totalFixed++;
        }
    }
    return totalFixed;
}

const f1 = cleanFallbacks('c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn');
const f2 = cleanFallbacks('c:/Users/Admin/Desktop/daklak-workspace/apps/portal-goverment');
console.log(`Total files cleaned: ${f1 + f2}`);
