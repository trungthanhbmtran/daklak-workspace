import { Controller, Post, Body, Param, Get, NotFoundException } from "@nestjs/common";
import { WorkflowEngineService } from "./workflow-engine.service";
import { PrismaService } from "@/database/prisma.service";

@Controller("workflows")
export class WorkflowController {
  constructor(
    private readonly engine: WorkflowEngineService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Register a new workflow definition
   */
  @Post()
  async createWorkflow(@Body() body: { name: string; definition: any; description?: string }) {
    return this.prisma.workflow.create({
      data: {
        name: body.name,
        definition: body.definition,
        description: body.description,
      },
    });
  }

  /**
   * Start a new instance of a workflow
   */
  @Post(":id/start")
  async startWorkflow(
    @Param("id") id: string,
    @Body() initialContext: any
  ) {
    return this.engine.startWorkflow(id, initialContext);
  }

  /**
   * Resume a workflow instance from a User Task
   */
  @Post("instances/:instanceId/resume/:nodeId")
  async resumeWorkflow(
    @Param("instanceId") instanceId: string,
    @Param("nodeId") nodeId: string,
    @Body() body: { actionData: any; userRoles: string[] }
  ) {
    return this.engine.resumeWorkflow(instanceId, nodeId, body.actionData, body.userRoles);
  }

  /**
   * Get instance status and current node
   */
  @Get("instances/:id")
  async getInstance(@Param("id") id: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id },
      include: { 
        workflow: { select: { name: true } },
        logs: { orderBy: { createdAt: "desc" }, take: 10 }
      },
    });

    if (!instance) throw new NotFoundException("Instance not found");
    return instance;
  }

  /**
   * Get full execution logs for an instance
   */
  @Get("instances/:id/logs")
  async getLogs(@Param("id") id: string) {
    return this.prisma.executionLog.findMany({
      where: { instanceId: id },
      orderBy: { createdAt: "asc" },
    });
  }
}
