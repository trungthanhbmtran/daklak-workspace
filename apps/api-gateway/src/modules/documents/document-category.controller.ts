import {
  InternalServerErrorException,
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
  Req,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@ApiTags('Documents')
@Controller('admin/documents/categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentCategoryController implements OnModuleInit {
  private readonly logger = new Logger(DocumentCategoryController.name);
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT_CATEGORY.SYMBOL)
    private readonly client: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  onModuleInit() {
    this.categoryService = this.client.getService(
      MICROSERVICES.DOCUMENT_CATEGORY.SERVICE,
    );
  }

  @Get()
  async listCategories(@Req() req: any, @Query() query: any) {
    const reqBody = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.pageSize) || 10,
      search: query.search,
      type: query.groupCode || query.type,
      status: query.status,
    };
    return firstValueFrom(
      this.categoryService.ListCategories(reqBody, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Get(':id')
  async getCategory(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.categoryService.GetCategory({ id }, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Post()
  async createCategory(@Req() req: any, @Body() body: any) {
    return firstValueFrom(
      this.categoryService.CreateCategory(body, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Put(':id')
  async updateCategory(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const payload = { id, ...body };
    return firstValueFrom(
      this.categoryService.UpdateCategory(payload, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }

  @Delete(':id')
  async deleteCategory(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.categoryService.DeleteCategory({ id }, this.getGrpcMetadata(req)),
    ).catch(
      (e) => {
        this.logger.error(`RPC Call Failed: ${e.message}`);
        throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
      },
    );
  }
}
