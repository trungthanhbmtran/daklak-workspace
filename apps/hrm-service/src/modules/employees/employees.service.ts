import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Prisma } from '@generated/prisma';

export enum EmployeeErrorCode {
  NOT_FOUND = 5,
  CONFLICT = 6,
}

interface UserServiceClient {
  GetSubordinates(req: { userId: number }): unknown; // thay bằng type thực từ .proto nếu có
}

@Injectable()
export class EmployeesService implements OnModuleInit {
  private readonly logger = new Logger(EmployeesService.name);
  private userService: UserServiceClient;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('USER_PACKAGE') private readonly userClient: { getService: (name: string) => UserServiceClient },
  ) { }

  onModuleInit() {
    this.userService = this.userClient.getService('UserService');
  }

  // ─── Private mapping helper ──────────────────────────────────────────────────

  private toEmployee(row: {
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
  }) {
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private parseDateOrThrow(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new RpcException({ message: `${fieldName} không hợp lệ: ${value}`, code: EmployeeErrorCode.CONFLICT });
    }
    return date;
  }

  private generateEmployeeCode(): string {
    // Timestamp đơn thuần dễ trùng khi tạo hàng loạt cùng millisecond.
    // Thêm phần random để giảm rủi ro va chạm; vẫn cần unique constraint ở DB làm lớp bảo vệ cuối.
    return `E${Date.now()}${Math.floor(Math.random() * 1000)}`;
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
    const code = (data.employeeCode ?? '').trim() || this.generateEmployeeCode();

    // Pre-check để trả lỗi thân thiện sớm (UX), nhưng KHÔNG phải lớp bảo vệ duy nhất — xem catch P2002 bên dưới.
    const existing = await this.prisma.employee.findUnique({ where: { employeeCode: code } });
    if (existing) {
      throw new RpcException({ message: `Mã nhân viên ${code} đã tồn tại`, code: EmployeeErrorCode.CONFLICT });
    }
    if (data.email) {
      const ex = await this.prisma.employee.findFirst({ where: { email: data.email } });
      if (ex) {
        throw new RpcException({ message: `Email ${data.email} đã được sử dụng`, code: EmployeeErrorCode.CONFLICT });
      }
    }

    const formattedFirstname = this.formatVietnameseName(data.firstname);
    const formattedLastname = this.formatVietnameseName(data.lastname);
    const generatedFullName = `${formattedLastname} ${formattedFirstname}`.trim();

    try {
      const emp = await this.prisma.employee.create({
        data: {
          firstname: formattedFirstname,
          lastname: formattedLastname,
          fullName: generatedFullName,
          employeeCode: code,
          email: data.email ?? null,
          phone: data.phone ?? null,
          gender: data.gender ?? 'male',
          birthday: data.birthday ? this.parseDateOrThrow(data.birthday, 'birthday') : null,
          identityCard: data.identityCard ?? null,
          address: data.address ?? null,
          departmentId: data.departmentId,
          jobTitleId: data.jobTitleId,
          civilServantRankId: data.civilServantRankId ?? null,
          partyTitleId: data.partyTitleId ?? null,
          startDate: data.startDate ? this.parseDateOrThrow(data.startDate, 'startDate') : new Date(),
          avatar: data.avatar ?? null,
        },
      });
      return { success: true, message: 'Thêm mới nhân sự thành công', data: this.toEmployee(emp) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Bắt race condition: request khác vừa insert cùng employeeCode/email giữa lúc pre-check và create.
        const target = (error.meta?.target as string[])?.join(', ') ?? 'employeeCode/email';
        throw new RpcException({ message: `Dữ liệu bị trùng (${target})`, code: EmployeeErrorCode.CONFLICT });
      }
      this.logger.error('Failed to create employee', error instanceof Error ? error.stack : String(error));
      throw error;
    }
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
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: EmployeeErrorCode.NOT_FOUND });

    if (data.employeeCode && data.employeeCode !== emp.employeeCode) {
      const ex = await this.prisma.employee.findUnique({ where: { employeeCode: data.employeeCode } });
      if (ex) {
        throw new RpcException({
          message: `Mã nhân viên ${data.employeeCode} đã tồn tại`,
          code: EmployeeErrorCode.CONFLICT,
        });
      }
    }

    const updateData: Prisma.EmployeeUpdateInput = {
      ...(data.employeeCode != null && { employeeCode: data.employeeCode }),
      ...(data.email != null && { email: data.email }),
      ...(data.phone != null && { phone: data.phone }),
      ...(data.gender != null && { gender: data.gender }),
      ...(data.birthday != null && { birthday: this.parseDateOrThrow(data.birthday, 'birthday') }),
      ...(data.identityCard != null && { identityCard: data.identityCard }),
      ...(data.employmentStatus != null && { employmentStatus: data.employmentStatus }),
      ...(data.address != null && { address: data.address }),
      ...(data.avatar != null && { avatar: data.avatar }),
      ...(data.departmentId != null && { department: { connect: { id: data.departmentId } } }),
      ...(data.jobTitleId != null && { jobTitle: { connect: { id: data.jobTitleId } } }),
      ...(data.civilServantRankId !== undefined && { civilServantRankId: data.civilServantRankId }),
      ...(data.partyTitleId !== undefined && { partyTitleId: data.partyTitleId }),
      ...(data.startDate != null && { startDate: this.parseDateOrThrow(data.startDate, 'startDate') }),
    };

    // Dùng lại `emp` đã fetch ở trên thay vì query lại DB lần 2.
    if (data.firstname != null || data.lastname != null) {
      const newFirstname = this.formatVietnameseName(data.firstname ?? emp.firstname);
      const newLastname = this.formatVietnameseName(data.lastname ?? emp.lastname);
      updateData.firstname = newFirstname;
      updateData.lastname = newLastname;
      updateData.fullName = `${newLastname} ${newFirstname}`.trim();
    } else if (data.fullName != null) {
      // Format luôn cho nhất quán với nhánh trên.
      updateData.fullName = this.formatVietnameseName(data.fullName);
    }

    try {
      const updated = await this.prisma.employee.update({ where: { id }, data: updateData });
      return { success: true, message: 'Cập nhật hồ sơ thành công', data: this.toEmployee(updated) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = (error.meta?.target as string[])?.join(', ') ?? 'employeeCode/email';
        throw new RpcException({ message: `Dữ liệu bị trùng (${target})`, code: EmployeeErrorCode.CONFLICT });
      }
      this.logger.error(`Failed to update employee id=${id}`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async delete(id: number) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: EmployeeErrorCode.NOT_FOUND });

    try {
      await this.prisma.employee.delete({ where: { id } });
      return { success: true, message: 'Xóa nhân sự thành công' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        // Vi phạm khóa ngoại: nhân viên đang được tham chiếu ở bảng khác (task, assignment...).
        throw new RpcException({
          message: 'Không thể xóa nhân viên đang được gán trong dữ liệu khác. Hãy chuyển sang trạng thái nghỉ việc.',
          code: EmployeeErrorCode.CONFLICT,
        });
      }
      this.logger.error(`Failed to delete employee id=${id}`, error instanceof Error ? error.stack : String(error));
      throw error;
    }
  }

  async getOne(id: number) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: EmployeeErrorCode.NOT_FOUND });
    return { success: true, message: 'OK', data: this.toEmployee(emp) };
  }

  async getByCode(code: string) {
    const emp = await this.prisma.employee.findUnique({ where: { employeeCode: code } });
    if (!emp) throw new RpcException({ message: 'Không tìm thấy nhân viên', code: EmployeeErrorCode.NOT_FOUND });
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
    ids?: number[];
    codes?: string[];
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const where: Prisma.EmployeeWhereInput = {};

    // Gom các điều kiện lọc theo employeeCode, giao (intersect) thay vì để nhánh sau ghi đè nhánh trước.
    let allowedCodesFromCodesParam: string[] | null = null;
    if (params.codes && params.codes.length > 0) {
      allowedCodesFromCodesParam = params.codes;
    }

    let allowedCodesFromAssignable: string[] | null = null;
    if (params.assignableOnly && params.callerUserId) {
      try {
        const subordinatesRes: { allowedEmployeeCodes?: string[]; allowed_employee_codes?: string[] } =
          await firstValueFrom(this.userService.GetSubordinates({ userId: params.callerUserId }) as any);
        allowedCodesFromAssignable = subordinatesRes?.allowedEmployeeCodes ?? subordinatesRes?.allowed_employee_codes ?? [];
      } catch (error) {
        this.logger.error('Failed to get subordinates', error instanceof Error ? error.stack : String(error));
        allowedCodesFromAssignable = []; // Fallback an toàn: không lộ dữ liệu ngoài phạm vi cho phép
      }
    }

    if (allowedCodesFromCodesParam && allowedCodesFromAssignable) {
      const intersection = allowedCodesFromCodesParam.filter((c) => allowedCodesFromAssignable!.includes(c));
      where.employeeCode = { in: intersection };
    } else if (allowedCodesFromAssignable) {
      where.employeeCode = { in: allowedCodesFromAssignable };
      if (allowedCodesFromAssignable.length === 0) {
        return {
          success: true,
          message: 'OK',
          data: [],
          meta: { total: 0, skip: (page - 1) * pageSize, take: pageSize },
        };
      }
    } else if (allowedCodesFromCodesParam) {
      where.employeeCode = { in: allowedCodesFromCodesParam };
    }

    if (params.keyword) {
      const kw = params.keyword.trim();
      // MySQL: collation mặc định (*_ci) đã case-insensitive sẵn, không cần "mode".
      // Nếu cột nào dùng collation *_bin thì cần ALTER COLLATION ở DB, không xử lý ở code.
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
      const current = where.employeeCode as Prisma.StringFilter | undefined;
      where.employeeCode = { ...current, not: params.excludeEmployeeCode };
    }

    if (params.ids && params.ids.length > 0) {
      where.id = { in: params.ids };
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
      data: items.map((e) => this.toEmployee(e)),
      meta: { total: totalCount, skip, take: pageSize },
    };
  }
}