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
  Req,
  UseGuards,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@Controller('admin/posts/categories')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PostsCategoryController implements OnModuleInit {
  private readonly logger = new Logger(PostsCategoryController.name);
  private categoryService: any;

  constructor(
    @Inject(MICROSERVICES.POSTS_CATEGORY.SYMBOL) private client: ClientGrpc,
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
    this.categoryService = this.client.getService<any>(
      MICROSERVICES.POSTS_CATEGORY.SERVICE,
    );
  }

  @Post()
  async create(@Req() req: any, @Body() createDto: any) {
    return firstValueFrom(
      this.categoryService.createCategory(createDto, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    const take = query.take
      ? parseInt(query.take, 10)
      : query.limit
        ? parseInt(query.limit, 10)
        : undefined;
    const skip = query.skip ? parseInt(query.skip, 10) : undefined;

    const payload = {
      ...query,
      take,
      skip,
      search: query.q || query.search || undefined,
    };

    const result: any = await firstValueFrom(
      this.categoryService.listCategories(payload, this.getGrpcMetadata(req)),
    ).catch((e) => {
      throw new InternalServerErrorException(e?.message || 'RPC Call Failed');
    });
    return {
      data: result?.data,
      meta: result?.meta || {},
    };
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.categoryService.getCategory({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDto: any,
  ) {
    return firstValueFrom(
      this.categoryService.updateCategory(
        { id, ...updateDto },
        this.getGrpcMetadata(req),
      ),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    return firstValueFrom(
      this.categoryService.deleteCategory({ id }, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }
}
