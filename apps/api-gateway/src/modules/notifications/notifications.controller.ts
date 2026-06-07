import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo in-app cho user đăng nhập' })
  @ApiResponse({
    status: 200,
    description: 'Mảng thông báo (id, title, body, createdAt, read)',
  })
  list(@Req() req: { user?: { id?: string | number; employeeCode?: string } }) {
    const userId = req.user?.id ?? 0;
    const employeeCode = req.user?.employeeCode;
    return this.notificationsService.listByUserOrEmployeeCode(
      userId,
      employeeCode,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu đã đọc' })
  @ApiResponse({ status: 200, description: 'success' })
  markRead(
    @Param('id') id: string,
    @Req() req: { user?: { id?: string | number; employeeCode?: string } },
  ) {
    const userId = req.user?.id ?? 0;
    const employeeCode = req.user?.employeeCode;
    const ok = this.notificationsService.markRead(id, userId, employeeCode);
    return { success: ok };
  }
}
