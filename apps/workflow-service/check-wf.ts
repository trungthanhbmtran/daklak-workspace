import { PrismaClient } from './src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workflow = await prisma.workflow.findUnique({
    where: { id: 'cmum2tymt0000f4eqvr6wbala' }
  });
  
  if (workflow) {
    console.log("Found workflow:", workflow.id, workflow.name);
    console.log("Definition type:", typeof workflow.definition);
    if (workflow.definition) {
       console.log("Definition keys:", Object.keys(workflow.definition as object));
       console.log("Definition stringified:", JSON.stringify(workflow.definition).substring(0, 500));
    }
  } else {
    console.log("Workflow not found");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
