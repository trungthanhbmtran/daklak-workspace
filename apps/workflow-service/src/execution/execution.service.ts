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

  async getInitialNode(workflowId: string): Promise<{ initialNodeId: string; nodeData: string }> {
    const def = await this.prisma.processDefinition.findUnique({
      where: { id: workflowId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });
    if (!def || !def.versions.length) throw new NotFoundException('Workflow not found');
    const graph = def.versions[0].graph as any;
    const initialNode = graph.nodes?.find((n: any) => n.type === 'start' || n.type === 'START');
    if (!initialNode) throw new Error('Start node not found');
    return { initialNodeId: initialNode.id, nodeData: JSON.stringify(initialNode.data || {}) };
  }

  async validateAction(payload: { workflowId?: string; instanceId?: string; currentNodeId: string; actionName: string; userRoles?: string[]; userId?: string; businessData?: any }): Promise<{ allowed: boolean; reason: string }> {
    const graph = await this.getGraphByContext(payload.workflowId, payload.instanceId);
    if (!graph) return { allowed: false, reason: 'Workflow graph not found' };

    const currentNode = graph.nodes?.find((n: any) => n.id === payload.currentNodeId);
    if (!currentNode) return { allowed: false, reason: 'Current node not found' };

    const edges = graph.edges?.filter((e: any) => e.source === payload.currentNodeId && (e.label === payload.actionName || e.action === payload.actionName || (e.data && e.data.action === payload.actionName)));
    if (!edges || edges.length === 0) return { allowed: false, reason: 'Action not allowed from this state' };

    return { allowed: true, reason: '' };
  }

  async getNextNode(payload: { workflowId?: string; instanceId?: string; currentNodeId: string; actionName: string; evalContext?: any }): Promise<{ nextNodeId: string; nextNodeData: string; type: string }> {
    const graph = await this.getGraphByContext(payload.workflowId, payload.instanceId);
    if (!graph) throw new NotFoundException('Workflow graph not found');

    const edges = graph.edges?.filter((e: any) => e.source === payload.currentNodeId && (e.label === payload.actionName || e.action === payload.actionName || (e.data && e.data.action === payload.actionName)));
    if (!edges || edges.length === 0) throw new Error('No path found for action');

    const targetNodeId = edges[0].target;
    const targetNode = graph.nodes?.find((n: any) => n.id === targetNodeId);
    if (!targetNode) throw new Error('Target node not found');

    return { nextNodeId: targetNode.id, nextNodeData: JSON.stringify(targetNode.data || {}), type: targetNode.type || '' };
  }

  
  async getAllowedActionsBatch(payloads: Array<{ workflowId?: string; instanceId?: string; currentNodeId: string; userRoles?: string[]; userId?: string; businessData?: any }>): Promise<Array<{ actions: string[] }>> {
    // Collect unique workflowIds and instanceIds to batch fetch graphs
    const workflowIds = [...new Set(payloads.map(p => p.workflowId).filter((id): id is string => !!id))];
    const instanceIds = [...new Set(payloads.map(p => p.instanceId).filter((id): id is string => !!id))];

    const graphMap = new Map<string, any>();

    // Fetch by instanceId
    if (instanceIds.length > 0) {
      const instances = await this.prisma.processInstance.findMany({
        where: { id: { in: instanceIds } },
        include: { version: true }
      });
      for (const inst of instances) {
        if ((inst.version as any)?.graph) {
           graphMap.set(`inst:${inst.id}`, (inst.version as any).graph);
        }
      }
    }

    // Fetch by workflowId
    if (workflowIds.length > 0) {
      const defs = await this.prisma.processDefinition.findMany({
        where: { id: { in: workflowIds } },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } }
      });
      for (const def of defs) {
        if (def.versions && def.versions[0]) {
          graphMap.set(`wf:${def.id}`, def.versions[0].graph);
        }
      }
    }

    return payloads.map(payload => {
      let graph = null;
      if (payload.instanceId) {
        graph = graphMap.get(`inst:${payload.instanceId}`);
      } else if (payload.workflowId) {
        graph = graphMap.get(`wf:${payload.workflowId}`);
      }

      if (!graph) return { actions: [] };

      const edges = (graph as any).edges?.filter((e: any) => e.source === payload.currentNodeId);
      return { actions: edges?.map((e: any) => e.label || e.action || (e.data && e.data.action)).filter(Boolean) || [] };
    });
  }


  async getAllowedActions(payload: { workflowId?: string; instanceId?: string; currentNodeId: string; userRoles?: string[]; userId?: string; businessData?: any }): Promise<{ actions: string[] }> {
    const graph = await this.getGraphByContext(payload.workflowId, payload.instanceId);
    if (!graph) return { actions: [] };

    const edges = graph.edges?.filter((e: any) => e.source === payload.currentNodeId);
    return { actions: edges?.map((e: any) => e.label || e.action || (e.data && e.data.action)).filter(Boolean) || [] };
  }

  private async getGraphByContext(workflowId?: string, instanceId?: string): Promise<any> {
    if (instanceId) {
      return this.getGraph(instanceId);
    }
    if (workflowId) {
       const def = await this.prisma.processDefinition.findUnique({
        where: { id: workflowId },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      });
      return def?.versions[0]?.graph;
    }
    return null;
  }

  /**
   * Trigger a workflow by its definition code (human-readable trigger code).
   * Returns the created instance so the caller can persist the instanceId.
   */
  async triggerProcess(
    trigger: string,
    payload: {
      businessId?: string;
      businessType?: string;
      initiatorId?: string;
      initialContext?: Record<string, any>;
    },
  ) {
    return this.startProcess(trigger, {
      businessKey: payload.businessId,
      organizationId: payload.businessType || 'DEFAULT',
      startedBy: payload.initiatorId || 'SYSTEM',
      variables: {
        ...(payload.initialContext || {}),
        businessId: payload.businessId,
        businessType: payload.businessType,
      },
    });
  }

  /**
   * Resume a running instance at a specific node by completing the pending task.
   * Finds the PENDING task for the given nodeCode (or first pending task if nodeId omitted).
   */
  async resumeInstance(
    instanceId: string,
    nodeId: string | undefined,
    actionData: Record<string, any>,
    userRoles?: string[],
  ): Promise<{ success: boolean; message?: string }> {
    // Find pending task for this instance (and optionally this node)
    const taskWhere: any = { instanceId, status: 'PENDING' };
    if (nodeId) {
      taskWhere.nodeCode = nodeId;
    }

    const task = await this.prisma.workflowTask.findFirst({ where: taskWhere });

    if (!task) {
      // No pending task — try to advance directly from the node
      if (nodeId) {
        await this.advanceProcess(instanceId, nodeId);
        return { success: true, message: 'Advanced from node' };
      }
      return { success: false, message: 'No pending task found for this instance' };
    }

    return this.completeTask(task.id, actionData);
  }

  /**
   * Get a workflow instance with its tasks.
   */
  async getInstance(instanceId: string) {
    const instance = await this.prisma.processInstance.findUnique({
      where: { id: instanceId },
      include: {
        version: { include: { definition: true } },
        tasks: true,
      },
    });

    if (!instance) throw new NotFoundException(`Instance ${instanceId} not found`);
    return instance;
  }
}

