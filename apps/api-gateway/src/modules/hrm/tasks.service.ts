import {
  Injectable,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  GatewayTimeoutException,
} from '@nestjs/common';
import { executeGrpcCall } from '../../core/utils/grpc-call.util';
import { MICROSERVICES } from '../../core/constants/services';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { randomUUID } from 'crypto';
import { Metadata } from '@grpc/grpc-js';
import { normalizeTask } from '../../common/utils/language-normalization.util';
import { EmployeeService } from './employee.service';

@Injectable()
export class TasksService implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    if (e instanceof GatewayTimeoutException || e?.name === 'GatewayTimeoutException' || e?.status === 504) {
      throw e;
    }
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    if (typeof message === 'string') {
      if (message.toLowerCase().includes('không có quyền')) throw new ForbiddenException(message);
      if (message.toLowerCase().includes('không tồn tại')) throw new NotFoundException(message);
    }
    throw new InternalServerErrorException(message);
  }

  private taskService: any;
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    private readonly issuer: TokenIssuerService,
    private readonly employeeService: EmployeeService,
  ) {}

  onModuleInit() {
    this.taskService = this.client.getService(MICROSERVICES.TASK.SERVICE);
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
  }

  getGrpcMetadata(req: any) {
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

  // ── High Performance In-Memory User Directory Cache ──
  private userCacheMap = new Map<string, any>();
  private userCacheExpiresAt = 0;
  private readonly USER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes TTL

  async populateUsers(tasks: any[], req?: any) {
    if (!tasks || tasks.length === 0) return tasks;

    const empCodes = new Set<string>();
    const userIds = new Set<number>();

    const collectCodes = (task: any) => {
      if (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') {
        empCodes.add(task.assigneeCode);
        const parsed = parseInt(task.assigneeCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (task.assignerCode) {
        empCodes.add(task.assignerCode);
        const parsed = parseInt(task.assignerCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (task.supervisorCode) {
        empCodes.add(task.supervisorCode);
        const parsed = parseInt(task.supervisorCode, 10);
        if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
      }
      if (task.coassigneeCodes) {
        task.coassigneeCodes.forEach((code: string) => {
          if (code) {
            empCodes.add(code);
            const parsed = parseInt(code, 10);
            if (!isNaN(parsed) && parsed > 0) userIds.add(parsed);
          }
        });
      }
      if (task.children) task.children.forEach(collectCodes);
    };
    tasks.forEach(collectCodes);

    if (empCodes.size === 0 && userIds.size === 0) return tasks;

    const now = Date.now();
    // Chỉ fetch từ user-service khi cache trống hoặc hết hạn TTL 10 phút
    if (this.userCacheMap.size === 0 || now > this.userCacheExpiresAt) {
      try {
        const usersRes: any = await executeGrpcCall(
          this.userService.ListUsers(
            { take: 500 },
            req ? this.getGrpcMetadata(req) : undefined,
          ),
          8000,
          'TasksService.populateUsers',
        );
        const users = usersRes?.data || [];
        const newMap = new Map<string, any>();
        users.forEach((u: any) => {
          if (u.employeeCode) {
            newMap.set(u.employeeCode, u);
          }
          newMap.set(String(u.id), u);
        });
        this.userCacheMap = newMap;
        this.userCacheExpiresAt = now + this.USER_CACHE_TTL;
      } catch (e) {
        // Fallback giữ nguyên cache cũ nếu có lỗi
      }
    }

    const usersMap = this.userCacheMap;

    const mapUsers = (task: any) => {
      if (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') {
        const u = usersMap.get(task.assigneeCode);
        if (u) {
          task.assigneeName = u.fullName || u.username;
          task.assigneeAvatar = u.avatarUrl;
          task.assigneeJobTitle = u.jobTitleName;
          task.assigneeUnitName = u.unitName;
        }
      }
      if (task.assignerCode) {
        const u = usersMap.get(task.assignerCode);
        if (u) task.assignerName = u.fullName || u.username;
      }
      if (task.supervisorCode) {
        const u = usersMap.get(task.supervisorCode);
        if (u) task.supervisorName = u.fullName || u.username;
      }
      if (task.coassigneeCodes && Array.isArray(task.coassigneeCodes)) {
        task.coassigneeNames = task.coassigneeCodes
          .map((code: string) => {
            const u = usersMap.get(code);
            return u ? u.fullName || u.username : code;
          })
          .filter(Boolean);
      }
      if (task.children) task.children.forEach(mapUsers);
    };
    tasks.forEach(mapUsers);

    return tasks;
  }

  translateTaskData(task: any) {
    if (!task) return task;
    return normalizeTask(task);
  }

  // --- Endpoints ---
  async create(req: any, body: any) {
    if (body.dueDate) {
      const selectedDate = new Date(body.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new InternalServerErrorException(
          'Thời gian hạn chót không được trước thời gian giao việc (hiện tại)',
        );
      }
      body.dueDate = new Date(body.dueDate).toISOString();
    }

    if (body.assignee) {
      if (body.assignee.startsWith('DEPT_')) {
        body.departmentId = parseInt(body.assignee.replace('DEPT_', ''), 10);
      } else {
        body.assigneeCode = body.assignee;
      }
      delete body.assignee;
    }

    let coordinatingDepartmentIds: number[] = [];
    if (body.coordinators) {
      const rawCoordinators: string[] = Array.isArray(body.coordinators) ? body.coordinators : [];
      const deptIds: number[] = [];
      const empCodes: string[] = [];
      for (const c of rawCoordinators) {
        if (typeof c === 'string' && c.startsWith('DEPT_')) {
          const dId = parseInt(c.replace('DEPT_', ''), 10);
          if (!isNaN(dId) && dId > 0 && !deptIds.includes(dId)) {
            deptIds.push(dId);
          }
          empCodes.push(String(c)); // Giữ DEPT_xxx trong coassigneeCodes để hrm-service sinh nhánh phối hợp
        } else if (c) {
          empCodes.push(String(c));
        }
      }
      coordinatingDepartmentIds = deptIds;
      body.coassigneeCodes = empCodes;
      delete body.coordinators;
    }

    if (body.taskType) {
      body.metadata = body.metadata || {};
      body.metadata.taskType = body.taskType;
      if (body.taskType === 'PERIODIC' && body.recurrence) {
        body.metadata.recurrence = body.recurrence;
      }
      delete body.taskType;
      delete body.recurrence;
    }

    if (req.user) {
      const cachedUser = req.user.id ? this.userCacheMap.get(String(req.user.id)) : null;
      const effectiveEmpCode = req.user.employeeCode || cachedUser?.employeeCode;
      body.assignerCode = effectiveEmpCode || req.user.employeeCode || req.user.username;
      body.currentEmployeeCode = effectiveEmpCode || req.user.employeeCode;
      body.currentUserId = req.user.id ? parseInt(req.user.id, 10) : undefined;
      body.currentUserPermissions = req.user.permissionsFlatten || [];
    }

    if (body.supervisor) {
      body.supervisorCode = body.supervisor;
      delete body.supervisor;
    }

    // Server auto-balance percentage logic
    const coorCount = (body.coassigneeCodes || body.coordinators || []).length;
    if (coorCount > 0) {
      if (
        body.assigneePercentage === undefined ||
        !body.coassigneePercentages ||
        body.coassigneePercentages.length === 0 ||
        body.coassigneePercentages.every((p: number) => p === 0)
      ) {
        const coorPct = Math.max(5, Math.floor(30 / coorCount));
        body.assigneePercentage = 100 - coorPct * coorCount;
        body.coassigneePercentages = (body.coassigneeCodes || body.coordinators).map(() => coorPct);
      }
    } else {
      body.assigneePercentage = 100;
    }

    if (body.baseScore !== undefined) {
      body.baseScore = typeof body.baseScore === 'number' ? body.baseScore : parseFloat(body.baseScore) || 0;
    }
    if (body.weight !== undefined) {
      body.weight = typeof body.weight === 'number' ? body.weight : parseFloat(body.weight) || 0;
    }
    if (body.assigneePercentage !== undefined) {
      body.assigneePercentage = typeof body.assigneePercentage === 'number' ? body.assigneePercentage : parseFloat(body.assigneePercentage) || 100;
    }
    if (body.coassigneePercentages && typeof body.coassigneePercentages === 'object' && !Array.isArray(body.coassigneePercentages)) {
      const codes = body.coassigneeCodes || [];
      body.coassigneePercentages = codes.map((c: string) => Number(body.coassigneePercentages[c]) || 0);
    } else if (Array.isArray(body.coassigneePercentages)) {
      body.coassigneePercentages = body.coassigneePercentages.map((p: any) => Number(p) || 0);
    }

    const metadataObj = {
      ...(body.metadata || {}),
      ...(coordinatingDepartmentIds.length > 0 ? { coordinatingDepartmentIds } : {}),
      ...(body.sourceDocumentRef ? { sourceDocumentRef: body.sourceDocumentRef } : {}),
      ...(body.initialSteps ? { initialSteps: body.initialSteps } : {}),
    };

    // Auto calculate baseScore and difficultyK if priority is provided
    if (body.priority && (!metadataObj.difficultyK || !body.baseScore)) {
      const scoreDefaults: Record<string, { baseScore: number; difficultyK: number }> = {
        LOW: { baseScore: 50, difficultyK: 1 },
        NORMAL: { baseScore: 100, difficultyK: 2 },
        HIGH: { baseScore: 150, difficultyK: 3 },
        URGENT: { baseScore: 200, difficultyK: 4 },
      };
      const def = scoreDefaults[String(body.priority).toUpperCase()] || scoreDefaults.NORMAL;
      if (!body.baseScore) body.baseScore = def.baseScore;
      if (!metadataObj.difficultyK) metadataObj.difficultyK = def.difficultyK;
    }

    body.metadataJson = JSON.stringify(metadataObj);
    body.sourceDocumentRef = body.sourceDocumentRef || '';

    if (!body.supervisorCode) {
      try {
        const resolved = await this.getSupervisorByScope(req, {
          departmentId: body.departmentId,
          assigneeCode: body.assigneeCode,
          domainId: body.domainId,
        });
        if (resolved?.supervisorCode) {
          body.supervisorCode = resolved.supervisorCode;
        }
      } catch {}
    }

    const response: any = await executeGrpcCall(
      this.taskService.CreateTask(body, this.getGrpcMetadata(req)),
      10000,
      'TasksService.CreateTask',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async getTaskContext(
    req: any,
    query: {
      departmentId?: number;
      assignee?: string;
      coordinatorIds?: string;
      priority?: string;
    },
  ) {
    const departmentId = query.departmentId;
    const assignee = query.assignee;
    const priority = query.priority || 'NORMAL';
    const currentUserCode = req.user?.employeeCode;

    // 1. Lấy danh sách nhân sự từ EmployeeService
    let employees: any[] = [];
    try {
      const empRes = await this.employeeService.list(
        req.user,
        {
          departmentId: departmentId || undefined,
          pageSize: 200,
          assignableOnly: true,
        },
        this.getGrpcMetadata(req),
      );
      employees = empRes?.data || [];
    } catch {
      employees = [];
    }

    // 2. Phân loại Lãnh đạo và Chuyên viên bằng quy tắc nghiệp vụ tại server
    const deptLeaders: any[] = [];
    const deptStaff: any[] = [];

    const isLeader = (emp: any): boolean => {
      const code = (emp.jobTitle?.code || '').toUpperCase();
      const name = (emp.jobTitleName || emp.jobTitle?.name || '').toLowerCase();
      if (
        code.includes('TRUONG') ||
        code.includes('PHO') ||
        code.includes('GIAM_DOC') ||
        code.includes('LANH_DAO')
      ) {
        return true;
      }
      return (
        name.includes('trưởng') ||
        name.includes('phó') ||
        name.includes('giám đốc') ||
        name.includes('chi cục trưởng')
      );
    };

    employees.forEach((emp) => {
      const item = {
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        jobTitleName: emp.jobTitleName || emp.jobTitle?.name || '',
        departmentName: emp.departmentName || emp.department?.name || '',
        departmentId: emp.departmentId,
      };
      if (isLeader(emp)) {
        deptLeaders.push({ ...item, isLeader: true });
      } else {
        deptStaff.push({ ...item, isLeader: false });
      }
    });

    // 3. Chuẩn hóa nhóm người thực hiện các bước (stepAssigneeOptions)
    let stepAssigneeOptions = { label: '', list: [] as any[] };
    const rawCoordinators = query.coordinatorIds
      ? query.coordinatorIds.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (rawCoordinators.length > 0) {
      const coordEmps: any[] = [];
      const coordCodes = new Set<string>();

      for (const cId of rawCoordinators) {
        if (!cId.startsWith('DEPT_')) {
          const emp = employees.find((e) => e.employeeCode === cId);
          if (emp && !coordCodes.has(emp.employeeCode)) {
            coordCodes.add(emp.employeeCode);
            coordEmps.push({
              employeeCode: emp.employeeCode,
              fullName: emp.fullName,
              jobTitleName: emp.jobTitleName || emp.jobTitle?.name || '',
              departmentName: emp.departmentName || emp.department?.name || '',
            });
          }
        } else {
          const dId = parseInt(cId.replace('DEPT_', ''), 10);
          employees.forEach((emp) => {
            if (
              (emp.departmentId === dId || emp.department?.id === dId) &&
              !coordCodes.has(emp.employeeCode)
            ) {
              coordCodes.add(emp.employeeCode);
              coordEmps.push({
                employeeCode: emp.employeeCode,
                fullName: emp.fullName,
                jobTitleName: emp.jobTitleName || emp.jobTitle?.name || '',
                departmentName: emp.departmentName || emp.department?.name || '',
              });
            }
          });
        }
      }

      const filtered = coordEmps.filter(
        (e) => e.employeeCode !== currentUserCode && e.employeeCode !== assignee,
      );
      stepAssigneeOptions = {
        label: `Nhân sự phối hợp trong nhiệm vụ (${filtered.length})`,
        list: filtered,
      };
    } else if (departmentId || (assignee && assignee.startsWith('DEPT_'))) {
      const dId = departmentId || parseInt(assignee!.replace('DEPT_', ''), 10);
      const deptEmps = employees
        .filter(
          (e) =>
            (e.departmentId === dId || e.department?.id === dId) &&
            e.employeeCode !== currentUserCode &&
            e.employeeCode !== assignee,
        )
        .map((emp) => ({
          employeeCode: emp.employeeCode,
          fullName: emp.fullName,
          jobTitleName: emp.jobTitleName || emp.jobTitle?.name || '',
          departmentName: emp.departmentName || emp.department?.name || '',
        }));

      const deptName =
        employees.find((e) => e.departmentId === dId)?.departmentName || 'phòng ban';
      stepAssigneeOptions = {
        label: `Nhân sự ${deptName} (${deptEmps.length})`,
        list: deptEmps,
      };
    }

    // 4. Chuẩn hóa mã nhóm công thức VTVL
    let deptName = '';
    if (assignee && assignee.startsWith('DEPT_')) {
      const dId = parseInt(assignee.replace('DEPT_', ''), 10);
      deptName = employees.find((e) => e.departmentId === dId)?.departmentName || '';
    } else if (assignee) {
      const emp = employees.find((e) => e.employeeCode === assignee);
      deptName = emp?.departmentName || emp?.unitName || '';
    } else if (departmentId) {
      deptName = employees.find((e) => e.departmentId === departmentId)?.departmentName || '';
    }

    const upper = deptName.toUpperCase();
    let formulaDomainCode = 'VTVL_CHUNG';
    if (upper.includes('TỔ CHỨC') || upper.includes('CÁN BỘ') || upper.includes('TCCB')) {
      formulaDomainCode = 'THAM_DINH_TCCB';
    } else if (upper.includes('BẢO VỆ CHÍNH TRỊ') || upper.includes('BVCTNB')) {
      formulaDomainCode = 'BVCTNB';
    } else if (upper.includes('TIẾP CÔNG DÂN') || upper.includes('ĐƠN THƯ') || upper.includes('TCD')) {
      formulaDomainCode = 'TCD_DV';
    } else if (upper.includes('VĂN PHÒNG') || upper.includes('VP')) {
      formulaDomainCode = 'VAN_PHONG';
    }

    // 5. Mặc định KPI theo mức độ ưu tiên
    const scoreMap: Record<string, { baseScore: number; difficultyK: number }> = {
      LOW: { baseScore: 50, difficultyK: 1 },
      NORMAL: { baseScore: 100, difficultyK: 2 },
      HIGH: { baseScore: 150, difficultyK: 3 },
      URGENT: { baseScore: 200, difficultyK: 4 },
    };
    const kpiDefaults = scoreMap[priority.toUpperCase()] || scoreMap.NORMAL;

    // 6. Nhận diện Lãnh đạo thẩm định theo VTVL
    let supervisor: any = null;
    if (assignee) {
      try {
        const supRes = await this.getSupervisorByScope(req, {
          departmentId: departmentId || (assignee.startsWith('DEPT_') ? parseInt(assignee.replace('DEPT_', ''), 10) : undefined),
          assigneeCode: !assignee.startsWith('DEPT_') ? assignee : undefined,
        });
        if (supRes?.supervisorCode) {
          supervisor = {
            code: supRes.supervisorCode,
            name: supRes.supervisorName || supRes.supervisorCode,
            jobTitle: supRes.supervisorJobTitle,
            unitName: supRes.supervisorUnitName,
            reason: supRes.reason || 'Lãnh đạo thẩm định theo VTVL tuyến báo cáo & phân công quản lý',
          };
        }
      } catch {}
    }

    return {
      deptLeaders,
      deptStaff,
      stepAssigneeOptions,
      formulaDomainCode,
      kpiDefaults,
      supervisor,
    };
  }

  async balancePercentages(body: { coordinatorCount?: number; coordinatorCodes?: string[] }) {
    const codes = body.coordinatorCodes || [];
    const count = codes.length > 0 ? codes.length : (body.coordinatorCount || 0);

    if (count === 0) {
      return {
        assigneePercentage: 100,
        coordinatorPercentage: 0,
        coordinators: [],
      };
    }

    const coorPct = Math.max(5, Math.floor(30 / count));
    const leadPct = 100 - coorPct * count;

    return {
      assigneePercentage: leadPct,
      coordinatorPercentage: coorPct,
      coordinators: codes.map((id) => ({ id, percentage: coorPct })),
    };
  }

  async getPersonalWorkbench(
    req: any,
    query: {
      startDate?: string;
      endDate?: string;
      unitScope?: string;
      search?: string;
      category?: string;
    },
  ) {
    const user = req.user;
    const userEmpCode = user?.employeeCode || '';
    const isAdmin = Boolean(
      user?.isAdmin ||
      user?.username === 'admin' ||
      user?.employeeCode === 'ADMIN001' ||
      (Array.isArray(user?.permissionsFlatten) &&
        (user.permissionsFlatten.includes('TASK:MANAGE') ||
          user.permissionsFlatten.includes('TASK.*') ||
          user.permissionsFlatten.includes('*') ||
          user.permissionsFlatten.includes('*:*') ||
          user.permissionsFlatten.includes('SYSTEM:*') ||
          user.permissionsFlatten.some((p: string) => typeof p === 'string' && p.startsWith('SYSTEM'))))
    );

    // 1. Fetch personal tasks from hrm-service via ListTasks with filter: 'MY_TASKS'
    const requestPayload: any = {
      currentEmployeeCode: userEmpCode,
      currentUserId: user?.id,
      currentUserDept: query.unitScope ? parseInt(query.unitScope, 10) : user?.unitId,
      currentUserPermissions: user?.permissionsFlatten || [],
      isAdmin,
      filter: 'MY_TASKS',
      status: 'ALL',
      limit: 200,
      page: 1,
      summary: false,
    };

    if (query.startDate) requestPayload.referenceDate = query.startDate;

    const grpcRes: any = await executeGrpcCall(
      this.taskService.ListTasks(requestPayload, this.getGrpcMetadata(req)),
      10000,
      'TasksService.ListTasks (PersonalWorkbench)',
    ).catch((e) => this.handleRpcError(e));

    const rawTasks = grpcRes?.data || [];
    const tasks = Array.isArray(rawTasks) ? rawTasks : [rawTasks].filter(Boolean);
    await this.populateUsers(tasks, req);

    // Lọc theo khoảng ngày nếu có
    let myTasks = tasks;
    if (query.startDate || query.endDate) {
      const start = query.startDate ? new Date(query.startDate).getTime() : 0;
      const end = query.endDate ? new Date(query.endDate + 'T23:59:59.999Z').getTime() : Infinity;
      myTasks = myTasks.filter((t: any) => {
        const d = t.dueDate ? new Date(t.dueDate).getTime() : (t.createdAt ? new Date(t.createdAt).getTime() : 0);
        return d >= start && d <= end;
      });
    }

    // 2. Tính toán 6 Thẻ chỉ số cá nhân thực tế tại server
    const total = myTasks.length;
    const now = new Date();
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    let completed = 0;
    let overdue = 0;
    let completedOverdue = 0;
    let dueSoon = 0;

    myTasks.forEach((t: any) => {
      const isDone =
        t.isCompleted === true ||
        t.status === 'COMPLETED' ||
        t.status === 'Hoàn thành' ||
        Number(t.progress || 0) >= 100;

      const due = t.dueDate ? new Date(t.dueDate) : null;
      const completedAt = t.completedAt ? new Date(t.completedAt) : null;

      if (isDone) {
        completed++;
        if (due && completedAt && completedAt > due) {
          completedOverdue++;
        }
      } else {
        if (due) {
          if (due < now) {
            overdue++;
          } else if (due <= in3Days) {
            dueSoon++;
          }
        }
      }
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    const metrics = {
      total,
      completed,
      overdue,
      completedOverdue,
      dueSoon,
      completionRate,
    };

    // 3. List việc cần làm tại server (Ưu tiên các việc chưa hoàn thành)
    const actionItems = myTasks
      .filter((t: any) => {
        const isDone =
          t.isCompleted === true ||
          t.status === 'COMPLETED' ||
          t.status === 'Hoàn thành' ||
          Number(t.progress || 0) >= 100;
        return !isDone;
      })
      .map((t: any) => {
        const d = t.dueDate ? new Date(t.dueDate) : null;
        const dueFormatted = d
          ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
          : 'Trong tuần';
        let actionStatus = 'Đang xử lý';
        if (t.status === 'PENDING_ACCEPTANCE') actionStatus = 'Chờ tiếp nhận';
        else if (t.status === 'PENDING_REVIEW') actionStatus = 'Chờ duyệt / thẩm định';
        return {
          id: t.id,
          title: t.title,
          status: actionStatus,
          dueDate: dueFormatted,
          priority: t.priority || 'MEDIUM',
        };
      })
      .slice(0, 5);

    // 4. Công việc gần đây nhất định dạng sẵn tại server
    let recentList = myTasks.map((t: any) => {
      const isDone =
        t.isCompleted === true ||
        t.status === 'COMPLETED' ||
        t.status === 'Hoàn thành' ||
        Number(t.progress || 0) >= 100;

      const d = t.dueDate ? new Date(t.dueDate) : null;
      const dueFormatted = d
        ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
        : 'Trong tháng';

      const isOverdue = !isDone && d && d < now;

      let statusLabel = 'Đang xử lý';
      if (isDone) statusLabel = 'Hoàn thành';
      else if (isOverdue) statusLabel = 'Quá hạn';
      else if (t.status === 'PENDING_ACCEPTANCE') statusLabel = 'Chờ tiếp nhận';
      else if (t.status === 'PENDING_REVIEW') statusLabel = 'Chờ thẩm định';

      const participants = Array.isArray(t.participants) ? t.participants : [];
      const myPart = participants.find((p: any) => p.employeeCode === userEmpCode);
      let roleLabel = 'Chủ trì';
      if (myPart) {
        if (myPart.role === 'OWNER') roleLabel = 'Người giao';
        else if (myPart.role === 'ASSIGNEE') roleLabel = 'Chủ trì';
        else if (myPart.role === 'COORDINATOR') roleLabel = 'Phối hợp';
        else if (myPart.role === 'APPROVER') roleLabel = 'Thẩm định';
      } else if (t.creatorEmployeeCode === userEmpCode || t.assignerCode === userEmpCode) {
        roleLabel = 'Người giao';
      } else if (t.assigneeCode === userEmpCode) {
        roleLabel = 'Chủ trì';
      } else if (Array.isArray(t.coassigneeCodes) && t.coassigneeCodes.includes(userEmpCode)) {
        roleLabel = 'Phối hợp';
      }

      return {
        id: t.id,
        title: t.title,
        docRef: t.metadata?.documentNumber || t.metadata?.documentRef || `[${t.id}/QĐ-UBND]`,
        status: statusLabel,
        priority: t.priority === 'URGENT' || t.priority === 'HIGH' ? 'Cao' : 'Trung bình',
        dueDate: dueFormatted,
        role: roleLabel,
        progress: Number(t.progress || (isDone ? 100 : 35)),
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
      };
    });

    if (query.search && query.search.trim()) {
      const q = query.search.toLowerCase();
      recentList = recentList.filter(
        (t) => t.title.toLowerCase().includes(q) || t.docRef.toLowerCase().includes(q),
      );
    }

    if (query.category === 'LEAD') {
      recentList = recentList.filter((t) => t.role === 'Chủ trì' || t.role === 'Người giao');
    } else if (query.category === 'COORDINATE') {
      recentList = recentList.filter((t) => t.role === 'Phối hợp');
    } else if (query.category === 'IN_PROGRESS') {
      recentList = recentList.filter((t) => t.status === 'Đang xử lý' || t.status === 'Chờ thẩm định');
    } else if (query.category === 'DONE') {
      recentList = recentList.filter((t) => t.status === 'Hoàn thành');
    }

    const recentTasks = recentList.slice(0, 8);

    // 5. Workload Benchmark tính toán động theo dữ liệu thực
    let personalScore = 0;
    myTasks.forEach((t: any) => {
      const score = Number(t.baseScore || t.metadata?.baseScore || 0);
      const weight = Number(t.weight || t.metadata?.weight || 1);
      personalScore += score > 0 ? (score * weight) / 100 : 1;
    });
    personalScore = Math.max(1, Math.round(personalScore));

    let departmentAverage = 10;
    try {
      const deptId = query.unitScope ? parseInt(query.unitScope, 10) : user?.unitId;
      if (deptId) {
        const deptPayload: any = {
          departmentId: deptId,
          status: 'ALL',
          limit: 100,
          page: 1,
          summary: true,
        };
        const deptRes: any = await executeGrpcCall(
          this.taskService.ListTasks(deptPayload, this.getGrpcMetadata(req)),
          3000,
          'TasksService.ListTasks (DeptBenchmark)',
        ).catch(() => null);
        const deptTasks = deptRes?.data || [];
        if (Array.isArray(deptTasks) && deptTasks.length > 0) {
          const totalDeptScore = deptTasks.reduce((acc: number, dt: any) => {
            const sc = Number(dt.baseScore || dt.metadata?.baseScore || 1);
            return acc + (sc > 0 ? sc : 1);
          }, 0);
          departmentAverage = Math.round((totalDeptScore / Math.max(1, deptTasks.length)) * 10) / 10;
        }
      }
    } catch {
      departmentAverage = Math.round(personalScore * 1.1 * 10) / 10;
    }

    const diffPercent = Math.abs(
      Math.round(((personalScore - departmentAverage) / (departmentAverage || 1)) * 100),
    );
    const isLower = personalScore <= departmentAverage;

    const workloadBenchmark = {
      personalScore,
      departmentAverage,
      diffPercent,
      isLower,
      evaluation: isLower ? 'Tải cân bằng · Đáp ứng tốt' : 'Khối lượng cao · Cần hỗ trợ',
    };

    return {
      metrics,
      actionItems,
      recentTasks,
      workloadBenchmark,
    };
  }

  async getSupervisorByScope(req: any, query: { departmentId?: number; domainId?: number; assigneeCode?: string }) {
    let targetUnitId = query.departmentId;
    const targetDomainId = query.domainId || 0;
    const assigneeCode = query.assigneeCode && query.assigneeCode !== 'UNASSIGNED' ? query.assigneeCode : undefined;

    if (!targetUnitId && assigneeCode) {
      const u = this.userCacheMap.get(assigneeCode);
      if (u?.departmentId) {
        targetUnitId = u.departmentId;
      }
    }

    if (!targetUnitId && !targetDomainId && !assigneeCode) {
      return null;
    }

    try {
      const res: any = await executeGrpcCall(
        this.userService.GetEmployeesByScope(
          {
            domain_id: targetDomainId,
            monitored_unit_id: targetUnitId || 0,
            assignee_code: assigneeCode || '',
          },
          this.getGrpcMetadata(req),
        ),
        8000,
        'TasksService.GetEmployeesByScope',
      );
      const codes: string[] = res?.employee_codes || res?.employeeCodes || [];
      if (codes.length > 0) {
        const supervisorCode = codes[0];
        if (this.userCacheMap.size === 0 || !this.userCacheMap.has(supervisorCode)) {
          await this.populateUsers([{ supervisorCode }], req);
        }
        const u = this.userCacheMap.get(supervisorCode);
        return {
          supervisorCode,
          supervisorName: u ? u.fullName || u.username : supervisorCode,
          supervisorJobTitle: u?.jobTitleName || undefined,
          supervisorUnitName: u?.unitName || undefined,
          reason: assigneeCode
            ? 'Lãnh đạo thẩm định theo VTVL tuyến báo cáo trực tiếp & phân công quản lý'
            : targetUnitId
            ? 'Lãnh đạo được phân công theo dõi đơn vị trong định biên tổ chức'
            : 'Lãnh đạo được phân công theo dõi lĩnh vực trong định biên tổ chức',
          allMatchedCodes: codes,
        };
      }
    } catch {
      // Fallback null
    }

    return null;
  }

  async recommendAssignees(
    req: any,
    query: {
      departmentId?: number;
      domainId?: number;
      jobTitleId?: number;
      strategy?: string;
    },
  ) {
    const payload: any = {
      ...query,
    };
    if (req.user) {
      payload.currentUserId = req.user.id ? parseInt(req.user.id, 10) : undefined;
      payload.currentEmployeeCode = req.user.employeeCode;
      payload.currentUserDept = req.user.unitId ? parseInt(req.user.unitId, 10) : undefined;
      payload.currentUserPermissions = req.user.permissionsFlatten || [];
    }

    const response: any = await executeGrpcCall(
      this.taskService.RecommendAssignees(payload, this.getGrpcMetadata(req)),
      10000,
      'TasksService.RecommendAssignees',
    ).catch((e) => this.handleRpcError(e));

    if (response?.data?.topEmployees?.length) {
      for (const emp of response.data.topEmployees) {
        const u = this.userCacheMap.get(emp.employeeCode);
        if (u) {
          if (!emp.employeeName || emp.employeeName === emp.employeeCode) {
            emp.employeeName = u.fullName || u.username;
            emp.fullName = u.fullName || u.username;
          }
          if (!emp.jobTitleName && u.jobTitleName) emp.jobTitleName = u.jobTitleName;
          if (!emp.departmentName && u.unitName) emp.departmentName = u.unitName;
          if (!emp.avatar && u.avatar) emp.avatar = u.avatar;
        }
      }
    }

    return response;
  }

  async list(
    req: any,
    role: string,
    assigneeCode: string,
    assignerCode: string,
    filter: string,
    search: string,
    departmentId: string,
    planId: string,
    isSupervisor: string,
    status: string,
    priority: string,
    page: string,
    limit: string,
    statsFilter: string,
    type: string,
    viewMode: string,
    referenceDate: string,
    summary?: string,
  ) {
    const user = req.user;
    let finalAssigneeCode = assigneeCode;
    let finalAssignerCode: string | undefined = assignerCode;
    const finalDepartmentId =
      departmentId && departmentId !== 'undefined'
        ? parseInt(departmentId, 10)
        : undefined;

    if (role === 'ASSIGNEE' && user) {
      finalAssigneeCode = user.employeeCode;
    } else if (role === 'OWNER' && user) {
      finalAssignerCode = user.employeeCode;
    }

    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;
    const isLeader =
      isAdmin ||
      user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
      user?.permissionsFlatten?.includes('TASK.*');

    const requestPayload: any = {
      currentEmployeeCode: user?.employeeCode,
      isAdmin,
      isLeader,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      summary: summary === 'true',
    };

    if (finalAssigneeCode) requestPayload.assigneeCode = finalAssigneeCode;
    if (finalAssignerCode) requestPayload.assignerCode = finalAssignerCode;
    if (filter && filter !== 'ALL' && filter !== 'undefined') requestPayload.filter = filter;
    if (search && search.trim() && search !== 'undefined') requestPayload.search = search.trim();
    if (status && status !== 'ALL' && status !== 'undefined') requestPayload.status = status;
    if (priority && priority !== 'ALL' && priority !== 'undefined') requestPayload.priority = priority;
    if (type && type !== 'ALL' && type !== 'undefined') requestPayload.type = type;
    if (statsFilter && statsFilter !== 'undefined') requestPayload.statsFilter = statsFilter;
    if (finalDepartmentId) requestPayload.departmentId = finalDepartmentId;
    if (planId && planId !== 'undefined') requestPayload.planId = parseInt(planId, 10);
    if (isSupervisor === 'true') requestPayload.isSupervisor = true;
    if (user?.unitId) requestPayload.currentUserDept = parseInt(user.unitId, 10);
    if (user?.id) requestPayload.currentUserId = parseInt(user.id, 10);
    if (role && role !== 'undefined') requestPayload.role = role;
    if (viewMode && viewMode !== 'undefined') requestPayload.viewMode = viewMode;
    if (referenceDate && referenceDate !== 'undefined') requestPayload.referenceDate = referenceDate;

    const response: any = await executeGrpcCall(
      this.taskService.ListTasks(requestPayload, this.getGrpcMetadata(req)),
      10000,
      'TasksService.ListTasks',
    ).catch((e) => this.handleRpcError(e));

    if (response?.data) {
      const isSummary = summary === 'true';
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data, req);
        response.data.forEach((t: any) => this.translateTaskData(t));
        if (isSummary) {
          response.data = response.data.map((t: any) => this.pruneSummaryTask(t));
        }
      } else {
        await this.populateUsers([response.data], req);
        this.translateTaskData(response.data);
        if (isSummary) {
          response.data = this.pruneSummaryTask(response.data);
        }
      }
    }

    if (response && user?.employeeCode) {
      response.meta = response.meta || {};
      response.meta.currentEmployeeCode = user.employeeCode;
    }
    return response;
  }

  private pruneSummaryTask(t: any): any {
    if (!t) return t;
    const cleaned: any = {
      id: t.id,
      title: t.title,
      status: t.status,
      statusLabel: t.statusLabel,
      priority: t.priority,
      priorityLabel: t.priorityLabel,
      dueDate: t.dueDate,
      startDate: t.startDate,
      progress: t.progress ?? 0,
      assigneeCode: t.assigneeCode || undefined,
      assigneeName: t.assigneeName || undefined,
      assignerCode: t.assignerCode || undefined,
      assignerName: t.assignerName || undefined,
      supervisorCode: t.supervisorCode || undefined,
      supervisorName: t.supervisorName || undefined,
      coassigneeNames: (Array.isArray(t.coassigneeNames) && t.coassigneeNames.length > 0) ? t.coassigneeNames : undefined,
      sourceDocumentRef: t.sourceDocumentRef || undefined,
      baseScore: t.baseScore ? Number(t.baseScore) : undefined,
      weight: t.weight ? Number(t.weight) : undefined,
      parentId: t.parentId ? Number(t.parentId) : undefined,
      planId: t.planId ? Number(t.planId) : undefined,
      isOverdueWarned: t.isOverdueWarned || undefined,
      isDeadlineWarned: t.isDeadlineWarned || undefined,
      isRiskWarned: t.isRiskWarned || undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
    if (t.metadata?.taskType) {
      cleaned.metadata = { taskType: t.metadata.taskType };
    }
    if (Array.isArray(t.children) && t.children.length > 0) {
      cleaned.children = t.children.map((c: any) => this.pruneSummaryTask(c));
    }
    return cleaned;
  }

  async update(req: any, id: number, body: any) {
    const response: any = await executeGrpcCall(
      this.taskService.UpdateTask(
        {
          id,
          weight: body.weight,
          startDate: body.startDate,
          dueDate: body.dueDate,
          priority: body.priority,
          baseScore: body.baseScore,
          title: body.title,
          description: body.description,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.UpdateTask',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async extendTask(req: any, id: number, body: any) {
    if (body.dueDate) {
      body.dueDate = new Date(body.dueDate).toISOString();
    }
    const user = req.user;
    const response: any = await executeGrpcCall(
      this.taskService.ExtendTask(
        {
          id,
          dueDate: body.dueDate,
          reason: body.reason,
          actorCode: user?.employeeCode || user?.username,
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.ExtendTask',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async updateStatus(
    req: any,
    id: number,
    status: string,
    rejectReason?: string,
    actionName?: string,
    evidence?: string,
    evidenceData?: any,
  ) {
    let finalEvidence = evidence;
    if (evidenceData && (evidenceData.itemType === 'step' || evidenceData.itemType === 'subtask')) {
      finalEvidence =
        `📋 Báo cáo hoàn thành [${evidenceData.itemType === 'step' ? 'Bước' : 'Nhiệm vụ con'}]: **${evidenceData.itemTitle}**\n${evidenceData.text || ''}`.trim();
      if (evidenceData.files && evidenceData.files.length > 0) {
        finalEvidence += '\n\n**Minh chứng đính kèm:**';
        evidenceData.files.forEach((file: any, index: number) => {
          finalEvidence += `\n${index + 1}. [${file.name}](${file.url})`;
        });
      }
    }

    const user = req.user;
    const response: any = await executeGrpcCall(
      this.taskService.UpdateTaskStatus(
        {
          id,
          status,
          rejectReason,
          actionName,
          evidence: finalEvidence,
          evidenceDataJson: evidenceData ? JSON.stringify(evidenceData) : '',
          actorCode: user?.employeeCode || '',
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.UpdateTaskStatus',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }
  async respondTask(
    req: any,
    id: number,
    action: string,
    rejectReason?: string,
    message?: string,
  ) {
    const user = req.user;
    const response: any = await executeGrpcCall(
      this.taskService.RespondTask(
        {
          taskId: id,
          action,
          rejectReason,
          message,
          currentUserId: user?.id ? parseInt(user.id, 10) : undefined,
          currentEmployeeCode: user?.employeeCode || user?.username || '',
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: user?.permissionsFlatten || [],
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.RespondTask',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }


  async assignTask(req: any, id: number, body: any) {
    if (body.assignee) {
      if (body.assignee.startsWith('DEPT_')) {
        body.departmentId = parseInt(body.assignee.replace('DEPT_', ''), 10);
      } else {
        body.assigneeCode = body.assignee;
      }
      delete body.assignee;
    }

    if (body.coordinators) {
      body.coassigneeCodes = body.coordinators;
      delete body.coordinators;
    }

    const assigneeCode = body.assigneeCode;
    const coassigneeCodes = body.coassigneeCodes || body.coAssigneeCodes || [];
    const departmentId = body.departmentId;
    const user = req.user;
    const assignerCode = user?.employeeCode;

    const response: any = await executeGrpcCall(
      this.taskService.AssignTask(
        {
          id,
          assigneeCode,
          coassigneeCodes: coassigneeCodes || [],
          departmentId,
          assignerCode,
          currentUserPermissions: user?.permissionsFlatten || [],
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.AssignTask',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) this.translateTaskData(response.data);
    return response;
  }

  async breakdownTask(req: any, id: number, body: any) {
    const user = req.user;
    const assignerCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    const taskResponse: any = await executeGrpcCall(
      this.taskService.GetTask(
        {
          id: id,
          currentEmployeeCode: assignerCode,
          isAdmin: isAdmin,
          isLeader:
            isAdmin ||
            user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
            user?.permissionsFlatten?.includes('TASK.*'),
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.GetTask',
    ).catch((e) => this.handleRpcError(e));
    if (!taskResponse) {
      throw new Error('Nhiệm vụ không tồn tại');
    }

    const metadataObj = {
      ...(body.metadata || {}),
      ...(body.sourceDocumentRef ? { sourceDocumentRef: body.sourceDocumentRef } : {}),
      ...(body.initialSteps ? { initialSteps: body.initialSteps } : {}),
    };

    const breakdownResponse: any = await executeGrpcCall(
      this.taskService.BreakdownTask(
        {
          ...body,
          coassigneeCodes:
            body.coordinators || body.coassigneeCodes || body.coAssigneeCodes,
          id: id,
          parentId: id,
          assignerCode,
          sourceDocumentRef: body.sourceDocumentRef || '',
          metadataJson: JSON.stringify(metadataObj),
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.BreakdownTask',
    ).catch((e) => this.handleRpcError(e));
    if (breakdownResponse?.data) this.translateTaskData(breakdownResponse.data);
    return breakdownResponse;
  }


  async requestCoordination(req: any, id: number, body: any) {
    const message = body.message;
    const leadCode = body.leadCode || body.leadId;
    const coordinatorCodes = body.coordinatorCodes || body.coordinatorIds || [];

    const user = req.user;
    const requesterCode = user?.employeeCode;
    const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

    const taskResponse: any = await executeGrpcCall(
      this.taskService.GetTask(
        {
          id: id,
          currentEmployeeCode: requesterCode,
          isAdmin: isAdmin,
          isLeader:
            isAdmin ||
            user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
            user?.permissionsFlatten?.includes('TASK.*'),
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.GetTask',
    ).catch((e) => this.handleRpcError(e));
    if (!taskResponse) throw new Error('Task not found.');

    return executeGrpcCall(
      this.taskService.RequestCoordination(
        {
          taskId: id,
          requesterCode,
          message: message || '',
          leadId: leadCode || '',
          coordinatorIds: coordinatorCodes || [],
          leadCode: leadCode || '',
          coordinatorCodes: coordinatorCodes || [],
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.RequestCoordination',
    ).catch((e) => this.handleRpcError(e));
  }

  async getSubTasks(req: any, id: number) {
    const user = req.user;
    const perms = user?.permissionsFlatten || [];
    const isAdmin = Boolean(
      user?.isAdmin ||
      user?.username === 'admin' ||
      user?.employeeCode === 'ADMIN001' ||
      (Array.isArray(perms) &&
        (perms.includes('TASK:MANAGE') ||
          perms.includes('TASK.*') ||
          perms.includes('*') ||
          perms.includes('*:*') ||
          perms.includes('SYSTEM:*') ||
          perms.some((p: string) => typeof p === 'string' && p.startsWith('SYSTEM'))))
    );
    const isLeader =
      isAdmin ||
      perms.includes('TASK.ASSIGN') ||
      perms.includes('TASK.*');

    const response: any = await executeGrpcCall(
      this.taskService.GetSubTasks(
        {
          taskId: id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          isAdmin,
          isLeader,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: perms,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.GetSubTasks',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data, req);
        response.data.forEach((t: any) => this.translateTaskData(t));
      } else {
        await this.populateUsers([response.data], req);
        this.translateTaskData(response.data);
      }
    }
    return response;
  }

  async getTaskHistory(req: any, id: number) {
    return executeGrpcCall(
      this.taskService.GetTaskHistory(
        { taskId: id },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.GetTaskHistory',
    ).catch((e) => this.handleRpcError(e));
  }


  async getTask(req: any, id: number) {
    const user = req.user;
    const perms = user?.permissionsFlatten || [];
    const isAdmin = Boolean(
      user?.isAdmin ||
      user?.username === 'admin' ||
      user?.employeeCode === 'ADMIN001' ||
      (Array.isArray(perms) &&
        (perms.includes('TASK:MANAGE') ||
          perms.includes('TASK.*') ||
          perms.includes('*') ||
          perms.includes('*:*') ||
          perms.includes('SYSTEM:*') ||
          perms.some((p: string) => typeof p === 'string' && p.startsWith('SYSTEM'))))
    );
    const isLeader =
      isAdmin ||
      perms.includes('TASK.ASSIGN') ||
      perms.includes('TASK.*');

    const response = (await executeGrpcCall(
      this.taskService.GetTask(
        {
          id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: perms,
          isAdmin,
          isLeader,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.GetTask',
    ).catch((e) => this.handleRpcError(e))) as any;
    const target = response?.data ? response.data : response;
    if (target) {
      await this.populateUsers([target], req);
      this.translateTaskData(target);
    }
    return response;
  }

  async listSteps(req: any, id: number) {
    const response: any = await executeGrpcCall(
      this.taskService.ListSteps({ taskId: id }, this.getGrpcMetadata(req)),
      10000,
      'TasksService.ListSteps',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      if (Array.isArray(response.data)) {
        await this.populateUsers(response.data, req);
      }
    }
    return response;
  }

  async createStep(req: any, id: number, body: any) {
    if (body.baseScore !== undefined && body.baseScore !== null) {
      body.baseScore = body.baseScore === '' ? 0 : Number(body.baseScore);
    }
    if (body.assignee) {
      body.assigneeCode = body.assignee || undefined;
      delete body.assignee;
    }

    const response: any = await executeGrpcCall(
      this.taskService.CreateStep(
        { taskId: id, ...body },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.CreateStep',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      await this.populateUsers([response.data], req);
    }
    return response;
  }

  async updateStep(req: any, id: number, stepId: number, body: any) {
    if (body.evidenceData) {
      let finalEvidence =
        `📋 Báo cáo hoàn thành [${body.evidenceData.itemType === 'step' ? 'Bước' : 'Nhiệm vụ con'}]: **${body.evidenceData.itemTitle}**\n${body.evidenceData.text || ''}`.trim();
      if (body.evidenceData.files && body.evidenceData.files.length > 0) {
        finalEvidence += '\n\n**Minh chứng đính kèm:**';
        body.evidenceData.files.forEach((file: any, index: number) => {
          finalEvidence += `\n${index + 1}. [${file.name}](${file.url})`;
        });
      }
      body.evidence = finalEvidence;
      delete body.evidenceData;
    }

    const response: any = await executeGrpcCall(
      this.taskService.UpdateStep(
        {
          taskId: id,
          stepId,
          actorCode: req.user?.employeeCode || '',
          ...body,
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.UpdateStep',
    ).catch((e) => this.handleRpcError(e));
    if (response?.data) {
      await this.populateUsers([response.data], req);
    }
    return response;
  }

  async deleteStep(req: any, id: number, stepId: number) {
    return executeGrpcCall(
      this.taskService.DeleteStep(
        { taskId: id, stepId },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.DeleteStep',
    ).catch((e) => this.handleRpcError(e));
  }

  async recordAttendance(req: any, id: number) {
    const user = req.user;
    return executeGrpcCall(
      this.taskService.RecordAttendance(
        {
          taskId: id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: user?.permissionsFlatten || [],
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.RecordAttendance',
    ).catch((e) => this.handleRpcError(e));
  }

  async getAttendanceStats(req: any, id: number) {
    const user = req.user;
    return executeGrpcCall(
      this.taskService.GetAttendanceStats(
        {
          taskId: id,
          currentUserId: user?.id,
          currentEmployeeCode: user?.employeeCode || user?.username,
          currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
          currentUserPermissions: user?.permissionsFlatten || [],
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.GetAttendanceStats',
    ).catch((e) => this.handleRpcError(e));
  }

  async getKpiSystemVariables(req: any) {
    return executeGrpcCall(
      this.taskService.GetKpiSystemVariables({}, this.getGrpcMetadata(req)),
      10000,
      'TasksService.GetKpiSystemVariables',
    ).catch((e) => this.handleRpcError(e));
  }

  async getGlobalKpiSettings(req: any) {
    return executeGrpcCall(
      this.taskService.GetGlobalKpiSettings({}, this.getGrpcMetadata(req)),
      10000,
      'TasksService.GetGlobalKpiSettings',
    ).catch((e) => this.handleRpcError(e));
  }

  async saveGlobalKpiSettings(req: any, body: any) {
    return executeGrpcCall(
      this.taskService.SaveGlobalKpiSettings(body, this.getGrpcMetadata(req)),
      10000,
      'TasksService.SaveGlobalKpiSettings',
    ).catch((e) => this.handleRpcError(e));
  }

  async previewGlobalKpiSettings(req: any, body: any) {
    return executeGrpcCall(
      this.taskService.PreviewGlobalKpiSettings(
        {
          settingsJson: JSON.stringify(body.settings || {}),
          quota: Number(body.variables?.Q ?? 10),
          completed: Number(body.variables?.C ?? 8),
          weight: Number(body.variables?.W ?? 1),
          delayDays: Number(body.variables?.D ?? 2),
          qualityScore: Number(body.variables?.S ?? 80),
          domainCode: String(body.domainCode || 'GENERIC'),
        },
        this.getGrpcMetadata(req),
      ),
      10000,
      'TasksService.PreviewGlobalKpiSettings',
    ).catch((e) => this.handleRpcError(e));
  }

  async getGlobalKpiSettingVersions(req: any) {
    return executeGrpcCall(
      this.taskService.ListGlobalKpiSettingVersions({}, this.getGrpcMetadata(req)),
      10000,
      'TasksService.ListGlobalKpiSettingVersions',
    ).catch((e) => this.handleRpcError(e));
  }
}
