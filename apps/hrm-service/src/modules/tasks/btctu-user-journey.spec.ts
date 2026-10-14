import { TasksService } from './tasks.service';
import { MasterPlansService } from '../master-plans/master-plans.service';
import { KpiEvaluationsService } from '../kpi-evaluations/kpi-evaluations.service';
import { TaskRole } from '../../../src/generated/prisma/client';
import { RpcException } from '@nestjs/microservices';
import { of } from 'rxjs';
import {
  DEFAULT_KPI_FORM_TEMPLATES,
  validateXmlSyntax,
  getTemplateXmlContent,
} from '../kpi-evaluations/kpi-template-xml.util';

/**
 * ==============================================================================
 * BỘ KIỂM THỬ TOÀN DIỆN VAI TRÒ NGƯỜI DÙNG THỰC TẾ (END-TO-END USER-ROLE JOURNEY)
 * ĐƠN VỊ: BAN TỔ CHỨC TỈNH ỦY ĐẮK LẮK (BTCTU)
 * 
 * Mô phỏng trọn vẹn 10 giai đoạn vòng đời công việc theo quy chuẩn:
 * 1. Lên kế hoạch (Master plan Quý IV/2026)
 * 2. Giao việc gắn với kế hoạch (Plan-linked Root Task)
 * 3. Giao việc cá nhân (Direct Cadre Assignment & Acceptance)
 * 4. Giao việc phòng ban (DEPT_xxx / Unit Assignment & Re-assignment)
 * 5. Giao việc phối hợp (Cross-department Coordination Branching & Sync)
 * 6. Phát sinh công việc (Incidental / Unplanned Task: Khóa KPI & Phê duyệt mở KPI)
 * 7. Hoàn thành công việc (Checklist Steps, Auto-progress 33%->67%->100% & Báo cáo)
 * 8. Đánh giá và nghiệm thu công việc (EVALUATE_APPROVE 4 thành tố A, B, C, D)
 * 9. Upload / Cập nhật đánh giá tư tưởng đạo đức (Mẫu 02 / HD05-TU & QĐ39-TU)
 * 10. Bảng báo cáo thống kê toàn cơ quan (Departmental Aggregation & Stats)
 * ==============================================================================
 */

