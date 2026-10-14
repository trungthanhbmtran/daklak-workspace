import { TasksController } from './tasks.controller';

describe('TasksController - gRPC Gateway & PBAC Context Injection', () => {
  let controller: TasksController;
  let mockTasksService: any;

  const mockUser = {
    id: 1,
    employeeCode: 'BTCTU_LD01',
    unitId: 10,
    permissionsFlatten: ['TASK:MANAGE', 'TASK:ASSIGN'],
  };

  beforeEach(() => {
    mockTasksService = {
      createTask: jest.fn().mockResolvedValue({ id: 1, title: 'Nhiệm vụ mới' }),
      listTasks: jest.fn().mockResolvedValue({ data: [], meta: {} }),
      getTask: jest.fn().mockResolvedValue({ id: 1, title: 'Chi tiết nhiệm vụ' }),
      updateTask: jest.fn().mockResolvedValue({ id: 1, title: 'Cập nhật nhiệm vụ' }),
      extendTask: jest.fn().mockResolvedValue({ id: 1, status: 'IN_PROGRESS' }),
      deleteTask: jest.fn().mockResolvedValue({ success: true }),
      updateTaskStatus: jest.fn().mockResolvedValue({ id: 1, status: 'DONE' }),
      breakdownTask: jest.fn().mockResolvedValue({ id: 2, parentId: 1 }),
      getSubTasks: jest.fn().mockResolvedValue({ data: [] }),
      assignTask: jest.fn().mockResolvedValue({ id: 1, assigneeCode: 'BTCTU_NV01' }),
      recommendAssignees: jest.fn().mockResolvedValue({ topEmployees: [] }),
      requestCoordination: jest.fn().mockResolvedValue({ success: true }),
      respondTask: jest.fn().mockResolvedValue({ success: true }),
      createStep: jest.fn().mockResolvedValue({ id: 1, title: 'Bước 1' }),
      updateStep: jest.fn().mockResolvedValue({ id: 1, status: 'COMPLETED' }),
      listSteps: jest.fn().mockResolvedValue({ data: [] }),
      deleteStep: jest.fn().mockResolvedValue({ success: true }),
      recordAttendance: jest.fn().mockResolvedValue({ success: true }),
      getAttendanceStats: jest.fn().mockResolvedValue({ total: 10, attended: 8 }),
      invalidateWorkflowCache: jest.fn(),
      shared: {
        cache: {
          delete: jest.fn(),
        },
      },
    };

    controller = new TasksController(mockTasksService);
  });

  describe('1. Kiểm thử tiêm Ngữ cảnh PBAC (PBAC Context Scoping Injection)', () => {
    it('tiêm đúng employeeCode, userId, unitId, permissions vào CreateTask', async () => {
      const payload: any = { title: 'Thẩm định hồ sơ cán bộ' };
      await controller.createTask(payload, mockUser);

      expect(mockTasksService.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Thẩm định hồ sơ cán bộ',
          currentEmployeeCode: 'BTCTU_LD01',
          currentUserId: 1,
          currentUserDept: 10,
          currentUserPermissions: ['TASK:MANAGE', 'TASK:ASSIGN'],
        })
      );
    });

    it('nhận diện isAdmin: true khi user sở hữu quyền TASK:MANAGE trong GetTask', async () => {
      const payload: any = { id: 100 };
      await controller.getTask(payload, mockUser);

      expect(mockTasksService.getTask).toHaveBeenCalledWith(
        100,
        expect.objectContaining({
          id: 100,
          isAdmin: true,
          currentEmployeeCode: 'BTCTU_LD01',
        })
      );
    });
  });

  describe('2. Phân phối các gRPC Methods sang TasksService', () => {
    it('chuyển tiếp ListTasks kèm ngữ cảnh phân quyền', async () => {
      await controller.listTasks({ page: 1, limit: 10 }, mockUser);
      expect(mockTasksService.listTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
          currentEmployeeCode: 'BTCTU_LD01',
        })
      );
    });

    it('chuyển tiếp UpdateTaskStatus với actionName, rejectReason và context', async () => {
      const payload = {
        id: 50,
        status: 'RETURNED',
        rejectReason: 'Sai thể thức văn bản (Lỗi nhỏ 5%)',
        actionName: 'RETURN',
      };
      await controller.updateTaskStatus(payload, mockUser);

      expect(mockTasksService.updateTaskStatus).toHaveBeenCalledWith(
        50,
        'RETURNED',
        'Sai thể thức văn bản (Lỗi nhỏ 5%)',
        'BTCTU_LD01',
        expect.objectContaining({
          currentEmployeeCode: 'BTCTU_LD01',
        }),
        'RETURN'
      );
    });

    it('chuyển tiếp ExtendTask với dueDate và lý do khách quan', async () => {
      const payload = {
        id: 50,
        dueDate: '2026-10-25',
        reason: 'Chờ kết quả xác minh từ Cơ quan Công an',
      };
      await controller.extendTask(payload, mockUser);

      expect(mockTasksService.extendTask).toHaveBeenCalledWith(
        50,
        '2026-10-25',
        'Chờ kết quả xác minh từ Cơ quan Công an',
        'BTCTU_LD01'
      );
    });

    it('chuyển tiếp RespondTask (ACCEPT / REJECT)', async () => {
      const payload = {
        taskId: 50,
        action: 'ACCEPT',
      };
      await controller.respondTask(payload, mockUser);

      expect(mockTasksService.respondTask).toHaveBeenCalledWith(
        50,
        expect.objectContaining({
          action: 'ACCEPT',
          currentEmployeeCode: 'BTCTU_LD01',
        })
      );
    });

    it('chuyển tiếp CreateStep, UpdateStep, DeleteStep của Checklist', async () => {
      await controller.createStep({ taskId: 50, title: 'Kiểm tra lý lịch 2C' }, mockUser);
      expect(mockTasksService.createStep).toHaveBeenCalledWith(
        50,
        expect.objectContaining({ title: 'Kiểm tra lý lịch 2C' })
      );

      await controller.updateStep({ taskId: 50, stepId: 1, status: 'COMPLETED' }, mockUser);
      expect(mockTasksService.updateStep).toHaveBeenCalledWith(
        50,
        1,
        expect.objectContaining({ status: 'COMPLETED' })
      );

      await controller.deleteStep({ taskId: 50, stepId: 1 }, mockUser);
      expect(mockTasksService.deleteStep).toHaveBeenCalledWith(50, 1);
    });

    it('chuyển tiếp RecordAttendance để điểm danh cuộc họp', async () => {
      await controller.recordAttendance({ taskId: 88 }, mockUser);
      expect(mockTasksService.recordAttendance).toHaveBeenCalledWith(88, 'BTCTU_LD01');
    });
  });

  describe('3. Xử lý EventPattern (Sự kiện liên service)', () => {
    it('invalidate cache khi nhận sự kiện WORKFLOW_UPDATED', () => {
      controller.handleWorkflowUpdated({
        workflowId: 'WF_BTCTU_TASK',
        code: 'WF_BTCTU',
        definition: { nodes: [] },
      });

      expect(mockTasksService.invalidateWorkflowCache).toHaveBeenCalledWith(
        'WF_BTCTU_TASK',
        { nodes: [] }
      );
      expect(mockTasksService.shared.cache.delete).toHaveBeenCalledWith(
        'workflow:trigger:WF_BTCTU'
      );
    });
  });
});
