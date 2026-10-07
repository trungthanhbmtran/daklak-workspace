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

@Controller('admin/api-management/connections')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ApiManagementController implements OnModuleInit {
  private grpcService: any;

  constructor(
    private readonly importParserService: ImportParserService,

    @Inject(MICROSERVICES.API_MANAGEMENT.SYMBOL)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.grpcService = this.client.getService('ApiManagementService');
  }

  @Get()
  @RequirePermissions('INTEGRATION:VIEW')
  async listConnections(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    const payload = { search: search || '', limit: +limit, offset: +offset };
    const res = (await firstValueFrom(
      this.grpcService.ListConnections(payload),
    )) as any;
    return { success: true, data: res.data || [], total: res.total || 0 };
  }

  @Get(':id')
  @RequirePermissions('INTEGRATION:VIEW')
  async getConnection(@Param('id') id: string) {
    const res = await firstValueFrom(this.grpcService.GetConnection({ id }));
    return { success: true, data: res };
  }

  @Post()
  @RequirePermissions('INTEGRATION:MANAGE')
  async createConnection(@Body() dto: any) {
    const res = await firstValueFrom(this.grpcService.CreateConnection(dto));
    return { success: true, data: res };
  }

  @Put(':id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async updateConnection(@Param('id') id: string, @Body() dto: any) {
    const res = await firstValueFrom(
      this.grpcService.UpdateConnection({ id, ...dto }),
    );
    return { success: true, data: res };
  }

  @Delete(':id')
  @RequirePermissions('INTEGRATION:MANAGE')
  async deleteConnection(@Param('id') id: string) {
    const res = (await firstValueFrom(
      this.grpcService.DeleteConnection({ id }),
    )) as any;
    return { success: res.success };
  }

  @Put(':id/disable')
  @RequirePermissions('INTEGRATION:MANAGE')
  async disableConnection(
    @Param('id') id: string,
    @Body('expectedVersion') expectedVersion: number,
  ) {
    const res = await firstValueFrom(
      this.grpcService.DisableConnection({ id, expectedVersion }),
    );
    return { success: true, data: res };
  }

  @Post('publish')
  @RequirePermissions('INTEGRATION:MANAGE')
  async publishRevision() {
    const res = await firstValueFrom(this.grpcService.PublishRevision({}));
    return { success: true, data: res };
  }
}
