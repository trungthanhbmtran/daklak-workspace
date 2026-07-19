import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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

@ApiTags('Documents')
@Controller('admin/documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController implements OnModuleInit {
  private documentService: any;
  private cabinetService: any;
  private dossierService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT.SYMBOL) private readonly documentClient: any,
    @Inject(MICROSERVICES.CABINET.SYMBOL) private readonly cabinetClient: any,
    @Inject(MICROSERVICES.DOSSIER.SYMBOL) private readonly dossierClient: any,
  ) {}

  onModuleInit() {
    this.documentService = this.documentClient.getService(
      MICROSERVICES.DOCUMENT.SERVICE,
    );
    this.cabinetService = this.cabinetClient.getService(
      MICROSERVICES.CABINET.SERVICE,
    );
    this.dossierService = this.dossierClient.getService(
      MICROSERVICES.DOSSIER.SERVICE,
    );
  }

  @Get('stats')
  async getStats() {
    return firstValueFrom(this.documentService.GetStatistics({})).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get()
  async listDocuments(@Query() query: any) {
    const req: any = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      typeId: query.typeId,
      fieldId: query.fieldId,
      status: query.status,
      urgency: query.urgency,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    if (query.isPublic !== undefined) req.isPublic = query.isPublic === 'true';
    if (query.fiscalYear) req.fiscalYear = parseInt(query.fiscalYear);
    if (query.transparencyCategory)
      req.transparencyCategory = query.transparencyCategory;
    if (query.isIncoming !== undefined)
      req.isIncoming = query.isIncoming === 'true';
    return firstValueFrom(this.documentService.ListDocuments(req)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  // --- Administrative Procedures CRUD ---
  @Get('procedures/list')
  async listAdminProcedures(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      category: query.category || 'ALL',
    };
    return firstValueFrom(this.documentService.ListProcedures(req)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('procedures/:id')
  async getAdminProcedure(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetProcedure({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('procedures')
  async createAdminProcedure(@Body() body: any) {
    return firstValueFrom(this.documentService.CreateProcedure(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Put('procedures/:id')
  async updateAdminProcedure(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(
          this.documentService.UpdateProcedure({ id, ...body }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Delete('procedures/:id')
  async deleteAdminProcedure(@Param('id') id: string) {
    return firstValueFrom(this.documentService.DeleteProcedure({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  // --- One-Stop Dossiers CRUD ---
  @Get('dossiers/list')
  async listAdminDossiers(@Query() query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      status: query.status || '',
    };
    return firstValueFrom(this.documentService.ListDossiers(req)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get('dossiers/:id')
  async getAdminDossier(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetDossier({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('dossiers')
  async createAdminDossier(@Body() body: any) {
    return firstValueFrom(this.documentService.CreateDossier(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Put('dossiers/:id')
  async updateAdminDossier(@Param('id') id: string, @Body() body: any) {
    return firstValueFrom(this.documentService.UpdateDossier({ id, ...body })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Delete('dossiers/:id')
  async deleteAdminDossier(@Param('id') id: string) {
    return firstValueFrom(this.documentService.DeleteDossier({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  // --- Cabinet ---
  @Get('cabinet')
  async listCabinetFiles(
    @Req() req: any,
    @Query('userId') userId: string,
    @Query('orgId') orgId: string,
  ) {
    // Ưu tiên userId từ JWT token, không để client tự truyền userId
    const finalUserId = req.user?.id ? String(req.user.id) : userId || '';
    return firstValueFrom(
          this.cabinetService.ListFiles({
            userId: finalUserId,
            orgId: orgId || '',
          }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('cabinet')
  async addCabinetFile(@Req() req: any, @Body() body: any) {
    // Luôn lấy userId từ JWT token, bỏ qua giá trị client có thể gửi
    body.userId = req.user?.id ? String(req.user.id) : '';
    return firstValueFrom(this.cabinetService.AddFile(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Delete('cabinet/:id')
  async deleteCabinetFile(@Param('id') id: string) {
    return firstValueFrom(this.cabinetService.DeleteFile({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  // --- Components ---
  @Get('dossiers/:id/components')
  async getComponents(@Param('id') id: string) {
    return firstValueFrom(this.dossierService.GetComponents({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Put('dossiers/components/:compId')
  async updateComponent(@Param('compId') id: string, @Body() body: any) {
    return firstValueFrom(this.dossierService.UpdateComponent({ id, ...body })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('dossiers/from-template')
  async createDossierFromTemplate(
    @Body() body: { procedureId: string; senderName: string },
  ) {
    return firstValueFrom(this.dossierService.CreateDossierFromTemplate(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('dossiers/create-blank')
  async createBlankDossier(
    @Body() body: { procedureName: string; senderName: string },
  ) {
    return firstValueFrom(this.dossierService.CreateBlankDossier(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('dossiers/:id/components')
  async addComponentFromCabinet(
    @Param('id') dossierId: string,
    @Body() body: { name: string; fileUrl: string },
  ) {
    return firstValueFrom(
          this.dossierService.AddComponentFromCabinet({ dossierId, ...body }),
        ).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetDocument({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post()
  async createDocument(@Req() req: any, @Body() body: any) {
    console.log('body', body);
    // Inject thông tin người tạo từ JWT token
    body.userId = req.user?.id ? String(req.user.id) : undefined;
    body.userName = req.user?.fullname || req.user?.username || undefined;
    return firstValueFrom(this.documentService.CreateDocument(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Put(':id')
  async updateDocument(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    // Inject thông tin người cập nhật từ JWT token
    const payload = {
      id,
      ...body,
      userId: req.user?.id ? String(req.user.id) : undefined,
      userName: req.user?.fullname || req.user?.username || undefined,
    };
    return firstValueFrom(this.documentService.UpdateDocument(payload)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('extract')
  async extractMetadata(@Body() body: { fileId: string }) {
    return firstValueFrom(this.documentService.ExtractMetadata(body)).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Post('sync')
  async syncOnline() {
    return firstValueFrom(this.documentService.SyncOnline({})).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Get(':id/logs')
  async getDocumentLogs(@Param('id') id: string) {
    return firstValueFrom(this.documentService.GetLogs({ documentId: id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return firstValueFrom(this.documentService.DeleteDocument({ id })).catch(e => { console.error('RPC Call Failed', e.message); return null; });
  }
}
