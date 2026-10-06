import { ReportConfigAST, CompiledPlan, JoinDef } from './types';
import { RpcException } from '@nestjs/microservices';

export class ReportCompiler {
  static compile(config: ReportConfigAST): CompiledPlan {
    if (!config || config.version !== 1) {
      throw new RpcException('Cấu hình báo cáo không hợp lệ hoặc sai phiên bản.');
    }
    
    if (!config.sources || config.sources.length === 0 || config.sources.length > 3) {
      throw new RpcException('Báo cáo phải có từ 1 đến 3 nguồn dữ liệu.');
    }

    const sourceIds = new Set(config.sources.map((s) => s.id));
    if (sourceIds.size !== config.sources.length) {
      throw new RpcException('Mã alias của nguồn bị trùng lặp.');
    }

    // Graph validation (Cycle detection and DAG ordering)
    const adjacencyList = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    
    for (const src of sourceIds) {
      adjacencyList.set(src, []);
      inDegree.set(src, 0);
    }

    if (config.joins) {
      for (const join of config.joins) {
        if (!sourceIds.has(join.leftSource) || !sourceIds.has(join.rightSource)) {
          throw new RpcException('Cấu hình join trỏ đến nguồn không tồn tại.');
        }
        // Directed edge: leftSource -> rightSource
        adjacencyList.get(join.leftSource)?.push(join.rightSource);
        inDegree.set(join.rightSource, (inDegree.get(join.rightSource) || 0) + 1);
      }
    }

    // Topological Sort
    const executionOrder: string[] = [];
    const queue: string[] = [];

    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) queue.push(node);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      executionOrder.push(current);

      const neighbors = adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    if (executionOrder.length !== sourceIds.size) {
      throw new RpcException('Cấu hình join tạo thành vòng lặp (cycle).');
    }

    // Check caps
    return {
      executionOrder,
      joins: config.joins || [],
      maxFanoutLimit: 15000,
      maxRowLimit: 5000,
    };
  }
}
