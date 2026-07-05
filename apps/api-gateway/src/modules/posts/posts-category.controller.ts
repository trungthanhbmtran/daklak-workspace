import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Inject,
  Query,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { UseGuards } from '@nestjs/common';

@Controller('admin/posts/categories')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PostsCategoryController {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.POSTS_CATEGORY.SYMBOL) private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.categoryService = this.client.getService<any>(
      MICROSERVICES.POSTS_CATEGORY.SERVICE,
    );
  }

  @Post()
  async create(@Body() createDto: any) {
    return firstValueFrom(this.categoryService.createCategory(createDto));
  }

  @Get()
  async findAll(@Query() query: any) {
    const take = query.take ? parseInt(query.take, 10) : (query.limit ? parseInt(query.limit, 10) : undefined);
    const skip = query.skip ? parseInt(query.skip, 10) : undefined;
    
    const payload = {
      ...query,
      take,
      skip,
      search: query.q || query.search || undefined,
    };

    console.log('Gateway: Calling ListCategories with payload:', payload);
    const result: any = await firstValueFrom(
      this.categoryService.listCategories(payload),
    );
    console.log('Gateway: ListCategories response received');
    return { success: true, data: result?.data || [], meta: result?.meta || {} };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.getCategory({ id }));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return firstValueFrom(
      this.categoryService.updateCategory({ id, ...updateDto }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.deleteCategory({ id }));
  }
}
