// app/services/posts/banners/page.tsx

"use client";

import { useState } from "react";
import { BannerList } from "@/features/posts/components/BannerList";
import { BannerForm } from "@/features/posts/components/BannerForm";

export default function BannersPage() {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editId, setEditId] = useState<string | null>(null);

  if (view === 'CREATE') {
    return <BannerForm onBack={() => setView('LIST')} />;
  }

  if (view === 'EDIT') {
    return <BannerForm onBack={() => setView('LIST')} editId={editId} />;
  }

  return (
    <BannerList
      onNavigateToCreate={() => setView('CREATE')}
      onNavigateToEdit={(id) => {
        setEditId(id);
        setView('EDIT');
      }}
    />
  );
}
