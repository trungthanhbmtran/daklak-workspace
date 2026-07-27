const fs = require('fs');
const path = require('path');

const seedTsPath = path.join(__dirname, 'apps', 'user-service', 'prisma', 'seed.ts');
const seedsDir = path.join(__dirname, 'apps', 'user-service', 'prisma', 'seeds');

if (!fs.existsSync(seedsDir)) {
  fs.mkdirSync(seedsDir, { recursive: true });
}

// Ensure the directory is empty for clean run
for (const file of fs.readdirSync(seedsDir)) {
    fs.unlinkSync(path.join(seedsDir, file));
}

const content = fs.readFileSync(seedTsPath, 'utf8');

const mainIndex = content.indexOf('async function main() {');
const mainEndIndex = content.lastIndexOf('main()');
const mainBody = content.substring(mainIndex + 'async function main() {'.length, mainEndIndex);

// Split by "// X. SOMETHING" format
const parts = mainBody.split(/\/\/ ==========================================================\s*\n\s*\/\/\s*([0-9]+\.\s*[A-Z0-9 _-]+(?:\([^)]+\))?)\s*\n\s*\/\/ ==========================================================/g);

let indexTsContent = `import { PrismaClient } from '../../src/generated/prisma/client';\n\n`;
let runSeedsBody = `export async function runSeeds(prisma: PrismaClient) {\n`;

let counter = 1;

// parts[0] is the content before the first header (e.g. passwordHash)
const prologue = parts[0];

for (let i = 1; i < parts.length; i += 2) {
  if (i + 1 >= parts.length) break;
  const header = parts[i];
  const block = parts[i + 1];
  
  let name = header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^[0-9]+-/, '');
  
  if (name.length < 2) name = `block-${counter}`;
  
  const functionName = `seed${name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
  const fileName = `${String(counter).padStart(2, '0')}-${name}.seed.ts`;
  
  let fileContent = `import { PrismaClient } from '../../src/generated/prisma/client';\nimport * as bcrypt from 'bcrypt';\n\n`;
  fileContent += `export async function ${functionName}(prisma: PrismaClient) {\n`;
  
  if (block.includes('passwordHash')) {
    fileContent += `  const DEFAULT_PASSWORD = 'Admin@123';\n  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);\n`;
  }
  
  fileContent += `  ${block}`;
  // Remove the trailing '}\n\n' if it's the last block
  if (i + 2 >= parts.length) {
      fileContent = fileContent.replace(/}\s*$/g, '');
  }
  fileContent += `\n}\n`;
  
  fs.writeFileSync(path.join(seedsDir, fileName), fileContent);
  console.log(`Created ${fileName}`);
  
  indexTsContent += `import { ${functionName} } from './${fileName.replace('.ts', '')}';\n`;
  runSeedsBody += `  console.log('Running ${functionName}...');\n  await ${functionName}(prisma);\n`;
  
  counter++;
}

runSeedsBody += `}\n`;
fs.writeFileSync(path.join(seedsDir, 'index.ts'), indexTsContent + '\n' + runSeedsBody);

// Create the new seed.ts
const newSeedTs = `import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { runSeeds } from './seeds';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({ url }),
});

async function main() {
  console.log('🌱 START COMPREHENSIVE E-GOV SEED');
  await runSeeds(prisma);
  console.log('✅ Seed completed successfully.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
`;

fs.writeFileSync(seedTsPath, newSeedTs);
console.log('Updated seed.ts');
