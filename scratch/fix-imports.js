const fs = require('fs');

const filesToFix = [
    'c:/Users/Admin/Desktop/daklak-workspace/apps/user-service/src/modules/menus/menus.controller.ts',
    'c:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/banners/banners.controller.ts',
    'c:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/categories/categories.controller.ts',
    'c:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/interactions/interactions.controller.ts',
    'c:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/portal-config/portal-config.controller.ts',
    'c:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules/portal-menu/portal-menu.controller.ts'
];

for (const file of filesToFix) {
    let content = fs.readFileSync(file, 'utf8');

    // Fix _@Payload() data...
    if (content.includes('_@Payload() data')) {
        content = content.replace(/_@Payload\(\) data/g, '@Payload() _data');
    }

    // Fix missing Payload import
    if (!content.includes('Payload')) {
        // Just add it to the top
        content = `import { Payload } from '@nestjs/microservices';\n` + content;
    } else if (!content.includes('import { Payload') && !content.includes(', Payload') && !content.includes('Payload }')) {
        // It has @Payload() but no import. Let's add the import.
        if (content.includes('@nestjs/microservices')) {
            content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]@nestjs\/microservices['"]/g, "import { $1, Payload } from '@nestjs/microservices'");
        } else {
            content = `import { Payload } from '@nestjs/microservices';\n` + content;
        }
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed imports for', file);
}
