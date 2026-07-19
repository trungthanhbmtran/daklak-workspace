import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('Workflow')
@Controller('admin/workflow')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class WorkflowController implements OnModuleInit {
  private workflowService: any;
  private categoryService: any;
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly orgClient: any,
  ) { }

  onModuleInit() {
    this.workflowService = this.client.getService(
      MICROSERVICES.WORKFLOW.SERVICE,
    );
    this.categoryService = this.catClient.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
    this.orgService = this.orgClient.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
  }

  @Get('services')
  @ApiOperation({
    summary: 'Lấy danh sách các microservice khả dụng cho workflow',
  })
  async getMicroservices() {
    const result = (await firstValueFrom(
          this.categoryService.GetByGroup({ group: 'MICROSERVICE' }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { data: result.data || [] };
  }

  @Get('triggers')
  @ApiOperation({ summary: 'Lấy danh sách các trigger khả dụng' })
  async getTriggers() {
    const result = (await firstValueFrom(
          this.categoryService.GetByGroup({ group: 'WORKFLOW_TRIGGER' }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { data: result.data || [] };
  }

  @Get('modules')
  @ApiOperation({ summary: 'Danh sách module nghiệp vụ đang active (workflow Published)' })
  async getModules() {
    const result = (await firstValueFrom(
          this.workflowService.ListModules({}),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { data: result.items || [] };
  }

  @Get('org-roles')
  @ApiOperation({ summary: 'Danh sách chức danh/vị trí trong tổ chức (JobTitle) để thiết kế quyền workflow' })
  async getOrgRoles() {
    const result = (await firstValueFrom(
          this.orgService.ListJobTitles({}),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    const items = (result.items ?? []).map((j: any) => ({
      code: j.code,
      name: j.name,
      rank: j.rank ?? 0,
      authorityLevel: j.authorityLevel,
      category: j.category,
    }));
    // Sắp xếp theo cấp bậc (rank thấp = cấp cao hơn trong tổ chức)
    items.sort((a: any, b: any) => (a.rank ?? 99) - (b.rank ?? 99));
    return { data: items };
  }

  // --- Workflow Definitions ---

  private mapEdges(edges: any[], id: string, code: string) {
    return (edges || []).map((e: any, i: number) => {
      let source = e.sourceNodeId;
      let target = e.targetNodeId;

      if (source) {
        if (source.startsWith(`${id}_`)) source = source.replace(`${id}_`, '');
        else if (source.startsWith(`${code}_`)) source = source.replace(`${code}_`, '');
      }

      if (target) {
        if (target.startsWith(`${id}_`)) target = target.replace(`${id}_`, '');
        else if (target.startsWith(`${code}_`)) target = target.replace(`${code}_`, '');
      }

      return {
        id: e.id || `edge-${i}`,
        source,
        target,
        label: e.condition || '',
        data: { ...(e.properties || {}), expression: e.condition }
      };
    });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: any) {
    const payload = {
      name: body.name,
      description: body.description,
      code: body.trigger || body.code,
      nodes: (body.definition?.nodes || []).map((n: any) => ({
        nodeKey: n.id,
        type: n.type,
        name: n.data?.label || '',
        x: Math.round(n.position?.x || 0),
        y: Math.round(n.position?.y || 0),
        properties: n.data || {}
      })),
      edges: (body.definition?.edges || []).map((e: any) => ({
        sourceNodeId: e.source,
        targetNodeId: e.target,
        condition: e.data?.expression || e.label || '',
        properties: e.data || {}
      })),
      variables: body.definition?.variables || [],
    };
    const result = (await firstValueFrom(
          this.workflowService.CreateWorkflow(payload),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;

    // Map response back to frontend expected format
    if (result) {
      result.trigger = result.code;
      result.definition = {
        nodes: (result.nodes || []).map((n: any) => ({
          id: n.nodeKey || n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: { ...n.properties, label: n.name }
        })),
        edges: this.mapEdges(result.edges, result.id, result.code),
        variables: result.variables || [],
      };
      delete result.nodes;
      delete result.edges;
      delete result.variables;
    }
    return { data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(@Param('id') id: string, @Body() body: any) {
    const payload: any = {
      id,
      name: body.name,
      description: body.description,
      code: body.trigger || body.code,
    };
    if (body.definition) {
      payload.nodes = (body.definition.nodes || []).map((n: any) => ({
        nodeKey: n.id,
        type: n.type,
        name: n.data?.label || '',
        x: Math.round(n.position?.x || 0),
        y: Math.round(n.position?.y || 0),
        properties: n.data || {}
      }));
      payload.edges = (body.definition.edges || []).map((e: any) => ({
        sourceNodeId: e.source,
        targetNodeId: e.target,
        condition: e.data?.expression || e.label || '',
        properties: e.data || {}
      }));
      payload.variables = body.definition.variables || [];
    }

    const result = (await firstValueFrom(
          this.workflowService.UpdateWorkflow(payload),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;

    // Map response back to frontend expected format
    if (result) {
      result.trigger = result.code;
      result.definition = {
        nodes: (result.nodes || []).map((n: any) => ({
          id: n.nodeKey || n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: { ...n.properties, label: n.name }
        })),
        edges: this.mapEdges(result.edges, result.id, result.code),
        variables: result.variables || [],
      };
      delete result.nodes;
      delete result.edges;
      delete result.variables;
      delete result.code;
    }
    return { data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách quy trình' })
  async list(@Query() query: any) {
    const skip = parseInt(query.skip) || 0;
    const take = parseInt(query.take) || 20;
    const search = query.search;
    const result = (await firstValueFrom(
          this.workflowService.ListWorkflows({ skip, take, search }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    const items = (result.items || []).map((item: any) => {
      item.trigger = item.code;
      item.definition = {
        nodes: (item.nodes || []).map((n: any) => ({
          id: n.nodeKey || n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: { ...n.properties, label: n.name }
        })),
        edges: this.mapEdges(item.edges, item.id, item.code),
        variables: item.variables || [],
      };
      delete item.nodes;
      delete item.edges;
      delete item.variables;
      return item;
    });
    return {
      data: items,
      meta: { total: result.total || 0 },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string) {
    const result = (await firstValueFrom(
          this.workflowService.FindOneWorkflow({ id }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    if (result) {
      result.trigger = result.code;
      result.definition = {
        nodes: (result.nodes || []).map((n: any) => ({
          id: n.nodeKey || n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: { ...n.properties, label: n.name }
        })),
        edges: this.mapEdges(result.edges, result.id, result.code),
        variables: result.variables || [],
      };
      delete result.nodes;
      delete result.edges;
      delete result.variables;
    }
    return { data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string) {
    const result = (await firstValueFrom(
          this.workflowService.DeleteWorkflow({ id }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { success: result.success || true };
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish quy trình (kích hoạt để sẵn sàng dùng)' })
  async publish(@Param('id') id: string) {
    const result = (await firstValueFrom(
          this.workflowService.PublishWorkflow({ id }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    if (result) {
      result.trigger = result.code;
      result.definition = {
        nodes: (result.nodes || []).map((n: any) => ({
          id: n.nodeKey || n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: { ...n.properties, label: n.name }
        })),
        edges: this.mapEdges(result.edges, result.id, result.code),
        variables: result.variables || [],
      };
      delete result.nodes;
      delete result.edges;
      delete result.variables;
    }
    return { data: result };
  }

  @Post(':id/apply-module')
  @ApiOperation({ summary: 'Gán quy trình vào một nghiệp vụ và publish' })
  async applyModule(@Param('id') id: string, @Body() body: { moduleCode: string }) {
    const result = (await firstValueFrom(
          this.workflowService.ApplyModule({ id, moduleCode: body.moduleCode }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    if (result) {
      result.trigger = result.code;
      result.definition = {
        nodes: (result.nodes || []).map((n: any) => ({
          id: n.nodeKey || n.id,
          type: n.type,
          position: { x: n.x || 0, y: n.y || 0 },
          data: { ...n.properties, label: n.name }
        })),
        edges: this.mapEdges(result.edges, result.id, result.code),
        variables: result.variables || [],
      };
      delete result.nodes;
      delete result.edges;
      delete result.variables;
    }
    return { data: result };
  }

  // --- Execution Engine ---

  @Post(':id/start')
  @ApiOperation({ summary: 'Kích hoạt chạy một quy trình' })
  async start(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const initiatorId = req.user?.id?.toString() || 'system';
    const result = (await firstValueFrom(
          this.workflowService.StartWorkflow({
            workflowId: id,
            initialContext: body.initialContext || body,
            initiatorId,
          }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { data: result };
  }

  @Post('instances/:instanceId/resume/:nodeId')
  @ApiOperation({ summary: 'Xử lý bước chờ (User Task) trong quy trình' })
  async resume(
    @Param('instanceId') instanceId: string,
    @Param('nodeId') nodeId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const userRoles = req.user?.roles || [];
    const result = (await firstValueFrom(
          this.workflowService.ResumeWorkflow({
            instanceId,
            nodeId,
            actionData: body.actionData || body,
            userRoles,
          }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { data: result };
  }

  @Get('instances')
  @ApiOperation({ summary: 'Danh sách workflow instances' })
  async listInstances(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const result = (await firstValueFrom(
          this.workflowService.ListInstances({
            skip: skip ? parseInt(skip, 10) : undefined,
            take: take ? parseInt(take, 10) : undefined,
            workflowId,
            status,
            search,
          }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return { data: result.items, meta: { total: result.total } };
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string) {
    const result = await firstValueFrom(
          this.workflowService.GetInstance({ id }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
    return { data: result };
  }

  @Get('instances/:instanceId/logs')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string) {
    const response = (await firstValueFrom(
          this.workflowService.GetLogs({ instanceId }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    return {
      data: response.logs || [],
    };
  }
}
