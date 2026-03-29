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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
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
    this.categoryService = this.client.getService(MICROSERVICES.SYS_CATEGORY.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh mục theo nhóm (UNIT_TYPE, GENDER, DOC_TYPE...)' })
  @ApiQuery({ name: 'group', required: true, description: 'Mã nhóm danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục thuộc nhóm' })
  async getByGroup(@Query('group') group: string) {
    const result = await firstValueFrom(this.categoryService.GetByGroup({ group: group || '' }));
    const data = (result as { data?: any[] })?.data ?? [];
    return data.map(toFrontendItem);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới (Admin)' })
  @ApiBody({ description: 'group, code, name, description?, order?' })
  @ApiResponse({ status: 201, description: 'Danh mục vừa tạo' })
  async create(
    @Body() body: { group: string; code: string; name: string; description?: string; order?: number },
  ) {
    const res = await firstValueFrom(this.categoryService.Create({
      group: body.group,
      code: body.code,
      name: body.name,
      description: body.description,
      order: body.order,
    }));
    return toFrontendItem(res as any);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã cập nhật' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string; description?: string; order?: number; sort?: number; active?: number },
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
    return toFrontendItem(res as any);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục (không xóa được danh mục hệ thống)' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(this.categoryService.Delete({ id }))) as any;
    return { success: res?.success ?? true, message: res?.message ?? 'Đã xóa danh mục' };
  }
}
