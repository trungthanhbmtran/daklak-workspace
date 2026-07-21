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
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { OrganizationsService } from './organizations.service';

@ApiTags('Đơn vị tổ chức')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo đơn vị tổ chức' })
  @ApiResponse({ status: 201, description: 'Đơn vị vừa tạo (camelCase)' })
  async create(@Body() body: any) {
    return this.orgService.create(body);
  }

  @Get('unit-types')
  @ApiOperation({ summary: 'Lấy danh sách loại đơn vị (UBND, Sở, Phòng...)' })
  @ApiResponse({ status: 200, description: 'Danh sách loại đơn vị' })
  async getUnitTypes() {
    return this.orgService.getUnitTypes();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Cây tổ chức toàn bộ' })
  @ApiResponse({
    status: 200,
    description: 'Cây đơn vị (root nodes có children)',
  })
  async getFullTree(@Req() request: any, @Query('q') q?: string) {
    return this.orgService.getFullTree(request?.user, q);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách phẳng đơn vị tổ chức (theo phân quyền)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách phẳng đơn vị tổ chức' })
  async getOrganizations(@Req() request: any, @Query('q') q?: string) {
    return this.orgService.getOrganizations(request?.user, q);
  }

  @Get('job-titles')
  @ApiOperation({
    summary:
      'Danh sách chức danh (theo đơn vị: chỉ chức danh áp dụng cho loại đơn vị đó)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách chức danh (camelCase)' })
  async getJobTitles(@Query('unitId') unitId?: string) {
    return this.orgService.getJobTitles(unitId);
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
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.orgService.updateJobTitle(id, body);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một đơn vị' })
  @ApiResponse({ status: 200, description: 'Đơn vị (camelCase)' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn vị tổ chức' })
  @ApiResponse({ status: 200, description: 'Đơn vị đã cập nhật (camelCase)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.orgService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn vị (chỉ khi không có đơn vị con)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.delete(id);
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
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { domainIds?: number[] },
  ) {
    return this.orgService.updateScope(id, body);
  }

  @Get(':id/subtree')
  @ApiOperation({ summary: 'Cây con của một đơn vị' })
  @ApiResponse({ status: 200, description: 'Cây con từ đơn vị id' })
  async getSubTree(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getSubTree(id);
  }

  @Post('staffing')
  @ApiOperation({
    summary: 'Thiết lập định biên (số lượng chức danh cho đơn vị)',
  })
  @ApiResponse({ status: 200, description: 'Định biên đã lưu (camelCase)' })
  async setStaffing(@Body() body: any) {
    return this.orgService.setStaffing(body);
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
  async getStaffingReport(@Param('id', ParseIntPipe) id: number) {
    return this.orgService.getStaffingReport(id);
  }

  @Post('staffing-slots')
  @ApiOperation({
    summary:
      'Phân công từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực riêng cho slot',
  })
  @ApiResponse({ status: 200, description: 'Slot đã lưu (camelCase)' })
  async setStaffingSlot(@Body() body: any) {
    return this.orgService.setStaffingSlot(body);
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
    return this.orgService.getPublicOrgUnits();
  }
}
