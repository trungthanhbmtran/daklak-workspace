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
import { Settings2, Sparkles, Loader2, Search, Link } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/features/system-admin/categories/api";
import { organizationApi } from "@/features/system-admin/organization/api";
import { postsApi } from "../../api";

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

  // Tải danh sách chuyên mục động từ API
  const { data: dynamicCategories } = useQuery({
    queryKey: ["categories-for-menu"],
    queryFn: async () => {
      const res = await categoryApi.fetchAll();
      return res || [];
    },
    enabled: isOpen,
  });

  // Tải danh sách bài viết động từ API
  const { data: dynamicPostsRes } = useQuery({
    queryKey: ["posts-for-menu"],
    queryFn: async () => {
      const res = await postsApi.getPosts({ page: 1, limit: 100 });
      return res?.data || [];
    },
    enabled: isOpen,
  });

  // Tải danh sách đơn vị từ CSDL Đơn vị (HRM)
  const { data: dynamicUnitsRes } = useQuery({
    queryKey: ["organization-units-for-menu"],
    queryFn: async () => {
      const res = await organizationApi.getTree();
      // Hàm đệ quy làm phẳng danh sách các Đơn vị
      const flattenUnits = (nodes: any[]): any[] => {
        let result: any[] = [];
        for (const node of nodes) {
          result.push({ id: node.id, name: node.name, code: node.code });
          if (node.children && node.children.length > 0) {
            result = result.concat(flattenUnits(node.children));
          }
        }
        return result;
      };
      return flattenUnits(res || []);
    },
    enabled: isOpen,
  });

  const dynamicCategoriesList = dynamicCategories || [];
  const dynamicPosts = (dynamicPostsRes || []) as Post[];
  const dynamicUnitsList = dynamicUnitsRes || [];

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

    const translateApi = async (text: string, targetLang: string) => {
      if (!text.trim()) return "";
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error("Translation failed");
        const json = await res.json();
        return json[0].map((item: any) => item[0]).join('');
      } catch (error) {
        console.error("Auto translate error:", error);
        return "";
      }
    };

    setIsTranslating(true);
    toast.promise(
      (async () => {
        const [translatedName, translatedDesc] = await Promise.all([
          translateApi(sourceName, langCode),
          translateApi(sourceDesc, langCode)
        ]);

        const newTranslations = { ...(editingMenu?.translations || {}) };
        if (!newTranslations[langCode]) newTranslations[langCode] = {};
        
        if (translatedName) newTranslations[langCode].name = translatedName;
        if (translatedDesc) newTranslations[langCode].description = translatedDesc;

        setEditingMenu(prev => {
          if (!prev) return null;
          return {
            ...prev,
            translations: newTranslations
          };
        });
      })(),
      {
        loading: `Đang dịch sang ${langCode.toUpperCase()}...`,
        success: `Đã dịch thành công sang ${langCode.toUpperCase()}!`,
        error: "Không thể tự động dịch, vui lòng thử lại.",
      }
    );
    setIsTranslating(false);
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
      <DialogContent className="max-w-xl rounded-2xl border p-6 shadow-2xl">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600 animate-spin-slow" />
            <DialogTitle className="text-lg font-extrabold text-slate-800">
              {editingMenu.id ? "Cập nhật mục Menu" : "Thiết lập Menu mới"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 mt-1">
            Cấu hình nhãn hiển thị và định tuyến liên kết cho Portal của bạn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {/* PHÂN HỆ 1: NHÃN HIỂN THỊ (MULTILINGUAL LABELS) */}
          <div className="space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              1. Nhãn hiển thị (Nhãn Menu)
            </span>
            <Tabs defaultValue="vi" value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
              <TabsList
                className="grid w-full mb-3 bg-slate-100 p-1 rounded-lg"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(languages.length, 1)}, minmax(0, 1fr))`,
                }}
              >
                {languages.length > 0 ? (
                  languages.map((lang) => (
                    <TabsTrigger key={lang.code} value={lang.code} className="font-bold text-xs py-1.5 rounded-md">
                      {lang.name}
                    </TabsTrigger>
                  ))
                ) : (
                  <TabsTrigger value="vi" className="font-bold text-xs">Tiếng Việt</TabsTrigger>
                )}
              </TabsList>

              {languages.map((lang) => (
                <TabsContent key={lang.code} value={lang.code} className="space-y-3 animate-fadeIn">
                  {lang.code !== "vi" && (
                    <div className="flex justify-end -mt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTranslateAllFields(lang.code)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold gap-1 px-2 h-7 transition-all"
                        disabled={isTranslating}
                      >
                        {isTranslating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                        Tự động dịch sang {lang.name}
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor={`name-${lang.code}`}
                      className={`font-bold text-xs ${
                        lang.code !== "vi" ? "text-blue-600" : "text-slate-700"
                      }`}
                    >
                      Tên mục Menu ({lang.code.toUpperCase()}) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`name-${lang.code}`}
                      className={`rounded-lg text-sm ${
                        lang.code !== "vi" ? "border-blue-100 focus:border-blue-300" : ""
                      }`}
                      placeholder={`Ví dụ: Giới thiệu, Tin tức...`}
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
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor={`desc-${lang.code}`}
                      className="font-medium text-xs text-slate-500"
                    >
                      Mô tả bổ sung
                    </Label>
                    <Textarea
                      id={`desc-${lang.code}`}
                      className="rounded-lg text-xs resize-none"
                      rows={2}
                      placeholder="Mô tả ngắn hiển thị khi di chuột qua..."
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
                <TabsContent value="vi" className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className="font-bold text-xs text-slate-700">
                      Tên mục Menu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      className="rounded-lg text-sm"
                      placeholder="Ví dụ: Giới thiệu, Tin tức..."
                      value={editingMenu.name || ""}
                      onChange={(e) =>
                        setEditingMenu({ ...editingMenu, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="description" className="font-medium text-xs text-slate-500">
                      Mô tả bổ sung
                    </Label>
                    <Textarea
                      id="description"
                      className="rounded-lg text-xs resize-none"
                      rows={2}
                      placeholder="Mô tả ngắn..."
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
          </div>

          {/* PHÂN HỆ 2: LIÊN KẾT & NGUỒN DỮ LIỆU (THE PATH FINDER PANEL) */}
          <div className="space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              2. Định tuyến & Nguồn dữ liệu liên kết
            </span>
            <div className="border border-slate-200/80 bg-slate-50/50 p-4 rounded-xl space-y-4">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm">
                <Link className="w-4 h-4 text-blue-500" />
                <span>Nguồn liên kết & Dữ liệu đích</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="type" className="font-semibold text-xs text-slate-600">
                  Phân loại mục Menu
                </Label>
                <Select
                  value={editingMenu.type}
                  onValueChange={(v) =>
                    setEditingMenu({
                      ...editingMenu,
                      type: v as PortalMenu["type"],
                      referenceId: undefined,
                      link: v === "URL" ? "" : editingMenu.link,
                    })
                  }
                >
                  <SelectTrigger className="rounded-lg text-xs bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URL">🔗 Đường dẫn tự do (URL)</SelectItem>
                    <SelectItem value="CATEGORY">📰 Tin tức (Chuyên mục bài viết)</SelectItem>
                    <SelectItem value="POST">📝 Trang tĩnh tự thiết kế (Bài viết)</SelectItem>
                    <SelectItem value="UNIT">🏢 Giới thiệu đơn vị (CSDL Đơn vị)</SelectItem>
                    <SelectItem value="STATIC_PAGE">⚙️ Trang hệ thống định sẵn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingMenu.type === "CATEGORY" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <Label htmlFor="categorySelect" className="font-semibold text-xs text-slate-600">
                    Chọn Chuyên mục Tin tức
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
                    <SelectTrigger id="categorySelect" className="rounded-lg text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Chọn chuyên mục..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">--- Chọn chuyên mục tin tức ---</SelectItem>
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
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <Label htmlFor="staticPageSelect" className="font-semibold text-xs text-slate-600">
                    Chọn Trang hệ thống
                  </Label>
                  <Select
                    value={editingMenu.referenceId || "NONE"}
                    onValueChange={(val) => {
                      setEditingMenu({
                        ...editingMenu,
                        referenceId: val === "NONE" ? undefined : val,
                        link: val === "NONE" ? "" : `/${val}`
                      });
                    }}
                  >
                    <SelectTrigger id="staticPageSelect" className="rounded-lg text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Chọn trang..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">--- Chọn trang hệ thống ---</SelectItem>
                      <SelectItem value="gioi-thieu">Giới thiệu chung</SelectItem>
                      <SelectItem value="lien-he">Liên hệ & Bản đồ</SelectItem>
                      <SelectItem value="thu-tuc">Thủ tục hành chính (Một cửa)</SelectItem>
                      <SelectItem value="tuong-tac">Hỏi đáp & Góp ý ý kiến</SelectItem>
                      <SelectItem value="van-ban">Văn bản pháp quy & Quyết định công bố</SelectItem>
                      <SelectItem value="cong-khai-tai-chinh">Công khai tài chính (Bản PDF ký số)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingMenu.type === "UNIT" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <Label htmlFor="unitSelect" className="font-semibold text-xs text-slate-600">
                    Chọn Đơn vị Hành chính
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
                    <SelectTrigger id="unitSelect" className="rounded-lg text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Chọn đơn vị hành chính..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
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
                <div className="space-y-2 animate-fadeIn">
                  <Label className="font-semibold text-xs text-slate-600 block">
                    Bài viết hoặc Trang tĩnh tự thiết kế
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      className="pl-8 rounded-lg text-xs bg-white border-slate-200 h-8"
                      placeholder="Gõ từ khóa để tìm nhanh tiêu đề bài viết..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                    />
                  </div>
                  
                  <Select
                    value={editingMenu.referenceId || "NONE"}
                    onValueChange={(val) => {
                      setEditingMenu({
                        ...editingMenu,
                        referenceId: val === "NONE" ? undefined : val,
                        link: val === "NONE" ? "" : `/tin-tuc/${val}`
                      });
                    }}
                  >
                    <SelectTrigger className="rounded-lg text-xs bg-white border-slate-200">
                      <SelectValue placeholder="Bấm để chọn bài viết đã thiết kế..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectItem value="NONE">--- Chọn bài viết ---</SelectItem>
                      {dynamicPosts
                        .filter((p) => {
                          if (!postSearch) return true;
                          return p.title.toLowerCase().includes(postSearch.toLowerCase());
                        })
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            <span className="font-semibold block text-slate-700 max-w-[340px] truncate">
                              {p.title}
                            </span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingMenu.type === "URL" && (
                <div className="flex flex-col gap-1.5 animate-fadeIn">
                  <Label htmlFor="link" className="font-semibold text-xs text-slate-600">
                    Địa chỉ liên kết ngoài hoặc trong hệ thống (URL)
                  </Label>
                  <Input
                    id="link"
                    className="font-mono text-xs rounded-lg bg-white border-slate-200"
                    placeholder="Ví dụ: / hoặc https://chinhphu.vn"
                    value={editingMenu.link || ""}
                    onChange={(e) =>
                      setEditingMenu({ ...editingMenu, link: e.target.value, referenceId: undefined })
                    }
                  />
                </div>
              )}

              {/* Bản xem trước đường dẫn liên kết (Link Preview Badge) */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center justify-between transition-all">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-600 block">Đường dẫn đích (Client Route)</span>
                  <code className="text-xs font-mono font-bold text-slate-700 break-all">
                    {editingMenu.link || "(Chưa có liên kết)"}
                  </code>
                </div>
                {editingMenu.referenceId && (
                  <span className="text-[9px] bg-slate-200/70 border border-slate-300/50 text-slate-600 font-mono px-1.5 py-0.5 rounded shadow-sm">
                    REF: {editingMenu.referenceId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PHÂN HỆ 3: VỊ TRÍ & ĐỊNH CẤU HÌNH HIỂN THỊ (POSITIONING & DISPLAY OPTIONS) */}
          <div className="space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              3. Vị trí & Cấu hình hiển thị
            </span>
            <div className="space-y-3.5 border border-slate-100 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="parentId" className="font-bold text-xs text-slate-700">
                    Thuộc Menu cha
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
                    <SelectTrigger className="rounded-lg text-xs">
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

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="position" className="font-bold text-xs text-slate-700">
                    Khu vực hiển thị (Vị trí)
                  </Label>
                  <Select
                    value={editingMenu.position}
                    onValueChange={(v) =>
                      setEditingMenu({ ...editingMenu, position: v as any })
                    }
                  >
                    <SelectTrigger className="rounded-lg text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HORIZONTAL">Menu Ngang (Top Nav)</SelectItem>
                      <SelectItem value="VERTICAL">Menu Dọc (Sidebar)</SelectItem>
                      <SelectItem value="FOOTER">Menu Chân trang (Footer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="order" className="font-bold text-xs text-slate-700">
                    Thứ tự hiển thị
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    className="rounded-lg text-xs"
                    value={editingMenu.order || 0}
                    onChange={(e) =>
                      setEditingMenu({
                        ...editingMenu,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="target" className="font-bold text-xs text-slate-700">
                    Cách mở liên kết
                  </Label>
                  <Select
                    value={editingMenu.target}
                    onValueChange={(v) => setEditingMenu({ ...editingMenu, target: v })}
                  >
                    <SelectTrigger className="rounded-lg text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Mở trong tab hiện tại</SelectItem>
                      <SelectItem value="_blank">Mở trong tab mới (Cửa sổ mới)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="font-bold text-slate-800 text-xs block">Trạng thái kích hoạt</Label>
                  <span className="text-[10px] text-slate-400 block">
                    Hiển thị trực tiếp mục này ra ngoài màn hình chính Portal.
                  </span>
                </div>
                <Switch
                  checked={editingMenu.isActive}
                  onCheckedChange={(v) =>
                    setEditingMenu({ ...editingMenu, isActive: v })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 border-t rounded-b-2xl mt-4">
          <Button variant="ghost" onClick={onClose} className="rounded-lg text-xs font-semibold">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleLocalSave}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px] rounded-lg text-xs font-semibold shadow-md shadow-blue-200 transition-all"
          >
            {editingMenu.id ? "Cập nhật mục" : "Tạo mới mục"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
