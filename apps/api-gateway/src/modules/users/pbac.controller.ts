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
  InternalServerErrorException,
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

@ApiTags('PBAC – Chính sách phân quyền')
@Controller('admin/policys')
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
  @ApiOperation({ summary: 'Lấy danh sách nhóm quyền' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhóm quyền (cả số người dùng, số chính sách)',
  })
  async findAll() {
    return firstValueFrom(this.pbacService.FindAllUserGroups({})).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Chi tiết một nhóm quyền (kèm danh sách chính sách)',
  })
  @ApiResponse({
    status: 200,
    description: 'Nhóm quyền và danh sách chính sách',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.FindOneUserGroup({ id })).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Post()
  @ApiOperation({ summary: 'Tạo nhóm quyền mới' })
  @ApiResponse({ status: 201, description: 'Nhóm quyền vừa được tạo' })
  async create(
    @Body()
    body: {
      name: string;
      description?: string;
      policies?: {
        resourceId: number;
        action: string;
        effect?: string;
        conditions?: string;
      }[];
    },
  ) {
    return firstValueFrom(
      this.pbacService.CreateUserGroup({
        name: body.name,
        description: body.description,
        policies: body.policies,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật nhóm quyền' })
  @ApiResponse({
    status: 200,
    description: 'Nhóm quyền sau khi cập nhật',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      name?: string;
      description?: string;
      policies?: {
        resourceId: number;
        action: string;
        effect?: string;
        conditions?: string;
      }[];
    },
  ) {
    return firstValueFrom(
      this.pbacService.UpdateUserGroup({
        id,
        name: body.name,
        description: body.description,
        policies: body.policies,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xoá nhóm quyền',
  })
  @ApiResponse({ status: 200, description: 'Đã xoá' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.pbacService.DeleteUserGroup({ id })).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
  }
}
