import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { BlockRegistry } from "../../core/registry";
import { initializeBlockRegistry } from "../../blocks";
import { AiService } from "../../services/aiService";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Sparkles, Wand2, Languages, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Auto-initialize registry if empty
if (BlockRegistry.getAllBlocks().length === 0) {
  initializeBlockRegistry();
}

export const RightProperties: React.FC = () => {
  const {
    layout,
    selectedRowId,
    selectedWidgetId,
    activeLang,
    // eslint-disable-next-line unused-imports/no-unused-vars
    activeTab,
    updateRowSettings,
    updateWidgetTitle,
    updateWidgetData,
    deleteRow,
    deleteWidget
  } = useEditorStore();

  const [aiLoading, setAiLoading] = React.useState(false);

  // 1. Evaluate selection
  const selectedRow = React.useMemo(() => {
    if (!selectedRowId) return null;
    return layout.find((r) => r.rowId === selectedRowId) || null;
  }, [layout, selectedRowId]);

  const selectedWidgetInfo = React.useMemo(() => {
    if (!selectedWidgetId) return null;
    for (const row of layout) {
      for (const col of row.columns) {
        const found = col.widgets.find((w) => w.id === selectedWidgetId);
        if (found) {
          return { widget: found, rowId: row.rowId, colId: col.id };
        }
      }
    }
    return null;
  }, [layout, selectedWidgetId]);

  // Handle AI Rewrite
  const handleAiRewrite = async () => {
    if (!selectedWidgetInfo) return;
    const { widget } = selectedWidgetInfo;
    const titleVal = widget.title?.[activeLang] || "";

    if (!titleVal.trim()) {
      toast.warning("Vui lòng nhập tên tiêu đề trước khi dùng trợ lý AI.");
      return;
    }

    try {
      setAiLoading(true);
      const optimized = await AiService.rewriteText(titleVal, "informative");
      updateWidgetTitle(widget.id, optimized);
      toast.success("AI đã tối ưu hóa nội dung tiêu đề!");
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (e) {
      toast.error("Trợ lý AI bận. Vui lòng thử lại sau.");
    } finally {
      setAiLoading(false);
    }
  };

  // Handle AI Auto Translate
  const handleAiTranslate = async () => {
    if (!selectedWidgetInfo) return;
    const { widget } = selectedWidgetInfo;
    const currentLang = activeLang;
    const targetLang = currentLang === "vi" ? "en" : "vi";
    const textVal = widget.title?.[currentLang] || "";

    if (!textVal.trim()) {
      toast.warning("Chưa có nội dung ở ngôn ngữ hiện tại để dịch.");
      return;
    }

    try {
      setAiLoading(true);
      const translated = await AiService.translateText(textVal, targetLang);

      const currentTitles = typeof widget.title === "string" ? { vi: widget.title, en: widget.title } : (widget.title || {});
      updateWidgetData(widget.id, {
        ...widget.data,
      });

      // Update multilingual title via store
      useEditorStore.setState((state) => {
        const updated = state.layout.map((row) => ({
          ...row,
          columns: row.columns.map((col) => ({
            ...col,
            widgets: col.widgets.map((w) => {
              if (w.id === widget.id) {
                return {
                  ...w,
                  title: { ...currentTitles, [targetLang]: translated },
                };
              }
              return w;
            }),
          })),
        }));
        return { layout: updated };
      });

      toast.success(`Đã dịch tự động sang tiếng ${targetLang === "en" ? "Anh" : "Việt"}!`);
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (e) {
      toast.error("Không thể dịch tự động.");
    } finally {
      setAiLoading(false);
    }
  };

  // 2. Render Row configurations
  if (selectedRow) {
    const settings = selectedRow.settings || {};

    return (
      <aside className="w-80 h-full border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 overflow-y-auto p-5 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Settings className="w-4.5 h-4.5 text-slate-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Cấu hình Section</h4>
        </div>

        {/* Padding configurations */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5">
              Khoảng cách lề trên (Padding Top: {settings.paddingTop || "16"}px)
            </Label>
            <Input
              type="range"
              min="0"
              max="160"
              step="8"
              value={settings.paddingTop || "16"}
              onChange={(e) => updateRowSettings(selectedRow.rowId, { paddingTop: e.target.value })}
              className="w-full accent-indigo-650 cursor-pointer h-2"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5">
              Khoảng cách lề dưới (Padding Bottom: {settings.paddingBottom || "16"}px)
            </Label>
            <Input
              type="range"
              min="0"
              max="160"
              step="8"
              value={settings.paddingBottom || "16"}
              onChange={(e) => updateRowSettings(selectedRow.rowId, { paddingBottom: e.target.value })}
              className="w-full accent-indigo-650 cursor-pointer h-2"
            />
          </div>
        </div>

        {/* Stylings */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5">
              Màu nền (Background Color)
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={settings.backgroundColor || "#ffffff"}
                onChange={(e) => updateRowSettings(selectedRow.rowId, { backgroundColor: e.target.value })}
                className="w-10 h-10 p-0 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="HEX Code"
                value={settings.backgroundColor || ""}
                onChange={(e) => updateRowSettings(selectedRow.rowId, { backgroundColor: e.target.value })}
                className="h-10 px-3 rounded-xl border-slate-150 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900 flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-0.5">
              Đường viền bo góc (Border Radius)
            </Label>
            <Select
              value={settings.borderRadius || "rounded-3xl"}
              onValueChange={(val) => updateRowSettings(selectedRow.rowId, { borderRadius: val })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-100 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900">
                <SelectValue placeholder="Chọn bán kính bo góc..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800">
                <SelectItem value="rounded-none">Không bo góc (0px)</SelectItem>
                <SelectItem value="rounded-xl">Bo nhẹ (12px)</SelectItem>
                <SelectItem value="rounded-2xl">Bo vừa (16px)</SelectItem>
                <SelectItem value="rounded-3xl">Bo nhiều (24px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-350">Tràn màn hình</span>
              <span className="text-[8px] text-slate-400 font-black uppercase">Full Width container</span>
            </div>
            <Switch
              checked={!!settings.fullWidth}
              onCheckedChange={(checked) => updateRowSettings(selectedRow.rowId, { fullWidth: checked })}
            />
          </div>
        </div>

        {/* Delete Row */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteRow(selectedRow.rowId)}
            className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider gap-1.5 hover:shadow-lg hover:shadow-rose-100 dark:hover:shadow-none"
          >
            <Trash2 className="w-4 h-4" /> Xóa Section
          </Button>
        </div>
      </aside>
    );
  }

  // 3. Render Widget configurations
  if (selectedWidgetInfo) {
    const { widget } = selectedWidgetInfo;
    const registered = BlockRegistry.getBlock(widget.type);
    const EditorComponent = registered?.editor;
    const titleVal = widget.title?.[activeLang] || "";

    return (
      <aside className="w-80 h-full border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 animate-fade-in">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 p-5 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
          <Settings className="w-4.5 h-4.5 text-slate-500" />
          <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Cấu hình Widget</h4>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Multilingual properties */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
                Tiêu đề Widget ({activeLang})
              </Label>
              <Input
                value={titleVal}
                onChange={(e) => updateWidgetTitle(widget.id, e.target.value)}
                placeholder="Nhập tiêu đề..."
                className="h-11 px-4 rounded-xl border-slate-100 dark:border-slate-800 text-xs font-bold bg-white dark:bg-slate-900 focus:ring-4 focus:ring-indigo-50/50"
              />
            </div>

            {/* AI Assistant Tools section */}
            <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/15 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400">
                <Sparkles className="w-4 h-4 fill-indigo-500/10" />
                <span className="text-[10px] font-black uppercase tracking-wider">Trợ lý nội dung AI</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAiRewrite}
                  disabled={aiLoading}
                  variant="outline"
                  className="flex-1 h-9 rounded-xl border-indigo-200 dark:border-indigo-900 text-[10px] font-bold text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 bg-white dark:bg-slate-950"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />} Tối ưu
                </Button>
                <Button
                  onClick={handleAiTranslate}
                  disabled={aiLoading}
                  variant="outline"
                  className="flex-1 h-9 rounded-xl border-indigo-200 dark:border-indigo-900 text-[10px] font-bold text-indigo-650 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 bg-white dark:bg-slate-950"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Languages className="w-3.5 h-3.5" />} Dịch tự động
                </Button>
              </div>
            </div>
          </div>

          {/* Render block specific customization component dynamically */}
          {EditorComponent && (
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80">
              <EditorComponent
                widget={widget}
                onChangeData={(newData) => updateWidgetData(widget.id, newData)}
                activeLang={activeLang}
              />
            </div>
          )}

          {/* Delete Widget */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteWidget(selectedWidgetInfo.rowId, selectedWidgetInfo.colId, widget.id)}
              className="w-full h-11 rounded-xl text-xs font-black uppercase tracking-wider gap-1.5 hover:shadow-lg hover:shadow-rose-100 dark:hover:shadow-none"
            >
              <Trash2 className="w-4 h-4" /> Xóa Widget
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  // 4. Default state
  return (
    <aside className="w-80 h-full border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shrink-0 items-center justify-center p-6 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 shadow-inner mb-4">
        <Settings className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Bảng thuộc tính</span>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-relaxed max-w-[180px]">
        Chọn bất kỳ Section hoặc Widget nào trên Canvas để điều chỉnh các thiết lập chi tiết.
      </p>
    </aside>
  );
};

export default RightProperties;
