import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { TagsRepository } from './repositories/tags.repository';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from '@generated/prisma/client';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async create(data: CreateTagDto): Promise<Tag> {
    return this.tagsRepository.create(data);
  }

  async findById(id: string): Promise<Tag> {
    const tag = await this.tagsRepository.findById(id);
    if (!tag) {
      throw new RpcException({ code: 5, message: 'Tag not found' });
    }
    return tag;
  }

  async update(id: string, data: UpdateTagDto): Promise<Tag> {
    await this.findById(id); // Check existence
    return this.tagsRepository.update(id, data);
  }

  async delete(id: string): Promise<Tag> {
    await this.findById(id); // Check existence
    return this.tagsRepository.delete(id);
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepository.findActive();
  }
}
