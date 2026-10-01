import { executeTable, validateTableConfig } from './table-engine';
import type { TableConfig, TableColumn } from '../../../../../shared/reporting/table-contract';

const text: TableColumn = { key: 'unit', path: 'unit.name', label: 'Đơn vị', type: 'string', aggregate: 'none' };
const amount: TableColumn = { key: 'amount', path: 'amount', label: 'Giá trị', type: 'number', aggregate: 'none' };
const config = (patch: Partial<TableConfig> = {}): TableConfig => ({ version: 1, dataPath: '', columns: [text, amount], groupBy: [], filters: [], page: 1, pageSize: 20, ...patch });
const rows = [{ unit: { name: 'A' }, amount: '10' }, { unit: { name: 'B' }, amount: 20 }, { unit: { name: 'A' }, amount: 30 }, { unit: { name: 'A' }, amount: 'invalid' }];

describe('Report table engine', () => {
  it('resolves nested envelopes and maps labels/paths without changing source', () => {
    const result = executeTable({ data: { items: rows } }, config());
    expect(result.selectedPath).toBe('data.items');
    expect(result.rows[0]).toEqual({ unit: 'A', amount: 10 });
    expect(rows[0].amount).toBe('10');
    expect(result.columns[0].label).toBe('Đơn vị');
    expect(result.meta.warnings).toHaveLength(1);
  });
  it('requires explicit choice when multiple lists are present', () => {
    const result = executeTable({ data: { items: rows, other: [] } }, config({ columns: [] }));
    expect(result.candidates).toEqual(['data.items', 'data.other']);
    expect(result.rows).toEqual([]);
    expect(result.meta.warnings).toHaveLength(1);
    expect(executeTable({ items: rows, other: [] }, config({ dataPath: 'items' })).meta.inputRows).toBe(4);
  });
  it('analyzes union of fields from a bounded sample with nullable and mixed types', () => {
    const result = executeTable([{ a: 1 }, { a: 'word', b: true }], config({ columns: [] }));
    expect(result.fields).toEqual([{ path: 'a', type: 'mixed', nullable: false }, { path: 'b', type: 'boolean', nullable: true }]);
    expect(result.rows).toEqual([]);
  });
  it.each([['sum', 40], ['avg', 20], ['min', 10], ['max', 30], ['count', 3]] as const)('groups with %s and excludes invalid numeric values', (aggregate, expected) => {
    const result = executeTable(rows, config({ groupBy: ['unit.name'], columns: [text, { ...amount, aggregate }] }));
    expect(result.rows.find(r => r.unit === 'A')?.amount).toBe(expected);
  });
  it('aggregates without a group as one total', () => {
    expect(executeTable(rows, config({ columns: [{ ...amount, aggregate: 'sum' }] })).rows).toEqual([{ amount: 60 }]);
  });
  it('distinguishes null, missing, string and numeric grouping keys', () => {
    const result = executeTable([{ k: null }, {}, { k: '1' }, { k: 1 }], config({ groupBy: ['k'], columns: [{ key: 'n', path: 'k', label: 'Đếm', type: 'number', aggregate: 'count' }] }));
    expect(result.rows.map(r => r.n)).toEqual([2,1,1]);
  });
  it('filters before grouping and sorts before pagination', () => {
    const result = executeTable(rows, config({ filters: [{ path: 'amount', operator: 'gt', value: '15' }], sort: { key: 'amount', direction: 'desc' }, pageSize: 1, page: 2 }));
    expect(result.rows).toEqual([{ unit: 'B', amount: 20 }]);
    expect(result.meta).toMatchObject({ inputRows: 4, matchedRows: 2, total: 2, totalPages: 2, page: 2, scope: 'source-response' });
  });
  it('filters strings and leaves nulls at end of descending sort', () => {
    const result = executeTable(rows, config({ filters: [{ path: 'unit.name', operator: 'contains', value: 'a' }], sort: { key: 'amount', direction: 'desc' } }));
    expect(result.rows.map(r => r.amount)).toEqual([30, 10, null]);
  });
  it('converts boolean false and preserves null without converting empty to zero', () => {
    const result = executeTable([{ active: false, amount: '' }, { active: 'true', amount: '   ' }], config({ columns: [amount, { key: 'active', path: 'active', label: 'Hoạt động', type: 'boolean', aggregate: 'none' }] }));
    expect(result.rows).toEqual([{ amount: null, active: false }, { amount: null, active: true }]);
  });
  it('returns empty result for an empty valid list', () => {
    expect(executeTable([], config()).meta).toMatchObject({ total: 0, totalPages: 0, page: 1 });
  });
  it('clamps a page after source rows shrink', () => {
    expect(executeTable(rows, config({ page: 100 })).meta.page).toBe(1);
  });
  it('rejects unsupported data structures and oversized source', () => {
    expect(() => executeTable({ data: {} }, config())).toThrow();
    expect(() => executeTable([1,2], config())).toThrow();
    expect(() => executeTable(Array.from({ length: 5001 }, () => ({})), config())).toThrow('5000');
    expect(() => executeTable({ items: {} }, config({ dataPath: 'items' }))).toThrow();
  });
  it('rejects prototype traversal, duplicate keys and unsupported versions', () => {
    expect(() => validateTableConfig(config({ dataPath: '__proto__.items' }))).toThrow();
    expect(() => validateTableConfig(config({ columns: [text, text] }))).toThrow();
    expect(() => validateTableConfig({ ...config(), version: 2 })).toThrow();
    expect(() => validateTableConfig(config({ columns: [{ ...amount, key: '__proto__' }] }))).toThrow();
  });
  it('rejects invalid aggregation, filter and pagination contracts', () => {
    expect(() => validateTableConfig(config({ groupBy: ['unit.name'] }))).toThrow();
    expect(() => validateTableConfig(config({ columns: [{ ...text, aggregate: 'sum' }] }))).toThrow();
    expect(() => validateTableConfig(config({ pageSize: 101 }))).toThrow();
    expect(() => validateTableConfig(config({ filters: [{ path: 'amount', operator: 'gt', value: 'NaN' }] }))).toThrow();
    expect(() => validateTableConfig(config({ sort: { key: 'unknown', direction: 'asc' } }))).toThrow();
  });
  it('rejects overflow rather than producing a misleading numeric total', () => {
    expect(() => executeTable([{ amount: 1e308 }, { amount: 1e308 }], config({ columns: [{ ...amount, aggregate: 'sum' }] }))).toThrow('giới hạn');
  });
  it('bounds deep and cyclic structures', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => executeTable(circular, config())).toThrow();
    expect(() => executeTable({ items: [circular] }, config())).not.toThrow();
  });
  it('bounds analysis field count', () => {
    expect(() => executeTable([Object.fromEntries(Array.from({ length: 101 }, (_, i) => ['field' + i, i]))], config())).toThrow('quá nhiều trường');
  });
});

