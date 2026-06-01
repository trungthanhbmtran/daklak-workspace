"use client";

import { useState } from "react";
import { PostList } from "@/features/posts/components/PostList";
import { PostForm } from "@/features/posts/components/PostForm";

export function PostsPageClient() {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editId, setEditId] = useState<string | null>(null);

  if (view === 'CREATE') {
    return <PostForm onBack={() => setView('LIST')} />;
  }

  if (view === 'EDIT') {
    return <PostForm onBack={() => setView('LIST')} editId={editId} />;
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
