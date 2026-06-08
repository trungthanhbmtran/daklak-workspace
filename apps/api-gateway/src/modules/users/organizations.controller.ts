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
  NotFoundException,
  ConflictException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

@ApiTags('Đơn vị tổ chức')
@Controller('admin/organizations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationsController implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.orgService = this.client.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
  }

  @Post()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Tạo đơn vị tổ chức' })
  @ApiResponse({ status: 201, description: 'Đơn vị vừa tạo (camelCase)' })
  async create(
    @Body()
    body: {
      code: string;
      name: string;
      shortName?: string;
      typeId: number;
      parentId?: number | null;
      domainIds?: number[];
      geographicAreaIds?: number[];
      scope?: string;
    },
  ) {
    try {
      if (body.domainIds !== undefined && !Array.isArray(body.domainIds)) {
        throw new BadRequestException('domainIds phải là một mảng');
      }
      if (
        body.geographicAreaIds !== undefined &&
        !Array.isArray(body.geographicAreaIds)
      ) {
        throw new BadRequestException('geographicAreaIds phải là một mảng');
      }
      const result = await firstValueFrom(
        this.orgService.CreateUnit({
          code: body.code,
          name: body.name,
          shortName: body.shortName,
          typeId: body.typeId,
          parentId: body.parentId,
          domainIds: body.domainIds ?? [],
          geographicAreaIds: body.geographicAreaIds ?? [],
          scope: body.scope,
        }),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi tạo đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  @Get('unit-types')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'Lấy danh sách loại đơn vị (UBND, Sở, Phòng...)' })
  @ApiResponse({ status: 200, description: 'Danh sách loại đơn vị' })
  async getUnitTypes() {
    const res = (await firstValueFrom(
      this.orgService.ListUnitTypes({}),
    )) as any;
    return { success: true, data: res.items || [] };
  }

  @Get('tree')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'Cây tổ chức toàn bộ' })
  @ApiResponse({
    status: 200,
    description: 'Cây đơn vị (root nodes có children)',
  })
  async getFullTree(@Req() request: any) {
    const res = (await firstValueFrom(this.orgService.GetFullTree({}))) as any;
    let nodes = res.nodes || [];

    const user = request?.user;
    let isAdmin =
      user?.roles?.some((r: any) => r.code === 'SUPER_ADMIN') ||
      user?.roles?.some((r: any) => r.code === 'ADMIN') ||
      user?.permissionsFlatten?.includes('SYSTEM:MANAGE') ||
      user?.permissionsFlatten?.includes('ORGANIZATION:MANAGE');

    // Dynamic config check is handled by DynamicApiGuard now.

    if (!isAdmin && user?.unitId) {
      // Find the user's unit node and only return that node (and its descendants)
      const userUnitId = parseInt(user.unitId, 10);

      const findNode = (treeNodes: any[]): any | null => {
        for (const node of treeNodes) {
          if (parseInt(node.id, 10) === userUnitId) return node;
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const userUnitNode = findNode(nodes);
      nodes = userUnitNode ? [userUnitNode] : [];
    }

    const allowedActions: string[] = [];
    if (isAdmin) {
      allowedActions.push('CREATE_ROOT', 'CREATE_CHILD', 'EDIT', 'DELETE');
    }

    return {
      success: true,
      data: nodes,
      meta: {
        allowedActions,
      },
    };
  }

  @Get('job-titles')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({
    summary:
      'Danh sách chức danh (theo đơn vị: chỉ chức danh áp dụng cho loại đơn vị đó)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách chức danh (camelCase)' })
  async getJobTitles(@Query('unitId') unitId?: string) {
    const unitIdNum =
      unitId != null && unitId !== '' ? parseInt(unitId, 10) : undefined;
    const res = (await firstValueFrom(
      this.orgService.ListJobTitles({
        unitId: Number.isNaN(unitIdNum) ? undefined : unitIdNum,
      }),
    )) as any;
    return { success: true, data: res.items || [] };
  }

  @Put('job-titles/:id')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({
    summary:
      'Cập nhật chức danh (lĩnh vực phụ trách, theo dõi phòng ban, khu vực địa lý)',
  })
  @ApiResponse({
    status: 200,
    description: 'Chức danh đã cập nhật (camelCase)',
  })
  async updateJobTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      domainId?: number;
      geographicAreaId?: number;
      monitoredUnitIds?: number[];
    },
  ) {
    if (
      body.monitoredUnitIds !== undefined &&
      !Array.isArray(body.monitoredUnitIds)
    ) {
      throw new BadRequestException('monitoredUnitIds phải là một mảng');
    }
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
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'Chi tiết một đơn vị' })
  @ApiResponse({ status: 200, description: 'Đơn vị (camelCase)' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await firstValueFrom(this.orgService.GetOne({ id }));
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Đơn vị không tồn tại';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  @Put(':id')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({ summary: 'Cập nhật đơn vị tổ chức' })
  @ApiResponse({ status: 200, description: 'Đơn vị đã cập nhật (camelCase)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      code?: string;
      name?: string;
      shortName?: string;
      typeId?: number;
      parentId?: number | null;
      domainIds?: number[];
      geographicAreaIds?: number[];
      scope?: string;
    },
  ) {
    try {
      if (body.domainIds !== undefined && !Array.isArray(body.domainIds)) {
        throw new BadRequestException('domainIds phải là một mảng');
      }
      if (
        body.geographicAreaIds !== undefined &&
        !Array.isArray(body.geographicAreaIds)
      ) {
        throw new BadRequestException('geographicAreaIds phải là một mảng');
      }
      const payload: Record<string, unknown> = {
        id,
        code: body.code,
        name: body.name,
        shortName: body.shortName,
        typeId: body.typeId,
        domainIds: body.domainIds,
        geographicAreaIds: body.geographicAreaIds,
        scope: body.scope,
      };
      if (body.parentId !== undefined) payload.parentId = body.parentId;
      const result = await firstValueFrom(
        this.orgService.UpdateUnit(payload as any),
      );
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi cập nhật đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  @Delete(':id')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({ summary: 'Xóa đơn vị (chỉ khi không có đơn vị con)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const res = (await firstValueFrom(
        this.orgService.DeleteUnit({ id }),
      )) as any;
      return {
        success: res?.success ?? true,
        message: res?.message ?? 'Đã xóa đơn vị',
      };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi xóa đơn vị';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 9) throw new ConflictException(message); // FAILED_PRECONDITION
      throw new BadRequestException(message);
    }
  }

  @Get(':id/subtree')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'Cây con của một đơn vị' })
  @ApiResponse({ status: 200, description: 'Cây con từ đơn vị id' })
  async getSubTree(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(
      this.orgService.GetSubTree({ id }),
    )) as any;
    return { success: true, data: res.nodes || [] };
  }

  @Post('staffing')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({
    summary: 'Thiết lập định biên (số lượng chức danh cho đơn vị)',
  })
  @ApiResponse({ status: 200, description: 'Định biên đã lưu (camelCase)' })
  async setStaffing(
    @Body() body: { unitId: number; jobTitleId: number; quantity: number },
  ) {
    const result = await firstValueFrom(
      this.orgService.SetStaffing({
        unitId: body.unitId,
        jobTitleId: body.jobTitleId,
        quantity: body.quantity,
      }),
    );
    return { success: true, data: result };
  }

  @Get(':id/staffing-report')
  @RequirePermissions('ORGANIZATION:READ')
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
    const res = (await firstValueFrom(
      this.orgService.GetStaffingReport({ unitId: id }),
    )) as any;
    return { success: true, data: res.items || [] };
  }

  @Post('staffing-slots')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({
    summary:
      'Phân công từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực riêng cho slot',
  })
  @ApiResponse({ status: 200, description: 'Slot đã lưu (camelCase)' })
  async setStaffingSlot(
    @Body()
    body: {
      staffingId: number;
      slotOrder: number;
      description?: string;
      geographicAreaId?: number;
      geographicAreaIds?: number[];
      domainIds?: number[];
      monitoredUnitIds?: number[];
    },
  ) {
    if (
      body.monitoredUnitIds !== undefined &&
      !Array.isArray(body.monitoredUnitIds)
    ) {
      throw new BadRequestException('monitoredUnitIds phải là một mảng');
    }
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
    this.orgService = this.client.getService(
      MICROSERVICES.ORGANIZATION.SERVICE,
    );
  }

  @Get()
  @RequirePermissions('')
  @ApiOperation({
    summary: 'Lấy danh sách phẳng tất cả đơn vị tổ chức công khai',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phẳng tất cả đơn vị tổ chức',
  })
  async getPublicOrgUnits() {
    try {
      const res = (await firstValueFrom(
        this.orgService.GetFullTree({}),
      )) as any;
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