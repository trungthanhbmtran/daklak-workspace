const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const units = await prisma.organizationUnit.findMany({
    include: {
      jobPositions: {
        include: { jobTitle: true, user: true }
      }
    }
  });
  
  const output = units.map(u => ({
    id: u.id,
    name: u.name,
    positions: u.jobPositions.map(p => ({
      user: p.user?.fullName,
      rank: p.jobTitle?.rank,
      title: p.jobTitle?.name
    }))
  }));

  console.log(JSON.stringify(output, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
