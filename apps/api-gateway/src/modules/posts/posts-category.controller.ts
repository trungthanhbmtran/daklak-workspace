import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

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
  async getCategories(@Query() query: CategoryQueryDto) {
    return await firstValueFrom(this.categoryService.ListCategories(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết danh mục' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết danh mục' })
  async getCategory(@Param('id') id: string) {
    return await firstValueFrom(this.categoryService.GetCategory({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo danh mục mới' })
  @ApiResponse({ status: 201, description: 'Danh mục đã được tạo' })
  async createCategory(@Body() body: CreateCategoryDto) {
    return await firstValueFrom(this.categoryService.CreateCategory(body));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được cập nhật' })
  async updateCategory(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return await firstValueFrom(this.categoryService.UpdateCategory({ id, ...body }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa danh mục' })
  @ApiResponse({ status: 200, description: 'Danh mục đã được xóa' })
  async deleteCategory(@Param('id') id: string) {
    return await firstValueFrom(this.categoryService.DeleteCategory({ id }));
  }
}
