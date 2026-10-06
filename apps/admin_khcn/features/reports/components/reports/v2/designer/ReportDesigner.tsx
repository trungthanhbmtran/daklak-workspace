import React, { useState } from 'react';
import { ReportConfigAST } from '../../../types/v2';
import { Button } from '../../../../../../../components/ui/button';
import { SourceExplorer } from './SourceExplorer';
import { Canvas } from './Canvas';

interface ReportDesignerProps {
  initialConfig?: ReportConfigAST;
  onSave: (config: ReportConfigAST) => void;
  onCancel: () => void;
}

export const ReportDesigner: React.FC<ReportDesignerProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<ReportConfigAST>(
    initialConfig || {
      version: 1,
      sources: [],
      joins: [],
      filters: [],
      columns: [],
      groupBy: [],
    }
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Trình Thiết Kế Báo Cáo</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={() => onSave(config)}>Lưu & Xem Trước</Button>
        </div>
      </div>

      {/* Main Designer Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Source Explorer */}
        <div className="w-1/4 border-r bg-slate-50 overflow-y-auto">
          <SourceExplorer
            onAddSource={(source) =>
              setConfig({ ...config, sources: [...config.sources, source] })
            }
          />
        </div>

        {/* Middle Panel: Canvas for Joins & Transformations */}
        <div className="flex-1 bg-slate-100 overflow-auto relative p-4">
          <Canvas config={config} setConfig={setConfig} />
        </div>
      </div>
    </div>
  );
};
