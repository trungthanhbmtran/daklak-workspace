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
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../../core/constants/services';

@Controller('admin/posts')
export class PostsController {
  private postService: any;

  constructor(@Inject(MICROSERVICES.POST.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.postService = this.client.getService<any>(MICROSERVICES.POST.SERVICE);
  }

  @Post()
  async create(@Body() createPostDto: any) {
    return firstValueFrom(this.postService.createPost(createPostDto));
  }

  @Get()
  async findAll(@Query() query: any) {
    return firstValueFrom(this.postService.listPosts(query));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.postService.getPost({ id }));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: any) {
    return firstValueFrom(this.postService.updatePost({ id, ...updatePostDto }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.postService.deletePost({ id }));
  }
  
  @Post(':id/review')
  async review(@Param('id') id: string, @Body() reviewDto: any) {
    return firstValueFrom(this.postService.reviewPost({ id, ...reviewDto }));
  }
}
