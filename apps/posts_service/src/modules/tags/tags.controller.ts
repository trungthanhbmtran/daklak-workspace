import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @GrpcMethod('TagService', 'CreateTag')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createTag(data: CreateTagDto) {
    try {
      return await this.tagsService.create(data);
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('TagService', 'GetTag')
  async getTag(data: { id: string }) {
    try {
      const tag = await this.tagsService.findById(data.id);
      if (!tag)
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Tag not found',
        });
      return tag;
    } catch (error: unknown) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('TagService', 'ListTags')
  async listTags() {
    try {
      const tags = await this.tagsService.findAll();
      return { data: tags };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('TagService', 'UpdateTag')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateTag(data: UpdateTagDto & { id: string }) {
    try {
      return await this.tagsService.update(data.id, data);
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }

  @GrpcMethod('TagService', 'DeleteTag')
  async deleteTag(data: { id: string }) {
    try {
      await this.tagsService.delete(data.id);
      return { success: true };
    } catch (error: unknown) {
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: (error as Error).message,
      });
    }
  }
}
