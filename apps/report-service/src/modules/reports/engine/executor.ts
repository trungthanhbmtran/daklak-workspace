import { CompiledPlan, ReportSourceDef } from './types';
import { RpcException } from '@nestjs/microservices';

export class SourceExecutor {
  async fetchSource(source: ReportSourceDef, config: any): Promise<any[]> {
    // 1. Kiểm tra credential isolation
    // 2. Phân trang lấy dữ liệu giới hạn 5000 dòng
    // 3. Xử lý timeout, retries
    // 4. Redaction nếu có trường nhạy cảm
    return [];
  }

  async executePlan(plan: CompiledPlan, sourcesMap: Record<string, ReportSourceDef>): Promise<any[]> {
    // Execute sources in DAG order
    for (const sourceId of plan.executionOrder) {
      const source = sourcesMap[sourceId];
      if (!source) throw new RpcException(`Missing source config for ${sourceId}`);
      await this.fetchSource(source, {});
    }

    // Thực hiện in-memory JOIN
    return [];
  }
}
