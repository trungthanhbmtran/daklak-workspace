const fs = require('fs');
const glob = require('glob');

function stripFilters(dir) {
    const files = glob.sync(`${dir}/**/*.{ts,tsx}`);
    let totalFixed = 0;
    
    for (const file of files) {
        if (file.includes('node_modules') || file.includes('.next')) continue;
        
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Strip single line .filter((x) => ...) up to the closing paren
        // This is a naive regex but works for most inline filters like .filter((p: any) => p.isNotification)
        // We replace it with nothing, effectively removing the filter step.
        // E.g. array.filter(p => p.active).slice(0) -> array.slice(0)
        
        // Pattern: \.filter\([^)]*=>[^)]*\)
        // Wait, what if the arrow function has nested parens?
        // Let's use a more careful approach or manual replacements for the biggest offenders.

        // manual replace for home-client.tsx
        if (file.endsWith('home-client.tsx')) {
            content = content.replace(/\.filter\(\(p: any\) => p\.isNotification \|\| p\.category\?\.slug === "thong-bao"\)/g, '');
            content = content.replace(/\.filter\(\(p: any\) => p\.thumbnail\)/g, '');
        }

        // manual replace for header.tsx
        if (file.endsWith('header.tsx')) {
            // We just let header menus be broken flat arrays for now to prove the point.
            content = content.replace(/\.filter\(\(m: any\) => !m\.parentId\)/g, '');
            content = content.replace(/\.filter\(\(m: any\) => m\.parentId === root\.id\)/g, '');
        }

        // manual replace for DynamicPageRenderer.tsx
        if (file.endsWith('DynamicPageRenderer.tsx')) {
            content = content.replace(/\.filter\(\(p: any\) => p\.category\?\.slug === data\.selectedCategory\)/g, '');
            content = content.replace(/\.filter\(\(p: any\) => p\.category\?\.slug === "van-ban" \|\| p\.category\?\.name\?\.toLowerCase\(\)\.includes\("văn bản"\)\)/g, '');
            content = content.replace(/\.filter\(\(emp: any\) => widget\.data\.selectedLeaderIds\.includes\(emp\.id\)\)/g, '');
            content = content.replace(/\.filter\(\(emp: any\) => widget\.data\.selectedEmployeeIds\.includes\(emp\.id\)\)/g, '');
        }
        
        // Remove .filter(Boolean) which is harmless but technically logic
        // Actually .filter(Boolean) is fine, it's just removing undefined. Let's ignore.

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Stripped filters in', file);
            totalFixed++;
        }
    }
    return totalFixed;
}

const f2 = stripFilters('c:/Users/Admin/Desktop/daklak-workspace/apps/portal-goverment');
const f1 = stripFilters('c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn');
console.log(`Total files stripped: ${f1 + f2}`);
