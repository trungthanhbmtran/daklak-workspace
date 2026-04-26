import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Documents')
@Controller('admin/documents/categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentCategoryController implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT_CATEGORY.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.categoryService = this.client.getService(MICROSERVICES.DOCUMENT_CATEGORY.SERVICE);
  }

  @Get()
  async listCategories(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.pageSize) || 10,
      search: query.search,
      type: query.groupCode || query.type,
      status: query.status,
    };
    return firstValueFrom(this.categoryService.ListCategories(req));
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.GetCategory({ id: parseInt(id) }));
  }

  @Post()
  async createCategory(@Body() body: any) {
    return firstValueFrom(this.categoryService.CreateCategory(body));
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const payload = { id: parseInt(id), ...body };
    return firstValueFrom(this.categoryService.UpdateCategory(payload));
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.DeleteCategory({ id: parseInt(id) }));
  }
}
