const fs = require('fs');
const glob = require('glob');

function fixCrashes(dir) {
    const files = glob.sync(`${dir}/**/*.tsx`);
    
    for (const file of files) {
        if (file.includes('node_modules') || file.includes('.next')) continue;
        
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // In .tsx files, useQuery data can be undefined.
        // We revert the replacements for res.data / response.data
        // Because the rule "Không lạm dụng Optional Chaining" is strictly for the API/Axios layer,
        // not the UI rendering layer where React Query initialData is undefined.
        
        // This is a naive revert but should fix the crashes
        content = content.replace(/= response\.data;/g, '= response?.data || [];');
        content = content.replace(/= res\.data;/g, '= res?.data || [];');
        content = content.replace(/res\.data\.map/g, '(res?.data || []).map');
        content = content.replace(/response\.data\.map/g, '(response?.data || []).map');
        
        content = content.replace(/res\.data/g, '(res?.data || [])');
        content = content.replace(/response\.data/g, '(response?.data || [])');

        // Clean up double fallbacks if they accidentally occur
        content = content.replace(/\(\(res\?\.data \|\| \[\]\)\?\.data \|\| \[\]\)/g, '(res?.data || [])');
        content = content.replace(/\(\(response\?\.data \|\| \[\]\)\?\.data \|\| \[\]\)/g, '(response?.data || [])');

        // Fix data.items
        content = content.replace(/data\?\.items;/g, 'data?.items || [];');
        content = content.replace(/data\.items/g, '(data?.items || [])');
        
        // Special variables from previous script
        content = content.replace(/const dynamicCategoriesList = dynamicCategories;/g, 'const dynamicCategoriesList = dynamicCategories || [];');
        content = content.replace(/const dynamicPosts = dynamicPostsRes as Post\[\];/g, 'const dynamicPosts = (dynamicPostsRes || []) as Post[];');
        content = content.replace(/const dynamicUnitsList = dynamicUnitsRes;/g, 'const dynamicUnitsList = dynamicUnitsRes || [];');
        content = content.replace(/flattenUnits\(res\)/g, 'flattenUnits(res || [])');
        
        // Remove excessive parens if we added them to a simple assignment
        content = content.replace(/= \((res\?\.data \|\| \[\])\)/g, '= $1');
        content = content.replace(/= \((response\?\.data \|\| \[\])\)/g, '= $1');
        content = content.replace(/= \((data\?\.items \|\| \[\])\)/g, '= $1');

        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed UI fallbacks in', file);
        }
    }
}

fixCrashes('c:/Users/Admin/Desktop/daklak-workspace/apps/admin_khcn');
