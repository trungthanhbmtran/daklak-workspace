import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { WorkflowEngine } from '@domain/engine/workflow-engine';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class StartWorkflowUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: {
    workflowId: string;
    entityType: string;
    entityId: string;
    initialContext?: any;
    initiatorId?: string;
  }) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id: data.workflowId },
      include: {
        nodes: { include: { assignments: true, actions: true } },
        edges: true
      }
    });

    if (!workflow) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Workflow not found' });
    }

    const definitionForEngine = this.buildEngineDefinition(workflow);
    const engine = new WorkflowEngine(definitionForEngine, workflow.id);
    const initialNodeId = engine.getInitialNodeId();

    if (!initialNodeId) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: 'Workflow definition has no initial node' });
    }

    // execute initial node (e.g. StartNode)
    let workflowContext: import('@domain/plugins/node.plugin').WorkflowContext = {
      workflowId: workflow.id,
      workflowVersion: workflow.version,
      entityType: data.entityType,
      entityId: data.entityId,
      variables: data.initialContext || {},
      currentUser: data.initiatorId ? { id: data.initiatorId, roles: [] } : undefined
    };
    
    workflowContext = await engine.executeNode(initialNodeId, workflowContext);

    // Auto-traverse from start node to the next valid node based on conditions
    const nextNodeId = engine.getNextNodeId(initialNodeId, '', workflowContext.variables);
    const activeNodeId = nextNodeId || initialNodeId;

    if (activeNodeId !== initialNodeId) {
      workflowContext = await engine.executeNode(activeNodeId, workflowContext);
    }
    
    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId: workflow.id,
        entityType: data.entityType,
        entityId: data.entityId,
        status: 'RUNNING',
        currentNodeId: activeNodeId,
        variables: workflowContext.variables || {},
        tasks: {
          create: [{
            nodeId: activeNodeId,
            assigneeId: data.initiatorId,
            status: 'Pending'
          }]
        }
      },
      include: { workflow: { select: { name: true } } }
    });

    return {
      id: instance.id,
      workflowId: instance.workflowId,
      status: instance.status,
      currentNodeId: instance.currentNodeId,
      context: instance.variables,
      workflowName: instance.workflow.name,
    };
  }

  private buildEngineDefinition(workflow: any): any {
    return {
      nodes: (workflow.nodes || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        data: n.properties || {}
      })),
      edges: (workflow.edges || []).map((e: any) => ({
        source: e.sourceNodeId,
        target: e.targetNodeId,
        label: e.condition || '',
        data: e.properties || {}
      }))
    };
  }
}
