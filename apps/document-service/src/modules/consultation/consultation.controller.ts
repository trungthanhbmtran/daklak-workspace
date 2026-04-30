import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ConsultationService } from './consultation.service';

@Controller()
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @GrpcMethod('ConsultationService', 'CreateConsultation')
  createConsultation(data: any) {
    return this.consultationService.create(data);
  }

  @GrpcMethod('ConsultationService', 'GetConsultation')
  getConsultation(data: { id: string }) {
    return this.consultationService.findOne(data.id);
  }

  @GrpcMethod('ConsultationService', 'ListConsultations')
  listConsultations(data: any) {
    return this.consultationService.findAll(data);
  }

  @GrpcMethod('ConsultationService', 'SubmitResponse')
  submitResponse(data: any) {
    return this.consultationService.submitResponse(data);
  }

  @GrpcMethod('ConsultationService', 'SubmitPublicComment')
  submitPublicComment(data: any) {
    return this.consultationService.submitPublicComment(data);
  }

  @GrpcMethod('ConsultationService', 'ListPublicComments')
  listPublicComments(data: any) {
    return this.consultationService.listPublicComments(data);
  }

  @GrpcMethod('ConsultationService', 'ModerateComment')
  moderateComment(data: any) {
    return this.consultationService.moderateComment(data);
  }
}
