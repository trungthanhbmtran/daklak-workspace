"use client";

import { useState } from "react";
import {
   Search, Plus, Filter,
   Settings2, FolderTree, BookOpen,
   Building2, ChevronRight, Edit3,
   Trash2, MoreVertical, LayoutGrid
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock Data: Các nhóm danh mục
const categoryGroups = [
   { id: 'DOCUMENT_TYPE', name: 'Loại văn bản', icon: BookOpen },
   { id: 'DOCUMENT_FIELD', name: 'Lĩnh vực', icon: FolderTree },
   { id: 'ISSUING_AUTHORITY', name: 'Cơ quan ban hành', icon: Building2 },
];

const mockCategories = {
   TYPE: [
      { id: '1', name: 'Công văn', code: 'CONG_VAN', status: 'ACTIVE' },
      { id: '2', name: 'Quyết định', code: 'QUYET_DINH', status: 'ACTIVE' },
      { id: '3', name: 'Tờ trình', code: 'TO_TRINH', status: 'ACTIVE' },
      { id: '4', name: 'Báo cáo', code: 'BAO_CAO', status: 'ACTIVE' },
      { id: '5', name: 'Giấy mời', code: 'GIAY_MOI', status: 'ACTIVE' },
   ],
   FIELD: [
      { id: 'f1', name: 'Khoa học & Công nghệ', code: 'KHCN', status: 'ACTIVE' },
      { id: 'f2', name: 'Công nghệ thông tin', code: 'CNTT', status: 'ACTIVE' },
      { id: 'f3', name: 'Kế hoạch - Tài chính', code: 'KHTC', status: 'ACTIVE' },
   ]
};

import { useDocuments } from "@/features/document/hooks/useDocuments";
import { CategoryModal } from "@/features/document/components/CategoryModal";

export default function DocumentCategoriesPage() {
   const [activeGroup, setActiveGroup] = useState('DOCUMENT_TYPE');
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedCategory, setSelectedCategory] = useState<any>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

   const { useCategories, deleteCategory } = useDocuments();
   const { data: categories = [], isLoading } = useCategories(activeGroup);

   const filteredCategories = categories.filter((cat: any) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleAdd = () => {
      setSelectedCategory(null);
      setIsModalOpen(true);
   };

   const handleEdit = (category: any) => {
      setSelectedCategory(category);
      setIsModalOpen(true);
   };

   const handleDelete = async (id: string) => {
      if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
         await deleteCategory(id);
      }
   };

   return (
      <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
         {/* 1. HEADER */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Settings2 className="h-6 w-6 text-primary" /> Danh mục Dùng chung
               </h2>
               <p className="text-sm text-muted-foreground mt-1">
                  Quản lý các danh mục phân loại văn bản, lĩnh vực và cơ quan trong hệ thống.
               </p>
            </div>
            <Button className="shadow-lg shadow-primary/20 rounded-xl px-6" onClick={handleAdd}>
               <Plus className="h-4 w-4 mr-2" /> Thêm danh mục mới
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* LEFT: Sidebar Groups */}
            <div className="lg:col-span-1 space-y-4">
               <Card className="border-none shadow-xl shadow-foreground/5 bg-background rounded-2xl overflow-hidden p-2">
                  <div className="space-y-1">
                     {categoryGroups.map((group) => {
                        const Icon = group.icon;
                        const isActive = activeGroup === group.id;
                        return (
                           <button
                              key={group.id}
                              onClick={() => setActiveGroup(group.id)}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'
                                 }`}
                           >
                              <div className="flex items-center gap-3">
                                 <Icon className="h-4 w-4" />
                                 <span className="text-sm font-bold">{group.name}</span>
                              </div>
                           </button>
                        );
                     })}
                  </div>
               </Card>

               <Card className="border-none shadow-sm bg-primary/5 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <LayoutGrid className="h-4 w-4 text-primary" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-primary">Hướng dẫn</h4>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                     Các danh mục này được dùng chung trên toàn hệ thống Văn bản, giúp chuẩn hóa dữ liệu và báo cáo thống kê.
                  </p>
               </Card>
            </div>

            {/* RIGHT: Category List */}
            <div className="lg:col-span-3 space-y-6">
               <Card className="border-none shadow-xl shadow-foreground/5 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-background border-b py-4">
                     <div className="flex justify-between items-center">
                        <div className="relative w-72">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input
                              placeholder="Tìm kiếm danh mục..."
                              className="pl-10 h-10 bg-muted/20 border-none rounded-xl"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl">
                           <Filter className="h-4 w-4 mr-2" /> Bộ lọc
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
                           <tr>
                              <th className="px-6 py-4">Tên danh mục</th>
                              <th className="px-6 py-4">Mã định danh</th>
                              <th className="px-6 py-4 text-center">Trạng thái</th>
                              <th className="px-6 py-4 text-right">Thao tác</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                           {isLoading ? (
                              <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Đang tải danh mục...</td></tr>
                           ) : filteredCategories.length === 0 ? (
                              <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Không tìm thấy danh mục nào.</td></tr>
                           ) : filteredCategories.map((cat: any) => (
                              <tr key={cat.id} className="hover:bg-primary/[0.02] transition-colors group">
                                 <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                       <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                          {cat.name.charAt(0)}
                                       </div>
                                       <span className="font-bold text-foreground">{cat.name}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5">
                                    <Badge variant="outline" className="font-mono text-[11px] bg-muted/50 text-muted-foreground border-none px-2">
                                       {cat.code || 'N/A'}
                                    </Badge>
                                 </td>
                                 <td className="px-6 py-5 text-center">
                                    <Badge className="bg-emerald-100 text-emerald-700 shadow-none text-[10px] font-bold">
                                       ĐANG DÙNG
                                    </Badge>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleEdit(cat)}>
                                          <Edit3 className="h-4 w-4" />
                                       </Button>
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreVertical className="h-4 w-4" />
                                             </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end" className="rounded-xl">
                                             <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" onClick={() => handleDelete(cat.id)}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Xóa danh mục
                                             </DropdownMenuItem>
                                          </DropdownMenuContent>
                                       </DropdownMenu>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     <div className="p-4 border-t bg-muted/5 flex justify-center">
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground">
                           Hiển thị {filteredCategories.length} mục
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>

         <CategoryModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            category={selectedCategory}
            groupCode={activeGroup}
         />
      </div>
   );
}
