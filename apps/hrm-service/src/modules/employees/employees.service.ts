import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) { }

  // ─── Private mapping helper ──────────────────────────────────────────────────

  private toEmployee(
    row: {
      id: number;
      firstname: string;
      lastname: string;
      employeeCode: string;
      email: string | null;
      phone: string | null;
      gender: string | null;
      birthday: Date | null;
      identityCard: string | null;
      status: string;
      address: string | null;
      avatar: string | null;
      departmentId: number;
      jobTitleId: number;
      civilServantRankId?: number | null;
      partyTitleId?: number | null;
      startDate: Date;
      createdAt: Date;
      updatedAt: Date;
    }
  ) {
    return {
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      employeeCode: row.employeeCode,
      email: row.email ?? '',
      phone: row.phone ?? '',
      gender: row.gender ?? '',
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : '',
      identityCard: row.identityCard ?? '',
      status: row.status,
      address: row.address ?? '',
      avatar: row.avatar ?? '',
      departmentId: row.departmentId,
      jobTitleId: row.jobTitleId,
      civilServantRankId: row.civilServantRankId ?? 0,
      partyTitleId: row.partyTitleId ?? 0,
      startDate: row.startDate.toISOString().slice(0, 10),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  async create(data: {
    firstname: string;
    lastname: string;
    employeeCode?: string;
    email?: string;
    phone?: string;
    gender?: string;
    birthday?: string;
    identityCard?: string;
    departmentId: number;
    jobTitleId: number;
    civilServantRankId?: number;
    partyTitleId?: number;
    startDate?: string;
    status?: string;
    address?: string;
    avatar?: string;
  }) {
    const code = (data.employeeCode ?? '').trim() || `E${Date.now()}`;
    const existing = await this.prisma.employee.findUnique({ where: { employeeCode: code } });
    if (existing) throw new RpcException({ message: `Mã nhân viên ${code} đã tồn tại`, code: 6 });
    if (data.email) {
      const ex = await this.prisma.employee.findFirst({ where: { email: data.email } });
      if (ex) throw new RpcException({ message: `Email ${data.email} đã được sử dụng`, code: 6 });
    }
    const emp = await this.prisma.employee.create({
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        employeeCode: code,
        email: data.email ?? null,
        phone: data.phone ?? null,
        gender: data.gender ?? 'male',
        birthday: data.birthday ? new Date(data.birthday) : null,
        identityCard: data.identityCard ?? null,
        status: data.status ?? 'active',
        address: data.address ?? null,
        departmentId: data.departmentId,
        jobTitleId: data.jobTitleId,
        civilServantRankId: data.civilServantRankId ?? null,
        partyTitleId: data.partyTitleId ?? null,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        avatar: data.avatar ?? null,
      },
    });
    return { success: true, message: 'Thêm mới nhân sự thành công', data: this.toEmployee(emp) };
  }

  async update(
    id: number,
    data: Partial<{
      firstname: string;
      lastname: string;
      employeeCode: string;
      startDate: string;
      email: string;
      phone: string;
      gender: string;
      birthday: string;
      identityCard: string;
      departmentId: number;
      jobTitleId: number;
      civilServantRankId: number;
      partyTitleId: number;
      status: string;
      address: string;
      avatar: string;
    }>,
  ) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: 5 });
    if (data.employeeCode && data.employeeCode !== emp.employeeCode) {
      const ex = await this.prisma.employee.findUnique({ where: { employeeCode: data.employeeCode } });
      if (ex) throw new RpcException({ message: `Mã nhân viên ${data.employeeCode} đã tồn tại`, code: 6 });
    }
    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(data.firstname != null && { firstname: data.firstname }),
        ...(data.lastname != null && { lastname: data.lastname }),
        ...(data.employeeCode != null && { employeeCode: data.employeeCode }),
        ...(data.email != null && { email: data.email }),
        ...(data.phone != null && { phone: data.phone }),
        ...(data.gender != null && { gender: data.gender }),
        ...(data.birthday != null && { birthday: new Date(data.birthday) }),
        ...(data.identityCard != null && { identityCard: data.identityCard }),
        ...(data.departmentId != null && { departmentId: data.departmentId }),
        ...(data.jobTitleId != null && { jobTitleId: data.jobTitleId }),
        ...(data.civilServantRankId !== undefined && { civilServantRankId: data.civilServantRankId }),
        ...(data.partyTitleId !== undefined && { partyTitleId: data.partyTitleId }),
        ...(data.status != null && { status: data.status }),
        ...(data.address != null && { address: data.address }),
        ...(data.avatar != null && { avatar: data.avatar }),
        ...(data.startDate != null && { startDate: new Date(data.startDate) }),
      },
    });
    return { success: true, message: 'Cập nhật hồ sơ thành công', data: this.toEmployee(updated) };
  }

  async delete(id: number) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: 5 });
    await this.prisma.employee.delete({ where: { id } });
    return { success: true, message: 'Xóa nhân sự thành công' };
  }

  async getOne(id: number) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: 5 });
    return { success: true, message: 'OK', data: this.toEmployee(emp) };
  }

  async list(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    departmentId?: number;
    jobTitleId?: number;
    civilServantRankId?: number;
    partyTitleId?: number;
    status?: string;
    includeChildren?: boolean;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;
    const where: Record<string, unknown> = {};
    if (params.keyword) {
      const kw = params.keyword.trim();
      where.OR = [
        { firstname: { contains: kw } },
        { lastname: { contains: kw } },
        { email: { contains: kw } },
        { employeeCode: { contains: kw } },
        { identityCard: { contains: kw } },
      ];
    }
    // Proto3 gửi mặc định int32 = 0; chỉ lọc khi client thực sự truyền id > 0
    if (params.jobTitleId != null && params.jobTitleId > 0) where.jobTitleId = params.jobTitleId;
    if (params.civilServantRankId != null && params.civilServantRankId > 0) where.civilServantRankId = params.civilServantRankId;
    if (params.partyTitleId != null && params.partyTitleId > 0) where.partyTitleId = params.partyTitleId;
    if (params.status) where.status = params.status;
    if (params.departmentId != null && params.departmentId > 0) where.departmentId = params.departmentId;

    // Query DB
    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({ where, orderBy: [{ id: 'asc' }], skip, take: pageSize }),
      this.prisma.employee.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);
    return {
      success: true,
      message: 'OK',
      data: items.map((e) => this.toEmployee(e)),
      meta: {
        pagination: { total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
        sort: { sortBy: 'id', sortOrder: 'asc' },
        filters: {},
        extra: {},
      },
    };
  }
}
