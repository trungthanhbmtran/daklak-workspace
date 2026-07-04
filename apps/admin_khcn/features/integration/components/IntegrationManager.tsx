"use client";

import React, { useState, useRef } from "react";
import { Plus, Search, Server, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIntegrationList, IntegrationConfig } from "../api";
import { IntegrationCard } from "./manager/IntegrationCard";
import { IntegrationFormModal, IntegrationFormModalRef } from "./manager/IntegrationFormModal";
import { EndpointExplorerModal, EndpointExplorerModalRef } from "./manager/EndpointExplorerModal";
import { useApiParser } from "../hooks/useApiParser";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

  const handleOpenCreate = () => {
    modalRef.current?.openCreate();
  };

  const { fileInputRef, handleFileUpload, triggerUpload } = useApiParser((initialData: any) => {
    modalRef.current?.openCreate(initialData);
  });

  const handleOpenEdit = (item: IntegrationConfig) => {
    modalRef.current?.openEdit(item);
  };

  const handleOpenExplorer = (item: IntegrationConfig) => {
    explorerRef.current?.open(item);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Search & Actions Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1 w-full md:max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm API tích hợp..."
            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            onClick={triggerUpload}
            variant="outline"
            className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 h-10 px-4"
          >
            <Upload className="w-4 h-4 mr-2 text-slate-500" />
            Nhập file
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20 px-6 h-10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm API Đầu Vào
          </Button>
        </div>
      </div>

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
            <p className="text-slate-500 text-sm">Nhấn &quot;Thêm API Đầu Vào&quot; để bắt đầu cấu hình kết nối.</p>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(p => Math.max(1, p - 1));
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Edit/Create Dialog */}
      <IntegrationFormModal ref={modalRef} />

      {/* Endpoint Explorer */}
      <EndpointExplorerModal ref={explorerRef} />
    </div>
  );
}
