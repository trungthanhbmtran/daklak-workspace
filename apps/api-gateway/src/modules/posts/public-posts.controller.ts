import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Inject,
  OnModuleInit,
  InternalServerErrorException
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public Posts')
@Controller('public/posts')
export class PublicPostsController implements OnModuleInit {
  private postService: any;

  constructor(@Inject(MICROSERVICES.POST.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.postService = this.client.getService<any>(MICROSERVICES.POST.SERVICE);
  }

  @Get()
  async findAll(@Query() query: any) {
    const req = { ...query };
    
    // Map Frontend ?type=notification to isNotification=true
    if (req.type === 'notification') {
      req.isNotification = 'true';
    }

    // Chỉ trả về các bài viết công khai (PUBLISHED)
    return firstValueFrom(
      this.postService.listPosts({ ...req, status: 'PUBLISHED' }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.postService.getPostBySlug({ slug })).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.postService.getPost({ id })).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    return firstValueFrom(this.postService.incrementViewCount({ id })).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    );
  }
}
