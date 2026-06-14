import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { WorkflowEngineService } from './workflow-engine.service';
import { PrismaService } from '@/database/prisma.service';

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
    private readonly engine: WorkflowEngineService,
    private readonly prisma: PrismaService,
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
      return this.mapWorkflow(workflow);
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

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(data: { skip?: number; take?: number }) {
    const skip = data.skip || 0;
    const take = data.take || 10;
    // Optimized via ID-Indexed Deferred Join
    const [idsResult, total] = await Promise.all([
      this.prisma.workflow.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      this.prisma.workflow.count(),
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

  private mapInstance(inst: any) {
    return {
      id: inst.id,
      workflowId: inst.workflowId,
      status: inst.status,
      currentNodeId: inst.currentNodeId || '',
      context: inst.context || {},
      createdAt: inst.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: inst.updatedAt?.toISOString() || new Date().toISOString(),
      workflowName: inst.workflow?.name || inst.workflowName || '',
      logs: (inst.logs || []).map((l: any) => this.mapLog(l)),
    };
  }

  private mapLog(l: any) {
    return {
      id: l.id,
      nodeId: l.nodeId || '',
      nodeType: l.nodeType || '',
      nodeLabel: l.nodeLabel || '',
      action: l.action || '',
      data: l.data || {},
      error: l.error || '',
      createdAt: l.createdAt?.toISOString() || new Date().toISOString(),
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
    try {
      const result = await this.engine.startWorkflow(
        data.workflowId,
        data.initialContext || {},
        data.initiatorId,
        data.businessId,
        data.businessType,
      );
      return this.mapInstance(result);
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'TriggerWorkflow')
  async triggerWorkflow(data: {
    trigger: string;
    initialContext?: any;
    initiatorId?: string;
    businessId?: string;
    businessType?: string;
  }) {
    try {
      // NOTE: engine.triggerWorkflow must be updated to accept businessId and businessType too
      const instance = await this.engine.triggerWorkflow(
        data.trigger,
        data.initialContext || {},
        data.initiatorId,
        data.businessId,
        data.businessType,
      );
      if (!instance) {
        return { id: '', status: 'NOT_FOUND' };
      }
      return this.mapInstance(instance);
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'ResumeWorkflow')
  async resumeWorkflow(data: {
    instanceId: string;
    nodeId: string;
    actionData?: any;
    userRoles?: string[];
  }) {
    try {
      await this.engine.resumeWorkflow(
        data.instanceId,
        data.nodeId,
        data.actionData || {},
        data.userRoles || [],
      );
      // return a default success response
      return { id: data.instanceId, status: 'RUNNING' };
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'ValidateAction')
  async validateAction(data: {
    instanceId: string;
    actionName: string;
    userRoles?: string[];
    userId?: string;
  }) {
    try {
      const result = await this.engine.validateAction(
        data.instanceId,
        data.actionName,
        data.userRoles || [],
        data.userId,
      );
      return { allowed: result.allowed, reason: result.reason || '' };
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'GetAllowedActions')
  async getAllowedActions(data: {
    instanceId: string;
    userRoles?: string[];
    userId?: string;
  }) {
    try {
      const allowedActions = await this.engine.getAllowedActions(
        data.instanceId,
        data.userRoles || [],
        data.userId,
      );
      return { allowedActions };
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'GetInstance')
  async getInstance(data: { id: string }) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: data.id },
      include: {
        workflow: true,
        logs: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!instance) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Instance not found',
      });
    }
    return this.mapInstance(instance);
  }

  @GrpcMethod('WorkflowService', 'GetLogs')
  async getLogs(data: { instanceId: string }) {
    const logs = await this.prisma.executionLog.findMany({
      where: { instanceId: data.instanceId },
      orderBy: { createdAt: 'desc' },
    });
    return { logs: logs.map((l) => this.mapLog(l)) };
  }
}
