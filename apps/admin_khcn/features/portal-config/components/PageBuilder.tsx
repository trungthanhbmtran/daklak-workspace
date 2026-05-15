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
  Phone,
  Mail,
  Clock,
  ChevronDown,
  ChevronRight,
  Play,
  GripVertical
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
  const [activeTab, setActiveTab] = useState<string>("toolbox");
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
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

  const addWidgetFromDrag = (rowId: string, colId: string, dragData: string) => {
    try {
      const parsed = JSON.parse(dragData);
      const widgetType = parsed.type as Widget["type"];
      const item = parsed.item;

      // Smart Merge: If dragging an individual item into a column that already has a widget of the same type, add it to that widget instead.
      if (item) {
        const row = layout.find(r => r.rowId === rowId);
        const col = row?.columns.find(c => c.id === colId);
        const existingWidget = col?.widgets.find(w => w.type === widgetType);

        if (existingWidget) {
          if (widgetType === "LEADERSHIP_LIST") {
            const currentIds = existingWidget.data?.selectedLeaderIds || [];
            if (!currentIds.includes(item.id)) {
              toggleSelectLeader(existingWidget.id, item);
              toast.success(`Đã thêm ${item.lastname || ""} ${item.firstname || ""} vào danh sách.`);
            } else {
              toast.info("Cán bộ này đã có trong danh sách.");
            }
            setSelectedWidgetId(existingWidget.id);
            setActiveTab("customizer");
            return;
          }

          if (widgetType === "ORG_SECTIONS_DIRECTORY") {
            const currentIds = existingWidget.data?.selectedUnitIds || [];
            if (!currentIds.includes(item.id)) {
              toggleSelectUnit(existingWidget.id, item);
              toast.success(`Đã thêm đơn vị ${item.name} vào sơ đồ.`);
            } else {
              toast.info("Đơn vị này đã có trong danh sách.");
            }
            setSelectedWidgetId(existingWidget.id);
            setActiveTab("customizer");
            return;
          }

          // Fallback for other types that might want to merge in the future
        }
      }

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
      } else if (widgetType === "PUBLIC_SERVICES") {
        defaultTitle.vi = item ? `Dịch vụ: ${item.title}` : "Dịch vụ công & Tra cứu hồ sơ";
        defaultTitle.en = "Public Services & Lookup";
        if (item) {
          initialData = { selectedService: item.title };
        }
      } else if (widgetType === "LEGAL_DOCUMENTS") {
        defaultTitle.vi = item ? `Văn bản: ${item.title}` : "Văn bản chỉ đạo điều hành";
        defaultTitle.en = "Legal Documents";
        if (item) {
          initialData = { selectedDocType: item.title };
        }
      } else if (widgetType === "PHOTO_VIDEO_GALLERY") {
        defaultTitle.vi = item ? `Thư viện: ${item.title}` : "Thư viện Hình ảnh & Video";
        defaultTitle.en = "Photo & Video Gallery";
        if (item) {
          initialData = { selectedAlbum: item.title };
        }
      } else if (widgetType === "FAQ_ACCORDION") {
        defaultTitle.vi = item ? `Hỏi đáp: ${item.title}` : "Hỏi đáp trực tuyến (FAQ)";
        defaultTitle.en = "Online FAQ";
        if (item) {
          initialData = { selectedTopic: item.title };
        }
      } else if (widgetType === "EXTERNAL_LINKS") {
        defaultTitle.vi = item ? `Liên kết: ${item.title}` : "Liên kết website & Đối tác";
        defaultTitle.en = "External Links";
        if (item) {
          initialData = { selectedPartner: item.title };
        }
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

  // Find any widget by ID
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

  // Find currently selected widget object
  const getSelectedWidget = (): Widget | null => {
    return findWidgetById(selectedWidgetId || "");
  };

  // Fetch Organization Units Tree
  const { data: orgTree } = useQuery({
    queryKey: ["organizations-tree"],
    queryFn: () => organizationApi.getTree(),
    staleTime: 5 * 60 * 1000,
  });

  // Flatten org tree for easy checkbox selection
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

  // Fetch HRM Employees / Leaders
  const { data: hrmEmployeesRes } = useQuery({
    queryKey: ["hrm-employees-list"],
    queryFn: () => hrmApi.list({ pageSize: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const allEmployees = hrmEmployeesRes?.data || [];

  const toggleSelectUnit = (widgetId: string, unit: any) => {
    const w = findWidgetById(widgetId);
    if (!w) return;

    const currentIds = w.data?.selectedUnitIds || [];
    let newIds: number[];
    let newUnits: any[];

    if (currentIds.includes(unit.id)) {
      newIds = currentIds.filter((id: number) => id !== unit.id);
      newUnits = (w.data?.selectedUnits || []).filter((u: any) => u.id !== unit.id);
    } else {
      newIds = [...currentIds, unit.id];
      const newUnitObj = {
        id: unit.id,
        title: unit.name,
        code: unit.code || "",
        typeName: unit.typeName || "Cơ quan hành chính",
        desc: `Bộ phận trực thuộc phụ trách điều hành, quản lý lĩnh vực ${unit.name} theo quy chế hoạt động của đơn vị.`,
        details: ["Cấp trưởng phụ trách chung", "Cấp phó theo dõi chuyên môn", "Cán bộ chuyên trách nghiệp vụ"]
      };
      newUnits = [...(w.data?.selectedUnits || []), newUnitObj];
    }

    updateWidgetData(widgetId, {
      ...(w.data || {}),
      selectedUnitIds: newIds,
      selectedUnits: newUnits
    });
  };

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
        responsibility: `Chịu trách nhiệm phụ trách chung và điều hành các hoạt động thuộc lĩnh vực phân công tại ${deptName}. Trực tiếp xử lý đơn thư và tiếp dân theo quy chế.`,
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
                    className={`text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-md transition-all ${activeLang === l.code
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
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverColId(col.id);
                      }}
                      onDragLeave={() => setDragOverColId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverColId(null);
                        const dragData = e.dataTransfer.getData("text/plain");
                        if (dragData) {
                          addWidgetFromDrag(row.rowId, col.id, dragData);
                        }
                      }}
                      className={`${col.colSpan} border-2 ${dragOverColId === col.id ? "border-indigo-500 bg-indigo-50/60 ring-4 ring-indigo-500/20 dark:bg-indigo-950/40" : "border-dashed border-slate-200 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/20"} rounded-xl p-4 min-h-[140px] hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between`}
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
                                className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between group/widget ${isSelected
                                  ? "bg-[#b91c1c]/5 border-[#b91c1c] shadow-sm"
                                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-800 hover:border-slate-300"
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${isSelected ? "bg-[#b91c1c] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
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

      {/* RIGHT PANEL: Toolbox (Kho CSDL & Nguồn dữ liệu) & Customizer Tabs */}
      <div className={`transition-all duration-500 sticky top-6 h-[calc(100vh-140px)] overflow-y-auto pr-2 ${isLexicalActive ? 'xl:col-span-8 order-1 xl:order-2 max-w-7xl' : 'xl:col-span-4 order-2'}`}>
        <Tabs defaultValue="toolbox" value={activeTab} onValueChange={(v) => { setActiveTab(v); if (v === "toolbox") setSelectedWidgetId(null); }}>
          <TabsList className="w-full grid grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl h-12">
            <TabsTrigger value="toolbox" className="font-extrabold text-xs gap-2 flex items-center justify-center rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all h-10">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Kho CSDL & Dữ liệu</span>
            </TabsTrigger>
            <TabsTrigger value="customizer" disabled={!selectedWidgetId} className="font-extrabold text-xs gap-2 flex items-center justify-center rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#b91c1c] data-[state=active]:shadow-sm transition-all h-10">
              <Settings2 className="w-4 h-4 text-[#b91c1c]" />
              <span>Thuộc tính Widget</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: KHO CSDL VÀ DỮ LIỆU NGUỒN */}
          <TabsContent value="toolbox" className="space-y-6 focus:outline-none">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <h4 className="font-black text-indigo-950 dark:text-indigo-300 uppercase tracking-wide">Kéo thả dữ liệu trực tiếp</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-normal">
                  Danh sách các cơ sở dữ liệu và bản ghi thực tế của Cổng thông tin. Kéo và thả trực tiếp một bản ghi hoặc toàn bộ danh mục vào các cột bên trái để hiển thị ngay lập tức.
                </p>
              </div>
            </div>

            {/* Tìm kiếm nhanh */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm dữ liệu, phòng ban, cán bộ..."
                className="pl-9 h-10 bg-white dark:bg-slate-900 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 shadow-sm"
              />
            </div>

            {/* Danh sách các CSDL */}
            <div className="space-y-4">

              {/* 1. CSDL Cơ cấu Tổ chức */}
              <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900 rounded-xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/60 p-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-950 flex items-center justify-center text-[#b91c1c] dark:text-[#fbc02d]">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">CSDL Đơn vị Tổ chức</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "ORG_SECTIONS_DIRECTORY" }))}
                    className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/40 text-[10px] font-black text-slate-500 hover:text-[#b91c1c] border border-slate-200 dark:border-slate-700 px-2 py-1 rounded cursor-grab active:cursor-grabbing shadow-xs transition-all"
                  >
                    <GripVertical className="w-3 h-3 text-slate-400" /> Kéo nguyên cụm
                  </div>
                </CardHeader>
                <CardContent className="p-2 max-h-72 overflow-y-auto space-y-1.5">
                  {searchQuery.trim() !== "" ? (
                    // Flat list search view
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {allOrgUnits.filter((u: any) => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((unit: any) => (
                        <div
                          key={unit.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "ORG_SECTIONS_DIRECTORY", item: unit }))}
                          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                            <div className="flex flex-col min-w-0 text-left">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{unit.name}</span>
                              <span className="text-[9px] text-slate-400 font-medium truncate">{unit.typeName || "Cơ cấu tổ chức"}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-extrabold uppercase text-[#b91c1c] bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded shrink-0">
                            Kéo thả
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Hierarchical tree view
                    <div className="space-y-1">
                      {(orgTree || []).map((node: any) => (
                        <OrgTreeItem key={node.id} node={node} isCustomizer={false} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. CSDL Cán bộ Lãnh đạo */}
              <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900 rounded-xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/60 p-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Users2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">CSDL Cán bộ Lãnh đạo</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEADERSHIP_LIST" }))}
                    className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 hover:border-indigo-200 dark:hover:bg-indigo-950/40 text-[10px] font-black text-slate-500 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded cursor-grab active:cursor-grabbing shadow-xs transition-all"
                  >
                    <GripVertical className="w-3 h-3 text-slate-400" /> Kéo nguyên cụm
                  </div>
                </CardHeader>
                <CardContent className="p-2 max-h-56 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                  {allEmployees.filter((emp: any) => {
                    const fullName = `${emp.lastname || ""} ${emp.firstname || ""}`.trim().toLowerCase();
                    return fullName.includes(searchQuery.toLowerCase());
                  }).map((emp: any) => {
                    const fullName = `${emp.lastname || ""} ${emp.firstname || ""}`.trim() || "Cán bộ lãnh đạo";
                    const roleName = emp.jobTitle?.name || emp.jobTitleName || "Cán bộ phụ trách";
                    return (
                      <div
                        key={emp.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEADERSHIP_LIST", item: emp }))}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                          <div className="flex flex-col min-w-0 text-left">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{fullName}</span>
                            <span className="text-[9px] text-slate-400 font-medium truncate">{roleName}</span>
                          </div>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded shrink-0">
                          Kéo thả
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* 3. CSDL Tin tức & Bài viết */}
              <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900 rounded-xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/60 p-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Newspaper className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">CSDL Tin bài & Phân mục</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "FEATURED_NEWS" }))}
                    className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/40 text-[10px] font-black text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded cursor-grab active:cursor-grabbing shadow-xs transition-all"
                  >
                    <GripVertical className="w-3 h-3 text-slate-400" /> Kéo nguyên cụm
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: 1, title: "Tin hoạt động địa phương", desc: "Các tin tức mới nhất về kinh tế xã hội" },
                    { id: 2, title: "Nông thôn mới & Nông nghiệp", desc: "Chính sách hỗ trợ nông dân, sản phẩm OCOP" },
                    { id: 3, title: "Cải cách hành chính & Chuyển đổi số", desc: "Đề án 06, thủ tục trực tuyến" },
                    { id: 4, title: "Phổ biến chính sách pháp luật", desc: "Các thông tư, hướng dẫn mới" }
                  ].map((cat) => (
                    <div
                      key={cat.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "FEATURED_NEWS", item: cat }))}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{cat.title}</span>
                          <span className="text-[9px] text-slate-400 font-medium truncate">{cat.desc}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded shrink-0">
                        Kéo thả
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 4. CSDL Dịch vụ công */}
              <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900 rounded-xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/60 p-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">CSDL Dịch vụ Công</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "PUBLIC_SERVICES" }))}
                    className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-950/40 text-[10px] font-black text-slate-500 hover:text-emerald-600 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded cursor-grab active:cursor-grabbing shadow-xs transition-all"
                  >
                    <GripVertical className="w-3 h-3 text-slate-400" /> Kéo nguyên cụm
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: 1, title: "Nộp hồ sơ trực tuyến", desc: "Hệ thống tiếp nhận hồ sơ mức 3, mức 4" },
                    { id: 2, title: "Tra cứu tiến độ giải quyết", desc: "Tra cứu mã số biên nhận hồ sơ" },
                    { id: 3, title: "Hòm thư góp ý công dân", desc: "Tiếp nhận phản ánh kiến nghị" },
                    { id: 4, title: "Đánh giá mức độ hài lòng", desc: "Phiếu khảo sát chất lượng dịch vụ" }
                  ].map((srv) => (
                    <div
                      key={srv.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "PUBLIC_SERVICES", item: srv }))}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{srv.title}</span>
                          <span className="text-[9px] text-slate-400 font-medium truncate">{srv.desc}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded shrink-0">
                        Kéo thả
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* 5. CSDL Văn bản Pháp quy */}
              <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900 rounded-xl">
                <CardHeader className="bg-slate-50 dark:bg-slate-950/60 p-3 border-b border-slate-100 dark:border-slate-850 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <FolderOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-wide">CSDL Văn bản Pháp quy</span>
                  </div>
                  <div
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEGAL_DOCUMENTS" }))}
                    className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-950/40 text-[10px] font-black text-slate-500 hover:text-purple-600 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded cursor-grab active:cursor-grabbing shadow-xs transition-all"
                  >
                    <GripVertical className="w-3 h-3 text-slate-400" /> Kéo nguyên cụm
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { id: 1, title: "Quyết định quy chế hoạt động", desc: "Quyết định của Chủ tịch UBND xã" },
                    { id: 2, title: "Chỉ thị phòng chống thiên tai", desc: "Phương án ứng phó biến đổi khí hậu" },
                    { id: 3, title: "Nghị quyết phát triển kinh tế", desc: "Kế hoạch phân bổ ngân sách năm" }
                  ].map((doc) => (
                    <div
                      key={doc.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "LEGAL_DOCUMENTS", item: doc }))}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg flex items-center justify-between group cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0" />
                        <div className="flex flex-col min-w-0 text-left">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{doc.title}</span>
                          <span className="text-[9px] text-slate-400 font-medium truncate">{doc.desc}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded shrink-0">
                        Kéo thả
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Các khối chức năng khác */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "COMMUNE_INTERACTIVE_MAP" }))}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-orange-500 hover:shadow-sm cursor-grab active:cursor-grabbing flex flex-col gap-1 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Map className="w-4 h-4 text-orange-500" />
                    <span className="text-[8px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-1.5 py-0.5 rounded">Kéo thả</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Bản đồ GIS Xã</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Bản đồ 8 thôn buôn</span>
                </div>

                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "PHOTO_VIDEO_GALLERY" }))}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-rose-500 hover:shadow-sm cursor-grab active:cursor-grabbing flex flex-col gap-1 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Film className="w-4 h-4 text-rose-500" />
                    <span className="text-[8px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">Kéo thả</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Thư viện Media</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Album ảnh & video clip</span>
                </div>

                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "HERO_SLIDER" }))}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-500 hover:shadow-sm cursor-grab active:cursor-grabbing flex flex-col gap-1 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Images className="w-4 h-4 text-amber-500" />
                    <span className="text-[8px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">Kéo thả</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Slider Banners</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Trình chiếu sự kiện</span>
                </div>

                <div
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", JSON.stringify({ type: "FAQ_ACCORDION" }))}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-cyan-500 hover:shadow-sm cursor-grab active:cursor-grabbing flex flex-col gap-1 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <HelpCircle className="w-4 h-4 text-cyan-500" />
                    <span className="text-[8px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-1.5 py-0.5 rounded">Kéo thả</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white mt-1">Hỏi đáp trực tuyến</span>
                  <span className="text-[9px] text-slate-400 leading-tight">Bộ câu hỏi FAQ</span>
                </div>
              </div>

            </div>
          </TabsContent>

          {/* TAB 2: THUỘC TÍNH WIDGET ĐANG CHỌN */}
          <TabsContent value="customizer" className="focus:outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl">
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
                      <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-850">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-indigo-800 dark:text-[#fbc02d] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chọn cán bộ lãnh đạo từ cơ sở dữ liệu
                          </h5>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-black text-slate-600 dark:text-slate-300">
                            Đã chọn: {(currentWidget.data?.selectedLeaderIds || []).length}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-normal font-medium">
                          Bấm chọn danh sách cán bộ, lãnh đạo cơ quan từ hệ thống nhân sự (HRM) dưới đây. Thông tin và lịch tiếp dân sẽ được đồng bộ và hiển thị theo đúng danh sách bạn cấu hình.
                        </p>

                        <div className="max-h-64 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 shadow-inner">
                          {allEmployees.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-[10px] italic">
                              Đang tải cơ sở dữ liệu cán bộ nhân sự...
                            </div>
                          ) : (
                            allEmployees.map((emp: any) => {
                              const isSelected = (currentWidget.data?.selectedLeaderIds || []).includes(emp.id);
                              const fullName = `${emp.lastname || ""} ${emp.firstname || ""}`.trim() || "Cán bộ lãnh đạo";
                              const roleName = emp.jobTitle?.name || emp.jobTitleName || "Cán bộ phụ trách";

                              return (
                                <div
                                  key={emp.id}
                                  onClick={() => toggleSelectLeader(currentWidget.id, emp)}
                                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${isSelected
                                    ? "bg-indigo-50 border-indigo-300 text-indigo-900 dark:bg-indigo-950/30 dark:border-indigo-800 dark:text-white font-extrabold shadow-sm"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                                    }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className={`w-4 h-4 rounded flex items-center justify-center border text-[9px] ${isSelected ? "bg-indigo-600 border-indigo-600 text-white font-black" : "border-slate-300 bg-slate-100 dark:bg-slate-800"
                                      }`}>
                                      {isSelected && "✓"}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-bold truncate">{fullName}</span>
                                      <span className="text-[9px] text-slate-400 font-medium truncate">{roleName}</span>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                    {emp.employeeCode || `ID: ${emp.id}`}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5">
                          <Workflow className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            <span className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-wide">Tùy biến tổ chức hiển thị</span>
                            <span className="text-slate-600 dark:text-slate-400 leading-normal">
                              Danh sách cán bộ sẽ xuất hiện trên Portal chính xác theo thứ tự và cấu hình lựa chọn của bạn trong danh sách trên.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentWidget.type === "ORG_SECTIONS_DIRECTORY" && (
                      <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-850">
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-[#b91c1c] dark:text-[#fbc02d] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chọn đơn vị / cơ cấu từ cơ sở dữ liệu
                          </h5>
                          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-black text-slate-600 dark:text-slate-300">
                            Đã chọn: {(currentWidget.data?.selectedUnitIds || []).length}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-normal font-medium">
                          Bấm chọn các đơn vị / cơ cấu tổ chức dưới đây từ CSDL tổ chức. Bạn có thể tự do lựa chọn và tổ chức sơ đồ hiển thị trên trang theo ý muốn.
                        </p>

                        <div className="max-h-72 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 shadow-inner">
                          {allOrgUnits.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-[10px] italic">
                              Đang tải cơ sở dữ liệu tổ chức...
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {(orgTree || []).map((node: any) => (
                                <OrgTreeItem key={node.id} node={node} isCustomizer={true} widgetId={currentWidget.id} />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5">
                          <Workflow className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            <span className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-wide">Sắp xếp và Tùy biến hiển thị</span>
                            <span className="text-slate-600 dark:text-slate-400 leading-normal">
                              Các đơn vị được chọn sẽ đồng bộ ngay lập tức ra Cổng thông tin (Portal) theo sơ đồ tổ chức bạn mong muốn.
                            </span>
                          </div>
                        </div>
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
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
