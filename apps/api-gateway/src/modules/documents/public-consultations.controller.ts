import { Controller, Post, Body, Param, Inject, OnModuleInit } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public Consultations')
@Controller('public/documents/consultations')
export class PublicConsultationsController implements OnModuleInit {
  private consultationService: any;

  constructor(
    @Inject(MICROSERVICES.CONSULTATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.consultationService = this.client.getService('ConsultationService');
  }

  @Post(':id/comments')
  async submitPublicComment(@Param('id') consultationId: string, @Body() body: any) {
    const payload = { consultationId, ...body };
    return firstValueFrom(this.consultationService.SubmitPublicComment(payload));
  }
}
