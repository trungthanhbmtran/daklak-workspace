"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Layers, Menu as MenuIcon, Layout } from "lucide-react";
import { PostList } from "./components/PostList";
import { PostForm } from "./components/PostForm";
import { CategoryList } from "./components/CategoryList";
import { CategoryForm } from "./components/CategoryForm";
// import { PortalMenuManagement } from "./portal-menus/PortalMenuManagement";

export function PortalPostsManagement() {
  const [activeTab, setActiveTab] = useState("posts");
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editId, setEditId] = useState<string | null>(null);

  // Nested View for Posts
  const renderPosts = () => {
    if (view === 'CREATE') return <PostForm onBack={() => setView('LIST')} />;
    if (view === 'EDIT') return <PostForm onBack={() => setView('LIST')} editId={editId} />;
    return (
      <PostList 
        onNavigateToCreate={() => setView('CREATE')}
        onNavigateToEdit={(id) => {
          setEditId(id);
          setView('EDIT');
        }}
      />
    );
  };

  // Nested View for Categories
  const [catView, setCatView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [catEditId, setCatEditId] = useState<string | null>(null);

  const renderCategories = () => {
    if (catView === 'CREATE') return <CategoryForm onBack={() => setCatView('LIST')} />;
    if (catView === 'EDIT') return <CategoryForm onBack={() => setCatView('LIST')} editId={catEditId} />;
    return (
      <CategoryList 
        onNavigateToCreate={() => setCatView('CREATE')}
        onNavigateToEdit={(id) => {
          setCatEditId(id);
          setCatView('EDIT');
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <Layout className="h-6 w-6 text-blue-600" /> Quản trị Nội dung Cổng thông tin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý bài viết, chuyên mục và hệ thống menu theo Nghị định 42/2022/NĐ-CP.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-12 mb-6">
          <TabsTrigger value="posts" className="rounded-lg px-6 flex items-center gap-2 data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" /> Bài viết
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-lg px-6 flex items-center gap-2 data-[state=active]:shadow-sm">
            <Layers className="h-4 w-4" /> Chuyên mục
          </TabsTrigger>
          <TabsTrigger value="menus" className="rounded-lg px-6 flex items-center gap-2 data-[state=active]:shadow-sm">
            <MenuIcon className="h-4 w-4" /> Menu Cổng thông tin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
          {renderPosts()}
        </TabsContent>

        <TabsContent value="categories" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
          {renderCategories()}
        </TabsContent>

        <TabsContent value="menus" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
          <div className="p-20 text-center border-2 border-dashed rounded-2xl bg-slate-50/50">
            <MenuIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Quản lý Menu Cổng thông tin</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">Tính năng này đang được thiết lập để tách biệt hoàn toàn với Menu hệ thống, giúp bạn quản lý Header/Footer/Sidebar của Cổng thông tin dễ dàng hơn.</p>
            <Badge variant="secondary" className="mt-4 bg-blue-50 text-blue-700 border-blue-100">
               Coming Soon (Drafted in Schema)
            </Badge>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
