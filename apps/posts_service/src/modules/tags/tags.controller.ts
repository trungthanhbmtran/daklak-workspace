import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TagsService } from './tags.service';

@Controller()
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @GrpcMethod('TagService', 'CreateTag')
    async createTag(data: any) {
        await this.tagsService.create(data);
        return { success: true, message: 'Tag created successfully' };
    }

    @GrpcMethod('TagService', 'GetTag')
    async getTag(data: { id: string }) {
        return this.tagsService.findById(data.id);
    }

    @GrpcMethod('TagService', 'ListTags')
    async listTags(data: any) {
        return this.tagsService.findAll(data);
    }

    @GrpcMethod('TagService', 'UpdateTag')
    async updateTag(data: any) {
        return this.tagsService.update(data.id, data);
    }

    @GrpcMethod('TagService', 'DeleteTag')
    async deleteTag(data: { id: string }) {
        await this.tagsService.delete(data.id);
        return { success: true };
    }
}
