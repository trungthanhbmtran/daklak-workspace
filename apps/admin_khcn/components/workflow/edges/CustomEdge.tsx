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
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: selected ? 3 : 2, stroke: selected ? 'hsl(var(--primary))' : style.stroke || 'hsl(var(--primary))' }} id={id} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: selected ? 10 : 5,
            }}
            className="nodrag nopan bg-background/90 backdrop-blur border border-border shadow-md px-2.5 py-1 rounded-full text-[10px] font-bold text-foreground transition-all duration-200 hover:scale-105 hover:border-primary/50"
          >
             {label as string}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
