import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { WorkflowEngineService } from './workflow-engine.service';
import { PrismaService } from '@/database/prisma.service';

@Controller()
export class WorkflowGrpcController {
  constructor(
    private readonly engine: WorkflowEngineService,
    private readonly prisma: PrismaService,
  ) { }

  // --- CRUD Operations ---

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(data: any) {
    try {
      const workflow = await this.prisma.workflow.create({
        data: {
          name: data.name,
          description: data.description,
          definition: data.definition || { nodes: [], edges: [] },
        },
      });
      return this.mapWorkflow(workflow);
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(data: any) {
    try {
      const workflow = await this.prisma.workflow.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          definition: data.definition,
        },
      });
      return this.mapWorkflow(workflow);
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'FindOneWorkflow')
  async findOneWorkflow(data: { id: string }) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: data.id } });
    if (!workflow) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Workflow not found' });
    }
    return this.mapWorkflow(workflow);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(data: { skip?: number; take?: number }) {
    const skip = data.skip || 0;
    const take = data.take || 10;
    const [workflows, total] = await Promise.all([
      this.prisma.workflow.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.workflow.count(),
    ]);

    return {
      items: workflows.map(w => this.mapWorkflow(w)),
      total,
    };
  }

  @GrpcMethod('WorkflowService', 'DeleteWorkflow')
  async deleteWorkflow(data: { id: string }) {
    await this.prisma.workflow.delete({ where: { id: data.id } });
    return { success: true };
  }

  // --- Helpers ---

  private mapWorkflow(w: any) {
    // Ensure definition is a clean object for gRPC Struct mapping
    let definition = w.definition;
    if (definition && typeof definition === 'object') {
      try {
        definition = JSON.parse(JSON.stringify(definition));
      } catch (e) {
        definition = { nodes: [], edges: [] };
      }
    }

    return {
      id: w.id,
      name: w.name,
      description: w.description || '',
      definition: definition || { nodes: [], edges: [] },
      created_at: w.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: w.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }

  private mapInstance(inst: any) {
    return {
      id: inst.id,
      workflow_id: inst.workflowId,
      status: inst.status,
      current_node_id: inst.currentNodeId || '',
      context: inst.context || {},
      created_at: inst.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: inst.updatedAt?.toISOString() || new Date().toISOString(),
      workflow_name: inst.workflow?.name || inst.workflowName || '',
      logs: (inst.logs || []).map(l => this.mapLog(l)),
    };
  }

  private mapLog(l: any) {
    return {
      id: l.id,
      node_id: l.nodeId || '',
      node_type: l.nodeType || '',
      node_label: l.nodeLabel || '',
      action: l.action || '',
      data: l.data || {},
      error: l.error || '',
      created_at: l.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  // --- Execution Engine ---

  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(data: any) {
    try {
      const result = await this.engine.startWorkflow(
        data.workflowId || data.workflow_id,
        data.initialContext || data.initial_context || {},
        data.initiatorId || data.initiator_id,
      );
      return this.mapInstance(result);
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'TriggerWorkflow')
  async triggerWorkflow(data: any) {
    try {
      const instance = await this.engine.triggerWorkflow(
        data.trigger,
        data.initialContext || data.initial_context || {},
        data.initiatorId || data.initiator_id,
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
  async resumeWorkflow(data: any) {
    try {
      const result = await this.engine.resumeWorkflow(
        data.instanceId || data.instance_id,
        data.nodeId || data.node_id,
        data.actionData || data.action_data || {},
        data.userRoles || data.user_roles || [],
      );
      return this.mapInstance(result);
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'GetInstance')
  async getInstance(data: { id: string }) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: data.id },
      include: { workflow: true, logs: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    if (!instance) {
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Instance not found' });
    }
    return this.mapInstance(instance);
  }

  @GrpcMethod('WorkflowService', 'GetLogs')
  async getLogs(data: { instanceId: string; instance_id?: string }) {
    const logs = await this.prisma.executionLog.findMany({
      where: { instanceId: data.instanceId || data.instance_id },
      orderBy: { createdAt: 'desc' },
    });
    return { logs: logs.map(l => this.mapLog(l)) };
  }
}
