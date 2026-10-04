import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma.service';
import { DynamicIntegrationAction } from '../action/dynamic-integration.action';
import { WorkflowContext } from '../action/action.interface';
import { RedisService } from '../infra/redis.service';
import { RabbitMQService } from '../infra/rabbitmq.service';
import { BindingService } from '../catalog/binding.service';
import { ProcessCatalogService } from '../catalog/process-catalog.service';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationAction: DynamicIntegrationAction,
    private readonly redisService: RedisService,
    private readonly rabbitMqService: RabbitMQService,
    private readonly bindingService: BindingService,
    private readonly catalogService: ProcessCatalogService,
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

  // Backward-compatible StartProcess
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
      throw new NotFoundException(`Active process definition ${code} not found`);
    }

    if (payload.commandId) {
      const existing = await this.prisma.processedCommand.findUnique({
        where: { id: payload.commandId },
      });
      if (existing) {
        throw new ConflictException(`Command already processed`);
      }
      await this.prisma.processedCommand.create({
        data: { id: payload.commandId, status: 'PROCESSED' }
      });
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

    await this.redisService.set(`workflow:${instance.id}:graph`, version.graph, 86400000);
    this.rabbitMqService.emit('workflow.instance.started', {
      instanceId: instance.id,
      businessKey: instance.businessKey,
    });
    this.advanceProcess(instance.id, 'start').catch(err => this.logger.error(`Advance failed`, err));
    return instance;
  }

  // New resolver-based StartByProcessType
  async startByProcessType(req: any) {
    const resolverResult = await this.bindingService.resolveBinding({
      processTypeCode: req.processTypeCode,
      organizationId: req.organizationId || 'DEFAULT',
      trigger: req.trigger,
      context: req.initialContext,
    });

    const enforcementMode = await this.catalogService.getEnforcementMode(req.processTypeCode);

    if (!resolverResult.found) {
      if (enforcementMode === 'ENFORCE') {
        throw new BadRequestException(`Workflow enforcement failed: ${resolverResult.reason}`);
      }
      this.logger.warn(`Observe mode: Binding not found for ${req.processTypeCode}, bypassing workflow creation`);
      return null; // or empty response
    }

    // Check idempotencyKey
    if (req.idempotencyKey) {
      const existingInstance = await this.prisma.processInstance.findUnique({
        where: { idempotencyKey: req.idempotencyKey }
      });
      if (existingInstance) return existingInstance;
    }

    // Get the pinned version or latest published
    let versionId = resolverResult.pinnedVersionId;
    if (!versionId) {
      const latestPublished = await this.prisma.processVersion.findFirst({
        where: { definitionId: resolverResult.definitionId, status: 'PUBLISHED' },
        orderBy: { version: 'desc' }
      });
      if (!latestPublished) throw new NotFoundException(`No published version found for binding`);
      versionId = latestPublished.id;
    }

    const instance = await this.prisma.processInstance.create({
      data: {
        definitionId: resolverResult.definitionId!,
        versionId,
        businessKey: req.businessId,
        organizationId: req.organizationId || 'DEFAULT',
        status: 'RUNNING',
        startedBy: req.actorId || 'SYSTEM',
        variables: req.initialContext || {},
        processType: req.processTypeCode,
        businessType: req.businessType,
        businessId: req.businessId,
        bindingId: resolverResult.bindingId,
        correlationId: req.correlationId,
        idempotencyKey: req.idempotencyKey,
        actorId: req.actorId,
      },
      include: { version: true } // Include to cache graph
    });

    await this.redisService.set(`workflow:${instance.id}:graph`, (instance.version as any).graph, 86400000);
    this.rabbitMqService.emit('workflow.instance.started', {
      instanceId: instance.id,
      processType: instance.processType,
      businessId: instance.businessId,
    });
    this.advanceProcess(instance.id, 'start').catch(err => this.logger.error(`Advance failed`, err));
    return instance;
  }

  // OCC-safe Action Submission
  async submitAction(req: any) {
    const instance = await this.prisma.processInstance.findUnique({ where: { id: req.instanceId } });
    if (!instance) throw new NotFoundException('Instance not found');

    if (req.expectedVersion !== undefined && req.expectedVersion !== instance.stateVersion) {
      throw new ConflictException(`OCC Error: expected version ${req.expectedVersion}, got ${instance.stateVersion}`);
    }

    // Validate action is allowed
    const allowed = await this.validateAction({
      instanceId: req.instanceId,
      currentNodeId: instance.currentNodeCode || '',
      actionName: req.actionName,
      userId: req.actorId,
    });

    if (!allowed.allowed) {
      throw new BadRequestException(`Action ${req.actionName} not allowed: ${allowed.reason}`);
    }

    // Map action to a target service via Catalog or Definition
    const pt = instance.processType ? await this.catalogService.findByCode(instance.processType) : null;
    const targetService = pt?.ownerService || 'default-service';

    const command = await this.prisma.$transaction(async tx => {
      // Create WorkflowCommand
      const cmd = await tx.workflowCommand.create({
        data: {
          instanceId: instance.id,
          commandType: req.actionName,
          targetService: targetService,
          payload: req.actionData || {},
          correlationId: req.correlationId,
          status: 'PENDING'
        }
      });

      // Update instance state to PENDING_ACK
      await tx.processInstance.update({
        where: { id: instance.id },
        data: { 
          status: 'PENDING_ACK',
          stateVersion: { increment: 1 } 
        }
      });

      // Create OutboxEvent to trigger broker
      await tx.outboxEvent.create({
        data: {
          workflowInstanceId: instance.id,
          processVersion: instance.stateVersion + 1,
          nodeId: instance.currentNodeCode || '',
          commandType: req.actionName,
          eventId: `cmd-${cmd.id}`,
          eventType: 'workflow.command.sent',
          payload: { commandId: cmd.id, ...req.actionData }
        }
      });

      return cmd;
    });

    return {
      accepted: true,
      status: 'PENDING',
      commandId: command.id,
      newVersion: instance.stateVersion + 1
    };
  }

  // Domain ACK processing
  async acknowledgeCommand(req: any) {
    return this.prisma.$transaction(async tx => {
      const ack = await tx.domainAck.create({
        data: {
          commandId: req.commandId,
          instanceId: req.instanceId,
          result: req.result,
          entityVersion: req.entityVersion,
          payload: req.payload || {},
          errorMessage: req.errorMessage
        }
      });

      const cmd = await tx.workflowCommand.update({
        where: { id: req.commandId },
        data: {
          status: req.result === 'SUCCESS' ? 'ACKED' : 'FAILED',
          ackedAt: new Date(),
          error: req.errorMessage
        }
      });

      if (req.result === 'SUCCESS') {
        await tx.processInstance.update({
          where: { id: req.instanceId },
          data: { status: 'RUNNING', stateVersion: { increment: 1 } }
        });
        
        // Find pending task and complete it
        const task = await tx.workflowTask.findFirst({ where: { instanceId: req.instanceId, status: 'PENDING' } });
        if (task) {
          await tx.workflowTask.update({
            where: { id: task.id },
            data: { status: 'COMPLETED', completedAt: new Date() }
          });
        }
        
        // Use setImmediate to safely call advanceProcess out of transaction
        setImmediate(() => {
           this.advanceProcess(req.instanceId, cmd.commandType).catch(err => this.logger.error(err));
        });
      } else {
        await tx.processInstance.update({
          where: { id: req.instanceId },
          data: { status: 'FAILED' } // Or keep RUNNING but wait for retry
        });
      }

      return { accepted: true };
    });
  }

  async advanceProcess(
    instanceId: string,
    nodeIdOrAction: string,
    depth: number = 0,
    visited: Record<string, number> = {},
  ) {
    if (depth > 50) {
      this.logger.warn(`Max traversal depth exceeded for instance ${instanceId}`);
      return;
    }

    const graph = await this.getGraph(instanceId);
    if (!graph) return;

    const instance = await this.prisma.processInstance.findUnique({ where: { id: instanceId } });
    if (!instance) return;

    let currentNode = graph.nodes?.find((n: any) => n.id === instance.currentNodeCode);
    let targetNodeId: string | null = null;

    if (nodeIdOrAction === 'start') {
      const startNode = graph.nodes?.find((n: any) => n.type === 'start');
      if (startNode) targetNodeId = startNode.id;
    } else if (currentNode) {
      const edges = graph.edges?.filter((e: any) => e.source === currentNode.id && (e.label === nodeIdOrAction || e.action === nodeIdOrAction || e.data?.action === nodeIdOrAction));
      if (edges && edges.length > 0) {
        targetNodeId = edges[0].target;
      }
    }

    if (!targetNodeId) targetNodeId = nodeIdOrAction; // Direct node fallback
    if (!targetNodeId) return;
    
    // Cycle detection: allow visiting a node a few times (e.g. for loops) but not infinitely.
    const visitCount = (visited[targetNodeId] || 0) + 1;
    if (visitCount > 10) {
      this.logger.warn(`Cycle detected in instance ${instanceId} at node ${targetNodeId}`);
      return;
    }
    visited[targetNodeId] = visitCount;

    const node = graph.nodes?.find((n: any) => n.id === targetNodeId);
    if (!node) return;

    await this.prisma.workflowTransition.create({
      data: {
        instanceId,
        fromNodeCode: instance.currentNodeCode,
        toNodeCode: node.code || node.id,
        action: nodeIdOrAction,
        performedBy: 'SYSTEM',
      },
    });

    await this.prisma.processInstance.update({
      where: { id: instanceId },
      data: { currentNodeCode: node.code || node.id },
    });

    switch (node.type) {
      case 'end':
        await this.handleEndTask(instance.id);
        break;
      case 'start':
      case 'userTask':
      case 'serviceTask':
      default:
        // Trigger next node
        const nextEdges = graph.edges?.filter((e: any) => e.source === node.id && !e.action) || [];
        if (nextEdges.length > 0) {
          await this.advanceProcess(instance.id, nextEdges[0].target, depth + 1, visited);
        } else if (node.type === 'userTask') {
          await this.handleUserTask(instance, node);
        }
        break;
    }
  }

  private async handleEndTask(instanceId: string) {
    await this.prisma.processInstance.update({
      where: { id: instanceId },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });
    await this.redisService.del(`workflow:${instanceId}:graph`);
    this.rabbitMqService.emit('workflow.instance.completed', { instanceId });
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
    this.rabbitMqService.emit('workflow.task.created', {
      taskId: task.id,
      instanceId: instance.id,
      nodeCode: task.nodeCode,
      title: task.title,
    });
  }

  async validateAction(payload: any): Promise<{ allowed: boolean; reason: string }> {
    const graph = await this.getGraph(payload.instanceId);
    if (!graph) return { allowed: false, reason: 'Workflow graph not found' };
    const edges = graph.edges?.filter((e: any) => e.source === payload.currentNodeId && (e.label === payload.actionName || e.action === payload.actionName || e.data?.action === payload.actionName));
    if (!edges || edges.length === 0) return { allowed: false, reason: 'Action not allowed' };
    return { allowed: true, reason: '' };
  }

  async getInstances(filters?: { skip?: number; take?: number; workflowId?: string; status?: string; organizationId?: string; processType?: string; businessId?: string; search?: string }) {
    const where: any = {};
    if (filters?.workflowId) where.definitionId = filters.workflowId;
    if (filters?.status) where.status = filters.status;
    if (filters?.organizationId) where.organizationId = filters.organizationId;
    if (filters?.processType) where.processType = filters.processType;
    if (filters?.businessId) where.businessId = filters.businessId;
    if (filters?.search) {
      where.OR = [
        { businessKey: { contains: filters.search } },
        { correlationId: { contains: filters.search } }
      ];
    }
    return this.prisma.processInstance.findMany({
      where,
      skip: filters?.skip,
      take: filters?.take,
      include: { version: { include: { definition: true } } },
      orderBy: { startedAt: 'desc' }
    });
  }

  async getInstance(id: string, organizationId?: string) {
    const where: any = { id };
    if (organizationId) where.organizationId = organizationId;
    
    const instance = await this.prisma.processInstance.findUnique({ 
      where, 
      include: { version: { include: { definition: true } }, tasks: true } 
    });
    
    if (instance) {
      // Inject allowed actions
      const actions = await this.getAllowedActions({ instanceId: instance.id, currentNodeId: instance.currentNodeCode || '' });
      (instance as any).allowedActions = actions.actions;
    }
    return instance;
  }
  
  async getTasks() { return this.prisma.workflowTask.findMany({ orderBy: { createdAt: 'desc' }, include: { instance: { include: { version: { include: { definition: true } } } } } }); }
  async getInitialNode(workflowId: string) { return { initialNodeId: 'node-1', nodeData: '{}' }; }
  async getNextNode(payload: any) { return { nextNodeId: 'node-2', nextNodeData: '{}', type: 'userTask' }; }
  
  async getLogs(instanceId: string, organizationId?: string) {
    const where: any = { instanceId };
    
    // Check if instance belongs to org if organizationId is provided
    if (organizationId) {
      const instance = await this.prisma.processInstance.findUnique({ where: { id: instanceId } });
      if (!instance || instance.organizationId !== organizationId) {
        return [];
      }
    }

    const transitions = await this.prisma.workflowTransition.findMany({
      where,
      orderBy: { performedAt: 'asc' },
    });

    return transitions.map((t: any) => ({
      id: t.id,
      fromNodeId: t.fromNodeCode,
      toNodeId: t.toNodeCode,
      action: t.action,
      performedBy: t.performedBy,
      performedAt: t.performedAt?.toISOString?.(),
      comment: t.comment || '',
    }));
  }

  
  async getAllowedActions(payload: { instanceId: string; currentNodeId: string; userRoles?: string[]; userId?: string; }) {
    const graph = await this.getGraph(payload.instanceId);
    if (!graph || !graph.edges) return { actions: [] };
    
    const edges = graph.edges.filter((e: any) => e.source === payload.currentNodeId);
    const actions = edges.map((e: any) => e.label || e.action || e.data?.action).filter(Boolean);
    return { actions: Array.from(new Set(actions)) };
  }
  
  async getAllowedActionsBatch(requests: any[]) { 
    const results = await Promise.all(requests.map(r => this.getAllowedActions(r)));
    return results;
  }
  
  async triggerProcess(trigger: string, payload: any) { return this.startProcess(trigger, payload); }
  async resumeInstance(instanceId: string, nodeId: string, actionData: any, userRoles?: string[], commandId?: string) { return { success: true }; }
  
  async triggerAutoBinding(data: { entity: string; eventTrigger: string; payloadData: any }) {
    // BL-007: migrate from WorkflowBinding to startByProcessType (ProcessBinding)
    try {
      this.logger.log(`Auto-triggering workflow via resolver for ${data.entity}.${data.eventTrigger}`);
      return await this.startByProcessType({
        processTypeCode: data.eventTrigger, // Fallback processType = eventTrigger
        organizationId: data.entity,
        trigger: data.eventTrigger,
        businessId: data.payloadData?.id,
        businessType: 'ENTITY', // Or derive from entity type
        actorId: data.payloadData?.createdBy || 'SYSTEM',
        initialContext: data.payloadData,
      });
    } catch (e: any) {
      this.logger.warn(`Failed to auto-trigger workflow via new bindings: ${e.message}`);
      return null;
    }
  }

  async completeTask(taskId: string, payload: any) {
    const task = await this.prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: { instance: true },
    });
    if (!task || task.status !== 'PENDING') throw new Error(`Task ${taskId} is not pending`);
    
    await this.prisma.workflowTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.rabbitMqService.emit('workflow.task.completed', {
      taskId: task.id,
      instanceId: task.instanceId,
      action: payload.action,
    });
    
    await this.advanceProcess(task.instanceId, payload.action || 'next');
    return { success: true };
  }
}
