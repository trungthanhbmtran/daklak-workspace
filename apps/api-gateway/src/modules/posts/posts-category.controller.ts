import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Posts - Categories')
@Controller('admin/posts/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostsCategoryController implements OnModuleInit {
  private categoryService: any;

  constructor(@Inject(MICROSERVICES.POSTS_CATEGORY.SYMBOL) private readonly client: any) { }

  onModuleInit() {
    this.categoryService = this.client.getService(MICROSERVICES.POSTS_CATEGORY.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách danh mục bài viết' })
  @ApiResponse({ status: 200, description: 'Danh sách danh mục (dạng cây hoặc phẳng)' })
  async getCategories(@Query() query: any) {
    try {
      const req = {
        page: parseInt(query.page) || 1,
        pageSize: parseInt(query.pageSize) || 10,
        search: query.search,
        mode: query.mode,
        id: query.id,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      };
      return await firstValueFrom(this.categoryService.ListCategories(req));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết danh mục' })
  async getCategory(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.categoryService.GetCategory({ id }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({ status: 201, description: 'Danh mục đã được tạo' })
  async createCategory(@Body() body: any) {
    try {
      return await firstValueFrom(this.categoryService.CreateCategory(body));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được cập nhật' })
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    try {
      return await firstValueFrom(this.categoryService.UpdateCategory({ id, ...body }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được xóa' })
  async deleteCategory(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.categoryService.DeleteCategory({ id }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    const message = error.details || error.message || 'Internal Server Error';
    if (error.code === 3) throw new BadRequestException(message);
    if (error.code === 5) throw new NotFoundException(message);
    throw new BadRequestException(message);
  }
}
