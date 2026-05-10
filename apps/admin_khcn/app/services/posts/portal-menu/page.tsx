"use client";

import React from "react";
import { usePortalMenu, MenuTable, EditMenuModal, QuickSetupModal } from "@/features/posts/portal-menus";
import { Button } from "@/components/ui/button";
import { Globe, Plus, Zap, Languages } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PortalMenuPage() {
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
            className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold"
          >
            <Zap className="w-4 h-4 mr-2 text-amber-500 fill-amber-500" /> Thiết lập nhanh
          </Button>
          <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 font-bold">
            <Plus className="w-4 h-4 mr-2" /> Thêm Menu mới
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <Tabs defaultValue="ALL" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 py-2 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-transparent border-0 p-0 h-auto gap-4 flex-wrap">
              <TabsTrigger value="ALL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all font-semibold">Tất cả</TabsTrigger>
              <TabsTrigger value="HORIZONTAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all font-semibold">Menu Ngang</TabsTrigger>
              <TabsTrigger value="VERTICAL" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all font-semibold">Menu Dọc</TabsTrigger>
              <TabsTrigger value="FOOTER" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5 rounded-lg border border-transparent data-[state=active]:border-slate-200 transition-all font-semibold">Menu Chân trang</TabsTrigger>
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
                        className="text-xs font-bold px-3 py-1 rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
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
          onDelete={handleDelete}
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
    </div>
  );
}
