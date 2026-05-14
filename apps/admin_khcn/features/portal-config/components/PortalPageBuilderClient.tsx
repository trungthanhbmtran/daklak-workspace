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
  Languages
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
      // Compatibility fallback: 'about-page' can load from 'custom_about_layout' if standard layout does not exist
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
        // Fallback or empty default layout structure
        setCurrentLayout([]);
      }
    }
  }, [dbConfigs, selectedPageId]);

  // Save the entire design system and pages configurations
  const handleSaveLayout = async (targetPageId: string, updatedLayout: any[], updatedPagesList?: CustomPageMeta[]) => {
    setIsSaving(true);
    try {
      const finalPagesList = updatedPagesList || pagesList;
      const targetPageMeta = finalPagesList.find(p => p.id === targetPageId);

      const itemsToSave = [
        // 1. Update pages metadata list
        {
          code: "custom_page_list",
          name: "Danh sách trang thiết kế trực quan",
          description: JSON.stringify(finalPagesList)
        },
        // 2. Update layout of the specific page
        {
          code: targetPageId === "about-page" ? "custom_about_layout" : `custom_page_layout_${targetPageId}`,
          name: `Cấu trúc layout trang ${targetPageMeta?.title?.vi || targetPageId}`,
          description: JSON.stringify(updatedLayout)
        }
      ];

      // If we are saving about-page, also sync with use_custom_about_layout key for backward compatibility
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

      toast.success(`Xuất bản thành công cấu trúc trang "${targetPageMeta?.title?.vi || targetPageId}"!`);
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
      // Check for duplicate ID
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
      
      // Save empty layout for this new page
      await handleSaveLayout(cleanId, [], updatedList);
    } else {
      // Edit mode
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

      // Save current layout with updated page list metadata
      await handleSaveLayout(modalPageId, currentLayout, updatedList);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (pageId === "about-page" || pageId === "contact-page") {
      toast.error("Không thể xóa các trang mặc định của hệ thống.");
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa trang "${pagesList.find(p => p.id === pageId)?.title?.vi || pageId}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      const updatedList = pagesList.filter((p) => p.id !== pageId);
      setPagesList(updatedList);

      // Save list to CMS
      await apiClient.post("/portal-configs", {
        code: "custom_page_list",
        name: "Danh sách trang thiết kế trực quan",
        description: JSON.stringify(updatedList)
      });

      // Attempt to delete layout config from DB
      const layoutCode = `custom_page_layout_${pageId}`;
      const layoutConfig = dbConfigs?.find((c: any) => c.code === layoutCode);
      if (layoutConfig) {
        await apiClient.delete(`/portal-configs/${layoutConfig.id}`);
      }

      toast.success("Đã xóa trang tùy chỉnh thành công!");
      
      // Select first page
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
      <div className="flex flex-col items-center justify-center h-96 gap-3 select-none">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Đang nạp hệ thống trang trực quan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full p-4 sm:p-6 select-none animate-fade-in">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl shadow-md border-l-4 border-indigo-500 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse shrink-0" />
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wide">Quản Lý Trang Thiết Kế Trực Quan</h1>
          </div>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Thiết kế nhiều trang tùy biến (About, Contact, Tuyên truyền...) bằng cơ cấu Hàng, Cột và Widgets, sau đó tích hợp vào Menu hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-slate-700/80 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold gap-1.5 h-10 px-4"
          >
            <RefreshCw className="w-4 h-4 shrink-0" />
            Làm mới
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveLayout(selectedPageId, currentLayout)}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold tracking-wider px-5 rounded-xl text-xs gap-1.5 shadow-md shadow-indigo-500/20 h-10 uppercase shrink-0"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Save className="w-4 h-4 shrink-0" />
            )}
            Lưu trang hiện tại
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PAGES LIST SIDEBAR */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <FileCode className="w-4.5 h-4.5 text-indigo-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Danh sách Trang ({pagesList.length})</h2>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={openAddPageModal}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-800 border border-indigo-100 rounded-lg text-[10px] font-bold h-7 gap-1 px-2.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Tạo mới
            </Button>
          </div>

          <div className="space-y-2 h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {pagesList.map((p) => {
              const isSelected = p.id === selectedPageId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className={`group relative flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-indigo-50/50 border-indigo-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <p className={`text-xs font-extrabold truncate ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>
                        {p.title.vi}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        ID: {p.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPageModal(p);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      
                      {p.id !== "about-page" && p.id !== "contact-page" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(p.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Xóa trang"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[9px] text-slate-400 italic flex items-center gap-1 font-semibold">
                      <Languages className="w-3 h-3" />
                      {p.title.en}
                    </span>
                    
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.isActive 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {p.isActive ? "Bật" : "Tắt"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: CURRENT PAGE EDITOR */}
        <div className="lg:col-span-9 xl:col-span-10 space-y-4">
          {selectedPageMeta && (
            <>
              {/* STATUS & OVERVIEW CARD */}
              <Card className="border border-slate-150 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b py-3.5 px-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Trang hiện tại: {selectedPageMeta.title.vi}
                        </CardTitle>
                        <CardDescription className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          Đường dẫn Portal: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-600 text-[10px]">/tuy-bien/{selectedPageMeta.id}</code>
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-250">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedList = pagesList.map((p) => {
                            if (p.id === selectedPageId) {
                              return { ...p, isActive: !p.isActive };
                            }
                            return p;
                          });
                          setPagesList(updatedList);
                          handleSaveLayout(selectedPageId, currentLayout, updatedList);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          selectedPageMeta.isActive ? "bg-emerald-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            selectedPageMeta.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className={`text-[10px] font-black uppercase ${selectedPageMeta.isActive ? "text-emerald-600" : "text-slate-500"}`}>
                        {selectedPageMeta.isActive ? "ĐANG HOẠT ĐỘNG" : "ĐANG TẮT"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 text-xs text-slate-500 leading-relaxed bg-slate-50/5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="font-semibold text-[11px]">
                      {selectedPageMeta.isActive 
                        ? `Trang thiết kế đã được KÍCH HOẠT. Bạn có thể gắn đường dẫn "/tuy-bien/${selectedPageMeta.id}" vào các mục Menu chính để người dân truy cập.`
                        : `Trang thiết kế này đang tạm khóa. Khi người dùng truy cập link "/tuy-bien/${selectedPageMeta.id}", trang sẽ báo lỗi không tìm thấy.`
                      }
                    </p>
                  </div>
                  {selectedPageMeta.isActive && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl shrink-0 font-extrabold uppercase text-[9px] tracking-wide">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Live on Citizen Portal
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* EDITOR CANVAS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <h2 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                      Không gian thiết kế cấu trúc trang & Widgets
                    </h2>
                  </div>
                </div>

                <PageBuilder
                  layout={currentLayout}
                  onChange={setCurrentLayout}
                  languages={activeLangs}
                />
              </div>

            </>
          )}
        </div>
      </div>

      {/* DIALOG FOR CREATING / EDITING PAGE METADATA */}
      <Dialog open={isPageModalOpen} onOpenChange={setIsPageModalOpen}>
        <DialogContent className="max-w-md rounded-2xl border p-6">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-lg font-black text-slate-800 uppercase tracking-wide">
              {modalMode === "ADD" ? "Thêm trang thiết kế mới" : "Chỉnh sửa thông tin Trang"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Đăng ký thông tin định danh và tên trang để quản lý trong visual page builder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="pageId" className="text-xs font-extrabold text-slate-700 uppercase">
                Mã định danh trang (Slug / Route Path ID) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="pageId"
                disabled={modalMode === "EDIT"}
                className="rounded-lg text-xs font-mono font-bold"
                placeholder="Ví dụ: huong-dan, tuyen-truyen, tin-nhanh..."
                value={modalPageId}
                onChange={(e) => setModalPageId(e.target.value)}
              />
              {modalMode === "ADD" && (
                <p className="text-[10px] text-slate-400 font-semibold italic">
                  Chỉ dùng chữ cái viết thường không dấu, số và gạch ngang. Ví dụ: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-bold">huong-dan</code>.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleVi" className="text-xs font-extrabold text-slate-700 uppercase">
                Tiêu đề Trang (Tiếng Việt) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="titleVi"
                className="rounded-lg text-xs"
                placeholder="Nhập tiêu đề trang hiển thị trên Portal..."
                value={modalTitleVi}
                onChange={(e) => setModalTitleVi(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="titleEn" className="text-xs font-extrabold text-slate-700 uppercase">
                Tiêu đề Trang (English)
              </Label>
              <Input
                id="titleEn"
                className="rounded-lg text-xs"
                placeholder="Enter page title in English..."
                value={modalTitleEn}
                onChange={(e) => setModalTitleEn(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex flex-col">
                <Label className="font-extrabold text-xs text-slate-700 uppercase">Trạng thái kích hoạt</Label>
                <p className="text-[10px] text-slate-400 italic font-medium mt-0.5">
                  Mở hoặc khóa trang này trên cổng thông tin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalIsActive(!modalIsActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  modalIsActive ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    modalIsActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 border-t rounded-b-lg">
            <Button variant="ghost" size="sm" onClick={() => setIsPageModalOpen(false)} className="text-xs font-semibold">
              Hủy
            </Button>
            <Button
              onClick={handleCreateOrUpdatePageMeta}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 rounded-lg shadow-sm"
            >
              {modalMode === "ADD" ? "Tạo trang" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
