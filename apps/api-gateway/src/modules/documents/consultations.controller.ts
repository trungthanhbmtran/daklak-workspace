import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { ConsultationsService } from './consultations.service';

@ApiTags('Consultations')
@Controller('admin/documents/consultations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ConsultationsController {
  constructor(
    private readonly consultationsService: ConsultationsService,
    private readonly issuer: TokenIssuerService,
  ) {}

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

  @Get()
  async listConsultations(@Req() req: any, @Query() query: any) {
    return this.consultationsService.listConsultations(
      query,
      this.getGrpcMetadata(req),
    );
  }

  @Get('public-comments')
  async listAllPublicComments(@Req() req: any, @Query('status') status: string) {
    return this.consultationsService.listAllPublicComments(
      status,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id')
  async getConsultation(@Req() req: any, @Param('id') id: string) {
    return this.consultationsService.getConsultation(
      id,
      this.getGrpcMetadata(req),
    );
  }

  @Post()
  async createConsultation(@Req() req: any, @Body() body: any) {
    return this.consultationsService.createConsultation(
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Post(':id/responses')
  async submitResponse(
    @Req() req: any,
    @Param('id') consultationId: string,
    @Body() body: any,
  ) {
    return this.consultationsService.submitResponse(
      consultationId,
      body,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id/responses')
  async listResponses(
    @Req() req: any,
    @Param('id') consultationId: string,
  ) {
    return this.consultationsService.listResponses(
      consultationId,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id/public-comments')
  async listPublicComments(
    @Req() req: any,
    @Param('id') consultationId: string,
    @Query('status') status: string,
  ) {
    return this.consultationsService.listPublicComments(
      consultationId,
      status,
      this.getGrpcMetadata(req),
    );
  }

  @Put('public-comments/:id/moderate')
  async moderateComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.consultationsService.moderateComment(
      id,
      body,
      req,
      this.getGrpcMetadata(req),
    );
  }
}
