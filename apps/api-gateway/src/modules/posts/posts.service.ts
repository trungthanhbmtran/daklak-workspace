import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class PostsService implements OnModuleInit {
  private postGrpcService: any;

  constructor(@Inject(MICROSERVICES.POST.SYMBOL) private client: ClientGrpc) {}

  onModuleInit() {
    this.postGrpcService = this.client.getService<any>(MICROSERVICES.POST.SERVICE);
  }

  async create(createPostDto: any, req: any) {
    return firstValueFrom(
      this.postGrpcService.createPost({
        ...createPostDto,
        authorId: req.user.id,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async findAll(query: any) {
    return firstValueFrom(this.postGrpcService.listPosts(query)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getStats(query: any) {
    return firstValueFrom(this.postGrpcService.getPostStats(query)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async findOne(id: string) {
    return firstValueFrom(this.postGrpcService.getPost({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async update(id: string, updatePostDto: any, req: any) {
    return firstValueFrom(
      this.postGrpcService.updatePost({
        id,
        ...updatePostDto,
        actorId: req.user.id,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async remove(id: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.deletePost({ id, actorId: req.user.id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async submit(id: string, note: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.submitPost({ id, actorId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async review(id: string, note: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.reviewPost({ id, reviewerId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async approve(id: string, note: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.approvePost({ id, reviewerId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async reject(id: string, note: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.rejectPost({ id, reviewerId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async publish(id: string, note: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.publishPost({ id, actorId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async unpublish(id: string, note: string, req: any) {
    return firstValueFrom(
      this.postGrpcService.unpublishPost({ id, actorId: req.user.id, note }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getHistory(id: string) {
    return firstValueFrom(this.postGrpcService.getPostHistory({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }
}
