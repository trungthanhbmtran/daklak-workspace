import { Injectable } from '@nestjs/common';
import { TaskRole } from '@generated/prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { paginateArray } from '@/utils/pagination.util';

@Injectable()
export class MasterPlansService {
  constructor(private prisma: PrismaService, private shared: TaskSharedService) { }

  async findAll(query: any) {
    const page = query?.page ? Number(query.page) : 1;
    const limit = query?.limit ? Number(query.limit) : 0;
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;

    if (!query.isAdmin && query.currentEmployeeCode) {
      const authConditions: any[] = [];

      const ancestorIds: number[] = Array.isArray(query.callerAncestorUnitIds)
        ? query.callerAncestorUnitIds.map(Number).filter(Boolean)
        : (query.currentUserDept ? [query.currentUserDept] : []);

      if (ancestorIds.length > 0) {
        authConditions.push({ departmentId: { in: ancestorIds } });
      }

      const currentEmp = await this.prisma.employee.findUnique({
        where: { employeeCode: query.currentEmployeeCode },
        select: { userId: true }
      });
      const currentUserId = currentEmp?.userId ? parseInt(currentEmp.userId, 10) : null;

      if (currentUserId) {
        authConditions.push({
          tasks: {
            some: {
              participants: {
                some: {
                  userId: currentUserId,
                  participantRole: { in: ['ASSIGNEE', 'OWNER'] }
                }
              }
            }
          }
        });
      } else {
        authConditions.push({ id: -1 });
      }

      where.AND = [{ OR: authConditions }];
    }

    const totalCount = await this.prisma.masterPlan.count({ where });
    const limitNum = limit > 0 ? limit : (totalCount > 0 ? totalCount : 10);
    const skip = (page - 1) * limitNum;

    const masterPlans = await this.prisma.masterPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: limit > 0 ? skip : undefined,
      take: limit > 0 ? limitNum : undefined,
      include: {
        tasks: {
          include: { participants: true }
        },
      }
    });

    const userIds = new Set<number>();
    for (const mp of masterPlans) {
      for (const t of mp.tasks) {
        if (t.participants) {
          for (const p of t.participants) {
            const pAny = p as any;
            if (pAny.userId) userIds.add(pAny.userId);
          }
        }
      }
    }

    const userToCodeMap = new Map<number, string>();
    if (userIds.size > 0) {
      const emps = await this.prisma.employee.findMany({
        where: { userId: { in: Array.from(userIds).map(String) } },
        select: { userId: true, employeeCode: true }
      });
      for (const emp of emps) {
        if (emp.userId) userToCodeMap.set(parseInt(emp.userId, 10), emp.employeeCode);
      }
    }

    return {
      success: true,
      message: 'Lấy danh sách Kế hoạch thành công',
      data: masterPlans.map((mp: any) => {
        let completedTasks = 0;
        const tasks = mp.tasks.map((t: any) => {
          if (t.isCompleted) completedTasks++;
          const assigneeId = t.participants?.find((p: any) => p.participantRole === TaskRole.ASSIGNEE)?.userId;
          const assigneeCode = assigneeId ? (userToCodeMap.get(assigneeId) || 'UNASSIGNED') : 'UNASSIGNED';
          return {
            ...t,
            assigneeCode: assigneeCode,
            dueDate: t.dueDate?.toISOString() || '',
            completionDate: t.completionDate?.toISOString() || '',
            createdAt: t.createdAt?.toISOString() || '',
            updatedAt: t.updatedAt?.toISOString() || '',
          };
        });

        const canEdit = query.isAdmin || mp.createdByCode === query.currentEmployeeCode || query.isLeader;
        const allowedActions: string[] = [];
        if (canEdit) allowedActions.push('ADD_ROOT_TASK', 'EDIT', 'DELETE');

        const totalTasks = mp.tasks.length;
        
        return {
          ...mp,
          startDate: mp.startDate?.toISOString() || '',
          endDate: mp.endDate?.toISOString() || '',
          createdAt: mp.createdAt?.toISOString() || '',
          updatedAt: mp.updatedAt?.toISOString() || '',
          totalTasks: totalTasks,
          completedTasks: completedTasks,
          tasks,
          allowedActions
        };
      }),
      meta: {
        total: totalCount,
        page,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    };
  }
  async findById(id: number, query: any = {}) {
    const mp = await this.prisma.masterPlan.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { participants: true }
        }
      }
    });
    if (!mp) return null;

    if (typeof query === 'object' && !query.isAdmin && query.currentEmployeeCode) {
      let hasAccess = false;
      const ancestorIds: number[] = Array.isArray(query.callerAncestorUnitIds)
        ? query.callerAncestorUnitIds.map(Number).filter(Boolean)
        : (query.currentUserDept ? [query.currentUserDept] : []);

      if (mp.departmentId !== null && ancestorIds.includes(mp.departmentId)) {
        hasAccess = true;
      } else {
        const code = query.currentEmployeeCode;
        const currentEmp = await this.prisma.employee.findUnique({
          where: { employeeCode: code },
          select: { userId: true }
        });
        const currentUserId = currentEmp?.userId ? parseInt(currentEmp.userId, 10) : null;
        if (currentUserId && mp.tasks.some((t: any) => t.participants?.some((p: any) => p.userId === currentUserId))) {
          hasAccess = true;
        }
      }
      
      if (!hasAccess) {
        throw new Error('Bạn không có quyền xem kế hoạch này.');
      }
    }

    // Collect userIds from mp.tasks' participants
    const userIds = new Set<number>();
    mp.tasks.forEach(t => {
      t.participants?.forEach((p: any) => {
        if (p.userId) userIds.add(p.userId);
      });
    });

    const userToCodeMap = new Map<number, string>();
    if (userIds.size > 0) {
      const emps = await this.prisma.employee.findMany({
        where: { userId: { in: Array.from(userIds).map(String) } },
        select: { userId: true, employeeCode: true }
      });
      emps.forEach(emp => {
        if (emp.userId) userToCodeMap.set(parseInt(emp.userId, 10), emp.employeeCode);
      });
    }

    let completedTasks = 0;
    const tasks = mp.tasks.map((t: any) => {
      if (t.isCompleted) completedTasks++;
      const assigneeId = t.participants?.find((p: any) => p.participantRole === TaskRole.ASSIGNEE)?.userId;
      const assigneeCode = assigneeId ? (userToCodeMap.get(assigneeId) || 'UNASSIGNED') : 'UNASSIGNED';
      return {
        ...t,
        assigneeCode: assigneeCode,
        dueDate: t.dueDate?.toISOString() || '',
        completionDate: t.completionDate?.toISOString() || '',
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      };
    });

    const canEdit = query.isAdmin || mp.createdByCode === query.currentEmployeeCode || query.isLeader;

    return {
      ...mp,
      startDate: mp.startDate?.toISOString() || '',
      endDate: mp.endDate?.toISOString() || '',
      createdAt: mp.createdAt?.toISOString() || '',
      updatedAt: mp.updatedAt?.toISOString() || '',
      totalTasks: mp.tasks.length,
      completedTasks,
      tasks,
      permissions: {
        canAddRootTask: canEdit,
        canEdit,
        canDelete: canEdit
      }
    };
  }

  async create(data: any) {
    const mp = await this.prisma.masterPlan.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        documentId: data.documentId,
        departmentId: data.departmentId,
        createdByCode: data.createdByCode,
      }
    });

    if (data.tasks && data.tasks.length > 0) {
      let systemUser = await this.prisma.employee.findUnique({ where: { employeeCode: 'UNASSIGNED' } });
      if (!systemUser) {
        systemUser = await this.prisma.employee.create({
          data: {
            employeeCode: 'UNASSIGNED',
            firstname: 'Hệ',
            lastname: 'thống',
            fullName: 'Hệ thống',
            email: 'unassigned@system.local',
            employmentStatus: 'inactive',
            departmentId: 0,
            jobTitleId: 0,
            startDate: new Date(),
            userId: '0'
          }
        });
      } else if (!systemUser.userId) {
        systemUser = await this.prisma.employee.update({
          where: { employeeCode: 'UNASSIGNED' },
          data: { userId: '0' }
        });
      }

      const codesToLookup = ['UNASSIGNED'];
      if (data.createdByCode) codesToLookup.push(data.createdByCode);

      const employees = await this.prisma.employee.findMany({
        where: { employeeCode: { in: codesToLookup } },
        select: { employeeCode: true, userId: true }
      });
      const codeToUidMap = new Map<string, number>();
      employees.forEach(emp => {
        if (emp.userId) codeToUidMap.set(emp.employeeCode, parseInt(emp.userId, 10));
      });

      const getUserId = (code: string) => codeToUidMap.get(code);

      for (const task of data.tasks) {
        let creatorUserId = 0;
        const creatorUid = getUserId(data.createdByCode || '');
        if (creatorUid !== undefined && creatorUid !== null) creatorUserId = creatorUid;

        const participants: any[] = [];
        const unassignedUid = getUserId('UNASSIGNED');
        if (unassignedUid !== undefined && unassignedUid !== null) {
          participants.push({ userId: unassignedUid, participantRole: 'ASSIGNEE' });
        }
        const ownerUid = getUserId(data.createdByCode || 'UNASSIGNED');
        if (ownerUid !== undefined && ownerUid !== null) {
          participants.push({ userId: ownerUid, participantRole: 'OWNER' });
        }

        await this.prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            status: 'TEMPLATE',
            priority: 'MEDIUM',
            kpiSettings: {
              create: {
                weight: task.weight,
                baseScore: task.targetValue
              }
            },
            planId: mp.id,
            creatorEmployeeCode: 'SYSTEM',
            participants: {
              create: participants
            }
          }
        });
      }
    }

    return this.findById(mp.id);
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.status) updateData.status = data.status;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.documentId) updateData.documentId = data.documentId;

    await this.prisma.masterPlan.update({
      where: { id },
      data: updateData,
    });
    return this.findById(id);
  }

  async delete(id: number) {
    await this.prisma.masterPlan.delete({ where: { id } });
    return { success: true, message: 'Deleted successfully' };
  }

  async getHistoricalFeasibility(query: any) {
    // Tiêu chí: cùng một công việc (dựa vào title hoặc type), cùng thời gian yêu cầu (duration), thời gian gần nhất
    const { title, type, durationDays } = query;

    let whereClause: any = {
      status: 'COMPLETED' // Chỉ tính các kế hoạch đã xong để lấy dữ liệu thực tế
    };

    if (type) whereClause.type = type;
    if (title) whereClause.title = { contains: title };

    // Tìm các kế hoạch thoả mãn
    const pastPlans = await this.prisma.masterPlan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Thời gian gần nhất
      take: 5, // Lấy 5 kế hoạch gần nhất để phân tích
      include: {
        tasks: true
      }
    });

    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    // Lọc thêm theo duration nếu cần (hoặc AI tự phân tích)
    // Tính toán số liệu thống kê
    pastPlans.forEach(plan => {
      totalTasks += plan.tasks.length;
      plan.tasks.forEach(t => {
        if (t.isCompleted) completedTasks++;
        if (t.dueDate && new Date(t.dueDate) < new Date() && !t.isCompleted) overdueTasks++;
      });
    });

    const feasibilityScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      success: true,
      data: {
        pastPlansCount: pastPlans.length,
        totalTasks,
        completedTasks,
        overdueTasks,
        feasibilityScore: Math.round(feasibilityScore),
        historicalContext: pastPlans.map(p => ({
          title: p.title,
          total: p.tasks.length,
          done: p.tasks.filter(t => t.isCompleted).length
        }))
      }
    };
  }
}
