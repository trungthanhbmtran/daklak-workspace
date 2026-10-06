import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException, 
  ForbiddenException
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  StartWorkflowDto,
} from './dto/workflow.dto';

@Injectable()
export class WorkflowService implements OnModuleInit {
  private workflowGrpcService: any;
  private categoryGrpcService: any;
  private orgGrpcService: any;
  private userGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
  ) {}

  onModuleInit() {
    this.workflowGrpcService = this.client.getService(MICROSERVICES.WORKFLOW.SERVICE);
    this.categoryGrpcService = this.catClient.getService(MICROSERVICES.SYS_CATEGORY.SERVICE);
    this.orgGrpcService = this.orgClient.getService(MICROSERVICES.ORGANIZATION.SERVICE);
    this.userGrpcService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

  // --- Process Catalog ---
  async registerProcessType(body: any) {
    const result = await firstValueFrom(this.workflowGrpcService.RegisterProcessType(body)).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'ProcessType registered' };
  }

  async listProcessTypes(activeOnly: boolean) {
    const result = (await firstValueFrom(this.workflowGrpcService.ListProcessTypes({ activeOnly })).catch((e) => this.handleRpcError(e))) as any;
    return { success: true, data: result?.data || [], message: 'OK' };
  }

  async getProcessType(code: string) {
    const result = await firstValueFrom(this.workflowGrpcService.GetProcessType({ code })).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'OK' };
  }

  // --- Process Bindings ---
  async createProcessBinding(body: any) {
    const result = await firstValueFrom(this.workflowGrpcService.CreateProcessBinding(body)).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'Binding created' };
  }

  async listProcessBindings(query: any) {
    const result = (await firstValueFrom(this.workflowGrpcService.ListProcessBindings(query)).catch((e) => this.handleRpcError(e))) as any;
    return { success: true, data: result?.data || [], meta: result?.meta, message: 'OK' };
  }

  async getProcessBinding(id: string) {
    const result = await firstValueFrom(this.workflowGrpcService.GetProcessBinding({ id })).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'OK' };
  }

  async deactivateProcessBinding(id: string, actorId: string, reason: string) {
    const result = await firstValueFrom(this.workflowGrpcService.DeactivateProcessBinding({ id, actorId, reason })).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'Binding deactivated' };
  }



  // --- Process Execution ---
  async startByProcessType(body: any) {
    const result = await firstValueFrom(this.workflowGrpcService.StartByProcessType(body)).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'Workflow started' };
  }

  async submitAction(body: any) {
    const result = await firstValueFrom(this.workflowGrpcService.SubmitAction(body)).catch((e) => this.handleRpcError(e));
    return { success: true, data: result, message: 'Action submitted' };
  }


  // --- Backward Compatible (Legacy APIs) ---


  private mapResponse(result: any) {
    if (!result) return {};
    const res = { ...result };
    if (res.definitionJson) {
      try {
        res.definition = JSON.parse(res.definitionJson);
      } catch (e) {
        res.definition = {};
      }
      delete res.definitionJson;
    }
    if (res.bpmnLogic) {
      try { res.bpmnLogic = JSON.parse(res.bpmnLogic); } catch (e) {}
    }
    if (res.uiMetadata) {
      try { res.uiMetadata = JSON.parse(res.uiMetadata); } catch (e) {}
    }
    return res;
  }

  async getMicroservices() {
    const result = (await firstValueFrom(this.categoryGrpcService.GetByGroup({ group: 'MICROSERVICE' })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result?.data || [], meta: {}, message: 'OK' };
  }

  async getTriggers() {
    const result = (await firstValueFrom(this.categoryGrpcService.GetByGroup({ group: 'WORKFLOW_TRIGGER' })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result?.data || [], meta: {}, message: 'OK' };
  }

  async getModules() {
    const result = (await firstValueFrom(this.workflowGrpcService.ListModules({})).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result?.data || [], meta: {}, message: 'OK' };
  }

  async getOrgRoles() {
    const result = (await firstValueFrom(this.orgGrpcService.ListJobTitles({})).catch(e => this.handleRpcError(e))) as any;
    const items = (result?.data ?? []).map((j: any) => ({ code: j.code, name: j.name, rank: j.rank ?? 0, authorityLevel: j.authorityLevel, category: j.category }));
    items.sort((a: any, b: any) => (a.rank ?? 99) - (b.rank ?? 99));
    return { success: true, data: items || [], meta: {}, message: 'OK' };
  }

  async create(body: CreateWorkflowDto, user?: any) {
    const payload = { 
      name: body.name, description: body.description, code: body.code, 
      definitionJson: body.definition ? JSON.stringify(body.definition) : undefined,
      bpmnLogic: body.bpmnLogic ? JSON.stringify(body.bpmnLogic) : undefined,
      uiMetadata: body.uiMetadata ? JSON.stringify(body.uiMetadata) : undefined,
      organizationId: user?.organizationId || user?.orgId,
      createdBy: user?.id?.toString()
    };
    const result = (await firstValueFrom(this.workflowGrpcService.CreateWorkflow(payload)).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: this.mapResponse(result) || {}, meta: {}, message: 'Created successfully' };
  }

  async update(id: string, body: UpdateWorkflowDto, user?: any) {
    const payload: any = { 
      id, name: body.name, description: body.description, code: body.code, 
      definitionJson: body.definition ? JSON.stringify(body.definition) : undefined,
      bpmnLogic: body.bpmnLogic ? JSON.stringify(body.bpmnLogic) : undefined,
      uiMetadata: body.uiMetadata ? JSON.stringify(body.uiMetadata) : undefined,
      organizationId: user?.organizationId || user?.orgId
    };
    const result = (await firstValueFrom(this.workflowGrpcService.UpdateWorkflow(payload)).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: this.mapResponse(result) || {}, meta: {}, message: 'Updated successfully' };
  }

  async list(query: any, user?: any) {
    const skip = query.skip || 0; const take = query.take || 20; const search = query.search;
    const organizationId = user?.organizationId || user?.orgId;
    const result = (await firstValueFrom(this.workflowGrpcService.ListWorkflows({ skip, take, search, organizationId })).catch(e => this.handleRpcError(e))) as any;
    const items = (result?.data || []).map((item: any) => this.mapResponse(item));
    return { success: true, data: items, meta: result?.meta || {}, message: 'OK' };
  }

  async resume(instanceId: string, nodeId: string, body: any, user: any) {
    const result = (await firstValueFrom(this.workflowGrpcService.ResumeWorkflow({ instanceId, nodeId, actionData: body.actionData || body, userRoles: [] })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result || {}, meta: {}, message: 'Task resumed successfully' };
  }

  async listInstances(query: any, organizationId?: string) {
    const payload = { ...query, organizationId };
    const result = (await firstValueFrom(this.workflowGrpcService.ListInstances(payload)).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result?.data || [], meta: result?.meta || {}, message: 'OK' };
  }

  async getInstance(id: string, organizationId?: string) {
    const result = await firstValueFrom(this.workflowGrpcService.GetInstance({ id, organizationId })).catch(e => this.handleRpcError(e));
    return { success: true, data: result || {}, meta: {}, message: 'OK' };
  }

  async getLogs(instanceId: string, organizationId?: string) {
    const response = (await firstValueFrom(this.workflowGrpcService.GetLogs({ instanceId, organizationId })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: response?.logs || [], meta: {}, message: 'OK' };
  }

  async findOne(id: string, user?: any) {
    const organizationId = user?.organizationId || user?.orgId;
    const result = (await firstValueFrom(this.workflowGrpcService.FindOneWorkflow({ id, organizationId })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: this.mapResponse(result) || {}, meta: {}, message: 'OK' };
  }

  async delete(id: string, user?: any) {
    const organizationId = user?.organizationId || user?.orgId;
    const result = (await firstValueFrom(this.workflowGrpcService.DeleteWorkflow({ id, organizationId })).catch(e => this.handleRpcError(e))) as any;
    return { success: result?.success ?? true, data: {}, meta: {}, message: 'Deleted successfully' };
  }

  async publish(id: string, user?: any) {
    const organizationId = user?.organizationId || user?.orgId;
    const actorId = user?.id?.toString();
    const result = (await firstValueFrom(this.workflowGrpcService.PublishWorkflow({ id, actorId, organizationId })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: this.mapResponse(result) || {}, meta: {}, message: 'Workflow published successfully' };
  }

  async applyModule(id: string, moduleCode: string) {
    const result = (await firstValueFrom(this.workflowGrpcService.ApplyModule({ id, moduleCode })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result || {}, meta: {}, message: 'Module applied successfully' };
  }

  async start(id: string, body: StartWorkflowDto, user: any) {
    const initiatorId = user?.id?.toString() || 'system';
    const result = (await firstValueFrom(this.workflowGrpcService.StartWorkflow({ workflowId: id, initialContext: body.initialContext, initiatorId })).catch(e => this.handleRpcError(e))) as any;
    return { success: true, data: result || {}, meta: {}, message: 'Workflow started' };
  }
}
