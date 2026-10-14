import { TasksService } from './tasks.service';
import { RpcException } from '@nestjs/microservices';
import { TaskRole } from '../../../src/generated/prisma/client';
import { of } from 'rxjs';

describe('TasksService - Quản lý Công việc Ban Tổ chức Tỉnh ủy (BTCTU)', () => {
  let service: TasksService;
  let mockPrisma: any;
  let mockShared: any;
  let mockWf: any;
  let mockNotif: any;
  let mockReportClient: any;

  beforeEach(() => {
    mockPrisma = {
      task: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      taskStep: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      taskParticipant: {
        createMany: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
        groupBy: jest.fn(),
      },
      taskClosure: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
      taskHistory: {
        create: jest.fn(),
      },
      employee: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      kpiEvaluation: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
      $queryRaw: jest.fn(),
    };

    mockShared = {
      populateQueryHierarchy: jest.fn().mockResolvedValue(undefined),
      enrichTasks: jest.fn().mockImplementation((tasks) => Promise.resolve(tasks.map((t: any) => ({ ...t })))),
      checkTaskAccess: jest.fn().mockResolvedValue({ hasAccess: true, isOwner: true, isAdmin: true, isDeptLeader: true }),
      computeAllowedActions: jest.fn().mockResolvedValue(['VIEW', 'EDIT', 'ASSIGN', 'ADD_SUBTASK', 'COORDINATE']),
      computeAllowedActionsBatch: jest.fn().mockResolvedValue({}),
      toTaskResponse: jest.fn().mockImplementation((t) => t),
      buildParticipantsData: jest.fn().mockReturnValue([]),
      buildScopingWhereClause: jest.fn().mockResolvedValue(null),
      toDelegationNode: jest.fn().mockImplementation((t) => t),
      sendTaskNotification: jest.fn(),
      toProtoStruct: jest.fn().mockReturnValue({}),
      userService: {
        GetEmployeesByScope: jest.fn().mockReturnValue(of({ employee_codes: ['BTCTU_LD01'] })),
      },
      chatService: null,
      cache: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
      },
    };

    mockWf = {
      resolveWorkflowCode: jest.fn().mockResolvedValue(null),
      getLocalInitialNodeId: jest.fn().mockResolvedValue(null),
      validateAndTransition: jest.fn().mockResolvedValue({ allowed: true }),
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
      emit: jest.fn().mockReturnValue({
        subscribe: jest.fn(),
      }),
    };

    service = new TasksService(
      mockPrisma,
      mockShared,
      mockWf,
      mockNotif,
      mockReportClient
    );
  });

  // ============================================================================
  // NHÓM 1: KHỞI TẠO VÀ PHÂN LOẠI NHIỆM VỤ (TASK INITIALIZATION)
  // ============================================================================
  describe('Nhóm 1: Khởi tạo và Phân loại nhiệm vụ', () => {
    it('1.1 Khởi tạo nhiệm vụ Thẩm định hồ sơ cán bộ bổ nhiệm (Phòng TCCB) đầy đủ trường nghiệp vụ BTCTU', async () => {
      const taskInput = {
        title: 'Thẩm định hồ sơ bổ nhiệm Phó Giám đốc Sở Nội vụ',
        description: 'Rà soát tiêu chuẩn chức danh, Mẫu 2C, quy hoạch và bảo vệ chính trị nội bộ',
        assigneeCode: 'BTCTU_NV01',
        assignerCode: 'BTCTU_LD01',
        departmentId: 2, // Phòng TCCB
        domainId: 1, // Lĩnh vực Tổ chức cán bộ
        priority: 'HIGH', // Ưu tiên cao
        type: 'TASK',
        startDate: '2026-10-15',
        dueDate: '2026-10-25',
        baseScore: 100,
        weight: 1.5, // Độ khó K = 1.5
        metadataJson: JSON.stringify({
          securityLevel: 'MAT', // Độ mật
          taskCategory: 'DOM_THAM_DINH', // Mảng thẩm định
          kFactor: 1.5,
          weightA_Progress: 30,
          weightB_Quality: 40,
          weightC_Volume: 20,
          weightD_Discipline: 10,
        }),
        initialSteps: [
          'Tiếp nhận hồ sơ và kiểm tra Mẫu 2C',
          'Lấy ý kiến thẩm tra chính trị nội bộ',
          'Lập biên bản họp thẩm định Ban',
          'Dự thảo Tờ trình Ban Thường vụ Tỉnh ủy',
        ],
        currentEmployeeCode: 'BTCTU_LD01',
        currentUserPermissions: ['TASK:MANAGE'],
      };

      mockPrisma.employee.findUnique.mockResolvedValue({ employeeCode: 'BTCTU_NV01' });
      mockPrisma.employee.findMany.mockResolvedValue([{ employeeCode: 'BTCTU_NV01' }]);

      mockPrisma.task.create.mockResolvedValue({
        id: 1,
        title: taskInput.title,
        status: 'PENDING_ACCEPTANCE',
        priority: 'HIGH',
        dueDate: new Date(taskInput.dueDate),
        participants: [],
      });

      mockPrisma.task.findUnique.mockResolvedValue({
        id: 1,
        title: taskInput.title,
        status: 'PENDING_ACCEPTANCE',
        participants: [],
      });

      const result = await service.createTask(taskInput);

      expect(mockPrisma.task.create).toHaveBeenCalled();
      expect(mockPrisma.taskStep.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ title: 'Tiếp nhận hồ sơ và kiểm tra Mẫu 2C', order: 1 }),
          expect.objectContaining({ title: 'Dự thảo Tờ trình Ban Thường vụ Tỉnh ủy', order: 4 }),
        ]),
      });
      expect(mockPrisma.taskClosure.create).toHaveBeenCalledWith({
        data: { ancestorId: 1, descendantId: 1, depth: 0 },
      });
      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 1,
            action: 'Khởi tạo công việc',
            actorCode: 'BTCTU_LD01',
          }),
        })
      );
      expect(result).toBeDefined();
    });

    it('1.2 Chặn khởi tạo khi người được giao việc không tồn tại trong hệ thống', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.createTask({
          title: 'Nhiệm vụ sai mã cán bộ',
          assigneeCode: 'KHONG_TON_TAI',
          currentEmployeeCode: 'BTCTU_LD01',
        })
      ).rejects.toThrow('Người được giao không tồn tại trong hệ thống.');
    });
  });

  // ============================================================================
  // NHÓM 2: PHÂN CÔNG, ĐIỀU PHỐI VÀ TIẾP NHẬN (ASSIGNMENT & COORDINATION)
  // ============================================================================
  describe('Nhóm 2: Phân công, Điều phối và Tiếp nhận', () => {
    it('2.1 Phân công chuyên viên chủ trì và cán bộ phối hợp (assignTask)', async () => {
      const rawTask = {
        id: 10,
        title: 'Nhiệm vụ rà soát Đảng viên',
        status: 'TODO',
        participants: [
          { employeeCode: 'BTCTU_OLD', participantRole: 'ASSIGNEE', status: 'TODO' },
        ],
      };

      mockPrisma.task.findUnique
        .mockResolvedValueOnce(rawTask)
        .mockResolvedValueOnce(rawTask);

      mockPrisma.taskParticipant.findMany.mockResolvedValue([]);
      mockPrisma.employee.findUnique.mockResolvedValue({ employeeCode: 'BTCTU_NEW' });

      mockShared.checkTaskAccess.mockResolvedValue({
        hasAccess: true,
        isOwner: true,
        isAdmin: true,
        isDeptLeader: true,
      });

      const assignData = {
        assigneeCode: 'BTCTU_NEW',
        coassigneeCodes: ['BTCTU_PH01', 'BTCTU_PH02'],
        currentEmployeeCode: 'BTCTU_LD01',
        currentUserPermissions: ['TASK:ASSIGN'],
      };

      const result = await service.assignTask(10, assignData);

      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 10,
            action: 'Giao việc',
            actorCode: 'BTCTU_LD01',
          }),
        })
      );
      expect(mockShared.sendTaskNotification).toHaveBeenCalledWith(
        ['BTCTU_NEW'],
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('2.2 Chặn phân công khi người thao tác không có quyền thẩm quyền', async () => {
      const rawTask = { id: 10, title: 'Nhiệm vụ', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockShared.checkTaskAccess.mockResolvedValue({
        hasAccess: true,
        isOwner: false,
        isAdmin: false,
        isDeptLeader: false,
      });

      mockWf.validateAndTransition.mockResolvedValue({ allowed: false });

      await expect(
        service.assignTask(10, {
          assigneeCode: 'BTCTU_NV01',
          currentEmployeeCode: 'CHUYEN_VIEN_LA',
        })
      ).rejects.toThrow('Workflow không cho phép thực hiện phân công/giao việc.');
    });

    it('2.3 Chuyên viên tiếp nhận nhiệm vụ thành công (respondTask - ACCEPT)', async () => {
      const rawTask = { id: 20, title: 'Nhiệm vụ 20', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockPrisma.taskParticipant.findFirst.mockResolvedValue({
        taskId: 20,
        employeeCode: 'BTCTU_NV01',
        participantRole: 'ASSIGNEE',
        status: 'PENDING_ACCEPTANCE',
      });

      const result = await service.respondTask(20, {
        action: 'ACCEPT',
        currentEmployeeCode: 'BTCTU_NV01',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã tiếp nhận công việc');
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: { status: 'IN_PROGRESS' },
      });
      expect(mockPrisma.taskParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'ACCEPTED' },
        })
      );
    });

    it('2.4 Chuyên viên từ chối có lý do chính đáng (respondTask - REJECT)', async () => {
      const rawTask = { id: 21, title: 'Nhiệm vụ 21', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockPrisma.taskParticipant.findFirst.mockResolvedValue({
        taskId: 21,
        employeeCode: 'BTCTU_NV01',
        participantRole: 'ASSIGNEE',
        status: 'PENDING_ACCEPTANCE',
      });

      const result = await service.respondTask(21, {
        action: 'REJECT',
        rejectReason: 'Trùng lịch công tác tại Ban Thường vụ Huyện ủy Buôn Đôn',
        currentEmployeeCode: 'BTCTU_NV01',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã từ chối công việc');
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 21 },
        data: { status: 'REJECTED', rejectReason: expect.any(String) },
      });
    });

    it('2.5 Chặn từ chối nếu không điền lý do từ chối', async () => {
      const rawTask = { id: 22, title: 'Nhiệm vụ 22', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockPrisma.taskParticipant.findFirst.mockResolvedValue({
        taskId: 22,
        employeeCode: 'BTCTU_NV01',
        participantRole: 'ASSIGNEE',
        status: 'PENDING_ACCEPTANCE',
      });

      await expect(
        service.respondTask(22, {
          action: 'REJECT',
          currentEmployeeCode: 'BTCTU_NV01',
        })
      ).rejects.toThrow('Cần có lý do từ chối.');
    });
  });

  // ============================================================================
  // NHÓM 3: PHÂN RÃ NHIỆM VỤ ĐA CẤP (TASK DECOMPOSITION & HIERARCHY)
  // ============================================================================
  describe('Nhóm 3: Phân rã nhiệm vụ đa cấp (Hierarchy & Breakdown)', () => {
    it('3.1 Lãnh đạo Phòng phân rã nhiệm vụ thành nhiệm vụ con (breakdownTask)', async () => {
      const parentTask = { id: 30, title: 'Đề án Sắp xếp tổ chức bộ máy', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(parentTask);

      mockShared.checkTaskAccess.mockResolvedValue({ hasAccess: true });
      mockShared.computeAllowedActions.mockResolvedValue(['ADD_SUBTASK', 'VIEW']);

      mockPrisma.employee.findUnique.mockResolvedValue({ employeeCode: 'BTCTU_NV02' });
      mockPrisma.employee.findMany.mockResolvedValue([{ employeeCode: 'BTCTU_NV02' }]);

      mockPrisma.task.create.mockResolvedValue({
        id: 31,
        parentId: 30,
        title: 'Nhiệm vụ con: Thu thập số liệu biên chế Sở NN&PTNT',
        status: 'PENDING_ACCEPTANCE',
        participants: [],
      });

      mockPrisma.taskClosure.findMany.mockResolvedValue([
        { ancestorId: 30, descendantId: 30, depth: 0 },
      ]);

      const subtaskData = {
        title: 'Thu thập số liệu biên chế Sở NN&PTNT',
        assigneeCode: 'BTCTU_NV02',
        currentEmployeeCode: 'BTCTU_TP01',
      };

      const result = await service.breakdownTask(30, subtaskData);

      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ parentId: 30 }),
        })
      );
      expect(mockPrisma.taskClosure.createMany).toHaveBeenCalledWith({
        data: [{ ancestorId: 30, descendantId: 31, depth: 1 }],
      });
      expect(result).toBeDefined();
    });

    it('3.2 Lấy danh sách nhiệm vụ con phân cấp (getSubTasks)', async () => {
      const parentTask = { id: 40, title: 'Nhiệm vụ cha', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(parentTask);

      mockPrisma.taskClosure.findMany.mockResolvedValue([
        { descendantId: 41 },
        { descendantId: 42 },
      ]);

      mockPrisma.task.findMany.mockResolvedValue([
        { id: 41, title: 'Task con 1', participants: [] },
        { id: 42, title: 'Task con 2', participants: [] },
      ]);

      const result = await service.getSubTasks(40, { currentEmployeeCode: 'BTCTU_LD01' });

      expect(result.success).toBe(true);
      expect(result.data.length).toBe(2);
    });
  });

  // ============================================================================
  // NHÓM 4: CHECKLIST NGHIỆP VỤ & TÍNH TIẾN ĐỘ TỰ ĐỘNG
  // ============================================================================
  describe('Nhóm 4: Checklist nghiệp vụ & Tính tiến độ tự động', () => {
    it('4.1 Tạo bước checklist mới (createStep) và cập nhật tiến độ tự động', async () => {
      mockPrisma.taskStep.create.mockResolvedValue({
        id: 1,
        taskId: 50,
        title: 'Kiểm tra lý lịch tư pháp',
        status: 'TODO',
      });

      mockPrisma.taskStep.findMany.mockResolvedValue([
        { id: 1, taskId: 50, status: 'TODO' },
      ]);
      mockPrisma.taskClosure.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.findUnique.mockResolvedValue({ id: 50, progress: 0 });

      const result = await service.createStep(50, { title: 'Kiểm tra lý lịch tư pháp' });

      expect(mockPrisma.taskStep.create).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('4.2 Chỉ người được phân công phụ trách bước mới có quyền nhấn hoàn thành (updateStep)', async () => {
      mockPrisma.taskStep.findUnique.mockResolvedValue({
        id: 2,
        taskId: 50,
        title: 'Xác minh hồ sơ đảng viên',
        status: 'TODO',
        assigneeCode: 'BTCTU_NV01',
      });

      // Người khác bấm hoàn thành => chặn
      await expect(
        service.updateStep(50, 2, {
          status: 'COMPLETED',
          actorCode: 'NGUOI_KHAC',
        })
      ).rejects.toThrow('Chỉ người được giao phụ trách bước này mới có quyền nhấn hoàn thành.');
    });

    it('4.3 Tự động tính toán tiến độ % khi hoàn thành bước checklist (autoComputeTaskProgress)', async () => {
      // 2 bước: 1 COMPLETED, 1 TODO => Tiến độ = 50%
      mockPrisma.taskStep.findMany.mockResolvedValue([
        { id: 1, taskId: 50, status: 'COMPLETED' },
        { id: 2, taskId: 50, status: 'TODO' },
      ]);
      mockPrisma.taskClosure.findMany.mockResolvedValue([]);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.findUnique.mockResolvedValue({ id: 50, progress: 0 });

      await service.autoComputeTaskProgress(50);

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 50 },
          data: { progress: 50 },
        })
      );
    });
  });

  // ============================================================================
  // NHÓM 5: GIA HẠN THỜI GIAN & KHÓA NHIỆM VỤ ĐÃ HOÀN THÀNH
  // ============================================================================
  describe('Nhóm 5: Gia hạn thời gian & Khóa nhiệm vụ đã hoàn thành', () => {
    it('5.1 Gia hạn hạn chót giải quyết công việc với lý do khách quan (extendTask)', async () => {
      const activeTask = {
        id: 60,
        title: 'Nhiệm vụ đang làm',
        status: 'IN_PROGRESS',
        participants: [],
      };
      mockPrisma.task.findUnique.mockResolvedValue(activeTask);

      const result = await service.extendTask(
        60,
        '2026-11-01',
        'Chờ văn bản trả lời của Cục Đào tạo bồi dưỡng - BTCTW',
        'BTCTU_LD01'
      );

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 60 },
          data: { dueDate: new Date('2026-11-01') },
        })
      );
      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 60,
            action: 'Gia hạn công việc',
            newValue: expect.objectContaining({
              reason: 'Chờ văn bản trả lời của Cục Đào tạo bồi dưỡng - BTCTW',
            }),
          }),
        })
      );
    });

    it('5.2 Ràng buộc bất biến: Chặn gia hạn khi nhiệm vụ đã hoàn thành (COMPLETED)', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 61,
        title: 'Nhiệm vụ đã xong',
        status: 'COMPLETED',
      });

      await expect(
        service.extendTask(61, '2026-11-05', 'Lý do', 'BTCTU_LD01')
      ).rejects.toThrow('Nhiệm vụ này đã hoàn thành, không thể gia hạn.');
    });

    it('5.3 Ràng buộc bất biến: Chặn cập nhật thông tin chung khi nhiệm vụ đã COMPLETED', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 62,
        title: 'Nhiệm vụ đã hoàn thành',
        status: 'COMPLETED',
      });

      await expect(
        service.updateTask(62, { title: 'Tên mới' })
      ).rejects.toThrow('Nhiệm vụ này đã hoàn thành, không thể thay đổi.');
    });
  });

  // ============================================================================
  // NHÓM 6: THẨM ĐỊNH CHẤT LƯỢNG, XỬ LÝ LỖI & PHÊ DUYỆT (QUALITY & APPROVAL)
  // ============================================================================
  describe('Nhóm 6: Thẩm định chất lượng, Xử lý lỗi & Phê duyệt', () => {
    it('6.1 Nộp sản phẩm chờ duyệt (SUBMIT_FOR_REVIEW -> REVIEWING)', async () => {
      const rawTask = { id: 70, status: 'IN_PROGRESS', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockWf.validateAndTransition.mockResolvedValue({
        allowed: true,
        targetStatus: 'REVIEWING',
      });

      mockPrisma.task.update.mockResolvedValue({
        id: 70,
        status: 'REVIEWING',
        participants: [],
      });

      await service.updateTaskStatus(70, 'REVIEWING', undefined, 'BTCTU_NV01', {}, 'SUBMIT_FOR_REVIEW');

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 70 },
          data: expect.objectContaining({ status: 'REVIEWING' }),
        })
      );
    });

    it('6.2 Trả lại yêu cầu sửa đổi do có lỗi (RETURN -> RETURNED), trừ điểm và reset completedAt', async () => {
      const rawTask = { id: 71, status: 'REVIEWING', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockWf.validateAndTransition.mockResolvedValue({
        allowed: true,
        targetStatus: 'RETURNED',
        isCompleted: false,
      });

      mockPrisma.task.update.mockResolvedValue({
        id: 71,
        status: 'RETURNED',
        participants: [],
      });

      await service.updateTaskStatus(
        71,
        'RETURNED',
        'Sai thể thức văn bản hành chính theo Nghị định 30 (Lỗi nhỏ 5%)',
        'BTCTU_TP01',
        {},
        'RETURN'
      );

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 71 },
          data: expect.objectContaining({
            status: 'RETURNED',
            isCompleted: false,
            completedAt: null,
            rejectReason: 'Sai thể thức văn bản hành chính theo Nghị định 30 (Lỗi nhỏ 5%)',
          }),
        })
      );
    });

    it('6.3 Phê duyệt hoàn thành & Lưu kết quả thẩm định chất lượng 4 thành tố (EVALUATE_APPROVE)', async () => {
      const rawTask = { id: 72, status: 'REVIEWING', participants: [] };
      mockPrisma.task.findUnique.mockResolvedValue(rawTask);

      mockWf.validateAndTransition.mockResolvedValue({
        allowed: true,
        targetStatus: 'COMPLETED',
        isCompleted: true,
      });

      mockPrisma.task.update.mockResolvedValue({
        id: 72,
        status: 'COMPLETED',
        completedAt: new Date(),
        isCompleted: true,
        participants: [],
      });

      const evaluationContext = {
        currentEmployeeCode: 'BTCTU_LD01',
        evidenceData: {
          scores: {
            progressScore_A: 30, // 30/30
            qualityScore_B: 38, // 38/40 (trừ 2đ lỗi nhẹ)
            volumeScore_C: 20, // 20/20
            disciplineScore_D: 10, // 10/10
            totalKPI: 98,
          },
          feedback: 'Sản phẩm thẩm định đạt yêu cầu xuất sắc, hoàn thành trước hạn.',
        },
      };

      await service.updateTaskStatus(
        72,
        'COMPLETED',
        undefined,
        'BTCTU_LD01',
        evaluationContext,
        'EVALUATE_APPROVE'
      );

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 72 },
          data: expect.objectContaining({
            status: 'COMPLETED',
            isCompleted: true,
            metadata: expect.objectContaining({
              evaluation: expect.objectContaining({
                scores: expect.objectContaining({ totalKPI: 98 }),
              }),
            }),
          }),
        })
      );

      // Kiểm tra phát sự kiện RabbitMQ đồng bộ CQRS sang report-service
      expect(mockReportClient.emit).toHaveBeenCalledWith('task.completed', expect.any(Object));
      expect(mockReportClient.emit).toHaveBeenCalledWith('task.state_changed', expect.any(Object));
    });
  });

  // ============================================================================
  // NHÓM 7: ĐIỂM DANH CUỘC HỌP & THỐNG KÊ (MEETING ATTENDANCE)
  // ============================================================================
  describe('Nhóm 7: Điểm danh cuộc họp & Thống kê tham dự', () => {
    it('7.1 Cán bộ điểm danh cuộc họp thành công (recordAttendance)', async () => {
      mockPrisma.taskParticipant.findFirst.mockResolvedValue({
        taskId: 80,
        employeeCode: 'BTCTU_NV01',
        participantRole: 'ASSIGNEE',
        attendedAt: null,
      });

      const result = await service.recordAttendance(80, 'BTCTU_NV01');

      expect(result.success).toBe(true);
      expect(mockPrisma.taskParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { attendedAt: expect.any(Date) },
        })
      );
      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'Tham gia họp/học' }),
        })
      );
    });

    it('7.2 Chặn điểm danh nếu không phải thành viên được mời họp', async () => {
      mockPrisma.taskParticipant.findFirst.mockResolvedValue(null);

      await expect(
        service.recordAttendance(80, 'NGUOI_NGOAI')
      ).rejects.toThrow('Người dùng không phải là thành viên của sự kiện này.');
    });

    it('7.3 Thống kê tỷ lệ tham gia cuộc họp chính xác (getAttendanceStats)', async () => {
      mockPrisma.taskParticipant.findMany.mockResolvedValue([
        { employeeCode: 'NV01', participantRole: 'ASSIGNEE', attendedAt: new Date(), employee: { fullName: 'Nguyễn Văn A' } },
        { employeeCode: 'NV02', participantRole: 'COORDINATOR', attendedAt: null, employee: { fullName: 'Trần Thị B' } },
      ]);

      const result = await service.getAttendanceStats(80);

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(2);
      expect(result.data.attended).toBe(1);
      expect(result.data.attendanceRate).toBe(50); // 1/2 = 50%
    });
  });

  // ============================================================================
  // NHÓM 8: XÓA NHIỆM VỤ VÀ BẢO TOÀN DỮ LIỆU
  // ============================================================================
  describe('Nhóm 8: Xóa nhiệm vụ và Bảo toàn dữ liệu', () => {
    it('8.1 Chặn xóa nhiệm vụ đã phân công chính thức cho cán bộ', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 90,
        participants: [{ employeeCode: 'BTCTU_NV01', participantRole: TaskRole.ASSIGNEE }],
      });

      await expect(service.deleteTask(90)).rejects.toThrow(
        'Không thể xóa công việc đã được giao.'
      );
    });

    it('8.2 Chặn xóa nhiệm vụ đã có các nhiệm vụ con phụ thuộc', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 91,
        participants: [{ employeeCode: 'UNASSIGNED', participantRole: TaskRole.ASSIGNEE }],
      });

      mockPrisma.taskClosure.findMany.mockResolvedValue([
        { descendantId: 91, depth: 0 },
        { descendantId: 92, depth: 1 }, // Có con
      ]);

      await expect(service.deleteTask(91)).rejects.toThrow(
        'Không thể xóa công việc đã có công việc con.'
      );
    });

    it('8.3 Cho phép xóa mềm (isDeleted: true) nhiệm vụ nháp chưa giao', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 93,
        participants: [{ employeeCode: 'UNASSIGNED', participantRole: TaskRole.ASSIGNEE }],
      });

      mockPrisma.taskClosure.findMany.mockResolvedValue([
        { descendantId: 93, depth: 0 },
      ]);

      const result = await service.deleteTask(93);

      expect(mockPrisma.task.updateMany).toHaveBeenCalledWith({
        where: { id: { in: [93] } },
        data: { isDeleted: true },
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // NHÓM 9: VIỆC PHÁT SINH NGOÀI KẾ HOẠCH & ỦY QUYỀN WORKFLOW-SERVICE
  // ============================================================================
  describe('Nhóm 9: Quản lý việc phát sinh & Phê duyệt Lãnh đạo thẩm định để tính KPI', () => {
    it('9.1 Khởi tạo việc phát sinh: tự động chuyển PENDING_APPROVAL, khóa isKpiTarget=false', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        employeeCode: 'BTCTU_NV01',
        departmentId: 10,
        jobTitleId: 5,
      });
      mockPrisma.employee.findMany.mockResolvedValue([
        { employeeCode: 'BTCTU_NV01' },
        { employeeCode: 'BTCTU_LD01' },
      ]);

      mockPrisma.task.create.mockImplementation((args: any) => ({
        id: 101,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      const incidentalData = {
        title: 'Xử lý đơn thư khiếu nại phát sinh đột xuất của công dân',
        taskType: 'UNPLANNED',
        assigneeCode: 'BTCTU_NV01',
        supervisorCode: 'BTCTU_LD01',
        baseScore: 100,
        metadata: {
          isKpiTarget: true, // Client muốn tính KPI nhưng chưa được duyệt
        },
      };

      const result = await service.createTask(incidentalData);

      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PENDING_APPROVAL',
            metadata: expect.objectContaining({
              isIncidental: true,
              incidentalStatus: 'PENDING_APPROVAL',
              isKpiTarget: false, // Bắt buộc khóa điểm KPI khi chưa duyệt
              isKpiTargetPendingApproval: true,
            }),
          }),
        })
      );
      expect(result.status).toBe('PENDING_APPROVAL');
    });

    it('9.2 Lãnh đạo phụ trách duyệt việc phát sinh (APPROVE_INCIDENTAL): kích hoạt isKpiTarget=true', async () => {
      const rawPendingTask = {
        id: 102,
        title: 'Nhiệm vụ phát sinh',
        status: 'PENDING_APPROVAL',
        creatorEmployeeCode: 'BTCTU_NV01',
        metadata: {
          taskType: 'UNPLANNED',
          isIncidental: true,
          incidentalStatus: 'PENDING_APPROVAL',
          isKpiTarget: false,
        },
        participants: [
          { employeeCode: 'BTCTU_NV01', participantRole: 'ASSIGNEE' },
          { employeeCode: 'BTCTU_LD01', participantRole: 'APPROVER' },
        ],
      };

      mockPrisma.task.findUnique.mockResolvedValue(rawPendingTask);
      mockShared.enrichTasks.mockResolvedValue([
        {
          ...rawPendingTask,
          assigneeCode: 'BTCTU_NV01',
          supervisorCode: 'BTCTU_LD01',
        },
      ]);

      mockPrisma.task.update.mockResolvedValue({
        ...rawPendingTask,
        status: 'IN_PROGRESS',
        metadata: {
          ...rawPendingTask.metadata,
          isKpiTarget: true,
          incidentalStatus: 'APPROVED',
        },
        participants: rawPendingTask.participants,
      });

      const result = await service.updateTaskStatus(
        102,
        'IN_PROGRESS',
        undefined,
        'BTCTU_LD01',
        { currentEmployeeCode: 'BTCTU_LD01' },
        'APPROVE_INCIDENTAL'
      );

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 102 },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              isKpiTarget: true,
              incidentalStatus: 'APPROVED',
            }),
          }),
        })
      );
      expect(result).toBeDefined();
    });

    it('9.3 Lãnh đạo từ chối duyệt việc phát sinh (REJECT_INCIDENTAL): chuyển REJECTED, khóa isKpiTarget=false', async () => {
      const rawPendingTask = {
        id: 103,
        title: 'Nhiệm vụ phát sinh không hợp lệ',
        status: 'PENDING_APPROVAL',
        creatorEmployeeCode: 'BTCTU_NV01',
        metadata: {
          taskType: 'UNPLANNED',
          isIncidental: true,
          incidentalStatus: 'PENDING_APPROVAL',
          isKpiTarget: false,
        },
        participants: [
          { employeeCode: 'BTCTU_NV01', participantRole: 'ASSIGNEE' },
          { employeeCode: 'BTCTU_LD01', participantRole: 'APPROVER' },
        ],
      };

      mockPrisma.task.findUnique.mockResolvedValue(rawPendingTask);
      mockShared.enrichTasks.mockResolvedValue([
        {
          ...rawPendingTask,
          assigneeCode: 'BTCTU_NV01',
          supervisorCode: 'BTCTU_LD01',
        },
      ]);

      mockPrisma.task.update.mockResolvedValue({
        ...rawPendingTask,
        status: 'REJECTED',
        isCompleted: false,
        metadata: {
          ...rawPendingTask.metadata,
          isKpiTarget: false,
          incidentalStatus: 'REJECTED',
        },
        participants: rawPendingTask.participants,
      });

      await service.updateTaskStatus(
        103,
        'REJECTED',
        'Nhiệm vụ này thuộc thẩm quyền của cơ quan khác, không tính việc phát sinh',
        'BTCTU_LD01',
        { currentEmployeeCode: 'BTCTU_LD01' },
        'REJECT_INCIDENTAL'
      );

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 103 },
          data: expect.objectContaining({
            status: 'REJECTED',
            isCompleted: false,
            metadata: expect.objectContaining({
              isKpiTarget: false,
              incidentalStatus: 'REJECTED',
            }),
          }),
        })
      );
    });
  });
});
