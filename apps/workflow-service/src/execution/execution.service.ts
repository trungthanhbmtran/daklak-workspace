import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
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

  /**
   * Prisma UniqueViolation (P2002) — dùng cho idempotency replay (#22).
   */
  private isUniqueViolation(e: any): boolean {
    return e?.code === 'P2002';
  }

  /**
   * Resolve node code đúng chuẩn như DefinitionValidatorService.compile()
   * (`n.code ?? n.nodeKey ?? n.id`) — tránh state machine corrupt khi code ≠ id (#22).
   */
  private resolveNodeCode(node: any): string {
    if (!node) return '';
    return (node.code ?? node.nodeKey ?? node.id) ?? '';
  }

  /**
   * Safe JSON parse — lỗi parse phải trả gRPC INVALID_ARGUMENT thay vì để lọt UNKNOWN (#26).
   */
  private parseJsonOrThrow(raw: string, field: string): any {
    try {
      return JSON.parse(raw);
    } catch (err: any) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid JSON in ${field}: ${err?.message ?? err}`,
      });
    }
  }

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
    // [P0 #12 — RCE] Chỉ dùng version có status PUBLISHED: graph của version DRAFT chưa qua
    // DefinitionValidatorService.validate() và có thể chứa script/thành phần chưa kiểm soát
    // ⇒ được thực thi qua `new Function` ở handleServiceTask (escape: variables.constructor.constructor).
    const def = await this.prisma.processDefinition.findUnique({
      where: { code },
      include: {
        versions: {
          where: { status: 'PUBLISHED' },
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (!def || def.versions.length === 0) {
      throw new BadRequestException(
        `No PUBLISHED version for process definition ${code} — refusing to start from a DRAFT/unpublished version`,
      );
    }

    const version = def.versions[0];

    // [P1 #22] idempotency: check-then-create PHẢI nằm trong MỘT $transaction.
    // Race giữa 2 lệnh cùng commandId → P2002 UniqueViolation → re-read và trả về instance
    // đã tồn tại (idempotent) thay vì 500. commandId được gán làm idempotencyKey duy nhất
    // trên instance để replay có thể truy đúng instance đã tạo cho command đó.
    let instance;
    try {
      instance = await this.prisma.$transaction(async tx => {
        if (payload.commandId) {
          const existing = await tx.processedCommand.findUnique({
            where: { id: payload.commandId },
          });
          if (existing) {
            // Command đã xử lý: trả về instance cũ của command này (idempotent replay)
            const existingInstance = await tx.processInstance.findUnique({
              where: { idempotencyKey: payload.commandId },
              include: { version: true },
            });
            if (existingInstance) {
              return existingInstance;
            }
            // Command cũ không gắn instance (dữ liệu trước khi có idempotencyKey)
            throw new ConflictException(`Command already processed`);
          }
          await tx.processedCommand.create({
            data: { id: payload.commandId, status: 'PROCESSED' }
          });
        }

        const inst = await tx.processInstance.create({
          data: {
            definitionId: def.id,
            versionId: version.id,
            businessKey: payload.businessKey,
            organizationId: payload.organizationId || 'DEFAULT',
            status: 'RUNNING',
            startedBy: payload.startedBy || 'SYSTEM',
            variables: payload.variables || {},
            // Liên kết bất biến command → instance phục vụ replay idempotent ở trên
            ...(payload.commandId ? { idempotencyKey: payload.commandId } : {}),
          },
          include: { version: true },
        });

        await tx.outboxEvent.create({
          data: {
            workflowInstanceId: inst.id,
            processVersion: 1,
            nodeId: 'start',
            commandType: 'start',
            eventType: 'workflow.instance.started',
            payload: { instanceId: inst.id, businessKey: inst.businessKey }
          }
        });

        return inst;
      });
    } catch (e: any) {
      if (this.isUniqueViolation(e)) {
        // P2002 do race (command hoặc instance đã được tx song song tạo) → re-read idempotent
        const replayed = payload.commandId
          ? await this.prisma.processInstance.findUnique({
              where: { idempotencyKey: payload.commandId },
              include: { version: true },
            })
          : null;
        if (replayed) {
          this.logger.warn(`startProcess replay commandId=${payload.commandId} → reuse existing instance ${replayed.id}`);
          return replayed;
        }
      }
      throw e;
    }

    await this.redisService.set(`workflow:${instance.id}:graph`, version.graph, 86400000);
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

    // Check idempotencyKey — [P1 #22] check PHẢI nằm trong cùng $transaction với create
    // để tránh race check-then-create khi 2 request cùng key song song.
    let instance;
    try {
      instance = await this.prisma.$transaction(async tx => {
        if (req.idempotencyKey) {
          const existingInstance = await tx.processInstance.findUnique({
            where: { idempotencyKey: req.idempotencyKey },
            include: { version: true },
          });
          if (existingInstance) return existingInstance;
        }

        // Get the pinned version or latest published
        let versionId = resolverResult.pinnedVersionId;
        if (!versionId) {
          const latestPublished = await tx.processVersion.findFirst({
            where: { definitionId: resolverResult.definitionId, status: 'PUBLISHED' },
            orderBy: { version: 'desc' }
          });
          if (!latestPublished) throw new NotFoundException(`No published version found for binding`);
          versionId = latestPublished.id;
        }

        const inst = await tx.processInstance.create({
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

      await tx.outboxEvent.create({
        data: {
          workflowInstanceId: inst.id,
          processVersion: 1,
          nodeId: 'start',
          commandType: 'start',
          eventType: 'workflow.instance.started',
          payload: { instanceId: inst.id, processType: inst.processType, businessId: inst.businessId }
        }
      });

      return inst;
    });
    } catch (e: any) {
      if (this.isUniqueViolation(e)) {
        // [P1 #22] P2002 trên idempotencyKey (race song song) → re-read và trả instance cũ
        const replayed = req.idempotencyKey
          ? await this.prisma.processInstance.findUnique({
              where: { idempotencyKey: req.idempotencyKey },
              include: { version: true },
            })
          : null;
        if (replayed) {
          this.logger.warn(`startByProcessType replay idempotencyKey=${req.idempotencyKey} → reuse existing instance ${replayed.id}`);
          return replayed;
        }
      }
      throw e;
    }

    // Instance cũ từ replay có thể không include version — chỉ cache khi có graph
    const graphJson = (instance.version as any)?.graph;
    if (graphJson) {
      await this.redisService.set(`workflow:${instance.id}:graph`, graphJson, 86400000);
    }
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

    // [P1 #22 — OCC] Claim theo stateVersion: updateMany trả count=0 khi instance đã bị
    // tx khác đổi trạng thái → ConflictException 409 (caller re-read và retry).
    const command = await this.prisma.$transaction(async tx => {
      // Claim instance chỉ nếu stateVersion vẫn bằng version đã đọc
      const claimed = await tx.processInstance.updateMany({
        where: { id: instance.id, stateVersion: instance.stateVersion },
        data: {
          status: 'PENDING_ACK',
          stateVersion: { increment: 1 }
        }
      });
      if (claimed.count === 0) {
        throw new ConflictException(
          `OCC conflict: instance ${instance.id} was modified concurrently (stateVersion ${instance.stateVersion}) — re-read and retry`
        );
      }

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
    try {
      return await this.prisma.$transaction(async tx => {
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
    } catch (e: any) {
      // [P1 #22] DomainAck.commandId là @unique — ACK trùng (at-least-once retry từ domain service)
      // phải trả idempotent theo proto AcknowledgeCommandResponse.duplicate=true thay vì 500/UNKNOWN.
      if (this.isUniqueViolation(e)) {
        this.logger.warn(`Duplicate ACK for command=${req.commandId} — returning duplicate=true`);
        return { accepted: true, duplicate: true };
      }
      throw e;
    }
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

    // [P1 #22] currentNodeCode có thể là node.code (chuẩn compile()) hoặc node.id — match cả hai
    let currentNode = graph.nodes?.find(
      (n: any) => n.id === instance.currentNodeCode || this.resolveNodeCode(n) === instance.currentNodeCode,
    );
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
        // [P1 #22] resolve node code đúng chuẩn compile() (n.code ?? n.nodeKey ?? n.id)
        toNodeCode: this.resolveNodeCode(node),
        action: nodeIdOrAction,
        performedBy: 'SYSTEM',
      },
    });

    await this.prisma.processInstance.update({
      where: { id: instanceId },
      // [P1 #22] resolve node code đúng chuẩn compile() (n.code ?? n.nodeKey ?? n.id)
      data: { currentNodeCode: this.resolveNodeCode(node) },
    });

    switch (node.type) {
      case 'end':
        await this.handleEndTask(instance.id);
        break;
      case 'serviceTask':
        await this.handleServiceTask(instance, node, graph, depth, visited);
        break;
      case 'start':
      case 'userTask':
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

  private async handleServiceTask(instance: any, node: any, graph: any, depth: number, visited: any) {
    // Tự động đi tiếp (Auto-advance) sang node kế tiếp không yêu cầu action
    const advanceToNext = async () => {
      const nextEdges = graph.edges?.filter((e: any) => e.source === node.id && !e.action) || [];
      if (nextEdges.length > 0) {
        await this.advanceProcess(instance.id, nextEdges[0].target, depth + 1, visited);
      }
    };
    try {
      const script = node.data?.script;
      const action = node.data?.action || node.data?.commandType;

      if (script) {
        // [P0 #12 — RCE gate] Script task chạy nội dung editor-provided thông qua `new Function` +
        // `with(context)` — KHÔNG có sandbox thật: chuỗi escape
        // `variables.constructor.constructor("return process")()` truy cập được process/global.
        // Vì vậy mặc định TẮT (`WORKFLOW_ENABLE_SCRIPT_TASK !== 'true'`):
        //  - Khi TẮT: log warn rồi SKIP node (auto-advance) — chọn behavior skip thay vì throw để
        //    instance không crash, vì nhiều serviceTask không script vẫn phải chạy tiếp bình thường.
        //  - Khi BẬT flag: chạy như cũ — đây là documented risk mà operator phải chủ ý bật.
        const scriptEnabled = process.env.WORKFLOW_ENABLE_SCRIPT_TASK === 'true';
        if (!scriptEnabled) {
          this.logger.warn(
            `Script task ${node.id} for instance ${instance.id} SKIPPED: WORKFLOW_ENABLE_SCRIPT_TASK is not 'true' (RCE protection — scripts run unsandboxed via new Function when enabled)`,
          );
          await advanceToNext();
          return;
        }

        // 1. Thực thi Workflow Rule Engine Script cục bộ
        this.logger.log(`Executing Script Node ${node.id} for instance ${instance.id}`);
        // [P2 #26] parse JSON an toàn — lỗi parse trả INVALID_ARGUMENT thay vì UNKNOWN
        const variables = typeof instance.variables === 'string'
          ? this.parseJsonOrThrow(instance.variables, 'instance.variables')
          : (instance.variables || {});

        const vmContext = { variables: { ...variables }, Math, Number, Date, String };
        // eslint-disable-next-line no-new-func
        const fn = new Function('context', `
          "use strict";
          with(context) {
             ${script}
          }
          return context.variables;
        `);

        const newVars = fn(vmContext);

        // Cập nhật lại variables
        await this.prisma.processInstance.update({
          where: { id: instance.id },
          data: { variables: newVars }
        });
        instance.variables = newVars;

        await advanceToNext();
      } else if (action) {
        // 2. Gọi Domain Service (Saga / Outbox)
        this.logger.log(`Emitting Service Command ${action} for instance ${instance.id}`);
        const pt = instance.processType ? await this.catalogService.findByCode(instance.processType) : null;
        const targetService = node.data?.targetService || pt?.ownerService || 'default-service';
        
        await this.prisma.$transaction(async tx => {
          const cmd = await tx.workflowCommand.create({
            data: {
              instanceId: instance.id,
              commandType: action,
              targetService: targetService,
              payload: { nodeId: node.id, businessId: instance.businessKey, ...node.data },
              status: 'PENDING'
            }
          });
          
          await tx.workflowEvent.create({
            data: {
              instanceId: instance.id,
              eventType: 'workflow.command.sent',
              payload: { commandId: cmd.id, businessId: instance.businessKey, nodeId: node.id, ...node.data },
              status: 'PENDING'
            }
          });
        });
        // Không gọi advanceProcess ở đây, đợi DOMAIN_ACK từ Outbox
      } else {
        // Fallback: Skip (không script, không action)
        await advanceToNext();
      }
    } catch (e: any) {
      this.logger.error(`Error executing serviceTask ${node.id} in instance ${instance.id}: ${e.message}`);
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
        // [P1 #22] resolve node code đúng chuẩn compile() (n.code ?? n.nodeKey ?? n.id)
        nodeCode: this.resolveNodeCode(node),
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
    // [P1 #22] currentNodeId do caller truyền có thể là node.id OR node.code — resolve đúng chuẩn
    // compile() (`n.code ?? n.nodeKey ?? n.id`) rồi match edge source theo cả hai.
    const current = graph.nodes?.find(
      (n: any) => n.id === payload.currentNodeId || this.resolveNodeCode(n) === payload.currentNodeId,
    );
    if (!current) {
      return { allowed: false, reason: `Node ${payload.currentNodeId} not found in workflow graph` };
    }
    const sourceCodes = new Set<string>([current.id, this.resolveNodeCode(current)]);
    const edges = graph.edges?.filter((e: any) => sourceCodes.has(e.source) && (e.label === payload.actionName || e.action === payload.actionName || e.data?.action === payload.actionName));
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
    // [P2 #33] Clamp pagination: take tối đa 100, tối thiểu 1, mặc định 20 — chống unbounded query.
    const skip = Math.max(0, Number(filters?.skip) || 0);
    const take = Math.min(100, Math.max(1, Number(filters?.take) || 20));
    return this.prisma.processInstance.findMany({
      where,
      skip,
      take,
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
  
  async getTasks() { return this.prisma.workflowTask.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { instance: { include: { version: { include: { definition: true } } } } } }); }
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
      take: 100,
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
  async resumeInstance(instanceId: string, nodeId: string, actionData: any, userRoles?: string[], commandId?: string) {
    const result = await this.prisma.$transaction(async tx => {
      if (commandId) {
        const existing = await tx.processedCommand.findUnique({ where: { id: commandId } });
        if (existing) return { success: true, alreadyProcessed: true };
      }

      const instance = await tx.processInstance.findUnique({ where: { id: instanceId } });
      if (!instance) throw new NotFoundException('Instance not found');

      const task = await tx.workflowTask.findFirst({
        where: { instanceId, nodeCode: nodeId, status: 'PENDING' }
      });
      if (!task) throw new BadRequestException('No pending task for this node');

      await tx.workflowTask.update({
        where: { id: task.id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });

      if (commandId) {
        await tx.processedCommand.create({ data: { id: commandId, status: 'PROCESSED' } });
      }

      await tx.outboxEvent.create({
        data: {
          workflowInstanceId: instance.id,
          processVersion: instance.stateVersion + 1,
          nodeId: nodeId,
          commandType: actionData?.action || 'resume',
          eventType: 'workflow.task.completed',
          payload: { taskId: task.id, instanceId, actionData }
        }
      });

      return { success: true, alreadyProcessed: false };
    });

    if (result.success && !result.alreadyProcessed) {
      setImmediate(() => {
         this.advanceProcess(instanceId, actionData?.action || 'resume').catch(err => this.logger.error(err));
      });
    }

    return result;
  }
  
  async triggerAutoBinding(data: { entity: string; eventTrigger: string; payloadData: any }) {
    // BL-007: migrate from WorkflowBinding to startByProcessType (ProcessBinding)
    try {
      this.logger.log(`Auto-triggering workflow via resolver for ${data.entity}.${data.eventTrigger}`);
      return await this.startByProcessType({
        processTypeCode: data.eventTrigger, // Fallback processType = eventTrigger
        // [P2 #36] KHÔNG map organizationId = data.entity: `entity` là LOẠI thực thể nghiệp vụ
        // (vd 'document'), không phải organization. StartByProcessTypeRequest có field organizationId
        // nhưng triggerAutoBinding không nhận organizationId thật từ caller — để unset và service
        // dùng mặc định ('DEFAULT') thay vì nhiễm tenant scope sai.
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
