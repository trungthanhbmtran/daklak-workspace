import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface DecisionNodeProps {
  data: {
    label: string;
  };
  selected: boolean;
}

export const DecisionNode = ({ data, selected }: DecisionNodeProps) => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* The Diamond Shape Background */}
      <div 
        className={`absolute inset-0 bg-amber-50 dark:bg-amber-900/30 border-2 transition-all ${
          selected ? 'border-amber-500 shadow-md ring-2 ring-amber-200 dark:ring-amber-900/50' : 'border-amber-400 dark:border-amber-600'
        }`}
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      ></div>
      
      {/* Target Handle (Top) */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400 z-10" style={{ top: 0 }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 text-xs font-medium text-amber-900 dark:text-amber-100 line-clamp-3">
        {data.label || 'Điều kiện?'}
      </div>

      {/* True Branch Handle (Right) */}
      <Handle type="source" position={Position.Right} id="true" className="w-3 h-3 !bg-green-500 z-10" style={{ right: 0 }} />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 -translate-x-full text-[10px] text-green-600 font-bold z-10 pointer-events-none">Đúng</div>

      {/* False Branch Handle (Bottom) */}
      <Handle type="source" position={Position.Bottom} id="false" className="w-3 h-3 !bg-red-500 z-10" style={{ bottom: 0 }} />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 -translate-y-full text-[10px] text-red-600 font-bold z-10 pointer-events-none">Sai</div>
    </div>
  );
};
