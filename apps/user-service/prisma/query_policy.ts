import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '../src/generated/prisma/client';

const dbUrl = process.env.DATABASE_URL;
const mariadbUrl = dbUrl!.replace(/^mysql:\/\//, 'mariadb://');
const adapter = new PrismaMariaDb(mariadbUrl);
const prisma = new PrismaClient({ adapter });

async function main() {
    const resources = await prisma.resource.findMany();
    const jobTitles = await prisma.jobTitle.findMany();
    const userGroups = await prisma.userGroup.findMany();
    console.log("RESOURCES:");
    console.dir(resources.map(r => r.code), {depth: null});
    console.log("JOB TITLES:");
    console.dir(jobTitles.map(j => ({code: j.code, name: j.name})).slice(0, 5));
    console.log("GROUPS:");
    console.dir(userGroups.map(g => ({id: g.id, name: g.name})));
}

main().catch(console.error).finally(() => prisma.$disconnect());
