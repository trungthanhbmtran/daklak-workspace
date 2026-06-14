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
import { PermissionsGuard } from '../../core/guards/permissions.guard';

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
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
  @ApiOperation({ summary: 'Lấy danh sách tất cả các nhóm danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách nhóm danh mục' })
  async getGroups() {
    try {
      const res: any = await firstValueFrom(
        this.categoryService.GetAllGroups({}),
      );
      return { success: true, data: res.groups || [] };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Chưa thể kết nối tới dịch vụ danh mục',
      };
    }
  }

  @Get()
  @ApiOperation({
    summary:
      'Lấy danh mục theo nhóm (hỗ trợ tìm kiếm, phân trang, selected-first server-side)',
  })
  @ApiQuery({ name: 'group', required: false })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Số lượng (mặc định 50)',
  })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({
    name: 'selectedIds',
    required: false,
    description: 'IDs đã chọn (comma-separated), luôn xuất hiện đầu',
  })
  @ApiResponse({ status: 200 })
  async getByGroup(
    @Query('group') group?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('selectedIds') selectedIds?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const skipNum = skip ? parseInt(skip, 10) : 0;
    const selectedIdsArr = selectedIds
      ? selectedIds
        .split(',')
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0)
      : [];

    if (!group) {
      const result = await firstValueFrom(
        this.categoryService.GetAllCategories({}),
      );
      return { success: true, data: (result as any)?.data || [] };
    }
    const result = await firstValueFrom(
      this.categoryService.GetByGroup({
        group: group || '',
        search: q || '',
        limit: limitNum,
        skip: skipNum,
        selectedIds: selectedIdsArr,
      }),
    );
    return { success: true, data: (result as any)?.data || [] };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới (Admin)' })
  @ApiBody({ description: 'group, code, name, description?, order?' })
  @ApiResponse({ status: 201, description: 'Danh mục vừa tạo' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
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
  @ApiBody({ description: 'code, name, description?, order?, active?' })
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
  @ApiResponse({ status: 200, description: 'Đã xóa danh mục' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại' })
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
  ) { }

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.SYS_CATEGORY.SERVICE,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh mục theo nhóm (hỗ trợ tìm kiếm, phân trang, công khai)',
  })
  @ApiQuery({ name: 'group', required: false, description: 'Mã nhóm danh mục' })
  @ApiQuery({ name: 'lang', required: false, description: 'Mã ngôn ngữ' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng trả về' })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Bỏ qua N phần tử đầu',
  })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục thuộc nhóm' })
  async getByGroup(@Query() query: any) {
    const group = query.group;
    const lang = query.lang || 'vi';
    const limitNum = query.limit ? parseInt(query.limit, 10) : 50;
    const skipNum = query.skip ? parseInt(query.skip, 10) : 0;

    if (!group) {
      const result = await firstValueFrom(
        this.categoryService.GetAllCategories({ lang }),
      );
      return { success: true, data: (result as any)?.data || [] };
    }
    const result = await firstValueFrom(
      this.categoryService.GetByGroup({
        group: group || '',
        lang,
        search: query.q || '',
        limit: limitNum,
        skip: skipNum,
      }),
    );
    return { success: true, data: (result as any)?.data || [] };
  }
}
