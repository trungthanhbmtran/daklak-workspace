import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DynamicIntegrationAction } from '../action/dynamic-integration.action';
import { WorkflowContext } from '../action/action.interface';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly integrationAction: DynamicIntegrationAction,
  ) {}

  async startProcess(code: string, payload: any) {
    const def = await this.prisma.processDefinition.findUnique({
      where: { code },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!def || def.versions.length === 0) {
      throw new NotFoundException(
        `Active process definition ${code} not found`,
      );
    }

    const version = def.versions[0];

    const instance = await this.prisma.processInstance.create({
      data: {
        definitionId: def.id,
        versionId: version.id,
        businessKey: payload.businessKey,
        organizationId: payload.organizationId || 'DEFAULT',
        status: 'RUNNING',
        startedBy: payload.startedBy || 'SYSTEM',
        variables: payload.variables || {},
      },
    });

    this.eventEmitter.emit('workflow.instance.started', {
      instanceId: instance.id,
    });

    // Start execution loop async
    this.advanceProcess(instance.id, 'start').catch((err) => {
      this.logger.error(`Failed to advance process ${instance.id}`, err);
    });

    return instance;
  }

  async advanceProcess(instanceId: string, nodeId: string) {
    const instance = await this.prisma.processInstance.findUnique({
      where: { id: instanceId },
      include: { version: true },
    });

    if (!instance) return;

    const graph: any = instance.version.graph;
    const node = graph.nodes?.find((n: any) => n.id === nodeId);

    if (!node) {
      this.logger.warn(`Node ${nodeId} not found in graph`);
      return;
    }

    // Append to transition log
    await this.prisma.workflowTransition.create({
      data: {
        instanceId,
        fromNodeCode: instance.currentNodeCode,
        toNodeCode: node.code || node.id,
        action: 'AUTO',
        performedBy: 'SYSTEM',
      },
    });

    await this.prisma.processInstance.update({
      where: { id: instanceId },
      data: { currentNodeCode: node.code || node.id },
    });

    if (node.type === 'serviceTask' && node.action === 'DYNAMIC_INTEGRATION') {
      const ctx: WorkflowContext = {
        instanceId: instance.id,
        variables: instance.variables as Record<string, any>,
        organizationId: instance.organizationId,
        startedBy: instance.startedBy,
      };

      const result = await this.integrationAction.execute(ctx, node.payload);

      if (result.success) {
        const nextEdges =
          graph.edges?.filter((e: any) => e.source === node.id) || [];
        if (nextEdges.length > 0) {
          await this.advanceProcess(instanceId, nextEdges[0].target);
        }
      } else {
        await this.prisma.processInstance.update({
          where: { id: instanceId },
          data: { status: 'FAILED' },
        });
      }
    } else if (node.type === 'end') {
      await this.prisma.processInstance.update({
        where: { id: instanceId },
        data: { status: 'COMPLETED', endedAt: new Date() },
      });
      this.eventEmitter.emit('workflow.instance.completed', {
        instanceId: instance.id,
      });
    } else if (node.type === 'start') {
      const nextEdges =
        graph.edges?.filter((e: any) => e.source === node.id) || [];
      if (nextEdges.length > 0) {
        await this.advanceProcess(instanceId, nextEdges[0].target);
      }
    } else if (node.type === 'userTask') {
      // Create user task
      await this.prisma.workflowTask.create({
        data: {
          instanceId: instance.id,
          nodeCode: node.code || node.id,
          title: node.name || 'User Task',
          status: 'PENDING',
        },
      });
    }
  }

  async getInstances() {
    return this.prisma.processInstance.findMany({
      orderBy: { startedAt: 'desc' },
      include: {
        version: {
          include: { definition: true },
        },
      },
    });
  }

  async getTasks() {
    return this.prisma.workflowTask.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        instance: {
          include: {
            version: { include: { definition: true } },
          },
        },
      },
    });
  }

  async completeTask(taskId: string, payload: any) {
    const task = await this.prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: { instance: { include: { version: true } } },
    });

    if (!task || task.status !== 'PENDING') {
      throw new Error(`Task ${taskId} is not pending`);
    }

    await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    const graph: any = task.instance.version.graph;

    const node = graph.nodes?.find(
      (n: any) => (n.code || n.id) === task.nodeCode,
    );
    const nextEdges =
      graph.edges?.filter(
        (e: any) =>
          e.source === node?.id && (!e.action || e.action === payload.action),
      ) || [];

    if (nextEdges.length > 0) {
      await this.advanceProcess(task.instanceId, nextEdges[0].target);
    }

    return { success: true };
  }
}
