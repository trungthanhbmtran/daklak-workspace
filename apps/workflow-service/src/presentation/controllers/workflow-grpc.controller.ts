import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod, RpcException, ClientProxy } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PrismaService } from '@/database/prisma.service';
import { WorkflowEngine } from '@domain/engine/workflow-engine';

@Controller()
export class WorkflowGrpcController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientProxy,
  ) { }

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
              properties: e.properties || {},
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
      if ((data.nodes && data.nodes.length > 0) || (data.edges && data.edges.length > 0)) {
        await this.prisma.workflowNode.deleteMany({ where: { workflowId: data.id } });
        await this.prisma.workflowEdge.deleteMany({ where: { workflowId: data.id } });
        await this.prisma.workflowVariable.deleteMany({ where: { workflowId: data.id } });
      }

      const workflow = await this.prisma.workflowDefinition.update({
        where: { id: data.id },
        data: {
          code: data.code || undefined,
          name: data.name || undefined,
          description: data.description || undefined,
          version: data.version || undefined,
          status: data.status || undefined,
          ...(data.nodes && data.nodes.length > 0 ? {
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
          ...(data.edges && data.edges.length > 0 ? {
            edges: {
              create: data.edges.map(e => ({
                sourceNodeId: `${data.id}_${e.sourceNodeId}`,
                targetNodeId: `${data.id}_${e.targetNodeId}`,
                condition: e.condition,
                properties: e.properties || {},
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

  @GrpcMethod('WorkflowService', 'ListModules')
  async listModules(_data: any) {
    const workflows = await this.prisma.workflowDefinition.findMany({
      where: { status: 'Published' },
      select: { id: true, code: true, name: true, description: true, updatedAt: true }
    });
    // Loại bỏ các workflow đã bị archived (code chứa _OLD_)
    const activeModules = workflows.filter(w => w.code && !w.code.includes('_OLD_'));
    return { items: activeModules };
  }

  @GrpcMethod('WorkflowService', 'PublishWorkflow')
  async publishWorkflow(data: { id: string }) {
    try {
      console.log('[WorkflowService] Publishing workflow:', data.id);
      const workflow = await this.prisma.workflowDefinition.update({
        where: { id: data.id },
        data: { status: 'Published' },
        include: {
          nodes: { include: { assignments: true, actions: true } },
          edges: true,
          variables: true
        }
      });

      // Emit cache invalidation event
      this.redisClient.emit('WORKFLOW_UPDATED', {
        workflowId: workflow.id,
        code: workflow.code
      });

      return this.mapWorkflow(workflow);
    } catch (e: any) {
      console.error('[WorkflowService] Publish error:', e);
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'ApplyModule')
  async applyModule(data: { id: string; moduleCode: string }) {
    try {
      console.log('[WorkflowService] Applying module:', data.moduleCode, 'to workflow:', data.id);

      // Tìm workflow hiện tại đang dùng module code này (nếu có) → đánh dấu deprecated
      const existingWithCode = await this.prisma.workflowDefinition.findMany({
        where: {
          code: data.moduleCode,
          id: { not: data.id }
        },
        select: { id: true }
      });

      // Đổi code của workflow cũ để giải phóng slot (thêm _OLD_ prefix)
      for (const old of existingWithCode) {
        await this.prisma.workflowDefinition.update({
          where: { id: old.id },
          data: {
            code: `${data.moduleCode}_OLD_${Date.now()}`,
            status: 'Archived'
          }
        });
      }

      // Cập nhật workflow mới: set code = moduleCode + Published
      const workflow = await this.prisma.workflowDefinition.update({
        where: { id: data.id },
        data: {
          code: data.moduleCode,
          status: 'Published'
        },
        include: {
          nodes: { include: { assignments: true, actions: true } },
          edges: true,
          variables: true
        }
      });

      // Emit event để invalidate cache trong các service khác
      this.redisClient.emit('WORKFLOW_UPDATED', {
        workflowId: workflow.id,
        code: workflow.code
      });
      // Emit thêm event cho từng workflow cũ
      for (const old of existingWithCode) {
        this.redisClient.emit('WORKFLOW_UPDATED', {
          workflowId: old.id,
          code: data.moduleCode // old code cần invalidate
        });
      }

      return this.mapWorkflow(workflow);
    } catch (e: any) {
      console.error('[WorkflowService] ApplyModule error:', e);
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
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
    const { StartWorkflowUseCase } = require('../../application/usecases/start-workflow.usecase');
    const useCase = new StartWorkflowUseCase(this.prisma);
    return await useCase.execute({
      workflowId: data.workflowId,
      entityType: data.businessType || 'UNKNOWN',
      entityId: data.businessId || 'UNKNOWN',
      initialContext: data.initialContext,
      initiatorId: data.initiatorId,
    });
  }

  @GrpcMethod('WorkflowService', 'ValidateAction')
  async validateAction(data: {
    instanceId?: string;
    workflowId?: string;
    currentNodeId?: string;
    actionName: string;
    userRoles: string[];
    userId: string;
    businessData: any;
  }) {
    let workflow: any;
    let currentNodeId = data.currentNodeId;

    if (data.instanceId) {
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
      workflow = instance.workflow;
      currentNodeId = instance.currentNodeId || undefined;
    } else if (data.workflowId) {
      workflow = await this.prisma.workflowDefinition.findUnique({
        where: { id: data.workflowId },
        include: {
          nodes: { include: { assignments: true, actions: true } },
          edges: true
        }
      });
    }

    if (!workflow || !currentNodeId) {
      return { allowed: false, reason: 'Missing workflow or current node' };
    }

    const definitionForEngine = this.buildEngineDefinition(workflow);
    const engine = new WorkflowEngine(definitionForEngine, workflow.id);
    const result = engine.validateAction(
      currentNodeId,
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

  @GrpcMethod('WorkflowService', 'GetNextNode')
  async getNextNode(data: {
    workflowId: string;
    currentNodeId: string;
    actionName: string;
    evalContext: any;
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
    
    const nextNodeId = engine.getNextNodeId(data.currentNodeId, data.actionName, data.evalContext || {});
    if (!nextNodeId) {
      return { nextNodeId: '' }; // no path found
    }
    const nextNode = engine.getNode(nextNodeId);

    return {
      nextNodeId,
      nextNodeData: nextNode?.data ? JSON.stringify(nextNode.data) : '{}',
      type: nextNode?.type || ''
    };
  }

  @GrpcMethod('WorkflowService', 'GetInitialNode')
  async getInitialNode(data: { workflowId: string }) {
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
    if (!initialNodeId) return { initialNodeId: '' };

    const node = engine.getNode(initialNodeId);
    return {
      initialNodeId,
      nodeData: node?.data ? JSON.stringify(node.data) : '{}'
    };
  }

  @GrpcMethod('WorkflowService', 'GetAllowedActions')
  async getAllowedActions(data: {
    workflowId: string;
    currentNodeId: string;
    userRoles: string[];
    userId: string;
    businessData: any;
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
    const allowed = engine.getAllowedActions(
      data.currentNodeId,
      data.userRoles || [],
      data.userId,
      data.businessData || {}
    );
    return { actions: allowed };
  }

  @GrpcMethod('WorkflowService', 'ResumeWorkflow')
  async resumeWorkflow(data: {
    instanceId: string;
    nodeId: string;
    actionData: any;
    userRoles: string[];
  }) {
    const { ResumeWorkflowUseCase } = require('../../application/usecases/resume-workflow.usecase');
    const useCase = new ResumeWorkflowUseCase(this.prisma);
    return await useCase.execute({
      instanceId: data.instanceId,
      nodeId: data.nodeId,
      actionData: data.actionData,
      userRoles: data.userRoles,
    });
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
        label: e.condition || '', // map condition to label for simplicity if engine uses it
        data: e.properties || {}
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
        propertiesJson: n.properties ? JSON.stringify(n.properties) : '{}',
        order: n.order,
        assignments: (n.assignments || []).map((a: any) => ({ id: a.id, type: a.type, value: a.value })),
        actions: (n.actions || []).map((a: any) => ({ id: a.id, actionType: a.actionType, service: a.service, action: a.action, payloadTemplate: a.payloadTemplate || {}, order: a.order }))
      })),
      edges: (w.edges || []).map((e: any) => ({
        id: e.id,
        sourceNodeId: e.sourceNodeId,
        targetNodeId: e.targetNodeId,
        condition: e.condition || '',
        propertiesJson: e.properties ? JSON.stringify(e.properties) : '{}',
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
