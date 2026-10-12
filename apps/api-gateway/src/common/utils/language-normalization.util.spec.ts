import {
  getTaskStatusLabel,
  getDocumentStatusLabel,
  getPostStatusLabel,
  getWorkflowStatusLabel,
  getPriorityLabel,
  getUrgencyLabel,
  getSecurityLevelLabel,
  normalizeTask,
  normalizeDocument,
  normalizePost,
  normalizeWorkflow,
  normalizeResponsePayload,
  removeVietnameseTones,
  matchSearchQuery,
  filterBySearchQuery,
  resolveTaskStatusCodes,
} from './language-normalization.util';

describe('Language Normalization Utility (API Gateway)', () => {
  describe('Status Labels', () => {
    it('should map task statuses to administrative Vietnamese', () => {
      expect(getTaskStatusLabel('TODO')).toBe('Chờ thực hiện');
      expect(getTaskStatusLabel('IN_PROGRESS')).toBe('Đang thực hiện');
      expect(getTaskStatusLabel('DONE')).toBe('Hoàn thành');
      expect(getTaskStatusLabel('COMPLETED')).toBe('Đã hoàn thành');
      expect(getTaskStatusLabel('OVERDUE')).toBe('Quá hạn');
      expect(getTaskStatusLabel('PENDING_APPROVAL')).toBe('Chờ phê duyệt');
    });

    it('should map document statuses', () => {
      expect(getDocumentStatusLabel('PROCESSING')).toBe('Đang xử lý');
      expect(getDocumentStatusLabel('PUBLISHED')).toBe('Đã ban hành');
      expect(getDocumentStatusLabel('DRAFT')).toBe('Dự thảo');
    });

    it('should map post statuses', () => {
      expect(getPostStatusLabel('DRAFT')).toBe('Bản nháp');
      expect(getPostStatusLabel('PUBLISHED')).toBe('Đã xuất bản');
      expect(getPostStatusLabel('PENDING_APPROVAL')).toBe('Chờ phê duyệt');
    });

    it('should map workflow statuses', () => {
      expect(getWorkflowStatusLabel('ACTIVE')).toBe('Đang hoạt động');
      expect(getWorkflowStatusLabel('COMPLETED')).toBe('Đã hoàn thành');
    });

    it('should map priorities, urgencies, and securities', () => {
      expect(getPriorityLabel('HIGH')).toBe('Ưu tiên cao');
      expect(getPriorityLabel('LOW')).toBe('Ưu tiên thấp');
      expect(getUrgencyLabel('FLASH')).toBe('Hỏa tốc');
      expect(getSecurityLevelLabel('TOP_SECRET')).toBe('Tuyệt mật');
    });
  });

  describe('Record Normalizers', () => {
    it('should attach statusLabel and priorityLabel to a task and its children', () => {
      const task = {
        id: 1,
        title: 'Nhiệm vụ kiểm thử',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        children: [
          {
            id: 2,
            title: 'Nhiệm vụ con',
            status: 'TODO',
            priority: 'NORMAL',
          },
        ],
      };

      const normalized = normalizeTask(task);
      expect(normalized.statusLabel).toBe('Đang thực hiện');
      expect(normalized.priorityLabel).toBe('Ưu tiên cao');
      expect((normalized.children[0] as any).statusLabel).toBe('Chờ thực hiện');
      expect((normalized.children[0] as any).priorityLabel).toBe('Bình thường');
    });

    it('should normalize document payloads', () => {
      const doc = {
        id: 'doc-1',
        title: 'Văn bản chỉ đạo',
        status: 'PROCESSING',
        urgency: 'FLASH',
        securityLevel: 'CONFIDENTIAL',
      };
      const normalized = normalizeDocument(doc);
      expect(normalized.statusLabel).toBe('Đang xử lý');
      expect(normalized.urgencyLabel).toBe('Hỏa tốc');
      expect(normalized.securityLevelLabel).toBe('Mật');
    });

    it('should normalize post payloads', () => {
      const post = {
        id: 'post-1',
        title: 'Thông báo chuyển đổi số',
        status: 'PUBLISHED',
      };
      const normalized = normalizePost(post);
      expect(normalized.statusLabel).toBe('Đã xuất bản');
    });

    it('should normalize workflow payloads', () => {
      const wf = {
        id: 'wf-1',
        name: 'Quy trình thẩm định hồ sơ',
        status: 'ACTIVE',
      };
      const normalized = normalizeWorkflow(wf);
      expect(normalized.statusLabel).toBe('Đang hoạt động');
    });

    it('should normalize response payload wrappers (arrays, data wrapper, items wrapper)', () => {
      const listData = {
        data: [
          { id: 1, status: 'TODO', priority: 'HIGH' },
          { id: 2, status: 'DONE', priority: 'LOW' },
        ],
      };
      const normalized = normalizeResponsePayload(listData, 'task');
      expect(normalized.data[0].statusLabel).toBe('Chờ thực hiện');
      expect(normalized.data[1].statusLabel).toBe('Hoàn thành');
    });
  });

  describe('Search Engine & Accent Normalization', () => {
    it('should correctly remove Vietnamese tones', () => {
      expect(removeVietnameseTones('Đắk Lắk')).toBe('Dak Lak');
      expect(removeVietnameseTones('Chờ thực hiện')).toBe('Cho thuc hien');
      expect(removeVietnameseTones('Đang xử lý')).toBe('Dang xu ly');
    });

    it('should match search query across Vietnamese and English cross-terms', () => {
      const item = {
        title: 'Báo cáo chỉ đạo điều hành',
        status: 'IN_PROGRESS',
        statusLabel: 'Đang thực hiện',
      };

      // Tìm kiếm tiếng Việt có dấu
      expect(matchSearchQuery(item, 'Đang thực hiện')).toBe(true);
      // Tìm kiếm tiếng Việt không dấu
      expect(matchSearchQuery(item, 'dang thuc hien')).toBe(true);
      // Tìm kiếm mã tiếng Anh
      expect(matchSearchQuery(item, 'in_progress')).toBe(true);
      // Tìm kiếm tiêu đề không dấu
      expect(matchSearchQuery(item, 'dieu hanh')).toBe(true);
      // Từ khóa không khớp
      expect(matchSearchQuery(item, 'hoan thanh')).toBe(false);
    });

    it('should filter an array of items by search query', () => {
      const items = [
        { id: 1, title: 'Công tác khoa học', status: 'TODO', statusLabel: 'Chờ thực hiện' },
        { id: 2, title: 'Hội nghị tổng kết', status: 'DONE', statusLabel: 'Hoàn thành' },
      ];

      const filtered1 = filterBySearchQuery(items, 'khoa hoc');
      expect(filtered1).toHaveLength(1);
      expect(filtered1[0].id).toBe(1);

      const filtered2 = filterBySearchQuery(items, 'hoan thanh');
      expect(filtered2).toHaveLength(1);
      expect(filtered2[0].id).toBe(2);
    });

    it('should resolve task status codes from input text', () => {
      expect(resolveTaskStatusCodes('Đang thực hiện')).toContain('IN_PROGRESS');
      expect(resolveTaskStatusCodes('dang thuc hien')).toContain('IN_PROGRESS');
      expect(resolveTaskStatusCodes('TODO')).toContain('TODO');
    });
  });
});
