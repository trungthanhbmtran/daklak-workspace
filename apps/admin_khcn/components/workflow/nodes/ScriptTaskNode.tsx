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
      className="border-purple-200/50 hover:border-purple-500/50 shadow-purple-500/5 bg-purple-50/30"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-purple-500"
      />

      <div className="text-xs text-muted-foreground mt-2 px-1">
        Thực thi biểu thức tính toán tự động
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-purple-500"
      />
    </BaseNode>
  );
}
