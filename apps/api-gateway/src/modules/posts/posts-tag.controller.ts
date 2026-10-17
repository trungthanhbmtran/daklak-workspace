import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
  Req,
  UseGuards,
  OnModuleInit,
  Logger,
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

@Controller('admin/posts/tags')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PostsTagController implements OnModuleInit {
  private readonly logger = new Logger(PostsTagController.name);
  private tagService: any;

  constructor(
    @Inject(MICROSERVICES.POSTS_TAG.SYMBOL) private client: ClientGrpc,
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
    this.tagService = this.client.getService<any>(
      MICROSERVICES.POSTS_TAG.SERVICE,
    );
  }

  @Post()
  async create(@Req() req: any, @Body() createDto: any) {
    return firstValueFrom(
      this.tagService.createTag(createDto, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return firstValueFrom(
      this.tagService.listTags(query, this.getGrpcMetadata(req)),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      return null;
    });
  }
}
