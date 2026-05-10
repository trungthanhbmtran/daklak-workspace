"use client";

import React, { useState, useEffect, Fragment } from "react";
import { postsApi } from "@/features/posts/api";
import { PortalMenu, Category } from "@/features/posts/types";
import { categoryApi } from "@/features/system-admin/categories/api";
import { CategoryItem } from "@/features/system-admin/categories/types";
import { Button } from "@/components/ui/button";
import {
  Plus, Edit, Trash2, Layers, FileText, ExternalLink,
  ChevronRight, Zap, Globe, Layout, Settings2,
  ArrowRight, Loader2, Sparkles, FolderTree, BookOpen, ShieldCheck,
  Languages
} from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PortalMenuPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [menus, setMenus] = useState<PortalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<PortalMenu> | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // States for Quick Setup
  const [categories, setCategories] = useState<Category[]>([]);
  const [docGroups, setDocGroups] = useState<any[]>([]);
  const [complianceModules, setComplianceModules] = useState<any[]>([]);
  const [systemPages, setSystemPages] = useState<any[]>([]);
  const [languages, setLanguages] = useState<CategoryItem[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<string>("vi");
  const [isImporting, setIsImporting] = useState(false);
  const [displayLang, setDisplayLang] = useState<string>("vi");

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleImportCompliance = async (module: any) => {
    setIsImporting(true);
    try {
      await postsApi.createPortalMenu({
        name: module.name,
        link: module.path,
        type: "URL",
        order: menus.length + 1,
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any,
        isActive: true,
        target: "_self"
      });
      toast.success(`Đã thêm mục tuân thủ: ${module.name}`);
      fetchMenus();
    } catch {
      toast.error("Không thể thêm mục tuân thủ");
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchQuickSetupData();
    fetchCategories();
    fetchLanguages();
  }, [activeTab]);

  const fetchLanguages = async () => {
    try {
      const allCategories = await categoryApi.fetchAll();
      const langs = allCategories.filter(c => c.group === 'LANGUAGE' && c.active === 1);
      const activeLanguages = langs.length > 0 ? langs : [
        { id: 1, group: 'LANGUAGE', code: 'vi', name: 'Tiếng Việt', sort: 1, active: 1 },
        { id: 2, group: 'LANGUAGE', code: 'en', name: 'English', sort: 2, active: 1 }
      ];
      setLanguages(activeLanguages);
      if (activeLanguages.length > 0 && !activeLanguages.find(l => l.code === 'vi')) {
        setActiveLangTab(activeLanguages[0].code);
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      setLanguages([
        { id: 1, group: 'LANGUAGE', code: 'vi', name: 'Tiếng Việt', sort: 1, active: 1 },
        { id: 2, group: 'LANGUAGE', code: 'en', name: 'English', sort: 2, active: 1 }
      ]);
    }
  };

  const fetchQuickSetupData = async () => {
    try {
      console.log("Fetching quick setup data...");
      const result = await postsApi.getQuickSetupData();
      console.log("Quick setup data received:", result);

      if (!result) {
        console.warn("Quick setup data is empty");
        return;
      }

      const { docGroups, complianceModules, defaultPages } = result;

      setDocGroups(Array.isArray(docGroups) ? docGroups : []);
      setComplianceModules(Array.isArray(complianceModules) ? complianceModules : []);
      setSystemPages(Array.isArray(defaultPages) ? defaultPages : []);
    } catch (error) {
      console.error("Error fetching quick setup data:", error);
      toast.error("Không thể tải dữ liệu thiết lập từ hệ thống");
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

  const fetchCategories = async () => {
    try {
      const { data } = await postsApi.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };


  const filteredMenus = menus.filter(m => {
    if (activeTab === "ALL") return true;
    return m.position === activeTab;
  });

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

  const getTranslation = (langCode: string, field: 'name' | 'description') => {
    if (!editingMenu?.translations) return "";
    return editingMenu.translations[langCode]?.[field] || "";
  };

  const updateTranslation = (langCode: string, field: 'name' | 'description', value: string) => {
    const newTranslations = { ...(editingMenu?.translations || {}) };
    if (!newTranslations[langCode]) newTranslations[langCode] = {};
    newTranslations[langCode][field] = value;
    setEditingMenu({ ...editingMenu, translations: newTranslations });
  };

  const getMenuTranslation = (menu: PortalMenu, langCode: string) => {
    if (langCode === 'vi') {
      return { name: menu.name, description: menu.description || "" };
    }
    let parsedTranslations = menu.translations || {};
    if (typeof parsedTranslations === 'string') {
      try {
        parsedTranslations = JSON.parse(parsedTranslations);
      } catch (e) {
        parsedTranslations = {};
      }
    }
    const trans = parsedTranslations[langCode];
    return {
      name: trans?.name || "",
      description: trans?.description || ""
    };
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

        setEditingMenu({
          ...editingMenu,
          translations: newTranslations
        });
      })(),
      {
        loading: `Đang dịch sang ${langCode.toUpperCase()}...`,
        success: `Đã dịch thành công sang ${langCode.toUpperCase()}!`,
        error: "Không thể tự động dịch, vui lòng thử lại.",
      }
    );
  };

  const handleSave = async () => {
    if (!editingMenu?.name) {
      toast.error("Vui lòng nhập tên menu");
      return;
    }

    try {
      const payload = {
        ...editingMenu,
        translations: editingMenu.translations ? JSON.stringify(editingMenu.translations) : "{}"
      };

      // Clear old fields if they exist
      delete (payload as any).nameEn;
      delete (payload as any).descriptionEn;

      if (editingMenu.id) {
        await postsApi.updatePortalMenu(editingMenu.id, payload);
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
    if (!confirm("Bạn có chắc chắn muốn xóa menu này?")) return;
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

  // --- Quick Setup Logic ---

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
      setIsQuickSetupOpen(false);
      setSelectedCategories([]);
      fetchMenus();
    } catch (error) {
      toast.error("Lỗi khi nhập danh mục hàng loạt");
    } finally {
      setIsImporting(false);
    }
  };

  const importCategoryTree = async (rootCategory: Category, finalize = true) => {
    if (finalize) setIsImporting(true);
    try {
      // Step 1: Create the parent menu for this category
      const rootMenu = await postsApi.createPortalMenu({
        name: rootCategory.name,
        translations: typeof rootCategory.translations === 'string'
          ? rootCategory.translations
          : JSON.stringify(rootCategory.translations || {}),
        type: "CATEGORY",
        referenceId: rootCategory.id,
        link: `/chuyen-muc/${rootCategory.slug}`,
        isActive: true,
        order: menus.length + 1,
        target: "_self",
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
      });

      // Step 2: Recursively import children if any
      if (rootCategory.children && rootCategory.children.length > 0) {
        await importChildren(rootCategory.children, rootMenu.id, `/chuyen-muc/${rootCategory.slug}`);
      }

      if (finalize) {
        toast.success(`Đã nhập xong cây danh mục "${rootCategory.name}"`);
        setIsQuickSetupOpen(false);
        fetchMenus();
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
      const childMenu = await postsApi.createPortalMenu({
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

      if (child.children && child.children.length > 0) {
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

      const groupMenu = await postsApi.createPortalMenu({
        name: group.name,
        translations: JSON.stringify({ en: { name: group.name } }),
        type: "URL",
        link: pathMap[group.id] || "/van-ban",
        isActive: true,
        order: menus.length + 1,
        target: "_self",
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
      });

      const { data: docCategories } = await postsApi.getCategories({ group: group.id });

      for (let i = 0; i < docCategories.length; i++) {
        const cat = docCategories[i];
        await postsApi.createPortalMenu({
          name: cat.name,
          translations: cat.translations ? JSON.stringify(cat.translations) : "{}",
          type: "URL",
          parentId: groupMenu.id,
          link: `${pathMap[group.id] || "/van-ban"}?category=${cat.slug}`,
          isActive: true,
          order: i + 1,
          target: "_self",
          position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
        });
      }

      toast.success(`Đã thiết lập menu cho ${group.name}`);
      setIsQuickSetupOpen(false);
      fetchMenus();
    } catch (error) {
      toast.error("Lỗi khi thiết lập danh mục văn bản");
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
      setIsQuickSetupOpen(false);
      fetchMenus();
    } catch {
      toast.error("Lỗi khi thêm trang");
    } finally {
      setIsImporting(false);
    }
  };

  // Render Table Rows Recursively for hierarchy
  const renderMenuRows = (items: PortalMenu[] | undefined | null, depth = 0): React.ReactNode => {
    if (!items || !Array.isArray(items)) return null;
    return items.map((menu: PortalMenu) => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = !!expandedItems[menu.id];

      const trans = getMenuTranslation(menu, displayLang);
      const isTranslated = displayLang === 'vi' || !!trans.name;
      const displayName = trans.name || menu.name;
      const displayDescription = trans.description || menu.description;

      return (
        <Fragment key={menu.id}>
          <TableRow className={`${depth > 0 ? "bg-slate-50/30" : ""} hover:bg-slate-50 transition-colors`}>
            <TableCell className="font-medium p-0">
              <div className="flex items-center min-h-[52px]" style={{ paddingLeft: `${depth * 28 + 12}px` }}>
                <div className="flex items-center gap-2 flex-1">
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 hover:bg-blue-100 text-blue-600 transition-transform duration-200"
                      onClick={() => toggleExpand(menu.id)}
                      style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="w-6" /> // Spacer for alignment
                  )}

                  {depth > 0 && <div className="w-4 h-[2px] bg-slate-200 -ml-2 mr-1" />}

                  <div className={`p-1.5 rounded ${!menu.isActive ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'}`}>
                    {menu.type === 'CATEGORY' && <Layers className="w-3.5 h-3.5" />}
                    {menu.type === 'POST' && <FileText className="w-3.5 h-3.5" />}
                    {menu.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                    {menu.type === 'STATIC_PAGE' && <Layout className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col">
                    <span className={`text-sm ${!menu.isActive ? "text-slate-400 line-through" : "text-slate-800 font-semibold"} ${!isTranslated ? "italic text-slate-400 font-medium" : ""}`}>
                      {displayName}
                      {!isTranslated && (
                        <span className="text-[9px] text-amber-600 font-bold ml-1.5 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase" title="Mục này chưa được cấu hình bản dịch">
                          Chưa dịch
                        </span>
                      )}
                    </span>
                    {displayDescription && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[200px] italic">
                        {displayDescription}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center justify-center text-[9px] font-black w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 cursor-default" title="Tiếng Việt (Gốc)">
                  VI
                </span>
                {(languages.length > 0 ? languages : [{ code: 'en', name: 'English' }]).filter(l => l.code !== 'vi').map(lang => {
                  const hasTrans = !!getMenuTranslation(menu, lang.code).name;
                  return hasTrans ? (
                    <span key={lang.code} className="inline-flex items-center justify-center text-[9px] font-black w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default" title={`Đã dịch sang ${lang.name}`}>
                      {lang.code.toUpperCase()}
                    </span>
                  ) : (
                    <span key={lang.code} className="inline-flex items-center justify-center text-[9px] font-black w-5 h-5 rounded-full border border-dashed border-slate-300 bg-slate-50 text-slate-400 cursor-default" title={`Chưa dịch sang ${lang.name}`}>
                      {lang.code.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className={`text-[10px] uppercase font-bold py-0 h-5 ${menu.position === 'HORIZONTAL' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                menu.position === 'VERTICAL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                {menu.position === 'HORIZONTAL' ? 'Ngang' : menu.position === 'VERTICAL' ? 'Dọc' : 'Chân trang'}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="flex items-center w-fit gap-1 uppercase text-[9px] font-bold px-1.5 h-5 bg-white shadow-sm">
                {menu.type}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[180px]">
              <div className="flex items-center gap-1.5 text-slate-500 group">
                <span className="text-[11px] font-mono truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                  {menu.link || "—"}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600 border border-slate-200">
                {menu.order}
              </span>
            </TableCell>
            <TableCell>
              <Switch
                checked={menu.isActive}
                className="data-[state=checked]:bg-blue-600 scale-90"
                onCheckedChange={() => toggleActive(menu.id, menu.isActive)}
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => handleOpenDialog(menu)}
                  title="Chỉnh sửa"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(menu.id)}
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>

          {hasChildren && isExpanded && (
            renderMenuRows(menu.children, depth + 1)
          )}
        </Fragment>
      );
    });
  };

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Cấu hình Menu Portal</h1>
          </div>
          <p className="text-sm text-muted-foreground">Thiết lập sơ đồ điều hướng cho cổng thông tin công cộng (Người dân)</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsQuickSetupOpen(true)}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Zap className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" /> Thiết lập nhanh
          </Button>
          <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> Thêm Menu mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 py-2 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-4 flex-wrap">
              <TabsTrigger value="ALL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Tất cả</TabsTrigger>
              <TabsTrigger value="HORIZONTAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Menu Ngang</TabsTrigger>
              <TabsTrigger value="VERTICAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Menu Dọc</TabsTrigger>
              <TabsTrigger value="FOOTER" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Menu Chân trang</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-blue-600" /> Xem ngôn ngữ:
                </span>
                <Tabs value={displayLang} onValueChange={setDisplayLang} className="w-auto">
                  <TabsList className="bg-slate-100 p-0.5 h-8 gap-0.5 rounded-lg border border-slate-200">
                    {(languages.length > 0 ? languages : [{ code: 'vi', name: 'Tiếng Việt' }, { code: 'en', name: 'English' }]).map(lang => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        className="px-2.5 py-1 text-xs font-bold uppercase rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                      >
                        {lang.code}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">{menus.length} mục</Badge>
            </div>
          </div>
        </Tabs>
        <Table>
          <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[28%]">Tên hiển thị</TableHead>
              <TableHead className="w-[12%]">Bản dịch</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Loại liên kết</TableHead>
              <TableHead>Đường dẫn / Tham chiếu</TableHead>
              <TableHead className="text-center">Thứ tự</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-muted-foreground animate-pulse">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                    <span>Không tìm thấy menu nào ở vị trí này.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : renderMenuRows(filteredMenus)}
          </TableBody>
        </Table>
      </div>

      {/* QUICK SETUP DIALOG */}
      <Dialog open={isQuickSetupOpen} onOpenChange={setIsQuickSetupOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          <div className="p-6 bg-blue-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
              <DialogTitle className="text-2xl font-bold">Thiết lập Menu nhanh</DialogTitle>
            </div>
            <DialogDescription className="text-blue-100">
              Chọn các cấu trúc có sẵn để tự động tạo hệ thống menu một cách nhanh chóng.
            </DialogDescription>
          </div>

          <div className="p-6">
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4" /> Chuyên mục
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Văn bản
                </TabsTrigger>
                <TabsTrigger value="compliance" className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Tuân thủ
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center gap-2">
                  <Layout className="w-4 h-4" /> Trang hệ thống
                </TabsTrigger>
              </TabsList>

              <TabsContent value="categories" className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex gap-3 mb-4 items-center justify-between">
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 flex-shrink-0" />
                    <p>Chọn một hoặc nhiều chuyên mục. Hệ thống sẽ tự động tạo menu cho chuyên mục đó và toàn bộ các chuyên mục con.</p>
                  </div>
                  {selectedCategories.length > 0 && (
                    <Button
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm whitespace-nowrap"
                      onClick={importSelectedCategories}
                      disabled={isImporting}
                    >
                      {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Nhập {selectedCategories.length} mục
                    </Button>
                  )}
                </div>
                <div className="grid gap-2">
                  {categories.filter(c => !c.parentId).map(cat => (
                    <div
                      key={cat.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all group cursor-pointer ${selectedCategories.includes(cat.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      onClick={() => toggleCategorySelection(cat.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                          }`}>
                          {selectedCategories.includes(cat.id) && <Plus className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`p-2 rounded transition-colors ${selectedCategories.includes(cat.id) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'
                          }`}>
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{cat.name}</p>
                          <p className="text-[10px] text-slate-500">{cat.children?.length || 0} chuyên mục con</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`${selectedCategories.includes(cat.id) ? 'text-blue-700' : 'text-blue-600'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          importCategoryTree(cat);
                        }}
                        disabled={isImporting}
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4 mr-2" /> Nhập lẻ</>}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex gap-3 mb-4">
                  <BookOpen className="w-5 h-5 flex-shrink-0" />
                  <p>Tạo menu cho các nhóm văn bản. Hệ thống sẽ tự động thêm các loại văn bản (danh mục) thuộc nhóm này vào menu con.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {docGroups.map(group => (
                    <div key={group.id} className="flex flex-col p-4 rounded-xl border hover:border-blue-400 hover:shadow-md transition-all bg-white gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-slate-800">{group.name}</p>
                      <Button
                        size="sm"
                        className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700"
                        onClick={() => importDocumentGroup(group)}
                        disabled={isImporting}
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Thiết lập Menu"}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-sm text-emerald-800 flex gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <p>Các module bắt buộc theo Nghị định 42/2022 và Thông tư 22/2023 của Bộ TT&TT về Cổng thông tin điện tử cơ quan nhà nước.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {complianceModules.map(module => (
                    <div key={module.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded">
                          <Plus className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold">{module.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-emerald-600 px-2"
                        onClick={() => handleImportCompliance(module)}
                        disabled={isImporting}
                      >
                        {isImporting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Thêm"}
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pages" className="flex flex-col items-center justify-center py-8 gap-4 border border-dashed rounded-xl">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Layout className="w-10 h-10 text-slate-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold">Khởi tạo nhanh các trang cơ bản</p>
                  <p className="text-sm text-muted-foreground">Trang chủ, Tin tức, Tra cứu văn bản, Liên hệ...</p>
                </div>
                <Button
                  onClick={addDefaultPages}
                  className="bg-blue-600 px-8"
                  disabled={isImporting}
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                  Bắt đầu khởi tạo
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="p-6 bg-slate-50 border-t">
            <Button variant="ghost" onClick={() => setIsQuickSetupOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG FORM (CREATE/EDIT) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="w-5 h-5 text-blue-600" />
              <DialogTitle className="text-xl">{editingMenu?.id ? "Chỉnh sửa Menu" : "Thêm Menu mới"}</DialogTitle>
            </div>
            <DialogDescription>Nhập thông tin mục menu để hiển thị trên cổng thông tin.</DialogDescription>
          </DialogHeader>

          {editingMenu && (
            <div className="grid gap-4 py-4">
              <Tabs defaultValue="vi" value={activeLangTab} onValueChange={setActiveLangTab} className="w-full">
                <TabsList className={`grid w-full mb-4`} style={{ gridTemplateColumns: `repeat(${Math.max(languages.length, 1)}, minmax(0, 1fr))` }}>
                  {languages.length > 0 ? (
                    languages.map(lang => (
                      <TabsTrigger key={lang.code} value={lang.code}>
                        {lang.name}
                      </TabsTrigger>
                    ))
                  ) : (
                    <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                  )}
                </TabsList>

                {languages.map(lang => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    {lang.code !== 'vi' && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTranslateAllFields(lang.code)}
                          className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold gap-1 px-2.5 py-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          Dịch tự động từ Tiếng Việt
                        </Button>
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`name-${lang.code}`} className={`text-right font-bold ${lang.code !== 'vi' ? 'text-blue-600' : ''}`}>
                        Tên Menu ({lang.code.toUpperCase()})
                      </Label>
                      <Input
                        id={`name-${lang.code}`}
                        className={`col-span-3 rounded-lg ${lang.code !== 'vi' ? 'border-blue-100' : ''}`}
                        placeholder={`Tên bằng ${lang.name}...`}
                        value={lang.code === 'vi' ? (editingMenu.name || "") : getTranslation(lang.code, 'name')}
                        onChange={e => lang.code === 'vi'
                          ? setEditingMenu({ ...editingMenu, name: e.target.value })
                          : updateTranslation(lang.code, 'name', e.target.value)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`desc-${lang.code}`} className={`text-right ${lang.code !== 'vi' ? 'text-blue-600' : ''}`}>
                        Mô tả
                      </Label>
                      <Textarea
                        id={`desc-${lang.code}`}
                        className={`col-span-3 rounded-lg resize-none ${lang.code !== 'vi' ? 'border-blue-100' : ''}`}
                        rows={2}
                        placeholder={`Mô tả bằng ${lang.name}...`}
                        value={lang.code === 'vi' ? (editingMenu.description || "") : getTranslation(lang.code, 'description')}
                        onChange={e => lang.code === 'vi'
                          ? setEditingMenu({ ...editingMenu, description: e.target.value })
                          : updateTranslation(lang.code, 'description', e.target.value)
                        }
                      />
                    </div>
                  </TabsContent>
                ))}

                {languages.length === 0 && (
                  <TabsContent value="vi" className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right font-bold">Tên Menu</Label>
                      <Input id="name" className="col-span-3 rounded-lg" value={editingMenu.name || ""} onChange={e => setEditingMenu({ ...editingMenu, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Mô tả</Label>
                      <Textarea id="description" className="col-span-3 rounded-lg resize-none" rows={2} value={editingMenu.description || ""} onChange={e => setEditingMenu({ ...editingMenu, description: e.target.value })} />
                    </div>
                  </TabsContent>
                )}
              </Tabs>

              <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
                <Label htmlFor="type" className="text-right font-bold">Loại liên kết</Label>
                <Select value={editingMenu.type} onValueChange={v => setEditingMenu({ ...editingMenu, type: v as PortalMenu['type'] })}>
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
                <Label htmlFor="position" className="text-right font-bold">Vị trí</Label>
                <Select value={editingMenu.position} onValueChange={v => setEditingMenu({ ...editingMenu, position: v as any })}>
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
                <Label htmlFor="link" className="text-right font-bold">Đường dẫn / ID</Label>
                <Input id="link" className="col-span-3 font-mono text-sm rounded-lg" placeholder="/tin-tuc hoặc ID bài viết" value={editingMenu.link || ""} onChange={e => setEditingMenu({ ...editingMenu, link: e.target.value })} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right font-bold">Menu cha</Label>
                <Select value={editingMenu.parentId || "NONE"} onValueChange={v => setEditingMenu({ ...editingMenu, parentId: v === "NONE" ? null : v })}>
                  <SelectTrigger className="col-span-3 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Không có (Menu gốc)</SelectItem>
                    {menus.filter(m => m.id !== editingMenu.id).map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right font-bold">Thứ tự</Label>
                <Input id="order" type="number" className="col-span-1 rounded-lg" value={editingMenu.order || 0} onChange={e => setEditingMenu({ ...editingMenu, order: parseInt(e.target.value) || 0 })} />

                <Label htmlFor="target" className="text-right font-bold">Đích đến</Label>
                <Select value={editingMenu.target} onValueChange={v => setEditingMenu({ ...editingMenu, target: v })}>
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
                  <Label className="font-bold">Trạng thái hiển thị</Label>
                  <p className="text-[10px] text-muted-foreground italic">Cho phép người dân nhìn thấy mục menu này trên Portal.</p>
                </div>
                <div className="flex justify-end">
                  <Switch
                    checked={editingMenu.isActive}
                    onCheckedChange={v => setEditingMenu({ ...editingMenu, isActive: v })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="bg-slate-50 p-4 -mx-6 -mb-6 border-t rounded-b-lg">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 min-w-[120px] shadow-md shadow-blue-200">
              {editingMenu?.id ? "Cập nhật" : "Lưu Menu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
