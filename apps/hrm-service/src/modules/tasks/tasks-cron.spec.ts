import { TasksCronService } from './tasks.cron';

describe('TasksCronService - Quét và Cảnh báo hạn chót nhiệm vụ BTCTU', () => {
  let cronService: TasksCronService;
  let mockPrisma: any;
  let mockTaskShared: any;

  beforeEach(() => {
    mockPrisma = {
      task: {
        findMany: jest.fn(),
      },
      employee: {
        findMany: jest.fn(),
      },
      taskNotificationLog: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      taskHistory: {
        createMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: jest.fn().mockImplementation((fn) => Array.isArray(fn) ? Promise.all(fn) : fn(mockPrisma)),
    };

    mockTaskShared = {
      notificationClient: {
        emit: jest.fn(),
      },
      sendTaskNotification: jest.fn(),
    };

    cronService = new TasksCronService(mockPrisma, mockTaskShared);
  });

  it('quét và phát hiện nhiệm vụ QUÁ HẠN (OVERDUE)', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.task.findMany.mockResolvedValueOnce([
      {
        id: 101,
        title: 'Thẩm định hồ sơ cán bộ bổ nhiệm đợt 1',
        dueDate: yesterday,
        status: 'IN_PROGRESS',
        participants: [{ employeeCode: 'BTCTU_NV01', participantRole: 'ASSIGNEE' }],
        notificationLogs: [],
      },
    ]).mockResolvedValueOnce([]); // Trả về mảng rỗng để kết thúc vòng lặp

    mockPrisma.employee.findMany.mockResolvedValue([
      { employeeCode: 'BTCTU_NV01', userId: 'user-01' },
    ]);

    await cronService.handleDueTaskScanner();

    expect(mockPrisma.task.findMany).toHaveBeenCalled();
    expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
      where: { employeeCode: { in: ['BTCTU_NV01'] } },
      select: { employeeCode: true, userId: true },
    });
  });

  it('quét và phát hiện nhiệm vụ SẮP ĐẾN HẠN (DEADLINE trong 3 ngày tới)', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    mockPrisma.task.findMany.mockResolvedValueOnce([
      {
        id: 102,
        title: 'Báo cáo rà soát chính trị nội bộ Ban Dân vận',
        dueDate: tomorrow,
        status: 'IN_PROGRESS',
        participants: [{ employeeCode: 'BTCTU_NV02', participantRole: 'ASSIGNEE' }],
        notificationLogs: [],
      },
    ]).mockResolvedValueOnce([]);

    mockPrisma.employee.findMany.mockResolvedValue([
      { employeeCode: 'BTCTU_NV02', userId: 'user-02' },
    ]);

    await cronService.handleDueTaskScanner();

    expect(mockPrisma.task.findMany).toHaveBeenCalled();
    expect(mockPrisma.employee.findMany).toHaveBeenCalledWith({
      where: { employeeCode: { in: ['BTCTU_NV02'] } },
      select: { employeeCode: true, userId: true },
    });
  });

  it('bỏ qua cảnh báo lặp lại nếu đã có log cảnh báo trước đó', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    mockPrisma.task.findMany.mockResolvedValueOnce([
      {
        id: 103,
        title: 'Đã cảnh báo quá hạn hôm qua',
        dueDate: yesterday,
        status: 'IN_PROGRESS',
        participants: [{ employeeCode: 'BTCTU_NV03', participantRole: 'ASSIGNEE' }],
        notificationLogs: [{ type: 'OVERDUE' }], // Đã có log OVERDUE
      },
    ]).mockResolvedValueOnce([]);

    await cronService.handleDueTaskScanner();

    // Không cần query employee vì không có warning mới
    expect(mockPrisma.employee.findMany).not.toHaveBeenCalled();
  });
});
