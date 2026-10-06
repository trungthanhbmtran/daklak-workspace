"use client";
import React, { useState } from 'react';
import { ReportConfigAST } from '../../../types';
import { Button } from '../../../../../components/ui/button';
import { SourceExplorer } from './SourceExplorer';
import { Canvas } from './Canvas';
import { ChartBuilder } from './ChartBuilder';

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
      charts: [],
    }
  );

  const [activeTab, setActiveTab] = useState<'model' | 'chart'>('model');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold text-slate-800">Trình Thiết Kế</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('model')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'model' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Mô hình Dữ liệu
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'chart' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Thiết kế Biểu đồ
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="text-slate-600 border-slate-300">
            Hủy
          </Button>
          <Button onClick={() => onSave(config)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            Lưu & Xem Trước
          </Button>
        </div>
      </div>

      {/* Main Designer Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Source Explorer (Only show in Model tab) */}
        {activeTab === 'model' && (
          <div className="w-1/4 border-r border-slate-200 bg-white overflow-y-auto shadow-sm z-0">
            <SourceExplorer
              onAddSource={(source) =>
                setConfig({ ...config, sources: [...config.sources, source] })
              }
            />
          </div>
        )}

        {/* Middle Panel */}
        <div className={`flex-1 bg-slate-50 overflow-auto relative p-6 ${activeTab === 'chart' ? 'w-full' : ''}`}>
          {activeTab === 'model' ? (
            <Canvas config={config} setConfig={setConfig} />
          ) : (
            <ChartBuilder config={config} setConfig={setConfig} />
          )}
        </div>
      </div>
    </div>
  );
};


