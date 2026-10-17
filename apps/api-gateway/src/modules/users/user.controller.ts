import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách user' })
  @ApiResponse({
    status: 200,
    description:
      'Mảng user (id, email, username, fullName, phoneNumber, avatarUrl, isActive)',
  })
  async list(
    @Req() req: any,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.list(
      req.user,
      pageStr,
      limitStr,
      search,
      this.getGrpcMetadata(req),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user theo ID' })
  @ApiResponse({
    status: 200,
    description:
      'id, email, username, fullName, phoneNumber, avatarUrl, isActive (camelCase)',
  })
  async getDetail(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.userService.getDetail(id, this.getGrpcMetadata(req));
  }

  @Get(':id/policies')
  @ApiOperation({ summary: 'Chính sách hiệu lực của user (lazy load)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách policies từ tất cả roles của user',
  })
  async getUserPolicies(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.getUserPolicies(id, this.getGrpcMetadata(req));
  }

  @Post()
  @ApiOperation({
    summary:
      'Tạo user (email, username, password, fullName, phoneNumber, cccd, employeeCode từ HRM)',
  })
  @ApiResponse({
    status: 201,
    description:
      'id, email, username, fullName, phoneNumber, cccd, employeeCode, ...',
  })
  async create(
    @Req() req: any,
    @Body()
    body: {
      email: string;
      username?: string;
      password?: string;
      fullName?: string;
      phoneNumber?: string;

      cccd?: string;
      employeeCode?: string;
    },
  ) {
    return this.userService.create(req.user, body, this.getGrpcMetadata(req));
  }

  @Post(':id/assign-position')
  @ApiOperation({ summary: 'Bổ nhiệm chức vụ cho user (đơn vị + chức danh)' })
  @ApiResponse({ status: 200, description: 'Thông tin bổ nhiệm (camelCase)' })
  async assignPosition(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { unitId: number; jobTitleId: number; isPrimary?: boolean },
  ) {
    return this.userService.assignPosition(id, body, this.getGrpcMetadata(req));
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Khóa hoặc mở tài khoản (isActive: true/false)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async setActive(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.userService.setActive(
      id,
      body.isActive,
      this.getGrpcMetadata(req),
    );
  }

  @Post(':id/assign-user-groups')
  @ApiOperation({ summary: 'Gán nhóm quyền (PBAC User Groups) cho user' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async assignUserGroups(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userGroupIds: number[] },
  ) {
    return this.userService.assignUserGroups(
      id,
      body.userGroupIds,
      this.getGrpcMetadata(req),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật user' })
  @ApiResponse({ status: 200 })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.userService.update(id, body, this.getGrpcMetadata(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user' })
  @ApiResponse({ status: 200 })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.userService.delete(id, this.getGrpcMetadata(req));
  }
}
