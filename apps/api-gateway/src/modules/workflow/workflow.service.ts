import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { CreateWorkflowDto, UpdateWorkflowDto, StartWorkflowDto } from './dto/workflow.dto';

@Injectable()
export class WorkflowService implements OnModuleInit {
  private workflowGrpcService: any;
  private categoryGrpcService: any;
  private orgGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
  ) {}

  onModuleInit() {
    this.workflowGrpcService = this.client.getService(MICROSERVICES.WORKFLOW.SERVICE);
    this.categoryGrpcService = this.catClient.getService(MICROSERVICES.SYS_CATEGORY.SERVICE);
    this.orgGrpcService = this.orgClient.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  async getMicroservices() {
    const result = (await firstValueFrom(
      this.categoryGrpcService.GetByGroup({ group: 'MICROSERVICE' }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result?.data || [], message: 'OK' };
  }

  async getTriggers() {
    const result = (await firstValueFrom(
      this.categoryGrpcService.GetByGroup({ group: 'WORKFLOW_TRIGGER' }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result?.data || [], message: 'OK' };
  }

  async getModules() {
    const result = (await firstValueFrom(
      this.workflowGrpcService.ListModules({}),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result?.data || [], message: 'OK' };
  }

  async getOrgRoles() {
    const result = (await firstValueFrom(
      this.orgGrpcService.ListJobTitles({}),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    const items = (result?.data ?? []).map((j: any) => ({
      code: j.code,
      name: j.name,
      rank: j.rank ?? 0,
      authorityLevel: j.authorityLevel,
      category: j.category,
    }));
    items.sort((a: any, b: any) => (a.rank ?? 99) - (b.rank ?? 99));
    return { success: true, data: items, message: 'OK' };
  }

  async create(body: CreateWorkflowDto) {
    const payload = {
      name: body.name,
      description: body.description,
      code: body.code,
      definition: body.definition || {},
    };
    const result = (await firstValueFrom(
      this.workflowGrpcService.CreateWorkflow(payload),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;

    return { success: true, data: result, message: 'Created successfully' };
  }

  async update(id: string, body: UpdateWorkflowDto) {
    const payload: any = {
      id,
      name: body.name,
      description: body.description,
      code: body.code,
      definition: body.definition || {},
    };

    const result = (await firstValueFrom(
      this.workflowGrpcService.UpdateWorkflow(payload),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;

    return { success: true, data: result, message: 'Updated successfully' };
  }

  async list(query: any) {
    const skip = parseInt(query.skip) || 0;
    const take = parseInt(query.take) || 20;
    const search = query.search;
    const result = (await firstValueFrom(
      this.workflowGrpcService.ListWorkflows({ skip, take, search }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;

    return {
      success: true,
      data: result?.data || [],
      meta: result?.meta,
      message: 'OK'
    };
  }

  async resume(instanceId: string, nodeId: string, body: any, user: any) {
    const userRoles = user?.roles || [];
    const result = (await firstValueFrom(
      this.workflowGrpcService.ResumeWorkflow({
        instanceId,
        nodeId,
        actionData: body.actionData || body,
        userRoles,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'Task resumed successfully' };
  }

  async listInstances(skip?: string, take?: string, workflowId?: string, status?: string, search?: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.ListInstances({
        skip: skip ? parseInt(skip, 10) : undefined,
        take: take ? parseInt(take, 10) : undefined,
        workflowId,
        status,
        search,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result?.data || [], meta: result?.meta, message: 'OK' };
  }

  async getInstance(id: string) {
    const result = await firstValueFrom(
      this.workflowGrpcService.GetInstance({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    return { success: true, data: result, message: 'OK' };
  }

  async getLogs(instanceId: string) {
    const response = (await firstValueFrom(
      this.workflowGrpcService.GetLogs({ instanceId }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: response?.logs || [], message: 'OK' };
  }

  async findOne(id: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.FindOneWorkflow({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'OK' };
  }

  async delete(id: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.DeleteWorkflow({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: result?.success ?? true, data: null, message: 'Deleted successfully' };
  }

  async publish(id: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.PublishWorkflow({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'Workflow published successfully' };
  }

  async applyModule(id: string, moduleCode: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.ApplyModule({ id, moduleCode }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'Module applied successfully' };
  }

  async start(id: string, body: StartWorkflowDto, user: any) {
    const initiatorId = user?.id?.toString() || 'system';
    const result = (await firstValueFrom(
      this.workflowGrpcService.StartWorkflow({
        workflowId: id,
        initialContext: body.initialContext,
        initiatorId,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'Workflow started' };
  }

  // --- Integrations ---

  async findAllIntegrations(query: any) {
    const search = query.search;
    const result = (await firstValueFrom(
      this.workflowGrpcService.FindAllIntegrations({ search: search || '' }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result?.data || [], message: 'OK' };
  }

  async createIntegration(body: any) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.CreateIntegration(body),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'Created successfully' };
  }

  async findOneIntegration(id: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.FindOneIntegration({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'OK' };
  }

  async updateIntegration(id: string, body: any) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.UpdateIntegration({ id, ...body }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: true, data: result, message: 'Updated successfully' };
  }

  async deleteIntegration(id: string) {
    const result = (await firstValueFrom(
      this.workflowGrpcService.DeleteIntegration({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return { success: result?.success ?? true, data: null, message: 'Deleted successfully' };
  }
}
