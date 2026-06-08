import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface StartEndNodeProps {
  data: {
    label: string;
    type: 'start' | 'end';
  };
}

export const StartEndNode = ({ data }: StartEndNodeProps) => {
  const isStart = data.type === 'start';
  const bgColor = isStart ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md border-4 border-white dark:border-slate-800 ${bgColor}`}>
      {data.label}
      {isStart ? (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-slate-400" />
      ) : (
        <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-slate-400" />
      )}
    </div>
  );
};
