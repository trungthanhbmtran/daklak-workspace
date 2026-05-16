"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/features/system-admin/organization/api";
import { hrmApi } from "@/features/hrm/api";
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
  CheckCircle,
  Type,
  Workflow,
  FileText,
  X,
  Code,
  Copy,
  Check,
  Images,
  Newspaper,
  Landmark,
  FolderOpen,
  HelpCircle,
  ExternalLink,
  Film,
  Database,
  Search,
  Building2,
  Users2,
  MapPin,
  MapIcon,
  FileSpreadsheet,
  Info,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  GripVertical,
  Briefcase,
  FileSearch,
  MessageSquare,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  PanelLeft,
  PanelRight,
  ChevronLeft
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  settings?: {
    backgroundColor?: string;
    backgroundImage?: string;
    paddingTop?: string;
    paddingBottom?: string;
    textColor?: string;
    fullWidth?: boolean;
    gap?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
  };
}

interface PageBuilderProps {
  layout: Row[];
  onChange: (layout: Row[]) => void;
  languages: any[];
}

export function PageBuilder({ layout, onChange, languages }: PageBuilderProps) {
  const [activeLang, setActiveLang] = useState<string>("vi");
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("customizer");
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ colId: string, index: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCsdl, setSelectedCsdl] = useState<string>("org");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const paddingMap: Record<string, string> = {
    'pt-0': 'pt-0', 'pt-4': 'pt-4', 'pt-8': 'pt-8', 'pt-12': 'pt-12', 'pt-16': 'pt-16', 'pt-20': 'pt-20',
    'pb-0': 'pb-0', 'pb-4': 'pb-4', 'pb-8': 'pb-8', 'pb-12': 'pb-12', 'pb-16': 'pb-16', 'pb-20': 'pb-20'
  };
  const roundedMap: Record<string, string> = {
    'rounded-none': 'rounded-none', 'rounded-xl': 'rounded-xl', 'rounded-2xl': 'rounded-2xl', 'rounded-3xl': 'rounded-3xl', 'rounded-full': 'rounded-full'
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Helper to find any widget by ID
  const findWidgetById = (id: string): Widget | null => {
    if (!id) return null;
    for (const row of layout) {
      for (const col of row.columns) {
        for (const widget of col.widgets) {
          if (widget.id === id) return widget;
        }
      }
    }
    return null;
  };

  // Helper to update widget data
  const updateWidgetData = (widgetId: string, newData: any) => {
    const newLayout = layout.map(row => ({
      ...row,
      columns: row.columns.map(col => ({
        ...col,
        widgets: col.widgets.map(w => {
          if (w.id === widgetId) {
            return {
              ...w,
              data: newData
            };
          }
          return w;
        })
      }))
    }));
    onChange(newLayout);
  };

  const toggleSelectUnit = (widgetId: string, unit: any) => {
    const w = findWidgetById(widgetId);
    if (!w) return;

    const currentIds = w.data?.selectedUnitIds || [];
    const currentUnits = w.data?.selectedUnits || [];

    const getDescendants = (u: any): any[] => {
      let list = [u];
      if (u.children && u.children.length > 0) {
        u.children.forEach((child: any) => {
          list = list.concat(getDescendants(child));
        });
      }
      return list;
    };

    const targetUnits = getDescendants(unit);
    const targetIds = targetUnits.map(u => u.id);
    const isSelecting = !currentIds.includes(unit.id);

    let newIds: number[];
    let newUnits: any[];

    if (isSelecting) {
      const idsToAdd = targetIds.filter(id => !currentIds.includes(id));
      newIds = [...currentIds, ...idsToAdd];

      const unitsToAdd = targetUnits
        .filter(u => !currentIds.includes(u.id))
        .map(u => ({
          id: u.id,
          title: u.name,
          code: u.code || "",
          typeName: u.typeName || "Cơ quan hành chính",
          desc: `Bộ phận trực thuộc phụ trách điều hành, quản lý lĩnh vực ${u.name} theo quy chế hoạt động của đơn vị.`,
          details: ["Cấp trưởng phụ trách chung", "Cấp phó theo dõi chuyên môn", "Cán bộ chuyên trách nghiệp vụ"]
        }));
      newUnits = [...currentUnits, ...unitsToAdd];
      toast.success(`Đã chọn ${unit.name} và ${idsToAdd.length - 1} đơn vị cấp dưới`);
    } else {
      newIds = currentIds.filter((id: number) => !targetIds.includes(id));
      newUnits = currentUnits.filter((u: any) => !targetIds.includes(u.id));
      toast.info(`Đã bỏ chọn ${unit.name} và các đơn vị cấp dưới`);
    }

    updateWidgetData(widgetId, {
      ...(w.data || {}),
      selectedUnitIds: newIds,
      selectedUnits: newUnits
    });
  };

  const OrgTreeItem = ({ node, isCustomizer, widgetId }: { node: any, isCustomizer: boolean, widgetId?: string }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];
    const isSelected = isCustomizer && widgetId && (findWidgetById(widgetId)?.data?.selectedUnitIds || []).includes(node.id);

    return (
      <div className="flex flex-col">
        <div
          draggable={!isCustomizer}
          onDragStart={(e) => {
            if (!isCustomizer) {
              e.dataTransfer.setData("text/plain", JSON.stringify({ type: "ORG_SECTIONS_DIRECTORY", item: node }));
            }
          }}
          className={`flex items-center gap-1.5 p-1.5 rounded-lg transition-all cursor-pointer group ${isSelected ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800" : "hover:bg-slate-50 dark:hover:bg-slate-850"
            }`}
          onClick={(e) => {
            if (isCustomizer && widgetId) {
              toggleSelectUnit(widgetId, node);
            } else if (hasChildren) {
              toggleNode(node.id);
            }
          }}
        >
          {hasChildren ? (
            <div
              onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
          ) : (
            <div className="w-5" />
          )}

          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isCustomizer && (
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? "bg-red-600 border-red-600 text-white" : "border-slate-300 dark:border-slate-700"
                }`}>
                {isSelected && <Check className="w-2.5 h-2.5" />}
              </div>
            )}
            {!isCustomizer && <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />}

            <div className="flex flex-col min-w-0 text-left">
              <span className={`text-[11px] font-bold truncate ${isSelected ? "text-red-900 dark:text-white" : "text-slate-700 dark:text-slate-200"}`}>
                {node.name}
              </span>
              {node.typeName && <span className="text-[9px] text-slate-400 font-medium">{node.typeName}</span>}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-slate-100 dark:border-slate-800 pl-2 mt-1 space-y-0.5">
            {node.children.map((child: any) => (
              <OrgTreeItem key={child.id} node={child} isCustomizer={isCustomizer} widgetId={widgetId} />
            ))}
          </div>
        )}
      </div>
    );
  };

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

  const addWidgetFromDrag = (rowId: string, colId: string, dragData: string, index?: number) => {
    try {
      const parsed = JSON.parse(dragData);
      const widgetType = parsed.type as Widget["type"];
      const item = parsed.item;
      const timestamp = Date.now();

      const defaultTitle: Record<string, string> = { vi: "", en: "" };
      let defaultContent: Record<string, string> = { vi: "", en: "" };
      let initialData: any = {};

      if (widgetType === "LEXICAL_RICH_TEXT") {
        defaultTitle.vi = "Khối nội dung văn bản";
        defaultTitle.en = "Rich Text block";
      } else if (widgetType === "STATISTICS_GRID") {
        defaultTitle.vi = "Số liệu thống kê nhanh";
        defaultTitle.en = "Demographics Stats";
      } else if (widgetType === "LEADERSHIP_LIST") {
        defaultTitle.vi = item ? `Cán bộ: ${item.lastname || ""} ${item.firstname || ""}`.trim() : "Danh sách cán bộ lãnh đạo";
        defaultTitle.en = "Key Leading Officers";
        if (item) {
          const fullName = `${item.lastname || ""} ${item.firstname || ""}`.trim() || "Cán bộ lãnh đạo";
          const jobTitleName = item.jobTitle?.name || item.jobTitleName || "Cán bộ phụ trách";
          const deptName = item.department?.name || item.departmentName || "UBND Xã";
          initialData = {
            selectedLeaderIds: [item.id],
            selectedLeaders: [{
              id: item.id,
              name: fullName,
              role: jobTitleName,
              responsibility: `Chịu trách nhiệm phụ trách chung và điều hành các hoạt động thuộc lĩnh vực phân công tại ${deptName}.`,
              schedule: ["Sáng Thứ 3 hàng tuần", "Sáng Thứ 5 hàng tuần"],
              contact: item.phone || item.email || "0262.385.1234",
              department: deptName
            }]
          };
        }
      } else if (widgetType === "ORG_SECTIONS_DIRECTORY") {
        defaultTitle.vi = item ? `Đơn vị: ${item.name}` : "Sơ đồ bộ máy tổ chức";
        defaultTitle.en = "Organizational Directory";
        if (item) {
          initialData = {
            selectedUnitIds: [item.id],
            selectedUnits: [{
              id: item.id,
              title: item.name,
              code: item.code || "",
              typeName: item.typeName || "Cơ quan hành chính",
              desc: `Bộ phận trực thuộc phụ trách điều hành, quản lý lĩnh vực ${item.name}.`,
              details: ["Cấp trưởng phụ trách chung", "Cấp phó theo dõi chuyên môn", "Cán bộ chuyên trách nghiệp vụ"]
            }]
          };
        }
      } else if (widgetType === "FEATURED_NEWS") {
        defaultTitle.vi = item ? `Tin tức: ${item.title}` : "Tin tức nổi bật mới nhất";
        defaultTitle.en = "Featured Latest News";
        if (item) {
          initialData = { selectedCategory: item.title };
        }
      } else {
        defaultTitle.vi = "Widget mới";
        defaultTitle.en = "New Widget";
      }

      const newWidget: Widget = {
        id: `widget-${timestamp}`,
        type: widgetType,
        title: defaultTitle,
        content: defaultContent,
        data: initialData
      };

      const newLayout = layout.map(row => {
        if (row.rowId === rowId) {
          return {
            ...row,
            columns: row.columns.map(col => {
              if (col.id === colId) {
                const newWidgets = [...col.widgets];
                if (typeof index === 'number') {
                  newWidgets.splice(index, 0, newWidget);
                } else {
                  newWidgets.push(newWidget);
                }
                return { ...col, widgets: newWidgets };
              }
              return col;
            })
          };
        }
        return row;
      });

      onChange(newLayout);
      setSelectedWidgetId(newWidget.id);
      setActiveTab("customizer");
      toast.success(`Đã chèn thành công ${defaultTitle.vi} vào trang!`);
    } catch (err) {
      console.error("Lỗi khi parse dữ liệu kéo thả:", err);
    }
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
              title: { ...w.title, [activeLang]: value }
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
              content: { ...(w.content || {}), [activeLang]: lexicalJson }
            };
          }
          return w;
        })
      }))
    }));
    onChange(newLayout);
  };

  const updateRowSettings = (rowId: string, newSettings: any) => {
    const newLayout = layout.map(row => {
      if (row.rowId === rowId) {
        return {
          ...row,
          settings: { ...(row.settings || {}), ...newSettings }
        };
      }
      return row;
    });
    onChange(newLayout);
  };

  const findRowById = (id: string): Row | null => {
    if (!id) return null;
    return layout.find(r => r.rowId === id) || null;
  };

  const getSelectedWidget = (): Widget | null => {
    return findWidgetById(selectedWidgetId || "");
  };

  const currentWidget = getSelectedWidget();

  const { data: orgTree } = useQuery({
    queryKey: ["organizations-tree"],
    queryFn: () => organizationApi.getTree(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: hrmEmployees } = useQuery({
    queryKey: ["hrm-employees"],
    queryFn: () => hrmApi.list({ pageSize: 1000 }),
    staleTime: 5 * 60 * 1000,
  });

  const flattenOrgTree = (nodes: any[]): any[] => {
    let result: any[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenOrgTree(node.children));
      }
    });
    return result;
  };

  const allOrgUnits = React.useMemo(() => 
    orgTree ? flattenOrgTree(orgTree as any) : [], 
    [orgTree]
  );
  
  const allEmployees = React.useMemo(() => 
    hrmEmployees?.data || [], 
    [hrmEmployees]
  );

  const toggleSelectLeader = (widgetId: string, emp: any) => {
    const w = findWidgetById(widgetId);
    if (!w) return;

    const currentIds = w.data?.selectedLeaderIds || [];
    let newIds: number[];
    let newLeaders: any[];

    if (currentIds.includes(emp.id)) {
      newIds = currentIds.filter((id: number) => id !== emp.id);
      newLeaders = (w.data?.selectedLeaders || []).filter((l: any) => l.id !== emp.id);
    } else {
      newIds = [...currentIds, emp.id];
      const fullName = `${emp.lastname || ""} ${emp.firstname || ""}`.trim() || "Cán bộ lãnh đạo";
      const jobTitleName = emp.jobTitle?.name || emp.jobTitleName || "Cán bộ phụ trách";
      const deptName = emp.department?.name || emp.departmentName || "UBND Xã";

      const newLeaderObj = {
        id: emp.id,
        name: fullName,
        role: jobTitleName,
        responsibility: `Chịu trách nhiệm phụ trách chung và điều hành các hoạt động thuộc lĩnh vực phân công tại ${deptName}.`,
        schedule: ["Sáng Thứ 3 hàng tuần", "Sáng Thứ 5 hàng tuần"],
        contact: emp.phone || emp.email || "0262.385.1234",
        department: deptName
      };
      newLeaders = [...(w.data?.selectedLeaders || []), newLeaderObj];
    }

    updateWidgetData(widgetId, {
      ...(w.data || {}),
      selectedLeaderIds: newIds,
      selectedLeaders: newLeaders
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950 animate-fade-in shadow-xl">

      <div className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setShowLeftPanel(!showLeftPanel)} className={`w-10 h-10 rounded-xl transition-all ${showLeftPanel ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"}`}>
            <PanelLeft className="w-5 h-5" />
          </Button>
          <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-1" />
          <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50">
            {languages.map((lang) => (
              <button key={lang.code} onClick={() => setActiveLang(lang.code)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeLang === lang.code ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                {lang.code}
              </button>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(!showRightPanel)} className={`w-10 h-10 rounded-xl transition-all ${showRightPanel ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-400 hover:bg-slate-50"}`}>
          <PanelRight className="w-5 h-5" />
        </Button>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {showLeftPanel && (
          <ResizablePanel id="toolbox" defaultSize={22} minSize={18} maxSize={30} className="bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Thư viện Widgets</h3>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: "org", label: "Tổ chức", icon: Building2, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30" },
                    { id: "hrm", label: "Nhân sự", icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
                    { id: "news", label: "Tin tức", icon: Newspaper, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                    { id: "service", label: "Dịch vụ", icon: Landmark, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                    { id: "legal", label: "Văn bản", icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
                    { id: "extra", label: "Mở rộng", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCsdl(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${selectedCsdl === cat.id
                        ? `border-indigo-500 bg-white shadow-md ring-4 ring-indigo-50`
                        : "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-200 hover:bg-white"
                        }`}
                    >
                      <cat.icon className={`w-6 h-6 ${selectedCsdl === cat.id ? cat.color : "text-slate-400"}`} />
                      <span className={`text-[9px] font-black uppercase tracking-tight ${selectedCsdl === cat.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-white/50">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm Widget..."
                      className="h-7 text-[10px] font-bold bg-transparent border-none focus-visible:ring-0 p-0 w-full placeholder:text-slate-300 uppercase tracking-widest"
                    />
                  </div>
                  <div className="p-3 max-h-[450px] overflow-y-auto custom-scrollbar space-y-2">
                    {selectedCsdl === "org" && (
                      <div className="space-y-2">
                        {(searchQuery.trim() !== "" ? allOrgUnits.filter((u: any) => u.name.toLowerCase().includes(searchQuery.toLowerCase())) : allOrgUnits.slice(0, 15)).map((unit: any) => (
                          <div
                            key={unit.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "ORG_SECTIONS_DIRECTORY", title: unit.name, item: unit }))}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-3 transition-all"
                          >
                            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{unit.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCsdl === "news" && (
                      <div className="space-y-2.5">
                        {[
                          { type: "FEATURED_NEWS", title: "Tin tức nổi bật", icon: Newspaper, color: "text-blue-600", desc: "Hiển thị tin mới nhất theo grid" },
                          { type: "PHOTO_VIDEO_GALLERY", title: "Thư viện Đa phương tiện", icon: Film, color: "text-rose-600", desc: "Carousel ảnh và video clip" },
                          { type: "HERO_SLIDER", title: "Banner Trình chiếu", icon: Images, color: "text-amber-600", desc: "Ảnh bìa lớn đầu trang" }
                        ].map((w) => (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: w.type, title: w.title }))}
                            className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-4"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 ${w.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                              <w.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{w.title}</span>
                              <span className="text-[8px] font-bold text-slate-400 truncate uppercase tracking-widest">{w.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCsdl === "hrm" && (
                      <div className="space-y-2.5">
                        <div
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEADERSHIP_LIST", title: "Danh sách lãnh đạo" }))}
                          className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-950 text-indigo-600 flex items-center justify-center shrink-0">
                            <Users2 className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Cán bộ lãnh đạo</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Danh sách ban chỉ đạo</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedCsdl === "service" && (
                      <div className="space-y-2.5">
                        {[
                          { type: "PUBLIC_SERVICES", title: "Dịch vụ hành chính", icon: Landmark, color: "text-emerald-600" },
                          { type: "FAQ_ACCORDION", title: "Trung tâm giải đáp", icon: HelpCircle, color: "text-amber-600" },
                          { type: "CONTACT_FORM", title: "Gửi ý kiến phản hồi", icon: Mail, color: "text-blue-600" }
                        ].map((w) => (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: w.type, title: w.title }))}
                            className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-4"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 ${w.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                              <w.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{w.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCsdl === "legal" && (
                      <div className="space-y-2.5">
                        <div
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEGAL_DOCUMENTS", title: "Cơ sở dữ liệu văn bản" }))}
                          className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-4"
                        >
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-slate-950 text-purple-600 flex items-center justify-center shrink-0">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Văn bản & Nghị quyết</span>
                        </div>
                      </div>
                    )}
                    {selectedCsdl === "extra" && (
                      <div className="space-y-2.5">
                        {[
                          { type: "LEXICAL_RICH_TEXT", title: "Văn bản tùy biến", icon: Type, color: "text-slate-600" },
                          { type: "COMMUNE_INTERACTIVE_MAP", title: "Bản đồ hành chính", icon: MapIcon, color: "text-red-600" },
                          { type: "STATISTICS_GRID", title: "Biểu đồ thống kê", icon: FileSpreadsheet, color: "text-sky-600" },
                          { type: "CONTACT_INFO_SIDEBAR", title: "Thông tin liên hệ", icon: Info, color: "text-blue-600" },
                          { type: "EXTERNAL_LINKS", title: "Liên kết hữu ích", icon: ExternalLink, color: "text-amber-600" }
                        ].map((w) => (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: w.type, title: w.title }))}
                            className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-4"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 ${w.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                              <w.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{w.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 px-1 mb-1">
                  <Layout className="w-4 h-4 text-slate-400" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hệ thống Layout</h4>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => addRow("12")} className="h-11 justify-start text-[10px] font-black uppercase tracking-wider border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 gap-3 px-4 rounded-2xl transition-all shadow-sm"><Columns className="w-4 h-4 text-indigo-500" /> Full Width (12)</Button>
                  <Button variant="outline" size="sm" onClick={() => addRow("6-6")} className="h-11 justify-start text-[10px] font-black uppercase tracking-wider border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 gap-3 px-4 rounded-2xl transition-all shadow-sm"><Grid3X3 className="w-4 h-4 text-emerald-500" /> Split Half (6-6)</Button>
                  <Button variant="outline" size="sm" onClick={() => addRow("8-4")} className="h-11 justify-start text-[10px] font-black uppercase tracking-wider border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 gap-3 px-4 rounded-2xl transition-all shadow-sm"><Layers className="w-4 h-4 text-blue-500" /> Sidebar (8-4)</Button>
                  <Button variant="outline" size="sm" onClick={() => addRow("4-4-4")} className="h-11 justify-start text-[10px] font-black uppercase tracking-wider border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/30 gap-3 px-4 rounded-2xl transition-all shadow-sm"><Grid3X3 className="w-4 h-4 text-purple-500" /> Triple Grid (4-4-4)</Button>
                </div>
              </div>
            </div>
          </ResizablePanel>
        )}
        {showLeftPanel && <ResizableHandle withHandle />}

        <ResizablePanel id="canvas" defaultSize={56 + (!showLeftPanel ? 22 : 0) + (!showRightPanel ? 22 : 0)} className="bg-[#f8fafc] dark:bg-[#020617] relative flex flex-col">
          {/* CANVAS TOOLBAR */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-[24px] border border-slate-200/60 shadow-2xl shadow-indigo-100/50 dark:shadow-none ring-1 ring-slate-900/5">
            <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl mr-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("desktop")}
                className={`w-9 h-9 rounded-xl transition-all ${viewport === "desktop" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400 hover:bg-white/50"}`}
              >
                <Monitor className="w-4.5 h-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("tablet")}
                className={`w-9 h-9 rounded-xl transition-all ${viewport === "tablet" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400 hover:bg-white/50"}`}
              >
                <Tablet className="w-4.5 h-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("mobile")}
                className={`w-9 h-9 rounded-xl transition-all ${viewport === "mobile" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400 hover:bg-white/50"}`}
              >
                <Smartphone className="w-4.5 h-4.5" />
              </Button>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
          </div>

          <div className="w-full h-full overflow-auto custom-scrollbar pt-24 pb-40 px-10">
            <div
              className={`mx-auto transition-all duration-500 ease-in-out ${viewport === "desktop" ? "max-w-full" : viewport === "tablet" ? "max-w-[768px]" : "max-w-[375px]"
                } min-h-[800px] bg-white dark:bg-slate-900 shadow-[0_0_100px_rgba(0,0,0,0.03)] dark:shadow-none rounded-[48px] border border-slate-100 dark:border-slate-800 p-12 relative`}
            >
              <div className="space-y-12">
                {layout.map((row, rIdx) => (
                  <div
                    key={row.rowId}
                    onClick={(e) => { e.stopPropagation(); setSelectedRowId(row.rowId); setSelectedWidgetId(null); }}
                    className={`group relative border-2 border-dashed transition-all duration-300 rounded-[32px] p-8 ${selectedRowId === row.rowId
                      ? "border-indigo-500 bg-indigo-50/20 shadow-lg ring-4 ring-indigo-50/50"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/30"
                      }`}
                  >
                    {/* Row Actions */}
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
                      <Button variant="outline" size="icon" onClick={() => moveRow(rIdx, "up")} className="w-9 h-9 rounded-xl border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"><MoveUp className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => moveRow(rIdx, "down")} className="w-9 h-9 rounded-xl border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm"><MoveDown className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => deleteRow(row.rowId)} className="w-9 h-9 rounded-xl border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm"><Trash2 className="w-4 h-4" /></Button>
                    </div>

                    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8`}>
                      {row.columns.map((col) => (
                        <div
                          key={col.id}
                          onDragOver={(e) => { e.preventDefault(); setDragOverColId(col.id); }}
                          onDragLeave={() => setDragOverColId(null)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOverColId(null);
                            const dragData = e.dataTransfer.getData("text/plain");
                            if (dragData) addWidgetFromDrag(row.rowId, col.id, dragData);
                          }}
                          className={`${col.colSpan} border-2 border-dashed transition-all duration-300 rounded-3xl min-h-[160px] relative p-1 ${dragOverColId === col.id ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]" : "border-slate-100 dark:border-slate-800 bg-slate-50/10"
                            }`}
                        >
                          <div className="flex flex-col gap-4 p-4 h-full">
                            {col.widgets.map((widget, wIdx) => (
                              <div
                                key={widget.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedWidgetId(widget.id); setSelectedRowId(null); }}
                                className={`group/widget relative p-6 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${selectedWidgetId === widget.id
                                  ? "border-indigo-500 bg-white shadow-xl ring-2 ring-indigo-50"
                                  : "border-slate-100 bg-white dark:bg-slate-900 hover:border-indigo-200 hover:shadow-md"
                                  }`}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                      <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{widget.type.replace("_", " ")}</span>
                                      <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight truncate max-w-[200px]">{widget.title[activeLang] || "Widget chưa đặt tên"}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); deleteWidget(row.rowId, col.id, widget.id); }}
                                    className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/widget:opacity-100 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                {widget.type === "LEXICAL_RICH_TEXT" && (
                                  <div className="mt-2 text-[10px] text-slate-400 line-clamp-3 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    {widget.content?.[activeLang] ? "Nội dung văn bản đã được thiết lập..." : "Chưa có nội dung. Nhấp để chỉnh sửa."}
                                  </div>
                                )}
                              </div>
                            ))}

                            {col.widgets.length === 0 && (
                              <div className="flex-1 flex flex-col items-center justify-center py-10 opacity-30 select-none">
                                <Plus className="w-8 h-8 mb-2 text-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Thả Widget vào đây</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addRow("12")}
                  className="w-full py-12 rounded-[40px] border-2 border-dashed border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/20 group transition-all duration-500 flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-100 transition-all flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-400 group-hover:text-indigo-600 uppercase tracking-[0.2em] transition-colors">Thêm hàng mới</span>
                </button>
              </div>
            </div>
          </div>
        </ResizablePanel>

        {showRightPanel && <ResizableHandle withHandle />}
        {showRightPanel && (
          <ResizablePanel id="customizer" defaultSize={22} minSize={18} maxSize={30} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-l border-slate-200/50 shadow-2xl flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {(selectedWidgetId || selectedRowId) ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1.5 h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl mb-8 border border-slate-200/50">
                    <TabsTrigger value="customizer" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Customizer</TabsTrigger>
                    <TabsTrigger value="design" className="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Design</TabsTrigger>
                  </TabsList>

                  <TabsContent value="customizer" className="space-y-8 mt-0">
                    {currentWidget && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">Hiệu chỉnh Widget</span>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{currentWidget.type.replace("_", " ")}</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu đề hiển thị ({activeLang})</Label>
                            <Input
                              value={currentWidget.title[activeLang] || ""}
                              onChange={(e) => updateWidgetTitle(currentWidget.id, e.target.value)}
                              className="h-12 px-5 rounded-2xl border-slate-100 text-[13px] font-bold bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                              placeholder="Nhập tiêu đề cho Widget..."
                            />
                          </div>

                          {currentWidget.type === "LEXICAL_RICH_TEXT" && (
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung văn bản</Label>
                              <div className="p-1 rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden min-h-[400px]">
                                <LexicalEditor
                                  initialValue={currentWidget.content?.[activeLang]}
                                  onChange={(val) => updateWidgetContent(currentWidget.id, val)}
                                  placeholder="Bắt đầu nhập nội dung tại đây..."
                                />
                              </div>
                            </div>
                          )}

                          {(currentWidget.type === "ORG_SECTIONS_DIRECTORY" || currentWidget.type === "LEADERSHIP_LIST") && (
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Database className="w-3.5 h-3.5 text-indigo-500" />
                                Chọn dữ liệu nguồn
                              </Label>
                              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {(currentWidget.type === "ORG_SECTIONS_DIRECTORY" ? (orgTree as any) || [] : allEmployees).map((item: any) => (
                                  currentWidget.type === "ORG_SECTIONS_DIRECTORY" ? (
                                    <OrgTreeItem key={item.id} node={item} isCustomizer={true} widgetId={currentWidget.id} />
                                  ) : (
                                    <div
                                      key={item.id}
                                      onClick={() => toggleSelectLeader(currentWidget.id, item)}
                                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer mb-2 ${
                                        (currentWidget.data?.selectedLeaderIds || []).includes(item.id)
                                          ? "bg-indigo-50 border-indigo-200"
                                          : "bg-white border-slate-100 hover:border-indigo-100"
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                        (currentWidget.data?.selectedLeaderIds || []).includes(item.id)
                                          ? "bg-indigo-600 border-indigo-600 text-white"
                                          : "border-slate-300"
                                      }`}>
                                        {(currentWidget.data?.selectedLeaderIds || []).includes(item.id) && <Check className="w-3 h-3" />}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-bold text-slate-700 truncate">{item.lastname} {item.firstname}</span>
                                        <span className="text-[9px] text-slate-400 font-medium">{item.jobTitle?.name || "Cán bộ"}</span>
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="design" className="space-y-8 mt-0">
                    {selectedRowId && (
                      <div className="space-y-8 animate-fade-in">
                        <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                            <Layout className="w-6 h-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">Tùy chỉnh Hàng</span>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Cấu hình hiển thị Layout</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4 p-5 rounded-[28px] bg-slate-50/50 dark:bg-slate-950 border border-slate-100 shadow-sm">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              Màu sắc & Chủ đề
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Nền hàng</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={findRowById(selectedRowId)?.settings?.backgroundColor || "#ffffff"}
                                    onChange={(e) => updateRowSettings(selectedRowId, { backgroundColor: e.target.value })}
                                    className="h-10 w-full p-1 rounded-xl border-slate-100 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Màu chữ</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="color"
                                    value={findRowById(selectedRowId)?.settings?.textColor || "#000000"}
                                    onChange={(e) => updateRowSettings(selectedRowId, { textColor: e.target.value })}
                                    className="h-10 w-full p-1 rounded-xl border-slate-100 cursor-pointer"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2 col-span-2">
                                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Ảnh nền hàng (URL)</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    value={findRowById(selectedRowId)?.settings?.backgroundImage || ""}
                                    onChange={(e) => updateRowSettings(selectedRowId, { backgroundImage: e.target.value })}
                                    className="h-10 w-full px-4 rounded-xl border-slate-100 text-[11px] font-bold bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 p-5 rounded-[28px] bg-slate-50/50 dark:bg-slate-950 border border-slate-100 shadow-sm">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                              <Columns className="w-3.5 h-3.5 text-indigo-500" />
                              Không gian hiển thị
                            </Label>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Padding Trên</Label>
                                  <Select value={findRowById(selectedRowId)?.settings?.paddingTop || "pt-8"} onValueChange={(val) => updateRowSettings(selectedRowId, { paddingTop: val })}>
                                    <SelectTrigger className="h-10 text-xs font-bold rounded-xl bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      <SelectItem value="pt-0">Không đệm</SelectItem>
                                      <SelectItem value="pt-4">Nhỏ (16px)</SelectItem>
                                      <SelectItem value="pt-8">Vừa (32px)</SelectItem>
                                      <SelectItem value="pt-12">Lớn (48px)</SelectItem>
                                      <SelectItem value="pt-20">X-Large (80px)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Padding Dưới</Label>
                                  <Select value={findRowById(selectedRowId)?.settings?.paddingBottom || "pb-8"} onValueChange={(val) => updateRowSettings(selectedRowId, { paddingBottom: val })}>
                                    <SelectTrigger className="h-10 text-xs font-bold rounded-xl bg-white"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                      <SelectItem value="pb-0">Không đệm</SelectItem>
                                      <SelectItem value="pb-4">Nhỏ (16px)</SelectItem>
                                      <SelectItem value="pb-8">Vừa (32px)</SelectItem>
                                      <SelectItem value="pb-12">Lớn (48px)</SelectItem>
                                      <SelectItem value="pb-20">X-Large (80px)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Độ bo góc (Border Radius)</Label>
                                <Select value={findRowById(selectedRowId)?.settings?.borderRadius || "rounded-2xl"} onValueChange={(val) => updateRowSettings(selectedRowId, { borderRadius: val })}>
                                  <SelectTrigger className="h-10 text-xs font-bold rounded-xl bg-white"><SelectValue /></SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    <SelectItem value="rounded-none">Góc vuông (0px)</SelectItem>
                                    <SelectItem value="rounded-xl">Hơi bo (12px)</SelectItem>
                                    <SelectItem value="rounded-2xl">Bo vừa (16px)</SelectItem>
                                    <SelectItem value="rounded-3xl">Bo mạnh (24px)</SelectItem>
                                    <SelectItem value="rounded-[40px]">Siêu bo (40px)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Kịch khung (Full Width)</span>
                                  <span className="text-[8px] font-bold text-slate-400">Cho phép hàng tràn viền màn hình</span>
                                </div>
                                <button
                                  onClick={() => updateRowSettings(selectedRowId, { fullWidth: !findRowById(selectedRowId)?.settings?.fullWidth })}
                                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${findRowById(selectedRowId)?.settings?.fullWidth ? "bg-indigo-600" : "bg-slate-200"}`}
                                >
                                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-all ${findRowById(selectedRowId)?.settings?.fullWidth ? "translate-x-6" : "translate-x-1"}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 grayscale select-none">
                  <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-6">
                    <Settings2 className="w-10 h-10 text-slate-400 animate-[spin_10s_linear_infinite]" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1">Chế độ nhàn rỗi</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest">Chọn Hàng hoặc Widget để cấu hình</p>
                </div>
              )}
            </div>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
