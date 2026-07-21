const fs = require('fs');
const glob = require('glob');

function cleanFallbacks(dir) {
    const files = glob.sync(`${dir}/**/*.{ts,tsx}`);
    let totalFixed = 0;
    
    for (const file of files) {
        if (file.includes('node_modules') || file.includes('.next')) continue;
        
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Replace res?.data || [] -> res.data
        content = content.replace(/res\?\.data\s*\|\|\s*\[\]/g, 'res.data');
        content = content.replace(/res\.data\s*\|\|\s*\[\]/g, 'res.data');
        content = content.replace(/response\?\.data\s*\|\|\s*\[\]/g, 'response.data');
        content = content.replace(/response\.data\s*\|\|\s*\[\]/g, 'response.data');
        
        // Also remove fallback from variable assignments from data?.items || []
        content = content.replace(/data\?\.items\s*\|\|\s*\[\]/g, 'data?.items');
        content = content.replace(/data\.items\s*\|\|\s*\[\]/g, 'data.items');
        
        // Custom stuff seen in grep
        content = content.replace(/\(res\s*\|\|\s*\[\]\)/g, 'res');
        content = content.replace(/\(dynamicPostsRes\s*\|\|\s*\[\]\)/g, 'dynamicPostsRes');
        content = content.replace(/dynamicCategories\s*\|\|\s*\[\]/g, 'dynamicCategories');
        content = content.replace(/dynamicUnitsRes\s*\|\|\s*\[\]/g, 'dynamicUnitsRes');
        
        // (portalConfigData || [])
        content = content.replace(/\(portalConfigData\s*\|\|\s*\[\]\)/g, '(portalConfigData)');
        
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
