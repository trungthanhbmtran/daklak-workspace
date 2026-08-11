import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  CreateWorkflowGrpcDto,
  StartWorkflowGrpcDto,
  FindOneWorkflowGrpcDto,
  UpdateWorkflowGrpcDto,
  PublishWorkflowGrpcDto,
  ApplyModuleGrpcDto,
  ListWorkflowsGrpcDto,
  ListInstancesGrpcDto,
  EmptyGrpcDto,
  FindWorkflowByCodeGrpcDto,
  ValidateActionGrpcDto,
  GetNextNodeGrpcDto,
  GetInitialNodeGrpcDto,
  GetAllowedActionsGrpcDto,
  TriggerWorkflowGrpcDto,
  ResumeWorkflowGrpcDto,
  GetInstanceGrpcDto,
} from './dto/workflow.dto';
import { DefinitionService } from '../definition/definition.service';
import { ExecutionService } from '../execution/execution.service';

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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

  @GrpcMethod('WorkflowService', 'FindWorkflowByCode')
  async findWorkflowByCode(@Payload() data: FindWorkflowByCodeGrpcDto) {
    const def = await this.definitionService.getDefinition(data.code);
    return this.mapToWorkflowResponse(def, def.versions[0]);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(@Payload() _data: ListWorkflowsGrpcDto) {
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
    // StartWorkflow uses businessId (UUID of the definition or code string)
    // We use startProcess which accepts the definition CODE
    const instance = await this.executionService.startProcess(data.businessId || data.workflowId, {
      variables: data.initialContext,
      startedBy: data.initiatorId,
      businessKey: data.businessId,
      organizationId: data.businessType || 'DEFAULT',
    });
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'TriggerWorkflow')
  async triggerWorkflow(@Payload() data: TriggerWorkflowGrpcDto) {
    const instance = await this.executionService.triggerProcess(data.trigger, {
      businessId: data.businessId,
      businessType: data.businessType,
      initiatorId: data.initiatorId,
      initialContext: data.initialContext,
    });
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'ResumeWorkflow')
  async resumeWorkflow(@Payload() data: ResumeWorkflowGrpcDto) {
    const result = await this.executionService.resumeInstance(
      data.instanceId,
      data.nodeId,
      data.actionData || {},
      data.userRoles,
    );
    // Return updated instance after resume
    const instance = await this.executionService.getInstance(data.instanceId);
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'GetInstance')
  async getInstance(@Payload() data: GetInstanceGrpcDto) {
    const instance = await this.executionService.getInstance(data.id);
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'ListInstances')
  async listInstances(@Payload() _data: ListInstancesGrpcDto) {
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
  async listModules(@Payload() _data: EmptyGrpcDto) {
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

  @GrpcMethod('WorkflowService', 'ValidateAction')
  async validateAction(@Payload() data: ValidateActionGrpcDto) {
    return this.executionService.validateAction(data);
  }

  @GrpcMethod('WorkflowService', 'GetNextNode')
  async getNextNode(@Payload() data: GetNextNodeGrpcDto) {
    return this.executionService.getNextNode(data);
  }

  @GrpcMethod('WorkflowService', 'GetInitialNode')
  async getInitialNode(@Payload() data: GetInitialNodeGrpcDto) {
    return this.executionService.getInitialNode(data.workflowId);
  }

  @GrpcMethod('WorkflowService', 'GetAllowedActions')
  async getAllowedActions(@Payload() data: GetAllowedActionsGrpcDto) {
    return this.executionService.getAllowedActions(data);
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

  private mapInstanceToResponse(instance: any) {
    if (!instance) return {};
    return {
      id: instance.id,
      workflowId: instance.definitionId,
      status: instance.status,
      currentNodeId: instance.currentNodeCode,
      context: instance.variables,
      createdAt: instance.startedAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: instance.updatedAt?.toISOString?.() || new Date().toISOString(),
      workflowName: instance.version?.definition?.name || '',
      tasks: (instance.tasks || []).map((t: any) => ({
        id: t.id,
        instanceId: t.instanceId,
        nodeId: t.nodeCode,
        assigneeId: t.assigneeId || '',
        status: t.status,
        startedAt: t.createdAt?.toISOString?.() || '',
        completedAt: t.completedAt?.toISOString?.() || '',
      })),
    };
  }
}
