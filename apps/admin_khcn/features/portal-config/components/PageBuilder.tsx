"use client";

import React, { useState } from "react";
import { 
  MoveUp, 
  MoveDown, 
  Trash2, 
  Plus, 
  Layout, 
  Sparkles, 
  Grid3X3, 
  Layers, 
  FolderEdit, 
  Map, 
  PhoneCall, 
  UserSquare2, 
  Settings2,
  Columns,
  Eye,
  ArrowUpDown,
  CheckCircle2,
  Type,
  Workflow,
  FileText,
  X,
  Code,
  Copy,
  Images,
  Newspaper,
  Landmark,
  FolderOpen,
  HelpCircle,
  ExternalLink,
  Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LexicalEditor } from "@/features/posts/components/editor/LexicalEditor";
import { toast } from "sonner";

interface Widget {
  id: string;
  type: "LEXICAL_RICH_TEXT" | "STATISTICS_GRID" | "LEADERSHIP_LIST" | "ORG_SECTIONS_DIRECTORY" | "COMMUNE_INTERACTIVE_MAP" | "CONTACT_INFO_SIDEBAR" | "CONTACT_FORM" | "HERO_SLIDER" | "FEATURED_NEWS" | "PUBLIC_SERVICES" | "LEGAL_DOCUMENTS" | "PHOTO_VIDEO_GALLERY" | "FAQ_ACCORDION" | "EXTERNAL_LINKS";
  title: Record<string, string>;
  content?: Record<string, string>; // Lexical state JSON per language
  data?: any;
}

interface Column {
  id: string;
  colSpan: string; // lg:col-span-12, lg:col-span-6, lg:col-span-7, lg:col-span-5
  widgets: Widget[];
}

interface Row {
  rowId: string;
  columns: Column[];
}

interface PageBuilderProps {
  layout: Row[];
  onChange: (layout: Row[]) => void;
  languages: any[];
}

