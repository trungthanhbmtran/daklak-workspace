"use client";

import { useState } from "react";
import { CategoryList } from "@/features/posts/components/CategoryList";
import { CategoryForm } from "@/features/posts/components/CategoryForm";

export default function CategoriesPage() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleNavigateToCreate = () => {
    setView("create");
    setSelectedId(null);
  };

  const handleNavigateToEdit = (id: string) => {
    setView("edit");
    setSelectedId(id);
  };

  const handleBack = () => {
    setView("list");
    setSelectedId(null);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {view === "list" ? (
        <CategoryList
          onNavigateToCreate={handleNavigateToCreate}
          onNavigateToEdit={handleNavigateToEdit}
        />
      ) : (
        <CategoryForm
          onBack={handleBack}
          editId={selectedId}
        />
      )}
    </div>
  );
}
