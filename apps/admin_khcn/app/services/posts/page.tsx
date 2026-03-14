// app/admin/posts/page.tsx
"use client";
import { useState } from "react";
import { PostList } from "@/features/posts/components/PostList";
import { PostForm } from "@/features/posts/components/PostForm";

export default function PostsPage() {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editId, setEditId] = useState<string | null>(null);

  if (view === 'CREATE') {
    return <PostForm onBack={() => setView('LIST')} />;
  }

  if (view === 'EDIT') {
    // Truyền editId vào PostForm để gọi API fetch chi tiết bài viết
    return <PostForm onBack={() => setView('LIST')} />;
  }

  return (
    <PostList 
      onNavigateToCreate={() => setView('CREATE')}
      onNavigateToEdit={(id) => {
        setEditId(id);
        setView('EDIT');
      }}
    />
  );
}
