import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { WorkflowEngine } from '@domain/engine/workflow-engine';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class ResumeWorkflowUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: {
    instanceId: string;
    nodeId: string;
    actionData: any;
    userRoles: string[];
  }) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: data.instanceId },
      include: {
        workflow: {
          include: { nodes: { include: { assignments: true, actions: true } }, edges: true }
        }
      }
    });

    if (!instance) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Instance not found' });
    }

    const definitionForEngine = this.buildEngineDefinition(instance.workflow);
    const engine = new WorkflowEngine(definitionForEngine, instance.workflow.id);

    const actionName = data.actionData?.actionName;
    
    // Find next node
    const nextNodeId = engine.getNextNodeId(data.nodeId, actionName, data.actionData || {});

    if (!nextNodeId) {
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'No valid path found for action ' + actionName });
    }

    let workflowContext: import('@domain/plugins/node.plugin').WorkflowContext = {
      workflowId: instance.workflowId,
      workflowVersion: instance.version,
      entityType: instance.entityType,
      entityId: instance.entityId,
      variables: { ...(typeof instance.variables === 'object' && instance.variables ? instance.variables : {}), ...(data.actionData || {}) },
    };

    workflowContext = await engine.executeNode(nextNodeId, workflowContext);

    const nextNode = engine.getNode(nextNodeId);
    let targetStatus = 'RUNNING';
    if (nextNode && nextNode.data && nextNode.data.targetStatus) {
      targetStatus = nextNode.data.targetStatus;
    } else if (nextNode && (nextNode.type === 'END' || nextNode.type === 'end')) {
      targetStatus = 'COMPLETED';
    }

    const updatedInstance = await this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentNodeId: nextNodeId,
        status: targetStatus,
        variables: workflowContext.variables || {},
        finishedAt: targetStatus === 'COMPLETED' ? new Date() : null,
        tasks: {
          create: [{
            nodeId: nextNodeId,
            status: targetStatus === 'COMPLETED' ? 'Completed' : 'Pending'
          }]
        }
      },
      include: { workflow: { select: { name: true } } }
    });

    return {
      id: updatedInstance.id,
      workflowId: updatedInstance.workflowId,
      status: updatedInstance.status,
      currentNodeId: updatedInstance.currentNodeId,
      context: updatedInstance.variables,
      workflowName: updatedInstance.workflow.name,
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
