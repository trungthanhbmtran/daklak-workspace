import React, { useEffect, useState } from 'react';
import { categoryApi } from '@/features/system-admin/categories/api';

interface PropertiesPanelProps {
  selectedNode: any | null;
  onUpdateNode: (id: string, data: any) => void;
}

export const PropertiesPanel = ({ selectedNode, onUpdateNode }: PropertiesPanelProps) => {
  const [actions, setActions] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);

  useEffect(() => {
    categoryApi.fetchByGroup('SYSTEM_ACTION').then(setActions);
    categoryApi.fetchByGroup('POSITION').then(setPositions);
    categoryApi.fetchByGroup('WORKFLOW_TRIGGER').then(setTriggers);
  }, []);
  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex h-full items-center justify-center text-slate-400 text-sm text-center">
          Chọn một nút trên sơ đồ để xem và chỉnh sửa thuộc tính.
        </div>
      </aside>
    );
  }

  const handleChange = (key: string, value: string) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      [key]: value
    });
  };

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Cấu hình: {selectedNode.data.label || 'Chưa đặt tên'}</h3>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Loại: {selectedNode.type}</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
        {/* Common Field: Label */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên / Tiêu đề</label>
          <input
            type="text"
            value={selectedNode.data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tên..."
          />
        </div>

        {/* Actor Node Specific Fields */}
        {selectedNode.type === 'actor' && (
          <>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Chiến lược giao việc</label>
              <select
                value={selectedNode.data.strategy || ''}
                onChange={(e) => handleChange('strategy', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn chiến lược --</option>
                <option value="MANAGER_TO_SUBORDINATE">Giao cho cấp phó / cấp dưới</option>
                <option value="DEPARTMENT">Giao trong cùng Phòng ban</option>
                <option value="ROLE_BASED">Chỉ định theo Chức vụ (Role)</option>
                <option value="DYNAMIC_SELECT">Tự do chọn người</option>
              </select>
            </div>

            {selectedNode.data.strategy === 'ROLE_BASED' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Chọn chức vụ (Role)</label>
                <select
                  value={selectedNode.data.roleName || ''}
                  onChange={(e) => handleChange('roleName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn Role --</option>
                  {positions.map(pos => (
                    <option key={pos.code} value={pos.code}>{pos.nameVi || pos.code}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Hành động hệ thống</label>
              <select
                value={selectedNode.data.action || ''}
                onChange={(e) => handleChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Hành động --</option>
                {actions.map(act => (
                  <option key={act.code} value={act.code}>{act.nameVi || act.code}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Decision Node Specific Fields */}
        {selectedNode.type === 'decision' && (
          <>
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Biểu thức điều kiện (Condition)</label>
              <textarea
                value={selectedNode.data.condition || ''}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="VD: ctx.amount > 1000"
                rows={4}
              />
              <p className="text-xs text-slate-500">Viết biểu thức logic Javascript truy cập biến `ctx`.</p>
            </div>
          </>
        )}

        {/* Start/End Node Specific Fields */}
        {selectedNode.type === 'startEnd' && selectedNode.data.type === 'start' && (
          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sự kiện kích hoạt (Trigger)</label>
            <select
              value={selectedNode.data.trigger || ''}
              onChange={(e) => handleChange('trigger', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Kích hoạt thủ công --</option>
              {triggers.map(trg => (
                <option key={trg.code} value={trg.code}>{trg.nameVi || trg.code}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </aside>
  );
};
