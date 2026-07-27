const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const dirs = fs.readdirSync(appsDir);

for (const dir of dirs) {
  const dockerfile = path.join(appsDir, dir, 'Dockerfile');
  if (fs.existsSync(dockerfile)) {
    let content = fs.readFileSync(dockerfile, 'utf8');

    // Remove the bad runner COPY we added earlier
    const badRunnerCopyRegex = new RegExp(`COPY --chown=app:app --from=builder /app/apps/${dir}/src/generated \\./dist/src/generated\n?`, 'g');
    content = content.replace(badRunnerCopyRegex, '');

    // Add the builder copy right after npm run build
    if (content.includes('RUN npm run build') && !content.includes('RUN cp -r src/generated $(find dist -type d -name src | head -n 1)/')) {
      content = content.replace(
        'RUN npm run build',
        'RUN npm run build\n# Copy generated Prisma client to the correct compiled src directory\nRUN cp -r src/generated $(find dist -type d -name src | head -n 1)/ || true'
      );
      fs.writeFileSync(dockerfile, content);
      console.log(`Updated Dockerfile in ${dir}`);
    } else {
        // Just write the cleaned content
        fs.writeFileSync(dockerfile, content);
    }
  }
}
