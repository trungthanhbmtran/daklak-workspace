import { Controller } from '@nestjs/common';
import {  GrpcMethod, RpcException , Payload } from '@nestjs/microservices';
import { PortalConfigService } from './portal-config.service';
import { status } from '@grpc/grpc-js';

@Controller()
export class PortalConfigController {
  constructor(private readonly configService: PortalConfigService) { }

  @GrpcMethod('PortalConfigService', 'Create')
  async create(data: { code: string; name: string; description?: string }) {
    try {
      const result = await this.configService.create(data);
      return { data: result, success: true, message: 'Tạo cấu hình thành công' };
    } catch (e: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: e.message || 'Lỗi khi tạo cấu hình',
      });
    }
  }

  @GrpcMethod('PortalConfigService', 'GetByCode')
  async getByCode(data: { code: string }) {
    const result = await this.configService.findOneByCode(data.code);
    if (!result) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Không tìm thấy cấu hình với mã ${data.code}`,
      });
    }
    return { data: result, success: true };
  }

  @GrpcMethod('PortalConfigService', 'GetAll')
  async getAll(@Payload() _data: Record<string, any>) {
    try {
      const result = await this.configService.findAll();
      return { data: result };
    } catch (e: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: e.message || 'Lỗi khi lấy danh sách cấu hình',
      });
    }
  }

  @GrpcMethod('PortalConfigService', 'Update')
  async update(data: { id: number; code?: string; name?: string; description?: string }) {
    try {
      const { id, ...rest } = data;
      const result = await this.configService.update(Number(id), rest);
      return { data: result, success: true, message: 'Cập nhật cấu hình thành công' };
    } catch (e: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: e.message || 'Lỗi khi cập nhật cấu hình',
      });
    }
  }

  @GrpcMethod('PortalConfigService', 'UpsertByCode')
  async upsertByCode(data: { code: string; name: string; description?: string }) {
    try {
      const result = await this.configService.upsertByCode(data.code, {
        name: data.name,
        description: data.description,
      });
      return { data: result, success: true, message: 'Upsert cấu hình thành công' };
    } catch (e: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: e.message || 'Lỗi khi upsert cấu hình',
      });
    }
  }

  /**
   * Batch upsert nhiều config trong 1 gRPC call — client không cần gọi N lần.
   */
  @GrpcMethod('PortalConfigService', 'BatchUpsert')
  async batchUpsert(payload: { data: { code: string; name: string; description?: string }[] }) {
    try {
      const result = await this.configService.batchUpsert(payload.data || []);
      return { data: result, success: true, message: `Đã lưu ${result.count} cấu hình` };
    } catch (e: any) {
      throw new RpcException({
        code: status.INTERNAL,
        message: e.message || 'Lỗi khi batch upsert cấu hình',
      });
    }
  }
}
