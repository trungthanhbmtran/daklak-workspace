import { PrismaClient } from '@generated/prisma/client';
import { WorkflowEngine } from './src/domain/engine/workflow-engine';

const prisma = new PrismaClient();

async function run() {
  const workflow = await prisma.workflowDefinition.findFirst({
    include: {
      nodes: { include: { assignments: true, actions: true } },
      edges: true
    }
  });

  const definitionForEngine = {
    nodes: (workflow?.nodes || []).map((n: any) => ({
      id: n.id,
      type: n.type,
      data: n.properties || {}
    })),
    edges: (workflow?.edges || []).map((e: any) => ({
      source: e.sourceNodeId,
      target: e.targetNodeId,
      label: e.condition || '', 
      data: e.properties || {}
    }))
  };

  const engine = new WorkflowEngine(definitionForEngine, workflow!.id);
  const initialNodeId = engine.getInitialNodeId() as string;
  
  try {
    const nextNodeId = engine.getNextNodeId(initialNodeId, '', { fields: { assigneeCode: { stringValue: 'EMP01' } } });
    console.log("Next node from start:", nextNodeId);
  } catch (err: any) {
    console.log("Error in getNextNodeId:", err.message);
  }
}
run().finally(() => prisma.$disconnect());
