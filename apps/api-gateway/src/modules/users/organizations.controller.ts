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
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Đơn vị tổ chức')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationsController implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.orgService = this.client.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo đơn vị tổ chức' })
  @ApiResponse({ status: 201, description: 'Đơn vị vừa tạo (camelCase)' })
  async create(
    @Body() body: { code: string; name: string; shortName?: string; typeId: number; parentId?: number | null; parent_id?: number | null; domainIds?: number[]; domain_id?: number; scope?: string },
  ) {
    try {
      const domainIds = body.domainIds ?? (body.domain_id != null ? [body.domain_id] : []);
      const result = await firstValueFrom(
        this.orgService.CreateUnit({
          code: body.code,
          name: body.name,
          shortName: body.shortName,
          typeId: body.typeId,
          parentId: body.parentId ?? body.parent_id,
          domainIds,
          scope: body.scope,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi tạo đơn vị';
      throw new BadRequestException(typeof message === 'string' ? message : message);
    }
  }

  @Get('unit-types')
  @ApiOperation({ summary: 'Lấy danh sách loại đơn vị (UBND, Sở, Phòng...)' })
  @ApiResponse({ status: 200, description: 'Danh sách loại đơn vị' })
  async getUnitTypes() {
    const res = await firstValueFrom(this.orgService.ListUnitTypes({})) as any;
    return { success: true, data: res.items || [] };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Cây tổ chức toàn bộ' })
  @ApiResponse({ status: 200, description: 'Cây đơn vị (root nodes có children)' })
  async getFullTree() {
    const res = await firstValueFrom(this.orgService.GetFullTree({})) as any;
    return { success: true, data: res.nodes || [] };
  }

  @Get('job-titles')
  @ApiOperation({ summary: 'Danh sách chức danh (theo đơn vị: chỉ chức danh áp dụng cho loại đơn vị đó)' })
  @ApiResponse({ status: 200, description: 'Danh sách chức danh (camelCase)' })
  async getJobTitles(@Query('unitId') unitId?: string) {
    const unitIdNum = unitId != null && unitId !== '' ? parseInt(unitId, 10) : undefined;
    const res = await firstValueFrom(this.orgService.ListJobTitles({ unitId: Number.isNaN(unitIdNum) ? undefined : unitIdNum })) as any;
    return { success: true, data: res.items || [] };
  }

  @Put('job-titles/:id')
  @ApiOperation({ summary: 'Cập nhật chức danh (lĩnh vực phụ trách, theo dõi phòng ban, khu vực địa lý)' })
  @ApiResponse({ status: 200, description: 'Chức danh đã cập nhật (camelCase)' })
  async updateJobTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { domainId?: number; geographicAreaId?: number; monitoredUnitIds?: number[] },
  ) {
    const result = await firstValueFrom(
      this.orgService.UpdateJobTitle({
        id,
        domainId: body.domainId,
        geographicAreaId: body.geographicAreaId,
        monitoredUnitIds: body.monitoredUnitIds,
      }),
    );
    return { success: true, data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một đơn vị' })
  @ApiResponse({ status: 200, description: 'Đơn vị (camelCase)' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await firstValueFrom(this.orgService.GetOne({ id }));
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Đơn vị không tồn tại';
      throw new BadRequestException(typeof message === 'string' ? message : message);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật đơn vị tổ chức' })
  @ApiResponse({ status: 200, description: 'Đơn vị đã cập nhật (camelCase)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string; shortName?: string; typeId?: number; parentId?: number | null; parent_id?: number | null; domainIds?: number[]; domain_ids?: number[]; scope?: string },
  ) {
    try {
      const domainIds = body.domainIds ?? body.domain_ids;
      const payload: Record<string, unknown> = {
        id,
        code: body.code,
        name: body.name,
        shortName: body.shortName,
        typeId: body.typeId,
        domainIds,
        scope: body.scope,
      };
      if (body.parentId !== undefined) payload.parentId = body.parentId;
      const result = await firstValueFrom(this.orgService.UpdateUnit(payload as any));
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi cập nhật đơn vị';
      throw new BadRequestException(typeof message === 'string' ? message : message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa đơn vị (chỉ khi không có đơn vị con)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const res = (await firstValueFrom(this.orgService.DeleteUnit({ id }))) as any;
      return { success: res?.success ?? true, message: res?.message ?? 'Đã xóa đơn vị' };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi xóa đơn vị';
      throw new BadRequestException(typeof message === 'string' ? message : message);
    }
  }

  @Get(':id/subtree')
  @ApiOperation({ summary: 'Cây con của một đơn vị' })
  @ApiResponse({ status: 200, description: 'Cây con từ đơn vị id' })
  async getSubTree(@Param('id', ParseIntPipe) id: number) {
    const res = await firstValueFrom(this.orgService.GetSubTree({ id })) as any;
    return { success: true, data: res.nodes || [] };
  }

  @Post('staffing')
  @ApiOperation({ summary: 'Thiết lập định biên (số lượng chức danh cho đơn vị)' })
  @ApiResponse({ status: 200, description: 'Định biên đã lưu (camelCase)' })
  async setStaffing(@Body() body: { unitId: number; jobTitleId: number; quantity: number }) {
    const result = await firstValueFrom(this.orgService.SetStaffing({
      unitId: body.unitId,
      jobTitleId: body.jobTitleId,
      quantity: body.quantity,
    }));
    return { success: true, data: result };
  }

  @Get(':id/staffing-report')
  @ApiOperation({ summary: 'Báo cáo định biên của đơn vị (thừa/thiếu nhân sự, kèm phân công từng vị trí)' })
  @ApiResponse({ status: 200, description: 'Danh sách chức danh và số lượng, mỗi item có slots (camelCase)' })
  async getStaffingReport(@Param('id', ParseIntPipe) id: number) {
    const res = await firstValueFrom(this.orgService.GetStaffingReport({ unitId: id })) as any;
    return { success: true, data: res.items || [] };
  }

  @Post('staffing-slots')
  @ApiOperation({ summary: 'Phân công từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực riêng cho slot' })
  @ApiResponse({ status: 200, description: 'Slot đã lưu (camelCase)' })
  async setStaffingSlot(
    @Body() body: {
      staffingId: number;
      slotOrder: number;
      description?: string;
      geographicAreaId?: number;
      geographicAreaIds?: number[];
      domainIds?: number[];
      monitoredUnitIds?: number[];
    },
  ) {
    const result = await firstValueFrom(
      this.orgService.SetStaffingSlot({
        staffingId: body.staffingId,
        slotOrder: body.slotOrder,
        description: body.description,
        geographicAreaId: body.geographicAreaId,
        geographicAreaIds: body.geographicAreaIds,
        domainIds: body.domainIds,
        monitoredUnitIds: body.monitoredUnitIds,
      }),
    );
    return { success: true, data: result };
  }
}

@ApiTags('Đơn vị tổ chức công khai')
@Controller('public/org-units')
export class PublicOrganizationsController implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.orgService = this.client.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phẳng tất cả đơn vị tổ chức công khai' })
  @ApiResponse({ status: 200, description: 'Danh sách phẳng tất cả đơn vị tổ chức' })
  async getPublicOrgUnits() {
    try {
      const res = await firstValueFrom(this.orgService.GetFullTree({})) as any;
      const nodes = res.nodes || [];
      const flatList = this.flattenTree(nodes);
      return { success: true, data: flatList };
    } catch (error) {
      return { success: false, data: [], message: error.message };
    }
  }

  private flattenTree(nodes: any[]): any[] {
    if (!Array.isArray(nodes)) return [];
    let result: any[] = [];
    nodes.forEach((node) => {
      const { children, ...rest } = node;
      const rawParentId = rest.parentId ?? rest.parent_id;
      const normalizedNode = {
        ...rest,
        parentId: rawParentId === 0 ? null : (rawParentId ?? null),
      };
      result.push(normalizedNode);
      if (Array.isArray(children) && children.length > 0) {
        result = result.concat(this.flattenTree(children));
      }
    });
    return result;
  }
}

