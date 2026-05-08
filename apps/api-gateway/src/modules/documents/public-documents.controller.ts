import { Controller, Get, Param, Query, Inject, OnModuleInit } from '@nestjs/common';
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
    this.documentService = this.client.getService(MICROSERVICES.DOCUMENT.SERVICE);
  }

  @Get('procedures')
  async listProcedures(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || "",
      category: query.category || "ALL",
    };
    return firstValueFrom(this.documentService.ListProcedures(req));
  }

  @Get('procedures/:id')
  async getProcedure(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetProcedure({ id }));
  }

  @Get('dossiers/:code')
  async getDossierByCode(@Param('code') code: string) {
    return firstValueFrom(this.documentService.GetDossier({ code }));
  }
}
