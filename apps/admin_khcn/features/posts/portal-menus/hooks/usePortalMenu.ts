"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { PortalMenu } from "@/features/posts/types";
import { categoryApi } from "@/features/system-admin/categories/api";
import { CategoryItem } from "@/features/system-admin/categories/types";
import { toast } from "sonner";

export function usePortalMenu() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [menus, setMenus] = useState<PortalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<PortalMenu> | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [languages, setLanguages] = useState<CategoryItem[]>([]);
  const [displayLang, setDisplayLang] = useState<string>("vi");

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    fetchMenus();
    fetchLanguages();
  }, [activeTab]);

  const fetchLanguages = async () => {
    try {
      const langs = await categoryApi.fetchByGroup('LANGUAGE');
      const activeLanguages = langs.data.filter((c: any) => c.active === 1);
      const finalLanguages = activeLanguages.length > 0 ? activeLanguages : [
        { id: 1, group: 'LANGUAGE', code: 'vi', name: 'Tiếng Việt', sort: 1, active: 1 },
        { id: 2, group: 'LANGUAGE', code: 'en', name: 'English', sort: 2, active: 1 }
      ];
      setLanguages(finalLanguages);
    } catch (error) {
      console.error("Error fetching languages:", error);
      setLanguages([
        { id: 1, group: 'LANGUAGE', code: 'vi', name: 'Tiếng Việt', sort: 1, active: 1 },
        { id: 2, group: 'LANGUAGE', code: 'en', name: 'English', sort: 2, active: 1 }
      ]);
    }
  };

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await postsApi.getPortalMenus({ position: activeTab });
      setMenus(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không thể tải danh sách menu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (menu?: PortalMenu) => {
    if (menu) {
      let parsedTranslations = menu.translations || {};
      if (typeof parsedTranslations === 'string') {
        try {
          parsedTranslations = JSON.parse(parsedTranslations);
        } catch (e) {
          parsedTranslations = {};
        }
      }
      setEditingMenu({ ...menu, translations: parsedTranslations });
    } else {
      setEditingMenu({
        name: "",
        type: "URL",
        target: "_self",
        isActive: true,
        order: menus.length + 1,
        parentId: null,
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMenu(null);
  };

  const handleSave = async (updatedMenu: Partial<PortalMenu>) => {
    try {
      const payload = {
        ...updatedMenu,
        translations: updatedMenu.translations ? JSON.stringify(updatedMenu.translations) : "{}"
      };

      // Clear old fields if they exist
      delete (payload as any).nameEn;
      delete (payload as any).descriptionEn;

      if (updatedMenu.id) {
        await postsApi.updatePortalMenu(updatedMenu.id, payload);
        toast.success("Cập nhật menu thành công");
      } else {
        await postsApi.createPortalMenu(payload);
        toast.success("Thêm menu mới thành công");
      }
      setIsDialogOpen(false);
      fetchMenus();
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Lỗi khi lưu dữ liệu");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await postsApi.deletePortalMenu(id);
      toast.success("Đã xóa menu");
      fetchMenus();
    } catch {
      toast.error("Lỗi khi xóa menu");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await postsApi.updatePortalMenu(id, { isActive: !currentStatus });
      toast.success("Đã cập nhật trạng thái");
      fetchMenus();
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  return {
    activeTab,
    setActiveTab,
    menus,
    loading,
    isDialogOpen,
    setIsDialogOpen,
    isQuickSetupOpen,
    setIsQuickSetupOpen,
    editingMenu,
    setEditingMenu,
    expandedItems,
    toggleExpand,
    languages,
    displayLang,
    setDisplayLang,
    fetchMenus,
    handleOpenDialog,
    handleCloseDialog,
    handleSave,
    handleDelete,
    toggleActive,
  };
}
