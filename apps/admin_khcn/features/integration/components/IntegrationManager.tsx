/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { Server } from "lucide-react";
import { useIntegrationList, IntegrationConfig } from "../api";
import { IntegrationCard } from "./manager/IntegrationCard";
import { IntegrationFormModal, IntegrationFormModalRef } from "./manager/IntegrationFormModal";
import { EndpointExplorerModal, EndpointExplorerModalRef } from "./manager/EndpointExplorerModal";
import { IntegrationManagerHeader } from "./manager/IntegrationManagerHeader";
import { IntegrationPagination } from "./manager/IntegrationPagination";

export function IntegrationManager() {
  const [search, setSearch] = useState("");
  const { data: integrations, isLoading } = useIntegrationList(search);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalItems = integrations?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = React.useMemo(() => {
    if (!integrations) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return integrations.slice(startIndex, startIndex + itemsPerPage);
  }, [integrations, currentPage]);

  const modalRef = useRef<IntegrationFormModalRef>(null);
  const explorerRef = useRef<EndpointExplorerModalRef>(null);

  const handleOpenCreate = () => modalRef.current?.openCreate();
  const handleImportSuccess = (initialData: any) => modalRef.current?.openCreate(initialData);
  const handleOpenEdit = (item: IntegrationConfig) => modalRef.current?.openEdit(item);
  const handleOpenExplorer = (item: IntegrationConfig) => explorerRef.current?.open(item);

  return (
    <div className="w-full flex flex-col space-y-6">
      <IntegrationManagerHeader 
        search={search}
        setSearch={setSearch}
        onOpenCreate={handleOpenCreate}
        onImportSuccess={handleImportSuccess}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))
        ) : integrations?.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <Server className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Chưa có cấu hình API nào</h3>
            <p className="text-slate-500 text-sm">Nhấn "Thêm API Đầu Vào" để bắt đầu cấu hình kết nối.</p>
          </div>
        ) : currentItems.map((item) => (
          <IntegrationCard
            key={item.id}
            item={item}
            onEdit={handleOpenEdit}
            onExplore={handleOpenExplorer}
          />
        ))}
      </div>

      <IntegrationPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <IntegrationFormModal ref={modalRef} />
      <EndpointExplorerModal ref={explorerRef} />
    </div>
  );
}
