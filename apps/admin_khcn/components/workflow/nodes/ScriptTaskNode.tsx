/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from '@xyflow/react';
import { Code2 } from 'lucide-react';
import BaseNode from './BaseNode';

export default function ScriptTaskNode({ data, isConnectable, type }: any) {
  return (
    <BaseNode
      label={data.label || 'Tác vụ Mã kịch bản'}
      type={type}
      icon={<Code2 className="w-4 h-4 text-purple-500" />}
      // isConnectable={isConnectable}
      className="border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 -mt-1 border-2 border-background bg-purple-500 ring-2 ring-purple-500/30 transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
      />

      <div className="text-xs text-muted-foreground mt-2 px-1">
        Thực thi biểu thức tính toán tự động
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 -mb-1 border-2 border-background bg-purple-500 ring-2 ring-purple-500/30 transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
      />
    </BaseNode>
  );
}
