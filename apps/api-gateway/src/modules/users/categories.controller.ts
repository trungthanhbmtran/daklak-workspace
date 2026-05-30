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
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Lấy danh sách tất cả các nhóm danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách các nhóm' })
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
          'Chưa thể kết nối tới dịch vụ danh mục hoặc phương thức chưa được hỗ trợ',
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh mục theo nhóm hoặc tất cả nếu không truyền group',
  })
  @ApiQuery({
    name: 'group',
    required: false,
    description: 'Mã nhóm danh mục (để trống để lấy tất cả)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục thuộc nhóm' })
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
  @ApiOperation({ summary: 'Tạo danh mục mới (Admin)' })
  @ApiBody({ description: 'group, code, name, description?, order?' })
  @ApiResponse({ status: 201, description: 'Danh mục vừa tạo' })
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
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã cập nhật' })
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
  @ApiOperation({ summary: 'Xóa danh mục (không xóa được danh mục hệ thống)' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
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

@ApiTags('Danh mục hệ thống công khai')
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
  @ApiOperation({
    summary:
      'Lấy danh mục theo nhóm hoặc tất cả nếu không truyền group (Công khai)',
  })
  @ApiQuery({
    name: 'group',
    required: false,
    description: 'Mã nhóm danh mục (để trống để lấy tất cả)',
  })
  @ApiQuery({ name: 'lang', required: false, description: 'Mã ngôn ngữ' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục thuộc nhóm' })
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
