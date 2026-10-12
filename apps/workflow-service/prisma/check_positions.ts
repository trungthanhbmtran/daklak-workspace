import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const mariadbUrl = process.env.DATABASE_URL!.replace(/^mysql:\/\//, 'mariadb://');
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(mariadbUrl) });

async function check() {
  const defs = await prisma.processDefinition.findMany({
    include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
  });
  for (const d of defs) {
    if (d.code.includes('BTCTU')) {
      console.log('=== ' + d.code + ' ===');
      let graph: any = d.versions[0]?.graph;
      if (typeof graph === 'string') graph = JSON.parse(graph);
      if (graph?.nodes) {
        graph.nodes.forEach((n: any) => console.log('  ' + n.id + ' : ' + JSON.stringify(n.position)));
      }
    }
  }
}
check();
