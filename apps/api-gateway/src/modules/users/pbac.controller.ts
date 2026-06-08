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
  ) {}

  onModuleInit() {
    this.pbacService = this.client.getService(MICROSERVICES.PBAC.SERVICE);
  }

  @Get()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Láº¥y danh sÃ¡ch vai trÃ²' })
  @ApiResponse({
    status: 200,
    description: 'Danh sÃ¡ch vai trÃ² (cÃ³ sá»‘ user, sá»‘ quyá»n)',
  })
  async findAll() {
    return firstValueFrom(this.pbacService.FindAllRoles({}));
  }

  @Get('permissions/matrix')
  @RequirePermissions('ROLE:READ')
  @ApiOperation({
    summary: 'Ma tráº­n quyá»n (Resource -> Permissions) cho UI cáº¥p quyá»n',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sÃ¡ch Resource, má»—i resource cÃ³ danh sÃ¡ch Permission',
  })
  getPermissionMatrix() {
    return firstValueFrom(this.pbacService.GetPermissionMatrix({}));
  }

  @Get(':id')
  @RequirePermissions('ROLE:READ')
  @ApiOperation({ summary: 'Chi tiáº¿t má»™t vai trÃ² (kÃ¨m danh sÃ¡ch quyá»n)' })
  @ApiResponse({ status: 200, description: 'Vai trÃ² vÃ  danh sÃ¡ch permission' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.FindOneRole({ id }));
  }

  @Post()
  @RequirePermissions('')
  @ApiOperation({ summary: 'Táº¡o vai trÃ² má»›i' })
  @ApiResponse({ status: 201, description: 'Vai trÃ² vá»«a táº¡o (camelCase)' })
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
  @ApiOperation({ summary: 'Cáº­p nháº­t vai trÃ²' })
  @ApiResponse({
    status: 200,
    description: 'Vai trÃ² sau khi cáº­p nháº­t (camelCase)',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { name?: string; description?: string; permissionIds?: number[] },
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
    summary: 'XÃ³a vai trÃ² (khÃ´ng xÃ³a Ä‘Æ°á»£c náº¿u cÃ²n user Ä‘ang gÃ¡n)',
  })
  @ApiResponse({ status: 200, description: 'ÄÃ£ xÃ³a' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteRole({ id }));
  }
}

