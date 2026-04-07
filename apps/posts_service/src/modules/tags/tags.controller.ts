import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @GrpcMethod('TagService', 'CreateTag')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTag(data: CreateTagDto) {
    return this.tagsService.create(data);
  }

  @GrpcMethod('TagService', 'GetTag')
  async getTag(data: { id: string }) {
    return this.tagsService.findById(data.id);
  }

  @GrpcMethod('TagService', 'ListTags')
  async listTags() {
    const tags = await this.tagsService.findAll();
    return { data: tags };
  }

  @GrpcMethod('TagService', 'UpdateTag')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTag(data: UpdateTagDto & { id: string }) {
    return this.tagsService.update(data.id, data);
  }

  @GrpcMethod('TagService', 'DeleteTag')
  async deleteTag(data: { id: string }) {
    return { success: true };
  }
}
