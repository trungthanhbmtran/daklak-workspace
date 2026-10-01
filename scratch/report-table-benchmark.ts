import { performance } from 'node:perf_hooks';
import { executeTable } from '../apps/report-service/src/modules/reports/table-engine';
import type { TableConfig } from '../shared/reporting/table-contract';

const config: TableConfig = {
  version: 1, dataPath: 'data.items',
  columns: [
    { key: 'unit', path: 'unit.name', label: 'Đơn vị', type: 'string', aggregate: 'none' },
    { key: 'amount', path: 'amount', label: 'Tổng', type: 'number', aggregate: 'sum' },
  ],
  groupBy: ['unit.name'], filters: [], sort: { key: 'amount', direction: 'desc' }, page: 1, pageSize: 20,
};
for (const size of [100, 1000, 5000]) {
  const data = { data: { items: Array.from({ length: size }, (_, i) => ({ unit: { name: 'U' + i % 50 }, amount: i })) } };
  executeTable(data, config); // Warm up.
  const timings: number[] = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    const result = executeTable(data, config);
    if (result.meta.inputRows !== size || result.meta.total !== Math.min(50, size)) throw new Error('Benchmark returned incorrect data');
    timings.push(performance.now() - start);
  }
  timings.sort((a, b) => a - b);
  console.log(JSON.stringify({ rows: size, groups: 50, medianMs: +timings[5].toFixed(2), maxMs: +timings[9].toFixed(2) }));
}
const start = performance.now();
try { executeTable(Array.from({ length: 10000 }, () => ({})), { ...config, dataPath: '' }); }
catch { console.log(JSON.stringify({ rows: 10000, rejectedByLimit: true, elapsedMs: +(performance.now() - start).toFixed(2) })); }

