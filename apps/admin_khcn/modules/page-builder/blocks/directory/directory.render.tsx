import React from "react";
import { Widget } from "../../core/types";
import { DirectoryData, DirectoryUnit } from "./directory.schema";
import { Network, Landmark, Building2, ChevronRight, ChevronDown } from "lucide-react";

interface DirectoryRenderProps {
  widget: Widget<DirectoryData>;
  activeLang: string;
}

export const DirectoryRender: React.FC<DirectoryRenderProps> = ({ widget, activeLang }) => {
  const units = widget.data?.selectedUnits || [];
  const [expandedIds, setExpandedIds] = React.useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Rebuild hierarchical trees from flat list
  const orgTree = React.useMemo(() => {
    if (!Array.isArray(units) || units.length === 0) return [];
    
    const idMap: Record<number, any> = {};
    const roots: any[] = [];

    // Initialize map
    units.forEach((unit) => {
      idMap[unit.id] = { ...unit, children: [] };
    });

    // Populate children
    units.forEach((unit) => {
      const mapped = idMap[unit.id];
      if (unit.parentId && idMap[unit.parentId]) {
        idMap[unit.parentId].children.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    return roots;
  }, [units]);

  // Recursive render component for directory items
  const RenderTreeItem = ({ node, level = 0 }: { node: any; level: number }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedIds[node.id];

    return (
      <div className="flex flex-col w-full">
        <div 
          onClick={() => hasChildren && toggleExpand(node.id)}
          className={`flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors border border-transparent hover:border-slate-100/50 dark:hover:border-slate-800/30 ${
            level === 0 ? "font-bold text-slate-800 dark:text-white" : "text-xs font-semibold text-slate-655 dark:text-slate-350"
          }`}
          style={{ paddingLeft: `${Math.max(14, level * 28)}px` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {level === 0 ? (
              <Landmark className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>

          {hasChildren && (
            <div className="w-5 h-5 rounded-lg bg-slate-100/50 dark:bg-slate-950 flex items-center justify-center text-slate-450 dark:text-slate-500">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col border-l border-slate-100 dark:border-slate-800/80 ml-5 mt-1 pb-2">
            {node.children.map((child: any) => (
              <RenderTreeItem key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {widget.title?.[activeLang] && (
        <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 border-l-4 border-indigo-600 pl-3">
          {widget.title[activeLang]}
        </h4>
      )}

      {units.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
          <p className="text-xs font-bold text-slate-350 dark:text-slate-650 uppercase tracking-widest leading-relaxed">
            Chưa thiết lập sơ đồ thư mục tổ chức
          </p>
        </div>
      ) : (
        <div className="p-4 bg-white dark:bg-slate-905 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
          {orgTree.map((root) => (
            <RenderTreeItem key={root.id} node={root} level={0} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectoryRender;
