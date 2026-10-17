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
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { getInternalGrpcMetadata } from '../../core/utils/internal-metadata.util';
import { OrganizationsService } from './organizations.service';

@ApiTags('Đơn vị tổ chức')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationsController {
  constructor(
    private readonly orgService: OrganizationsService,
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

  @Post()
  @ApiOperation({ summary: 'Tạo đơn vị tổ chức' })
  @ApiResponse({ status: 201, description: 'Đơn vị vừa tạo (camelCase)' })
  async create(@Req() req: any, @Body() body: any) {
    return this.orgService.create(body, this.getGrpcMetadata(req));
  }

  @Get('unit-types')
  @ApiOperation({ summary: 'Lấy danh sách loại đơn vị (UBND, Sở, Phòng...)' })
  @ApiResponse({ status: 200, description: 'Danh sách loại đơn vị' })
  async getUnitTypes(@Req() req: any) {
    return this.orgService.getUnitTypes(this.getGrpcMetadata(req));
  }

  @Get('tree')
  @ApiOperation({ summary: 'Cây tổ chức toàn bộ' })
  @ApiResponse({
    status: 200,
    description: 'Cây đơn vị (root nodes có children)',
  })
  async getFullTree(@Req() request: any, @Query('q') q?: string) {
    return this.orgService.getFullTree(
      request?.user,
      q,
      this.getGrpcMetadata(request),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách phẳng đơn vị tổ chức (theo phân quyền)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách phẳng đơn vị tổ chức' })
  async getOrganizations(@Req() request: any, @Query('q') q?: string) {
    return this.orgService.getOrganizations(
      request?.user,
      q,
      this.getGrpcMetadata(request),
    );
  }

  @Get('job-titles')
  @ApiOperation({
    summary:
      'Danh sách chức danh (theo đơn vị: chỉ chức danh áp dụng cho loại đơn vị đó)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách chức danh (camelCase)' })
  async getJobTitles(@Req() req: any, @Query('unitId') unitId?: string) {
    return this.orgService.getJobTitles(unitId, this.getGrpcMetadata(req));
  }

  @Get('unit-types/:id/job-templates')
  @ApiOperation({
    summary: 'Lấy danh sách ID chức danh đã được map với Loại đơn vị',
  })
  async getUnitTypeJobTemplates(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orgService.getUnitTypeJobTemplates(
      id,
      this.getGrpcMetadata(req),
    );
  }

  @Put('unit-types/:id/job-templates')
  @ApiOperation({
    summary: 'Cập nhật danh sách chức danh được phép cho Loại đơn vị',
  })
  async updateUnitTypeJobTemplates(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { jobTitleIds: number[] },
  ) {
    return this.orgService.updateUnitTypeJobTemplates(
      id,
      body.jobTitleIds,
      this.getGrpcMetadata(req),
    );
  }

  @Put('job-titles/:id')
  @ApiOperation({
    summary: 'Cập nhật chức danh (lĩnh vực phụ trách)',
  })
  @ApiResponse({
    status: 200,
    description: 'Chức danh đã cập nhật (camelCase)',
  })
  async updateJobTitle(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.orgService.updateJobTitle(id, body, this.getGrpcMetadata(req));
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Chi tiết một đơn vị theo mã' })
  @ApiResponse({ status: 200, description: 'Đơn vị (camelCase)' })
  async getOneByCode(@Req() req: any, @Param('code') code: string) {
    return this.orgService.getOneByCode(code, this.getGrpcMetadata(req));
  }

  @Get('detail/:identifier')
  @ApiOperation({ summary: 'Lấy chi tiết đơn vị theo mã hoặc id' })
  @ApiResponse({ status: 200, description: 'Đơn vị (camelCase)' })
  async getDetail(@Req() req: any, @Param('identifier') identifier: string) {
    return this.orgService.getDetail(identifier, this.getGrpcMetadata(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một đơn vị' })
  @ApiResponse({ status: 200, description: 'Đơn vị (camelCase)' })
  async getOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orgService.getOne(id, this.getGrpcMetadata(req));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn vị tổ chức' })
  @ApiResponse({ status: 200, description: 'Đơn vị đã cập nhật (camelCase)' })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.orgService.update(id, body, this.getGrpcMetadata(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn vị (chỉ khi không có đơn vị con)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async delete(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orgService.delete(id, this.getGrpcMetadata(req));
  }

  @Get(':id/scope')
  @ApiOperation({ summary: 'Lấy phạm vi phụ trách của đơn vị' })
  @ApiResponse({
    status: 200,
    description: 'Phạm vi phụ trách (domainIds, scope)',
  })
  async getUnitScope(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orgService.getUnitScope(id, this.getGrpcMetadata(req));
  }

  @Put(':id/scope')
  @ApiOperation({
    summary: 'Cập nhật phạm vi phụ trách của đơn vị (lĩnh vực + địa bàn)',
    description:
      'Endpoint chuyên biệt, chỉ cập nhật domainIds và geographicAreaIds. Không ảnh hưởng đến tên, mã, phân loại.',
  })
  @ApiResponse({
    status: 200,
    description: 'Đơn vị đã cập nhật phạm vi (camelCase)',
  })
  async updateScope(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { domainIds?: number[] },
  ) {
    return this.orgService.updateScope(id, body, this.getGrpcMetadata(req));
  }

  @Get(':id/subtree')
  @ApiOperation({ summary: 'Cây con của một đơn vị' })
  @ApiResponse({ status: 200, description: 'Cây con từ đơn vị id' })
  async getSubTree(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.orgService.getSubTree(id, this.getGrpcMetadata(req));
  }

  @Post('staffing')
  @ApiOperation({
    summary: 'Thiết lập định biên (số lượng chức danh cho đơn vị)',
  })
  @ApiResponse({ status: 200, description: 'Định biên đã lưu (camelCase)' })
  async setStaffing(@Req() req: any, @Body() body: any) {
    return this.orgService.setStaffing(body, this.getGrpcMetadata(req));
  }

  @Get(':id/staffing-report')
  @ApiOperation({
    summary:
      'Báo cáo định biên của đơn vị (thừa/thiếu nhân sự, kèm phân công từng vị trí)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách chức danh và số lượng, mỗi item có slots (camelCase)',
  })
  async getStaffingReport(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.orgService.getStaffingReport(id, this.getGrpcMetadata(req));
  }

  @Post('staffing-slots')
  @ApiOperation({
    summary:
      'Phân công từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực riêng cho slot',
  })
  @ApiResponse({ status: 200, description: 'Slot đã lưu (camelCase)' })
  async setStaffingSlot(@Req() req: any, @Body() body: any) {
    return this.orgService.setStaffingSlot(body, this.getGrpcMetadata(req));
  }
}

@ApiTags('Đơn vị tổ chức công khai')
@Controller('public/org-units')
export class PublicOrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách phẳng tất cả đơn vị tổ chức công khai',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phẳng tất cả đơn vị tổ chức',
  })
  async getPublicOrgUnits() {
    return this.orgService.getPublicOrgUnits(getInternalGrpcMetadata());
  }
}
