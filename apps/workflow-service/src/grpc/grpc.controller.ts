import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, Payload, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { DefinitionService } from '../definition/definition.service';
import { ExecutionService } from '../execution/execution.service';
import { ProcessCatalogService } from '../catalog/process-catalog.service';
import { BindingService } from '../catalog/binding.service';
// Assuming DTOs exist, I will cast to any for simplicity in this implementation
// In a real project, we should update the DTO file as well.

@Controller()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class GrpcWorkflowController {
  constructor(
    private readonly definitionService: DefinitionService,
    private readonly executionService: ExecutionService,
    private readonly catalogService: ProcessCatalogService,
    private readonly bindingService: BindingService,
  ) {}

  // =========================================================================
  // DEFINITION MANAGEMENT
  // =========================================================================
  @GrpcMethod('WorkflowService', 'CreateWorkflow')
  async createWorkflow(@Payload() data: any) {
    const result = await this.definitionService.createProcess({
      code: data.code,
      name: data.name,
      description: data.description,
      graph: data.definition || {},
    });
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'UpdateWorkflow')
  async updateWorkflow(@Payload() data: any) {
    const result = await this.definitionService.updateProcess(data.id, data);
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'FindOneWorkflow')
  async findOneWorkflow(@Payload() data: any) {
    const def = await this.definitionService.getDefinitionById(data.id);
    return this.mapToWorkflowResponse(def, def.versions[0]);
  }

  @GrpcMethod('WorkflowService', 'FindWorkflowByCode')
  async findWorkflowByCode(@Payload() data: any) {
    const def = await this.definitionService.getDefinition(data.code);
    return this.mapToWorkflowResponse(def, def.versions[0]);
  }

  @GrpcMethod('WorkflowService', 'ListWorkflows')
  async listWorkflows(@Payload() data: any) {
    const { items, total } = await this.definitionService.listProcesses(data || {});
    const take = Math.min(100, Math.max(1, Number(data?.take) || 20));
    const skip = Math.max(0, Number(data?.skip) || 0);
    const totalPages = Math.max(1, Math.ceil(total / take));
    const page = Math.floor(skip / take) + 1;
    return {
      data: items.map((p) => this.mapToWorkflowResponse(p, p.versions[0])),
      meta: {
        total, page, pageSize: take, totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  @GrpcMethod('WorkflowService', 'DeleteWorkflow')
  async deleteWorkflow(@Payload() data: any) {
    await this.definitionService.deleteProcess(data.id);
    return { success: true };
  }

  @GrpcMethod('WorkflowService', 'ApplyModule')
  async applyModule(@Payload() data: any) {
    const result = await this.definitionService.applyModule(data.id, data.moduleCode);
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'PublishWorkflow')
  async publishWorkflow(@Payload() data: any) {
    const result = await this.definitionService.publishProcess(data.id, data.actorId);
    return this.mapToWorkflowResponse(result.def, result.version);
  }

  @GrpcMethod('WorkflowService', 'ValidateWorkflowDefinition')
  async validateWorkflowDefinition(@Payload() data: any) {
    const result = await this.definitionService.validateProcess(data.definitionId, data.versionId);
    return {
      valid: result.valid,
      errors: result.errors,
    };
  }

  // =========================================================================
  // PROCESS CATALOG
  // =========================================================================
  @GrpcMethod('WorkflowService', 'RegisterProcessType')
  async registerProcessType(@Payload() data: any) {
    return this.catalogService.register(data);
  }

  @GrpcMethod('WorkflowService', 'GetProcessType')
  async getProcessType(@Payload() data: any) {
    return this.catalogService.findByCode(data.code);
  }

  @GrpcMethod('WorkflowService', 'ListProcessTypes')
  async listProcessTypes(@Payload() data: any) {
    const types = await this.catalogService.listAll(data.activeOnly);
    return { data: types };
  }

  @GrpcMethod('WorkflowService', 'ListModules')
  async listModules() {
    return { data: [] };
  }

  // =========================================================================
  // BINDING MANAGEMENT
  // =========================================================================
  @GrpcMethod('WorkflowService', 'CreateProcessBinding')
  async createProcessBinding(@Payload() data: any) {
    return this.bindingService.create(data);
  }

  @GrpcMethod('WorkflowService', 'UpdateProcessBinding')
  async updateProcessBinding(@Payload() data: any) {
    // proto3 gửi '' / 0 cho field không set → chuẩn hóa về undefined để không ghi đè dữ liệu.
    if (!data?.updatedBy) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'updatedBy is required' });
    }
    return this.bindingService.update(data.id, {
      pinnedVersionId: data.pinnedVersionId || undefined,
      status: data.status || undefined,
      priority: data.priority ? Number(data.priority) : undefined,
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
      reason: data.reason || undefined,
      updatedBy: data.updatedBy,
    });
  }

  @GrpcMethod('WorkflowService', 'GetProcessBinding')
  async getProcessBinding(@Payload() data: any) {
    return this.bindingService.findById(data.id);
  }

  @GrpcMethod('WorkflowService', 'ListProcessBindings')
  async listProcessBindings(@Payload() data: any) {
    const { items, total } = await this.bindingService.list(data);
    return {
      data: items,
      meta: { total, skip: data.skip || 0, take: data.take || 20 }
    };
  }

  @GrpcMethod('WorkflowService', 'DeactivateProcessBinding')
  async deactivateProcessBinding(@Payload() data: any) {
    return this.bindingService.deactivate(data.id, data.actorId, data.reason);
  }

  @GrpcMethod('WorkflowService', 'ResolveBinding')
  async resolveBinding(@Payload() data: any) {
    return this.bindingService.resolveBinding(data);
  }

  // =========================================================================
  // EXECUTION ENGINE
  // =========================================================================
  @GrpcMethod('WorkflowService', 'StartWorkflow')
  async startWorkflow(@Payload() data: any) {
    const instance = await this.executionService.startProcess(
      data.businessId || data.workflowId,
      {
        variables: data.initialContext,
        startedBy: data.initiatorId,
        businessKey: data.businessId,
        organizationId: data.businessType || 'DEFAULT',
        commandId: data.commandId,
      } as any,
    );
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'StartByProcessType')
  async startByProcessType(@Payload() data: any) {
    const instance = await this.executionService.startByProcessType(data);
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'SubmitAction')
  async submitAction(@Payload() data: any) {
    return this.executionService.submitAction(data);
  }

  @GrpcMethod('WorkflowService', 'ResumeWorkflow')
  async resumeWorkflow(@Payload() data: any) {
    return this.executionService.resumeInstance(
      data.instanceId,
      data.nodeId,
      data.actionData,
      data.userRoles
    );
  }

  @GrpcMethod('WorkflowService', 'AcknowledgeCommand')
  async acknowledgeCommand(@Payload() data: any) {
    return this.executionService.acknowledgeCommand(data);
  }

  @GrpcMethod('WorkflowService', 'GetInstance')
  async getInstance(@Payload() data: any) {
    const instance = await this.executionService.getInstance(data.id, data.organizationId);
    return this.mapInstanceToResponse(instance);
  }

  @GrpcMethod('WorkflowService', 'ListInstances')
  async listInstances(@Payload() data: any) {
    const instances = await this.executionService.getInstances({
      skip: data.skip || 0,
      take: data.take || 20,
      workflowId: data.workflowId,
      status: data.status,
      organizationId: data.organizationId,
      processType: data.processType,
      businessId: data.businessId,
      search: data.search,
    });
    return {
      data: instances.map((i: any) => this.mapInstanceToResponse(i)),
      meta: { total: instances.length, skip: data.skip || 0, take: data.take || 20 },
    };
  }

  @GrpcMethod('WorkflowService', 'GetLogs')
  async getLogs(@Payload() data: any) {
    const logs = await this.executionService.getLogs(data.instanceId, data.organizationId);
    return { logs };
  }

  @GrpcMethod('WorkflowService', 'ValidateAction')
  async validateAction(@Payload() data: any) {
    return this.executionService.validateAction(data);
  }

  @GrpcMethod('WorkflowService', 'GetAllowedActions')
  async getAllowedActions(@Payload() data: any) {
    return this.executionService.getAllowedActions(data);
  }

  @GrpcMethod('WorkflowService', 'GetAllowedActionsBatch')
  async getAllowedActionsBatch(@Payload() data: { requests: any[] }) {
    const results = await this.executionService.getAllowedActionsBatch(data.requests || []);
    return { results };
  }

  // =========================================================================
  // MAPPERS
  // =========================================================================
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
      updatedAt: def.updatedAt?.toISOString(),
      publishedBy: version?.publishedBy,
      publishedAt: version?.publishedAt?.toISOString(),
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
      processType: instance.processType,
      businessId: instance.businessId,
      correlationId: instance.correlationId,
      allowedActions: (instance as any).allowedActions || [],
      stateVersion: instance.stateVersion || 1,
      organizationId: instance.organizationId,
      businessType: instance.businessType,
      lastCommandId: (instance as any).lastCommandId || '',
      lastCommandStatus: (instance as any).lastCommandStatus || '',
      lastCommandError: (instance as any).lastCommandError || '',
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
