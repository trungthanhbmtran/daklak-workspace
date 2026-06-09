import {
  Controller,
  Get,
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

@ApiTags('PBAC â€“ ChÃ­nh sÃ¡ch phÃ¢n quyá»n')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PbacController implements OnModuleInit {
  private pbacService: any;

  constructor(
    @Inject(MICROSERVICES.PBAC.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  @Get()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Lấy danh sách vai trò' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách vai trò (có số người dùng, số quyền)',
  })
  async findAll() {
    return firstValueFrom(this.pbacService.FindAllRoles({}));
  }

  @Get('permissions/matrix')
  @RequirePermissions('ROLE:READ')
  @ApiOperation({
    summary: 'Ma trận quyền (Tài nguyên → Quyền) phục vụ giao diện cấp quyền',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài nguyên, mỗi tài nguyên chứa danh sách quyền tương ứng',
  })
  getPermissionMatrix() {
    return firstValueFrom(this.pbacService.GetPermissionMatrix({}));
  }

  @Get(':id')
  @RequirePermissions('ROLE:READ')
  @ApiOperation({
    summary: 'Chi tiết một vai trò (kèm danh sách quyền)',
  })
  @ApiResponse({
    status: 200,
    description: 'Vai trò và danh sách quyền',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.FindOneRole({ id }));
  }

  @Post()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Tạo vai trò mới' })
  @ApiResponse({ status: 201, description: 'Vai trò vừa được tạo (camelCase)' })
  async create(
    @Body()
    body: {
      code: string;
      name: string;
      description?: string;
      permissionIds?: number[];
    },
  ) {
    return firstValueFrom(
      this.pbacService.CreateRole({
        code: body.code,
        name: body.name,
        description: body.description,
        permissionIds: body.permissionIds,
      }),
    );
  }

  @Put(':id')
  @RequirePermissions('ROLE:MANAGE')
  @ApiOperation({ summary: 'Cập nhật vai trò' })
  @ApiResponse({
    status: 200,
    description: 'Vai trò sau khi cập nhật (camelCase)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      description?: string;
      permissionIds?: number[];
    },
  ) {
    return firstValueFrom(
      this.pbacService.UpdateRole({
        id,
        name: body.name,
        description: body.description,
        permissionIds: body.permissionIds,
      }),
    );
  }

  @Delete(':id')
  @RequirePermissions('ROLE:MANAGE')
  @ApiOperation({
    summary: 'xoá vai trò (không xoá được khi có user được gán)',
  })
  @ApiResponse({ status: 200, description: 'Đã xoá' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteRole({ id }));
  }
}

