import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { DynamicIntegrationAction } from '../action/dynamic-integration.action';
import { WorkflowContext } from '../action/action.interface';
import { RedisService } from '../infra/redis.service';
import { RabbitMQService } from '../infra/rabbitmq.service';

export interface StartProcessPayload {
  businessKey?: string;
  organizationId?: string;
  startedBy?: string;
  variables?: Record<string, any>;
}

export interface CompleteTaskPayload {
  action?: string;
  [key: string]: any;
}

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationAction: DynamicIntegrationAction,
    private readonly redisService: RedisService,
    private readonly rabbitMqService: RabbitMQService,
  ) {}

  private async getGraph(instanceId: string): Promise<any> {
    const cacheKey = `workflow:${instanceId}:graph`;
    let graph = await this.redisService.get<any>(cacheKey);
    if (!graph) {
      const instance = await this.prisma.processInstance.findUnique({
        where: { id: instanceId },
        include: { version: true },
      });
      if (instance && instance.version) {
        graph = instance.version.graph;
        await this.redisService.set(cacheKey, graph, 86400000); // 24 hours
      }
    }
    return graph;
  }

  async startProcess(code: string, payload: StartProcessPayload) {
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
      throw new NotFoundException(`Active process definition ${code} not found`);
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

    // Cache the graph immediately
    await this.redisService.set(`workflow:${instance.id}:graph`, version.graph, 86400000);

    this.rabbitMqService.emit('workflow.instance.started', {
      instanceId: instance.id,
      businessKey: instance.businessKey,
    });

    // Start execution loop async
    this.advanceProcess(instance.id, 'start').catch((err) => {
      this.logger.error(`Failed to advance process ${instance.id}`, err);
    });

    return instance;
  }

  async advanceProcess(instanceId: string, nodeId: string) {
    const graph = await this.getGraph(instanceId);
    if (!graph) return;

    const node = graph.nodes?.find((n: any) => n.id === nodeId);
    if (!node) {
      this.logger.warn(`Node ${nodeId} not found in graph`);
      return;
    }

    const instance = await this.prisma.processInstance.findUnique({
      where: { id: instanceId },
    });
    if (!instance) return;

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

    switch (node.type) {
      case 'serviceTask':
        return this.handleServiceTask(instance, node, graph);
      case 'end':
        return this.handleEndTask(instance.id);
      case 'start':
        return this.handleStartTask(instance.id, node, graph);
      case 'userTask':
        return this.handleUserTask(instance, node);
      default:
        this.logger.warn(`Unsupported node type: ${node.type}`);
        return;
    }
  }

  private async handleServiceTask(instance: any, node: any, graph: any) {
    if (node.action !== 'DYNAMIC_INTEGRATION') {
      return; // Early return for unsupported actions
    }

    const ctx: WorkflowContext = {
      instanceId: instance.id,
      variables: instance.variables as Record<string, any>,
      organizationId: instance.organizationId,
      startedBy: instance.startedBy,
    };

    const result = await this.integrationAction.execute(ctx, node.payload);

    if (!result.success) {
      this.logger.error(`Service Task failed for instance ${instance.id} on node ${node.id}`);
      await this.prisma.processInstance.update({
        where: { id: instance.id },
        data: { status: 'FAILED' },
      });
      // Saga Compensation
      await this.triggerCompensation(instance.id, node, graph);
      return;
    }

    const nextEdges = graph.edges?.filter((e: any) => e.source === node.id) || [];
    if (nextEdges.length > 0) {
      await this.advanceProcess(instance.id, nextEdges[0].target);
    }
  }

  private async triggerCompensation(instanceId: string, failedNode: any, graph: any) {
    this.logger.log(`Triggering Saga Compensation for instance ${instanceId} from node ${failedNode.id}`);
    this.rabbitMqService.emit('workflow.saga.compensation_triggered', {
      instanceId,
      failedNodeCode: failedNode.code || failedNode.id,
    });
    // In a real Saga, we would traverse backward and call compensation actions for previous service tasks
  }

  private async handleEndTask(instanceId: string) {
    await this.prisma.processInstance.update({
      where: { id: instanceId },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });
    await this.redisService.del(`workflow:${instanceId}:graph`);
    this.rabbitMqService.emit('workflow.instance.completed', {
      instanceId,
    });
  }

  private async handleStartTask(instanceId: string, node: any, graph: any) {
    const nextEdges = graph.edges?.filter((e: any) => e.source === node.id) || [];
    if (nextEdges.length > 0) {
      await this.advanceProcess(instanceId, nextEdges[0].target);
    }
  }

  private async handleUserTask(instance: any, node: any) {
    const task = await this.prisma.workflowTask.create({
      data: {
        instanceId: instance.id,
        nodeCode: node.code || node.id,
        title: node.name || 'User Task',
        status: 'PENDING',
      },
    });

    // Notify other microservices that a User Task requires action
    this.rabbitMqService.emit('workflow.task.created', {
      taskId: task.id,
      instanceId: instance.id,
      nodeCode: task.nodeCode,
      title: task.title,
    });
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

  async completeTask(taskId: string, payload: CompleteTaskPayload) {
    const task = await this.prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: { instance: true },
    });

    if (!task || task.status !== 'PENDING') {
      throw new Error(`Task ${taskId} is not pending`);
    }

    await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.rabbitMqService.emit('workflow.task.completed', {
      taskId: task.id,
      instanceId: task.instanceId,
      action: payload.action,
    });

    const graph = await this.getGraph(task.instanceId);
    if (!graph) return { success: false, message: 'Graph not found' };

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

