import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Inject,
  OnModuleInit,
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
    // Chỉ trả về các bài viết công khai (PUBLISHED)
    return firstValueFrom(
          this.postService.listPosts({ ...query, status: 'PUBLISHED' }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return firstValueFrom(this.postService.getPostBySlug({ slug })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.postService.getPost({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    return firstValueFrom(this.postService.incrementViewCount({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }
}
