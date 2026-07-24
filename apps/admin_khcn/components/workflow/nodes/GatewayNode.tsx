/* eslint-disable @typescript-eslint/no-explicit-any */
import { Handle, Position } from '@xyflow/react';
import { Diamond } from 'lucide-react';
import BaseNode from './BaseNode';

export default function GatewayNode({ data, isConnectable, type }: any) {
  const isParallel = type === 'parallel_gateway';
  return (
    <BaseNode
      label={data.label || (isParallel ? 'Rẽ nhánh song song' : 'Rẽ nhánh điều kiện')}
      type={type}
      icon={<Diamond className="w-4 h-4 text-orange-500" />}
      // isConnectable={isConnectable}
      className="border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50"
    >
      {/* Default Target Handle (Left) is handled by BaseNode */}

      <div className="text-xs text-muted-foreground mt-2 px-1 text-center">
        {isParallel ? 'Phân nhánh đồng thời (Fork/Join)' : 'Đánh giá điều kiện nhánh (XOR)'}
      </div>

      <Handle
        id="true"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-4 h-4 -mr-2 border-2 border-background bg-orange-500 ring-2 ring-orange-500/30 transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(249,115,22,0.5)] z-10"
      />
      <Handle
        id="false"
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-4 h-4 -mb-2 border-2 border-background bg-destructive ring-2 ring-destructive/30 transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)] z-10"
      />
      {/* Fallback default handle for legacy edges without sourceHandle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </BaseNode>
  );
}
