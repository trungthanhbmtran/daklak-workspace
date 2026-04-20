import {
  Controller,
  Get,
  Post,
  Body,
  Inject,
  Query,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../../core/constants/services';

@Controller('admin/posts/tags')
export class PostsTagController {
  private tagService: any;

  constructor(@Inject(MICROSERVICES.POSTS_TAG.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.tagService = this.client.getService<any>(MICROSERVICES.POSTS_TAG.SERVICE);
  }

  @Post()
  async create(@Body() createDto: any) {
    return firstValueFrom(this.tagService.createTag(createDto));
  }

  @Get()
  async findAll(@Query() query: any) {
    return firstValueFrom(this.tagService.listTags(query));
  }
}
