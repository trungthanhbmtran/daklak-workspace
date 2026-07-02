import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { ClientGrpc } from '@nestjs/microservices';
import { Parser } from 'expr-eval';
import { firstValueFrom } from 'rxjs';

export enum WorkflowStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  WAITING = 'WAITING',
}

@Injectable()
export class WorkflowEngineService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEngineService.name);
  private readonly parser = new Parser();

  private userService: any;
  private categoryService: any;
  private employeeHandlers: any;
  private postService: any;
  private documentService: any;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientGrpc,
    @Inject('CATEGORIES_SERVICE') private readonly categoriesClient: ClientGrpc,
    @Inject('HRM_SERVICE') private readonly hrmClient: ClientGrpc,
    @Inject('POSTS_SERVICE') private readonly postsClient: ClientGrpc,
    @Inject('DOCUMENT_SERVICE') private readonly documentClient: ClientGrpc,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: any,
  ) {}

  onModuleInit() {
    this.userService = this.usersClient.getService<any>('UserService');
    this.categoryService =
      this.categoriesClient.getService<any>('CategoryService');
    this.employeeHandlers = this.hrmClient.getService<any>('EmployeeHandlers');
    this.postService = this.postsClient.getService<any>('PostService');
    this.documentService =
      this.documentClient.getService<any>('DocumentService');
  }

  /**
   * Start a new workflow instance
   */
  async startWorkflow(
    workflowId: string,
    initialContext: any = {},
    initiatorId?: string,
    businessId?: string,
    businessType?: string,
  ) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) throw new Error('Workflow not found');

    // Defensive check for definition
    let definition: any = workflow.definition;
    if (typeof definition === 'string') {
      try {
        definition = JSON.parse(definition);
      } catch (e) {
        definition = {};
      }
    }

    const nodes = (definition?.nodes || []) as any[];

    if (!Array.isArray(nodes) || nodes.length === 0) {
      throw new Error(
        `Workflow "${workflow.name}" definition is empty or invalid (no nodes found)`,
      );
    }

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId,
        status: WorkflowStatus.RUNNING,
        context: initialContext,
        initiatorId,
        businessId,
        businessType,
      },
    });

    // Find start node
    const startNode = nodes.find((n: any) => n.type === 'start');

    if (!startNode) {
      const errorMsg = `No start node found in workflow "${workflow.name}" definition. Found ${nodes.length} nodes but none of type "start".`;
      await this.updateStatus(instance.id, WorkflowStatus.FAILED, errorMsg);
      throw new Error(errorMsg);
    }

    // Begin recursive execution
    this.executeNode(instance.id, startNode.id);

    return instance;
  }

  /**
   * Trigger a workflow by event name
   */
  async triggerWorkflow(
    trigger: string,
    initialContext: any = {},
    initiatorId?: string,
    businessId?: string,
    businessType?: string,
  ) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { trigger, active: true },
      orderBy: { version: 'desc' },
    });

    if (!workflow) {
      this.logger.debug(`No active workflow found for trigger: ${trigger}`);
      return null;
    }

    return this.startWorkflow(workflow.id, initialContext, initiatorId, businessId, businessType);
  }

  /**
   * Resume a workflow from a waiting state (User Task)
   */
  /**
   * Resume a workflow from a waiting state (User Task)
   * @param userRoles Roles of the user attempting to resume
   */
  async resumeWorkflow(
    instanceId: string,
    nodeId: string,
    actionData: any,
    userRoles: string[] = [],
  ) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: true },
    });

    if (!instance || instance.status !== WorkflowStatus.WAITING) {
      throw new Error('Instance not found or not in waiting state');
    }

    if (instance.currentNodeId !== nodeId && nodeId !== '') {
      throw new Error(`Invalid node to resume from. Expected ${instance.currentNodeId}, got ${nodeId}`);
    }

    const targetNodeId = nodeId || instance.currentNodeId || '';

    // PBAC Validation
    let definition: any = instance.workflow.definition;
    if (typeof definition === 'string') {
      try {
        definition = JSON.parse(definition);
      } catch (e) {
        definition = {};
      }
    }
    const nodes = (definition?.nodes || []) as any[];
    const node = nodes.find((n: any) => n.id === targetNodeId);
    const requiredRole = node?.data?.role;

    if (requiredRole && !userRoles.includes(requiredRole)) {
      await this.log(instanceId, targetNodeId, 'ACCESS_DENIED', {
        userRoles,
        requiredRole,
      });
      throw new Error(`Permission denied: node requires role ${requiredRole}`);
    }

    // Update context with user action data
    const newContext = { ...(instance.context as any), ...actionData };

    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        context: newContext,
        status: WorkflowStatus.RUNNING,
      },
    });

    await this.log(instanceId, targetNodeId, 'RESUME', actionData);

    // Move to next node
    this.moveToNext(instanceId, targetNodeId, newContext);
  }

  /**
   * Validate if a user can perform an action based on workflow state
   */
  async validateAction(
    instanceId: string,
    actionName: string,
    userRoles: string[] = [],
    userId?: string,
    businessData?: any,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: true },
    });

    if (!instance) return { allowed: false, reason: 'Instance not found' };
    if (instance.status !== WorkflowStatus.WAITING) return { allowed: false, reason: `Workflow is currently ${instance.status}, not waiting for user action` };

    let definition: any = instance.workflow.definition;
    if (typeof definition === 'string') {
      try {
        definition = JSON.parse(definition);
      } catch (e) {
        definition = {};
      }
    }

    const nodes = (definition?.nodes || []) as any[];
    const node = nodes.find((n: any) => n.id === instance.currentNodeId);

    if (!node) return { allowed: false, reason: 'Current node not found in workflow definition' };

    // Check PBAC required role on node
    const requiredRole = node?.data?.role;
    if (requiredRole && !userRoles.includes(requiredRole)) {
      return { allowed: false, reason: `Requires role: ${requiredRole}` };
    }

    // Evaluate dynamic validation expression if present
    if (node?.data?.validationExpression) {
       try {
         // Optionally load user data if requested
         let userContext: any = {};
         if (userId) {
            // Load user subordinates as an example
            try {
               const subRes: any = await firstValueFrom(this.userService.GetSubordinates({ userId }));
               userContext.allowedEmployeeCodes = subRes.allowedEmployeeCodes || subRes.allowed_employee_codes || [];
            } catch(e) {
               this.logger.warn(`Failed to fetch subordinates for user ${userId}`);
            }
         }

         const evalContext = {
           ...instance.context as any,
           ...businessData,
           actionName,
           userId,
           userRoles,
           userContext
         };
         
         // Use new Function for complex JS business rules instead of expr-eval
         const validator = new Function('context', `
            with (context) {
               ${node.data.validationExpression}
            }
         `);
         const isAllowed = !!validator(evalContext);
         if (!isAllowed) {
            return { allowed: false, reason: `Không thỏa mãn điều kiện quy trình chặn.` };
         }
       } catch (e) {
         this.logger.error(`Validation expression failed: ${e.message}`);
         return { allowed: false, reason: `Lỗi tính toán biểu thức phân quyền: ${e.message}` };
       }
    }

    return { allowed: true };
  }

  /**
   * Get all allowed actions for a user
   */
  async getAllowedActions(
    instanceId: string,
    userRoles: string[] = [],
    userId?: string,
    businessData?: any,
  ): Promise<string[]> {
    const possibleActions = ['EDIT', 'ASSIGN', 'ADD_SUBTASK', 'DELETE', 'COMPLETE', 'APPROVE', 'RETURN', 'CHAT', 'COORDINATE'];
    const allowed: string[] = [];
    
    for (const action of possibleActions) {
      const res = await this.validateAction(instanceId, action, userRoles, userId, businessData);
      if (res.allowed) allowed.push(action);
    }
    
    return allowed;
  }

  /**
   * Core node execution logic
   */
  private async executeNode(instanceId: string, nodeId: string) {
    try {
      const instance = await this.prisma.workflowInstance.findUnique({
        where: { id: instanceId },
        include: { workflow: true },
      });

      if (!instance) return;

      let definition: any = instance.workflow.definition;
      if (typeof definition === 'string') {
        try {
          definition = JSON.parse(definition);
        } catch (e) {
          definition = {};
        }
      }
      const nodes = (definition?.nodes || []) as any[];
      const node = nodes.find((n: any) => n.id === nodeId);

      if (!node) {
        await this.updateStatus(
          instanceId,
          WorkflowStatus.FAILED,
          `Node ${nodeId} not found`,
        );
        return;
      }

      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentNodeId: nodeId },
      });

      await this.log(
        instanceId,
        nodeId,
        'ENTER',
        null,
        node.type,
        node.data?.label,
      );

      let nextOperation: 'CONTINUE' | 'HALT' = 'CONTINUE';
      let executionResult: any = null;

      switch (node.type) {
        case 'start':
          // Start node just passes through
          break;

        case 'end':
          await this.updateStatus(instanceId, WorkflowStatus.COMPLETED);
          nextOperation = 'HALT';
          break;

        case 'user_task':
          await this.updateStatus(instanceId, WorkflowStatus.WAITING);
          
          // Gửi message queue thông báo khi đến bước user_task
          try {
            const role = node.data?.role;
            const assignee = (instance.context as any)?.assignee || node.data?.assignee;
            let recipients: string[] = [];
            
            if (assignee) recipients.push(assignee);
            if (!assignee && role) recipients.push(`role:${role}`);
            
            // Nếu không có assignee hoặc role rõ ràng, có thể fallback gửi cho initiatorId
            if (recipients.length === 0 && instance.initiatorId) {
               recipients.push(instance.initiatorId);
            }
            
            if (recipients.length > 0 && this.notificationClient) {
              this.logger.log(`Dispatching notification via message queue to ${recipients.join(', ')}`);
              this.notificationClient.emit('send_notification', {
                recipients,
                subject: `Công việc mới: ${instance.workflow?.name || 'Quy trình xử lý'}`,
                body: `Bạn vừa nhận được một công việc mới: ${node.data?.label || 'Cần xử lý'}. Vui lòng đăng nhập vào hệ thống để tiếp nhận.`,
                metadata: {
                  workflowId: instance.workflowId,
                  instanceId: instance.id,
                  nodeId: node.id,
                }
              });
            }
          } catch (err) {
            this.logger.error(`Failed to send user_task notification: ${err.message}`);
          }

          nextOperation = 'HALT';
          break;

        case 'condition':
          executionResult = this.evaluateCondition(
            node.data?.expression,
            instance.context,
          );
          break;

        case 'exclusive_gateway':
          // Evaluates conditions on edges in moveToNext.
          break;

        case 'parallel_gateway':
          const incomingEdges = (definition.edges || []).filter((e: any) => e.target === nodeId);
          if (incomingEdges.length > 1) {
            let currentContext = instance.context as any || {};
            currentContext._gatewayState = currentContext._gatewayState || {};
            currentContext._gatewayState[nodeId] = currentContext._gatewayState[nodeId] || { tokens: 0 };
            currentContext._gatewayState[nodeId].tokens += 1;
            
            await this.updateContext(instanceId, currentContext);
            
            if (currentContext._gatewayState[nodeId].tokens < incomingEdges.length) {
              nextOperation = 'HALT';
              this.logger.log(`Parallel Join [${nodeId}]: Waiting for more tokens (${currentContext._gatewayState[nodeId].tokens}/${incomingEdges.length})`);
            } else {
              currentContext._gatewayState[nodeId].tokens = 0;
              await this.updateContext(instanceId, currentContext);
              nextOperation = 'CONTINUE';
              this.logger.log(`Parallel Join [${nodeId}]: All tokens arrived, continuing.`);
            }
          } else {
            nextOperation = 'CONTINUE';
          }
          break;

        case 'script_task':
          try {
            if (node.data?.expression) {
              const result = this.parser.evaluate(node.data.expression, (instance.context || {}) as any);
              executionResult = result;
              await this.updateContext(instanceId, {
                ...(instance.context as any),
                [node.id]: result,
              });
            }
          } catch (e) {
            this.logger.error('Script evaluation failed', e);
          }
          break;

        case 'service_task':
          executionResult = await this.callService(node.data, instance.context);
          // Merge service response into context
          if (executionResult) {
            await this.updateContext(instanceId, {
              ...(instance.context as any),
              [node.id]: executionResult,
            });
          }
          break;

        default:
          this.logger.warn(`Unknown node type: ${node.type}`);
      }

      await this.log(instanceId, nodeId, 'EXECUTE', executionResult, node.type);

      if (nextOperation === 'CONTINUE') {
        this.moveToNext(instanceId, nodeId, instance.context, executionResult);
      }
    } catch (error) {
      this.logger.error(`Error executing node ${nodeId}: ${error.message}`);
      await this.log(
        instanceId,
        nodeId,
        'ERROR',
        null,
        'unknown',
        undefined,
        error.message,
      );
      await this.updateStatus(instanceId, WorkflowStatus.FAILED, error.message);
    }
  }

  private async moveToNext(
    instanceId: string,
    currentNodeId: string,
    context: any,
    result?: any,
  ) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: true },
    });

    if (!instance) return;

    const definition = (instance.workflow.definition as any) || {};
    const edges = (definition.edges || []).filter(
      (e: any) => e.source === currentNodeId,
    );

    if (edges.length === 0) {
      await this.updateStatus(instanceId, WorkflowStatus.COMPLETED);
      return;
    }

    const currentNode = (definition.nodes || []).find((n: any) => n.id === currentNodeId);
    
    if (currentNode?.type === 'exclusive_gateway') {
      let chosenEdge = edges.find((e: any) => e.label === 'default' || e.data?.isDefault);
      for (const edge of edges) {
        if (edge.data?.expression) {
          if (this.evaluateCondition(edge.data.expression, context)) {
            chosenEdge = edge;
            break;
          }
        }
      }
      if (!chosenEdge) chosenEdge = edges[0];
      this.executeNode(instanceId, chosenEdge.target);
    } 
    else if (currentNode?.type === 'parallel_gateway' || edges.length > 1) {
      // Fork
      for (const edge of edges) {
        this.executeNode(instanceId, edge.target);
      }
    } 
    else {
      // For condition nodes backward compatibility
      let nextNodeId = edges[0].target;
      if (currentNode?.type === 'condition' && typeof result === 'boolean') {
        const labeledEdge = edges.find(
          (e: any) =>
            (result && e.label?.toLowerCase() === 'true') ||
            (!result && e.label?.toLowerCase() === 'false'),
        );
        if (labeledEdge) nextNodeId = labeledEdge.target;
      }
      this.executeNode(instanceId, nextNodeId);
    }
  }

  private evaluateCondition(expression: string, context: any): boolean {
    try {
      if (!expression) return true;
      const result = this.parser.evaluate(expression, context);
      return !!result;
    } catch (e) {
      this.logger.error(`Condition evaluation failed: ${e.message}`);
      return false;
    }
  }

  private async callService(config: any, context: any): Promise<any> {
    const { action, service } = config;
    this.logger.log(`Calling service: ${service} with action: ${action}`);

    try {
      let response;
      switch (service?.toLowerCase()) {
        case 'user':
        case 'users':
        case 'user-service':
          if (
            this.userService &&
            typeof this.userService[action] === 'function'
          ) {
            response = await firstValueFrom(this.userService[action](context));
          } else {
            throw new Error(`Action ${action} not found on UserService`);
          }
          break;

        case 'hrm':
        case 'hrm-service':
        case 'employee':
          if (
            this.employeeHandlers &&
            typeof this.employeeHandlers[action] === 'function'
          ) {
            response = await firstValueFrom(
              this.employeeHandlers[action](context),
            );
          } else {
            throw new Error(`Action ${action} not found on EmployeeHandlers`);
          }
          break;

        case 'post':
        case 'posts':
        case 'posts-service':
          if (
            this.postService &&
            typeof this.postService[action] === 'function'
          ) {
            response = await firstValueFrom(this.postService[action](context));
          } else {
            throw new Error(`Action ${action} not found on PostService`);
          }
          break;

        case 'document':
        case 'documents':
        case 'document-service':
          if (
            this.documentService &&
            typeof this.documentService[action] === 'function'
          ) {
            response = await firstValueFrom(
              this.documentService[action](context),
            );
          } else {
            throw new Error(`Action ${action} not found on DocumentService`);
          }
          break;

        default:
          // Fallback to mock for unknown services or explicitly handled as common
          this.logger.warn(
            `Service ${service} is not registered or supported via gRPC. Using mock.`,
          );
          return {
            success: true,
            timestamp: new Date().toISOString(),
            mock: true,
          };
      }

      return response;
    } catch (e) {
      this.logger.error(
        `Service call to ${service}.${action} failed: ${e.message}`,
      );
      throw new Error(`Service call failed: ${e.message}`);
    }
  }

  private async updateStatus(
    id: string,
    status: WorkflowStatus,
    error?: string,
  ) {
    await this.prisma.workflowInstance.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    if (error) this.logger.error(`Instance ${id} failed: ${error}`);
  }

  private async updateContext(id: string, context: any) {
    await this.prisma.workflowInstance.update({
      where: { id },
      data: { context },
    });
  }

  private async log(
    instanceId: string,
    nodeId: string,
    action: string,
    data?: any,
    nodeType?: string,
    nodeLabel?: string,
    error?: string,
  ) {
    await this.prisma.executionLog.create({
      data: {
        instanceId,
        nodeId,
        nodeType: nodeType || 'unknown',
        nodeLabel,
        action,
        data: data || undefined,
        error,
      },
    });
  }
}
