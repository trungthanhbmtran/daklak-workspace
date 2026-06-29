import React from 'react';
import { Split, ArrowLeftCircle } from 'lucide-react';
import { TASK_STATUS_CONFIG } from '@/components/shared/badges/TaskBadges';
import { TaskStatusBadge } from '@/components/shared/badges/TaskBadges';
import { useTaskDelegation } from '../hooks/useTaskDelegation';

interface TaskDelegationTreeProps {
  rootTaskId: number | undefined;
  activeTaskId: number | undefined;
  onSelectTask: (task: any) => void;
}

export function TaskDelegationTree({ rootTaskId, activeTaskId, onSelectTask }: TaskDelegationTreeProps) {
  const { delegationChain, isLoadingChain } = useTaskDelegation(rootTaskId);

  return (
    <div className="flex flex-col bg-slate-50/60 dark:bg-slate-900/50 overflow-y-auto border-t xl:border-t-0 border-slate-200 dark:border-slate-800 h-full">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 sticky top-0 backdrop-blur-md z-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <ArrowLeftCircle className="w-3.5 h-3.5 text-indigo-400 rotate-180" /> Cây công việc
        </h3>
      </div>

      <div className="flex-1 p-4">
        {isLoadingChain ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : delegationChain.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
              <Split className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-xs font-medium text-slate-400">Chưa có cây công việc</p>
            <p className="text-[11px] text-slate-300 mt-1">Sử dụng &quot;Phân rã&quot; để tạo task con</p>
          </div>
        ) : (
          <div className="py-2">
            {(function RenderTree() {
              // 1. Build Tree
              const nodeMap: Record<number, any> = {};
              const rootNodes: any[] = [];

              delegationChain.forEach((n: any) => {
                nodeMap[n.id] = { ...n, children: [] };
              });

              delegationChain.forEach((n: any) => {
                const parent = nodeMap[n.parentId];
                if (parent && n.level !== -1) {
                  parent.children.push(nodeMap[n.id]);
                } else if (n.level === -1) {
                  rootNodes.push(nodeMap[n.id]);
                } else if (n.level === 0 && !delegationChain.find((x: any) => x.level === -1)) {
                  rootNodes.push(nodeMap[n.id]);
                } else if (!parent) {
                  rootNodes.push(nodeMap[n.id]);
                }
              });

              // 2. Recursive Renderer
              const renderNode = (node: any, isLast: boolean, depth: number) => {
                const isCurrent = node.id === activeTaskId;
                const statusCfg = TASK_STATUS_CONFIG[node.status] || TASK_STATUS_CONFIG.TODO;

                return (
                  <div key={node.id} className="relative">
                    {/* L-shape line for branching */}
                    {depth > 0 && (
                      <div className="absolute top-0 -left-[28px] w-[28px] h-7 border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl" />
                    )}
                    {/* Continuous vertical line if not the last child */}
                    {depth > 0 && !isLast && (
                      <div className="absolute top-7 bottom-[-16px] -left-[28px] w-0.5 bg-slate-200 dark:bg-slate-700" />
                    )}

                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isCurrent) {
                          onSelectTask(node);
                        }
                      }}
                      className={`relative flex items-start gap-3 pl-4 pr-3 py-3 rounded-2xl transition-all duration-200 ${isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}
                    >
                      {/* Dot */}
                      <div className={`mt-1 w-2.5 h-2.5 rounded-full ${statusCfg.dot} ring-[3px] ring-white dark:ring-slate-900 shadow-sm shrink-0 z-10`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9.5px] font-black uppercase tracking-wider ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {node.level === -1 ? '🌳 Gốc' : isCurrent ? '▶ Đang xem' : node.children.length > 0 ? '🪵 Nhánh' : '🌿 Lá'}
                          </span>
                          <TaskStatusBadge code={node.status} className="text-[9px] font-black px-1.5 py-0.5" />
                        </div>
                        <p className={`font-bold text-[12.5px] line-clamp-3 leading-snug mb-1.5 ${isCurrent ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-300'}`}>
                          {node.title}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0">
                            {(node.assigneeName || node.assigneeCode)?.charAt(0) || '?'}
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 truncate">{node.assigneeName || node.assigneeCode || 'Chưa phân công'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Children */}
                    {node.children && node.children.length > 0 && (
                      <div className="ml-8 mt-2 relative space-y-2">
                        {node.children.map((child: any, idx: number) =>
                          renderNode(child, idx === node.children.length - 1, depth + 1)
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              return (
                <div className="space-y-3">
                  {rootNodes.map((root, idx) => renderNode(root, idx === rootNodes.length - 1, 0))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
