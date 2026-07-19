"use client";

import React from "react";
import { useQuickSetup } from "../hooks/useQuickSetup";
import { Dialog, DialogContent, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Zap, FolderTree, BookOpen, ShieldCheck, Layout,
  Loader2, Sparkles, Layers, ArrowRight, FileText, Plus
} from "lucide-react";
import { Heading, Text } from "@/components/ui/typography";


interface QuickSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  menusLength: number;
  onSuccess: () => void;
}

export function QuickSetupModal({ isOpen, onClose, activeTab, menusLength, onSuccess }: QuickSetupModalProps) {
  const {
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
  } = useQuickSetup({ activeTab, menusLength, onSuccess, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl border">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background/20 rounded-lg text-primary-foreground">
              <Zap className="w-6 h-6 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold">Thiết lập Menu nhanh</DialogTitle>
          </div>
          <DialogDescription className="text-primary-foreground/80">
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
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-600 dark:text-amber-400 flex gap-3 mb-4 items-center justify-between">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 flex-shrink-0 text-amber-500" />
                  <Text>Chọn một hoặc nhiều chuyên mục. Hệ thống sẽ tự động tạo menu cho chuyên mục đó và toàn bộ các chuyên mục con.</Text>
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
                    className={`flex items-center justify-between p-3 rounded-lg border border-border transition-all group cursor-pointer ${selectedCategories.includes(cat.id)
                      ? 'border-primary/50 bg-primary/10 shadow-sm'
                      : 'hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    onClick={() => toggleCategorySelection(cat.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategories.includes(cat.id)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border bg-background'
                        }`}>
                        {selectedCategories.includes(cat.id) && <Plus className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`p-2 rounded transition-colors ${selectedCategories.includes(cat.id) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100'
                        }`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <Text className="font-semibold text-slate-800">{cat.name}</Text>
                        <Text className="text-[10px] text-slate-500">{cat.children?.length || 0} chuyên mục con</Text>
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
                <BookOpen className="w-5 h-5 flex-shrink-0 text-blue-600" />
                <Text>Tạo menu cho các nhóm văn bản. Hệ thống sẽ tự động thêm các loại văn bản (danh mục) thuộc nhóm này vào menu con.</Text>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {docGroups.map(group => (
                  <div key={group.id} className="flex flex-col p-4 rounded-xl border hover:border-blue-400 hover:shadow-md transition-all bg-white gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit">
                      <FileText className="w-5 h-5" />
                    </div>
                    <Text className="font-bold text-slate-800">{group.name}</Text>
                    <Button
                      size="sm"
                      className="w-full bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-all font-semibold"
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
                <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <Text>Các module bắt buộc theo Nghị định 42/2022 và Thông tư 22/2023 của Bộ TT&TT về Cổng thông tin điện tử cơ quan nhà nước.</Text>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {complianceModules.map(module => (
                  <div key={module.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50 transition-all bg-white group">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded">
                        <Plus className="w-3 h-3" />
                      </div>
                      <Text as="span" className="font-semibold text-slate-800">{module.name}</Text>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-emerald-600 px-2 font-bold hover:bg-emerald-100"
                      onClick={() => handleImportCompliance(module)}
                      disabled={isImporting}
                    >
                      {isImporting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Thêm"}
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pages" className="flex flex-col items-center justify-center py-8 gap-4 border border-dashed rounded-xl bg-slate-50/50">
              <div className="p-4 bg-slate-100 rounded-full">
                <Layout className="w-10 h-10 text-slate-400" />
              </div>
              <div className="text-center space-y-1">
                <Text className="font-bold text-slate-800">Khởi tạo nhanh các trang cơ bản</Text>
                <Text className="text-muted-foreground">Trang chủ, Tin tức, Tra cứu văn bản, Liên hệ...</Text>
              </div>
              <Button
                onClick={addDefaultPages}
                className="bg-blue-600 px-8 hover:bg-blue-700"
                disabled={isImporting}
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Bắt đầu khởi tạo
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t">
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
