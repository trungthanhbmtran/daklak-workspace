import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('admin/notifications')
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Danh sách thông báo in-app cho user đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Mảng thông báo (id, title, body, createdAt, read)',
  })
  list(@Req() req: { user?: { id?: string | number; employeeCode?: string; email?: string } }) {
    const userId = req.user?.id ?? 0;
    const employeeCode = req.user?.employeeCode;
    const email = req.user?.email;
    return this.notificationsService.listByUserOrEmployeeCode(
      userId,
      employeeCode,
      email,
    );
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  @ApiResponse({ status: 200, description: 'success' })
  markRead(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string | number; employeeCode?: string; email?: string } },
  ) {
    const userId = req.user?.id ?? 0;
    const employeeCode = req.user?.employeeCode;
    const email = req.user?.email;
    const ok = this.notificationsService.markRead(id, userId, employeeCode, email);
    return { success: ok };
  }

  @EventPattern('send_inapp_notification')
  async handleInAppNotification(@Payload() data: any) {
    if (!data.recipients || !data.recipients.length) return;
    for (const recipient of data.recipients) {
      this.notificationsService.push(recipient, data.title, data.message || data.body, data.metadata);
    }
  }
}
