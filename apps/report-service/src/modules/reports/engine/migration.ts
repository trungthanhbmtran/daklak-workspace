import { PrismaClient } from '@prisma/client';
import { ReportConfigAST } from './types';

export class ReportMigrationTool {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Bước 17: Chạy kiểm tra mapping từ legacy templates sang AST V2
   * Đây là bản chạy nháp (Dry-run), không thay đổi database.
   */
  async dryRunMigration() {
    const legacyTemplates = await this.prisma.reportTemplate.findMany({
      include: { widgets: true },
    });

    const results = {
      total: legacyTemplates.length,
      mappable: 0,
      unmappable: 0,
      details: [] as any[],
    };

    for (const template of legacyTemplates) {
      try {
        const config: ReportConfigAST = {
          version: 1,
          sources: [],
          joins: [],
          filters: [],
          columns: [],
          groupBy: [],
        };

        // Lấy source dựa trên dataSourceCode từ widget đầu tiên (giả sử template đồng nhất)
        let endpoint = 'UNKNOWN';
        if (template.widgets.length > 0 && template.widgets[0].dataSourceCode) {
          endpoint = template.widgets[0].dataSourceCode;
        }

        config.sources.push({
          id: endpoint,
          endpoint: endpoint,
          fields: [], // Phải lấy từ config cũ
        });

        // Xử lý Widgets
        for (const widget of template.widgets) {
          let oldConfig: any = {};
          try {
            oldConfig = typeof widget.config === 'string' ? JSON.parse(widget.config) : widget.config;
          } catch (e) {
            // bỏ qua
          }
          
          if (oldConfig.columns) {
            oldConfig.columns.forEach((col: any) => {
              config.columns.push({
                key: col.field || col.id || 'col',
                source: endpoint,
                field: col.field || col.id,
                type: 'string', // mặc định
                aggregate: 'none',
                label: col.label || col.field,
              });
            });
          }
        }

        results.mappable++;
        results.details.push({
          legacyId: template.id,
          legacyName: template.title,
          status: 'MAPPABLE',
          ast: config,
        });
      } catch (error: any) {
        results.unmappable++;
        results.details.push({
          legacyId: template.id,
          legacyName: template.title,
          status: 'UNMAPPABLE',
          reason: error.message,
        });
      }

    }

    return results;
  }
}
