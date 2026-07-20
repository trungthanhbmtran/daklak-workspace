import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DefinitionService } from '../definition/definition.service';
import { ExecutionService } from '../execution/execution.service';

@Controller()
export class GrpcWorkflowController {
  constructor(
    private readonly definitionService: DefinitionService,
    private readonly executionService: ExecutionService,
  ) {}

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(data: any) {
    const result = await this.definitionService.createProcess({
      code: data.code,
      name: data.name,
      description: data.description,
      graph: data.definition || {},
    });
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(_data: unknown) {
    // In our new schema, Update might mean creating a new version or updating definition
    // For simplicity, we just create a new process if code doesn't exist, or fail
    // We should implement an update method in DefinitionService if needed.
    return { success: true };
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(_data: unknown) {
    const processes = await this.definitionService.getProcesses();
    return {
      items: processes.map((p) => this.mapToWorkflowResponse(p, p.versions[0])),
      total: processes.length,
    };
  }

  @GrpcMethod('WorkflowService', 'FindOneWorkflow')
  async findOneWorkflow(_data: { id: string }) {
    // Note: getDefinition uses 'code', while proto uses 'id'.
    // Need to adjust logic in Gateway or here to search by ID or Code.
    return { success: true };
  }

  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(data: {
    workflowId: string;
    initialContext: any;
    initiatorId: string;
  }) {
    // workflowId in new schema is definition code
    const instance = await this.executionService.startProcess(data.workflowId, {
      variables: data.initialContext,
      startedBy: data.initiatorId,
    });
    return {
      id: instance.id,
      workflowId: instance.definitionId,
      status: instance.status,
      currentNodeId: instance.currentNodeCode,
      context: instance.variables,
    };
  }

  @GrpcMethod('WorkflowService', 'ListInstances')
  async listInstances(_data: unknown) {
    const instances = await this.executionService.getInstances();
    return {
      items: instances.map((i: any) => ({
        id: i.id,
        workflowId: i.definitionId,
        status: i.status,
        currentNodeId: i.currentNodeCode,
        context: i.variables,
        createdAt: i.startedAt?.toISOString(),
      })),
      total: instances.length,
    };
  }

  private mapToWorkflowResponse(def: any, version: any) {
    if (!def) return {};
    return {
      id: def.id,
      code: def.code,
      name: def.name,
      description: def.description,
      version: version?.version || 1,
      status: version?.status || 'DRAFT',
      definition: version?.graph || {},
      trigger: def.code,
      createdAt: def.createdAt?.toISOString(),
    };
  }
}
