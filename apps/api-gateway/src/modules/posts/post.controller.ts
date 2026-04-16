import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, Req, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PostQueryDto } from './dto/post-query.dto';
import { CreatePostDto, UpdatePostDto, ReviewPostDto } from './dto/post.dto';

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
  @ApiOperation({ summary: 'Lấy danh sách bài viết' })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết và thông tin phân trang' })
  async getPosts(@Query() query: PostQueryDto) {
    return await firstValueFrom(this.postService.ListPosts({
      ...query,
      limit: query.pageSize,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết bài viết' })
  async getPost(@Param('id') id: string) {
    return await firstValueFrom(this.postService.GetPost({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Bài viết đã được tạo thành công' })
  async createPost(@Body() body: CreatePostDto, @Req() req: any) {
    const authorId = String(req.user?.id);
    return await firstValueFrom(this.postService.CreatePost({ ...body, authorId }));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được cập nhật thành công' })
  async updatePost(@Param('id') id: string, @Body() body: UpdatePostDto, @Req() req: any) {
    const authorId = String(req.user?.id);
    return await firstValueFrom(this.postService.UpdatePost({ id, ...body, authorId }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được xóa thành công' })
  async deletePost(@Param('id') id: string) {
    return await firstValueFrom(this.postService.DeletePost({ id }));
  }

  @Put(':id/review')
  @ApiOperation({ summary: 'Duyệt bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được duyệt' })
  async reviewPost(@Param('id') id: string, @Body() body: ReviewPostDto, @Req() req: any) {
    const reviewerId = String(req.user?.id || 'system-admin');
    const payload = { id, ...body, reviewerId };
    return await firstValueFrom(this.postService.ReviewPost(payload));
  }
}
