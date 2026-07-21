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
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { ConsultationsService } from './consultations.service';

@ApiTags('Consultations')
@Controller('admin/documents/consultations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  async listConsultations(@Query() query: any) {
    return this.consultationsService.listConsultations(query);
  }

  @Get('public-comments')
  async listAllPublicComments(@Query('status') status: string) {
    return this.consultationsService.listAllPublicComments(status);
  }

  @Get(':id')
  async getConsultation(@Param('id') id: string) {
    return this.consultationsService.getConsultation(id);
  }

  @Post()
  async createConsultation(@Body() body: any) {
    return this.consultationsService.createConsultation(body);
  }

  @Post(':id/responses')
  async submitResponse(@Param('id') consultationId: string, @Body() body: any) {
    return this.consultationsService.submitResponse(consultationId, body);
  }

  @Get(':id/responses')
  async listResponses(@Param('id') consultationId: string) {
    return this.consultationsService.listResponses(consultationId);
  }

  @Get(':id/public-comments')
  async listPublicComments(
    @Param('id') consultationId: string,
    @Query('status') status: string,
  ) {
    return this.consultationsService.listPublicComments(consultationId, status);
  }

  @Put('public-comments/:id/moderate')
  async moderateComment(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.consultationsService.moderateComment(id, body, req);
  }
}
