import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { 
  CreateWorkflowDto, 
  UpdateWorkflowDto, 
  StartWorkflowDto,
  ResumeWorkflowDto,
  ApplyModuleDto
} from './dto/workflow.dto';
import { WorkflowService } from './workflow.service';

@ApiTags('Workflow')
@Controller('admin/workflow')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('services')
  @ApiOperation({
    summary: 'Lấy danh sách các microservice khả dụng cho workflow',
  })
  async getMicroservices() {
    return this.workflowService.getMicroservices();
  }

  @Get('triggers')
  @ApiOperation({ summary: 'Lấy danh sách các trigger khả dụng' })
  async getTriggers() {
    return this.workflowService.getTriggers();
  }

  @Get('modules')
  @ApiOperation({
    summary: 'Danh sách module nghiệp vụ đang active (workflow Published)',
  })
  async getModules() {
    return this.workflowService.getModules();
  }

  @Get('org-roles')
  @ApiOperation({
    summary:
      'Danh sách chức danh/vị trí trong tổ chức (JobTitle) để thiết kế quyền workflow',
  })
  async getOrgRoles() {
    return this.workflowService.getOrgRoles();
  }

  // --- Workflow Definitions ---

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: CreateWorkflowDto) {
    return this.workflowService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(@Param('id') id: string, @Body() body: UpdateWorkflowDto) {
    return this.workflowService.update(id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách quy trình' })
  async list(@Query() query: any) {
    return this.workflowService.list(query);
  }

  // --- Execution Engine ---

  @Post('instances/:instanceId/resume/:nodeId')
  @ApiOperation({ summary: 'Xử lý bước chờ (User Task) trong quy trình' })
  async resume(
    @Param('instanceId') instanceId: string,
    @Param('nodeId') nodeId: string,
    @Body() body: ResumeWorkflowDto,
    @Req() req: any,
  ) {
    return this.workflowService.resume(instanceId, nodeId, body, req.user);
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
    return this.workflowService.listInstances(skip, take, workflowId, status, search);
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string) {
    return this.workflowService.getInstance(id);
  }

  @Get('instances/:instanceId/logs')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string) {
    return this.workflowService.getLogs(instanceId);
  }

  // --- Routes with :id wildcard LAST (prevents shadowing specific routes above) ---

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string) {
    return this.workflowService.delete(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish quy trình (kích hoạt để sẵn sàng dùng)' })
  async publish(@Param('id') id: string) {
    return this.workflowService.publish(id);
  }

  @Post(':id/apply-module')
  @ApiOperation({ summary: 'Gán quy trình vào một nghiệp vụ và publish' })
  async applyModule(
    @Param('id') id: string,
    @Body() body: ApplyModuleDto,
  ) {
    return this.workflowService.applyModule(id, body.moduleCode);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Kích hoạt chạy một quy trình' })
  async start(@Param('id') id: string, @Body() body: StartWorkflowDto, @Req() req: any) {
    return this.workflowService.start(id, body, req.user);
  }
}
