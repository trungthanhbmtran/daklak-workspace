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
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { PostsService } from './posts.service';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  async create(@Body() createPostDto: any, @Req() req: any) {
    return this.postsService.create(createPostDto, req);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.postsService.findAll(query);
  }

  @Get('stats')
  async getStats(@Query() query: any) {
    return this.postsService.getStats(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: any,
    @Req() req: any,
  ) {
    return this.postsService.update(id, updatePostDto, req);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.postsService.remove(id, req);
  }

  @Post(':id/submit')
  @Roles(Role.AUTHOR, Role.EDITOR, Role.ADMIN)
  async submit(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.submit(id, note, req);
  }

  @Post(':id/review')
  @Roles(Role.EDITOR, Role.REVIEWER, Role.ADMIN)
  async review(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.review(id, note, req);
  }

  @Post(':id/approve')
  @Roles(Role.REVIEWER, Role.ADMIN)
  async approve(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.approve(id, note, req);
  }

  @Post(':id/reject')
  @Roles(Role.REVIEWER, Role.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.reject(id, note, req);
  }

  @Post(':id/publish')
  @Roles(Role.PUBLISHER, Role.ADMIN)
  async publish(
    @Param('id') id: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.postsService.publish(id, note, req);
  }

  @Post(':id/unpublish')
  @Roles(Role.PUBLISHER, Role.ADMIN)
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
