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

  constructor(
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.workflowService = this.client.getService(MICROSERVICES.WORKFLOW.SERVICE);
  }

  // --- Workflow Definitions ---

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: any) {
    return firstValueFrom(this.workflowService.CreateWorkflow(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.workflowService.UpdateWorkflow({ ...body, id }));
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách quy trình' })
  async list(@Query() query: any) {
    return firstValueFrom(this.workflowService.ListWorkflows({
      skip: parseInt(query.skip) || 0,
      take: parseInt(query.take) || 20,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.workflowService.FindOneWorkflow({ id }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.workflowService.DeleteWorkflow({ id }));
  }

  // --- Execution Engine ---

  @Post(':id/start')
  @ApiOperation({ summary: 'Kích hoạt chạy một quy trình' })
  async start(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const initiatorId = req.user?.id?.toString() || 'system';
    return firstValueFrom(this.workflowService.StartWorkflow({
      workflowId: id,
      initialContext: body.initialContext || body,
      initiatorId,
    }));
  }

  @Post('instances/:instanceId/resume/:nodeId')
  @ApiOperation({ summary: 'Xử lý bước chờ (User Task) trong quy trình' })
  async resume(
    @Param('instanceId') instanceId: string,
    @Param('nodeId') nodeId: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const userRoles = req.user?.roles || []; // Lấy roles từ JWT đã qua xác thực
    return firstValueFrom(this.workflowService.ResumeWorkflow({
      instanceId,
      nodeId,
      actionData: body.actionData || body,
      userRoles,
    }));
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string) {
    return firstValueFrom(this.workflowService.GetInstance({ id }));
  }

  @Get('instances/:instanceId/logs')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string) {
    return firstValueFrom(this.workflowService.GetLogs({ instanceId }));
  }
}
