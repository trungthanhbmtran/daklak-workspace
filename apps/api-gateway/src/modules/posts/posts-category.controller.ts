import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../../core/constants/services';

@Controller('admin/posts/categories')
export class PostsCategoryController {
  private categoryService: any;

  constructor(@Inject(MICROSERVICES.POSTS_CATEGORY.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.categoryService = this.client.getService<any>(MICROSERVICES.POSTS_CATEGORY.SERVICE);
  }

  @Post()
  async create(@Body() createDto: any) {
    return firstValueFrom(this.categoryService.createCategory(createDto));
  }

  @Get()
  async findAll() {
    return firstValueFrom(this.categoryService.listCategories({}));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.getCategory({ id }));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return firstValueFrom(this.categoryService.updateCategory({ id, ...updateDto }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.deleteCategory({ id }));
  }
}
