import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, EdgeProps } from '@xyflow/react';
import { WorkflowStatusBadge } from '../shared/WorkflowStatusBadge';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 3 : 2, stroke: selected ? '#6366f1' : style.stroke || '#64748b' }} id={id} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: selected ? 10 : 5,
            }}
            className="nodrag nopan bg-white border border-border px-1.5 py-0.5 rounded-md text-[10px] font-bold"
          >
             {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
