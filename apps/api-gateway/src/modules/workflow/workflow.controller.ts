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

  @Post()
  @ApiOperation({ summary: 'Tạo quy trình mới/phiên bản mới' })
  async create(@Body() body: any) {
    const payload = {
      name: body.name,
      description: body.description,
      code: body.trigger || body.code,
      definition: body.definition || {},
    };
    const result = (await firstValueFrom(
          this.workflowService.CreateWorkflow(payload),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;

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
      definition: body.definition || {},
    };

    const result = (await firstValueFrom(
          this.workflowService.UpdateWorkflow(payload),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;

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

    return {
      data: result.items || [],
      meta: { total: result.total || 0 },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết quy trình' })
  async findOne(@Param('id') id: string) {
    const result = (await firstValueFrom(
          this.workflowService.FindOneWorkflow({ id }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    
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
    return { data: result };
  }

  @Post(':id/apply-module')
  @ApiOperation({ summary: 'Gán quy trình vào một nghiệp vụ và publish' })
  async applyModule(@Param('id') id: string, @Body() body: { moduleCode: string }) {
    const result = (await firstValueFrom(
          this.workflowService.ApplyModule({ id, moduleCode: body.moduleCode }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
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

  // --- API Integrations ---

  @Get('integrations')
  @ApiOperation({ summary: 'Lấy danh sách các kết nối API' })
  async listIntegrations() {
    const result = (await firstValueFrom(
      this.workflowService.FindAllIntegrations({})
    ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    
    // Convert to REST response format { success: true, data: [...] }
    return { success: true, data: result?.items || [] };
  }

  @Post('integrations')
  @ApiOperation({ summary: 'Tạo cấu hình kết nối API' })
  async createIntegration(@Body() body: any) {
    const result = (await firstValueFrom(
      this.workflowService.CreateIntegration(body)
    ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    
    return { success: !!result, data: result, message: 'Created successfully' };
  }

  @Get('integrations/:id')
  @ApiOperation({ summary: 'Lấy cấu hình kết nối API theo ID' })
  async getIntegration(@Param('id') id: string) {
    const result = (await firstValueFrom(
      this.workflowService.FindOneIntegration({ id })
    ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    
    return { success: !!result, data: result };
  }

  @Put('integrations/:id')
  @ApiOperation({ summary: 'Cập nhật cấu hình kết nối API' })
  async updateIntegration(@Param('id') id: string, @Body() body: any) {
    const result = (await firstValueFrom(
      this.workflowService.UpdateIntegration({ ...body, id })
    ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    
    return { success: !!result, data: result, message: 'Updated successfully' };
  }

  @Delete('integrations/:id')
  @ApiOperation({ summary: 'Xóa kết nối API' })
  async deleteIntegration(@Param('id') id: string) {
    const result = (await firstValueFrom(
      this.workflowService.DeleteIntegration({ id })
    ).catch(e => { console.error('RPC Call Failed', e.message); return null; })) as any;
    
    return { success: result?.success || true, message: 'Deleted successfully' };
  }
}
