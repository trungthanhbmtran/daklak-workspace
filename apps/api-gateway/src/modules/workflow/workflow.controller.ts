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
  ApplyModuleDto,
  SubmitActionDto,
  StartByProcessTypeDto,
  PaginationQueryDto,
} from './dto/workflow.dto';
import { WorkflowService } from './workflow.service';

@ApiTags('Workflow')
@Controller('admin/workflow')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // --- Process Catalog ---
  @Post('catalog/process-types')
  @ApiOperation({ summary: 'Đăng ký loại quy trình mới' })
  async registerProcessType(@Body() body: any) {
    return this.workflowService.registerProcessType(body);
  }

  @Get('catalog/process-types')
  @ApiOperation({ summary: 'Danh sách các loại quy trình' })
  async listProcessTypes(@Query('activeOnly') activeOnly?: string) {
    return this.workflowService.listProcessTypes(activeOnly === 'true');
  }

  @Get('catalog/process-types/:code')
  @ApiOperation({ summary: 'Chi tiết loại quy trình' })
  async getProcessType(@Param('code') code: string) {
    return this.workflowService.getProcessType(code);
  }

  // --- Process Bindings ---
  @Post('bindings')
  @ApiOperation({ summary: 'Tạo binding mới' })
  async createProcessBinding(@Body() body: any, @Req() req: any) {
    body.actorId = req.user.id.toString();
    return this.workflowService.createProcessBinding(body);
  }

  @Get('bindings')
  @ApiOperation({ summary: 'Danh sách bindings' })
  async listProcessBindings(@Query() query: PaginationQueryDto) {
    return this.workflowService.listProcessBindings(query);
  }

  @Get('bindings/:id')
  @ApiOperation({ summary: 'Chi tiết binding' })
  async getProcessBinding(@Param('id') id: string) {
    return this.workflowService.getProcessBinding(id);
  }

  @Post('bindings/:id/deactivate')
  @ApiOperation({ summary: 'Vô hiệu hóa binding' })
  async deactivateProcessBinding(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.workflowService.deactivateProcessBinding(id, req.user.id.toString(), body.reason);
  }



  @Post('instances/start-by-type')
  @ApiOperation({ summary: 'Kích hoạt quy trình theo ProcessType' })
  async startByProcessType(@Body() body: StartByProcessTypeDto, @Req() req: any) {
    const payload = {
      ...body,
      actorId: req.user.id.toString(),
    };
    return this.workflowService.startByProcessType(payload);
  }

  @Post('instances/:instanceId/action')
  @ApiOperation({ summary: 'Xử lý bước chờ (OCC) - Gửi Action tới Outbox' })
  async submitAction(
    @Param('instanceId') instanceId: string,
    @Body() body: SubmitActionDto,
    @Req() req: any,
  ) {
    const payload = {
      ...body,
      instanceId,
      actorId: req.user.id.toString(),
    };
    return this.workflowService.submitAction(payload);
  }

  // --- Backward Compatible (Legacy APIs) ---
  @Get('services')
  @ApiOperation({ summary: 'Lấy danh sách các microservice khả dụng cho workflow' })
  async getMicroservices() { return this.workflowService.getMicroservices(); }



  @Get('triggers')
  @ApiOperation({ summary: 'Lấy danh sách các trigger khả dụng' })
  async getTriggers() { return this.workflowService.getTriggers(); }

  @Get('modules')
  @ApiOperation({ summary: 'Danh sách module nghiệp vụ đang active' })
  async getModules() { return this.workflowService.getModules(); }

  @Get('org-roles')
  @ApiOperation({ summary: 'Danh sách chức danh/vị trí' })
  async getOrgRoles() { return this.workflowService.getOrgRoles(); }

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: CreateWorkflowDto, @Req() req: any) { return this.workflowService.create(body, req.user); }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(@Param('id') id: string, @Body() body: UpdateWorkflowDto, @Req() req: any) { return this.workflowService.update(id, body, req.user); }

  @Get()
  @ApiOperation({ summary: 'Danh sách quy trình' })
  async list(@Query() query: PaginationQueryDto & { search?: string }, @Req() req: any) { return this.workflowService.list(query, req.user); }

  @Post('instances/:instanceId/resume/:nodeId')
  @ApiOperation({ summary: 'Xử lý bước chờ (User Task) trong quy trình' })
  async resume(@Param('instanceId') instanceId: string, @Param('nodeId') nodeId: string, @Body() body: ResumeWorkflowDto, @Req() req: any) {
    return this.workflowService.resume(instanceId, nodeId, body, req.user);
  }

  @Get('instances')
  @ApiOperation({ summary: 'Danh sách workflow instances' })
  async listInstances(
    @Query() query: PaginationQueryDto & { workflowId?: string, status?: string, search?: string },
    @Req() req?: any
  ) {
    const orgId = req?.user?.organizationId || req?.user?.orgId;
    return this.workflowService.listInstances(query, orgId);
  }

  @Get('instances/:id')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string, @Req() req?: any) {
    const orgId = req?.user?.organizationId || req?.user?.orgId;
    return this.workflowService.getInstance(id, orgId);
  }

  @Get('instances/:instanceId/logs')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string, @Req() req?: any) { 
    const orgId = req?.user?.organizationId || req?.user?.orgId;
    return this.workflowService.getLogs(instanceId, orgId); 
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string, @Req() req: any) { return this.workflowService.findOne(id, req.user); }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string, @Req() req: any) { return this.workflowService.delete(id, req.user); }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish quy trình' })
  async publish(@Param('id') id: string, @Req() req: any) { return this.workflowService.publish(id, req.user); }

  @Post(':id/apply-module')
  @ApiOperation({ summary: 'Gán quy trình vào một nghiệp vụ và publish' })
  async applyModule(@Param('id') id: string, @Body() body: ApplyModuleDto) { return this.workflowService.applyModule(id, body.moduleCode); }

  @Post(':id/start')
  @ApiOperation({ summary: 'Kích hoạt chạy một quy trình' })
  async start(@Param('id') id: string, @Body() body: StartWorkflowDto, @Req() req: any) { return this.workflowService.start(id, body, req.user); }
}
