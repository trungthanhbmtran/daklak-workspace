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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: integrations, isLoading } = useIntegrationList(debouncedSearch);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const totalItems = integrations?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = React.useMemo(() => {
    if (!integrations) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return integrations.slice(startIndex, startIndex + itemsPerPage);
  }, [integrations, currentPage]);

  const modalRef = useRef<IntegrationFormModalRef>(null);
  const explorerRef = useRef<EndpointExplorerModalRef>(null);

  const handleOpenCreate = React.useCallback(() => modalRef.current?.openCreate(), []);
  const handleOpenEdit = React.useCallback((item: IntegrationConfig) => modalRef.current?.openEdit(item), []);
  const handleOpenExplorer = React.useCallback((item: IntegrationConfig) => explorerRef.current?.open(item), []);

  return (
    <div className="w-full min-h-screen flex flex-col space-y-8 bg-slate-50/50 dark:bg-[#0B1120]">
      <IntegrationManagerHeader 
        search={search}
        setSearch={setSearch}
        onOpenCreate={handleOpenCreate}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-1">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/40 dark:bg-slate-800/20 backdrop-blur-md animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
          ))
        ) : integrations?.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-dashed border-violet-200 dark:border-violet-900/50 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
            <Server className="w-16 h-16 text-violet-300 dark:text-violet-600/50 mx-auto mb-6 drop-shadow-md" />
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 mb-2">Chưa có kết nối nào</h3>
            <p className="text-slate-500 font-medium">Bắt đầu bằng việc thêm một cấu hình API mới.</p>
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

      <div className="pt-4">
        <IntegrationPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      <IntegrationFormModal ref={modalRef} />
      <EndpointExplorerModal ref={explorerRef} />
    </div>
  );
}
