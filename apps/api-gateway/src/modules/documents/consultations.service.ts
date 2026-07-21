import { InternalServerErrorException, Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class ConsultationsService implements OnModuleInit {
  private consultationGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.CONSULTATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.consultationGrpcService = this.client.getService('ConsultationService');
  }

  async listConsultations(query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      status: query.status,
    };
    return firstValueFrom(
      this.consultationGrpcService.ListConsultations(req),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async listAllPublicComments(status: string) {
    return firstValueFrom(
      this.consultationGrpcService.ListPublicComments({ status }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async getConsultation(id: string) {
    return firstValueFrom(
      this.consultationGrpcService.GetConsultation({ id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async createConsultation(body: any) {
    return firstValueFrom(
      this.consultationGrpcService.CreateConsultation(body),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async submitResponse(consultationId: string, body: any) {
    const payload = { consultationId, ...body };
    return firstValueFrom(
      this.consultationGrpcService.SubmitResponse(payload),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async listResponses(consultationId: string) {
    return firstValueFrom(
      this.consultationGrpcService.ListResponses({ consultationId }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async listPublicComments(consultationId: string, status: string) {
    return firstValueFrom(
      this.consultationGrpcService.ListPublicComments({ consultationId, status }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async moderateComment(id: string, body: any, req: any) {
    const payload = { id, status: body.status, userId: req.user.id };
    return firstValueFrom(
      this.consultationGrpcService.ModerateComment(payload),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }
}
