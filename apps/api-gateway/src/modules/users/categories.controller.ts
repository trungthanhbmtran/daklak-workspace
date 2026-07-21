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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { CategoriesService } from './categories.service';

@ApiTags('Danh mục hệ thống')
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('groups')
  @ApiOperation({ summary: 'Lấy danh sách tất cả các nhóm danh mục' })
  @ApiResponse({ status: 200, description: 'Danh sách nhóm danh mục' })
  async getGroups() {
    return this.categoriesService.getGroups();
  }

  @Put('groups/:code')
  @ApiOperation({ summary: 'Cập nhật tên và thứ tự của nhóm danh mục' })
  @ApiBody({ description: 'name, order?' })
  @ApiResponse({ status: 200, description: 'Nhóm danh mục đã cập nhật' })
  async updateGroup(
    @Param('code') code: string,
    @Body() body: { name: string; order?: number },
  ) {
    return this.categoriesService.updateGroup(code, body);
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
    return this.categoriesService.getByGroup(group, q, limit, skip, selectedIds);
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
    return this.categoriesService.create(body);
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
    return this.categoriesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục (không xóa được danh mục hệ thống)' })
  @ApiResponse({ status: 200, description: 'Đã xóa danh mục' })
  @ApiResponse({ status: 404, description: 'Danh mục không tồn tại' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}

@ApiTags('Danh mục hệ thống công khai')
@Controller('public/categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

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
    return this.categoriesService.publicGetByGroup(query);
  }
}
