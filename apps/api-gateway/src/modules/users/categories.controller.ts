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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

function toFrontendItem(c: any) {
  return {
    id: c.id,
    group: c.group ?? '',
    code: c.code ?? '',
    name: c.name ?? '',
    sort: c.order ?? 0,
    active: (c.isActive ?? c.is_active ?? true) ? 1 : 0,
    description: c.description ?? '',
  };
}

@ApiTags('Danh má»¥c há»‡ thá»‘ng')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  @Get('groups')
  @RequirePermissions('CATEGORY:READ')
  @ApiOperation({ summary: 'Láº¥y danh sÃ¡ch táº¥t cáº£ cÃ¡c nhÃ³m danh má»¥c' })
  @ApiResponse({ status: 200, description: 'Danh sÃ¡ch cÃ¡c nhÃ³m' })
  async getGroups() {
    console.log(
      '[CategoriesController] Requesting GetAllGroups from user-service...',
    );
    try {
      const res: any = await firstValueFrom(
        this.categoryService.GetAllGroups({}),
      );
      console.log('[CategoriesController] GetAllGroups response:', res);
      return { success: true, data: res.groups || [] };
    } catch (error) {
      console.error(
        '[CategoriesController] Error calling GetAllGroups:',
        error.message,
      );
      return {
        success: false,
        data: [],
        message:
          'ChÆ°a thá»ƒ káº¿t ná»‘i tá»›i dá»‹ch vá»¥ danh má»¥c hoáº·c phÆ°Æ¡ng thá»©c chÆ°a Ä‘Æ°á»£c há»— trá»£',
      };
    }
  }

  @Get()
  @RequirePermissions('')
  @ApiOperation({
    summary: 'Láº¥y danh má»¥c theo nhÃ³m hoáº·c táº¥t cáº£ náº¿u khÃ´ng truyá»n group',
  })
  @ApiQuery({
    name: 'group',
    required: false,
    description: 'MÃ£ nhÃ³m danh má»¥c (Ä‘á»ƒ trá»‘ng Ä‘á»ƒ láº¥y táº¥t cáº£)',
  })
  @ApiResponse({ status: 200, description: 'Danh sÃ¡ch danh má»¥c thuá»™c nhÃ³m' })
  async getByGroup(@Query('group') group?: string) {
    if (!group) {
      const result = await firstValueFrom(
        this.categoryService.GetAllCategories({}),
      );
      return { success: true, data: (result as any)?.data || [] };
    }
    const result = await firstValueFrom(
      this.categoryService.GetByGroup({ group: group || '' }),
    );
    return { success: true, data: (result as any)?.data || [] };
  }

  @Post()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Táº¡o danh má»¥c má»›i (Admin)' })
  @ApiBody({ description: 'group, code, name, description?, order?' })
  @ApiResponse({ status: 201, description: 'Danh má»¥c vá»«a táº¡o' })
  async create(
    @Body()
    body: {
      group: string;
      code: string;
      name: string;
      description?: string;
      order?: number;
    },
  ) {
    const res = await firstValueFrom(
      this.categoryService.Create({
        group: body.group,
        code: body.code,
        name: body.name,
        description: body.description,
        order: body.order,
      }),
    );
    return { success: true, data: toFrontendItem(res as any) };
  }

  @Put(':id')
  @RequirePermissions('CATEGORY:MANAGE')
  @ApiOperation({ summary: 'Cáº­p nháº­t danh má»¥c' })
  @ApiResponse({ status: 200, description: 'Danh má»¥c Ä‘Ã£ cáº­p nháº­t' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      code?: string;
      name?: string;
      description?: string;
      order?: number;
      sort?: number;
      active?: number;
    },
  ) {
    const payload = {
      id,
      code: body.code,
      name: body.name,
      description: body.description,
      order: body.order ?? body.sort,
      isActive: body.active !== undefined ? !!body.active : undefined,
    };
    const res = await firstValueFrom(this.categoryService.Update(payload));
    return { success: true, data: toFrontendItem(res as any) };
  }

  @Delete(':id')
  @RequirePermissions('CATEGORY:MANAGE')
  @ApiOperation({ summary: 'XÃ³a danh má»¥c (khÃ´ng xÃ³a Ä‘Æ°á»£c danh má»¥c há»‡ thá»‘ng)' })
  @ApiResponse({ status: 200, description: 'ÄÃ£ xÃ³a' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(
      this.categoryService.Delete({ id }),
    )) as any;
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'ÄÃ£ xÃ³a danh má»¥c',
    };
  }
}

@ApiTags('Danh má»¥c há»‡ thá»‘ng cÃ´ng khai')
@Controller('public/categories')
export class PublicCategoriesController implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  @Get()
  @RequirePermissions('')
  @ApiOperation({
    summary:
      'Láº¥y danh má»¥c theo nhÃ³m hoáº·c táº¥t cáº£ náº¿u khÃ´ng truyá»n group (CÃ´ng khai)',
  })
  @ApiQuery({
    name: 'group',
    required: false,
    description: 'MÃ£ nhÃ³m danh má»¥c (Ä‘á»ƒ trá»‘ng Ä‘á»ƒ láº¥y táº¥t cáº£)',
  })
  @ApiQuery({ name: 'lang', required: false, description: 'MÃ£ ngÃ´n ngá»¯' })
  @ApiResponse({ status: 200, description: 'Danh sÃ¡ch danh má»¥c thuá»™c nhÃ³m' })
  async getByGroup(@Query() query: any) {
    const group = query.group;
    const lang = query.lang || 'vi';
    if (!group) {
      const result = await firstValueFrom(
        this.categoryService.GetAllCategories({ lang }),
      );
      return { success: true, data: (result as any)?.data || [] };
    }
    const result = await firstValueFrom(
      this.categoryService.GetByGroup({ group: group || '', lang }),
    );
    return { success: true, data: (result as any)?.data || [] };
  }
}

