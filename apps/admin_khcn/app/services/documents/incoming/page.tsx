"use client";

import { useState } from "react";
import {
  Search, Filter, Eye, Plus, Inbox, Trash2, Building2, FileText, User, Calendar, ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import { DocumentUploadModal } from "@/features/document/components/DocumentUploadModal";

export default function IncomingDocumentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { useListDocuments, deleteDocument } = useDocuments();

  const { data: documentsData, isLoading } = useListDocuments({
    search: searchTerm,
    isIncoming: true,
  });

  const documents = documentsData?.data || [];

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa văn bản này?")) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
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
          className="rounded-xl shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 font-bold px-6 h-12 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" /> Vào sổ văn bản đến
        </Button>
      </div>

      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
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
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="px-8 py-5 w-48">Số / Ký hiệu</th>
                <th className="px-8 py-5">Trích yếu nội dung</th>
                <th className="px-8 py-5 w-64">Cơ quan ban hành</th>
                <th className="px-8 py-5 w-40">Ngày nhận</th>
                <th className="px-8 py-5 text-right w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background/40">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground font-medium italic">Đang tải danh sách văn bản...</td></tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Sổ văn bản đang trống</h3>
                    <p className="text-sm text-muted-foreground mt-1">Chưa có văn bản nào được vào sổ tiếp nhận.</p>
                  </td>
                </tr>
              ) : documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-blue-500/[0.02] transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono font-black text-blue-600 text-sm tracking-tight">{doc.documentNumber}</span>
                      {doc.urgency === 'URGENT' && (
                        <Badge className="w-fit bg-rose-100 text-rose-700 border-rose-200 shadow-none text-[9px] px-1.5 py-0 font-black uppercase">Khẩn</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-foreground group-hover:text-blue-600 transition-colors leading-relaxed line-clamp-2">{doc.abstract || doc.title}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 shadow-none text-[10px] font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Đã quét OCR
                      </Badge>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-foreground font-bold">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="line-clamp-1">{doc.issuerName || 'Cơ quan bên ngoài'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-foreground">{new Date(doc.arrivalDate || doc.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Sổ số: {doc.arrivalNumber || '---'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-colors"><Eye className="h-4 w-4" /></Button>
                      <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm hover:bg-rose-600 hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {documents.length > 0 && (
            <div className="p-6 border-t bg-muted/10 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hiển thị {documents.length} văn bản trong sổ</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DocumentUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}


