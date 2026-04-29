"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search, Filter, Eye, Plus, Send, Trash2, Building2, FileText, User, Calendar, Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments, useListDocuments } from "@/features/document/hooks/useDocuments";
import { DocumentUploadModal } from "@/features/document/components/DocumentUploadModal";

export default function OutgoingDocumentsPage() {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { deleteDocument } = useDocuments();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: response, isLoading, error } = useListDocuments({
    search: debouncedSearch,
    isIncoming: false,
  });

  const documents = useMemo(() => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  }, [response]);

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa văn bản này?")) {
      await deleteDocument(id);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "---";
    return date.toLocaleDateString('vi-VN');
  };

  if (!mounted) return null;

  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-sm">
              <Send className="h-8 w-8" />
            </div>
            Sổ Văn bản Đi
          </h2>
          <p className="text-muted-foreground font-medium pl-14">
            Quản lý và phát hành các văn bản do Sở ban hành.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 font-bold px-6 h-12 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" /> Phát hành văn bản mới
        </Button>
      </div>

      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
        <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo số ký hiệu, trích yếu, nơi nhận..."
              className="pl-11 h-12 bg-muted/20 border-none rounded-2xl focus-visible:ring-emerald-500/20 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10">
            <Filter className="h-4 w-4 mr-2" /> Bộ lọc
          </Button>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="px-8 py-5 w-48">Số / Ký hiệu</th>
                <th className="px-8 py-5">Trích yếu nội dung</th>
                <th className="px-8 py-5 w-64">Nơi nhận</th>
                <th className="px-8 py-5 w-48">Người ký & Ngày Ban hành</th>
                <th className="px-8 py-5 text-right w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background/40">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-medium italic">Đang tải danh sách văn bản...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="py-20 text-center text-rose-600 font-bold italic">Có lỗi xảy ra khi tải dữ liệu. Vui lòng kiểm tra lại API!</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-medium italic">Không có văn bản nào được tìm thấy.</td></tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-emerald-500/[0.02] transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-black text-foreground text-base tracking-tight">{doc.documentNumber || doc.notation}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] font-bold bg-muted/50 text-muted-foreground border-none">
                            {doc.documentType?.name || "Văn bản"}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 max-w-md">
                      <p className="font-bold text-foreground/90 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {doc.abstract || doc.title}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs line-clamp-1">{doc.recipients || "---"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" /> {doc.signerName || "---"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(doc.issueDate || doc.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-colors"><Eye className="h-4 w-4" /></Button>
                        <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm hover:bg-rose-600 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {documents.length > 0 && (
            <div className="p-6 border-t bg-muted/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hiển thị {documents.length} văn bản đã phát hành</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isIncoming={false}
      />
    </div>
  );
}
