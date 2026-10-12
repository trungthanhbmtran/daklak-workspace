import {
  translateStatus,
  translatePriority,
  normalizeRow,
  normalizeSchema,
  removeVietnameseTones,
  matchSearchQuery,
  getFriendlyFieldLabel,
} from './normalization';

describe('Normalization & Search Engine on Backend', () => {
  test('1. Chuyển đổi trạng thái sang Tiếng Việt chuẩn hành chính công', () => {
    expect(translateStatus('TODO')).toBe('Chờ thực hiện');
    expect(translateStatus('IN_PROGRESS')).toBe('Đang thực hiện');
    expect(translateStatus('PENDING_ACCEPTANCE')).toBe('Chờ tiếp nhận');
    expect(translateStatus('COMPLETED')).toBe('Đã hoàn thành');
    expect(translateStatus('DONE')).toBe('Đã hoàn thành');
    expect(translateStatus('CANCELLED')).toBe('Đã hủy');
    expect(translateStatus('PUBLISHED')).toBe('Đã xuất bản');
    expect(translateStatus('Chờ thực hiện')).toBe('Chờ thực hiện');
    expect(translateStatus(null)).toBe('—');
  });

  test('2. Chuyển đổi mức độ ưu tiên sang Tiếng Việt chuẩn', () => {
    expect(translatePriority('LOW')).toBe('Ưu tiên thấp');
    expect(translatePriority('NORMAL')).toBe('Bình thường');
    expect(translatePriority('HIGH')).toBe('Ưu tiên cao');
    expect(translatePriority('URGENT')).toBe('Khẩn cấp');
  });

  test('3. Chuẩn hóa bản ghi dữ liệu (normalizeRow)', () => {
    const raw = {
      id: 1,
      title: 'Xây dựng IOC',
      status: 'TODO',
      priority: 'HIGH',
      departmentName: 'Trung tâm IOC',
    };
    const normalized = normalizeRow(raw);
    expect(normalized.status).toBe('Chờ thực hiện');
    expect(normalized.priority).toBe('Ưu tiên cao');
    expect(normalized.title).toBe('Xây dựng IOC');
  });

  test('4. Chuẩn hóa Schema với nhãn Tiếng Việt thân thiện (normalizeSchema)', () => {
    const schema = [
      { key: 'id' },
      { key: 'title' },
      { key: 'status' },
      { key: 'departmentName' },
      { key: 'progress' },
      { key: 'isOverdue' },
    ];
    const normalized = normalizeSchema(schema as any);
    expect(normalized.find((c) => c.key === 'id')?.label).toBe('Mã định danh');
    expect(normalized.find((c) => c.key === 'title')?.label).toBe('Tiêu đề');
    expect(normalized.find((c) => c.key === 'status')?.label).toBe('Trạng thái');
    expect(normalized.find((c) => c.key === 'departmentName')?.label).toBe('Phòng ban');
    expect(normalized.find((c) => c.key === 'progress')?.label).toBe('Tiến độ (%)');
  });

  test('5. Tìm kiếm Tiếng Việt có dấu, không dấu và mã tiếng Anh đồng nhất', () => {
    const sampleItem = {
      id: 10,
      title: 'Triển khai hạ tầng Trung tâm IOC',
      status: 'Chờ thực hiện',
      departmentName: 'Trung tâm Giám sát Điều hành Đô thị thông minh (IOC)',
      assigneeName: 'Nguyễn Văn A',
    };

    // Tìm tiếng Việt có dấu
    expect(matchSearchQuery(sampleItem, 'Chờ thực hiện')).toBe(true);
    expect(matchSearchQuery(sampleItem, 'Hạ tầng')).toBe(true);

    // Tìm tiếng Việt không dấu
    expect(matchSearchQuery(sampleItem, 'cho thuc hien')).toBe(true);
    expect(sampleItem.status).toBe('Chờ thực hiện');
    expect(matchSearchQuery(sampleItem, 'ha tang')).toBe(true);
    expect(matchSearchQuery(sampleItem, 'nguyen van a')).toBe(true);

    // Tìm bằng mã code tiếng Anh tương ứng
    expect(matchSearchQuery(sampleItem, 'todo')).toBe(true);
    expect(matchSearchQuery(sampleItem, 'TODO')).toBe(true);

    // Tìm bằng từ viết tắt / từ khóa bộ phận
    expect(matchSearchQuery(sampleItem, 'IOC')).toBe(true);
    expect(matchSearchQuery(sampleItem, 'ioc')).toBe(true);

    // Từ khóa không khớp
    expect(matchSearchQuery(sampleItem, 'Hoàn thành')).toBe(false);
    expect(matchSearchQuery(sampleItem, 'completed')).toBe(false);
  });
});
