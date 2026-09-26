import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PbacGuard } from '../../common/guards/pbac.guard';
import { RequirePolicy } from '../../common/decorators/require-policy.decorator';
import { PostsService } from './posts.service';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, PbacGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @RequirePolicy('create', 'posts')
  async create(@Body() createPostDto: any, @Req() req: any) {
    return this.postsService.create(createPostDto, req);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @RequirePolicy('update', 'posts')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: any,
    @Req() req: any,
  ) {
    return this.postsService.update(id, updatePostDto, req);
  }

  @Delete(':id')
  @RequirePolicy('delete', 'posts')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.remove(id, req);
  }

  @Post(':id/submit')
  @RequirePolicy('submit', 'posts')
  async submit(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.submit(id, note, req);
  }

  @Post(':id/review')
  @RequirePolicy('review', 'posts')
  async review(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.review(id, note, req);
  }

  @Post(':id/approve')
  @RequirePolicy('approve', 'posts')
  async approve(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.approve(id, note, req);
  }

  @Post(':id/reject')
  @RequirePolicy('reject', 'posts')
  async reject(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.reject(id, note, req);
  }

  @Post(':id/publish')
  @RequirePolicy('publish', 'posts')
  async publish(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.publish(id, note, req);
  }

  @Post(':id/unpublish')
  @RequirePolicy('unpublish', 'posts')
  async unpublish(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.unpublish(id, note, req);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    return this.postsService.getHistory(id);
  }
}
