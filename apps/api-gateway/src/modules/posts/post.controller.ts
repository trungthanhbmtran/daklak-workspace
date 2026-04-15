import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, Req, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Posts')
@Controller('admin/posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostController implements OnModuleInit {
  private postService: any;

  constructor(@Inject(MICROSERVICES.POST.SYMBOL) private readonly client: any) { }

  onModuleInit() {
    this.postService = this.client.getService(MICROSERVICES.POST.SERVICE);
  }

  @Get()
  async getPosts(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.pageSize) || parseInt(query.limit) || 10,
      search: query.search,
      authorId: query.authorId,
      categoryId: query.categoryId,
      category: query.category,
    };
    return firstValueFrom(this.postService.ListPosts(req));
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    return firstValueFrom(this.postService.GetPost({ id }));
  }

  @Post()
  async createPost(@Body() body: any, @Req() req: any) {
    const authorId = req.user?.id;
    return firstValueFrom(this.postService.CreatePost({ ...body, authorId }));
  }

  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const authorId = req.user?.id;
    return firstValueFrom(this.postService.UpdatePost({ id, ...body, authorId }));
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return firstValueFrom(this.postService.DeletePost({ id }));
  }

  // @Post(':postId/tags')
  // async addTagsToPost(@Param('postId') postId: string, @Body() body: { tagIds: string[] }) {
  //   return firstValueFrom(this.postService.AddTagsToPost({ postId, tagIds: body.tagIds || [] }));
  // }

  // @Delete(':postId/tags/:tagId')
  // async removeTagFromPost(@Param('postId') postId: string, @Param('tagId') tagId: string) {
  //   return firstValueFrom(this.postService.RemoveTagFromPost({ postId, tagId }));
  // }

  // @Put(':postId/category')
  // async setCategoryForPost(@Param('postId') postId: string, @Body() body: { categoryId: string }) {
  //   return firstValueFrom(this.postService.SetCategoryForPost({ postId, categoryId: body.categoryId }));
  // }

  @Put(':id/review')
  async reviewPost(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const reviewerId = req.user?.id || 'system-admin';
    const payload = { id, ...body, reviewerId };
    return firstValueFrom(this.postService.ReviewPost(payload));
  }
}
