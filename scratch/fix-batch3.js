const fs = require('fs');
const glob = require('glob');

function fixControllers(dir) {
    const files = glob.sync(`${dir}/**/*.controller.ts`);
    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let modified = false;

        // Replace `data: any` with `@Payload() data: Record<string, any>`
        if (content.includes('data: any')) {
            content = content.replace(/data: any/g, '@Payload() data: Record<string, any>');
            modified = true;
        }

        if (content.includes('_data: any')) {
            content = content.replace(/_data: any/g, '@Payload() _data: Record<string, any>');
            modified = true;
        }

        if (modified) {
            // Make sure Payload is imported from @nestjs/microservices
            if (content.includes('@nestjs/microservices')) {
                if (!content.includes('Payload')) {
                    content = content.replace(/import\s+{\s*GrpcMethod\s*}/, 'import { GrpcMethod, Payload }');
                }
            } else {
                content = `import { Payload } from '@nestjs/microservices';\n` + content;
            }
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed', file);
        }
    }
}

fixControllers('c:/Users/Admin/Desktop/daklak-workspace/apps/user-service/src/modules');
fixControllers('c:/Users/Admin/Desktop/daklak-workspace/apps/posts-service/src/modules');
