import { Module } from '@nestjs/common';
import { OrganizationClientService } from './organization-client.service';

/**
 * OrganizationClientModule
 *
 * Module đơn giản — không dùng ClientsModule của NestJS (tránh circular dep trong NestJS 11).
 * Kết nối gRPC tới user-service được quản lý trực tiếp bên trong OrganizationClientService
 * thông qua @grpc/grpc-js native API.
 */
@Module({
  providers: [OrganizationClientService],
  exports: [OrganizationClientService],
})
export class OrganizationClientModule { }
