"use client";

import React, { useState } from "react";
import { usePortalMenu, MenuTable, EditMenuModal, QuickSetupModal } from "@/features/posts/portal-menus";
import { Button } from "@/components/ui/button";
import { Globe, Plus, Zap, Languages } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heading, Text } from "@/components/ui/typography";


export function PortalMenuClient() {
  const [deletingMenuId, setDeletingMenuId] = useState<string | null>(null);
  const {
    activeTab,
    setActiveTab,
    menus,
    loading,
    isDialogOpen,
    isQuickSetupOpen,
    setIsQuickSetupOpen,
    editingMenu,
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
  } = usePortalMenu();

  return (
    <div className="p-6 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <Globe className="w-5 h-5" />
            </div>
            <Heading level="h1" className="font-extrabold tracking-tight text-foreground">Cấu hình Menu Portal</Heading>
          </div>
          <Text className="text-muted-foreground">Thiết lập sơ đồ điều hướng cho cổng thông tin công cộng (Người dân)</Text>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsQuickSetupOpen(true)}
            className="border-primary/20 text-primary hover:bg-primary/10 font-bold"
          >
            <Zap className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" /> Thiết lập nhanh
          </Button>
          <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Plus className="w-4 h-4 mr-2" /> Thêm Menu mới
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 py-2 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-4 flex-wrap">
              <TabsTrigger value="ALL" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-border transition-all font-semibold">Tất cả</TabsTrigger>
              <TabsTrigger value="HORIZONTAL" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-border transition-all font-semibold">Menu Ngang</TabsTrigger>
              <TabsTrigger value="VERTICAL" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-border transition-all font-semibold">Menu Dọc</TabsTrigger>
              <TabsTrigger value="FOOTER" className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-border transition-all font-semibold">Menu Chân trang</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Text as="span" className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-primary" /> Xem ngôn ngữ:
                </Text>
                <Tabs value={displayLang} onValueChange={setDisplayLang} className="w-auto">
                  <TabsList className="bg-muted p-0.5 h-8 gap-0.5 rounded-lg border border-border">
                    {(languages.length > 0 ? languages : [{ code: 'vi', name: 'Tiếng Việt' }, { code: 'en', name: 'English' }]).map(lang => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        className="text-xs font-bold px-3 py-1 rounded-md data-[state=active]:bg-background data-[state=active]:text-primary text-muted-foreground data-[state=active]:shadow-sm transition-all"
                      >
                        {lang.code.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </Tabs>

        <MenuTable
          menus={menus}
          loading={loading}
          expandedItems={expandedItems}
          toggleExpand={toggleExpand}
          displayLang={displayLang}
          languages={languages}
          onEdit={handleOpenDialog}
          onDelete={(id) => setDeletingMenuId(id)}
          onToggleActive={toggleActive}
        />
      </div>

      <QuickSetupModal
        isOpen={isQuickSetupOpen}
        onClose={() => setIsQuickSetupOpen(false)}
        activeTab={activeTab}
        menusLength={menus.length}
        onSuccess={fetchMenus}
      />

      <EditMenuModal
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        menu={editingMenu}
        languages={languages}
        menus={menus}
        onSave={handleSave}
      />

      <AlertDialog open={!!deletingMenuId} onOpenChange={(open) => !open && setDeletingMenuId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Menu này và các menu con của nó sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => {
                if (deletingMenuId) {
                  handleDelete(deletingMenuId);
                  setDeletingMenuId(null);
                }
              }}
            >
              Xóa menu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
