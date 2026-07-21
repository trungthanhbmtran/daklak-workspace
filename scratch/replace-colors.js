const fs = require('fs');
const glob = require('glob');

function replaceColors(dir) {
    const files = glob.sync(`${dir}/**/*.{ts,tsx}`);
    let totalFixed = 0;
    
    for (const file of files) {
        if (file.includes('node_modules') || file.includes('.next')) continue;
        
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // admin_khcn semantic colors
        if (dir.includes('admin_khcn')) {
            content = content.replace(/bg-\[#f8fafc\]/g, 'bg-slate-50');
            content = content.replace(/bg-\[#f1f5f9\]/g, 'bg-slate-100');
            content = content.replace(/bg-\[#0f172a\]/g, 'bg-slate-900');
            content = content.replace(/bg-\[#020617\]/g, 'bg-slate-950');
            content = content.replace(/bg-\[#1e1e1e\]/g, 'bg-zinc-900');
            
            content = content.replace(/text-\[#0056b3\]/g, 'text-gov-trust-blue');
            content = content.replace(/text-\[#cc0000\]/g, 'text-gov-alert-red');
            content = content.replace(/text-\[#fef08a\]/g, 'text-gov-warning-yellow');
        }

        // portal-goverment semantic colors
        if (dir.includes('portal-goverment')) {
            content = content.replace(/text-\[#b91c1c\]/g, 'text-portal-primary');
            content = content.replace(/bg-\[#b91c1c\]/g, 'bg-portal-primary');
            content = content.replace(/border-\[#b91c1c\]/g, 'border-portal-primary');

            // Map yellows to a standard tailwind color or semantic
            content = content.replace(/text-\[#fbc02d\]/g, 'text-yellow-500');
            content = content.replace(/text-\[#fef08a\]/g, 'text-yellow-200');
            content = content.replace(/text-\[#ffde59\]/g, 'text-yellow-300');
            content = content.replace(/text-\[#ffff00\]/g, 'text-yellow-300');
            content = content.replace(/text-\[#f1c40f\]/g, 'text-yellow-400');
            
            content = content.replace(/bg-\[#ffde59\]/g, 'bg-yellow-300');
            content = content.replace(/bg-\[#f1c40f\]/g, 'bg-yellow-400');
            content = content.replace(/bg-\[#fef08a\]/g, 'bg-yellow-200');
            
            content = content.replace(/border-\[#ffe066\]/g, 'border-yellow-200');
            content = content.replace(/border-\[#fef08a\]/g, 'border-yellow-200');

            content = content.replace(/bg-\[#fff9db\]/g, 'bg-yellow-50');
            content = content.replace(/bg-\[#faf8f2\]/g, 'bg-slate-50');
        }

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Replaced colors in', file);
            totalFixed++;
        }
    }
    return totalFixed;
}

const f1 = replaceColors('c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn');
const f2 = replaceColors('c:/Users/Admin/Desktop/daklak-workspace/apps/portal-goverment');
console.log(`Total files with colors replaced: ${f1 + f2}`);
