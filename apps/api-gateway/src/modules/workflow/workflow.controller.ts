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
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

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
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  // --- Process Catalog ---
  @Post('catalog/process-types')
  @RequirePermissions('WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Đăng ký loại quy trình mới' })
  async registerProcessType(@Req() req: any, @Body() body: any) {
    return this.workflowService.registerProcessType(body, this.getGrpcMetadata(req));
  }

  @Get('catalog/process-types')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Danh sách các loại quy trình' })
  async listProcessTypes(@Req() req: any, @Query('activeOnly') activeOnly?: string) {
    return this.workflowService.listProcessTypes(
      activeOnly === 'true',
      this.getGrpcMetadata(req),
    );
  }

  @Get('catalog/process-types/:code')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Chi tiết loại quy trình' })
  async getProcessType(@Req() req: any, @Param('code') code: string) {
    return this.workflowService.getProcessType(code, this.getGrpcMetadata(req));
  }

  // --- Process Bindings ---
  @Post('bindings')
  @RequirePermissions('WORKFLOW:CREATE', 'WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Tạo binding mới' })
  async createProcessBinding(@Body() body: any, @Req() req: any) {
    const payload = {
      ...body,
      createdBy: req.user.id.toString(),
      organizationId:
        req.user.organizationId || req.user.orgId || req.user.unitId,
    };
    delete payload.actorId;
    return this.workflowService.createProcessBinding(
      payload,
      this.getGrpcMetadata(req),
    );
  }

  @Get('bindings')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Danh sách bindings' })
  async listProcessBindings(
    @Query()
    query: PaginationQueryDto & { processTypeCode?: string; status?: string },
    @Req() req: any,
  ) {
    return this.workflowService.listProcessBindings(
      {
        ...query,
        organizationId:
          req.user.organizationId || req.user.orgId || req.user.unitId,
      },
      this.getGrpcMetadata(req),
    );
  }

  @Get('bindings/:id')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Chi tiết binding' })
  async getProcessBinding(@Param('id') id: string, @Req() req: any) {
    const organizationId =
      req.user.organizationId || req.user.orgId || req.user.unitId;
    return this.workflowService.getProcessBinding(
      id,
      organizationId,
      this.getGrpcMetadata(req),
    );
  }

  @Post('bindings/:id/deactivate')
  @RequirePermissions('WORKFLOW:UPDATE', 'WORKFLOW:APPROVE')
  @ApiOperation({ summary: 'Vô hiệu hóa binding' })
  async deactivateProcessBinding(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.workflowService.deactivateProcessBinding(
      id,
      req.user.id.toString(),
      body.reason,
      req.user.organizationId || req.user.orgId || req.user.unitId,
      this.getGrpcMetadata(req),
    );
  }

  @Post('instances/start-by-type')
  @RequirePermissions('WORKFLOW:CREATE', 'WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Kích hoạt quy trình theo ProcessType' })
  async startByProcessType(
    @Body() body: StartByProcessTypeDto,
    @Req() req: any,
  ) {
    const payload = {
      ...body,
      actorId: req.user.id.toString(),
    };
    return this.workflowService.startByProcessType(
      payload,
      this.getGrpcMetadata(req),
    );
  }

  @Post('instances/:instanceId/action')
  @RequirePermissions('WORKFLOW:UPDATE', 'WORKFLOW:APPROVE')
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
    return this.workflowService.submitAction(payload, this.getGrpcMetadata(req));
  }

  // --- Backward Compatible (Legacy APIs) ---
  @Get('services')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({
    summary: 'Lấy danh sách các microservice khả dụng cho workflow',
  })
  async getMicroservices(@Req() req: any) {
    return this.workflowService.getMicroservices(this.getGrpcMetadata(req));
  }

  @Get('triggers')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Lấy danh sách các trigger khả dụng' })
  async getTriggers(@Req() req: any) {
    return this.workflowService.getTriggers(this.getGrpcMetadata(req));
  }

  @Get('modules')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Danh sách module nghiệp vụ đang active' })
  async getModules(@Req() req: any) {
    return this.workflowService.getModules(this.getGrpcMetadata(req));
  }

  @Get('org-roles')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Danh sách chức danh/vị trí' })
  async getOrgRoles(@Req() req: any) {
    return this.workflowService.getOrgRoles(this.getGrpcMetadata(req));
  }

  @Post()
  @RequirePermissions('WORKFLOW:CREATE')
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: CreateWorkflowDto, @Req() req: any) {
    return this.workflowService.create(body, req.user, this.getGrpcMetadata(req));
  }

  @Put(':id')
  @RequirePermissions('WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Cập nhật định nghĩa quy trình' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateWorkflowDto,
    @Req() req: any,
  ) {
    return this.workflowService.update(
      id,
      body,
      req.user,
      this.getGrpcMetadata(req),
    );
  }

  @Get()
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Danh sách quy trình' })
  async list(
    @Query() query: PaginationQueryDto & { search?: string },
    @Req() req: any,
  ) {
    return this.workflowService.list(query, req.user, this.getGrpcMetadata(req));
  }

  @Post('instances/:instanceId/resume/:nodeId')
  @RequirePermissions('WORKFLOW:UPDATE', 'WORKFLOW:APPROVE')
  @ApiOperation({ summary: 'Xử lý bước chờ (User Task) trong quy trình' })
  async resume(
    @Param('instanceId') instanceId: string,
    @Param('nodeId') nodeId: string,
    @Body() body: ResumeWorkflowDto,
    @Req() req: any,
  ) {
    return this.workflowService.resume(
      instanceId,
      nodeId,
      body,
      req.user,
      this.getGrpcMetadata(req),
    );
  }

  @Get('instances')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Danh sách workflow instances' })
  async listInstances(
    @Query()
    query: PaginationQueryDto & {
      workflowId?: string;
      status?: string;
      search?: string;
    },
    @Req() req?: any,
  ) {
    const orgId =
      req?.user?.organizationId || req?.user?.orgId || req?.user?.unitId;
    return this.workflowService.listInstances(
      query,
      orgId,
      req?.user ? this.getGrpcMetadata(req) : undefined,
    );
  }

  @Get('instances/:id')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Trạng thái hiện tại của workflow instance' })
  async getInstance(@Param('id') id: string, @Req() req?: any) {
    const orgId =
      req?.user?.organizationId || req?.user?.orgId || req?.user?.unitId;
    return this.workflowService.getInstance(
      id,
      orgId,
      req?.user ? this.getGrpcMetadata(req) : undefined,
    );
  }

  @Get('instances/:instanceId/logs')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Lịch sử thực thi của workflow instance' })
  async getLogs(@Param('instanceId') instanceId: string, @Req() req?: any) {
    const orgId =
      req?.user?.organizationId || req?.user?.orgId || req?.user?.unitId;
    return this.workflowService.getLogs(
      instanceId,
      orgId,
      req?.user ? this.getGrpcMetadata(req) : undefined,
    );
  }

  @Get(':id')
  @RequirePermissions('WORKFLOW:VIEW')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.findOne(id, req.user, this.getGrpcMetadata(req));
  }

  @Delete(':id')
  @RequirePermissions('WORKFLOW:DELETE', 'WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Xóa quy trình' })
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.delete(id, req.user, this.getGrpcMetadata(req));
  }

  @Post(':id/publish')
  @RequirePermissions('WORKFLOW:UPDATE', 'WORKFLOW:APPROVE')
  @ApiOperation({ summary: 'Publish quy trình' })
  async publish(@Param('id') id: string, @Req() req: any) {
    return this.workflowService.publish(id, req.user, this.getGrpcMetadata(req));
  }

  @Post(':id/apply-module')
  @RequirePermissions('WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Gán quy trình vào một nghiệp vụ và publish' })
  async applyModule(@Param('id') id: string, @Body() body: ApplyModuleDto, @Req() req: any) {
    return this.workflowService.applyModule(
      id,
      body.moduleCode,
      this.getGrpcMetadata(req),
    );
  }

  @Post(':id/start')
  @RequirePermissions('WORKFLOW:CREATE', 'WORKFLOW:UPDATE')
  @ApiOperation({ summary: 'Kích hoạt chạy một quy trình' })
  async start(
    @Param('id') id: string,
    @Body() body: StartWorkflowDto,
    @Req() req: any,
  ) {
    return this.workflowService.start(
      id,
      body,
      req.user,
      this.getGrpcMetadata(req),
    );
  }
}
