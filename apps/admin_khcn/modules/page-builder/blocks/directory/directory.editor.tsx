/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Widget } from "../../core/types";
import { DirectoryData } from "./directory.schema";
import { Label } from "@/components/ui/label";
import { useOrganizationTreeQuery } from "../../services/dataBinding";
import { Loader2, Landmark, Building2, CheckSquare2, Square, Network } from "lucide-react";

interface DirectoryEditorProps {
  widget: Widget<DirectoryData>;
  onChangeData: (data: DirectoryData) => void;
  activeLang: string;
}

export const DirectoryEditor: React.FC<DirectoryEditorProps> = ({ widget, onChangeData }) => {
  const { data: orgTree, isLoading } = useOrganizationTreeQuery();

  const selectedUnitIds = widget.data?.selectedUnitIds || [];
  const selectedUnits = widget.data?.selectedUnits || [];

  // Recursive checker helper to add/remove nodes and all descendants
  const toggleUnitRecursive = (node: any, isChecked: boolean) => {
    let newIds = [...selectedUnitIds];
    let newUnits = [...selectedUnits];

    const processNode = (n: any, check: boolean) => {
      if (check) {
        if (!newIds.includes(n.id)) {
          newIds.push(n.id);
          newUnits.push({
            id: n.id,
            name: n.name,
            code: n.code || null,
            parentId: n.parentId || null,
          });
        }
      } else {
        newIds = newIds.filter((id) => id !== n.id);
        newUnits = newUnits.filter((u) => u.id !== n.id);
      }

      if (Array.isArray(n.children)) {
        n.children.forEach((child: any) => processNode(child, check));
      }
    };

    processNode(node, isChecked);

    onChangeData({
      selectedUnitIds: newIds,
      selectedUnits: newUnits,
      displayStyle: widget.data?.displayStyle || "tree",
    });
  };

  // Recursive UI Renderer for Organization Node
  const RenderEditorTreeItem = ({ node, level = 0 }: { node: any; level: number }) => {
    const isSelected = selectedUnitIds.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col w-full">
        <div 
          onClick={() => toggleUnitRecursive(node, !isSelected)}
          className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors border border-transparent hover:border-slate-100/50 dark:hover:border-slate-800/30 ${
            level === 0 ? "font-bold text-slate-800 dark:text-white" : "text-xs font-semibold text-slate-500 dark:text-slate-454"
          }`}
          style={{ paddingLeft: `${Math.max(12, level * 24)}px` }}
        >
          {/* Custom Checkbox Design */}
          <div className="shrink-0 transition-transform duration-200 active:scale-90">
            {isSelected ? (
              <CheckSquare2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-50/30" />
            ) : (
              <Square className="w-5 h-5 text-slate-200 dark:text-slate-800 bg-white dark:bg-slate-950 rounded-lg" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {level === 0 ? (
              <Landmark className="w-4 h-4 text-indigo-500 shrink-0" />
            ) : (
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
        </div>

        {hasChildren && (
          <div className="flex flex-col border-l border-slate-100 dark:border-slate-800/80 ml-5 mt-1 pb-1">
            {node.children.map((child: any) => (
              <RenderEditorTreeItem key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Kiểu hiển thị Selector */}
      <div className="flex flex-col gap-2 px-1">
        <Label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
          Kiểu hiển thị trên Portal
        </Label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-center text-xs">
          {[
            { id: "tree", label: "Sơ đồ cây", icon: Network },
            { id: "grid", label: "Dạng lưới", icon: Landmark },
            { id: "list", label: "Danh sách", icon: Building2 }
          ].map((style) => {
            const StyleIcon = style.icon;
            const isSelected = (widget.data?.displayStyle || "tree") === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => {
                  onChangeData({
                    selectedUnitIds,
                    selectedUnits,
                    displayStyle: style.id as any
                  });
                }}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
                  isSelected
                    ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-slate-800/50"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
                }`}
              >
                <StyleIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[10px]">{style.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <Label className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
          Thư mục sơ đồ tổ chức
        </Label>
        <span className="text-[9px] text-indigo-500 font-bold leading-normal mt-1">
          * Chọn phòng ban cấp cha sẽ tự động chọn tất cả các phòng ban cấp con.
        </span>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-3xl">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="max-h-[480px] overflow-y-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-inner space-y-1">
          {Array.isArray(orgTree) && orgTree.length > 0 ? (
            orgTree.map((root: any) => (
              <RenderEditorTreeItem key={root.id} node={root} level={0} />
            ))
          ) : (
            <div className="py-8 text-center text-[10px] font-bold text-slate-400">
              Không thể tải sơ đồ tổ chức
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DirectoryEditor;
