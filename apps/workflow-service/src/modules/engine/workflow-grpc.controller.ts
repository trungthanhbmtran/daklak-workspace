import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod, RpcException, ClientProxy } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PrismaService } from '@/database/prisma.service';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';

@Controller()
export class WorkflowGrpcController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientProxy,
  ) {}

  // --- CRUD Operations ---

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(data: {
    code: string;
    name: string;
    description?: string;
    version?: number;
    status?: string;
    createdBy?: string;
    nodes?: any[];
    edges?: any[];
    variables?: any[];
  }) {
    try {
      console.log('[WorkflowService] Creating workflow:', data.code);

      const workflow = await this.prisma.workflowDefinition.create({
        data: {
          code: data.code,
          name: data.name,
          description: data.description,
          version: data.version || 1,
          status: data.status || 'Draft',
          createdBy: data.createdBy,
          nodes: {
            create: (data.nodes || []).map(n => ({
              id: `${data.code}_${n.nodeKey}`,
              nodeKey: n.nodeKey,
              type: n.type,
              name: n.name,
              x: n.x || 0,
              y: n.y || 0,
              properties: n.properties || {},
              order: n.order || 0,
              assignments: {
                create: (n.assignments || []).map(a => ({
                  type: a.type,
                  value: a.value
                }))
              },
              actions: {
                create: (n.actions || []).map(a => ({
                  actionType: a.actionType,
                  service: a.service,
                  action: a.action,
                  payloadTemplate: a.payloadTemplate || {},
                  order: a.order || 0
                }))
              }
            }))
          },
          edges: {
            create: (data.edges || []).map(e => ({
              sourceNodeId: `${data.code}_${e.sourceNodeId}`,
              targetNodeId: `${data.code}_${e.targetNodeId}`,
              condition: e.condition,
              priority: e.priority || 0,
              defaultFlow: e.defaultFlow || false
            }))
          },
          variables: {
            create: (data.variables || []).map(v => ({
              key: v.key,
              type: v.type,
              defaultValue: v.defaultValue || {}
            }))
          }
        },
        include: {
          nodes: { include: { assignments: true, actions: true } },
          edges: true,
          variables: true
        }
      });
      return this.mapWorkflow(workflow);
    } catch (e: any) {
      console.error('[WorkflowService] Create error:', e);
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(data: {
    id: string;
    code?: string;
    name?: string;
    description?: string;
    version?: number;
    status?: string;
    nodes?: any[];
    edges?: any[];
    variables?: any[];
  }) {
    try {
      console.log('[WorkflowService] Updating workflow:', data.id);

      // Simple implementation: delete related and recreate if nodes/edges provided
      if (data.nodes || data.edges) {
        await this.prisma.workflowNode.deleteMany({ where: { workflowId: data.id } });
        await this.prisma.workflowEdge.deleteMany({ where: { workflowId: data.id } });
        await this.prisma.workflowVariable.deleteMany({ where: { workflowId: data.id } });
      }

      const workflow = await this.prisma.workflowDefinition.update({
        where: { id: data.id },
        data: {
          code: data.code,
          name: data.name,
          description: data.description,
          version: data.version,
          status: data.status,
          ...(data.nodes ? {
            nodes: {
              create: data.nodes.map(n => ({
                id: `${data.id}_${n.nodeKey}`,
                nodeKey: n.nodeKey,
                type: n.type,
                name: n.name,
                x: n.x || 0,
                y: n.y || 0,
                properties: n.properties || {},
                order: n.order || 0,
                assignments: {
                  create: (n.assignments || []).map(a => ({
                    type: a.type,
                    value: a.value
                  }))
                },
                actions: {
                  create: (n.actions || []).map(a => ({
                    actionType: a.actionType,
                    service: a.service,
                    action: a.action,
                    payloadTemplate: a.payloadTemplate || {},
                    order: a.order || 0
                  }))
                }
              }))
            }
          } : {}),
          ...(data.edges ? {
            edges: {
              create: data.edges.map(e => ({
                sourceNodeId: `${data.id}_${e.sourceNodeId}`,
                targetNodeId: `${data.id}_${e.targetNodeId}`,
                condition: e.condition,
                priority: e.priority || 0,
                defaultFlow: e.defaultFlow || false
              }))
            }
          } : {}),
          ...(data.variables ? {
            variables: {
              create: data.variables.map(v => ({
                key: v.key,
                type: v.type,
                defaultValue: v.defaultValue || {}
              }))
            }
          } : {})
        },
        include: {
          nodes: { include: { assignments: true, actions: true } },
          edges: true,
          variables: true
        }
      });

      const mappedWorkflow = this.mapWorkflow(workflow);
      
      this.redisClient.emit('WORKFLOW_UPDATED', {
        workflowId: mappedWorkflow.id,
        code: mappedWorkflow.code
      });

      return mappedWorkflow;
    } catch (e: any) {
      console.error('[WorkflowService] Update error:', e);
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'FindOneWorkflow')
  async findOneWorkflow(data: { id: string }) {
    const workflow = await this.prisma.workflowDefinition.findUnique({
      where: { id: data.id },
      include: {
        nodes: { include: { assignments: true, actions: true } },
        edges: true,
        variables: true
      }
    });
    if (!workflow) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Workflow not found',
      });
    }
    return this.mapWorkflow(workflow);
  }

  @GrpcMethod('WorkflowService', 'FindWorkflowByCode')
  async findWorkflowByCode(data: { code: string }) {
    const workflow = await this.prisma.workflowDefinition.findFirst({
      where: { code: data.code, status: 'Published' },
      orderBy: { createdAt: 'desc' },
      include: {
        nodes: { include: { assignments: true, actions: true } },
        edges: true,
        variables: true
      }
    });
    if (!workflow) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Workflow not found for code',
      });
    }
    return this.mapWorkflow(workflow);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(data: { skip?: number; take?: number; search?: string }) {
    const skip = data.skip || 0;
    const take = data.take || 10;
    
    const where: any = {};
    if (data.search) {
      where.OR = [
        { name: { contains: data.search } },
        { description: { contains: data.search } },
        { code: { contains: data.search } }
      ];
    }

    const [idsResult, total] = await Promise.all([
      this.prisma.workflowDefinition.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      this.prisma.workflowDefinition.count({ where }),
    ]);

    const ids = idsResult.map((w) => w.id);
    const workflows =
      ids.length > 0
        ? await this.prisma.workflowDefinition.findMany({
            where: { id: { in: ids } },
            orderBy: { createdAt: 'desc' },
            include: {
              nodes: { include: { assignments: true, actions: true } },
              edges: true,
              variables: true
            }
          })
        : [];

    return {
      items: workflows.map((w) => this.mapWorkflow(w)),
      total,
    };
  }

  @GrpcMethod('WorkflowService', 'DeleteWorkflow')
  async deleteWorkflow(data: { id: string }) {
    await this.prisma.workflowDefinition.delete({ where: { id: data.id } });
    return { success: true };
  }

  @GrpcMethod('WorkflowService', 'ListInstances')
  async listInstances(data: { skip?: number; take?: number; workflowId?: string; status?: string; search?: string }) {
    const skip = data.skip || 0;
    const take = data.take || 10;
    
    const where: any = {};
    if (data.workflowId) where.workflowId = data.workflowId;
    if (data.status) where.status = data.status;
    if (data.search) {
      where.OR = [
        { id: { contains: data.search } },
        { workflow: { name: { contains: data.search } } }
      ];
    }
    
    const [instances, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        skip,
        take,
        orderBy: { startedAt: 'desc' },
        include: { workflow: { select: { name: true } } },
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);

    return {
      items: instances.map(i => ({
        id: i.id,
        workflowId: i.workflowId,
        workflowName: i.workflow?.name || '',
        status: i.status,
        currentNodeId: i.currentNodeId || '',
        context: i.variables || {},
        createdAt: i.startedAt.toISOString(),
        updatedAt: i.finishedAt?.toISOString() || i.startedAt.toISOString(),
      })),
      total
    };
  }

  
  // --- Execution Engine ---

  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(data: {
    workflowId: string;
    initialContext?: any;
    initiatorId?: string;
    businessId?: string;
    businessType?: string;
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

    const initialNode = engine.getNode(initialNodeId);

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId: workflow.id,
        status: 'RUNNING',
        currentNodeId: initialNodeId,
        variables: data.initialContext || {},
        tasks: {
          create: [{
            nodeId: initialNodeId,
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

  @GrpcMethod('WorkflowService', 'ValidateAction')
  async validateAction(data: {
    instanceId: string;
    actionName: string;
    userRoles: string[];
    userId: string;
    businessData: any;
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
    if (!instance.currentNodeId) {
      return { allowed: false, reason: 'Instance has no active node' };
    }

    const definitionForEngine = this.buildEngineDefinition(instance.workflow);
    const engine = new WorkflowEngine(definitionForEngine, instance.workflow.id);
    const result = engine.validateAction(
      instance.currentNodeId,
      data.actionName,
      data.userRoles || [],
      data.userId,
      data.businessData || {}
    );

    return {
      allowed: result.allowed,
      reason: result.reason || ''
    };
  }

  @GrpcMethod('WorkflowService', 'ResumeWorkflow')
  async resumeWorkflow(data: {
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
    const nextNodeId = engine.getNextNodeId(data.nodeId, actionName, data.actionData || {});

    if (!nextNodeId) {
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'No valid path found for action ' + actionName });
    }

    const nextNode = engine.getNode(nextNodeId);
    let targetStatus = 'RUNNING';
    if (nextNode && nextNode.data && nextNode.data.targetStatus) {
      targetStatus = nextNode.data.targetStatus;
    } else if (nextNode && nextNode.type === 'END') {
      targetStatus = 'COMPLETED';
    }

    const updatedInstance = await this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentNodeId: nextNodeId,
        status: targetStatus,
        variables: { ...(typeof instance.variables === 'object' && instance.variables ? instance.variables : {}), ...(data.actionData || {}) },
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

  // --- Helpers ---

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
        label: e.condition || '' // map condition to label for simplicity if engine uses it
      }))
    };
  }

  private mapWorkflow(w: any): any {
    return {
      id: w.id,
      code: w.code,
      name: w.name,
      description: w.description || '',
      version: w.version || 1,
      status: w.status,
      createdBy: w.createdBy || '',
      createdAt: w.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: w.updatedAt?.toISOString() || new Date().toISOString(),
      nodes: (w.nodes || []).map((n: any) => ({
        id: n.id,
        nodeKey: n.nodeKey,
        type: n.type,
        name: n.name,
        x: n.x,
        y: n.y,
        properties: n.properties || {},
        order: n.order,
        assignments: (n.assignments || []).map((a: any) => ({ id: a.id, type: a.type, value: a.value })),
        actions: (n.actions || []).map((a: any) => ({ id: a.id, actionType: a.actionType, service: a.service, action: a.action, payloadTemplate: a.payloadTemplate || {}, order: a.order }))
      })),
      edges: (w.edges || []).map((e: any) => ({
        id: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        condition: e.condition || '',
        priority: e.priority,
        defaultFlow: e.defaultFlow
      })),
      variables: (w.variables || []).map((v: any) => ({
        id: v.id,
        key: v.key,
        type: v.type,
        defaultValue: v.defaultValue || {}
      }))
    };
  }
}
