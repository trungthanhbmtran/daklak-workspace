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

@ApiTags('ÄÆ¡n vá»‹ tá»• chá»©c')
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
  @ApiOperation({ summary: 'Táº¡o Ä‘Æ¡n vá»‹ tá»• chá»©c' })
  @ApiResponse({ status: 201, description: 'ÄÆ¡n vá»‹ vá»«a táº¡o (camelCase)' })
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
        throw new BadRequestException('domainIds pháº£i lÃ  má»™t máº£ng');
      }
      if (
        body.geographicAreaIds !== undefined &&
        !Array.isArray(body.geographicAreaIds)
      ) {
        throw new BadRequestException('geographicAreaIds pháº£i lÃ  má»™t máº£ng');
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
      const message = err?.message ?? err?.details ?? 'Lá»—i táº¡o Ä‘Æ¡n vá»‹';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  @Get('unit-types')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'Láº¥y danh sÃ¡ch loáº¡i Ä‘Æ¡n vá»‹ (UBND, Sá»Ÿ, PhÃ²ng...)' })
  @ApiResponse({ status: 200, description: 'Danh sÃ¡ch loáº¡i Ä‘Æ¡n vá»‹' })
  async getUnitTypes() {
    const res = (await firstValueFrom(
      this.orgService.ListUnitTypes({}),
    )) as any;
    return { success: true, data: res.items || [] };
  }

  @Get('tree')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'CÃ¢y tá»• chá»©c toÃ n bá»™' })
  @ApiResponse({
    status: 200,
    description: 'CÃ¢y Ä‘Æ¡n vá»‹ (root nodes cÃ³ children)',
  })
  async getFullTree(@Req() request: any) {
    const res = (await firstValueFrom(this.orgService.GetFullTree({}))) as any;
    let nodes = res.nodes || [];

    const user = request?.user;
    let isAdmin =
      user?.roles?.includes('SUPER_ADMIN') ||
      user?.roles?.includes('ADMIN') ||
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
      'Danh sÃ¡ch chá»©c danh (theo Ä‘Æ¡n vá»‹: chá»‰ chá»©c danh Ã¡p dá»¥ng cho loáº¡i Ä‘Æ¡n vá»‹ Ä‘Ã³)',
  })
  @ApiResponse({ status: 200, description: 'Danh sÃ¡ch chá»©c danh (camelCase)' })
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
      'Cáº­p nháº­t chá»©c danh (lÄ©nh vá»±c phá»¥ trÃ¡ch, theo dÃµi phÃ²ng ban, khu vá»±c Ä‘á»‹a lÃ½)',
  })
  @ApiResponse({
    status: 200,
    description: 'Chá»©c danh Ä‘Ã£ cáº­p nháº­t (camelCase)',
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
      throw new BadRequestException('monitoredUnitIds pháº£i lÃ  má»™t máº£ng');
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
  @ApiOperation({ summary: 'Chi tiáº¿t má»™t Ä‘Æ¡n vá»‹' })
  @ApiResponse({ status: 200, description: 'ÄÆ¡n vá»‹ (camelCase)' })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await firstValueFrom(this.orgService.GetOne({ id }));
      return { success: true, data: result };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'ÄÆ¡n vá»‹ khÃ´ng tá»“n táº¡i';
      if (err?.code === 5) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }

  @Put(':id')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({ summary: 'Cáº­p nháº­t Ä‘Æ¡n vá»‹ tá»• chá»©c' })
  @ApiResponse({ status: 200, description: 'ÄÆ¡n vá»‹ Ä‘Ã£ cáº­p nháº­t (camelCase)' })
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
        throw new BadRequestException('domainIds pháº£i lÃ  má»™t máº£ng');
      }
      if (
        body.geographicAreaIds !== undefined &&
        !Array.isArray(body.geographicAreaIds)
      ) {
        throw new BadRequestException('geographicAreaIds pháº£i lÃ  má»™t máº£ng');
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
      const message = err?.message ?? err?.details ?? 'Lá»—i cáº­p nháº­t Ä‘Æ¡n vá»‹';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 6) throw new ConflictException(message);
      throw new BadRequestException(message);
    }
  }

  @Delete(':id')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({ summary: 'XÃ³a Ä‘Æ¡n vá»‹ (chá»‰ khi khÃ´ng cÃ³ Ä‘Æ¡n vá»‹ con)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      const res = (await firstValueFrom(
        this.orgService.DeleteUnit({ id }),
      )) as any;
      return {
        success: res?.success ?? true,
        message: res?.message ?? 'ÄÃ£ xÃ³a Ä‘Æ¡n vá»‹',
      };
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lá»—i xÃ³a Ä‘Æ¡n vá»‹';
      if (err?.code === 5) throw new NotFoundException(message);
      if (err?.code === 9) throw new ConflictException(message); // FAILED_PRECONDITION
      throw new BadRequestException(message);
    }
  }

  @Get(':id/subtree')
  @RequirePermissions('ORGANIZATION:READ')
  @ApiOperation({ summary: 'CÃ¢y con cá»§a má»™t Ä‘Æ¡n vá»‹' })
  @ApiResponse({ status: 200, description: 'CÃ¢y con tá»« Ä‘Æ¡n vá»‹ id' })
  async getSubTree(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(
      this.orgService.GetSubTree({ id }),
    )) as any;
    return { success: true, data: res.nodes || [] };
  }

  @Post('staffing')
  @RequirePermissions('ORGANIZATION:MANAGE')
  @ApiOperation({
    summary: 'Thiáº¿t láº­p Ä‘á»‹nh biÃªn (sá»‘ lÆ°á»£ng chá»©c danh cho Ä‘Æ¡n vá»‹)',
  })
  @ApiResponse({ status: 200, description: 'Äá»‹nh biÃªn Ä‘Ã£ lÆ°u (camelCase)' })
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
      'BÃ¡o cÃ¡o Ä‘á»‹nh biÃªn cá»§a Ä‘Æ¡n vá»‹ (thá»«a/thiáº¿u nhÃ¢n sá»±, kÃ¨m phÃ¢n cÃ´ng tá»«ng vá»‹ trÃ­)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Danh sÃ¡ch chá»©c danh vÃ  sá»‘ lÆ°á»£ng, má»—i item cÃ³ slots (camelCase)',
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
      'PhÃ¢n cÃ´ng tá»«ng vá»‹ trÃ­ (tá»«ng phÃ³): lÄ©nh vá»±c, nhiá»‡m vá»¥, khu vá»±c riÃªng cho slot',
  })
  @ApiResponse({ status: 200, description: 'Slot Ä‘Ã£ lÆ°u (camelCase)' })
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
      throw new BadRequestException('monitoredUnitIds pháº£i lÃ  má»™t máº£ng');
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

@ApiTags('ÄÆ¡n vá»‹ tá»• chá»©c cÃ´ng khai')
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
    summary: 'Láº¥y danh sÃ¡ch pháº³ng táº¥t cáº£ Ä‘Æ¡n vá»‹ tá»• chá»©c cÃ´ng khai',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sÃ¡ch pháº³ng táº¥t cáº£ Ä‘Æ¡n vá»‹ tá»• chá»©c',
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

