import { Controller, Get, Post, Put, Delete, Body, Param, Query, Inject, UseGuards, OnModuleInit } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('Consultations')
@Controller('admin/documents/consultations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ConsultationsController implements OnModuleInit {
  private consultationService: any;

  constructor(
    @Inject(MICROSERVICES.CONSULTATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.consultationService = this.client.getService('ConsultationService');
  }

  @Get()
  async listConsultations(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      status: query.status,
    };
    return firstValueFrom(this.consultationService.ListConsultations(req));
  }

  @Get(':id')
  async getConsultation(@Param('id') id: string) {
    return firstValueFrom(this.consultationService.GetConsultation({ id }));
  }

  @Post()
  async createConsultation(@Body() body: any) {
    return firstValueFrom(this.consultationService.CreateConsultation(body));
  }

  @Post(':id/responses')
  async submitResponse(@Param('id') consultationId: string, @Body() body: any) {
    const payload = { consultationId, ...body };
    return firstValueFrom(this.consultationService.SubmitResponse(payload));
  }
}
