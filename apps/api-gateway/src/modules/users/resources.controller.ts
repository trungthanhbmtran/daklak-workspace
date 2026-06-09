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

@ApiTags('PBAC – Tài nguyên')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'T?o tài nguyên m?i' })
  @ApiResponse({
    status: 201,
    description: 'Tài nguyên v?a du?c t?o',
  })
  async createResource(
    @Body() body: { code: string; name: string },
  ) {
    return firstValueFrom(
      this.pbacService.CreateResource({
        code: body.code,
        name: body.name,
      }),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'C?p nh?t tài nguyên' })
  @ApiResponse({
    status: 200,
    description: 'Tài nguyên sau khi c?p nh?t',
  })
  async updateResource(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code?: string; name?: string },
  ) {
    return firstValueFrom(
      this.pbacService.UpdateResource({
        id,
        code: body.code,
        name: body.name,
      }),
    );
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Xóa m?t quy?n theo ID' })
  @ApiResponse({
    status: 200,
    description: 'K?t qu? xóa',
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
      'Xóa tài nguyên (ch? khi không còn quy?n nào thu?c tài nguyên này)',
  })
  @ApiResponse({
    status: 200,
    description: 'K?t qu? xóa',
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
    summary: 'Thêm quy?n (action) cho tài nguyên',
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