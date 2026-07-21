/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { PortalMenu, Post } from "@/features/posts/types";
import { CategoryItem } from "@/features/system-admin/categories/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2, Sparkles, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/features/system-admin/organization/api";
import { postsApi } from "../../api";
import { portalConfigApi } from "@/features/portal-config/api";
import { Text } from "@/components/ui/typography";
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/axiosInstance";


interface EditMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Partial<PortalMenu> | null;
  languages: CategoryItem[];
  menus: PortalMenu[];
  onSave: (payload: Partial<PortalMenu>) => Promise<void>;
}

export function EditMenuModal({ isOpen, onClose, menu, languages, menus, onSave }: EditMenuModalProps) {
  const [editingMenu, setEditingMenu] = useState<Partial<PortalMenu> | null>(null);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [isTranslating, setIsTranslating] = useState(false);
  const [postSearch, setPostSearch] = useState("");

  // Tải danh sách chuyên mục động từ API (Posts Service)
  const { data: dynamicCategories } = useQuery({
    queryKey: ["categories-for-menu-posts"],
    queryFn: async () => {
      const res = await postsApi.getCategories({ page: 1, limit: 100 });
      return res.data;
    },
    enabled: isOpen,
  });

  // Tải danh sách bài viết động từ API
  const { data: dynamicPostsRes } = useQuery({
    queryKey: ["posts-for-menu"],
    queryFn: async () => {
      const res = await postsApi.getPosts({ page: 1, limit: 100 });
      return res.data;
    },
    enabled: isOpen,
  });

  // Tải danh sách đơn vị từ CSDL Đơn vị (HRM)
  const { data: dynamicUnitsRes } = useQuery({
    queryKey: ["organization-units-for-menu"],
    queryFn: async () => {
      const res = await organizationApi.getOrganizations();
      return res.data;
    },
    enabled: isOpen,
  });

  const dynamicCategoriesList = dynamicCategories || [];
  const dynamicPosts = (dynamicPostsRes || []) as Post[];
  const dynamicUnitsList = dynamicUnitsRes || [];

  // Tải danh sách trang thiết kế trực quan từ portal-configs
  const { data: portalConfigsForMenu } = useQuery({
    queryKey: ["portal-configs"],
    queryFn: async () => {
      const res = await portalConfigApi.getAll();
      return res.data;
    },
    enabled: isOpen,
    staleTime: 60_000,
  });

  const customPageList = React.useMemo(() => {
    const found = (portalConfigsForMenu || []).find((c: any) => c.code === "custom_page_list");
    if (!found || !found.description) return [];
    try {
      return JSON.parse(found.description);
    } catch (e) {
      console.error("Failed to parse custom page list for menu", e);
      return [];
    }
  }, [portalConfigsForMenu]);

  useEffect(() => {
    if (menu) {
      setEditingMenu({ ...menu });
    } else {
      setEditingMenu(null);
    }
    setActiveLangTab("vi");
    setPostSearch("");
  }, [menu, isOpen]);

  if (!editingMenu) return null;

  const getTranslation = (langCode: string, field: "name" | "description") => {
    if (!editingMenu?.translations) return "";
    return editingMenu.translations[langCode]?.[field] || "";
  };

  const updateTranslation = (langCode: string, field: "name" | "description", value: string) => {
    const newTranslations = { ...(editingMenu?.translations || {}) };
    if (!newTranslations[langCode]) newTranslations[langCode] = {};
    newTranslations[langCode][field] = value;
    setEditingMenu({ ...editingMenu, translations: newTranslations });
  };

  const handleTranslateAllFields = async (langCode: string) => {
    const sourceName = editingMenu?.name || "";
    const sourceDesc = editingMenu?.description || "";
    if (!sourceName && !sourceDesc) {
      toast.warning("Vui lòng nhập tên hoặc mô tả Tiếng Việt trước khi dịch");
      return;
    }

    const translateApi = async (text: string, targetLang: string): Promise<string> => {
      if (!text.trim()) return "";
      
      try {
        const res = await apiClient.post<any, ApiResponse<{ jobId: string }>>('/admin/translate', { text, targetLang });
        if (!res.success || !res.data?.jobId) {
          throw new Error("Không thể khởi tạo tác vụ dịch thuật");
        }

        const jobId = res.data.jobId;
        const maxAttempts = 30; // 30s timeout

        for (let attempts = 1; attempts <= maxAttempts; attempts++) {
          await new Promise(r => setTimeout(r, 1000));

          const statusRes = await apiClient.get<any, ApiResponse<{ status: string; result?: any; error?: string }>>(`/admin/translate/jobs/${jobId}`);
          const jobData = statusRes.data;

          if (!jobData) continue;

          switch (jobData.status) {
            case 'COMPLETED':
              return jobData.result?.translated_text || "";
            case 'FAILED':
              throw new Error(jobData.error || "Dịch thuật thất bại");
            default:
              continue; // PROCESSING
          }
        }
        
        throw new Error("Quá thời gian chờ dịch thuật");
      } catch (error) {
        console.error("Auto translate error:", error);
        return "";
      }
    };

    const translateTask = async () => {
      try {
        setIsTranslating(true);
        const [translatedName, translatedDesc] = await Promise.all([
          translateApi(sourceName, langCode),
          translateApi(sourceDesc, langCode)
        ]);

        setEditingMenu(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            translations: {
              ...(prev.translations || {}),
              [langCode]: {
                ...(prev.translations?.[langCode] || {}),
                ...(translatedName && { name: translatedName }),
                ...(translatedDesc && { description: translatedDesc })
              }
            }
          };
        });
      } finally {
        setIsTranslating(false);
      }
    };

    toast.promise(translateTask(), {
      loading: `Đang dịch sang ${langCode.toUpperCase()}...`,
      success: `Đã dịch thành công sang ${langCode.toUpperCase()}!`,
      error: "Không thể tự động dịch, vui lòng thử lại.",
    });
  };

  const handleLocalSave = async () => {
    if (!editingMenu.name) {
      toast.error("Vui lòng nhập tên menu");
      return;
    }
    await onSave(editingMenu);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-xl border p-6">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <DialogTitle className="text-xl font-extrabold text-slate-800">
              {editingMenu.id ? "Chỉnh sửa Menu" : "Thêm Menu mới"}
            </DialogTitle>
          </div>
          <DialogDescription>
            Nhập thông tin mục menu để hiển thị trên cổng thông tin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <Tabs defaultValue="vi" value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
            <TabsList
              className="grid w-full mb-4"
              style={{
                gridTemplateColumns: `repeat(${Math.max(languages.length, 1)}, minmax(0, 1fr))`,
              }}
            >
              {languages.length > 0 ? (
                languages.map((lang) => (
                  <TabsTrigger key={lang.code} value={lang.code} className="font-semibold">
                    {lang.name}
                  </TabsTrigger>
                ))
              ) : (
                <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
              )}
            </TabsList>

            {languages.map((lang) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                {lang.code !== "vi" && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTranslateAllFields(lang.code)}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold gap-1 px-2.5 py-1 transition-all"
                      disabled={isTranslating}
                    >
                      {isTranslating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      )}
                      Dịch tự động từ Tiếng Việt
                    </Button>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor={`name-${lang.code}`}
                    className={`text-right font-bold text-sm ${lang.code !== "vi" ? "text-blue-600" : "text-slate-700"
                      }`}
                  >
                    Tên Menu ({lang.code.toUpperCase()})
                  </Label>
                  <Input
                    id={`name-${lang.code}`}
                    className={`col-span-3 rounded-lg ${lang.code !== "vi" ? "border-blue-100 focus:border-blue-300" : ""
                      }`}
                    placeholder={`Tên bằng ${lang.name}...`}
                    value={
                      lang.code === "vi"
                        ? editingMenu.name || ""
                        : getTranslation(lang.code, "name")
                    }
                    onChange={(e) =>
                      lang.code === "vi"
                        ? setEditingMenu({ ...editingMenu, name: e.target.value })
                        : updateTranslation(lang.code, "name", e.target.value)
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor={`desc-${lang.code}`}
                    className={`text-right text-sm ${lang.code !== "vi" ? "text-blue-600" : "text-slate-500"
                      }`}
                  >
                    Mô tả
                  </Label>
                  <Textarea
                    id={`desc-${lang.code}`}
                    className={`col-span-3 rounded-lg resize-none ${lang.code !== "vi" ? "border-blue-100" : ""
                      }`}
                    rows={2}
                    placeholder={`Mô tả bằng ${lang.name}...`}
                    value={
                      lang.code === "vi"
                        ? editingMenu.description || ""
                        : getTranslation(lang.code, "description")
                    }
                    onChange={(e) =>
                      lang.code === "vi"
                        ? setEditingMenu({
                          ...editingMenu,
                          description: e.target.value,
                        })
                        : updateTranslation(lang.code, "description", e.target.value)
                    }
                  />
                </div>
              </TabsContent>
            ))}

            {languages.length === 0 && (
              <TabsContent value="vi" className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right font-bold">
                    Tên Menu
                  </Label>
                  <Input
                    id="name"
                    className="col-span-3 rounded-lg"
                    value={editingMenu.name || ""}
                    onChange={(e) =>
                      setEditingMenu({ ...editingMenu, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    className="col-span-3 rounded-lg resize-none"
                    rows={2}
                    value={editingMenu.description || ""}
                    onChange={(e) =>
                      setEditingMenu({
                        ...editingMenu,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
            <Label htmlFor="type" className="text-right font-bold text-sm text-slate-700">
              Loại liên kết
            </Label>
            <Select
              value={
                editingMenu.link?.startsWith("/tuy-bien/")
                  ? "CUSTOM_PAGE"
                  : (editingMenu.type === "STATIC_PAGE" && editingMenu.referenceId === "van-ban")
                    ? "DOCUMENTS"
                    : editingMenu.type
              }
              onValueChange={(v) => {
                if (v === "DOCUMENTS") {
                  setEditingMenu({
                    ...editingMenu,
                    type: "STATIC_PAGE",
                    referenceId: "van-ban",
                    link: "/van-ban",
                  });
                } else if (v === "CUSTOM_PAGE") {
                  setEditingMenu({
                    ...editingMenu,
                    type: "URL",
                    referenceId: "",
                    link: "/tuy-bien/",
                  });
                } else {
                  setEditingMenu({
                    ...editingMenu,
                    type: v as any,
                    referenceId: undefined,
                    link: "",
                  });
                }
              }}
            >
              <SelectTrigger className="col-span-3 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">Bài viết / Trang tĩnh CMS</SelectItem>
                <SelectItem value="CATEGORY">Chuyên mục bài viết (Cây chuyên mục)</SelectItem>
                <SelectItem value="DOCUMENTS">Hệ thống Văn bản pháp quy</SelectItem>
                <SelectItem value="CUSTOM_PAGE">Trang thiết kế trực quan (Visual Page)</SelectItem>
                <SelectItem value="URL">Đường dẫn tự do (URL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right font-bold text-sm text-slate-700">
              Vị trí
            </Label>
            <Select
              value={editingMenu.position}
              onValueChange={(v) =>
                setEditingMenu({ ...editingMenu, position: v as any })
              }
            >
              <SelectTrigger className="col-span-3 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HORIZONTAL">Menu Ngang (Top Nav)</SelectItem>
                <SelectItem value="VERTICAL">Menu Dọc (Sidebar)</SelectItem>
                <SelectItem value="FOOTER">Menu Chân trang (Footer)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editingMenu.type === "CATEGORY" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="categorySelect" className="text-right font-bold text-sm text-slate-700">
                Chuyên mục
              </Label>
              <Select
                value={editingMenu.referenceId || "NONE"}
                onValueChange={(val) => {
                  setEditingMenu({
                    ...editingMenu,
                    referenceId: val === "NONE" ? undefined : val,
                    link: val === "NONE" ? "" : `/tin-tuc?category=${val}`
                  });
                }}
              >
                <SelectTrigger id="categorySelect" className="col-span-3 rounded-lg">
                  <SelectValue placeholder="Chọn chuyên mục bài viết..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">--- Chọn chuyên mục ---</SelectItem>
                  {dynamicCategoriesList.map((cat: any) => (
                    <SelectItem key={cat.id || cat.slug} value={cat.slug || cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {editingMenu.type === "STATIC_PAGE" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold text-sm text-slate-700">
                Cấu hình hệ thống
              </Label>
              <div className="col-span-3 bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700">
                Tự động liên kết đến phân hệ <strong>Hệ thống quản lý Văn bản pháp quy & Quyết định công bố</strong> của Cổng thông tin (Đường dẫn: <code>/van-ban</code>).
              </div>
            </div>
          )}

          {editingMenu.type === "UNIT" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitSelect" className="text-right font-bold text-sm text-slate-700">
                Chọn Đơn vị
              </Label>
              <Select
                value={editingMenu.referenceId || "NONE"}
                onValueChange={(val) => {
                  setEditingMenu({
                    ...editingMenu,
                    referenceId: val === "NONE" ? undefined : val,
                    link: val === "NONE" ? "" : `/gioi-thieu-don-vi/${val}`
                  });
                }}
              >
                <SelectTrigger id="unitSelect" className="col-span-3 rounded-lg">
                  <SelectValue placeholder="Chọn đơn vị giới thiệu từ CSDL Đơn vị..." />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  <SelectItem value="NONE">--- Chọn đơn vị ---</SelectItem>
                  {dynamicUnitsList.map((unit: any) => (
                    <SelectItem key={unit.id} value={unit.id.toString()}>
                      {unit.name} ({unit.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {editingMenu.type === "POST" && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right font-bold text-sm text-slate-700 mt-2">
                Bài viết / Trang tĩnh
              </Label>
              <div className="col-span-3 space-y-2">
                {/* Thanh tìm kiếm bài viết nhanh */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    className="pl-9 rounded-lg text-xs"
                    placeholder="Tìm kiếm bài viết..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                  />
                </div>

                <Select
                  value={
                    dynamicPosts.find(
                      (p) => p.slug === editingMenu.referenceId || p.id === editingMenu.referenceId
                    )
                      ? (dynamicPosts.find(
                        (p) => p.slug === editingMenu.referenceId || p.id === editingMenu.referenceId
                      )?.slug ||
                        dynamicPosts.find(
                          (p) => p.slug === editingMenu.referenceId || p.id === editingMenu.referenceId
                        )?.id)
                      : (editingMenu.referenceId || "NONE")
                  }
                  onValueChange={(val) => {
                    setEditingMenu({
                      ...editingMenu,
                      referenceId: val === "NONE" ? undefined : val,
                      link: val === "NONE" ? "" : `/trang/${val}`
                    });
                  }}
                >
                  <SelectTrigger className="rounded-lg text-xs">
                    <SelectValue placeholder="Chọn bài viết từ danh sách..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[220px]">
                    <SelectItem value="NONE">--- Chọn bài viết ---</SelectItem>
                    {dynamicPosts
                      .filter((p) => {
                        if (!postSearch) return true;
                        return p.title.toLowerCase().includes(postSearch.toLowerCase());
                      })
                      .map((p) => (
                        <SelectItem key={p.id} value={p.slug || p.id} className="text-xs">
                          <Text as="span" className="font-semibold block text-slate-700 max-w-[280px] truncate">
                            {p.title}
                          </Text>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {editingMenu.referenceId && (
                  <Text className="text-[11px] text-muted-foreground bg-slate-50 border px-2 py-1 rounded-md font-mono truncate">
                    Slug liên kết: {editingMenu.referenceId}
                  </Text>
                )}
              </div>
            </div>
          )}

          {editingMenu.type === "URL" && editingMenu.link?.startsWith("/tuy-bien/") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customPageSelect" className="text-right font-bold text-sm text-slate-700">
                Trang thiết kế
              </Label>
              <Select
                value={editingMenu.link.replace("/tuy-bien/", "") || "NONE"}
                onValueChange={(val) => {
                  setEditingMenu({
                    ...editingMenu,
                    type: "URL",
                    referenceId: val === "NONE" ? undefined : val,
                    link: val === "NONE" ? "/tuy-bien/" : `/tuy-bien/${val}`
                  });
                }}
              >
                <SelectTrigger id="customPageSelect" className="col-span-3 rounded-lg">
                  <SelectValue placeholder="Chọn trang đã thiết kế trực quan..." />
                </SelectTrigger>
                <SelectContent className="max-h-[220px]">
                  <SelectItem value="NONE">--- Chọn trang ---</SelectItem>
                  {customPageList.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title?.vi || p.title || p.id} ({p.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {editingMenu.type === "URL" && !editingMenu.link?.startsWith("/tuy-bien/") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right font-bold text-sm text-slate-700">
                Đường dẫn liên kết
              </Label>
              <Input
                id="link"
                className="col-span-3 font-mono text-sm rounded-lg"
                placeholder="Ví dụ: / hoặc https://chinhphu.vn"
                value={editingMenu.link || ""}
                onChange={(e) =>
                  setEditingMenu({ ...editingMenu, link: e.target.value, referenceId: undefined })
                }
              />
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="parentId" className="text-right font-bold text-sm text-slate-700">
              Menu cha
            </Label>
            <Select
              value={editingMenu.parentId || "NONE"}
              onValueChange={(v) =>
                setEditingMenu({
                  ...editingMenu,
                  parentId: v === "NONE" ? null : v,
                })
              }
            >
              <SelectTrigger className="col-span-3 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Không có (Menu gốc)</SelectItem>
                {menus
                  .filter((m) => m.id !== editingMenu.id)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order" className="text-right font-bold text-sm text-slate-700">
              Thứ tự
            </Label>
            <Input
              id="order"
              type="number"
              className="col-span-1 rounded-lg"
              value={editingMenu.order || 0}
              onChange={(e) =>
                setEditingMenu({
                  ...editingMenu,
                  order: parseInt(e.target.value) || 0,
                })
              }
            />

            <Label htmlFor="target" className="text-right font-bold text-sm text-slate-700">
              Đích đến
            </Label>
            <Select
              value={editingMenu.target}
              onValueChange={(v) => setEditingMenu({ ...editingMenu, target: v })}
            >
              <SelectTrigger className="col-span-1 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Tại trang</SelectItem>
                <SelectItem value="_blank">Tab mới</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
            <div className="col-span-3 flex flex-col">
              <Label className="font-bold text-sm text-slate-700">Trạng thái hiển thị</Label>
              <Text className="text-[10px] text-muted-foreground italic">
                Cho phép người dân nhìn thấy mục menu này trên Portal.
              </Text>
            </div>
            <div className="flex justify-end">
              <Switch
                checked={editingMenu.isActive}
                onCheckedChange={(v) =>
                  setEditingMenu({ ...editingMenu, isActive: v })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 border-t rounded-b-lg">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleLocalSave}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px] shadow-md shadow-blue-200"
          >
            {editingMenu.id ? "Cập nhật" : "Lưu Menu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
