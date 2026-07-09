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

  constructor(
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
  ) {}

  onModuleInit() {
    this.workflowService = this.client.getService(
      MICROSERVICES.WORKFLOW.SERVICE,
    );
    this.categoryService = this.catClient.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  @Get('services')
  @ApiOperation({
    summary: 'Lấy danh sách các microservice khả dụng cho workflow',
  })
  async getMicroservices() {
    const result = (await firstValueFrom(
      this.categoryService.GetByGroup({ group: 'MICROSERVICE' }),
    )) as any;
    return { data: result.data || [] };
  }

  @Get('triggers')
  @ApiOperation({ summary: 'Lấy danh sách các trigger khả dụng' })
  async getTriggers() {
    const result = (await firstValueFrom(
      this.categoryService.GetByGroup({ group: 'WORKFLOW_TRIGGER' }),
    )) as any;
    return { data: result.data || [] };
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
        data: { expression: e.condition }
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
        condition: e.data?.expression || e.label || ''
      })),
      variables: body.definition?.variables || [],
    };
    const result = (await firstValueFrom(
      this.workflowService.CreateWorkflow(payload),
    )) as any;
    
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

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(@Param('id') id: string, @Body() body: any) {
    const payload = {
      id,
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
        condition: e.data?.expression || e.label || ''
      })),
      variables: body.definition?.variables || [],
    };
    const result = (await firstValueFrom(
      this.workflowService.UpdateWorkflow(payload),
    )) as any;
    
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
    )) as any;
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
      delete item.code;
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
    )) as any;
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

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string) {
    const result = (await firstValueFrom(
      this.workflowService.DeleteWorkflow({ id }),
    )) as any;
    return { success: result.success || true };
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
    )) as any;
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
    )) as any;
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
    )) as any;
    return { data: result.items, meta: { total: result.total } };
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string) {
    const result = await firstValueFrom(
      this.workflowService.GetInstance({ id }),
    );
    return { data: result };
  }

  @Get('instances/:instanceId/logs')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string) {
    const response = (await firstValueFrom(
      this.workflowService.GetLogs({ instanceId }),
    )) as any;
    return {
      data: response.logs || [],
    };
  }
}
