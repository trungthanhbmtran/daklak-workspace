import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Posts - Categories')
@Controller('admin/posts/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostsCategoryController implements OnModuleInit {
  private categoryService: any;

  constructor(@Inject(MICROSERVICES.POSTS_CATEGORY.SYMBOL) private readonly client: any) {}

  onModuleInit() {
    this.categoryService = this.client.getService(MICROSERVICES.POSTS_CATEGORY.SERVICE);
  }

  @Get()
  async getCategories(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      pageSize: parseInt(query.pageSize) || 10,
      search: query.search,
      mode: query.mode,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };
    return firstValueFrom(this.categoryService.ListCategories(req));
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.GetCategory({ id }));
  }

  @Post()
  async createCategory(@Body() body: any) {
    return firstValueFrom(this.categoryService.CreateCategory(body));
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.categoryService.UpdateCategory({ id, ...body }));
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.DeleteCategory({ id }));
  }
}
