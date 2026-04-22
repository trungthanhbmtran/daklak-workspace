"use client";
import { useState } from "react";
import { CategoryList } from "@/features/posts/components/CategoryList";
import { CategoryForm } from "@/features/posts/components/CategoryForm";

export default function CategoriesPage() {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editId, setEditId] = useState<string | null>(null);

  if (view === 'CREATE') {
    return <CategoryForm onBack={() => setView('LIST')} />;
  }

  if (view === 'EDIT') {
    return <CategoryForm onBack={() => setView('LIST')} editId={editId} />;
  }

  return (
    <CategoryList
      onNavigateToCreate={() => setView('CREATE')}
      onNavigateToEdit={(id) => {
        setEditId(id);
        setView('EDIT');
      }}
    />
  );
}
