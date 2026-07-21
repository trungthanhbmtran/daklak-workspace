import { InternalServerErrorException,
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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('Documents')
@Controller('admin/documents/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentCategoryController implements OnModuleInit {
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT_CATEGORY.SYMBOL)
    private readonly client: any,
  ) {}

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.DOCUMENT_CATEGORY.SERVICE,
    );
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
    return firstValueFrom(this.categoryService.ListCategories(req)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Get(':id')
  async getCategory(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.GetCategory({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Post()
  async createCategory(@Body() body: any) {
    return firstValueFrom(this.categoryService.CreateCategory(body)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    const payload = { id, ...body };
    return firstValueFrom(this.categoryService.UpdateCategory(payload)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return firstValueFrom(this.categoryService.DeleteCategory({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }
}
