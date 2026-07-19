import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class EmployeesService implements OnModuleInit {
  private userService: any;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_PACKAGE') private readonly userClient: any,
  ) { }

  onModuleInit() {
    this.userService = this.userClient.getService('UserService');
  }

  // ─── Private mapping helper ──────────────────────────────────────────────────

  private toEmployee(
    row: {
      id: number;
      firstname: string;
      lastname: string;
      fullName: string;
      employeeCode: string;
      email: string | null;
      phone: string | null;
      gender: string | null;
      birthday: Date | null;
      identityCard: string | null;
      employmentStatus: string;
      address: string | null;
      avatar: string | null;
      departmentId: number | null;
      jobTitleId: number | null;
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
      fullName: row.fullName,
      employeeCode: row.employeeCode,
      email: row.email ?? '',
      phone: row.phone ?? '',
      gender: row.gender ?? '',
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : '',
      identityCard: row.identityCard ?? '',
      address: row.address ?? '',
      avatar: row.avatar ?? '',
      departmentId: row.departmentId ?? 0,
      jobTitleId: row.jobTitleId ?? 0,
      civilServantRankId: row.civilServantRankId ?? 0,
      partyTitleId: row.partyTitleId ?? 0,
      startDate: row.startDate.toISOString().slice(0, 10),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  // ─── UTILS ───────────────────────────────────────────────────────────────────
  private formatVietnameseName(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  async create(data: {
    firstname: string;
    lastname: string;
    fullName?: string;
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
    employmentStatus?: string;
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
    const formattedFirstname = this.formatVietnameseName(data.firstname);
    const formattedLastname = this.formatVietnameseName(data.lastname);
    const generatedFullName = `${formattedLastname} ${formattedFirstname}`.trim();

    const emp = await this.prisma.employee.create({
      data: {
        firstname: formattedFirstname,
        lastname: formattedLastname,
        fullName: generatedFullName,
        employeeCode: code,
        email: data.email ?? null,
        phone: data.phone ?? null,
        gender: data.gender ?? 'male',
        birthday: data.birthday ? new Date(data.birthday) : null,
        identityCard: data.identityCard ?? null,
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
      fullName: string;
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
      employmentStatus: string;
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
    let updateData: any = {
        ...(data.employeeCode != null && { employeeCode: data.employeeCode }),
        ...(data.email != null && { email: data.email }),
        ...(data.phone != null && { phone: data.phone }),
        ...(data.gender != null && { gender: data.gender }),
        ...(data.birthday != null && { birthday: new Date(data.birthday) }),
        ...(data.identityCard != null && { identityCard: data.identityCard }),
        ...(data.employmentStatus != null && { employmentStatus: data.employmentStatus }),
        ...(data.address != null && { address: data.address }),
        ...(data.avatar != null && { avatar: data.avatar }),
        ...(data.departmentId != null && { departmentId: data.departmentId }),
        ...(data.jobTitleId != null && { jobTitleId: data.jobTitleId }),
        ...(data.civilServantRankId !== undefined && { civilServantRankId: data.civilServantRankId }),
        ...(data.partyTitleId !== undefined && { partyTitleId: data.partyTitleId }),
        ...(data.startDate != null && { startDate: new Date(data.startDate) })
    };

    if (data.firstname != null || data.lastname != null) {
      const current = await this.prisma.employee.findUnique({ where: { id } });
      const newFirstname = this.formatVietnameseName(data.firstname ?? current?.firstname ?? '');
      const newLastname = this.formatVietnameseName(data.lastname ?? current?.lastname ?? '');
      updateData.firstname = newFirstname;
      updateData.lastname = newLastname;
      updateData.fullName = `${newLastname} ${newFirstname}`.trim();
    }
    
    if (data.firstname == null && data.lastname == null && data.fullName != null) {
      updateData.fullName = data.fullName;
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: updateData,
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

  async getByCode(code: string) {
    const emp = await this.prisma.employee.findUnique({ where: { employeeCode: code } });
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
    employmentStatus?: string;
    includeChildren?: boolean;
    assignableOnly?: boolean;
    callerUserId?: number;
    descendantUnitIds?: number[];
    excludeEmployeeCode?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const where: Record<string, unknown> = {};

    if (params.assignableOnly && params.callerUserId) {
      try {
        const subordinatesRes: any = await firstValueFrom(
          this.userService.GetSubordinates({ userId: params.callerUserId })
        );
        const allowedCodes = subordinatesRes?.allowedEmployeeCodes || subordinatesRes?.allowed_employee_codes || [];
        where.employeeCode = { in: allowedCodes };
        
        // Nếu allowedCodes rỗng thì không có ai, trả về luôn [] để tối ưu
        if (allowedCodes.length === 0) {
          return {
            success: true,
            message: 'OK',
            data: [],
            meta: {
              pagination: { total: 0, page, pageSize, totalPages: 1, hasNext: false, hasPrev: false },
              sort: { sortBy: 'id', sortOrder: 'asc' },
              filters: {},
              extra: {},
            },
          };
        }
      } catch (e) {
        console.error('Failed to get subordinates:', e);
        where.employeeCode = { in: [] }; // Fallback an toàn
      }
    }

    if (params.keyword) {
      const kw = params.keyword.trim();
      where.OR = [
        { firstname: { contains: kw } },
        { lastname: { contains: kw } },
        { fullName: { contains: kw } },
        { email: { contains: kw } },
        { employeeCode: { contains: kw } },
        { identityCard: { contains: kw } },
      ];
    }
    // Proto3 gửi mặc định int32 = 0; chỉ lọc khi client thực sự truyền id > 0
    if (params.jobTitleId != null && params.jobTitleId > 0) where.jobTitleId = params.jobTitleId;
    if (params.civilServantRankId != null && params.civilServantRankId > 0) where.civilServantRankId = params.civilServantRankId;
    if (params.partyTitleId != null && params.partyTitleId > 0) where.partyTitleId = params.partyTitleId;
    if (params.employmentStatus) where.employmentStatus = params.employmentStatus;
    
    if (params.descendantUnitIds && params.descendantUnitIds.length > 0) {
      where.departmentId = { in: params.descendantUnitIds };
    } else if (params.departmentId != null && params.departmentId > 0) {
      where.departmentId = params.departmentId;
    }

    if (params.excludeEmployeeCode) {
      if (typeof where.employeeCode === 'object' && where.employeeCode !== null) {
        (where.employeeCode as any).not = params.excludeEmployeeCode;
      } else if (!where.employeeCode) {
        where.employeeCode = { not: params.excludeEmployeeCode };
      }
    }

    const totalCount = await this.prisma.employee.count({ where });
    const skip = (page - 1) * pageSize;

    const items = await this.prisma.employee.findMany({
      where,
      orderBy: [{ id: 'asc' }],
      skip,
      take: pageSize,
    });

    return {
      success: true,
      message: 'OK',
      data: items.map(e => this.toEmployee(e)),
      meta: {
        total: totalCount,
        page,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        sort: { sortBy: 'id', sortOrder: 'asc' },
        filters: params,
        extra: {},
      },
    };
  }
}
