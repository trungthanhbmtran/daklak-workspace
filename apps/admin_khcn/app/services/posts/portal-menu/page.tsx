"use client";

import React, { useState, useEffect } from "react";
import { postsApi } from "@/features/posts/api";
import { PortalMenu } from "@/features/posts/types";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Layers, FileText, ExternalLink, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PortalMenuPage() {
  const [menus, setMenus] = useState<PortalMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Partial<PortalMenu> | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await postsApi.getPortalMenus();
      setMenus(data || []);
    } catch {
      toast.error("Không thể tải danh sách menu");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (menu?: PortalMenu) => {
    if (menu) {
      setEditingMenu({ ...menu });
    } else {
      setEditingMenu({
        name: "",
        type: "URL",
        target: "_self",
        isActive: true,
        order: 0,
        parentId: null,
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

  // Render Table Rows Recursively for hierarchy
  const renderMenuRows = (items: PortalMenu[], depth = 0): React.ReactNode => {
    return items.map((menu: PortalMenu) => (
      <React.Fragment key={menu.id}>
        <TableRow className={depth > 0 ? "bg-slate-50/30" : ""}>
          <TableCell className="font-medium">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 24}px` }}>
              {depth > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mr-2" />}
              {menu.icon && <span className="mr-2 text-blue-500">{menu.icon}</span>}
              <span>{menu.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="flex items-center w-fit gap-1 uppercase text-[10px]">
              {menu.type === 'CATEGORY' && <Layers className="w-3 h-3" />}
              {menu.type === 'POST' && <FileText className="w-3 h-3" />}
              {menu.type === 'URL' && <ExternalLink className="w-3 h-3" />}
              {menu.type}
            </Badge>
          </TableCell>
          <TableCell className="max-w-[200px] truncate text-slate-500 text-xs font-mono">
            {menu.link || "—"}
          </TableCell>
          <TableCell className="text-center">{menu.order}</TableCell>
          <TableCell>
            <Switch
              checked={menu.isActive}
              onCheckedChange={() => toggleActive(menu.id, menu.isActive)}
            />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(menu)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(menu.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {menu.children && menu.children.length > 0 && renderMenuRows(menu.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cấu hình Menu Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý sơ đồ điều hướng cho cổng thông tin công cộng</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm Menu mới
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[30%]">Tên hiển thị</TableHead>
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
                <TableCell colSpan={6} className="h-24 text-center">Đang tải dữ liệu...</TableCell>
              </TableRow>
            ) : menus.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  Chưa có menu nào. Nhấn &quot;Thêm Menu mới&quot; để bắt đầu.
                </TableCell>
              </TableRow>
            ) : renderMenuRows(menus)}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMenu?.id ? "Chỉnh sửa Menu" : "Thêm Menu mới"}</DialogTitle>
            <DialogDescription>Nhập thông tin mục menu để hiển thị trên cổng thông tin.</DialogDescription>
          </DialogHeader>

          {editingMenu && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Tên Menu</Label>
                <Input id="name" className="col-span-3" value={editingMenu.name || ""} onChange={e => setEditingMenu({ ...editingMenu, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Loại liên kết</Label>
                <Select value={editingMenu.type} onValueChange={v => setEditingMenu({ ...editingMenu, type: v as PortalMenu['type'] })}>
                  <SelectTrigger className="col-span-3">
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
                <Label htmlFor="link" className="text-right">Đường dẫn / ID</Label>
                <Input id="link" className="col-span-3 font-mono text-sm" placeholder="/tin-tuc hoặc ID bài viết" value={editingMenu.link || ""} onChange={e => setEditingMenu({ ...editingMenu, link: e.target.value })} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right">Menu cha</Label>
                <Select value={editingMenu.parentId || "NONE"} onValueChange={v => setEditingMenu({ ...editingMenu, parentId: v === "NONE" ? null : v })}>
                  <SelectTrigger className="col-span-3">
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
                <Label htmlFor="order" className="text-right">Thứ tự</Label>
                <Input id="order" type="number" className="col-span-1" value={editingMenu.order || 0} onChange={e => setEditingMenu({ ...editingMenu, order: parseInt(e.target.value) || 0 })} />

                <Label htmlFor="target" className="text-right">Đích đến</Label>
                <Select value={editingMenu.target} onValueChange={v => setEditingMenu({ ...editingMenu, target: v })}>
                  <SelectTrigger className="col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_self">Tại trang</SelectItem>
                    <SelectItem value="_blank">Tab mới</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Mô tả</Label>
                <Textarea id="description" className="col-span-3" value={editingMenu.description || ""} onChange={e => setEditingMenu({ ...editingMenu, description: e.target.value })} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">Lưu thông tin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