export function PageBuilder({ layout, onChange, languages }: PageBuilderProps) {
  const [activeLang, setActiveLang] = useState<string>("vi");
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Layout structures templates
  const addRow = (type: "12" | "6-6" | "7-5" | "8-4" | "4-4-4") => {
    let columns: Column[] = [];
    const timestamp = Date.now();
    if (type === "12") {
      columns = [{ id: `col-${timestamp}-1`, colSpan: "lg:col-span-12", widgets: [] }];
    } else if (type === "6-6") {
      columns = [
        { id: `col-${timestamp}-1`, colSpan: "lg:col-span-6", widgets: [] },
        { id: `col-${timestamp}-2`, colSpan: "lg:col-span-6", widgets: [] }
      ];
    } else if (type === "7-5") {
      columns = [
        { id: `col-${timestamp}-1`, colSpan: "lg:col-span-7", widgets: [] },
        { id: `col-${timestamp}-2`, colSpan: "lg:col-span-5", widgets: [] }
      ];
    } else if (type === "8-4") {
      columns = [
        { id: `col-${timestamp}-1`, colSpan: "lg:col-span-8", widgets: [] },
        { id: `col-${timestamp}-2`, colSpan: "lg:col-span-4", widgets: [] }
      ];
    } else if (type === "4-4-4") {
      columns = [
        { id: `col-${timestamp}-1`, colSpan: "lg:col-span-4", widgets: [] },
        { id: `col-${timestamp}-2`, colSpan: "lg:col-span-4", widgets: [] },
        { id: `col-${timestamp}-3`, colSpan: "lg:col-span-4", widgets: [] }
      ];
    }

    const newRow: Row = { rowId: `row-${timestamp}`, columns };
    onChange([...layout, newRow]);
  };

  const deleteRow = (rowId: string) => {
    onChange(layout.filter(r => r.rowId !== rowId));
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= layout.length) return;
    const newLayout = [...layout];
    const temp = newLayout[index];
    newLayout[index] = newLayout[nextIndex];
    newLayout[nextIndex] = temp;
    onChange(newLayout);
  };

  const addWidget = (rowId: string, colId: string, widgetType: Widget["type"]) => {
    const timestamp = Date.now();
    
    // Default dynamic properties depending on type
    const defaultTitle: Record<string, string> = {
      vi: "",
      en: ""
    };
    let defaultContent: Record<string, string> = {
      vi: "",
      en: ""
    };

    if (widgetType === "LEXICAL_RICH_TEXT") {
      defaultTitle.vi = "Khối nội dung văn bản";
      defaultTitle.en = "Rich Text block";
    } else if (widgetType === "STATISTICS_GRID") {
      defaultTitle.vi = "Số liệu thống kê nhanh";
      defaultTitle.en = "Demographics Stats";
    } else if (widgetType === "LEADERSHIP_LIST") {
      defaultTitle.vi = "Danh sách cán bộ lãnh đạo";
      defaultTitle.en = "Key Leading Officers";
    } else if (widgetType === "ORG_SECTIONS_DIRECTORY") {
      defaultTitle.vi = "Sơ đồ bộ máy tổ chức";
      defaultTitle.en = "Organizational Directory";
    } else if (widgetType === "COMMUNE_INTERACTIVE_MAP") {
      defaultTitle.vi = "Bản đồ phân vùng thôn buôn";
      defaultTitle.en = "Administrative Vector Map";
    } else if (widgetType === "CONTACT_INFO_SIDEBAR") {
      defaultTitle.vi = "Thông tin liên hệ & lịch tiếp dân";
      defaultTitle.en = "Office contact details & schedule";
    } else if (widgetType === "CONTACT_FORM") {
      defaultTitle.vi = "Biểu mẫu gửi góp ý";
      defaultTitle.en = "Feedback Comment Form";
    } else if (widgetType === "HERO_SLIDER") {
      defaultTitle.vi = "Trình chiếu Banners & Slogan";
      defaultTitle.en = "Hero Banner Slider";
    } else if (widgetType === "FEATURED_NEWS") {
      defaultTitle.vi = "Tin tức nổi bật mới nhất";
      defaultTitle.en = "Featured Latest News";
    } else if (widgetType === "PUBLIC_SERVICES") {
      defaultTitle.vi = "Dịch vụ công & Tra cứu hồ sơ";
      defaultTitle.en = "Public Services & Lookup";
    } else if (widgetType === "LEGAL_DOCUMENTS") {
      defaultTitle.vi = "Văn bản chỉ đạo điều hành";
      defaultTitle.en = "Legal Documents";
    } else if (widgetType === "PHOTO_VIDEO_GALLERY") {
      defaultTitle.vi = "Thư viện Hình ảnh & Video";
      defaultTitle.en = "Photo & Video Gallery";
    } else if (widgetType === "FAQ_ACCORDION") {
      defaultTitle.vi = "Hỏi đáp trực tuyến (FAQ)";
      defaultTitle.en = "Online FAQ";
    } else if (widgetType === "EXTERNAL_LINKS") {
      defaultTitle.vi = "Liên kết website & Đối tác";
      defaultTitle.en = "External Links";
    }

    const newWidget: Widget = {
      id: `widget-${timestamp}`,
      type: widgetType,
      title: defaultTitle,
      content: defaultContent,
      data: {}
    };

    const newLayout = layout.map(row => {
      if (row.rowId === rowId) {
        return {
          ...row,
          columns: row.columns.map(col => {
            if (col.id === colId) {
              return { ...col, widgets: [...col.widgets, newWidget] };
            }
            return col;
          })
        };
      }
      return row;
    });

    onChange(newLayout);
    setSelectedWidgetId(newWidget.id);
  };

  const deleteWidget = (rowId: string, colId: string, widgetId: string) => {
    const newLayout = layout.map(row => {
      if (row.rowId === rowId) {
        return {
          ...row,
          columns: row.columns.map(col => {
            if (col.id === colId) {
              return { ...col, widgets: col.widgets.filter(w => w.id !== widgetId) };
            }
            return col;
          })
        };
      }
      return row;
    });
    onChange(newLayout);
    if (selectedWidgetId === widgetId) setSelectedWidgetId(null);
  };

  const updateWidgetTitle = (widgetId: string, value: string) => {
    const newLayout = layout.map(row => ({
      ...row,
      columns: row.columns.map(col => ({
        ...col,
        widgets: col.widgets.map(w => {
          if (w.id === widgetId) {
            return {
              ...w,
              title: {
                ...w.title,
                [activeLang]: value
              }
            };
          }
          return w;
        })
      }))
    }));
    onChange(newLayout);
  };

  const updateWidgetContent = (widgetId: string, lexicalJson: string) => {
    const newLayout = layout.map(row => ({
      ...row,
      columns: row.columns.map(col => ({
        ...col,
        widgets: col.widgets.map(w => {
          if (w.id === widgetId) {
            return {
              ...w,
              content: {
                ...(w.content || {}),
                [activeLang]: lexicalJson
              }
            };
          }
          return w;
        })
      }))
    }));
    onChange(newLayout);
  };

  // Find currently selected widget object
  const getSelectedWidget = (): Widget | null => {
    if (!selectedWidgetId) return null;
    for (const row of layout) {
      for (const col of row.columns) {
        for (const widget of col.widgets) {
          if (widget.id === selectedWidgetId) return widget;
        }
      }
    }
    return null;
  };

  const currentWidget = getSelectedWidget();
  const isLexicalActive = currentWidget?.type === "LEXICAL_RICH_TEXT";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
      
      {/* LEFT PANEL: Layout Builder Canvas */}
      <div className={`w-full space-y-6 transition-all duration-500 ${isLexicalActive ? 'xl:col-span-4 order-2 xl:order-1' : 'xl:col-span-8 order-1 max-w-7xl'}`}>
        
        {/* Layout templates picker */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#b91c1c] dark:text-[#fbc02d]" />
                <div>
                  <CardTitle className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
                    Thêm hàng cấu trúc mới
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">Chọn kiểu phân chia tỷ lệ cột cho dòng</p>
                </div>
              </div>

              {/* Language toggler */}
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg self-start">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setActiveLang(l.code)}
                    className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-md transition-all ${
                      activeLang === l.code
                        ? "bg-white dark:bg-slate-800 text-[#b91c1c] dark:text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50/20">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow("12")}
              className="flex items-center gap-1.5 font-bold text-xs justify-start border-slate-200 hover:border-[#b91c1c] hover:bg-red-50/10"
            >
              <Columns className="w-4 h-4 text-[#b91c1c] shrink-0" />
              <span>Cột đơn (100%)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow("6-6")}
              className="flex items-center gap-1.5 font-bold text-xs justify-start border-slate-200 hover:border-[#b91c1c] hover:bg-red-50/10"
            >
              <Grid3X3 className="w-4 h-4 text-[#b91c1c] shrink-0" />
              <span>Hai cột (50-50)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow("7-5")}
              className="flex items-center gap-1.5 font-bold text-xs justify-start border-slate-200 hover:border-[#b91c1c] hover:bg-red-50/10"
            >
              <Columns className="w-4 h-4 rotate-90 text-[#b91c1c] shrink-0" />
              <span>Hai cột lệch (7-5)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow("8-4")}
              className="flex items-center gap-1.5 font-bold text-xs justify-start border-slate-200 hover:border-[#b91c1c] hover:bg-red-50/10"
            >
              <Layers className="w-4 h-4 text-[#b91c1c] shrink-0" />
              <span>Hai cột lệch (8-4)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addRow("4-4-4")}
              className="flex items-center gap-1.5 font-bold text-xs justify-start border-slate-200 hover:border-[#b91c1c] hover:bg-red-50/10"
            >
              <Grid3X3 className="w-4 h-4 text-[#b91c1c] shrink-0" />
              <span>Ba cột (4-4-4)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Builder rows rendering with portal-accurate viewport bounds */}
        <div className="border border-slate-200 dark:border-slate-800/80 p-4 sm:p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 w-full space-y-8 shadow-inner relative pt-10">
          <div className="absolute top-3.5 left-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 select-none animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            Khung hiển thị thực tế trên Portal (1280px Max)
          </div>

          {layout.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
                <Layout className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">Trang trống • Hãy thêm hàng cấu trúc để thiết kế</p>
            </div>
          ) : (
            layout.map((row, rIdx) => (
              <div 
                key={row.rowId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-4 shadow-sm relative group space-y-4 hover:shadow-md transition-all"
              >
                {/* Row Header controls */}
                <div className="flex items-center justify-between border-b dark:border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#b91c1c]/10 text-[#b91c1c] dark:text-[#fbc02d] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                      Hàng {rIdx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      ({row.columns.length} Cột phân vùng)
                    </span>
                  </div>

                  {/* Move, delete buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={rIdx === 0}
                      onClick={() => moveRow(rIdx, "up")}
                      className="w-7 h-7 hover:bg-slate-100 text-slate-500 rounded-lg"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={rIdx === layout.length - 1}
                      onClick={() => moveRow(rIdx, "down")}
                      className="w-7 h-7 hover:bg-slate-100 text-slate-500 rounded-lg"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRow(row.rowId)}
                      className="w-7 h-7 hover:bg-red-50 hover:text-[#b91c1c] text-slate-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Columns content boxes */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                  {row.columns.map((col) => (
                    <div 
                      key={col.id} 
                      className={`${col.colSpan} border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-4 min-h-[140px] bg-slate-50/20 dark:bg-slate-950/20 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between`}
                    >
                      {/* Column widgets list */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                            Phân khu ({col.colSpan.replace("lg:col-span-", "")}/12 Cột)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {col.widgets.map((widget) => {
                            const isSelected = selectedWidgetId === widget.id;
                            return (
                              <div
                                key={widget.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWidgetId(widget.id);
                                }}
                                className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between group/widget ${
                                  isSelected
                                    ? "bg-[#b91c1c]/5 border-[#b91c1c] shadow-sm"
                                    : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:border-slate-300"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                                    isSelected ? "bg-[#b91c1c] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                  }`}>
                                    {widget.type === "LEXICAL_RICH_TEXT" && <Type className="w-4 h-4" />}
                                    {widget.type === "STATISTICS_GRID" && <Grid3X3 className="w-4 h-4" />}
                                    {widget.type === "LEADERSHIP_LIST" && <UserSquare2 className="w-4 h-4" />}
                                    {widget.type === "ORG_SECTIONS_DIRECTORY" && <Workflow className="w-4 h-4" />}
                                    {widget.type === "COMMUNE_INTERACTIVE_MAP" && <Map className="w-4 h-4" />}
                                    {widget.type === "CONTACT_INFO_SIDEBAR" && <PhoneCall className="w-4 h-4" />}
                                    {widget.type === "CONTACT_FORM" && <FileText className="w-4 h-4" />}
                                    {widget.type === "HERO_SLIDER" && <Images className="w-4 h-4" />}
                                    {widget.type === "FEATURED_NEWS" && <Newspaper className="w-4 h-4" />}
                                    {widget.type === "PUBLIC_SERVICES" && <Landmark className="w-4 h-4" />}
                                    {widget.type === "LEGAL_DOCUMENTS" && <FolderOpen className="w-4 h-4" />}
                                    {widget.type === "PHOTO_VIDEO_GALLERY" && <Film className="w-4 h-4" />}
                                    {widget.type === "FAQ_ACCORDION" && <HelpCircle className="w-4 h-4" />}
                                    {widget.type === "EXTERNAL_LINKS" && <ExternalLink className="w-4 h-4" />}
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] text-slate-400 font-extrabold uppercase leading-tight truncate">
                                      {widget.type}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                                      {widget.title[activeLang] || "Widget chưa đặt tên"}
                                    </span>
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWidget(row.rowId, col.id, widget.id);
                                  }}
                                  className="w-6 h-6 hover:bg-red-50 hover:text-[#b91c1c] text-slate-300 opacity-0 group-hover/widget:opacity-100 transition-opacity rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dropdown/Quick buttons to insert widget inside column */}
                      <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-850 flex flex-wrap gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "LEXICAL_RICH_TEXT")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Văn bản Lexical
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "STATISTICS_GRID")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Thống kê nhanh
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "LEADERSHIP_LIST")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Thẻ Cán bộ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "ORG_SECTIONS_DIRECTORY")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Cơ cấu tổ chức
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "COMMUNE_INTERACTIVE_MAP")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Bản đồ vector
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "CONTACT_INFO_SIDEBAR")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Lịch tiếp dân
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "CONTACT_FORM")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Form Góp ý
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "HERO_SLIDER")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Trình chiếu Banner
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "FEATURED_NEWS")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Tin nổi bật
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "PUBLIC_SERVICES")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Dịch vụ công
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "LEGAL_DOCUMENTS")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Văn bản pháp quy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "PHOTO_VIDEO_GALLERY")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Thư viện Ảnh/Video
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "FAQ_ACCORDION")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Hỏi đáp FAQ
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addWidget(row.rowId, col.id, "EXTERNAL_LINKS")}
                          className="h-6 px-1.5 text-[8.5px] font-black text-slate-500 hover:text-[#b91c1c] uppercase tracking-wide border border-dashed hover:border-[#b91c1c] rounded-md shrink-0"
                        >
                          + Liên kết website
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Selected Widget Customizer Properties */}
      <div className={`transition-all duration-500 ${isLexicalActive ? 'xl:col-span-8 order-1 xl:order-2 max-w-7xl' : 'xl:col-span-4 order-2'}`}>
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl sticky top-24">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 p-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-[#b91c1c] dark:text-[#fbc02d]" />
              <div>
                <CardTitle className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
                  Thuộc tính Widget
                </CardTitle>
                <p className="text-[10px] text-slate-400 font-medium">Thiết lập tham số cấu hình hiển thị khối</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {!currentWidget ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto animate-pulse" />
                <p className="text-[10px] font-extrabold uppercase tracking-widest">Chưa chọn khối nào</p>
                <p className="text-[9.5px] text-slate-400 leading-normal">Bấm chọn một khối Widget ở Canvas bên trái để tiến hành cấu hình chi tiết nội dung.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in text-xs">
                
                {/* Meta details */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-850">
                  <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center text-[#b91c1c] font-black text-xs shadow-inner">
                    {currentWidget.type[0]}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-black uppercase text-[#b91c1c] dark:text-[#fbc02d] tracking-widest">Loại thành phần</span>
                    <span className="text-xs font-black text-slate-800 dark:text-white mt-0.5">{currentWidget.type}</span>
                  </div>
                </div>

                {/* Title edit field */}
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                    Tiêu đề khối hiển thị ({activeLang.toUpperCase()})
                  </Label>
                  <Input
                    value={currentWidget.title[activeLang] || ""}
                    onChange={(e) => updateWidgetTitle(currentWidget.id, e.target.value)}
                    placeholder="Nhập tiêu đề khối..."
                    className="h-10 text-xs font-semibold rounded-lg dark:bg-slate-950"
                  />
                </div>

                {/* Specific Widget Editors */}
                {currentWidget.type === "LEXICAL_RICH_TEXT" && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest">
                        Nội dung Rich Text soạn thảo
                      </Label>
                      <span className="text-[10px] text-[#b91c1c] dark:text-[#fbc02d] font-bold animate-pulse">✨ Chế độ thiết kế toàn cảnh</span>
                    </div>
                    <div className="rounded-xl overflow-hidden min-h-[450px] border border-slate-200 dark:border-slate-800 shadow-inner bg-white dark:bg-slate-950">
                      <LexicalEditor
                        value={currentWidget.content?.[activeLang] || ""}
                        onChange={(lexicalJson) => updateWidgetContent(currentWidget.id, lexicalJson)}
                        placeholder="Bắt đầu viết nội dung trang của bạn ở đây..."
                        minHeight="420px"
                      />
                    </div>
                  </div>
                )}

                {currentWidget.type === "STATISTICS_GRID" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-emerald-50/20 border border-emerald-100/40">
                    <h5 className="font-extrabold text-[#15803d] uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dữ liệu tích hợp tự động
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Khối này sẽ tự động nạp các chỉ số thống kê từ các trường **Diện tích tự nhiên**, **Dân số hiện tại**, **Số thôn buôn** đã được cấu hình trong mục *Trang giới thiệu* và xuất ra dưới dạng lưới thẻ thiết kế sang trọng.
                    </p>
                  </div>
                )}

                {currentWidget.type === "LEADERSHIP_LIST" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-indigo-50/20 border border-indigo-100/40">
                    <h5 className="font-extrabold text-indigo-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dữ liệu tích hợp tự động
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Tự động tải danh sách cán bộ, chức danh, lịch tiếp dân và thông tin phòng ban làm việc được cập nhật tại tab **Trang giới thiệu sang Cán bộ lãnh đạo**.
                    </p>
                  </div>
                )}

                {currentWidget.type === "ORG_SECTIONS_DIRECTORY" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-[#b91c1c]/5 border border-[#b91c1c]/10">
                    <h5 className="font-extrabold text-[#b91c1c] uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dữ liệu tích hợp tự động
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Nạp sơ đồ bộ máy hành chính (Đảng ủy, HĐND, UBND, Đoàn thể...) được đồng bộ từ cấu hình danh sách tab **Trang giới thiệu**.
                    </p>
                  </div>
                )}

                {currentWidget.type === "COMMUNE_INTERACTIVE_MAP" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-orange-50/20 border border-orange-100/40">
                    <h5 className="font-extrabold text-orange-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Bản đồ tương tác vector
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Kích hoạt bản vẽ ranh giới vector tương tác của 8 phân khu thôn buôn xã Dang Kang. Người xem trên Portal có thể click chọn từng thôn để hiển thị thông số chi tiết.
                    </p>
                  </div>
                )}

                {currentWidget.type === "CONTACT_INFO_SIDEBAR" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-blue-50/20 border border-blue-100/40">
                    <h5 className="font-extrabold text-blue-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dữ liệu liên hệ đồng bộ
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Nhúng khối thông tin địa chỉ, email, hotline của trụ sở cơ cơ quan cùng lịch trực tiếp công dân của ban cán sự.
                    </p>
                  </div>
                )}

                {currentWidget.type === "CONTACT_FORM" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-slate-50 border border-slate-150">
                    <h5 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Biểu mẫu hòm thư góp ý
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Tự động tải biểu mẫu và hòm thư phản ánh ý kiến, kiến nghị trực tiếp từ công dân để gửi đến ban biên tập cơ quan.
                    </p>
                  </div>
                )}

                {currentWidget.type === "HERO_SLIDER" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-amber-50/20 border border-amber-100/40">
                    <h5 className="font-extrabold text-amber-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Dữ liệu Banners đồng bộ
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Tự động tải danh sách các Banners và Slogan chính được cấu hình trong hệ thống để hiển thị trình chiếu tự động (Slider) sang trọng trên trang.
                    </p>
                  </div>
                )}

                {currentWidget.type === "FEATURED_NEWS" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-blue-50/20 border border-blue-100/40">
                    <h5 className="font-extrabold text-blue-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tin tức nổi bật tự động nạp
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Hiển thị danh sách các bài viết mới nhất và nổi bật nhất từ các chuyên mục Tin tức, Thông báo, Xây dựng, Nông nghiệp với hiệu ứng thẻ sang trọng.
                    </p>
                  </div>
                )}

                {currentWidget.type === "PUBLIC_SERVICES" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-emerald-50/20 border border-emerald-100/40">
                    <h5 className="font-extrabold text-emerald-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Danh mục Dịch vụ công & Tra cứu
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Tích hợp nhanh các tiện ích nộp hồ sơ trực tuyến, tra cứu tiến độ giải quyết thủ tục một cửa và gửi phản ánh kiến nghị công dân.
                    </p>
                  </div>
                )}

                {currentWidget.type === "LEGAL_DOCUMENTS" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-purple-50/20 border border-purple-100/40">
                    <h5 className="font-extrabold text-purple-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hệ thống Văn bản chỉ đạo
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Nạp tự động danh sách các văn bản pháp quy, quyết định, chỉ đạo điều hành mới nhất của cơ quan quản lý nhà nước.
                    </p>
                  </div>
                )}

                {currentWidget.type === "PHOTO_VIDEO_GALLERY" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-rose-50/20 border border-rose-100/40">
                    <h5 className="font-extrabold text-rose-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Thư viện Truyền thông
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Hiển thị album ảnh hoạt động và các video clip tuyên truyền trực quan sinh động với chế độ xem phóng to (Lightbox).
                    </p>
                  </div>
                )}

                {currentWidget.type === "FAQ_ACCORDION" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-cyan-50/20 border border-cyan-100/40">
                    <h5 className="font-extrabold text-cyan-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hỏi đáp trực tuyến (FAQ)
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Nạp các câu hỏi thường gặp và giải đáp pháp luật từ cổng tương tác công dân dưới dạng danh sách mở rộng (Accordion).
                    </p>
                  </div>
                )}

                {currentWidget.type === "EXTERNAL_LINKS" && (
                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-850 p-3 rounded-xl bg-slate-50 border border-slate-150">
                    <h5 className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Liên kết ban ngành đối tác
                    </h5>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">
                      Hiển thị băng chuyền (Carousel) các logo và đường dẫn liên kết đến các cơ quan, bộ ban ngành và cổng dịch vụ công quốc gia.
                    </p>
                  </div>
                )}

              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
