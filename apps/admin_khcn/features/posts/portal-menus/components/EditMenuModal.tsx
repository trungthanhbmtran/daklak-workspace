"use client";

import React, { useState, useEffect } from "react";
import { PortalMenu } from "@/features/posts/types";
import { CategoryItem } from "@/features/system-admin/categories/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

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

  useEffect(() => {
    if (menu) {
      setEditingMenu({ ...menu });
    } else {
      setEditingMenu(null);
    }
    setActiveLangTab("vi");
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
                    className={`text-right font-bold text-sm ${
                      lang.code !== "vi" ? "text-blue-600" : "text-slate-700"
                    }`}
                  >
                    Tên Menu ({lang.code.toUpperCase()})
                  </Label>
                  <Input
                    id={`name-${lang.code}`}
                    className={`col-span-3 rounded-lg ${
                      lang.code !== "vi" ? "border-blue-100 focus:border-blue-300" : ""
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
                    className={`text-right text-sm ${
                      lang.code !== "vi" ? "text-blue-600" : "text-slate-500"
                    }`}
                  >
                    Mô tả
                  </Label>
                  <Textarea
                    id={`desc-${lang.code}`}
                    className={`col-span-3 rounded-lg resize-none ${
                      lang.code !== "vi" ? "border-blue-100" : ""
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
              value={editingMenu.type}
              onValueChange={(v) =>
                setEditingMenu({
                  ...editingMenu,
                  type: v as PortalMenu["type"],
                })
              }
            >
              <SelectTrigger className="col-span-3 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="URL">Đường dẫn tự do (URL)</SelectItem>
                <SelectItem value="CATEGORY">Liên kết Chuyên mục</SelectItem>
                <SelectItem value="POST">Liên kết Bài viết</SelectItem>
                <SelectItem value="STATIC_PAGE">Trang tĩnh hệ thống</SelectItem>
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right font-bold text-sm text-slate-700">
              Đường dẫn / ID
            </Label>
            <Input
              id="link"
              className="col-span-3 font-mono text-sm rounded-lg"
              placeholder="/tin-tuc hoặc ID bài viết"
              value={editingMenu.link || ""}
              onChange={(e) =>
                setEditingMenu({ ...editingMenu, link: e.target.value })
              }
            />
          </div>

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
              <p className="text-[10px] text-muted-foreground italic">
                Cho phép người dân nhìn thấy mục menu này trên Portal.
              </p>
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
