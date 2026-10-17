import {
  InternalServerErrorException,
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class ConsultationsService implements OnModuleInit {
  private readonly logger = new Logger(ConsultationsService.name);
  private consultationGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.CONSULTATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.consultationGrpcService = this.client.getService(
      'ConsultationService',
    );
  }

  async listConsultations(query: any, metadata?: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      status: query.status,
    };
    return firstValueFrom(
      this.consultationGrpcService.ListConsultations(req, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async listAllPublicComments(status: string, metadata?: any) {
    return firstValueFrom(
      this.consultationGrpcService.ListPublicComments({ status }, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async getConsultation(id: string, metadata?: any) {
    return firstValueFrom(
      this.consultationGrpcService.GetConsultation({ id }, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async createConsultation(body: any, metadata?: any) {
    return firstValueFrom(
      this.consultationGrpcService.CreateConsultation(body, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async submitResponse(consultationId: string, body: any, metadata?: any) {
    const payload = { consultationId, ...body };
    return firstValueFrom(
      this.consultationGrpcService.SubmitResponse(payload, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async listResponses(consultationId: string, metadata?: any) {
    return firstValueFrom(
      this.consultationGrpcService.ListResponses({ consultationId }, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async listPublicComments(consultationId: string, status: string, metadata?: any) {
    return firstValueFrom(
      this.consultationGrpcService.ListPublicComments(
        {
          consultationId,
          status,
        },
        metadata,
      ),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }

  async moderateComment(id: string, body: any, req: any, metadata?: any) {
    const payload = { id, status: body.status, userId: req.user.id };
    return firstValueFrom(
      this.consultationGrpcService.ModerateComment(payload, metadata),
    ).catch((e) => {
      this.logger.error(`RPC Call Failed: ${e.message}`);
      throw new InternalServerErrorException('Lỗi gọi gRPC Document Service');
    });
  }
}
