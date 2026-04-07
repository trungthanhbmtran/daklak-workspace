import { Injectable, Logger, OnModuleInit, Inject } from "@nestjs/common";
import { PrismaService } from "@/database/prisma.service";
import { ClientGrpc } from "@nestjs/microservices";
import { Parser } from "expr-eval";
import { firstValueFrom } from "rxjs";

export enum WorkflowStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  WAITING = "WAITING",
}

@Injectable()
export class WorkflowEngineService implements OnModuleInit {
  private readonly logger = new Logger(WorkflowEngineService.name);
  private readonly parser = new Parser();

  private userService: any;
  private employeeHandlers: any;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientGrpc,
    @Inject('HRM_SERVICE') private readonly hrmClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.userService = this.usersClient.getService<any>('UserService');
    this.employeeHandlers = this.hrmClient.getService<any>('EmployeeHandlers');
  }

  /**
   * Start a new workflow instance
   */
  async startWorkflow(workflowId: string, initialContext: any = {}, initiatorId?: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) throw new Error("Workflow not found");

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId,
        status: WorkflowStatus.RUNNING,
        context: initialContext,
        initiatorId,
      },
    });

    // Find start node
    const definition = workflow.definition as any;
    const startNode = definition.nodes.find((n: any) => n.type === "start");

    if (!startNode) {
      await this.updateStatus(instance.id, WorkflowStatus.FAILED, "No start node found");
      return instance;
    }

    // Begin recursive execution
    this.executeNode(instance.id, startNode.id);

    return instance;
  }

  /**
   * Resume a workflow from a waiting state (User Task)
   */
  /**
   * Resume a workflow from a waiting state (User Task)
   * @param userRoles Roles of the user attempting to resume
   */
  async resumeWorkflow(instanceId: string, nodeId: string, actionData: any, userRoles: string[] = []) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: true },
    });

    if (!instance || instance.status !== WorkflowStatus.WAITING) {
      throw new Error("Instance not found or not in waiting state");
    }

    if (instance.currentNodeId !== nodeId) {
      throw new Error("Invalid node to resume from");
    }

    // PBAC Validation
    const definition = (instance.workflow.definition as any);
    const node = definition.nodes.find((n: any) => n.id === nodeId);
    const requiredRole = node?.data?.role;

    if (requiredRole && !userRoles.includes(requiredRole)) {
      await this.log(instanceId, nodeId, "ACCESS_DENIED", { userRoles, requiredRole });
      throw new Error(`Permission denied: node requires role ${requiredRole}`);
    }

    // Update context with user action data
    const newContext = { ... (instance.context as any), ...actionData };
    
    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: { 
        context: newContext,
        status: WorkflowStatus.RUNNING 
      },
    });

    await this.log(instanceId, nodeId, "RESUME", actionData);

    // Move to next node
    this.moveToNext(instanceId, nodeId, newContext);
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

      const definition = instance.workflow.definition as any;
      const node = definition.nodes.find((n: any) => n.id === nodeId);

      if (!node) {
        await this.updateStatus(instanceId, WorkflowStatus.FAILED, `Node ${nodeId} not found`);
        return;
      }

      await this.prisma.workflowInstance.update({
        where: { id: instanceId },
        data: { currentNodeId: nodeId },
      });

      await this.log(instanceId, nodeId, "ENTER", null, node.type, node.data?.label);

      let nextOperation: "CONTINUE" | "HALT" = "CONTINUE";
      let executionResult: any = null;

      switch (node.type) {
        case "start":
          // Start node just passes through
          break;

        case "end":
          await this.updateStatus(instanceId, WorkflowStatus.COMPLETED);
          nextOperation = "HALT";
          break;

        case "user_task":
          await this.updateStatus(instanceId, WorkflowStatus.WAITING);
          nextOperation = "HALT";
          break;

        case "condition":
          executionResult = this.evaluateCondition(node.data?.expression, instance.context);
          break;

        case "service_task":
          executionResult = await this.callService(node.data, instance.context);
          // Merge service response into context
          if (executionResult) {
            await this.updateContext(instanceId, { ... (instance.context as any), [node.id]: executionResult });
          }
          break;

        default:
          this.logger.warn(`Unknown node type: ${node.type}`);
      }

      await this.log(instanceId, nodeId, "EXECUTE", executionResult, node.type);

      if (nextOperation === "CONTINUE") {
        this.moveToNext(instanceId, nodeId, instance.context, executionResult);
      }
    } catch (error) {
      this.logger.error(`Error executing node ${nodeId}: ${error.message}`);
      await this.log(instanceId, nodeId, "ERROR", null, "unknown", undefined, error.message);
      await this.updateStatus(instanceId, WorkflowStatus.FAILED, error.message);
    }
  }

  private async moveToNext(instanceId: string, currentNodeId: string, context: any, result?: any) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: true },
    });

    if (!instance) return;

    const definition = instance.workflow.definition as any;
    const edges = definition.edges.filter((e: any) => e.source === currentNodeId);

    if (edges.length === 0) {
      await this.updateStatus(instanceId, WorkflowStatus.COMPLETED);
      return;
    }

    // For condition nodes, we might have specific target based on result
    let nextNodeId = edges[0].target;

    // Simple heuristic: if result is boolean (from condition), maybe choice logic?
    // In our simplified UI, we'll assume the first edge is 'true' or 'default'
    // To be more robust, we'd check edge properties like 'label === "True"'
    
    if (typeof result === "boolean") {
        const labeledEdge = edges.find((e: any) => 
            (result && e.label?.toLowerCase() === "true") || 
            (!result && e.label?.toLowerCase() === "false")
        );
        if (labeledEdge) nextNodeId = labeledEdge.target;
    }

    this.executeNode(instanceId, nextNodeId);
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
          if (this.userService && typeof this.userService[action] === 'function') {
            response = await firstValueFrom(this.userService[action](context));
          } else {
            throw new Error(`Action ${action} not found on UserService`);
          }
          break;

        case 'hrm':
        case 'hrm-service':
        case 'employee':
          if (this.employeeHandlers && typeof this.employeeHandlers[action] === 'function') {
            response = await firstValueFrom(this.employeeHandlers[action](context));
          } else {
            throw new Error(`Action ${action} not found on EmployeeHandlers`);
          }
          break;

        default:
          // Fallback to mock for unknown services or explicitly handled as common
          this.logger.warn(`Service ${service} is not registered or supported via gRPC. Using mock.`);
          return { success: true, timestamp: new Date().toISOString(), mock: true };
      }

      return response;
    } catch (e) {
      this.logger.error(`Service call to ${service}.${action} failed: ${e.message}`);
      throw new Error(`Service call failed: ${e.message}`);
    }
  }

  private async updateStatus(id: string, status: WorkflowStatus, error?: string) {
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

  private async log(instanceId: string, nodeId: string, action: string, data?: any, nodeType?: string, nodeLabel?: string, error?: string) {
    await this.prisma.executionLog.create({
      data: {
        instanceId,
        nodeId,
        nodeType: nodeType || "unknown",
        nodeLabel,
        action,
        data: data || undefined,
        error,
      },
    });
  }
}
