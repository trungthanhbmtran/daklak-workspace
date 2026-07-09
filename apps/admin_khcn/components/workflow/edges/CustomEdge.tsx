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

  // Determine if it is a standard condition
  const isApproved = label === 'Duyệt' || label === 'APPROVED' || label === 'Phê duyệt';
  const isRejected = label === 'Từ chối / Trả lại' || label === 'REJECTED' || label === 'Từ chối';

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
            className="nodrag nopan"
          >
             {isApproved ? (
                <WorkflowStatusBadge status="APPROVED" showIcon={true} />
             ) : isRejected ? (
                <WorkflowStatusBadge status="REJECTED" showIcon={true} />
             ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 shadow-sm uppercase whitespace-nowrap">
                  {label}
                </div>
             )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
