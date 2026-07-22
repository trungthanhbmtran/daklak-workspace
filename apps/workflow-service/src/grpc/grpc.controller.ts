import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { CreateWorkflowGrpcDto, StartWorkflowGrpcDto, FindOneWorkflowGrpcDto } from './dto/workflow.dto';
import { DefinitionService } from '../definition/definition.service';
import { ExecutionService } from '../execution/execution.service';

@Controller()
export class GrpcWorkflowController {
  constructor(
    private readonly definitionService: DefinitionService,
    private readonly executionService: ExecutionService,
  ) {}

  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(@Payload() data: CreateWorkflowGrpcDto) {
    const result = await this.definitionService.createProcess({
      code: data.code,
      name: data.name,
      description: data.description,
      graph: data.definition || {},
    });
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(_data: unknown) {
    const processes = await this.definitionService.getProcesses();
    return {
      data: processes.map((p) => this.mapToWorkflowResponse(p, p.versions[0])),
      meta: { total: processes.length },
    };
  }



  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(@Payload() data: StartWorkflowGrpcDto) {
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
      data: instances.map((i: any) => ({
        id: i.id,
        workflowId: i.definitionId,
        status: i.status,
        currentNodeId: i.currentNodeCode,
        context: i.variables,
        createdAt: i.startedAt?.toISOString(),
      })),
      meta: { total: instances.length },
    };
  }
  @GrpcMethod('WorkflowService', 'ListModules')
  async listModules(_data: unknown) {
    const processes = await this.definitionService.getProcesses();
    return {
      data: processes.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        updatedAt: p.updatedAt?.toISOString() || new Date().toISOString(),
      })),
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
