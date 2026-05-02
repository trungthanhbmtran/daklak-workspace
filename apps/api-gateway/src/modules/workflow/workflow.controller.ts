import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Workflow')
@Controller('admin/workflow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class WorkflowController implements OnModuleInit {
  private workflowService: any;
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly catClient: any,
  ) { }

  onModuleInit() {
    this.workflowService = this.client.getService(MICROSERVICES.WORKFLOW.SERVICE);
    this.categoryService = this.catClient.getService(MICROSERVICES.SYS_CATEGORY.SERVICE);
  }
 
  @Get('services')
  @ApiOperation({ summary: 'Lấy danh sách các microservice khả dụng cho workflow' })
  async getMicroservices() {
    const result = await firstValueFrom(this.categoryService.GetByGroup({ group: 'MICROSERVICE' })) as any;
    return { data: result.data || [] };
  }
 
  @Get('triggers')
  @ApiOperation({ summary: 'Lấy danh sách các trigger khả dụng' })
  async getTriggers() {
    const result = await firstValueFrom(this.categoryService.GetByGroup({ group: 'WORKFLOW_TRIGGER' })) as any;
    return { data: result.data || [] };
  }

  // --- Workflow Definitions ---

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: any) {
    const result = await firstValueFrom(this.workflowService.CreateWorkflow(body)) as any;
    return { data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(@Param('id') id: string, @Body() body: any) {
    const result = await firstValueFrom(this.workflowService.UpdateWorkflow({ ...body, id })) as any;
    return { data: result };
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách quy trình' })
  async list(@Query() query: any) {
    const skip = parseInt(query.skip) || 0;
    const take = parseInt(query.take) || 20;
    const result = await firstValueFrom(this.workflowService.ListWorkflows({ skip, take })) as any;
    return {
      data: result.items || [],
      meta: { total: result.total || 0 }
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string) {
    const result = await firstValueFrom(this.workflowService.FindOneWorkflow({ id })) as any;
    return { data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string) {
    const result = await firstValueFrom(this.workflowService.DeleteWorkflow({ id })) as any;
    return { success: result.success || true };
  }

  // --- Execution Engine ---

  @Post(':id/start')
  @ApiOperation({ summary: 'Kích hoạt chạy một quy trình' })
  async start(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const initiatorId = req.user?.id?.toString() || 'system';
    const result = await firstValueFrom(this.workflowService.StartWorkflow({
      workflowId: id,
      initialContext: body.initialContext || body,
      initiatorId,
    })) as any;
    return { data: result };
  }

  @Post('instances/:instanceId/resume/:nodeId')
  @ApiOperation({ summary: 'Xử lý bước chờ (User Task) trong quy trình' })
  async resume(
    @Param('instanceId') instanceId: string,
    @Param('nodeId') nodeId: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const userRoles = req.user?.roles || [];
    const result = await firstValueFrom(this.workflowService.ResumeWorkflow({
      instanceId,
      nodeId,
      actionData: body.actionData || body,
      userRoles,
    })) as any;
    return { data: result };
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string) {
    const result = await firstValueFrom(this.workflowService.GetInstance({ id }));
    return { data: result };
  }

  @Get('instances/:instanceId/logs')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string) {
    const response = await firstValueFrom(this.workflowService.GetLogs({ instanceId })) as any;
    return {
      data: response.logs || []
    };
  }
}
