import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  CreateWorkflowGrpcDto,
  StartWorkflowGrpcDto,
  FindOneWorkflowGrpcDto,
  UpdateWorkflowGrpcDto,
  PublishWorkflowGrpcDto,
  ApplyModuleGrpcDto,
} from './dto/workflow.dto';
import { DefinitionService } from '../definition/definition.service';
import { ExecutionService } from '../execution/execution.service';

@Controller()
export class GrpcWorkflowController {
  constructor(
    private readonly definitionService: DefinitionService,
    private readonly executionService: ExecutionService,
  ) { }

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

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(@Payload() data: UpdateWorkflowGrpcDto) {
    const result = await this.definitionService.updateProcess(data.id, data);
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'FindOneWorkflow')
  async findOneWorkflow(@Payload() data: FindOneWorkflowGrpcDto) {
    const def = await this.definitionService.getDefinitionById(data.id);
    return this.mapToWorkflowResponse(def, def.versions[0]);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(_data: unknown) {
    const processes = await this.definitionService.getProcesses();
    return {
      data: processes.map((p) => this.mapToWorkflowResponse(p, p.versions[0])),
      meta: { total: processes.length },
    };
  }

  @GrpcMethod('WorkflowService', 'PublishWorkflow')
  async publishWorkflow(@Payload() data: PublishWorkflowGrpcDto) {
    const result = await this.definitionService.publishProcess(data.id);
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'ApplyModule')
  async applyModule(@Payload() data: ApplyModuleGrpcDto) {
    const result = await this.definitionService.applyModule(data.id, data.moduleCode);
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(@Payload() data: StartWorkflowGrpcDto) {
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
