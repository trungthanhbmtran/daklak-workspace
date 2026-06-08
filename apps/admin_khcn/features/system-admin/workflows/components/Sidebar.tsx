import React from 'react';
import { Play, Square, User, HelpCircle } from 'lucide-react';

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 uppercase tracking-wider">Công cụ kéo thả</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Kéo các khối dưới đây thả vào không gian vẽ để tạo quy trình.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md cursor-grab active:cursor-grabbing hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
          onDragStart={(event) => onDragStart(event, 'startEnd', 'Bắt đầu')}
          draggable
        >
          <Play size={18} className="text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">Sự kiện Bắt đầu</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md cursor-grab active:cursor-grabbing hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          onDragStart={(event) => onDragStart(event, 'actor', 'Nhiệm vụ mới')}
          draggable
        >
          <User size={18} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Tác nhân / Công việc</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md cursor-grab active:cursor-grabbing hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
          onDragStart={(event) => onDragStart(event, 'decision', 'Điều kiện?')}
          draggable
        >
          <HelpCircle size={18} className="text-amber-600" />
          <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Rẽ nhánh (If/Else)</span>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md cursor-grab active:cursor-grabbing hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          onDragStart={(event) => onDragStart(event, 'startEnd', 'Kết thúc')}
          draggable
        >
          <Square size={18} className="text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">Sự kiện Kết thúc</span>
        </div>
      </div>
    </aside>
  );
};
