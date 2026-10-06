import { ReportCompiler } from './compiler';
import { ReportConfigAST } from './types';
import { RpcException } from '@nestjs/microservices';

describe('ReportCompiler', () => {
  it('should compile a valid DAG without cycles', () => {
    const ast: ReportConfigAST = {
      version: 1,
      sources: [
        { id: 'SRC1', endpoint: 'ep1', fields: [] },
        { id: 'SRC2', endpoint: 'ep2', fields: [] },
      ],
      joins: [
        {
          leftSource: 'SRC1',
          rightSource: 'SRC2',
          type: 'LEFT',
          conditions: [{ leftField: 'id', rightField: 'src1Id' }]
        }
      ],
      filters: [],
      columns: [],
      groupBy: []
    };

    const plan = ReportCompiler.compile(ast);
    expect(plan.executionOrder).toEqual(['SRC1', 'SRC2']);
    expect(plan.maxRowLimit).toBe(5000);
    expect(plan.maxFanoutLimit).toBe(15000);
  });

  it('should detect cycles and throw RpcException', () => {
    const ast: ReportConfigAST = {
      version: 1,
      sources: [
        { id: 'SRC1', endpoint: 'ep1', fields: [] },
        { id: 'SRC2', endpoint: 'ep2', fields: [] },
      ],
      joins: [
        {
          leftSource: 'SRC1',
          rightSource: 'SRC2',
          type: 'INNER',
          conditions: [{ leftField: 'id', rightField: 'src1Id' }]
        },
        {
          leftSource: 'SRC2',
          rightSource: 'SRC1',
          type: 'INNER',
          conditions: [{ leftField: 'id', rightField: 'src2Id' }]
        }
      ],
      filters: [],
      columns: [],
      groupBy: []
    };

    expect(() => ReportCompiler.compile(ast)).toThrow(RpcException);
    expect(() => ReportCompiler.compile(ast)).toThrow('Cấu hình join tạo thành vòng lặp (cycle).');
  });

  it('should throw if sources exceed limit', () => {
    const ast: ReportConfigAST = {
      version: 1,
      sources: [
        { id: '1', endpoint: 'e1', fields: [] },
        { id: '2', endpoint: 'e2', fields: [] },
        { id: '3', endpoint: 'e3', fields: [] },
        { id: '4', endpoint: 'e4', fields: [] },
      ],
      joins: [],
      filters: [],
      columns: [],
      groupBy: []
    };

    expect(() => ReportCompiler.compile(ast)).toThrow('Báo cáo phải có từ 1 đến 3 nguồn dữ liệu.');
  });
});
