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

          {!isCustomizer && (
            <span className="text-[9px] font-black uppercase text-[#b91c1c] bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              Kéo
            </span>
          )}
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

  const flattenOrgNodes = (nodes: any[] = []): any[] => {
    let list: any[] = [];
    nodes.forEach(node => {
      list.push(node);
      if (node.children && node.children.length > 0) {
        list = list.concat(flattenOrgNodes(node.children));
      }
    });
    return list;
  };

  const allOrgUnits = flattenOrgNodes(orgTree || []);

  const { data: hrmEmployeesRes } = useQuery({
    queryKey: ["hrm-employees-list"],
    queryFn: () => hrmApi.list({ pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const allEmployees = hrmEmployeesRes?.data || [];

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
    <div className="flex flex-col h-[calc(100vh-140px)] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 animate-fade-in shadow-2xl">

      {/* BUILDER TOOLBAR */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className={`w-9 h-9 rounded-lg transition-colors ${showLeftPanel ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50" : "text-slate-400"}`}
          >
            <PanelLeft className="w-4.5 h-4.5" />
          </Button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeLang === lang.code ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {lang.code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <Button variant="ghost" size="icon" onClick={() => setViewport("desktop")} className={`w-8 h-8 rounded-lg transition-all ${viewport === "desktop" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400"}`}><Monitor className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setViewport("tablet")} className={`w-8 h-8 rounded-lg transition-all ${viewport === "tablet" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400"}`}><Tablet className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setViewport("mobile")} className={`w-8 h-8 rounded-lg transition-all ${viewport === "mobile" ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-400"}`}><Smartphone className="w-4 h-4" /></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowRightPanel(!showRightPanel)}
            className={`w-9 h-9 rounded-lg transition-colors ${showRightPanel ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50" : "text-slate-400"}`}
          >
            <PanelRight className="w-4.5 h-4.5" />
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">

        {/* LEFT PANEL: Toolbox */}
        {showLeftPanel && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-white dark:bg-slate-900 overflow-y-auto">
              <div className="p-4 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4.5 h-4.5 text-indigo-600" />
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Kho CSDL Widgets</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "org", label: "Tổ chức", icon: Building2, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
                    { id: "hrm", label: "Cán bộ", icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
                    { id: "news", label: "Tin tức", icon: Newspaper, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
                    { id: "service", label: "Dịch vụ", icon: Landmark, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
                    { id: "legal", label: "Văn bản", icon: FolderOpen, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30" },
                    { id: "extra", label: "Chức năng", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCsdl(cat.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${selectedCsdl === cat.id
                        ? `border-indigo-500 ring-2 ring-indigo-500/10 ${cat.bg}`
                        : "border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                        }`}
                    >
                      <cat.icon className={`w-5 h-5 ${selectedCsdl === cat.id ? cat.color : "text-slate-400"}`} />
                      <span className={`text-[9px] font-black uppercase tracking-tight ${selectedCsdl === cat.id ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>

                <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-slate-50/30 dark:bg-slate-950/20 rounded-xl">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
                    <Search className="w-3 h-3 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="h-6 text-[9px] font-semibold bg-transparent border-none focus-visible:ring-0 p-0 w-full"
                    />
                  </div>
                  <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {selectedCsdl === "org" && (
                      <div className="space-y-1">
                        {(searchQuery.trim() !== "" ? allOrgUnits.filter((u: any) => u.name.toLowerCase().includes(searchQuery.toLowerCase())) : allOrgUnits.slice(0, 20)).map((unit: any) => (
                          <div
                            key={unit.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "ORG_SECTIONS_DIRECTORY", title: unit.name, item: unit }))}
                            className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 cursor-grab active:cursor-grabbing flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{unit.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCsdl === "news" && (
                      <div className="space-y-2">
                        {[
                          { type: "FEATURED_NEWS", title: "Tin tức nổi bật", icon: Newspaper, color: "text-blue-600" },
                          { type: "PHOTO_VIDEO_GALLERY", title: "Thư viện Ảnh & Clip", icon: Film, color: "text-rose-600" },
                          { type: "HERO_SLIDER", title: "Banner Slider", icon: Images, color: "text-amber-600" }
                        ].map((w) => (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: w.type, title: w.title }))}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-3"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 ${w.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                              <w.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{w.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCsdl === "hrm" && (
                      <div className="space-y-2">
                        <div
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEADERSHIP_LIST", title: "Danh sách lãnh đạo" }))}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 text-indigo-600 flex items-center justify-center shrink-0">
                            <Users2 className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Cán bộ lãnh đạo</span>
                        </div>
                      </div>
                    )}
                    {selectedCsdl === "service" && (
                      <div className="space-y-2">
                        {[
                          { type: "PUBLIC_SERVICES", title: "Dịch vụ công", icon: Landmark, color: "text-emerald-600" },
                          { type: "FAQ_ACCORDION", title: "Hỏi đáp FAQ", icon: HelpCircle, color: "text-amber-600" },
                          { type: "CONTACT_FORM", title: "Form liên hệ", icon: Mail, color: "text-blue-600" }
                        ].map((w) => (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: w.type, title: w.title }))}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-3"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 ${w.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                              <w.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{w.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedCsdl === "legal" && (
                      <div className="space-y-2">
                        <div
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEGAL_DOCUMENTS", title: "Văn bản pháp quy" }))}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 text-purple-600 flex items-center justify-center shrink-0">
                            <FolderOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Văn bản & Nghị quyết</span>
                        </div>
                      </div>
                    )}
                    {selectedCsdl === "extra" && (
                      <div className="space-y-2">
                        {[
                          { type: "LEXICAL_RICH_TEXT", title: "Nội dung văn bản", icon: Type, color: "text-slate-600" },
                          { type: "COMMUNE_INTERACTIVE_MAP", title: "Bản đồ tương tác", icon: MapIcon, color: "text-red-600" },
                          { type: "STATISTICS_GRID", title: "Số liệu thống kê", icon: FileSpreadsheet, color: "text-sky-600" },
                          { type: "CONTACT_INFO_SIDEBAR", title: "Thông tin liên hệ", icon: Info, color: "text-blue-600" },
                          { type: "EXTERNAL_LINKS", title: "Liên kết ngoài", icon: ExternalLink, color: "text-amber-600" }
                        ].map((w) => (
                          <div
                            key={w.type}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: w.type, title: w.title }))}
                            className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 group cursor-grab active:cursor-grabbing transition-all flex items-center gap-3"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-950 ${w.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                              <w.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{w.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cấu trúc Layout</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" onClick={() => addRow("12")} className="h-8 justify-start text-[10px] font-bold border-slate-200 hover:border-indigo-500 gap-2"><Columns className="w-3.5 h-3.5" /> 100%</Button>
                    <Button variant="outline" size="sm" onClick={() => addRow("6-6")} className="h-8 justify-start text-[10px] font-bold border-slate-200 hover:border-indigo-500 gap-2"><Grid3X3 className="w-3.5 h-3.5" /> 50-50</Button>
                    <Button variant="outline" size="sm" onClick={() => addRow("8-4")} className="h-8 justify-start text-[10px] font-bold border-slate-200 hover:border-indigo-500 gap-2"><Layers className="w-3.5 h-3.5" /> 8-4</Button>
                    <Button variant="outline" size="sm" onClick={() => addRow("4-4-4")} className="h-8 justify-start text-[10px] font-bold border-slate-200 hover:border-indigo-500 gap-2"><Grid3X3 className="w-3.5 h-3.5" /> 4-4-4</Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}

        {/* CENTER PANEL: Canvas */}
        <ResizablePanel defaultSize={60} className="bg-slate-100 dark:bg-[#0f172a] relative overflow-hidden flex flex-col items-stretch">
          <div className="w-full h-full overflow-auto custom-scrollbar transition-all duration-500 p-8">
            <div className={`mx-auto space-y-8 ${viewport === "tablet" ? "max-w-[768px]" : viewport === "mobile" ? "max-w-[420px]" : "max-w-7xl"
              } transition-all duration-500`}>
              {viewport !== "desktop" && (
                <div className="w-full bg-slate-800 dark:bg-slate-950 rounded-t-3xl p-4 flex items-center justify-center border-b border-slate-700">
                  <div className="w-16 h-1 bg-slate-600 rounded-full" />
                </div>
              )}
              <div className={`w-full ${viewport !== "desktop" ? "bg-white dark:bg-slate-900 shadow-2xl rounded-b-3xl border-x-8 border-b-8 border-slate-800 dark:border-slate-950 p-6 min-h-[800px]" : ""}`}>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Vùng thiết kế nội dung</span>
                  </div>
                  {layout.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black text-slate-400 hover:text-red-600 uppercase gap-1" onClick={() => { if (confirm("Xóa toàn bộ layout?")) onChange([]); }}>
                      <Trash2 className="w-3 h-3" /> Xóa tất cả
                    </Button>
                  )}
                </div>

                {layout.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center justify-center gap-3">
                    <Layout className="w-10 h-10 text-slate-300" />
                    <p className="text-xs text-slate-400 font-extrabold uppercase tracking-wide">Trang trống • Hãy thêm hàng để bắt đầu</p>
                  </div>
                ) : (
                  layout.map((row, rIdx) => (
                    <div
                      key={row.rowId}
                      style={{
                        backgroundColor: row.settings?.backgroundColor,
                        backgroundImage: row.settings?.backgroundImage ? `url(${row.settings.backgroundImage})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: row.settings?.textColor,
                      }}
                      className={`border transition-all relative group space-y-4 p-4 ${selectedRowId === row.rowId ? "ring-2 ring-amber-500 border-amber-500 shadow-lg" : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"} ${paddingMap[row.settings?.paddingTop] || 'pt-8'} ${paddingMap[row.settings?.paddingBottom] || 'pb-8'} ${roundedMap[row.settings?.borderRadius] || 'rounded-2xl'} ${row.settings?.fullWidth ? "w-full" : ""}`}
                    >
                      <div className="flex items-center justify-between border-b dark:border-slate-800/60 pb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 font-black uppercase px-2 py-0.5 rounded tracking-wider">Hàng {rIdx + 1}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedRowId(row.rowId); setSelectedWidgetId(null); setActiveTab("design"); }} className={`w-7 h-7 rounded-lg ${selectedRowId === row.rowId ? "bg-amber-100 text-amber-600" : "text-slate-400"}`}><Settings2 className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" disabled={rIdx === 0} onClick={() => moveRow(rIdx, "up")} className="w-7 h-7 text-slate-400"><MoveUp className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" disabled={rIdx === layout.length - 1} onClick={() => moveRow(rIdx, "down")} className="w-7 h-7 text-slate-400"><MoveDown className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteRow(row.rowId)} className="w-7 h-7 text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {row.columns.map((col) => (
                          <div
                            key={col.id}
                            onDragOver={(e) => { e.preventDefault(); setDragOverColId(col.id); }}
                            onDragLeave={() => setDragOverColId(null)}
                            onDrop={(e) => { e.preventDefault(); setDragOverColId(null); const dragData = e.dataTransfer.getData("text/plain"); if (dragData) addWidgetFromDrag(row.rowId, col.id, dragData); }}
                            className={`${col.colSpan} border-2 border-dashed ${dragOverColId === col.id ? "border-indigo-500 bg-indigo-50/30" : "border-slate-200 dark:border-slate-800/50"} rounded-xl p-3 min-h-[120px] transition-all`}
                          >
                            <div className="flex flex-col gap-2">
                              {col.widgets.map((widget) => (
                                <div
                                  key={widget.id}
                                  onClick={(e) => { e.stopPropagation(); setSelectedWidgetId(widget.id); setSelectedRowId(null); setActiveTab("customizer"); }}
                                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group/widget relative z-10 ${selectedWidgetId === widget.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 shadow-md" : "bg-white dark:bg-slate-900 border-slate-150 hover:border-slate-300"}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedWidgetId === widget.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                      {widget.type === "LEXICAL_RICH_TEXT" ? <Type className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                                    </div>
                                    <span className="text-xs font-bold truncate">{widget.title[activeLang] || "Widget"}</span>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); deleteWidget(row.rowId, col.id, widget.id); }} className="w-6 h-6 text-slate-300 group-hover/widget:text-red-500"><X className="w-3.5 h-3.5" /></Button>
                                </div>
                              ))}
                              {col.widgets.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-6 text-slate-300">
                                  <Plus className="w-5 h-5 mb-1" />
                                  <span className="text-[8px] font-black uppercase tracking-widest">Kéo Widget vào đây</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>

        {/* RIGHT PANEL: Customizer */}
        {showRightPanel && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-white dark:bg-slate-900 overflow-y-auto">
              <div className="p-4">
                {(currentWidget || selectedRowId) ? (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <TabsTrigger value="customizer" disabled={!currentWidget} className="rounded-lg text-[10px] font-black uppercase tracking-wider py-2">Widget</TabsTrigger>
                      <TabsTrigger value="design" disabled={!selectedRowId} className="rounded-lg text-[10px] font-black uppercase tracking-wider py-2">Layout</TabsTrigger>
                    </TabsList>

                    <TabsContent value="customizer" className="space-y-6">
                      {currentWidget && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Tiêu đề Widget ({activeLang.toUpperCase()})</Label>
                            <Input
                              value={currentWidget.title[activeLang] || ""}
                              onChange={(e) => updateWidgetTitle(currentWidget.id, e.target.value)}
                              placeholder="Nhập tiêu đề..."
                              className="h-10 text-xs font-semibold"
                            />
                          </div>

                          {currentWidget.type === "LEXICAL_RICH_TEXT" && (
                            <div className="space-y-2">
                              <Label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Nội dung Rich Text</Label>
                              <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-950 min-h-[400px]">
                                <LexicalEditor
                                  value={currentWidget.content?.[activeLang] || ""}
                                  onChange={(val) => updateWidgetContent(currentWidget.id, val)}
                                />
                              </div>
                            </div>
                          )}

                          {currentWidget.type === "ORG_SECTIONS_DIRECTORY" && (
                            <div className="space-y-4 pt-4 border-t border-slate-150">
                              <Label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Chọn đơn vị tổ chức</Label>
                              <div className="max-h-72 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border">
                                {(orgTree || []).map((node: any) => (
                                  <OrgTreeItem key={node.id} node={node} isCustomizer={true} widgetId={currentWidget.id} />
                                ))}
                              </div>
                            </div>
                          )}

                          {currentWidget.type === "LEADERSHIP_LIST" && (
                            <div className="space-y-4 pt-4 border-t border-slate-150">
                              <Label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Chọn cán bộ lãnh đạo</Label>
                              <div className="max-h-72 overflow-y-auto space-y-1 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border">
                                {allEmployees.map((emp: any) => (
                                  <div
                                    key={emp.id}
                                    onClick={() => toggleSelectLeader(currentWidget.id, emp)}
                                    className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-2 ${(currentWidget.data?.selectedLeaderIds || []).includes(emp.id) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-100"}`}
                                  >
                                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${(currentWidget.data?.selectedLeaderIds || []).includes(emp.id) ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"}`}>
                                      {(currentWidget.data?.selectedLeaderIds || []).includes(emp.id) && <Check className="w-2.5 h-2.5" />}
                                    </div>
                                    <span className="font-bold">{emp.lastname} {emp.firstname}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="design" className="space-y-6">
                      {selectedRowId && (
                        <div className="space-y-6 animate-fade-in">
                          <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nền & Màu sắc</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase">Màu nền</Label>
                                <Input type="color" value={findRowById(selectedRowId)?.settings?.backgroundColor || "#ffffff"} onChange={(e) => updateRowSettings(selectedRowId, { backgroundColor: e.target.value })} className="h-10 p-1" />
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase">Màu chữ</Label>
                                <Input type="color" value={findRowById(selectedRowId)?.settings?.textColor || "#000000"} onChange={(e) => updateRowSettings(selectedRowId, { textColor: e.target.value })} className="h-10 p-1" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100">
                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Khoảng cách</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase">Đệm trên</Label>
                                <Select value={findRowById(selectedRowId)?.settings?.paddingTop || "pt-8"} onValueChange={(val) => updateRowSettings(selectedRowId, { paddingTop: val })}>
                                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pt-0">0px</SelectItem>
                                    <SelectItem value="pt-4">16px</SelectItem>
                                    <SelectItem value="pt-8">32px</SelectItem>
                                    <SelectItem value="pt-12">48px</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label className="text-[9px] font-bold text-slate-500 uppercase">Đệm dưới</Label>
                                <Select value={findRowById(selectedRowId)?.settings?.paddingBottom || "pb-8"} onValueChange={(val) => updateRowSettings(selectedRowId, { paddingBottom: val })}>
                                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pb-0">0px</SelectItem>
                                    <SelectItem value="pb-4">16px</SelectItem>
                                    <SelectItem value="pb-8">32px</SelectItem>
                                    <SelectItem value="pb-12">48px</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="py-20 text-center opacity-30">
                    <Settings2 className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Chọn thành phần để cấu hình</p>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
