import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod, RpcException, ClientProxy } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { PrismaService } from '@/database/prisma.service';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';

export interface WorkflowDefinition {
  nodes: any[];
  edges: any[];
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  definition: WorkflowDefinition;
  trigger: string;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

@Controller()
export class WorkflowGrpcController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientProxy,
  ) {}

  private ensureValidDefinition(def: any): any {
    if (!def) return { nodes: [], edges: [] };

    let result = def;
    if (typeof def === 'string') {
      try {
        result = JSON.parse(def);
      } catch (e) {
        return { nodes: [], edges: [] };
      }
    }

    return {
      nodes: Array.isArray(result.nodes) ? result.nodes : [],
      edges: Array.isArray(result.edges) ? result.edges : [],
    };
  }

  // --- CRUD Operations ---

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(data: {
    name: string;
    description?: string;
    definition?: string;
    trigger?: string;
  }) {
    try {
      console.log('[WorkflowService] Creating workflow:', data.name);
      const definition = this.ensureValidDefinition(data.definition);

      const workflow = await this.prisma.workflow.create({
        data: {
          name: data.name,
          description: data.description,
          definition: definition,
          trigger: data.trigger || 'MANUAL',
        },
      });
      return this.mapWorkflow(workflow);
    } catch (e) {
      console.error('[WorkflowService] Create error:', e);
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(data: {
    id: string;
    name?: string;
    description?: string;
    definition?: string;
    trigger?: string;
  }) {
    try {
      console.log('[WorkflowService] Updating workflow:', data.id);

      const updateData: any = {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
      };

      if (data.definition) {
        updateData.definition = this.ensureValidDefinition(data.definition);
      }

      const workflow = await this.prisma.workflow.update({
        where: { id: data.id },
        data: updateData,
      });

      const mappedWorkflow = this.mapWorkflow(workflow);
      
      // Phát event qua Redis Pub/Sub để các service khác biết và invalidate cache
      this.redisClient.emit('WORKFLOW_UPDATED', {
        workflowId: mappedWorkflow.id,
        definition: JSON.parse(mappedWorkflow.definition)
      });

      return mappedWorkflow;
    } catch (e) {
      console.error('[WorkflowService] Update error:', e);
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'FindOneWorkflow')
  async findOneWorkflow(data: { id: string }) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: data.id },
    });
    if (!workflow) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Workflow not found',
      });
    }
    return this.mapWorkflow(workflow);
  }

  @GrpcMethod('WorkflowService', 'FindWorkflowByTrigger')
  async findWorkflowByTrigger(data: { trigger: string }) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { trigger: data.trigger, active: true },
      orderBy: { createdAt: 'desc' }
    });
    if (!workflow) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Workflow not found for trigger',
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
        { description: { contains: data.search } }
      ];
    }

    // Optimized via ID-Indexed Deferred Join
    const [idsResult, total] = await Promise.all([
      this.prisma.workflow.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      this.prisma.workflow.count({ where }),
    ]);

    const ids = idsResult.map((w) => w.id);
    const workflows =
      ids.length > 0
        ? await this.prisma.workflow.findMany({
            where: { id: { in: ids } },
            orderBy: { createdAt: 'desc' },
          })
        : [];

    return {
      items: workflows.map((w) => this.mapWorkflow(w)),
      total,
    };
  }

  @GrpcMethod('WorkflowService', 'DeleteWorkflow')
  async deleteWorkflow(data: { id: string }) {
    await this.prisma.workflow.delete({ where: { id: data.id } });
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
        orderBy: { createdAt: 'desc' },
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
        context: i.context || {},
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
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
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: data.workflowId },
    });
    if (!workflow) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Workflow not found' });
    }

    const definition = typeof workflow.definition === 'string' ? JSON.parse(workflow.definition) : workflow.definition;
    const engine = new WorkflowEngine(definition);
    const initialNodeId = engine.getInitialNodeId();

    if (!initialNodeId) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: 'Workflow definition has no initial node' });
    }

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId: workflow.id,
        status: 'RUNNING',
        currentNodeId: initialNodeId,
        context: data.initialContext || {},
        businessId: data.businessId,
        businessType: data.businessType,
        initiatorId: data.initiatorId,
      },
      include: { workflow: { select: { name: true } } }
    });

    const initialNode = engine.getNode(initialNodeId);

    await this.prisma.executionLog.create({
      data: {
        instanceId: instance.id,
        nodeId: initialNodeId,
        nodeType: initialNode?.type || 'START',
        nodeLabel: initialNode?.data?.label || 'Bắt đầu',
        action: 'START',
        data: data.initialContext || {},
      }
    });

    return {
      id: instance.id,
      workflowId: instance.workflowId,
      status: instance.status,
      currentNodeId: instance.currentNodeId,
      context: instance.context,
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
      include: { workflow: true }
    });
    if (!instance) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Instance not found' });
    }
    if (!instance.currentNodeId) {
      return { allowed: false, reason: 'Instance has no active node' };
    }

    const definition = typeof instance.workflow.definition === 'string' ? JSON.parse(instance.workflow.definition) : instance.workflow.definition;
    const engine = new WorkflowEngine(definition);
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
      include: { workflow: true }
    });
    if (!instance) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Instance not found' });
    }

    const definition = typeof instance.workflow.definition === 'string' ? JSON.parse(instance.workflow.definition) : instance.workflow.definition;
    const engine = new WorkflowEngine(definition);
    
    const actionName = data.actionData?.actionName;
    const nextNodeId = engine.getNextNodeId(data.nodeId, actionName, data.actionData || {});

    if (!nextNodeId) {
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: 'No valid path found for action ' + actionName });
    }

    const nextNode = engine.getNode(nextNodeId);
    let targetStatus = 'RUNNING';
    if (nextNode && nextNode.data && nextNode.data.targetStatus) {
      targetStatus = nextNode.data.targetStatus; // Mapping status manually or using the one configured in definition
    } else if (nextNode && nextNode.type === 'END') {
      targetStatus = 'COMPLETED';
    }

    const updatedInstance = await this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentNodeId: nextNodeId,
        status: targetStatus,
        context: { ...(typeof instance.context === 'object' && instance.context ? instance.context : {}), ...(data.actionData || {}) }
      },
      include: { workflow: { select: { name: true } } }
    });

    await this.prisma.executionLog.create({
      data: {
        instanceId: instance.id,
        nodeId: nextNodeId,
        nodeType: nextNode?.type || 'UNKNOWN',
        nodeLabel: nextNode?.data?.label || '',
        action: actionName || 'RESUME',
        data: data.actionData || {},
      }
    });

    return {
      id: updatedInstance.id,
      workflowId: updatedInstance.workflowId,
      status: updatedInstance.status,
      currentNodeId: updatedInstance.currentNodeId,
      context: updatedInstance.context,
      workflowName: updatedInstance.workflow.name,
    };
  }

  // --- Helpers ---

  private mapWorkflow(w: any): any {
    return {
      id: w.id,
      name: w.name,
      description: w.description || '',
      definition: JSON.stringify(w.definition || { nodes: [], edges: [] }),
      trigger: w.trigger || 'MANUAL',
      active: !!w.active,
      version: w.version || 1,
      createdAt: w.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: w.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

}
