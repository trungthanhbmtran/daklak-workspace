import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, Req, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Lấy danh sách bài viết' })
  @ApiResponse({ status: 200, description: 'Danh sách bài viết và thông tin phân trang' })
  async getPosts(@Query() query: any) {
    try {
      const req = {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.pageSize) || parseInt(query.limit) || 10,
        search: query.search,
        authorId: query.authorId,
        categoryId: query.categoryId,
        category: query.category,
      };
      return await firstValueFrom(this.postService.ListPosts(req));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài viết theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin chi tiết bài viết' })
  async getPost(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.postService.GetPost({ id }));
    } catch (error: any) {
      if (error.code === 5) throw new NotFoundException('Không tìm thấy bài viết');
      this.handleError(error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo bài viết mới' })
  @ApiResponse({ status: 201, description: 'Bài viết đã được tạo thành công' })
  async createPost(@Body() body: any, @Req() req: any) {
    try {
      const authorId = String(req.user?.id);
      return await firstValueFrom(this.postService.CreatePost({ ...body, authorId }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được cập nhật thành công' })
  async updatePost(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    try {
      const authorId = String(req.user?.id);
      return await firstValueFrom(this.postService.UpdatePost({ id, ...body, authorId }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được xóa thành công' })
  async deletePost(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.postService.DeletePost({ id }));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  @Put(':id/review')
  @ApiOperation({ summary: 'Duyệt bài viết' })
  @ApiResponse({ status: 200, description: 'Bài viết đã được duyệt' })
  async reviewPost(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    try {
      const reviewerId = String(req.user?.id || 'system-admin');
      const payload = { id, ...body, reviewerId };
      return await firstValueFrom(this.postService.ReviewPost(payload));
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    const message = error.details || error.message || ' Internal Server Error';
    if (error.code === 3) { // INVALID_ARGUMENT
      throw new BadRequestException(message);
    }
    if (error.code === 5) { // NOT_FOUND
      throw new NotFoundException(message);
    }
    throw new BadRequestException(message);
  }
}
