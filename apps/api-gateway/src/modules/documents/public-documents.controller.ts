import {
  Controller,
  Get,
  Param,
  Query,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@ApiTags('Public Documents')
@Controller('public/documents')
export class PublicDocumentsController implements OnModuleInit {
  private documentService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.documentService = this.client.getService(
      MICROSERVICES.DOCUMENT.SERVICE,
    );
  }

  @Get('procedures')
  async listProcedures(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      category: query.category || 'ALL',
    };
    return firstValueFrom(this.documentService.ListProcedures(req)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  @Get('procedures/:id')
  async getProcedure(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetProcedure({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  @Get('dossiers/:code')
  async getDossierByCode(@Param('code') code: string) {
    return firstValueFrom(this.documentService.GetDossier({ code })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  @Get()
  async listDocuments(@Query() query: any) {
    const req: any = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
    };
    req.isPublic = true;
    if (query.typeId) req.typeId = query.typeId;
    if (query.fieldId) req.fieldId = query.fieldId;
    if (query.status) req.status = query.status;
    if (query.org) req.issuingAuthorityId = query.org;
    if (query.date) {
      req.startDate = query.date;
      req.endDate = query.date;
    }
    if (query.fiscalYear)
      req.fiscalYear = parseInt(query.fiscalYear.toString());
    if (query.transparencyCategory)
      req.transparencyCategory = query.transparencyCategory;
    return firstValueFrom(this.documentService.ListDocuments(req)).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetDocument({ id })).catch(
      (e) => {
        console.error('RPC Call Failed', e.message);
        return null;
      },
    );
  }
}
