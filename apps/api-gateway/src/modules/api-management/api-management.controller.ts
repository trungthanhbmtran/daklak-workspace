import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ImportParserService } from './import.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';

@Controller('admin/api-management/connections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApiManagementController implements OnModuleInit {
  private grpcService: any;

  constructor(
    private readonly importParserService: ImportParserService,
    private readonly issuer: TokenIssuerService,

    @Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grpcService = this.client.getService('ApiManagementService');
  }

  private getGrpcMetadata(req: any): Metadata {
    const metadata = new Metadata();
    if (req.user?.id) {
      metadata.add('user-id', req.user.id.toString());
      metadata.set(
        'authorization',
        'Bearer ' +
          this.issuer.signDelegation(req.user, {
            requestId: randomUUID(),
            ipAddress: clientIp(req),
          }),
      );
    }
    return metadata;
  }

  @Get()
  @RequirePermissions('API_GATEWAY:VIEW')
  async listConnections(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const payload = { search: search || '', limit: +limit, offset: +offset };
    const res = (await firstValueFrom(
      this.grpcService.ListConnections(payload, this.getGrpcMetadata(req)),
    )) as any;
    return { data: res.data || [], total: res.total || 0 };
  }

  @Get(':id')
  @RequirePermissions('API_GATEWAY:VIEW')
  async getConnection(@Req() req: any, @Param('id') id: string) {
    const res = await firstValueFrom(
      this.grpcService.GetConnection({ id }, this.getGrpcMetadata(req)),
    );
    return { data: res };
  }

  @Post()
  @RequirePermissions('API_GATEWAY:MANAGE')
  async createConnection(@Req() req: any, @Body() dto: any) {
    const res = await firstValueFrom(
      this.grpcService.CreateConnection(dto, this.getGrpcMetadata(req)),
    );
    return { data: res };
  }

  @Put(':id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async updateConnection(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    const res = await firstValueFrom(
      this.grpcService.UpdateConnection({ id, ...dto }, this.getGrpcMetadata(req)),
    );
    return { data: res };
  }

  @Delete(':id')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async deleteConnection(@Req() req: any, @Param('id') id: string) {
    const res = (await firstValueFrom(
      this.grpcService.DeleteConnection({ id }, this.getGrpcMetadata(req)),
    )) as any;
    return { };
  }

  // Manual endpoint CRUD methods removed

  @Put(':id/disable')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async disableConnection(
    @Req() req: any,
    @Param('id') id: string,
    @Body('expectedVersion') expectedVersion: number,
  ) {
    const res = await firstValueFrom(
      this.grpcService.DisableConnection(
        { id, expectedVersion },
        this.getGrpcMetadata(req),
      ),
    );
    return { data: res };
  }

  @Post(':id/endpoints')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async createEndpoint(@Req() req: any, @Param('id') connectionId: string, @Body() body: any) {
    const res = await firstValueFrom(
      this.grpcService.CreateEndpoint(
        { connectionId, ...body },
        this.getGrpcMetadata(req),
      ),
    );
    return { data: res };
  }

  @Put('endpoints/:endpointId')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async updateEndpoint(@Req() req: any, @Param('endpointId') id: string, @Body() body: any) {
    const res = await firstValueFrom(
      this.grpcService.UpdateEndpoint(
        { id, ...body },
        this.getGrpcMetadata(req),
      ),
    );
    return { data: res };
  }

  @Delete('endpoints/:endpointId')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async deleteEndpoint(@Req() req: any, @Param('endpointId') id: string) {
    const res = await firstValueFrom(
      this.grpcService.DeleteEndpoint(
        { id },
        this.getGrpcMetadata(req),
      ),
    );
    return { data: res };
  }

  @Post('publish')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async publishRevision(@Req() req: any) {
    const res = await firstValueFrom(
      this.grpcService.PublishRevision({}, this.getGrpcMetadata(req)),
    );
    return { data: res };
  }

  @Post('import/upload')
  @RequirePermissions('API_GATEWAY:MANAGE')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImport(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('targetConnectionId') targetConnectionId?: string,
  ) {
    if (!file) throw new BadRequestException('File is required');
    
    const content = file.buffer.toString('utf-8');
    const parsedData = await this.importParserService.parseFileOrText(content, file.originalname);
    
    const res = await firstValueFrom(
      this.grpcService.CreateImportSession(
        { 
          targetConnectionId: targetConnectionId || '',
          systemName: parsedData.systemName,
          baseUrl: parsedData.baseUrl,
          endpoints: parsedData.endpoints.map((endpoint) => ({
            method: endpoint.method,
            path: endpoint.path,
            name: endpoint.name,
            description: endpoint.description,
            metadataJson: JSON.stringify({
              headers: endpoint.headers || [],
              params: endpoint.params || [],
              body: endpoint.body || '',
              bodyType: endpoint.bodyType || 'none',
              formItems: endpoint.formItems || [],
            }),
          })),
        }, 
        this.getGrpcMetadata(req)
      ),
    );
    return { data: res }; 
  }

  @Post('import/commit')
  @RequirePermissions('API_GATEWAY:MANAGE')
  async commitImport(@Req() req: any, @Body() dto: any) {
    const res = await firstValueFrom(
      this.grpcService.CommitImportSession(dto, this.getGrpcMetadata(req)),
    );
    return { data: res };
  }
}
