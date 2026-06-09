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
  ApiParam,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { DynamicPermissionsGuard } from '../../core/guards/dynamic-permissions.guard';

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

@ApiTags('Danh mục hệ thống')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, DynamicPermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  @Get('groups')
  @ApiOperation({ summary: 'L?y danh s�ch t?t c? c�c nh�m danh m?c' })
  @ApiResponse({ status: 200, description: 'Danh s�ch t?t c? c�c nh�m danh m?c' })
  @ApiResponse({ status: 201, description: 'Nh�m danh m?c v?a t?o' })
  @ApiResponse({ status: 400, description: 'D? li?u kh�ng h?p l?' })
  @ApiResponse({ status: 500, description: 'L?i h? th?ng' })
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
          'Chua th? k?t n?i t?i d?ch v? danh m?c ho?c phuong th?c chua du?c h? tr?',
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'L?y danh m?c theo nh�m ho?c t?t c? n?u kh�ng truy?n group',
  })
  @ApiQuery({
    name: 'group',
    required: false,
    description: 'M� nh�m danh m?c (d? tr?ng d? l?y t?t c?)',
  })
  @ApiResponse({ status: 200, description: 'Danh s�ch danh m?c thu?c nh�m' })
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
  @ApiOperation({ summary: 'T?o danh m?c m?i (Admin)' })
  @ApiBody({ description: 'group, code, name, description?, order?' })
  @ApiResponse({ status: 201, description: 'Danh m?c v?a t?o' })
  @ApiResponse({ status: 400, description: 'D? li?u kh�ng h?p l?' })
  @ApiResponse({ status: 500, description: 'L?i h? th?ng' })
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
  @ApiOperation({ summary: 'C?p nh?t danh m?c' })
  @ApiBody({ description: 'group, code, name, description?, order?' })
  @ApiResponse({ status: 200, description: 'Danh m?c d� c?p nh?t' })
  @ApiResponse({ status: 400, description: 'D? li?u kh�ng h?p l?' })
  @ApiResponse({ status: 500, description: 'L?i h? th?ng' })
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
  @ApiOperation({ summary: 'X�a danh m?c (kh�ng x�a du?c danh m?c h? th?ng)' })
  @ApiResponse({ status: 200, description: '�� x�a danh m?c' })
  @ApiResponse({ status: 404, description: 'Danh m?c kh�ng t?n t?i' })
  @ApiResponse({ status: 403, description: 'Kh�ng c� quy?n x�a danh m?c' })
  @ApiResponse({ status: 500, description: 'L?i h? th?ng' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(
      this.categoryService.Delete({ id }),
    )) as any;
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'Đã xóa danh mục',
    };
  }
}

@ApiTags('Danh m?c h? th?ng c�ng khai')
@Controller('public/categories')
export class PublicCategoriesController implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.SYS_CATEGORY.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  @Get()
  @ApiOperation({
    summary:
      'L?y danh m?c theo nh�m ho?c t?t c? n?u kh�ng truy?n group (C�ng khai)',
  })
  @ApiQuery({
    name: 'group',
    required: false,
    description: 'M� nh�m danh m?c (d? tr?ng d? l?y t?t c?)',
  })
  @ApiQuery({ name: 'lang', required: false, description: 'M� ng�n ng?' })
  @ApiResponse({ status: 200, description: 'Danh s�ch danh m?c thu?c nh�m' })
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


