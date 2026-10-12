import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Inject,
  OnModuleInit,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';
import { Metadata } from '@grpc/grpc-js';

@ApiTags('HRM - KPI Form Templates')
@Controller('admin/hrm/kpi-forms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class KpiFormsController implements OnModuleInit {
  private kpiService: any;
  private workflowService: any;

  constructor(
    @Inject(MICROSERVICES.KPI.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.WORKFLOW.SYMBOL) private readonly workflowClient: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.kpiService = this.client.getService(MICROSERVICES.KPI.SERVICE);
    this.workflowService = this.workflowClient.getService(MICROSERVICES.WORKFLOW.SERVICE);
  }

  private getOrganizationId(req: any): string {
    return String(req?.user?.organizationId || req?.user?.orgId || req?.user?.organizationCode || req?.user?.unitCode || 'DEFAULT');
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

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các biểu mẫu đánh giá và file XML mẫu' })
  async findAll(@Req() req: any) {
    return firstValueFrom(
      this.kpiService.FindFormTemplates({ organizationId: this.getOrganizationId(req) }, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }

  @Get(':formCode')
  @ApiOperation({ summary: 'Lấy chi tiết biểu mẫu và nội dung XML' })
  async findOne(@Req() req: any, @Param('formCode') formCode: string) {
    const res: any = await firstValueFrom(
      this.kpiService.GetFormTemplateDetail(
        { formCode, organizationId: this.getOrganizationId(req) },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));

    const item = res?.data || {};
    const xmlContent = res?.xmlContent || item.xmlContent || '';
    const placeholders = res?.placeholders || item.placeholders || [];

    return {
      success: res?.success ?? true,
      message: res?.message || 'Lấy chi tiết biểu mẫu thành công',
      data: {
        ...item,
        xmlContent,
        placeholders,
      },
      xmlContent,
      placeholders,
    };
  }

  @Put(':formCode')
  @ApiOperation({ summary: 'Cập nhật thông tin biểu mẫu' })
  async update(
    @Req() req: any,
    @Param('formCode') formCode: string,
    @Body() body: any,
  ) {
    return firstValueFrom(
      this.kpiService.UpdateFormTemplate(
        { formCode, ...body, organizationId: this.getOrganizationId(req) },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  @Get(':formCode/xml')
  @ApiOperation({ summary: 'Lấy nội dung file XML của biểu mẫu' })
  async getXml(@Req() req: any, @Param('formCode') formCode: string) {
    return firstValueFrom(
      this.kpiService.GetFormTemplateXml(
        { formCode, organizationId: this.getOrganizationId(req) },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  @Put(':formCode/xml')
  @ApiOperation({ summary: 'Cập nhật nội dung file XML của biểu mẫu' })
  async saveXml(
    @Req() req: any,
    @Param('formCode') formCode: string,
    @Body() body: { xmlContent: string },
  ) {
    if (!body?.xmlContent) {
      throw new BadRequestException('Nội dung XML không được để trống');
    }
    return firstValueFrom(
      this.kpiService.SaveFormTemplateXml(
        { formCode, xmlContent: body.xmlContent, organizationId: this.getOrganizationId(req) },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  @Post('validate-xml')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của đoạn mã XML' })
  async validateXml(@Req() req: any, @Body() body: { xmlContent: string }) {
    return firstValueFrom(
      this.kpiService.ValidateFormTemplateXml(
        { xmlContent: body.xmlContent },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  @Get(':formCode/download')
  @ApiOperation({ summary: 'Tải file XML (.xml) của biểu mẫu về máy tính' })
  async downloadXml(
    @Req() req: any,
    @Param('formCode') formCode: string,
    @Res() res: Response,
  ) {
    try {
      const response = await firstValueFrom(
        this.kpiService.GetFormTemplateXml(
          { formCode, organizationId: this.getOrganizationId(req) },
          this.getGrpcMetadata(req),
        ),
      );

      const xmlContent = (response as any)?.xmlContent || '';
      const filename = `${formCode.toLowerCase()}-template.xml`;

      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.send(xmlContent);
    } catch (e) {
      this.handleRpcError(e);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo biểu mẫu XML mới trong phạm vi tổ chức' })
  async create(@Req() req: any, @Body() body: { name: string; description?: string; category?: string; targetRole?: string; xmlContent: string }) {
    if (!body?.name?.trim() || !body?.xmlContent?.trim()) {
      throw new BadRequestException('Tên mẫu và nội dung XML là bắt buộc');
    }
    return firstValueFrom(this.kpiService.CreateFormTemplate({
      ...body,
      organizationId: this.getOrganizationId(req),
      createdBy: String(req?.user?.id || ''),
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e));
  }

  @Post(':formCode/publish')
  @ApiOperation({ summary: 'Phát hành mẫu XML đã kiểm tra' })
  async publish(@Req() req: any, @Param('formCode') formCode: string) {
    return firstValueFrom(this.kpiService.PublishFormTemplate({
      formCode,
      organizationId: this.getOrganizationId(req),
      publishedBy: String(req?.user?.id || ''),
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e));
  }

  @Get(':formCode/bindings')
  @ApiOperation({ summary: 'Danh sách đơn vị và quy trình đang được gán mẫu' })
  async listBindings(@Req() req: any, @Param('formCode') formCode: string) {
    return firstValueFrom(this.kpiService.ListFormTemplateBindings({
      formCode,
      organizationId: this.getOrganizationId(req),
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e));
  }

  @Post(':formCode/bindings')
  @ApiOperation({ summary: 'Gán mẫu cho đơn vị và bước trong quy trình' })
  async createBinding(@Req() req: any, @Param('formCode') formCode: string, @Body() body: { unitCode: string; processDefinitionId: string; processCode: string; nodeCode?: string; phase?: string; effectiveFrom?: string; effectiveTo?: string }) {
    const organizationId = this.getOrganizationId(req);
    const workflow = await firstValueFrom(this.workflowService.FindOneWorkflow({
      id: body.processDefinitionId,
      organizationId,
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e)) as any;
    if (workflow?.organizationId && workflow.organizationId !== organizationId) {
      throw new ForbiddenException('Quy trình không thuộc tổ chức hiện tại');
    }
    if (!workflow?.ownerUnitCode || workflow.ownerUnitCode !== body.unitCode) {
      throw new BadRequestException('Đơn vị gán mẫu phải trùng với đơn vị sở hữu quy trình');
    }
    if (workflow.code !== body.processCode) {
      throw new BadRequestException('Mã quy trình không khớp với quy trình đã chọn');
    }
    if (body.nodeCode) {
      let graph: any = {};
      try { graph = JSON.parse(workflow.definitionJson || '{}'); }
      catch { throw new BadRequestException('Không đọc được cấu trúc các bước trong quy trình'); }
      const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
      if (!nodes.some((node: any) => node?.id === body.nodeCode || node?.nodeKey === body.nodeCode)) {
        throw new BadRequestException('Mã bước không tồn tại trong quy trình đã chọn');
      }
    }
    return firstValueFrom(this.kpiService.CreateFormTemplateBinding({
      formCode,
      ...body,
      organizationId,
      createdBy: String(req?.user?.id || ''),
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e));
  }

  @Get('resolve/binding')
  @ApiOperation({ summary: 'Tra cứu mẫu đã phát hành cho đơn vị và bước quy trình' })
  async resolveBinding(@Req() req: any, @Query() query: { unitCode: string; processDefinitionId: string; nodeCode?: string; phase?: string }) {
    if (!query.unitCode || !query.processDefinitionId) throw new BadRequestException('Cần truyền đơn vị và quy trình');
    const organizationId = this.getOrganizationId(req);
    const workflow = await firstValueFrom(this.workflowService.FindOneWorkflow({
      id: query.processDefinitionId,
      organizationId,
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e)) as any;
    if (workflow?.ownerUnitCode !== query.unitCode) throw new ForbiddenException('Đơn vị không sở hữu quy trình này');
    return firstValueFrom(this.kpiService.ResolveFormTemplateBinding({
      organizationId,
      unitCode: query.unitCode,
      processDefinitionId: query.processDefinitionId,
      nodeCode: query.nodeCode || '',
      phase: query.phase || '',
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e));
  }

  @Put('bindings/:id/deactivate')
  @ApiOperation({ summary: 'Gỡ gán mẫu khỏi quy trình' })
  async deactivateBinding(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(this.kpiService.DeleteFormTemplateBinding({
      id: Number(id),
      organizationId: this.getOrganizationId(req),
    }, this.getGrpcMetadata(req))).catch((e) => this.handleRpcError(e));
  }
}
