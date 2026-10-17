import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { normalizeResponsePayload } from '../../common/utils/language-normalization.util';
import { executeGrpcCall } from '../../core/utils/grpc-call.util';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';

@Injectable()
export class PostsService implements OnModuleInit {
  private readonly logger = new Logger(PostsService.name);
  private postGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.POST.SYMBOL) private client: ClientGrpc,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.postGrpcService = this.client.getService<any>(
      MICROSERVICES.POST.SERVICE,
    );
  }

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  private async callGrpc<T>(call$: Observable<T>, action: string): Promise<T | null> {
    try {
      return await executeGrpcCall(call$, 8000, action);
    } catch (e: any) {
      this.logger.error(`${action} failed: ${e.message}`);
      return null;
    }
  }

  async create(createPostDto: any, req: any) {
    const res = await this.callGrpc(
      this.postGrpcService.createPost(
        {
          ...createPostDto,
          authorId: req.user.id,
        },
        this.getGrpcMetadata(req),
      ),
      'PostService.createPost',
    );
    return normalizeResponsePayload(res, 'post');
  }

  async findAll(query: any) {
    const res = await this.callGrpc(
      this.postGrpcService.listPosts(query),
      'PostService.listPosts',
    );
    return normalizeResponsePayload(res, 'post');
  }

  async findOne(id: string) {
    const res = await this.callGrpc(
      this.postGrpcService.getPost({ id }),
      'PostService.getPost',
    );
    return normalizeResponsePayload(res, 'post');
  }

  async update(id: string, updatePostDto: any, req: any) {
    const res = await this.callGrpc(
      this.postGrpcService.updatePost(
        {
          id,
          ...updatePostDto,
          actorId: req.user.id,
        },
        this.getGrpcMetadata(req),
      ),
      'PostService.updatePost',
    );
    return normalizeResponsePayload(res, 'post');
  }

  async remove(id: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.deletePost(
        { id, actorId: req.user.id },
        this.getGrpcMetadata(req),
      ),
      'PostService.deletePost',
    );
  }

  async submit(id: string, note: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.submitPost(
        { id, actorId: req.user.id, note },
        this.getGrpcMetadata(req),
      ),
      'PostService.submitPost',
    );
  }

  async review(id: string, note: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.reviewPost(
        { id, reviewerId: req.user.id, note },
        this.getGrpcMetadata(req),
      ),
      'PostService.reviewPost',
    );
  }

  async approve(id: string, note: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.approvePost(
        { id, reviewerId: req.user.id, note },
        this.getGrpcMetadata(req),
      ),
      'PostService.approvePost',
    );
  }

  async reject(id: string, note: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.rejectPost(
        { id, reviewerId: req.user.id, note },
        this.getGrpcMetadata(req),
      ),
      'PostService.rejectPost',
    );
  }

  async publish(id: string, note: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.publishPost(
        { id, actorId: req.user.id, note },
        this.getGrpcMetadata(req),
      ),
      'PostService.publishPost',
    );
  }

  async unpublish(id: string, note: string, req: any) {
    return this.callGrpc(
      this.postGrpcService.unpublishPost(
        { id, actorId: req.user.id, note },
        this.getGrpcMetadata(req),
      ),
      'PostService.unpublishPost',
    );
  }

  async getHistory(id: string) {
    return this.callGrpc(
      this.postGrpcService.getPostHistory({ id }),
      'PostService.getPostHistory',
    );
  }
}
