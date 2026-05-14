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
  Images,
  Newspaper,
  Landmark,
  FolderOpen,
  HelpCircle,
  ExternalLink,
  Film,
  Database
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

  const addDataSourceAsRow = (widgetType: Widget["type"]) => {
    const timestamp = Date.now();
    
    // Default dynamic properties depending on type
    const defaultTitle: Record<string, string> = { vi: "", en: "" };
    let defaultContent: Record<string, string> = { vi: "", en: "" };

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

    const newRow: Row = {
      rowId: `row-${timestamp}`,
      columns: [
        {
          id: `col-${timestamp}-1`,
          colSpan: "lg:col-span-12",
          widgets: [newWidget]
        }
      ]
    };

    onChange([...layout, newRow]);
    setSelectedWidgetId(newWidget.id);
    toast.success(`Đã nạp ${defaultTitle.vi || widgetType} vào trang!`);
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
    const w = getSelectedWidget();
    if (!w || w.id !== widgetId) return;

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
    const w = getSelectedWidget();
    if (!w || w.id !== widgetId) return;

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
        
        {/* DATA SOURCES & DATABASES REPOSITORY */}
        <Card className="border border-indigo-200 dark:border-indigo-900/50 shadow-md overflow-hidden bg-white dark:bg-slate-900 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Database className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black tracking-wide text-white uppercase">
                    Kho Nguồn Dữ liệu & Modules CSDL Cổng thông tin
                  </CardTitle>
                  <p className="text-[11px] text-indigo-200 font-medium">
                    Bấm chọn nguồn dữ liệu dưới đây để nạp trực tiếp vào giao diện chung
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-400/20">
                11 Nguồn Dữ Liệu
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-indigo-50/10 dark:bg-indigo-950/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Card 1: Org */}
              <div 
                onClick={() => addDataSourceAsRow("ORG_SECTIONS_DIRECTORY")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center font-bold">🏛️</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Cơ cấu Tổ chức</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Sơ đồ bộ máy & Đơn vị trực thuộc</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Nạp danh bạ các phòng ban, ban ngành, đơn vị trực thuộc từ hệ thống quản lý tổ chức.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 2: Leaders */}
              <div 
                onClick={() => addDataSourceAsRow("LEADERSHIP_LIST")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">👥</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Cán bộ Lãnh đạo</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Nhân sự & Lịch trực tiếp dân</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Nạp danh sách lãnh đạo, ban giám đốc và thông tin lịch tiếp công dân từ CSDL Nhân sự.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 3: Featured News */}
              <div 
                onClick={() => addDataSourceAsRow("FEATURED_NEWS")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">📰</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Tin bài Nổi bật</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Tin tức, hoạt động, thông báo</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Tự động nạp tin tức hoạt động mới nhất từ các chuyên mục tin tức của cơ quan.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 4: Legal Documents */}
              <div 
                onClick={() => addDataSourceAsRow("LEGAL_DOCUMENTS")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center font-bold">📜</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Văn bản Pháp quy</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Chỉ thị, Quyết định, Điều hành</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Nạp hệ thống văn bản chỉ đạo điều hành, quyết định, nghị quyết mới ban hành.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 5: Public Services */}
              <div 
                onClick={() => addDataSourceAsRow("PUBLIC_SERVICES")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">⚖️</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Dịch vụ Công</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Nộp hồ sơ & Tra cứu thủ tục</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Cổng kết nối nộp hồ sơ trực tuyến, tra cứu tiến độ xử lý thủ tục hành chính.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 6: Map */}
              <div 
                onClick={() => addDataSourceAsRow("COMMUNE_INTERACTIVE_MAP")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center font-bold">🗺️</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Bản đồ Ranh giới</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Bản đồ quy hoạch & Thôn buôn</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Bản đồ tương tác các khu vực hành chính, địa giới các thôn buôn trực thuộc.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 7: Gallery */}
              <div 
                onClick={() => addDataSourceAsRow("PHOTO_VIDEO_GALLERY")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center font-bold">🖼️</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Thư viện Media</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Album ảnh & Video hoạt động</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Trình diễn các phóng sự ảnh, tư liệu video tuyên truyền của cơ quan.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 8: Banners */}
              <div 
                onClick={() => addDataSourceAsRow("HERO_SLIDER")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold">✨</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Banners Trình chiếu</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Slider hình ảnh nổi bật</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Trình diễn băng chuyền (slider) các sự kiện lớn và slogan trung tâm.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 9: FAQ */}
              <div 
                onClick={() => addDataSourceAsRow("FAQ_ACCORDION")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 flex items-center justify-center font-bold">💬</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">CSDL Hỏi đáp & FAQ</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Giải đáp thắc mắc công dân</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Các câu hỏi thường gặp và giải đáp trực tuyến từ bộ phận chuyên trách.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 10: Contact */}
              <div 
                onClick={() => addDataSourceAsRow("CONTACT_INFO_SIDEBAR")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold">📞</div>
                    <div>
                      <h6 className="font-black text-xs text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">Thông tin Liên hệ</h6>
                      <p className="text-[10px] text-slate-400 font-medium">Địa chỉ, Hotline, Tiếp dân</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Niêm yết thông tin đường dây nóng, trụ sở và lịch tiếp công dân định kỳ.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

              {/* Card 11: Lexical */}
              <div 
                onClick={() => addDataSourceAsRow("LEXICAL_RICH_TEXT")}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20 cursor-pointer transition-all group flex flex-col justify-between shadow-sm col-span-1 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">✍️</div>
                    <div>
                      <h6 className="font-black text-xs text-indigo-950 dark:text-white group-hover:text-indigo-600 transition-colors">Soạn thảo Tự do (Rich Text)</h6>
                      <p className="text-[10px] text-indigo-600/70 font-bold">Lexical Editor toàn cảnh</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-2 line-clamp-2">
                    Thêm khối soạn thảo nội dung tự do với hình ảnh, định dạng văn bản nâng cao.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  <span>+ Nạp vào trang</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

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
        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-900 rounded-2xl sticky top-24">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 rounded-xl">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-wider text-white">
                    Bảng điều khiển & Cấu hình Dữ liệu
                  </CardTitle>
                  <p className="text-[11px] text-indigo-200/70 font-medium mt-0.5">
                    Tùy chỉnh thông số hiển thị và nguồn dữ liệu động
                  </p>
                </div>
              </div>
              {currentWidget && (
                <span className="text-[10px] font-mono bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                  {currentWidget.type}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5">
            {!currentWidget ? (
              <div className="text-center py-20 px-6 space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-200 dark:border-slate-700 shadow-inner">
                  <Sparkles className="w-8 h-8 animate-pulse text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">Chưa chọn khối nội dung</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Hãy bấm chọn một khối Widget ở không gian thiết kế bên trái để kích hoạt bảng điều khiển chi tiết.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in text-xs">
                
                {/* Title edit field */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
                      Tiêu đề khối hiển thị ({activeLang.toUpperCase()})
                    </Label>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Bắt buộc</span>
                  </div>
                  <Input
                    value={currentWidget.title[activeLang] || ""}
                    onChange={(e) => updateWidgetTitle(currentWidget.id, e.target.value)}
                    placeholder="Nhập tiêu đề khối (Ví dụ: Tin tức nổi bật, Cơ cấu tổ chức...)"
                    className="h-11 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
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
                  <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                    <h5 className="font-black text-[#15803d] dark:text-emerald-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dữ liệu tích hợp tự động
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Khối này sẽ tự động nạp các chỉ số thống kê từ các trường <strong className="text-emerald-700 dark:text-emerald-400">Diện tích tự nhiên</strong>, <strong className="text-emerald-700 dark:text-emerald-400">Dân số hiện tại</strong>, <strong className="text-emerald-700 dark:text-emerald-400">Số thôn buôn</strong> đã được cấu hình trong mục Trang giới thiệu và xuất ra dưới dạng lưới thẻ thiết kế sang trọng.
                    </p>
                  </div>
                )}

                {currentWidget.type === "LEADERSHIP_LIST" && (
                  <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-850">
                    <div className="flex flex-col gap-1 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-indigo-900 dark:text-indigo-300 uppercase text-xs tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Chọn Lãnh đạo từ CSDL Nhân sự
                        </h5>
                        <span className="text-[10px] bg-indigo-600 text-white px-2.5 py-1 rounded-full font-black shadow-sm">
                          Đã chọn: {(currentWidget.data?.selectedLeaderIds || []).length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Bấm vào nút <strong className="text-indigo-600">Chọn / Bỏ chọn</strong> ở mỗi cán bộ dưới đây để đưa vào danh sách xuất hiện trên Cổng thông tin.
                      </p>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto space-y-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner pr-2">
                      {allEmployees.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs italic">
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
                              className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all shadow-sm ${
                                isSelected 
                                  ? "bg-white border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 dark:bg-slate-900 dark:border-indigo-500 dark:text-white" 
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                  isSelected ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                }`}>
                                  {isSelected ? "✓" : fullName[0]}
                                </div>
                                <div className="flex flex-col min-w-0 space-y-0.5">
                                  <span className={`font-black truncate ${isSelected ? "text-indigo-900 dark:text-indigo-300" : "text-slate-800 dark:text-slate-200"}`}>
                                    {fullName}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                    {roleName} • <span className="font-mono text-[10px] text-slate-400">{emp.employeeCode || `ID: ${emp.id}`}</span>
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className={`h-7 text-[10px] font-bold rounded-lg px-2.5 shrink-0 transition-all ${
                                  isSelected ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800" : ""
                                }`}
                              >
                                {isSelected ? "Đã chọn (Bỏ)" : "+ Chọn"}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {currentWidget.type === "ORG_SECTIONS_DIRECTORY" && (
                  <div className="space-y-4 pt-4 border-t border-slate-150 dark:border-slate-850">
                    <div className="flex flex-col gap-1 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-red-900 dark:text-red-300 uppercase text-xs tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" /> Chọn Đơn vị / Phòng ban từ CSDL
                        </h5>
                        <span className="text-[10px] bg-red-600 text-white px-2.5 py-1 rounded-full font-black shadow-sm">
                          Đã chọn: {(currentWidget.data?.selectedUnitIds || []).length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                        Lựa chọn các phòng ban, đơn vị trực thuộc từ CSDL tổ chức. Sơ đồ sẽ hiển thị tự động trên trang theo các đơn vị được chọn.
                      </p>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto space-y-2.5 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner pr-2">
                      {allOrgUnits.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs italic">
                          Đang tải cơ sở dữ liệu tổ chức...
                        </div>
                      ) : (
                        allOrgUnits.map((unit: any) => {
                          const isSelected = (currentWidget.data?.selectedUnitIds || []).includes(unit.id);
                          return (
                            <div
                              key={unit.id}
                              onClick={() => toggleSelectUnit(currentWidget.id, unit)}
                              className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all shadow-sm ${
                                isSelected 
                                  ? "bg-white border-red-500 ring-2 ring-red-500/20 text-red-950 dark:bg-slate-900 dark:border-red-500 dark:text-white" 
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-70 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                  isSelected ? "bg-red-600 text-white shadow-md shadow-red-600/20" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                }`}>
                                  {isSelected ? "✓" : "🏛"}
                                </div>
                                <div className="flex flex-col min-w-0 space-y-0.5">
                                  <span className={`font-black truncate ${isSelected ? "text-red-900 dark:text-red-300" : "text-slate-800 dark:text-slate-200"}`}>
                                    {unit.name}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                    Mã: <span className="font-mono text-slate-600 dark:text-slate-400">{unit.code || `ID: ${unit.id}`}</span>
                                    {unit.typeName && ` • Loại: ${unit.typeName}`}
                                  </span>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                className={`h-7 text-[10px] font-bold rounded-lg px-2.5 shrink-0 transition-all ${
                                  isSelected ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800" : ""
                                }`}
                              >
                                {isSelected ? "Đã chọn (Bỏ)" : "+ Chọn"}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {currentWidget.type === "COMMUNE_INTERACTIVE_MAP" && (
                  <div className="space-y-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30">
                    <h5 className="font-black text-orange-800 dark:text-orange-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-orange-600" /> Bản đồ tương tác vector
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Kích hoạt bản vẽ ranh giới vector tương tác của 8 phân khu thôn buôn xã Dang Kang. Người xem trên Portal có thể click chọn từng thôn để hiển thị thông số chi tiết.
                    </p>
                  </div>
                )}

                {currentWidget.type === "CONTACT_INFO_SIDEBAR" && (
                  <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
                    <h5 className="font-black text-blue-800 dark:text-blue-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" /> Dữ liệu liên hệ đồng bộ
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Nhúng khối thông tin địa chỉ, email, hotline của trụ sở cơ quan cùng lịch trực tiếp công dân của ban cán sự.
                    </p>
                  </div>
                )}

                {currentWidget.type === "CONTACT_FORM" && (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                    <h5 className="font-black text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-600" /> Biểu mẫu hòm thư góp ý
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Tự động tải biểu mẫu và hòm thư phản ánh ý kiến, kiến nghị trực tiếp từ công dân để gửi đến ban biên tập cơ quan.
                    </p>
                  </div>
                )}

                {currentWidget.type === "HERO_SLIDER" && (
                  <div className="space-y-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30">
                    <h5 className="font-black text-amber-800 dark:text-amber-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" /> Dữ liệu Banners đồng bộ
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Tự động tải danh sách các Banners và Slogan chính được cấu hình trong hệ thống để hiển thị trình chiếu tự động (Slider) sang trọng trên trang.
                    </p>
                  </div>
                )}

                {currentWidget.type === "FEATURED_NEWS" && (
                  <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/30">
                    <h5 className="font-black text-blue-800 dark:text-blue-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" /> Tin tức nổi bật tự động nạp
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Hiển thị danh sách các bài viết mới nhất và nổi bật nhất từ các chuyên mục Tin tức, Thông báo, Xây dựng, Nông nghiệp với hiệu ứng thẻ sang trọng.
                    </p>
                  </div>
                )}

                {currentWidget.type === "PUBLIC_SERVICES" && (
                  <div className="space-y-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                    <h5 className="font-black text-emerald-800 dark:text-emerald-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Danh mục Dịch vụ công & Tra cứu
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Tích hợp nhanh các tiện ích nộp hồ sơ trực tuyến, tra cứu tiến độ giải quyết thủ tục một cửa và gửi phản ánh kiến nghị công dân.
                    </p>
                  </div>
                )}

                {currentWidget.type === "LEGAL_DOCUMENTS" && (
                  <div className="space-y-3 p-4 rounded-xl bg-purple-50/50 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30">
                    <h5 className="font-black text-purple-800 dark:text-purple-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" /> Hệ thống Văn bản chỉ đạo
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Nạp tự động danh sách các văn bản pháp quy, quyết định, chỉ đạo điều hành mới nhất của cơ quan quản lý nhà nước.
                    </p>
                  </div>
                )}

                {currentWidget.type === "PHOTO_VIDEO_GALLERY" && (
                  <div className="space-y-3 p-4 rounded-xl bg-rose-50/50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30">
                    <h5 className="font-black text-rose-800 dark:text-rose-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-600" /> Thư viện Truyền thông
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Hiển thị album ảnh hoạt động và các video clip tuyên truyền trực quan sinh động với chế độ xem phóng to (Lightbox).
                    </p>
                  </div>
                )}

                {currentWidget.type === "FAQ_ACCORDION" && (
                  <div className="space-y-3 p-4 rounded-xl bg-cyan-50/50 border border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/30">
                    <h5 className="font-black text-cyan-800 dark:text-cyan-400 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600" /> Hỏi đáp trực tuyến (FAQ)
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Nạp các câu hỏi thường gặp và giải đáp pháp luật từ cổng tương tác công dân dưới dạng danh sách mở rộng (Accordion).
                    </p>
                  </div>
                )}

                {currentWidget.type === "EXTERNAL_LINKS" && (
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                    <h5 className="font-black text-slate-800 dark:text-slate-200 uppercase text-xs tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-slate-600" /> Liên kết ban ngành đối tác
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
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
