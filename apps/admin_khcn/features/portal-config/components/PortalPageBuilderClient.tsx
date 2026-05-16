"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Layout,
  Sparkles,
  Loader2,
  Save,
  RefreshCw,
  Eye,
  Info,
  CheckCircle2,
  Settings2,
  Plus,
  Trash2,
  Edit2,
  FileText,
  FileCode,
  Check,
  Languages,
  Monitor,
  Tablet,
  Smartphone,
  ChevronRight,
  Globe
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/axiosInstance";
import { PageBuilder } from "./PageBuilder";

interface CustomPageMeta {
  id: string;
  title: {
    vi: string;
    en: string;
  };
  isActive: boolean;
}

export function PortalPageBuilderClient() {
  const [isSaving, setIsSaving] = useState(false);
  const [languages, setLanguages] = useState<any[]>([]);

  // Custom pages list management state
  const [pagesList, setPagesList] = useState<CustomPageMeta[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>("about-page");
  const [currentLayout, setCurrentLayout] = useState<any[]>([]);

  // Dialog state for adding/editing page metadata
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [modalPageId, setModalPageId] = useState("");
  const [modalTitleVi, setModalTitleVi] = useState("");
  const [modalTitleEn, setModalTitleEn] = useState("");
  const [modalIsActive, setModalIsActive] = useState(true);

  // 1. Fetch registered active languages from Category module
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res: any = await apiClient.get("/categories");
        const all = Array.isArray(res?.data) ? res.data : [];
        const langs = all.filter((c: any) => c.group === "LANGUAGE" && c.active === 1);
        setLanguages(langs.length > 0 ? langs : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      } catch (error) {
        console.error("Error fetching languages", error);
        setLanguages([{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }]);
      }
    };
    fetchLanguages();
  }, []);

  const activeLangs = languages.length > 0
    ? languages
    : [{ code: "vi", name: "Tiếng Việt" }, { code: "en", name: "English" }];

  // 2. Fetch existing portal configurations
  const { data: dbConfigs, isLoading, refetch } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get("/portal-configs");
        return Array.isArray(res?.data) ? res.data : [];
      } catch (error) {
        console.error("Error fetching portal configs", error);
        return [];
      }
    }
  });

  // 3. Process pages list and loaded layout based on selectedPageId
  useEffect(() => {
    if (dbConfigs && dbConfigs.length > 0) {
      // Find pages metadata list key
      const listConfig = dbConfigs.find((c: any) => c.code === "custom_page_list");
      let parsedPages: CustomPageMeta[] = [];

      if (listConfig && listConfig.description) {
        try {
          parsedPages = JSON.parse(listConfig.description);
        } catch (e) {
          console.error("Failed to parse custom page list config", e);
        }
      }

      // If pages list is empty, initialize with default about-page and contact-page
      if (parsedPages.length === 0) {
        parsedPages = [
          {
            id: "about-page",
            title: { vi: "Trang giới thiệu chung", en: "General Introduction" },
            isActive: true
          },
          {
            id: "contact-page",
            title: { vi: "Trang liên hệ", en: "Contact Page" },
            isActive: true
          }
        ];
      }

      setPagesList(parsedPages);

      // Verify if selected page is still in the list, otherwise select first available
      let currentId = selectedPageId;
      if (!parsedPages.some((p) => p.id === selectedPageId)) {
        currentId = parsedPages[0]?.id || "about-page";
        setSelectedPageId(currentId);
      }

      // Load layout for selected page
      const layoutCode = currentId === "about-page" ? "custom_about_layout" : `custom_page_layout_${currentId}`;
      const layoutConfig = dbConfigs.find((c: any) => c.code === layoutCode);

      if (layoutConfig && layoutConfig.description) {
        try {
          setCurrentLayout(JSON.parse(layoutConfig.description));
        } catch (e) {
          console.error(`Failed to parse page layout for ${currentId}`, e);
          setCurrentLayout([]);
        }
      } else {
        setCurrentLayout([]);
      }
    }
  }, [dbConfigs, selectedPageId]);

  const handleSaveLayout = async (targetPageId: string, updatedLayout: any[], updatedPagesList?: CustomPageMeta[]) => {
    setIsSaving(true);
    try {
      const finalPagesList = updatedPagesList || pagesList;
      const targetPageMeta = finalPagesList.find(p => p.id === targetPageId);

      const itemsToSave = [
        {
          code: "custom_page_list",
          name: "Danh sách trang thiết kế trực quan",
          description: JSON.stringify(finalPagesList)
        },
        {
          code: targetPageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${targetPageId}`,
          name: `Cấu trúc layout trang ${targetPageMeta?.title?.vi || targetPageId}`,
          description: JSON.stringify(updatedLayout)
        }
      ];

      if (targetPageId === "about-page") {
        itemsToSave.push({
          code: "use_custom_about_layout",
          name: targetPageMeta?.isActive ? "true" : "false",
          description: "Đồng bộ hóa cấu hình trang giới thiệu trực quan"
        });
      }

      for (const item of itemsToSave) {
        const existing = dbConfigs?.find((c: any) => c.code === item.code);
        if (existing) {
          await apiClient.put(`/portal-configs/${existing.id}`, {
            code: item.code,
            name: item.name,
            description: item.description,
          });
        } else {
          await apiClient.post("/portal-configs", {
            code: item.code,
            name: item.name,
            description: item.description,
          });
        }
      }

      toast.success(`Xuất bản thành công "${targetPageMeta?.title?.vi || targetPageId}"!`);
      refetch();
    } catch (error) {
      console.error("Failed to save custom layout", error);
      toast.error("Không thể lưu trang. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateOrUpdatePageMeta = async () => {
    if (!modalPageId.trim()) {
      toast.error("Vui lòng nhập mã định danh trang (Slug)");
      return;
    }
    if (!modalTitleVi.trim()) {
      toast.error("Vui lòng nhập tiêu đề Tiếng Việt");
      return;
    }

    const cleanId = modalPageId.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");

    if (modalMode === "ADD") {
      if (pagesList.some((p) => p.id === cleanId)) {
        toast.error("Mã định danh trang này đã tồn tại!");
        return;
      }

      const newPage: CustomPageMeta = {
        id: cleanId,
        title: {
          vi: modalTitleVi.trim(),
          en: modalTitleEn.trim() || modalTitleVi.trim()
        },
        isActive: modalIsActive
      };

      const updatedList = [...pagesList, newPage];
      setPagesList(updatedList);
      setIsPageModalOpen(false);
      setSelectedPageId(cleanId);
      await handleSaveLayout(cleanId, [], updatedList);
    } else {
      const updatedList = pagesList.map((p) => {
        if (p.id === modalPageId) {
          return {
            ...p,
            title: {
              vi: modalTitleVi.trim(),
              en: modalTitleEn.trim() || modalTitleVi.trim()
            },
            isActive: modalIsActive
          };
        }
        return p;
      });

      setPagesList(updatedList);
      setIsPageModalOpen(false);
      await handleSaveLayout(modalPageId, currentLayout, updatedList);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (pageId === "about-page" || pageId === "contact-page") {
      toast.error("Không thể xóa các trang mặc định của hệ thống.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa trang "${pagesList.find(p => p.id === pageId)?.title?.vi || pageId}"?`)) {
      return;
    }

    try {
      const updatedList = pagesList.filter((p) => p.id !== pageId);
      setPagesList(updatedList);

      await apiClient.post("/portal-configs", {
        code: "custom_page_list",
        name: "Danh sách trang thiết kế trực quan",
        description: JSON.stringify(updatedList)
      });

      const layoutCode = `custom_page_layout_${pageId}`;
      const layoutConfig = dbConfigs?.find((c: any) => c.code === layoutCode);
      if (layoutConfig) {
        await apiClient.delete(`/portal-configs/${layoutConfig.id}`);
      }

      toast.success("Đã xóa trang tùy chỉnh thành công!");
      if (selectedPageId === pageId) {
        setSelectedPageId(updatedList[0]?.id || "about-page");
      }
      refetch();
    } catch (e) {
      console.error("Failed to delete custom page", e);
      toast.error("Không thể xóa trang. Vui lòng thử lại.");
    }
  };

  const openAddPageModal = () => {
    setModalMode("ADD");
    setModalPageId("");
    setModalTitleVi("");
    setModalTitleEn("");
    setModalIsActive(true);
    setIsPageModalOpen(true);
  };

  const openEditPageModal = (page: CustomPageMeta) => {
    setModalMode("EDIT");
    setModalPageId(page.id);
    setModalTitleVi(page.title.vi);
    setModalTitleEn(page.title.en);
    setModalIsActive(page.isActive);
    setIsPageModalOpen(true);
  };

  const selectedPageMeta = pagesList.find((p) => p.id === selectedPageId) || pagesList[0];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 select-none bg-slate-50">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-black text-slate-800 uppercase tracking-[0.2em]">Hệ thống đang nạp</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang đồng bộ hóa dữ liệu Visual Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] dark:bg-[#020617] overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* GLOBAL TOP HEADER */}
      <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 px-8 flex items-center justify-between z-40 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 rotate-3 transition-transform hover:rotate-0 cursor-pointer">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Visual Portal Builder</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrative Design Suite</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-6 mr-6 py-2 px-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trang đang mở</span>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight truncate max-w-[150px]">{selectedPageMeta?.title?.vi}</span>
            </div>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trạng thái</span>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedPageMeta?.isActive ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                {selectedPageMeta?.isActive ? "Đã xuất bản" : "Bản nháp"}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => refetch()}
            className="h-11 px-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Đồng bộ
          </Button>

          <Button
            onClick={() => handleSaveLayout(selectedPageId, currentLayout)}
            disabled={isSaving}
            className="h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] gap-2 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Xuất bản Portal
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Pages List */}
        <aside className="w-80 border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#0f172a] flex flex-col z-30 shrink-0">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-400" />
              <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quản lý trang</h2>
            </div>
            <Button
              size="icon"
              onClick={openAddPageModal}
              className="w-8 h-8 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 dark:shadow-none transition-all hover:rotate-90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {pagesList.map((p) => {
              const isSelected = p.id === selectedPageId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-sm" 
                      : "border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[11px] font-black uppercase tracking-tight truncate ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {p.title.vi}
                      </span>
                      <span className="text-[8px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                        Slug: /{p.id}
                      </span>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${p.isActive ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : "bg-slate-300 dark:bg-slate-700"}`} />
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                      <span className="text-[9px] font-bold italic text-slate-400 truncate max-w-[120px]">{p.title.en}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); openEditPageModal(p); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                      {p.id !== "about-page" && p.id !== "contact-page" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm border border-transparent hover:border-rose-100 dark:hover:border-rose-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-indigo-600 rounded-r-full shadow-lg shadow-indigo-500/50" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
             <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">AI Assist</span>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sẵn sàng tối ưu Layout</span>
                </div>
             </div>
          </div>
        </aside>

        {/* CONTENT AREA: Page Builder */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex-1 bg-[#f8fafc] dark:bg-[#020617]">
            <PageBuilder 
              layout={currentLayout}
              onChange={setCurrentLayout}
              languages={activeLangs}
            />
          </div>

          {/* PAGE CONFIGURATION BOTTOM BAR (QUICK TOGGLES) */}
          <div className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700">
                   <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Đang sửa:</span>
                   <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase truncate max-w-[200px]">{selectedPageMeta?.title?.vi}</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Route:</span>
                   <code className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">/tuy-bien/{selectedPageMeta?.id}</code>
                </div>
             </div>

             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                   <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedPageMeta?.isActive ? "text-emerald-600" : "text-amber-600"}`}>
                      {selectedPageMeta?.isActive ? "Trang đang hoạt động" : "Trang đang bảo trì"}
                   </span>
                   <button
                    onClick={() => {
                      const updatedList = pagesList.map((p) => {
                        if (p.id === selectedPageId) return { ...p, isActive: !p.isActive };
                        return p;
                      });
                      setPagesList(updatedList);
                      handleSaveLayout(selectedPageId, currentLayout, updatedList);
                    }}
                    className={`relative inline-flex h-4.5 w-9 items-center rounded-full transition-all shadow-inner ${selectedPageMeta?.isActive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}
                   >
                     <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-md transition-all ${selectedPageMeta?.isActive ? "translate-x-5" : "translate-x-1"}`} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* DIALOG FOR CREATING / EDITING PAGE METADATA */}
      <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
        <DialogContent className="max-w-md rounded-[32px] border-none p-0 overflow-hidden shadow-2xl animate-scale-in">
          <div className="p-8 bg-white dark:bg-[#0f172a]">
            <DialogHeader className="mb-8">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-900/50">
                <Layout className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {modalMode === "ADD" ? "Tạo Trang Mới" : "Cấu Hình Meta Trang"}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-400 dark:text-slate-500">
                Đăng ký thông tin định danh và tiêu đề trang để bắt đầu thiết kế layout trực quan.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="pageId" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Mã định danh (URL SLUG)</Label>
                <div className="relative">
                  <Input
                    id="pageId"
                    disabled={modalMode === "EDIT"}
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest pl-12 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all"
                    placeholder="ví dụ: gioi-thieu-chung"
                    value={modalPageId}
                    onChange={(e) => setModalPageId(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 font-black text-[10px] select-none">ID:</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                <div className="space-y-2">
                  <Label htmlFor="titleVi" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Tiêu đề (TIẾNG VIỆT)</Label>
                  <Input
                    id="titleVi"
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all"
                    placeholder="Nhập tiêu đề tiếng Việt..."
                    value={modalTitleVi}
                    onChange={(e) => setModalTitleVi(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleEn" className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Tiêu đề (ENGLISH)</Label>
                  <Input
                    id="titleEn"
                    className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 transition-all"
                    placeholder="Enter English title..."
                    value={modalTitleEn}
                    onChange={(e) => setModalTitleEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Kích hoạt hiển thị</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">Mở trang cho người dùng cuối truy cập</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalIsActive(!modalIsActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-inner ${modalIsActive ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-all ${modalIsActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
            <Button variant="ghost" onClick={() => setIsPageModalOpen(false)} className="rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800">Hủy bỏ</Button>
            <Button
              onClick={handleCreateOrUpdatePageMeta}
              className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
            >
              {modalMode === "ADD" ? "Tạo Trang" : "Lưu Thay Đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
