import React from "react";
import { BlockRegistry } from "../../core/registry";
import { initializeBlockRegistry } from "../../blocks";
import { DraggableTemplate } from "../../dnd/DndWrapper";
import { useEditorStore } from "../../store/editorStore";
import { StructureTree } from "./StructureTree";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, LayoutGrid, Layers, Columns, Sparkles } from "lucide-react";

// Auto-initialize registry if empty
if (BlockRegistry.getAllBlocks().length === 0) {
  initializeBlockRegistry();
}

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"library" | "structure">("library");
  const [search, setSearch] = React.useState("");

  const addRow = useEditorStore((state) => state.addRow);
  const registeredBlocks = BlockRegistry.getAllBlocks();

  // Search filter
  const filteredBlocks = React.useMemo(() => {
    return registeredBlocks.filter(
      (b) =>
        b.name.vi.toLowerCase().includes(search.toLowerCase()) ||
        b.name.en.toLowerCase().includes(search.toLowerCase())
    );
  }, [registeredBlocks, search]);

  const contentBlocks = filteredBlocks.filter((b) => b.category === "content");
  const dataBlocks = filteredBlocks.filter((b) => b.category === "data");

  const rowTemplates = [
    { type: "12" as const, label: "1 Cột", desc: "100%", grid: "grid-cols-1" },
    { type: "6-6" as const, label: "2 Cột", desc: "50% | 50%", grid: "grid-cols-2" },
    { type: "7-5" as const, label: "2 Cột lệch", desc: "60% | 40%", grid: "grid-cols-12", spans: ["col-span-7", "col-span-5"] },
    { type: "8-4" as const, label: "2 Cột lệch", desc: "70% | 30%", grid: "grid-cols-12", spans: ["col-span-8", "col-span-4"] },
    { type: "4-4-4" as const, label: "3 Cột đều", desc: "33% | 33% | 33%", grid: "grid-cols-3" },
  ];

  return (
    <aside className="w-80 h-full border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 select-none animate-fade-in">
      {/* Sidebar Header Tab Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-1.5 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "library"
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" /> Thư viện Widget
        </button>
        <button
          onClick={() => setActiveTab("structure")}
          className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === "structure"
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
            }`}
        >
          <Layers className="w-3.5 h-3.5" /> Outline cấu trúc
        </button>
      </div>

      {/* Main Sidebar Contents */}
      {activeTab === "library" ? (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Row Sections creators */}
          <div className="space-y-3">
            <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5 flex items-center gap-1">
              <Columns className="w-3.5 h-3.5 text-slate-400" /> Dựng khung Sections (Rows)
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {rowTemplates.map((row) => (
                <button
                  key={row.type}
                  onClick={() => addRow(row.type)}
                  className="p-3 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 text-left hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-50/10 dark:hover:shadow-none hover:-translate-y-0.5 transition-all flex flex-col justify-between h-20"
                >
                  <div className={`grid gap-1 w-full shrink-0 ${row.grid}`}>
                    {row.spans ? (
                      row.spans.map((s, idx) => (
                        <div key={idx} className={`h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm ${s}`} />
                      ))
                    ) : (
                      Array.from({ length: parseInt(row.grid.split("-").pop() || "1") }).map((_, idx) => (
                        <div key={idx} className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-sm" />
                      ))
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{row.label}</span>
                    <span className="text-[8px] text-slate-400 font-bold">{row.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Block Library search tool */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm widget..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 pr-4 rounded-xl border-slate-100 dark:border-slate-800 text-[11px] font-medium bg-slate-50/50 dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50/50 focus:bg-white transition-all"
              />
            </div>

            {/* Block Category Lists */}
            <div className="space-y-5">
              {/* Content Category */}
              {contentBlocks.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block px-0.5">
                    Nội dung & Soạn thảo
                  </span>
                  <div className="flex flex-col gap-2">
                    {contentBlocks.map((b) => (
                      <DraggableTemplate key={b.type} id={`temp-${b.type}`} type={b.type}>
                        <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-3 hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-lg transition-all">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-450 flex items-center justify-center shadow-inner">
                            <b.icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
                              {b.name.vi}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold leading-none mt-0.5">Kéo thả để chèn</span>
                          </div>
                        </div>
                      </DraggableTemplate>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Database Category */}
              {dataBlocks.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-wider block px-0.5 flex items-center gap-1">
                    Liên kết Cơ sở dữ liệu <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
                  </span>
                  <div className="flex flex-col gap-2">
                    {dataBlocks.map((b) => (
                      <DraggableTemplate key={b.type} id={`temp-${b.type}`} type={b.type}>
                        <div className="p-3.5 border border-slate-100 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900 flex items-center gap-3 hover:border-indigo-400 dark:hover:border-indigo-800 hover:shadow-lg transition-all">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-455 flex items-center justify-center shadow-inner">
                            <b.icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
                              {b.name.vi}
                            </span>
                            <span className="text-[8px] text-slate-400 font-bold leading-none mt-0.5">Kéo thả để liên kết</span>
                          </div>
                        </div>
                      </DraggableTemplate>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5">
          <StructureTree />
        </div>
      )}
    </aside>
  );
};

export default LeftSidebar;
