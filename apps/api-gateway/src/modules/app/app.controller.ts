import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      success: true,
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'API Gateway',
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Thông tin gateway' })
  root() {
    return {
      success: true,
      data: {
        service: 'API Gateway',
        version: '1.0.0',
        status: 'UP',
        message: 'Gateway Service is running',
        endpoints: {
          health: '/v1/health',
          auth: '/v1/admin/auth',
          hrm: '/v1/admin/hrm',
          users: '/v1/admin/users',
          documents: '/v1/admin/documents',
        },
      },
    };
  }
}
