import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { User, Users, ShieldAlert } from 'lucide-react';

interface ActorNodeProps {
  data: {
    label: string;
    action?: string;
    strategy?: string;
    roleName?: string;
  };
  selected: boolean;
}

export const ActorNode = ({ data, selected }: ActorNodeProps) => {
  return (
    <div className={`min-w-[180px] bg-white dark:bg-slate-900 rounded-lg shadow-sm border-2 transition-all ${selected ? 'border-blue-500 shadow-md ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400" />
      
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          {data.strategy === 'ROLE_BASED' ? <ShieldAlert size={20} /> : data.strategy === 'DEPARTMENT' ? <Users size={20} /> : <User size={20} />}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate" title={data.label}>
            {data.label || 'Tác nhân chưa đặt tên'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {data.roleName || data.strategy || 'Chưa cấu hình'}
          </span>
        </div>
      </div>
      
      {data.action && (
        <div className="bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs text-center border-t border-slate-100 dark:border-slate-800 font-medium text-slate-600 dark:text-slate-300">
          Hành động: {data.action}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-400" />
    </div>
  );
};
