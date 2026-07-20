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
  UseGuards,
  Req,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PostsController {
  private postService: any;

  constructor(@Inject(MICROSERVICES.POST.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.postService = this.client.getService<any>(MICROSERVICES.POST.SERVICE);
  }

  @Post()
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  async create(@Body() createPostDto: any, @Req() req: any) {
    return firstValueFrom(
      this.postService.createPost({
        ...createPostDto,
        authorId: req.user.id,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Get()
  async findAll(@Query() query: any) {
    return firstValueFrom(this.postService.listPosts(query)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  /**
   * Thống kê bài viết — backend tính, client chỉ render.
   * Thay thế pattern client fetch limit:1000 để count.
   */
  @Get('stats')
  async getStats(@Query() query: any) {
    return firstValueFrom(this.postService.getPostStats(query)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.postService.getPost({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Put(':id')
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: any,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.updatePost({
        id,
        ...updatePostDto,
        actorId: req.user.id,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @Req() req: any) {
    return firstValueFrom(
      this.postService.deletePost({ id, actorId: req.user.id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post(':id/submit')
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  async submit(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.submitPost({ id, actorId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post(':id/review')
  @Roles(Role.EDITOR, Role.REVIEWER, Role.ADMIN)
  async review(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.reviewPost({ id, reviewerId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post(':id/approve')
  @Roles(Role.REVIEWER, Role.ADMIN)
  async approve(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.approvePost({ id, reviewerId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post(':id/reject')
  @Roles(Role.REVIEWER, Role.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.rejectPost({ id, reviewerId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post(':id/publish')
  @Roles(Role.PUBLISHER, Role.ADMIN)
  async publish(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.publishPost({ id, actorId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Post(':id/unpublish')
  @Roles(Role.PUBLISHER, Role.ADMIN)
  async unpublish(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return firstValueFrom(
      this.postService.unpublishPost({ id, actorId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return firstValueFrom(this.postService.getPostHistory({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }
}
