import {
  Injectable,
  Inject,
  OnModuleInit,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class PositionService implements OnModuleInit {
  private orgService: any;

  constructor(
    @Inject(MICROSERVICES.ORGANIZATION.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.orgService = this.client.getService(MICROSERVICES.ORGANIZATION.SERVICE);
  }

  async list(query: any) {
    const departmentId = query.departmentId ?? query.department_id;
    const unitId =
      departmentId != null ? parseInt(String(departmentId), 10) : undefined;
    if (unitId == null || Number.isNaN(unitId)) {
      return [];
    }
    const res = await firstValueFrom(
      this.orgService.GetStaffingReport({ unitId }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
    const items = (res as any).data ?? [];
    return items;
  }

  async getDetail(id: number) {
    throw new NotFoundException(
      'Lấy định biên theo id không được hỗ trợ; dùng GET /admin/hrm/positions?departmentId=<unitId>',
    );
  }

  async create(body: any) {
    const unitId =
      body.unitId ?? body.unit_id ?? body.departmentId ?? body.department_id;
    const jobTitleId = body.jobTitleId ?? body.job_title_id;
    const quantity = body.quantity ?? body.quota ?? 1;
    if (!unitId || !jobTitleId) {
      throw new NotFoundException('unitId và jobTitleId là bắt buộc');
    }
    return firstValueFrom(
      this.orgService.SetStaffing({
        unitId: parseInt(String(unitId), 10),
        jobTitleId: parseInt(String(jobTitleId), 10),
        quantity: parseInt(String(quantity), 10) || 1,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async update(id: number, body: any) {
    const unitId = body.unitId ?? body.unit_id ?? body.departmentId;
    const jobTitleId = body.jobTitleId ?? body.job_title_id;
    const quantity = body.quantity ?? body.quota;
    if (unitId == null || jobTitleId == null) {
      throw new NotFoundException(
        'unitId và jobTitleId là bắt buộc để cập nhật định biên',
      );
    }
    return firstValueFrom(
      this.orgService.SetStaffing({
        unitId: parseInt(String(unitId), 10),
        jobTitleId: parseInt(String(jobTitleId), 10),
        quantity: parseInt(String(quantity), 10) || 1,
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async delete() {
    throw new NotImplementedException(
      'Xóa định biên: dùng API admin/organizations/staffing hoặc set quantity = 0',
    );
  }
}
