"use client";

import React, { useState, useEffect, Fragment } from "react";
import { postsApi } from "@/features/posts/api";
import { PortalMenu, Category } from "@/features/posts/types";
import { Button } from "@/components/ui/button";
import {
  Plus, Edit, Trash2, Layers, FileText, ExternalLink,
  ChevronRight, Zap, Globe, Layout, Settings2,
  ArrowRight, Loader2, Sparkles, FolderTree, BookOpen, ShieldCheck
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

  // States for Quick Setup
  const [categories, setCategories] = useState<Category[]>([]);
  const [docGroups, setDocGroups] = useState<any[]>([]);
  const [complianceModules, setComplianceModules] = useState<any[]>([]);
  const [systemPages, setSystemPages] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportCompliance = async (module: typeof complianceModules[0]) => {
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
    fetchCategories();
    fetchQuickSetupData();
  }, [activeTab]);

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
      setEditingMenu({ ...menu });
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

  const handleSave = async () => {
    if (!editingMenu?.name) {
      toast.error("Vui lòng nhập tên menu");
      return;
    }

    try {
      if (editingMenu.id) {
        await postsApi.updatePortalMenu(editingMenu.id, editingMenu);
        toast.success("Cập nhật menu thành công");
      } else {
        await postsApi.createPortalMenu(editingMenu);
        toast.success("Thêm menu mới thành công");
      }
      setIsDialogOpen(false);
      fetchMenus();
    } catch {
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

  const importCategoryTree = async (rootCategory: Category) => {
    setIsImporting(true);
    try {
      // Step 1: Create the parent menu for this category
      const rootMenu = await postsApi.createPortalMenu({
        name: rootCategory.name,
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

      toast.success(`Đã nhập xong cây danh mục "${rootCategory.name}"`);
      setIsQuickSetupOpen(false);
      fetchMenus();
    } catch (error) {
      toast.error("Lỗi khi nhập danh mục");
    } finally {
      setIsImporting(false);
    }
  };

  const importChildren = async (children: Category[], parentMenuId: string, parentPath: string) => {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childMenu = await postsApi.createPortalMenu({
        name: child.name,
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
      // Step 1: Create a menu item for the group
      const pathMap: Record<string, string> = {
        'INCOMING': '/van-ban/den',
        'OUTGOING': '/van-ban/di',
        'FINANCE': '/van-ban/tai-chinh',
        'CONSULTATION': '/lay-y-kien',
      };

      const groupMenu = await postsApi.createPortalMenu({
        name: group.name,
        type: "URL",
        link: pathMap[group.id] || "/van-ban",
        isActive: true,
        order: menus.length + 1,
        target: "_self",
        position: activeTab === "ALL" ? "HORIZONTAL" : activeTab as any
      });

      // Step 2: Fetch categories for this document group
      const { data: docCategories } = await postsApi.getCategories({ group: group.id });

      // Step 3: Create menu items for each category
      for (let i = 0; i < docCategories.length; i++) {
        const cat = docCategories[i];
        await postsApi.createPortalMenu({
          name: cat.name,
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
    return items.map((menu: PortalMenu) => (
      <Fragment key={menu.id}>
        <TableRow className={depth > 0 ? "bg-slate-50/30" : ""}>
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              {depth > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mr-2" />}
              {menu.icon && <span className="mr-2 text-blue-500">{menu.icon}</span>}
              <span className={!menu.isActive ? "text-slate-400" : ""}>{menu.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-5">
              {menu.position === 'HORIZONTAL' ? 'Ngang' : menu.position === 'VERTICAL' ? 'Dọc' : 'Chân trang'}
            </Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="flex items-center w-fit gap-1 uppercase text-[10px] font-bold">
              {menu.type === 'CATEGORY' && <Layers className="w-3 h-3" />}
              {menu.type === 'POST' && <FileText className="w-3 h-3" />}
              {menu.type === 'URL' && <ExternalLink className="w-3 h-3" />}
              {menu.type === 'STATIC_PAGE' && <Layout className="w-3 h-3" />}
              {menu.type}
            </Badge>
          </TableCell>
          <TableCell className="max-w-[200px] truncate text-slate-500 text-xs font-mono">
            {menu.link || "—"}
          </TableCell>
          <TableCell className="text-center font-bold text-blue-600">{menu.order}</TableCell>
          <TableCell>
            <Switch
              checked={menu.isActive}
              onCheckedChange={() => toggleActive(menu.id, menu.isActive)}
            />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(menu)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(menu.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {menu.children && menu.children.length > 0 && renderMenuRows(menu.children, depth + 1)}
      </Fragment>
    ));
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
          <div className="px-4 py-2 border-b bg-slate-50/50 flex items-center justify-between">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-4">
              <TabsTrigger value="ALL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Tất cả</TabsTrigger>
              <TabsTrigger value="HORIZONTAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Menu Ngang</TabsTrigger>
              <TabsTrigger value="VERTICAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Menu Dọc</TabsTrigger>
              <TabsTrigger value="FOOTER" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all">Menu Chân trang</TabsTrigger>
            </TabsList>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100">{filteredMenus.length} mục</Badge>
          </div>
        </Tabs>
        <Table>
          <TableHeader className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[30%]">Tên hiển thị</TableHead>
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
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-muted-foreground animate-pulse">Đang tải dữ liệu...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMenus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic bg-slate-50/30">
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
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 flex gap-3 mb-4">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <p>Chọn một chuyên mục gốc. Hệ thống sẽ tự động tạo menu cho chuyên mục đó và toàn bộ các chuyên mục con bên trong.</p>
                </div>
                <div className="grid gap-2">
                  {categories.filter(c => !c.parentId).map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
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
                        className="text-blue-600"
                        onClick={() => importCategoryTree(cat)}
                        disabled={isImporting}
                      >
                        {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowRight className="w-4 h-4 mr-2" /> Nhập</>}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-bold">Tên Menu</Label>
                <Input id="name" className="col-span-3 rounded-lg" value={editingMenu.name || ""} onChange={e => setEditingMenu({ ...editingMenu, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Mô tả</Label>
                <Textarea id="description" className="col-span-3 rounded-lg resize-none" rows={2} value={editingMenu.description || ""} onChange={e => setEditingMenu({ ...editingMenu, description: e.target.value })} />
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
