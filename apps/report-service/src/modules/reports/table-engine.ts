import type {
  TableConfig,
  TableColumn,
  TableResult,
  TableField,
  ColumnType,
} from '../../../../../shared/reporting/table-contract';

const MAX_ROWS = 5000;
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
type Row = Record<string, unknown>;
function object(value: unknown): value is Row {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function parts(path: string): string[] {
  if (typeof path !== 'string' || path.length > 256)
    throw new Error('Đường dẫn dữ liệu không hợp lệ');
  const result = path ? path.split('.') : [];
  if (result.length > 10 || result.some((p) => !p || forbidden.has(p)))
    throw new Error('Đường dẫn dữ liệu không hợp lệ');
  return result;
}
function read(value: unknown, path: string): unknown {
  for (const part of parts(path)) {
    if (!object(value) || !Object.hasOwn(value, part)) return undefined;
    value = value[part];
  }
  return value;
}
function numeric(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (
    typeof value !== 'string' ||
    !/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())
  )
    return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function convert(
  value: unknown,
  type: ColumnType,
): string | number | boolean | null {
  if (value == null) return null;
  if (type === 'number') return numeric(value);
  if (type === 'boolean') {
    if (value === true || value === 'true' || value === 1) return true;
    if (value === false || value === 'false' || value === 0) return false;
    return null;
  }
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? String(value)
    : null;
}
export function validateTableConfig(input: unknown): TableConfig {
  if (!object(input) || input.version !== 1)
    throw new Error('Phiên bản cấu hình bảng không hợp lệ');
  const c = input as unknown as TableConfig;
  parts(c.dataPath);
  if (
    !Array.isArray(c.columns) ||
    c.columns.length > 30 ||
    !Array.isArray(c.groupBy) ||
    c.groupBy.length > 5 ||
    !Array.isArray(c.filters) ||
    c.filters.length > 10
  )
    throw new Error('Cấu hình cột/nhóm/bộ lọc không hợp lệ');
  if (
    !Number.isInteger(c.page) ||
    c.page < 1 ||
    c.page > 100000 ||
    !Number.isInteger(c.pageSize) ||
    c.pageSize < 1 ||
    c.pageSize > 100
  )
    throw new Error('Phân trang không hợp lệ');
  const keys = new Set<string>();
  for (const col of c.columns) {
    if (
      !object(col) ||
      typeof col.key !== 'string' ||
      !/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(col.key) ||
      forbidden.has(col.key) ||
      keys.has(col.key) ||
      typeof col.label !== 'string' ||
      !col.label.trim() ||
      col.label.length > 120 ||
      !['string', 'number', 'boolean'].includes(col.type) ||
      !['none', 'count', 'sum', 'avg', 'min', 'max'].includes(col.aggregate)
    )
      throw new Error('Cột báo cáo không hợp lệ hoặc trùng mã');
    parts(col.path);
    if (!col.path) throw new Error('Cột phải có đường dẫn nguồn');
    if (!['none', 'count'].includes(col.aggregate) && col.type !== 'number')
      throw new Error('Cột tổng hợp phải có kiểu số');
    keys.add(col.key);
  }
  for (const path of c.groupBy) {
    parts(path);
    if (!path) throw new Error('Trường nhóm không hợp lệ');
  }
  if (new Set(c.groupBy).size !== c.groupBy.length)
    throw new Error('Trường nhóm bị trùng');
  if (c.groupBy.length || c.columns.some((col) => col.aggregate !== 'none')) {
    if (
      c.columns.some(
        (col) => col.aggregate === 'none' && !c.groupBy.includes(col.path),
      )
    )
      throw new Error('Cột không tổng hợp phải thuộc trường nhóm');
  }
  for (const f of c.filters) {
    if (
      !object(f) ||
      !['eq', 'contains', 'gt', 'lt'].includes(f.operator) ||
      typeof f.value !== 'string' ||
      f.value.length > 500
    )
      throw new Error('Bộ lọc không hợp lệ');
    parts(f.path);
    if (
      !f.path ||
      (['gt', 'lt'].includes(f.operator) && numeric(f.value) === null)
    )
      throw new Error('Bộ lọc số không hợp lệ');
  }
  if (
    c.sort &&
    (!keys.has(c.sort.key) || !['asc', 'desc'].includes(c.sort.direction))
  )
    throw new Error('Sắp xếp không hợp lệ');
  return c;
}
function findArrays(data: unknown): string[] {
  const queue = [{ value: data, path: '', depth: 0 }];
  const found: string[] = [],
    seen = new Set<unknown>();
  for (let i = 0; i < queue.length; i++) {
    const { value, path, depth } = queue[i];
    if (Array.isArray(value)) {
      found.push(path);
      continue;
    }
    if (!object(value) || seen.has(value) || depth >= 8) continue;
    seen.add(value);
    for (const key of Object.keys(value)) {
      if (forbidden.has(key) || key.includes('.')) continue;
      queue.push({
        value: value[key],
        path: path ? path + '.' + key : key,
        depth: depth + 1,
      });
      if (queue.length > 1000) throw new Error('Cấu trúc nguồn quá phức tạp');
    }
  }
  return found;
}
function analyze(rows: Row[]): TableField[] {
  const map = new Map<
    string,
    { types: Set<ColumnType>; present: number; nullable: boolean }
  >();
  const sample = rows.slice(0, 100);
  for (const row of sample) {
    const stack = [{ value: row, path: '', depth: 0 }];
    let visited = 0;
    while (stack.length) {
      if (++visited > 1000) throw new Error('Bản ghi nguồn quá phức tạp');
      const entry = stack.pop()!;
      for (const [key, value] of Object.entries(entry.value)) {
        if (forbidden.has(key) || key.includes('.')) continue;
        const path = entry.path ? entry.path + '.' + key : key;
        if (object(value) && entry.depth < 6) {
          stack.push({ value, path, depth: entry.depth + 1 });
          continue;
        }
        if (object(value) || Array.isArray(value)) continue;
        const field = map.get(path) ?? {
          types: new Set<ColumnType>(),
          present: 0,
          nullable: false,
        };
        field.present++;
        if (value == null) field.nullable = true;
        else if (typeof value === 'boolean') field.types.add('boolean');
        else field.types.add(numeric(value) !== null ? 'number' : 'string');
        map.set(path, field);
        if (map.size > 100)
          throw new Error(
            'Nguồn có quá nhiều trường; hãy chọn đường dẫn cụ thể hơn',
          );
      }
    }
  }
  return [...map].map(([path, f]) => ({
    path,
    type: f.types.size > 1 ? 'mixed' : ([...f.types][0] ?? 'string'),
    nullable: f.nullable || f.present < sample.length,
  }));
}
export function executeTable(data: unknown, input: unknown): TableResult {
  const c = validateTableConfig(input),
    paths = findArrays(data);
  let selectedPath = c.dataPath;
  if (!selectedPath && !Array.isArray(data)) {
    if (paths.length === 1) selectedPath = paths[0];
    else if (paths.length > 1)
      return result([], [], [], paths, '', 0, 0, c, [
        'Nguồn có nhiều danh sách; hãy chọn đường dẫn dữ liệu.',
      ]);
    else throw new Error('Nguồn không chứa danh sách bản ghi');
  }
  const source = read(data, selectedPath);
  if (!Array.isArray(source))
    throw new Error('Đường dẫn đã chọn không phải danh sách');
  if (source.length > MAX_ROWS)
    throw new Error(
      'Nguồn vượt 5000 dòng. Hãy giới hạn tham số nguồn hoặc dùng báo cáo bất đồng bộ.',
    );
  if (source.some((r) => !object(r)))
    throw new Error('Danh sách phải gồm các bản ghi dạng object');
  const rows = source as Row[],
    schema = analyze(rows);
  const filtered = rows.filter((row) =>
    c.filters.every((f) => {
      const value = read(row, f.path);
      if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'boolean'
      )
        return false;
      if (f.operator === 'eq') return String(value) === f.value;
      if (f.operator === 'contains')
        return String(value)
          .toLocaleLowerCase('vi')
          .includes(f.value.toLocaleLowerCase('vi'));
      const n = numeric(value),
        expected = numeric(f.value);
      return (
        n !== null &&
        expected !== null &&
        (f.operator === 'gt' ? n > expected : n < expected)
      );
    }),
  );
  const warnings: string[] = [];
  let invalidNumbers = 0;
  const output: TableResult['rows'] = [];
  if (c.groupBy.length || c.columns.some((col) => col.aggregate !== 'none')) {
    const groups = new Map<
      string,
      {
        row: TableResult['rows'][number];
        stats: Map<
          string,
          { count: number; sum: number; min: number; max: number }
        >;
      }
    >();
    for (const row of filtered) {
      const key = JSON.stringify(
        c.groupBy.map((path) => {
          const v = read(row, path);
          if (typeof v === 'object' && v !== null)
            throw new Error('Trường nhóm phải là giá trị đơn');
          return v ?? null;
        }),
      );
      let group = groups.get(key);
      if (!group) {
        group = { row: {}, stats: new Map() };
        groups.set(key, group);
      }
      for (const col of c.columns) {
        const value = read(row, col.path);
        if (col.aggregate === 'none') {
          group.row[col.key] = convert(value, col.type);
          continue;
        }
        if (col.aggregate === 'count') {
          group.row[col.key] = Number(group.row[col.key] ?? 0) + 1;
          continue;
        }
        const n = numeric(value);
        if (n === null) {
          if (value != null) invalidNumbers++;
          continue;
        }
        const stat = group.stats.get(col.key) ?? {
          count: 0,
          sum: 0,
          min: Infinity,
          max: -Infinity,
        };
        stat.count++;
        stat.sum += n;
        stat.min = Math.min(stat.min, n);
        stat.max = Math.max(stat.max, n);
        if (!Number.isFinite(stat.sum))
          throw new Error('Tổng vượt giới hạn số');
        group.stats.set(col.key, stat);
      }
    }
    if (!c.groupBy.length && !groups.size) {
      groups.set('[]', {
        row: Object.fromEntries(
          c.columns
            .filter((col) => col.aggregate === 'count')
            .map((col) => [col.key, 0]),
        ),
        stats: new Map(),
      });
    }
    for (const group of groups.values()) {
      for (const col of c.columns) {
        if (col.aggregate === 'none' || col.aggregate === 'count') continue;
        const stat = group.stats.get(col.key);
        group.row[col.key] = !stat
          ? null
          : col.aggregate === 'sum'
            ? stat.sum
            : col.aggregate === 'avg'
              ? stat.sum / stat.count
              : col.aggregate === 'min'
                ? stat.min
                : stat.max;
      }
      output.push(group.row);
    }
  } else {
    for (const row of filtered) {
      const mapped: TableResult['rows'][number] = {};
      for (const col of c.columns) {
        const value = read(row, col.path);
        mapped[col.key] = convert(value, col.type);
        if (col.type === 'number' && value != null && mapped[col.key] === null)
          invalidNumbers++;
      }
      output.push(mapped);
    }
  }
  if (invalidNumbers)
    warnings.push(
      invalidNumbers + ' giá trị không phải số được bỏ qua hoặc để trống.',
    );
  if (c.sort) {
    const { key, direction } = c.sort;
    output.sort((a, b) => {
      const av = a[key],
        bv = b[key];
      if (av == null) return bv == null ? 0 : 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'vi');
      return direction === 'asc' ? cmp : -cmp;
    });
  }
  return result(
    output,
    schema,
    c.columns,
    paths,
    selectedPath,
    rows.length,
    filtered.length,
    c,
    warnings,
  );
}
function result(
  rows: TableResult['rows'],
  fields: TableField[],
  columns: TableColumn[],
  candidates: string[],
  selectedPath: string,
  inputRows: number,
  matchedRows: number,
  c: TableConfig,
  warnings: string[],
): TableResult {
  const totalPages = columns.length ? Math.ceil(rows.length / c.pageSize) : 0;
  const page = Math.min(c.page, Math.max(1, totalPages));
  return {
    candidates,
    selectedPath,
    fields,
    columns,
    rows: columns.length
      ? rows.slice((page - 1) * c.pageSize, page * c.pageSize)
      : [],
    meta: {
      inputRows,
      matchedRows,
      total: columns.length ? rows.length : 0,
      page,
      pageSize: c.pageSize,
      totalPages,
      generatedAt: new Date().toISOString(),
      scope: 'source-response',
      warnings,
    },
  };
}
