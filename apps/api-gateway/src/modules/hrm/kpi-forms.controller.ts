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

  constructor(
    @Inject(MICROSERVICES.KPI.SYMBOL) private readonly client: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.kpiService = this.client.getService(MICROSERVICES.KPI.SERVICE);
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
      this.kpiService.FindFormTemplates({}, this.getGrpcMetadata(req)),
    ).catch((e) => this.handleRpcError(e));
  }

  @Get(':formCode')
  @ApiOperation({ summary: 'Lấy chi tiết biểu mẫu và nội dung XML' })
  async findOne(@Req() req: any, @Param('formCode') formCode: string) {
    return firstValueFrom(
      this.kpiService.GetFormTemplateDetail(
        { formCode },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
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
        { formCode, ...body },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => this.handleRpcError(e));
  }

  @Get(':formCode/xml')
  @ApiOperation({ summary: 'Lấy nội dung file XML của biểu mẫu' })
  async getXml(@Req() req: any, @Param('formCode') formCode: string) {
    return firstValueFrom(
      this.kpiService.GetFormTemplateXml(
        { formCode },
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
        { formCode, xmlContent: body.xmlContent },
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
          { formCode },
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
}
