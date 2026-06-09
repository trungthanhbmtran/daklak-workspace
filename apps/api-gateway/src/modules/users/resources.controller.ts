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

@ApiTags('PBAC – Tài nguyên')
@Controller('admin/resources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
  @RequirePermissions('')
  @ApiOperation({ summary: 'Tạo tài nguyên mới' })
  @ApiResponse({
    status: 201,
    description: 'Tài nguyên vừa được tạo',
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
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({ summary: 'Cập nhật tài nguyên' })
  @ApiResponse({
    status: 200,
    description: 'Tài nguyên sau khi cập nhật',
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
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({ summary: 'Xóa một quyền theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xóa',
  })
  async deletePermission(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return firstValueFrom(
      this.pbacService.DeletePermission({ id }),
    );
  }

  @Delete(':id')
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({
    summary:
      'Xóa tài nguyên (chỉ khi không còn quyền nào thuộc tài nguyên này)',
  })
  @ApiResponse({
    status: 200,
    description: 'Kết quả xóa',
  })
  async deleteResource(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return firstValueFrom(
      this.pbacService.DeleteResource({ id }),
    );
  }

  @Post(':id/permissions')
  @RequirePermissions('RESOURCE:MANAGE')
  @ApiOperation({
    summary: 'Thêm quyền (action) cho tài nguyên',
  })
  @ApiResponse({
    status: 201,
    description: 'Quyền vừa được tạo',
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