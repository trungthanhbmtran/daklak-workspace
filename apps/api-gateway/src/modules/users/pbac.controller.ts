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

@ApiTags('PBAC ‚Äì Ch√≠nh s√°ch ph√¢n quy·ªÅn')
@Controller('admin/roles')
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'L?y danh s·ch vai trÚ' })
  @ApiResponse({
    status: 200,
    description: 'Danh s·ch vai trÚ (cÛ s? ngu?i d˘ng, s? quy?n)',
  })
  async findAll() {
    return firstValueFrom(this.pbacService.FindAllRoles({}));
  }

  @Get('permissions/matrix')
  @ApiOperation({
    summary: 'Ma tr?n quy?n (T‡i nguyÍn ? Quy?n) ph?c v? giao di?n c?p quy?n',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh s·ch t‡i nguyÍn, m?i t‡i nguyÍn ch?a danh s·ch quy?n tuong ?ng',
  })
  getPermissionMatrix() {
    return firstValueFrom(this.pbacService.GetPermissionMatrix({}));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi ti?t m?t vai trÚ (kËm danh s·ch quy?n)',
  })
  @ApiResponse({
    status: 200,
    description: 'Vai trÚ v‡ danh s·ch quy?n',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.FindOneRole({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'T?o vai trÚ m?i' })
  @ApiResponse({ status: 201, description: 'Vai trÚ v?a du?c t?o (camelCase)' })
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
  @ApiOperation({ summary: 'C?p nh?t vai trÚ' })
  @ApiResponse({
    status: 200,
    description: 'Vai trÚ sau khi c?p nh?t (camelCase)',
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
  @ApiOperation({
    summary: 'xo· vai trÚ (khÙng xo· du?c khi cÛ user du?c g·n)',
  })
  @ApiResponse({ status: 200, description: '–„ xo·' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteRole({ id }));
  }
}

