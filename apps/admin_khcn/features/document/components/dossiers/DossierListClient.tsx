/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateDossierModal } from "./CreateDossierModal";
import { useDossierList } from "../../hooks/useDocumentFormData";
import { DossierCard } from "./components/DossierCard";
import { DossierHeader } from "./components/DossierHeader";
import { DossierFilterBar } from "./components/DossierFilterBar";

export function DossierListClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: dossiers = [], isLoading, refetch } = useDossierList();

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleModalChange = useCallback((open: boolean) => setIsModalOpen(open), []);
  const handleSuccess = useCallback(() => refetch(), [refetch]);

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-20">
      <DossierHeader onOpenModal={handleOpenModal} />
      <DossierFilterBar />

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-5 flex gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : dossiers.length === 0 ? (
        <p className="text-center text-muted-foreground py-10 bg-muted/30 rounded-xl border border-dashed border-border">
          Chưa có hồ sơ nào được tiếp nhận.
        </p>
      ) : (
        <div className="grid gap-4">
          {dossiers.map((hs: any) => (
            <DossierCard key={hs.id} hs={hs} />
          ))}
        </div>
      )}

      <CreateDossierModal
        open={isModalOpen}
        onOpenChange={handleModalChange}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
