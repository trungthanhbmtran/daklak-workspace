import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Inject,
  UseGuards,
  OnModuleInit,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';

@ApiTags('Consultations')
@Controller('admin/documents/consultations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
    return firstValueFrom(this.consultationService.ListConsultations(req)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('public-comments')
  async listAllPublicComments(@Query('status') status: string) {
    return firstValueFrom(
          this.consultationService.ListPublicComments({ status }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get(':id')
  async getConsultation(@Param('id') id: string) {
    return firstValueFrom(this.consultationService.GetConsultation({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post()
  async createConsultation(@Body() body: any) {
    return firstValueFrom(this.consultationService.CreateConsultation(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post(':id/responses')
  async submitResponse(@Param('id') consultationId: string, @Body() body: any) {
    const payload = { consultationId, ...body };
    return firstValueFrom(this.consultationService.SubmitResponse(payload)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get(':id/responses')
  async listResponses(@Param('id') consultationId: string) {
    return firstValueFrom(
          this.consultationService.ListResponses({ consultationId }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get(':id/public-comments')
  async listPublicComments(
    @Param('id') consultationId: string,
    @Query('status') status: string,
  ) {
    return firstValueFrom(
          this.consultationService.ListPublicComments({ consultationId, status }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Put('public-comments/:id/moderate')
  async moderateComment(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const payload = { id, status: body.status, userId: req.user.id };
    return firstValueFrom(this.consultationService.ModerateComment(payload)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }
}
