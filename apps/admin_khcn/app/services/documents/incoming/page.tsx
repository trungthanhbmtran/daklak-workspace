"use client";

import { useState, useMemo, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { Inbox, Plus, FileText, Calendar, Building2, User, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocuments } from "@/features/document/hooks/useDocuments";

// Lazy load heavy modals
const DocumentUploadModal = dynamic(() => import("@/features/document/components/DocumentUploadModal").then(mod => mod.DocumentUploadModal), {
  loading: () => <Skeleton className="h-[600px] w-full rounded-3xl" />,
  ssr: false
});

const DocumentDetailModal = dynamic(() => import("@/features/document/components/DocumentDetailModal").then(mod => mod.DocumentDetailModal), {
  ssr: false
});

// Memoized Table Row for performance
const DocumentRow = memo(({ doc, onDetail }: { doc: any; onDetail: (id: string) => void }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "---";
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <tr
      className="hover:bg-blue-500/[0.02] transition-all group cursor-pointer border-b last:border-0"
      onClick={() => onDetail(doc.id)}
    >
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1.5">
          <span className="font-black text-foreground text-base tracking-tight">{doc.documentNumber}</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold bg-muted/50 text-muted-foreground border-none">
              {doc.documentType?.name || "Văn bản"}
            </Badge>
            {doc.isUrgent && <Badge className="bg-rose-500 text-white border-none text-[10px] font-black">HỎA TỐC</Badge>}
          </div>
        </div>
      </td>
      <td className="px-8 py-6 max-w-md">
        <div className="flex flex-col gap-1">
          <p className="font-bold text-foreground/90 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {doc.abstract || doc.title || "Không có trích yếu"}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-blue-500" />
              {doc.issuingAgency || "Nội bộ"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {formatDate(doc.documentDate)}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ngày văn bản</span>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-foreground font-bold">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {doc.receiverName || "Chưa bàn giao"}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Người xử lý</span>
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onDetail(doc.id); }}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
});

DocumentRow.displayName = "DocumentRow";

export default function IncomingDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const { useListDocuments } = useDocuments();
  const { data: response, isLoading } = useListDocuments({
    isIncoming: true,
    searchTerm: searchTerm.length >= 2 ? searchTerm : undefined,
    pageSize: 50
  });

  const documents = response?.data || [];

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedDocId(id);
    setIsDetailOpen(true);
  }, []);

  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
      {/* Header section back in one file */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600 shadow-sm">
              <Inbox className="h-8 w-8" />
            </div>
            Sổ Văn bản Đến
          </h2>
          <p className="text-muted-foreground font-medium pl-14">
            Quản lý và theo dõi các văn bản tiếp nhận từ cơ quan bên ngoài.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 font-bold px-6 h-12 transition-all active:scale-95 w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Vào sổ văn bản đến
        </Button>
      </div>

      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
        {/* Search section back in one file */}
        <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo số ký hiệu, trích yếu, cơ quan..."
              className="pl-11 h-12 bg-muted/20 border-none rounded-2xl focus-visible:ring-blue-500/20 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10">
            <Filter className="h-4 w-4 mr-2" /> Bộ lọc
          </Button>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="px-8 py-5 w-48">Số / Ký hiệu</th>
                <th className="px-8 py-5">Trích yếu / Cơ quan ban hành</th>
                <th className="px-8 py-5 w-40">Ngày ban hành</th>
                <th className="px-8 py-5 w-48">Người tiếp nhận</th>
                <th className="px-8 py-5 w-24 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-8 py-6"><Skeleton className="h-10 w-32 rounded-lg" /></td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-3 w-1/2 rounded-md" />
                      </div>
                    </td>
                    <td className="px-8 py-6"><Skeleton className="h-8 w-24 rounded-lg" /></td>
                    <td className="px-8 py-6"><Skeleton className="h-8 w-32 rounded-lg" /></td>
                    <td className="px-8 py-6 text-right"><Skeleton className="h-9 w-9 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-medium">
                    Không tìm thấy văn bản nào.
                  </td>
                </tr>
              ) : (
                documents.map((doc: any) => (
                  <DocumentRow key={doc.id} doc={doc} onDetail={handleOpenDetail} />
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Heavy components are lazy loaded */}
      {isModalOpen && (
        <DocumentUploadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isDetailOpen && (
        <DocumentDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          documentId={selectedDocId}
        />
      )}
    </div>
  );
}
