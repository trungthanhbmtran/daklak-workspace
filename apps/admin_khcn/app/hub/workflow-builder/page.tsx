"use client";

import React, { useState } from "react";
import WorkflowEditor from "@/components/workflow/WorkflowEditor";
import WorkflowList from "@/components/workflow/WorkflowList";

export default function WorkflowPage() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  if (editingId || isCreating) {
    return (
      <main className="h-screen w-screen overflow-hidden bg-background">
        <WorkflowEditor 
          id={editingId || undefined} 
          onBack={() => {
            setEditingId(null);
            setIsCreating(false);
          }} 
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <WorkflowList 
        onEdit={(id) => setEditingId(id)}
        onCreate={() => setIsCreating(true)}
      />
    </main>
  );
}
