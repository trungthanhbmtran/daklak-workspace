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
import { DynamicPermissionsGuard } from '../../core/guards/dynamic-permissions.guard';

@ApiTags('PBAC � T�i nguy�n')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard, DynamicPermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class ResourcesController implements OnModuleInit {
  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL)
    private readonly client: any,
  ) { }

  onModuleInit() {
    this.pbacService = this.client.getService(
      MICROSERVICES.PBAC.SERVICE,
    );
  }

  @Post()
  @ApiOperation({ summary: 'T?o t�i nguy�n m?i' })
  @ApiResponse({
    status: 201,
    description: 'T�i nguy�n v?a du?c t?o',
  })
  async createResource(
    @Body() body: { code: string; name: string; serviceCode?: string },
  ) {
    return firstValueFrom(
      this.pbacService.CreateResource({
        code: body.code, name: body.name, serviceCode: body.serviceCode,
      }),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'C?p nh?t t�i nguy�n' })
  @ApiResponse({
    status: 200,
    description: 'T�i nguy�n sau khi c?p nh?t',
  })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string; serviceCode?: string },
  ) {
    return firstValueFrom(
      this.pbacService.UpdateResource({
        id,
        code: body.code, name: body.name, serviceCode: body.serviceCode,
      }),
    );
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'X�a m?t quy?n theo ID' })
  @ApiResponse({
    status: 200,
    description: 'K?t qu? x�a',
  })
  async deletePermission(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return firstValueFrom(
      this.pbacService.DeletePermission({ id }),
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'X�a t�i nguy�n (ch? khi kh�ng c�n quy?n n�o thu?c t�i nguy�n n�y)',
  })
  @ApiResponse({
    status: 200,
    description: 'K?t qu? x�a',
  })
  async deleteResource(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return firstValueFrom(
      this.pbacService.DeleteResource({ id }),
    );
  }

  @Post(':id/permissions')
  @ApiOperation({
    summary: 'Th�m quy?n (action) cho t�i nguy�n',
  })
  @ApiResponse({
    status: 201,
    description: 'Quy?n v?a du?c t?o',
  })
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

