import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  UseGuards,
  OnModuleInit,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RequirePermissions } from '../../core/decorators/permissions.decorator';

@ApiTags('PBAC â€“ TÃ i nguyÃªn')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ResourcesController implements OnModuleInit {
  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  @Post()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Táº¡o tÃ i nguyÃªn má»›i' })
  @ApiResponse({ status: 201, description: 'TÃ i nguyÃªn vá»«a táº¡o' })
  async createResource(@Body() body: { code: string; name: string }) {
    return firstValueFrom(
      this.pbacService.CreateResource({ code: body.code, name: body.name }),
    );
  }

  @Put(':id')
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({ summary: 'Cáº­p nháº­t tÃ i nguyÃªn' })
  @ApiResponse({ status: 200, description: 'TÃ i nguyÃªn sau khi cáº­p nháº­t' })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string },
  ) {
    return firstValueFrom(
      this.pbacService.UpdateResource({ id, code: body.code, name: body.name }),
    );
  }

  @Delete('permissions/:id')
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({ summary: 'XÃ³a má»™t quyá»n theo id' })
  @ApiResponse({ status: 200, description: 'Káº¿t quáº£ xÃ³a' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeletePermission({ id }));
  }

  @Delete(':id')
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({
    summary: 'XÃ³a tÃ i nguyÃªn (chá»‰ khi khÃ´ng cÃ²n permission nÃ o)',
  })
  @ApiResponse({ status: 200, description: 'Káº¿t quáº£ xÃ³a' })
  async deleteResource(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteResource({ id }));
  }

  @Post(':id/permissions')
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({ summary: 'ThÃªm quyá»n (action) cho tÃ i nguyÃªn' })
  @ApiResponse({ status: 201, description: 'Permission vá»«a táº¡o' })
  async createPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { action: string },
  ) {
    return firstValueFrom(
      this.pbacService.CreatePermission({
        resourceId: id,
        action: body.action,
      }),
    );
  }
}

