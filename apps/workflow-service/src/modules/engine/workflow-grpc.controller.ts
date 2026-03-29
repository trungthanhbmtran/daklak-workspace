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
  ) {}

  // --- CRUD Operations ---

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(data: any) {
    try {
      return await this.prisma.workflow.create({
        data: {
          name: data.name,
          description: data.description,
          definition: data.definition || { nodes: [], edges: [] },
        },
      });
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(data: any) {
    try {
      return await this.prisma.workflow.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          definition: data.definition,
        },
      });
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
    return workflow;
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(data: { skip?: number; take?: number }) {
    const skip = data.skip || 0;
    const take = data.take || 10;
    const [items, total] = await Promise.all([
      this.prisma.workflow.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.workflow.count(),
    ]);
    return { items, total };
  }

  @GrpcMethod('WorkflowService', 'DeleteWorkflow')
  async deleteWorkflow(data: { id: string }) {
    await this.prisma.workflow.delete({ where: { id: data.id } });
    return { success: true };
  }

  // --- Execution Engine ---

  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(data: any) {
    try {
      return await this.engine.startWorkflow(
        data.workflowId || data.workflow_id,
        data.initialContext || data.initial_context || {},
        data.initiatorId || data.initiator_id,
      );
    } catch (e) {
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }

  @GrpcMethod('WorkflowService', 'ResumeWorkflow')
  async resumeWorkflow(data: any) {
    try {
      return await this.engine.resumeWorkflow(
        data.instanceId || data.instance_id,
        data.nodeId || data.node_id,
        data.actionData || data.action_data || {},
        data.userRoles || data.user_roles || [],
      );
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
    return {
      ...instance,
      workflowName: instance.workflow.name,
    };
  }

  @GrpcMethod('WorkflowService', 'GetLogs')
  async getLogs(data: { instanceId: string; instance_id?: string }) {
    const logs = await this.prisma.executionLog.findMany({
      where: { instanceId: data.instanceId || data.instance_id },
      orderBy: { createdAt: 'desc' },
    });
    return { logs };
  }
}
