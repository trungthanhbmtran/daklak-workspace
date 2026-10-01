import { loadSync } from '@grpc/proto-loader';
import { join } from 'path';
import { ReportsController } from './reports.controller';
import type { ReportsService } from './reports.service';
import { RpcException } from '@nestjs/microservices';

describe('Table report RPC contract', () => {
  const protoRoot = join(__dirname, '../../../../../shared/protos');
  const definition = loadSync(join(protoRoot, 'reports/report.proto'), { keepCase: false, defaults: true, includeDirs: [protoRoot] });
  const service = definition['reports.ReportService'] as unknown as {
    ExecuteTable: {
      requestSerialize: (value: unknown) => Buffer;
      requestDeserialize: (value: Buffer) => { payload: string; userData: string };
      responseSerialize: (value: unknown) => Buffer;
      responseDeserialize: (value: Buffer) => { success: boolean; data: string };
    };
    GetStaffingReport: unknown;
  };
  const controller = new ReportsController({} as ReportsService);
  it('retains existing RPCs and serializes the new JSON config/result end to end', () => {
    expect(service.GetStaffingReport).toBeDefined();
    const payload = JSON.stringify({ data: { data: { items: [{ amount: '12' }] } }, config: { version: 1, dataPath: 'data.items', columns: [{ key: 'amount', path: 'amount', label: 'Giá trị', type: 'number', aggregate: 'none' }], groupBy: [], filters: [], page: 1, pageSize: 20 } });
    const request = service.ExecuteTable.requestDeserialize(service.ExecuteTable.requestSerialize({ payload, userData: '{}' }));
    const response = controller.executeTable(request);
    const decoded = service.ExecuteTable.responseDeserialize(service.ExecuteTable.responseSerialize(response));
    expect(decoded.success).toBe(true);
    expect(JSON.parse(decoded.data).rows).toEqual([{ amount: 12 }]);
  });
  it('maps invalid JSON and config to INVALID_ARGUMENT', () => {
    for (const payload of ['broken', '{}', 'null']) {
      try { controller.executeTable({ payload }); throw new Error('Should reject'); }
      catch (error) { expect(error).toBeInstanceOf(RpcException); expect((error as RpcException).getError()).toMatchObject({ code: 3 }); }
    }
  });
});