describe('BTCTU - Toàn bộ vòng đời công việc Ban Tổ chức Tỉnh ủy Đắk Lắk', () => {
  // Services
  let tasksService: TasksService;
  let masterPlansService: MasterPlansService;
  let kpiEvaluationsService: KpiEvaluationsService;

  // Stateful In-Memory Database Store
  let dbMasterPlans: any[];
  let dbTasks: any[];
  let dbTaskSteps: any[];
  let dbTaskParticipants: any[];
  let dbTaskClosures: any[];
  let dbTaskHistories: any[];
  let dbEmployees: any[];
  let dbKpiPeriods: any[];
  let dbKpiEvaluations: any[];
  let dbKpiFormTemplates: any[];
  let dbKpiFormTemplateVersions: any[];

  // Mocks
  let mockPrisma: any;
  let mockShared: any;
  let mockWf: any;
  let mockNotif: any;
  let mockReportClient: any;
  let mockDocClient: any;
  let mockSysConfigClient: any;
  let mockCache: any;
  let mockTaskKpiService: any;

  // Shared Journey State IDs
  let deptTaskId: number;
  let coordTaskId: number;
  let coordSubtaskId: number;
  let incidentalTaskId: number;
  let step1: any;
  let step2: any;
  let step3: any;

  // Auto-increment IDs
  let planIdCounter = 1;
  let taskIdCounter = 1;
  let stepIdCounter = 1;
  let periodIdCounter = 1;
  let evalIdCounter = 1;

  beforeAll(() => {
    planIdCounter = 1;
    taskIdCounter = 1;
    stepIdCounter = 1;
    periodIdCounter = 1;
    evalIdCounter = 1;

    dbMasterPlans = [];
    dbTasks = [];
    dbTaskSteps = [];
    dbTaskParticipants = [];
    dbTaskClosures = [];
    dbTaskHistories = [];
    dbKpiPeriods = [];
    dbKpiEvaluations = [];
    dbKpiFormTemplates = [];
    dbKpiFormTemplateVersions = [];

    // Danh sách cán bộ nhân sự thực tế Ban Tổ chức Tỉnh ủy Đắk Lắk (theo Seed)
    dbEmployees = [
      { employeeCode: 'BTCTU_001', fullName: 'Nguyễn Thượng Hải', departmentId: 1, jobTitleId: 1, userId: '1' }, // Trưởng ban
      { employeeCode: 'BTCTU_002', fullName: 'Lưu Vĩnh Hưng', departmentId: 1, jobTitleId: 2, userId: '2' },   // Phó Trưởng ban
      { employeeCode: 'BTCTU_006', fullName: 'Nguyễn Thị Mai', departmentId: 3, jobTitleId: 5, userId: '6' },   // Trưởng phòng TCD_DV
      { employeeCode: 'BTCTU_010', fullName: 'Hoàng Đức Nam', departmentId: 2, jobTitleId: 4, userId: '10' },   // Trưởng phòng TCCB
      { employeeCode: 'BTCTU_013', fullName: 'Nguyễn Tiến Đạt', departmentId: 2, jobTitleId: 10, userId: '13' }, // Chuyên viên chính P_TCCB
      { employeeCode: 'BTCTU_014', fullName: 'Ngô Thanh Tùng', departmentId: 4, jobTitleId: 6, userId: '14' },   // Trưởng phòng BVCTNB
      { employeeCode: 'BTCTU_017', fullName: 'Phan Thành Trung', departmentId: 4, jobTitleId: 11, userId: '17' }, // Cán bộ thẩm tra P_BVCTNB
      { employeeCode: 'BTCTU_018', fullName: 'Trần Văn Bình', departmentId: 5, jobTitleId: 7, userId: '18' },    // Chánh Văn phòng Ban
      { employeeCode: 'UNASSIGNED', fullName: 'Chưa phân công', departmentId: 0, jobTitleId: 0, userId: '0' },
    ];

    mockPrisma = {
      $transaction: jest.fn().mockImplementation(async (callback: any) => callback(mockPrisma)),
      masterPlan: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          const item = {
            id: planIdCounter++,
            title: data.title,
            description: data.description,
            type: data.type,
            startDate: data.startDate,
            endDate: data.endDate,
            documentId: data.documentId || null,
            departmentId: data.departmentId || null,
            createdByCode: data.createdByCode,
            status: data.status || 'ACTIVE',
            tasks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dbMasterPlans.push(item);
          return item;
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          const plan = dbMasterPlans.find((p) => p.id === where.id);
          if (!plan) return null;
          const planTasks = dbTasks.filter((t) => t.planId === plan.id);
          return {
            ...plan,
            tasks: planTasks.map((t) => ({
              ...t,
              participants: dbTaskParticipants.filter((p) => p.taskId === t.id),
            })),
          };
        }),
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbMasterPlans.map((p) => ({
            ...p,
            tasks: dbTasks.filter((t) => t.planId === p.id).map((t) => ({
              ...t,
              participants: dbTaskParticipants.filter((pt) => pt.taskId === t.id),
            })),
          }));
        }),
        count: jest.fn().mockImplementation(async () => dbMasterPlans.length),
      },
      task: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          const task = {
            id: taskIdCounter++,
            parentId: data.parentId || null,
            title: data.title,
            description: data.description || '',
            status: data.status || 'TODO',
            priority: data.priority || 'MEDIUM',
            type: data.type || 'TASK',
            meetingLink: data.meetingLink || null,
            startDate: data.startDate || null,
            dueDate: data.dueDate || null,
            completedAt: null,
            progress: 0,
            isCompleted: false,
            creatorEmployeeCode: data.creatorEmployeeCode,
            planId: data.planId || null,
            domainId: data.domainId || null,
            monitoredUnitId: data.monitoredUnitId || null,
            organizationId: data.organizationId || 'BTCTU_DAKLAK',
            metadata: data.metadata || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            participants: [],
            plan: data.planId ? dbMasterPlans.find((p) => p.id === data.planId) || null : null,
          };
          dbTasks.push(task);
          return task;
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          const task = dbTasks.find((t) => t.id === where.id);
          if (!task) return null;
          const participants = dbTaskParticipants.filter((p) => p.taskId === task.id).map((p) => {
            const emp = dbEmployees.find((e) => e.employeeCode === p.employeeCode);
            return {
              ...p,
              employee: emp ? { fullName: emp.fullName, employeeCode: emp.employeeCode, departmentId: emp.departmentId, jobTitleId: emp.jobTitleId } : null,
            };
          });
          const plan = task.planId ? dbMasterPlans.find((p) => p.id === task.planId) || null : null;
          return { ...task, participants, plan };
        }),
        findFirst: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTasks.find((t) => {
            if (where.parentId && t.parentId !== where.parentId) return false;
            if (where.monitoredUnitId && t.monitoredUnitId !== where.monitoredUnitId) return false;
            if (where.isDeleted !== undefined && t.isDeleted !== where.isDeleted) return false;
            return true;
          }) || null;
        }),
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTasks.filter((t) => {
            if (where?.id?.in && !where.id.in.includes(t.id)) return false;
            if (where?.planId && t.planId !== where.planId) return false;
            if (where?.monitoredUnitId && t.monitoredUnitId !== where.monitoredUnitId) return false;
            return true;
          });
        }),
        update: jest.fn().mockImplementation(async ({ where, data }: any) => {
          const idx = dbTasks.findIndex((t) => t.id === where.id);
          if (idx === -1) return null;
          const current = dbTasks[idx];
          const updated = {
            ...current,
            ...data,
            metadata: data.metadata !== undefined ? { ...((current.metadata as any) || {}), ...data.metadata } : current.metadata,
            updatedAt: new Date(),
          };
          dbTasks[idx] = updated;

          const participants = dbTaskParticipants.filter((p) => p.taskId === updated.id).map((p) => {
            const emp = dbEmployees.find((e) => e.employeeCode === p.employeeCode);
            return {
              ...p,
              employee: emp ? { fullName: emp.fullName, employeeCode: emp.employeeCode, departmentId: emp.departmentId, jobTitleId: emp.jobTitleId } : null,
            };
          });
          const plan = updated.planId ? dbMasterPlans.find((p) => p.id === updated.planId) || null : null;
          return { ...updated, participants, plan };
        }),
        count: jest.fn().mockImplementation(async () => dbTasks.length),
        fields: {
          dueDate: { modelName: 'Task', name: 'dueDate', typeName: 'DateTime' } as any,
          completedAt: { modelName: 'Task', name: 'completedAt', typeName: 'DateTime' } as any,
        },
      },
      taskStep: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          const step = {
            id: stepIdCounter++,
            taskId: data.taskId,
            title: data.title,
            order: data.order || 1,
            status: data.status || 'TODO',
            baseScore: data.baseScore || 0,
            assigneeCode: data.assigneeCode || null,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dbTaskSteps.push(step);
          return step;
        }),
        createMany: jest.fn().mockImplementation(async ({ data }: any) => {
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            dbTaskSteps.push({
              id: stepIdCounter++,
              taskId: item.taskId,
              title: item.title,
              order: item.order || 1,
              status: item.status || 'TODO',
              baseScore: item.baseScore || 0,
              assigneeCode: item.assigneeCode || null,
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return { count: items.length };
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskSteps.find((s) => s.id === where.id && (where.taskId ? s.taskId === where.taskId : true)) || null;
        }),
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskSteps.filter((s) => s.taskId === where.taskId && (where.isDeleted !== undefined ? s.isDeleted === where.isDeleted : true));
        }),
        update: jest.fn().mockImplementation(async ({ where, data }: any) => {
          const idx = dbTaskSteps.findIndex((s) => s.id === where.id);
          if (idx === -1) return null;
          dbTaskSteps[idx] = { ...dbTaskSteps[idx], ...data, updatedAt: new Date() };
          return dbTaskSteps[idx];
        }),
        updateMany: jest.fn().mockImplementation(async ({ where, data }: any) => {
          let count = 0;
          for (let i = 0; i < dbTaskSteps.length; i++) {
            if (dbTaskSteps[i].id === where.id && dbTaskSteps[i].taskId === where.taskId) {
              dbTaskSteps[i] = { ...dbTaskSteps[i], ...data };
              count++;
            }
          }
          return { count };
        }),
      },
      taskParticipant: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          const p = {
            id: dbTaskParticipants.length + 1,
            taskId: data.taskId,
            employeeCode: data.employeeCode,
            participantRole: data.participantRole,
            status: data.status || 'PENDING_ACCEPTANCE',
            contributionPercentage: data.contributionPercentage ?? 100,
          };
          dbTaskParticipants.push(p);
          return p;
        }),
        createMany: jest.fn().mockImplementation(async ({ data }: any) => {
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            dbTaskParticipants.push({
              id: dbTaskParticipants.length + 1,
              taskId: item.taskId,
              employeeCode: item.employeeCode,
              participantRole: item.participantRole,
              status: item.status || 'PENDING_ACCEPTANCE',
              contributionPercentage: item.contributionPercentage ?? 100,
            });
          }
          return { count: items.length };
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          const compound = where.taskId_employeeCode_participantRole;
          if (compound) {
            return dbTaskParticipants.find(
              (p) => p.taskId === compound.taskId && p.employeeCode === compound.employeeCode && p.participantRole === compound.participantRole
            ) || null;
          }
          return null;
        }),
        findFirst: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskParticipants.find((p) => {
            if (p.taskId !== where.taskId) return false;
            if (where.employeeCode && p.employeeCode !== where.employeeCode) return false;
            if (where.participantRole) {
              if (typeof where.participantRole === 'string' && p.participantRole !== where.participantRole) return false;
              if (where.participantRole.in && !where.participantRole.in.includes(p.participantRole)) return false;
            }
            return true;
          }) || null;
        }),
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskParticipants
            .filter((p) => {
              if (where?.taskId && p.taskId !== where.taskId) return false;
              if (where?.employeeCode && p.employeeCode !== where.employeeCode) return false;
              return true;
            })
            .map((p) => ({
              ...p,
              task: dbTasks.find((t) => t.id === p.taskId) || null,
            }));
        }),
        update: jest.fn().mockImplementation(async ({ where, data }: any) => {
          const compound = where.taskId_employeeCode_participantRole;
          const idx = dbTaskParticipants.findIndex(
            (p) => p.taskId === compound.taskId && p.employeeCode === compound.employeeCode && p.participantRole === compound.participantRole
          );
          if (idx !== -1) {
            dbTaskParticipants[idx] = { ...dbTaskParticipants[idx], ...data };
            return dbTaskParticipants[idx];
          }
          return null;
        }),
        updateMany: jest.fn().mockImplementation(async ({ where, data }: any) => {
          let count = 0;
          for (let i = 0; i < dbTaskParticipants.length; i++) {
            if (dbTaskParticipants[i].taskId === where.taskId && where.employeeCode?.in?.includes(dbTaskParticipants[i].employeeCode)) {
              dbTaskParticipants[i] = { ...dbTaskParticipants[i], ...data };
              count++;
            }
          }
          return { count };
        }),
        deleteMany: jest.fn().mockImplementation(async () => ({ count: 0 })),
        groupBy: jest.fn().mockImplementation(async () => []),
      },
      taskClosure: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          dbTaskClosures.push(data);
          return data;
        }),
        createMany: jest.fn().mockImplementation(async ({ data }: any) => {
          const items = Array.isArray(data) ? data : [data];
          dbTaskClosures.push(...items);
          return { count: items.length };
        }),
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskClosures.filter((c) => {
            if (where.ancestorId !== undefined && c.ancestorId !== where.ancestorId) return false;
            if (where.descendantId !== undefined && c.descendantId !== where.descendantId) return false;
            if (where.depth !== undefined && c.depth !== where.depth) return false;
            return true;
          });
        }),
        findFirst: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskClosures.find((c) => {
            if (where.ancestorId !== undefined && c.ancestorId !== where.ancestorId) return false;
            if (where.descendantId !== undefined && c.descendantId !== where.descendantId) return false;
            if (where.depth !== undefined && c.depth !== where.depth) return false;
            return true;
          }) || null;
        }),
        count: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbTaskClosures.filter((c) => {
            if (where.ancestorId !== undefined && c.ancestorId !== where.ancestorId) return false;
            if (where.descendantId !== undefined && c.descendantId !== where.descendantId) return false;
            if (where.depth !== undefined && c.depth !== where.depth) return false;
            return true;
          }).length;
        }),
      },
      taskHistory: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          dbTaskHistories.push({ ...data, id: dbTaskHistories.length + 1, createdAt: new Date() });
          return data;
        }),
      },
      employee: {
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          if (where.employeeCode) return dbEmployees.find((e) => e.employeeCode === where.employeeCode) || null;
          if (where.userId) return dbEmployees.find((e) => e.userId === where.userId) || null;
          return null;
        }),
        findMany: jest.fn().mockImplementation(async ({ where }: any) => {
          if (where?.employeeCode?.in) {
            return dbEmployees.filter((e) => where.employeeCode.in.includes(e.employeeCode));
          }
          return dbEmployees;
        }),
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          dbEmployees.push(data);
          return data;
        }),
      },
      kpiPeriod: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          const period = {
            id: periodIdCounter++,
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dbKpiPeriods.push(period);
          return period;
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbKpiPeriods.find((p) => p.id === where.id) || null;
        }),
        findMany: jest.fn().mockImplementation(async () => dbKpiPeriods),
      },
      kpiEvaluation: {
        create: jest.fn().mockImplementation(async ({ data }: any) => {
          const item = {
            id: evalIdCounter++,
            employeeCode: data.employeeCode,
            periodId: data.periodId,
            totalScore: data.totalScore || 0,
            taskScoreSelf: data.taskScoreSelf || 0,
            generalScoreSelf: data.generalScoreSelf || 0,
            status: data.status || 'COMPUTING',
            reviewerCode: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          dbKpiEvaluations.push(item);
          return item;
        }),
        findFirst: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbKpiEvaluations.find((e) => e.employeeCode === where.employeeCode && (where.periodId ? e.periodId === where.periodId : true)) || null;
        }),
        findUnique: jest.fn().mockImplementation(async ({ where }: any) => {
          const evalItem = dbKpiEvaluations.find((e) => e.id === where.id);
          if (!evalItem) return null;
          const employee = dbEmployees.find((e) => e.employeeCode === evalItem.employeeCode);
          return { ...evalItem, employee, documents: [] };
        }),
        update: jest.fn().mockImplementation(async ({ where, data }: any) => {
          const idx = dbKpiEvaluations.findIndex((e) => e.id === where.id);
          if (idx !== -1) {
            dbKpiEvaluations[idx] = { ...dbKpiEvaluations[idx], ...data, updatedAt: new Date() };
            return dbKpiEvaluations[idx];
          }
          return null;
        }),
        findMany: jest.fn().mockImplementation(async () => dbKpiEvaluations),
      },
      kpiFormTemplate: {
        findMany: jest.fn().mockImplementation(async () => dbKpiFormTemplates),
        findFirst: jest.fn().mockImplementation(async ({ where }: any) => {
          return dbKpiFormTemplates.find((t) => t.formCode === where.formCode) || null;
        }),
        upsert: jest.fn().mockImplementation(async ({ create, update, where }: any) => {
          const existing = dbKpiFormTemplates.find((t) => t.formCode === where.formCode);
          if (existing) {
            Object.assign(existing, update);
            return existing;
          }
          const item = { ...create, id: dbKpiFormTemplates.length + 1 };
          dbKpiFormTemplates.push(item);
          return item;
        }),
        updateMany: jest.fn().mockImplementation(async () => ({ count: 1 })),
      },
      kpiFormTemplateVersion: {
        upsert: jest.fn().mockImplementation(async () => ({ id: 1 })),
        findFirst: jest.fn().mockImplementation(async () => null),
      },
      kpiFormTemplateBinding: {
        findMany: jest.fn().mockImplementation(async () => []),
      },
    };

    mockShared = {
      populateQueryHierarchy: jest.fn().mockResolvedValue(undefined),
      enrichTasks: jest.fn().mockImplementation(async (tasks: any[]) => {
        return tasks.map((t: any) => {
          const participants = dbTaskParticipants.filter((p) => p.taskId === t.id);
          const assignee = participants.find((p) => p.participantRole === 'ASSIGNEE');
          const owner = participants.find((p) => p.participantRole === 'OWNER');
          return {
            ...t,
            assigneeCode: assignee?.employeeCode || t.assigneeCode || 'UNASSIGNED',
            assignerCode: owner?.employeeCode || t.assignerCode || 'SYSTEM',
            participants,
          };
        });
      }),
      checkTaskAccess: jest.fn().mockImplementation(async (enriched: any, context: any) => {
        const actor = context?.currentEmployeeCode || context?.actorCode;
        const isLeader = actor === 'BTCTU_001' || actor === 'BTCTU_002';
        const isDeptLeader = actor === 'BTCTU_010' || actor === 'BTCTU_006' || actor === 'BTCTU_014';
        return {
          hasAccess: true,
          isOwner: enriched.creatorEmployeeCode === actor || enriched.assignerCode === actor,
          isAdmin: isLeader,
          isDeptLeader,
          isSupervisor: isLeader || isDeptLeader,
          isAssignee: enriched.assigneeCode === actor,
        };
      }),
      computeAllowedActions: jest.fn().mockResolvedValue(['VIEW', 'EDIT', 'ASSIGN', 'ADD_SUBTASK', 'COORDINATE']),
      computeAllowedActionsBatch: jest.fn().mockResolvedValue({}),
      toTaskResponse: jest.fn().mockImplementation((t) => t),
      toTaskResponseSummary: jest.fn().mockImplementation((t) => t),
      buildParticipantsData: jest.fn().mockImplementation((taskId: number, data: any) => {
        const res: any[] = [];
        if (data.assigneeCode) {
          res.push({
            taskId,
            employeeCode: data.assigneeCode,
            participantRole: TaskRole.ASSIGNEE,
            status: data.assigneeCode !== 'UNASSIGNED' ? 'PENDING_ACCEPTANCE' : 'TODO',
            contributionPercentage: 100,
          });
        }
        const assigner = data.assignerCode || data.creatorEmployeeCode;
        if (assigner) {
          res.push({
            taskId,
            employeeCode: assigner,
            participantRole: TaskRole.OWNER,
            status: 'ACCEPTED',
          });
        }
        if (Array.isArray(data.coassigneeCodes)) {
          for (const c of data.coassigneeCodes) {
            res.push({
              taskId,
              employeeCode: c,
              participantRole: TaskRole.COORDINATOR,
              status: 'PENDING_ACCEPTANCE',
              contributionPercentage: 0,
            });
          }
        }
        return res;
      }),
      buildScopingWhereClause: jest.fn().mockResolvedValue(null),
      toDelegationNode: jest.fn().mockImplementation((t) => t),
      sendTaskNotification: jest.fn(),
      getWorkflowIdByTrigger: jest.fn().mockResolvedValue(null),
      toProtoStruct: jest.fn().mockReturnValue({}),
      userService: {
        GetEmployeesByScope: jest.fn().mockReturnValue(of({ employee_codes: ['BTCTU_001', 'BTCTU_002', 'BTCTU_010', 'BTCTU_013', 'BTCTU_014', 'BTCTU_017'] })),
      },
      chatService: null,
      cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn() },
    };

    mockWf = {
      resolveWorkflowCode: jest.fn().mockResolvedValue('WF_BTCTU_QUAN_LY_CONG_VIEC'),
      getLocalInitialNodeId: jest.fn().mockResolvedValue(null),
      validateAndTransition: jest.fn().mockImplementation(async (task: any, actionName: string, actorContext: any) => {
        const isIncidental =
          task.metadata?.isIncidental ||
          task.taskType === 'UNPLANNED' ||
          task.metadata?.taskType === 'UNPLANNED' ||
          task.metadata?.incidentalStatus === 'PENDING_APPROVAL';

        // 1. Kiểm soát việc phát sinh chưa được Lãnh đạo thẩm định phê duyệt
        if (isIncidental && task.status === 'PENDING_APPROVAL') {
          if (actionName === 'APPROVE_INCIDENTAL' || actionName === 'APPROVE_TASK_INCIDENTAL') {
            return {
              allowed: true,
              targetStatus: 'IN_PROGRESS',
              reason: 'Lãnh đạo phụ trách đã phê duyệt việc phát sinh.',
            };
          }
          if (actionName === 'REJECT_INCIDENTAL') {
            return {
              allowed: true,
              targetStatus: 'REJECTED',
              isCompleted: false,
            };
          }
          return {
            allowed: false,
            reason: 'Công việc phát sinh đang chờ Lãnh đạo phụ trách thẩm định phê duyệt. Chưa thể tiếp nhận hoặc thực hiện.',
          };
        }

        // 2. Chuyển trạng thái thông thường
        if (actionName === 'ACCEPT') {
          return { allowed: true, targetStatus: 'IN_PROGRESS' };
        }
        if (actionName === 'SUBMIT_FOR_REVIEW') {
          return { allowed: true, targetStatus: 'REVIEWING' };
        }
        if (actionName === 'EVALUATE_APPROVE') {
          return { allowed: true, targetStatus: 'COMPLETED', isCompleted: true };
        }

        return { allowed: true, targetStatus: actionName };
      }),
      getCurrentNodeData: jest.fn().mockResolvedValue(null),
      resolveNotificationConfig: jest.fn().mockReturnValue({ sendNotify: true, nodeLabel: 'Giao việc' }),
      seedStepsFromNode: jest.fn().mockResolvedValue(undefined),
    };

    mockNotif = {
      notifyNewTask: jest.fn().mockResolvedValue(undefined),
      notifyTransition: jest.fn().mockResolvedValue(undefined),
      notifyApprovalRequired: jest.fn().mockResolvedValue(undefined),
    };

    mockReportClient = {
      emit: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
    };

    mockDocClient = { getService: jest.fn().mockReturnValue({}) };
    mockSysConfigClient = { getService: jest.fn().mockReturnValue({}) };
    mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
    mockTaskKpiService = {
      getTaskKpiSetting: jest.fn().mockResolvedValue({
        data: {
          formula: 'STANDARD',
          alpha: 0.4,
          beta: 0.3,
          gamma: 0.2,
          delta: 0.1,
        },
      }),
      evaluateTaskScore: jest.fn().mockReturnValue(96.0),
    };

    tasksService = new TasksService(
      mockPrisma,
      mockShared,
      mockWf,
      mockNotif,
      mockReportClient
    );

    masterPlansService = new MasterPlansService(
      mockPrisma,
      mockShared
    );

    kpiEvaluationsService = new KpiEvaluationsService(
      mockPrisma,
      mockCache,
      mockTaskKpiService,
      mockDocClient,
      mockSysConfigClient
    );
  });

  // ============================================================================
  // GIAI ĐOẠN 1: LÊN KẾ HOẠCH (MASTER PLAN)
  // ============================================================================
  describe('Giai đoạn 1: Lên kế hoạch (Master Plan)', () => {
    it('1.1 Trưởng ban Tổ chức Tỉnh ủy (BTCTU_001) khởi tạo Kế hoạch công tác Quý IV/2026', async () => {
      const planInput = {
        title: 'Kế hoạch công tác Quý IV/2026 - Ban Tổ chức Tỉnh ủy Đắk Lắk',
        description: 'Kế hoạch trọng tâm về công tác cán bộ, thẩm tra chính trị nội bộ và củng cố tổ chức cơ sở đảng',
        type: 'QUARTERLY',
        departmentId: 2, // Phòng Tổ chức cán bộ
        createdByCode: 'BTCTU_001', // Nguyễn Thượng Hải - Trưởng ban
        startDate: '2026-10-01',
        endDate: '2026-12-31',
      };

      const plan = await masterPlansService.create(planInput);

      expect(plan).toBeDefined();
      expect(plan!.id).toBe(1);
      expect(plan!.title).toBe(planInput.title);
      expect(plan!.type).toBe('QUARTERLY');
      expect(plan!.departmentId).toBe(2);
      expect(plan!.createdByCode).toBe('BTCTU_001');

      // Kiểm tra đọc lại kế hoạch
      const retrieved = await masterPlansService.findById(1, { currentEmployeeCode: 'BTCTU_001', isAdmin: true });
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.permissions.canEdit).toBe(true);
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 2 & 3: GIAO VIỆC VÀ GIAO VIỆC CÁ NHÂN GẮN VỚI KẾ HOẠCH
  // ============================================================================
  describe('Giai đoạn 2 & 3: Giao việc & Giao việc cá nhân gắn với Kế hoạch', () => {
    it('2.1 Khởi tạo việc gắn với Kế hoạch Quý IV/2026 và giao đích danh Chuyên viên chính (BTCTU_013)', async () => {
      const taskInput = {
        title: 'Thẩm định hồ sơ bổ nhiệm cán bộ diện Ban Thường vụ Tỉnh ủy quản lý',
        description: 'Rà soát tiêu chuẩn chức danh, Mẫu 2C, quy hoạch và bảo vệ chính trị nội bộ',
        planId: 1,
        assigneeCode: 'BTCTU_013', // Nguyễn Tiến Đạt - Chuyên viên P_TCCB
        assignerCode: 'BTCTU_001', // Nguyễn Thượng Hải - Trưởng ban
        creatorEmployeeCode: 'BTCTU_001',
        departmentId: 2, // Phòng TCCB
        priority: 'HIGH',
        type: 'TASK',
        startDate: '2026-10-15',
        dueDate: '2026-10-25',
        baseScore: 100,
        weight: 1.5,
        currentEmployeeCode: 'BTCTU_001',
        currentUserPermissions: ['TASK:MANAGE'],
      };

      const created = await tasksService.createTask(taskInput);

      expect(created).toBeDefined();
      expect(created.planId).toBe(1);
      expect(created.status).toBe('PENDING_ACCEPTANCE');

      // Kiểm tra TaskClosure được tạo ở mức root (depth = 0)
      const closure = dbTaskClosures.find((c) => c.ancestorId === created.id && c.descendantId === created.id);
      expect(closure).toBeDefined();
      expect(closure.depth).toBe(0);

      // Kiểm tra TaskHistory ghi nhận vết khởi tạo
      const history = dbTaskHistories.find((h) => h.taskId === created.id);
      expect(history).toBeDefined();
      expect(history.action).toBe('Khởi tạo công việc');
    });

    it('3.1 Chuyên viên (BTCTU_013) tiếp nhận nhiệm vụ (ACCEPT) chuyển sang IN_PROGRESS', async () => {
      // Giả định task id = 1 đang ở trạng thái PENDING_ACCEPTANCE
      const result = await tasksService.updateTaskStatus(
        1,
        'IN_PROGRESS',
        undefined,
        'BTCTU_013',
        { currentEmployeeCode: 'BTCTU_013' },
        'ACCEPT'
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('IN_PROGRESS');

      // Kiểm tra DB state thực tế
      const inDb = dbTasks.find((t) => t.id === 1);
      expect(inDb.status).toBe('IN_PROGRESS');
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 4: GIAO VIỆC PHÒNG BAN (DEPT_xxx / UNIT ASSIGNMENT)
  // ============================================================================
  describe('Giai đoạn 4: Giao việc phòng ban (DEPT_xxx / Monitored Unit Assignment)', () => {
    it('4.1 Lãnh đạo Ban giao việc cho cả Phòng Tổ chức đảng, đảng viên (DEPT_3)', async () => {
      const deptTaskInput = {
        title: 'Hướng dẫn công tác chuẩn bị nhân sự đại hội chi bộ cơ sở năm 2026',
        description: 'Phòng Tổ chức đảng chủ trì rà soát số lượng, cơ cấu cấp ủy cơ sở',
        assigneeCode: 'UNASSIGNED', // Giao toàn đơn vị Phòng Tổ chức đảng
        assignerCode: 'BTCTU_002', // Lưu Vĩnh Hưng - Phó Trưởng ban
        creatorEmployeeCode: 'BTCTU_002',
        departmentId: 3,
        monitoredUnitId: 3,
        priority: 'MEDIUM',
        currentEmployeeCode: 'BTCTU_002',
      };

      const created = await tasksService.createTask(deptTaskInput);
      deptTaskId = created.id;

      expect(created).toBeDefined();
      expect(created.monitoredUnitId).toBe(3);
    });

    it('4.2 Trưởng phòng TCD_DV (BTCTU_006) nhận việc và phân công lại (re-assign) cho chuyên viên trong phòng', async () => {
      const assignData = {
        assigneeCode: 'BTCTU_006',
        currentEmployeeCode: 'BTCTU_006',
        currentUserPermissions: ['TASK:ASSIGN'],
      };

      const result = await tasksService.assignTask(deptTaskId, assignData);

      expect(result).toBeDefined();
      expect(result.status).toBe('PENDING_ACCEPTANCE');

      const participant = dbTaskParticipants.find((p) => p.taskId === deptTaskId && p.employeeCode === 'BTCTU_006');
      expect(participant).toBeDefined();
      expect(participant.participantRole).toBe(TaskRole.ASSIGNEE);
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 5: GIAO VIỆC PHỐI HỢP ĐA PHÒNG BAN (COORDINATION BRANCHING)
  // ============================================================================
  describe('Giai đoạn 5: Giao việc phối hợp đa phòng ban (Cross-department Coordination Branching)', () => {
    it('5.1 Tạo việc chủ trì tại Phòng TCCB (2) và giao phối hợp Phòng Bảo vệ chính trị nội bộ (4)', async () => {
      const coordTaskInput = {
        title: 'Thẩm tra lý lịch chính trị nội bộ đối với nhân sự diện Tỉnh ủy quản lý',
        description: 'Phòng TCCB chủ trì rà soát hồ sơ; Phòng BVCTNB phối hợp thẩm tra kết luận tiêu chuẩn chính trị',
        assigneeCode: 'BTCTU_013', // Chuyên viên chính P_TCCB
        assignerCode: 'BTCTU_001', // Trưởng ban
        creatorEmployeeCode: 'BTCTU_001',
        departmentId: 2,
        coordinatingDepartmentIds: [4], // Phòng Bảo vệ chính trị nội bộ
        priority: 'HIGH',
        dueDate: '2026-11-15',
        currentEmployeeCode: 'BTCTU_001',
      };

      const mainTask = await tasksService.createTask(coordTaskInput);
      coordTaskId = mainTask.id;

      expect(mainTask).toBeDefined();

      // Tự động sinh nhánh subtask phối hợp mang prefix [Phối hợp] cho Phòng BVCTNB (4)
      const coordSubtask = dbTasks.find((t) => t.parentId === coordTaskId && t.monitoredUnitId === 4);
      expect(coordSubtask).toBeDefined();
      coordSubtaskId = coordSubtask.id;
      expect(coordSubtask.title).toContain('[Phối hợp]');
      expect(coordSubtask.metadata.isCoordinationBranch).toBe(true);
      expect(coordSubtask.metadata.coordinatingDepartmentId).toBe(4);

      // Kiểm tra TaskClosure giữa task cha và nhánh phối hợp (depth = 1)
      const closure = dbTaskClosures.find((c) => c.ancestorId === coordTaskId && c.descendantId === coordSubtaskId);
      expect(closure).toBeDefined();
      expect(closure.depth).toBe(1);
    });

    it('5.2 Trưởng phòng BVCTNB (BTCTU_014) phân công cán bộ (BTCTU_017) -> Hệ thống tự động đồng bộ vai trò COORDINATOR lên task cha', async () => {
      const assignSubtaskData = {
        assigneeCode: 'BTCTU_017', // Phan Thành Trung - Cán bộ thẩm tra P_BVCTNB
        currentEmployeeCode: 'BTCTU_014', // Ngô Thanh Tùng - Trưởng phòng BVCTNB
        currentUserPermissions: ['TASK:ASSIGN'],
      };

      await tasksService.assignTask(coordSubtaskId, assignSubtaskData);

      // Cán bộ BTCTU_017 phải được tự động đồng bộ lên task cha với vai trò COORDINATOR
      const syncedCoordinator = dbTaskParticipants.find(
        (p) => p.taskId === coordTaskId && p.employeeCode === 'BTCTU_017' && p.participantRole === TaskRole.COORDINATOR
      );
      expect(syncedCoordinator).toBeDefined();
      expect(syncedCoordinator.status).toBe('ACCEPTED');
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 6: PHÁT SINH CÔNG VIỆC (INCIDENTAL TASK & KPI LOCKING)
  // ============================================================================
  describe('Giai đoạn 6: Phát sinh công việc (Incidental / Unplanned Task)', () => {
    let incidentalTaskId: number;

    it('6.1 Chuyên viên (BTCTU_013) khởi tạo việc phát sinh đột xuất -> Ban đầu bị KHÓA KPI và ở PENDING_APPROVAL', async () => {
      const incidentalInput = {
        title: 'Kiểm tra đột xuất hồ sơ cán bộ theo phản ánh của Thường trực Tỉnh ủy',
        description: 'Vụ việc phát sinh ngoài kế hoạch cần xử lý gấp trong 48h',
        taskType: 'UNPLANNED',
        isIncidental: true,
        assigneeCode: 'BTCTU_013',
        creatorEmployeeCode: 'BTCTU_013',
        departmentId: 2,
        currentEmployeeCode: 'BTCTU_013',
      };

      const created = await tasksService.createTask(incidentalInput);

      expect(created).toBeDefined();
      incidentalTaskId = created.id;
      expect(created.status).toBe('PENDING_APPROVAL');
      expect(created.metadata.isIncidental).toBe(true);
      expect(created.metadata.isKpiTarget).toBe(false); // Chưa duyệt -> KHÔNG tính KPI
      expect(created.metadata.incidentalStatus).toBe('PENDING_APPROVAL');
    });

    it('6.2 Chặn mọi hành động tiếp nhận/xử lý khi việc phát sinh chưa được Lãnh đạo thẩm định duyệt', async () => {
      await expect(
        tasksService.updateTaskStatus(
          incidentalTaskId,
          'IN_PROGRESS',
          undefined,
          'BTCTU_013',
          { currentEmployeeCode: 'BTCTU_013' },
          'ACCEPT'
        )
      ).rejects.toThrow('Công việc phát sinh đang chờ Lãnh đạo phụ trách thẩm định phê duyệt');
    });

    it('6.3 Phó Trưởng ban phụ trách (BTCTU_002) thẩm định và phê duyệt (APPROVE_INCIDENTAL) -> Mở khóa KPI và chuyển sang IN_PROGRESS', async () => {
      const approvedResult = await tasksService.updateTaskStatus(
        incidentalTaskId,
        'IN_PROGRESS',
        undefined,
        'BTCTU_002', // Lưu Vĩnh Hưng - Phó Trưởng ban
        { currentEmployeeCode: 'BTCTU_002', evidence: 'Đồng ý chủ trương xử lý khẩn cấp và tính điểm KPI theo quy định' },
        'APPROVE_INCIDENTAL'
      );

      expect(approvedResult).toBeDefined();
      expect(approvedResult.status).toBe('IN_PROGRESS');

      // Kiểm tra DB state
      const taskInDb = dbTasks.find((t) => t.id === incidentalTaskId);
      expect(taskInDb.metadata.isKpiTarget).toBe(true); // Đã MỞ KHÓA KPI!
      expect(taskInDb.metadata.incidentalStatus).toBe('APPROVED');
      expect(taskInDb.metadata.approvedIncidentalBy).toBe('BTCTU_002');
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 7: HOÀN THÀNH CÔNG VIỆC (CHECKLIST STEPS & AUTO-PROGRESS)
  // ============================================================================
  describe('Giai đoạn 7: Hoàn thành công việc (Checklist Steps, Auto-progress & Deliverable Submission)', () => {
    let targetTaskId: number;
    let step1: any;
    let step2: any;
    let step3: any;

    beforeEach(() => {
      targetTaskId = coordTaskId; // Dùng task thẩm tra chính trị nội bộ
    });

    it('7.1 Thiết lập 3 bước thực hiện (Checklist) cho nhiệm vụ thẩm tra', async () => {
      step1 = (await tasksService.createStep(targetTaskId, {
        title: 'Bước 1: Tiếp nhận và đối chiếu hồ sơ Mẫu 2C',
        order: 1,
        assigneeCode: 'BTCTU_013',
      })).data;

      step2 = (await tasksService.createStep(targetTaskId, {
        title: 'Bước 2: Phối hợp Phòng BVCTNB thẩm tra lý lịch chính trị',
        order: 2,
        assigneeCode: 'BTCTU_017',
      })).data;

      step3 = (await tasksService.createStep(targetTaskId, {
        title: 'Bước 3: Dự thảo Tờ trình và Kết luận thẩm tra',
        order: 3,
        assigneeCode: 'BTCTU_013',
      })).data;

      expect(step1).toBeDefined();
      expect(step2).toBeDefined();
      expect(step3).toBeDefined();
    });

    it('7.2 Hoàn thành từng bước tuần tự & nhánh phối hợp -> Tiến độ tự động tính toán (25% -> 50% -> 75% -> 100%)', async () => {
      // Hoàn thành Bước 1 (1/4 hạng mục = 25%)
      await tasksService.updateStep(targetTaskId, step1.id, {
        status: 'COMPLETED',
        actorCode: 'BTCTU_013',
      });
      let task = dbTasks.find((t) => t.id === targetTaskId);
      expect(task.progress).toBe(25);

      // Hoàn thành Bước 2 (2/4 hạng mục = 50%)
      await tasksService.updateStep(targetTaskId, step2.id, {
        status: 'COMPLETED',
        actorCode: 'BTCTU_017',
      });
      task = dbTasks.find((t) => t.id === targetTaskId);
      expect(task.progress).toBe(50);

      // Hoàn thành Bước 3 (3/4 hạng mục = 75%)
      await tasksService.updateStep(targetTaskId, step3.id, {
        status: 'COMPLETED',
        actorCode: 'BTCTU_013',
      });
      task = dbTasks.find((t) => t.id === targetTaskId);
      expect(task.progress).toBe(75);

      // Phòng BVCTNB hoàn thành nội dung phối hợp -> Cả 4/4 hạng mục đạt 100%
      await tasksService.updateTaskStatus(
        coordSubtaskId,
        'COMPLETED',
        undefined,
        'BTCTU_017',
        { currentEmployeeCode: 'BTCTU_017' }
      );
      await tasksService.autoComputeTaskProgress(targetTaskId);
      task = dbTasks.find((t) => t.id === targetTaskId);
      expect(task.progress).toBe(100);
    });

    it('7.3 Chuyên viên nộp sản phẩm hoàn thành (SUBMIT_FOR_REVIEW) chuyển sang REVIEWING', async () => {
      const submitted = await tasksService.updateTaskStatus(
        targetTaskId,
        'REVIEWING',
        undefined,
        'BTCTU_013',
        {
          currentEmployeeCode: 'BTCTU_013',
          evidence: 'Báo cáo kết luận thẩm tra số 88-KL/BTCTU ngày 20/10/2026 đính kèm',
        },
        'SUBMIT_FOR_REVIEW'
      );

      expect(submitted).toBeDefined();
      expect(submitted.status).toBe('REVIEWING');
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 8: ĐÁNH GIÁ VÀ NGHIỆM THU CÔNG VIỆC (EVALUATE_APPROVE 4 THÀNH TỐ)
  // ============================================================================
  describe('Giai đoạn 8: Đánh giá và Nghiệm thu công việc (EVALUATE_APPROVE)', () => {
    it('8.1 Trưởng ban Tổ chức Tỉnh ủy (BTCTU_001) đánh giá 4 thành tố (A, B, C, D) và nghiệm thu hoàn thành', async () => {
      const evaluationPayload = {
        scores: {
          volumeA: 100,     // 100% Khối lượng
          qualityB: 95,     // Chất lượng chuẩn, hồ sơ chặt chẽ
          progressC: 100,   // Hoàn thành đúng tiến độ
          attitudeD: 100,   // Tinh thần trách nhiệm cao
          finalScore: 96,   // Điểm chốt KPI
          rating: 'HOAN_THANH_XUAT_SAC',
        },
        feedback: 'Hồ sơ thẩm tra rất đầy đủ căn cứ, kịp thời phục vụ phiên họp Thường trực Tỉnh ủy.',
      };

      const result = await tasksService.updateTaskStatus(
        coordTaskId,
        'COMPLETED',
        undefined,
        'BTCTU_001', // Nguyễn Thượng Hải - Trưởng ban
        {
          currentEmployeeCode: 'BTCTU_001',
          evidenceData: evaluationPayload,
        },
        'EVALUATE_APPROVE'
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('COMPLETED');
      expect(result.isCompleted).toBe(true);

      const taskInDb = dbTasks.find((t) => t.id === coordTaskId);
      expect(taskInDb.isCompleted).toBe(true);
      expect(taskInDb.completedAt).toBeDefined();
      expect(taskInDb.metadata.evaluation.scores.finalScore).toBe(96);
      expect(taskInDb.metadata.evaluation.evaluatedBy).toBe('BTCTU_001');

      // Xác nhận gửi sự kiện đồng bộ CQRS sang Report Service
      expect(mockReportClient.emit).toHaveBeenCalledWith(
        'task.completed',
        expect.objectContaining({ taskId: coordTaskId })
      );
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 9: UPLOAD & CẬP NHẬT ĐÁNH GIÁ TƯ TƯỞNG ĐẠO ĐỨC (MẪU 02 / HD05-TU)
  // ============================================================================
  describe('Giai đoạn 9: Upload & Cập nhật đánh giá tư tưởng đạo đức (Mẫu 02 / HD05-TU & QĐ39-TU)', () => {
    let periodId: number;

    it('9.1 Khởi tạo Kỳ đánh giá Quý IV/2026 tại KpiEvaluationsService', async () => {
      const period = await kpiEvaluationsService.createPeriod({
        name: 'Kỳ đánh giá Quý IV/2026 - Ban Tổ chức Tỉnh ủy',
        startDate: '2026-10-01',
        endDate: '2026-12-31',
      });

      expect(period).toBeDefined();
      expect(period.name).toContain('Quý IV/2026');
      periodId = period.id;
    });

    it('9.2 Kiểm tra và xác thực cú pháp XML chuẩn của Mẫu 02 (Bản tự kiểm điểm tư tưởng, đạo đức)', async () => {
      // Lấy danh sách mẫu chuẩn BTCTU
      const templateMeta = DEFAULT_KPI_FORM_TEMPLATES.find((t) => t.formCode === 'MAU_02' || t.formCode === 'M02_TUKIEMDIEM');
      expect(templateMeta).toBeDefined();

      const xmlContent = getTemplateXmlContent(templateMeta!.formCode);
      expect(xmlContent).toBeDefined();

      // Xác thực cú pháp XML hợp lệ
      const validation = validateXmlSyntax(xmlContent);
      expect(validation.isValid).toBe(true);
      expect(xmlContent).toContain('KpiFormDocument');
    });

    it('9.3 Tính điểm KPI tự động cho cán bộ (BTCTU_013): 30đ Tiêu chí chung (Tư tưởng, đạo đức) + 70đ Nhiệm vụ', async () => {
      // Đảm bảo period có trong dbKpiPeriods
      expect(dbKpiPeriods.length).toBeGreaterThan(0);

      const kpiResult = await kpiEvaluationsService.calculatePersonalKpi({
        periodId,
        employeeCode: 'BTCTU_013',
      });

      expect(kpiResult.success).toBe(true);
      expect(kpiResult.evaluationId).toBeDefined();
      expect(kpiResult.totalScore).toBeGreaterThanOrEqual(90); // Đạt xuất sắc
      expect(kpiResult.xmlContent).toContain('<KpiEvaluationDocument>');

      // Chuyên viên nộp phiếu tự đánh giá (SUBMITTED)
      const submitResult = await kpiEvaluationsService.submitSelfScore(kpiResult.evaluationId, {});
      expect(submitResult.success).toBe(true);

      // Lãnh đạo thẩm định và chốt phiếu đánh giá (APPROVED)
      const approveResult = await kpiEvaluationsService.approveReviewerScore(kpiResult.evaluationId, {}, 'BTCTU_001');
      expect(approveResult.success).toBe(true);

      const evalInDb = dbKpiEvaluations.find((e) => e.id === kpiResult.evaluationId);
      expect(evalInDb.status).toBe('APPROVED');
    });
  });

  // ============================================================================
  // GIAI ĐOẠN 10: BẢNG BÁO CÁO THỐNG KÊ TOÀN CƠ QUAN BAN TỔ CHỨC TỈNH ỦY
  // ============================================================================
  describe('Giai đoạn 10: Bảng báo cáo thống kê toàn cơ quan Ban Tổ chức Tỉnh ủy', () => {
    it('10.1 Tổng hợp số liệu công việc theo các phòng ban thuộc Ban Tổ chức Tỉnh ủy', async () => {
      const recommendation = await tasksService.recommendAssignees({
        currentEmployeeCode: 'BTCTU_001',
        currentUserPermissions: ['TASK:MANAGE'],
      });

      expect(recommendation.success).toBe(true);
      expect(recommendation.data.topDepartments).toBeDefined();

      // Thống kê số lượng nhiệm vụ toàn cơ quan
      const totalInUnit = dbTasks.length;
      expect(totalInUnit).toBeGreaterThanOrEqual(3);
      const completedInUnit = dbTasks.filter((t) => t.isCompleted).length;
      expect(completedInUnit).toBeGreaterThanOrEqual(1);
    });

    it('10.2 Kiểm tra danh sách nhiệm vụ của đơn vị không bị rò rỉ dữ liệu ngoài Ban Tổ chức Tỉnh ủy', async () => {
      const result = await tasksService.listTasks({
        currentEmployeeCode: 'BTCTU_001',
        isAdmin: true,
        limit: 10,
        page: 1,
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBeGreaterThanOrEqual(3);

      for (const t of result.data) {
        expect(['BTCTU_DAKLAK', 'DEFAULT']).toContain(t.organizationId || 'BTCTU_DAKLAK');
      }
    });
  });
});
