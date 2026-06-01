"use client";

import { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { Category } from "@/features/posts/types";
import { toast } from "sonner";

interface UseQuickSetupProps {
  activeTab: string;
  menusLength: number;
  onSuccess: () => void;
  onClose: () => void;
}

export function useQuickSetup({ activeTab, menusLength, onSuccess, onClose }: UseQuickSetupProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [docGroups, setDocGroups] = useState<any[]>([]);
  const [complianceModules, setComplianceModules] = useState<any[]>([]);
  const [systemPages, setSystemPages] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchQuickSetupData();
    fetchCategories();
  }, []);

  const fetchQuickSetupData = async () => {
    try {
      const result = await postsApi.getQuickSetupData();
      if (!result || !result.data) return;

      const { docGroups, complianceModules, defaultPages } = result.data;
      setDocGroups(Array.isArray(docGroups) ? docGroups : []);
      setComplianceModules(Array.isArray(complianceModules) ? complianceModules : []);
      setSystemPages(Array.isArray(defaultPages) ? defaultPages : []);
    } catch (error) {
      console.error("Error fetching quick setup data:", error);
      toast.error("Không thể tải dữ liệu thiết lập từ hệ thống");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await postsApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const toggleCategorySelection = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const importSelectedCategories = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Vui lòng chọn ít nhất một chuyên mục");
      return;
    }

    setIsImporting(true);
    try {
      const rootCats = categories.filter(c => selectedCategories.includes(c.id));
      for (const cat of rootCats) {
        await importCategoryTree(cat, false);
      }
      toast.success(`Đã nhập xong ${selectedCategories.length} cây danh mục`);
      setSelectedCategories([]);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Lỗi khi nhập danh mục hàng loạt");
    } finally {
      setIsImporting(false);
    }
  };

  const importCategoryTree = async (rootCategory: Category, finalize = true) => {
    if (finalize) setIsImporting(true);
    try {
      const rootMenuRes = await postsApi.createPortalMenu({
        name: rootCategory.name,
        translations: typeof rootCategory.translations === 'string'
          ? rootCategory.translations
          : JSON.stringify(rootCategory.translations || {}),
        type: "CATEGORY",
        referenceId: rootCategory.id,
        link: `/chuyen-muc/${rootCategory.slug}`,
        isActive: true,
        order: menusLength + 1,
        target: "_self",
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
      });
      const rootMenu = rootMenuRes.data;

      if (rootCategory.children && rootCategory.children.length > 0 && rootMenu) {
        await importChildren(rootCategory.children, rootMenu.id, `/chuyen-muc/${rootCategory.slug}`);
      }

      if (finalize) {
        toast.success(`Đã nhập xong cây danh mục "${rootCategory.name}"`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      if (finalize) toast.error("Lỗi khi nhập danh mục");
      throw error;
    } finally {
      if (finalize) setIsImporting(false);
    }
  };

  const importChildren = async (children: Category[], parentMenuId: string, parentPath: string) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childMenuRes = await postsApi.createPortalMenu({
        name: child.name,
        translations: typeof child.translations === 'string'
          ? child.translations
          : JSON.stringify(child.translations || {}),
        type: "CATEGORY",
        referenceId: child.id,
        parentId: parentMenuId,
        link: `${parentPath}/${child.slug}`,
        isActive: true,
        order: i + 1,
        target: "_self",
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
      });
      const childMenu = childMenuRes.data;

      if (child.children && child.children.length > 0 && childMenu) {
        await importChildren(child.children, childMenu.id, `${parentPath}/${child.slug}`);
      }
    }
  };

  const importDocumentGroup = async (group: { id: string, name: string }) => {
    setIsImporting(true);
    try {
      const pathMap: Record<string, string> = {
        'INCOMING': '/van-ban/den',
        'OUTGOING': '/van-ban/di',
        'FINANCE': '/van-ban/tai-chinh',
        'CONSULTATION': '/lay-y-kien',
      };

      const groupMenuRes = await postsApi.createPortalMenu({
        name: group.name,
        translations: JSON.stringify({ en: { name: group.name } }),
        type: "URL",
        link: pathMap[group.id] || "/van-ban",
        isActive: true,
        order: menusLength + 1,
        target: "_self",
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
      });
      const groupMenu = groupMenuRes.data;

      const { data: docCategories } = await postsApi.getCategories({ group: group.id });

      for (let i = 0; i < docCategories.length; i++) {
        const cat = docCategories[i];
        await postsApi.createPortalMenu({
          name: cat.name,
          translations: cat.translations ? JSON.stringify(cat.translations) : "{}",
          type: "URL",
          parentId: groupMenu?.id,
          link: `${pathMap[group.id] || "/van-ban"}?category=${cat.slug}`,
          isActive: true,
          order: i + 1,
          target: "_self",
          position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
        });
      }

      toast.success(`Đã thiết lập menu cho ${group.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Lỗi khi thiết lập danh mục văn bản");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportCompliance = async (module: any) => {
    setIsImporting(true);
    try {
      await postsApi.createPortalMenu({
        name: module.name,
        link: module.path,
        type: "URL",
        order: menusLength + 1,
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any,
        isActive: true,
        target: "_self"
      });
      toast.success(`Đã thêm mục tuân thủ: ${module.name}`);
      onSuccess();
    } catch {
      toast.error("Không thể thêm mục tuân thủ");
    } finally {
      setIsImporting(false);
    }
  };

  const addDefaultPages = async () => {
    if (systemPages.length === 0) {
      toast.error("Không tìm thấy dữ liệu trang hệ thống");
      return;
    }
    setIsImporting(true);
    try {
      for (const page of systemPages) {
        await postsApi.createPortalMenu({
          name: page.name,
          type: "URL",
          link: page.path,
          isActive: true,
          order: page.order,
          target: "_self",
          position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
        });
      }
      toast.success("Đã thêm các trang mặc định");
      onSuccess();
      onClose();
    } catch {
      toast.error("Lỗi khi thêm trang");
    } finally {
      setIsImporting(false);
    }
  };

  return {
    categories,
    docGroups,
    complianceModules,
    systemPages,
    isImporting,
    selectedCategories,
    toggleCategorySelection,
    importSelectedCategories,
    importCategoryTree,
    importDocumentGroup,
    handleImportCompliance,
    addDefaultPages,
  };
}
