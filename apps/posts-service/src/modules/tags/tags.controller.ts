import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TagsService } from './tags.service';

@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @GrpcMethod('TagService', 'CreateTag')
  async createTag(data: { name: string }) {
    const result = await this.tagsService.create(data);
    return { data: result };
  }

  @GrpcMethod('TagService', 'ListTags')
  async listTags(data: { page?: number; limit?: number }) {
    const result = await this.tagsService.findAll(data.page, data.limit);
    return { data: result };
  }
}
