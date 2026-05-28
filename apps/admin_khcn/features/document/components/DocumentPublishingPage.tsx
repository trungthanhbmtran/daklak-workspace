"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Globe, Link as LinkIcon, FileText, Calendar, 
  CheckCircle2, Plus, X, Search as SearchIcon, FileSignature, Layers,
  Loader2, ArrowRight, Building2, Check, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";

export default function DocumentPublishingPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const searchTerm = searchParams.get('search') || "";
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  
  // Publication states
  const [isPublic, setIsPublic] = useState(false);
  const [transCategory, setTransCategory] = useState("EXECUTION");
  const [fiscalYear, setFiscalYear] = useState("2026");
  const [effectiveStatus, setEffectiveStatus] = useState("VALID");
  const [effectiveDate, setEffectiveDate] = useState("");

  useEffect(() => {
    setMounted(true);
    setEffectiveDate(new Date().toISOString().split('T')[0]);
  }, []);

  const { useListDocuments, updateDocument, isLoading: isUpdating } = useDocuments();
  
  // Search logic
  const { data: searchResults, isLoading: isSearching } = useListDocuments({
    search: searchTerm,
    limit: 5,
  });

  const docs = useMemo(() => {
    if (!searchResults) return [];
    const raw = searchResults.data || searchResults;
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
    return list.filter((d: any) => d && typeof d === 'object');
  }, [searchResults]);

  // Sync state when a document is selected
  useEffect(() => {
    if (selectedDoc) {
      setIsPublic(!!selectedDoc.isPublic);
      setTransCategory(selectedDoc.transparencyCategory || "EXECUTION");
      setFiscalYear(selectedDoc.fiscalYear?.toString() || "2026");
      // Assuming these fields might exist or we use defaults
      setEffectiveDate(selectedDoc.issueDate?.split('T')[0] || new Date().toISOString().split('T')[0]);
    }
  }, [selectedDoc]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "---";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "---";
      return date.toLocaleDateString('vi-VN');
    } catch (e) {
      return "---";
    }
  };

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 bg-muted/5 min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const handlePublish = async () => {
    if (!selectedDoc) {
      toast.error("Vui lòng chọn văn bản cần xuất bản");
      return;
    }

    try {
      await updateDocument({
        id: selectedDoc.id,
        isPublic,
        transparencyCategory: isPublic ? transCategory : null,
        fiscalYear: isPublic ? parseInt(fiscalYear) : null,
      });
      toast.success("Cập nhật thiết lập xuất bản thành công!");
    } catch (error) {
      toast.error("Không thể cập nhật thiết lập xuất bản");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> Xuất bản Cổng Thông tin
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Cấu hình siêu dữ liệu, hiệu lực pháp lý và công khai văn bản trên Portal.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => {
            setSelectedDoc(null);
            const params = new URLSearchParams(searchParams);
            params.delete('search');
            replace(`${pathname}?${params.toString()}`);
          }}>Chọn văn bản khác</Button>
          <Button 
            className="flex-1 sm:flex-none shadow-lg shadow-primary/20" 
            onClick={handlePublish}
            disabled={!selectedDoc || isUpdating}
          >
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Đăng tải Công khai
          </Button>
        </div>
      </div>

      {!selectedDoc ? (
        /* SEARCH SECTION */
        <Card className="border-2 border-dashed bg-muted/5">
          <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <SearchIcon className="h-10 w-10" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-bold">Tìm kiếm văn bản cần xuất bản</h3>
              <p className="text-sm text-muted-foreground">Nhập số ký hiệu, trích yếu hoặc tên cơ quan ban hành để bắt đầu cấu hình xuất bản.</p>
            </div>
            <div className="w-full max-w-xl relative">
              <Search placeholder="Ví dụ: 123/QĐ-SKHCN..." className="w-full" />
              
              {searchTerm.length > 0 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl border-primary/10 overflow-hidden">
                  <CardContent className="p-0">
                    {isSearching ? (
                      <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
                    ) : docs.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground italic">Không tìm thấy văn bản nào phù hợp.</div>
                    ) : (
                      <div className="divide-y">
                        {docs.map((doc: any) => (
                          <div 
                            key={doc.id} 
                            className="p-4 hover:bg-primary/5 cursor-pointer flex items-start gap-3 transition-colors group"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                              <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-primary">{doc.documentNumber || doc.notation}</span>
                                {doc.isPublic && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Đã công khai</Badge>}
                              </div>
                              <p className="text-xs text-foreground font-medium line-clamp-1 mt-0.5">{doc.abstract}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> {doc.issuerName}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(doc.issueDate)}</span>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* EDITING SECTION */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* CỘT TRÁI (2/3): Thuộc tính Pháp lý & Móc nối */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Selected Document Info */}
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">{selectedDoc.documentNumber || selectedDoc.notation}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 font-medium italic">"{selectedDoc.abstract}"</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 font-bold" asChild>
                  <a href={`/services/documents/processing/${selectedDoc.id}`} target="_blank">
                    Xem chi tiết <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/10 border-b py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-primary" /> Thông tin Hiệu lực & Công khai
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-6">
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Hiển thị công khai trên Cổng Thông tin
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium">Khi bật, văn bản sẽ xuất hiện tại mục Văn bản - Báo cáo công khai.</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} className="data-[state=checked]:bg-emerald-600" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tình trạng hiệu lực</label>
                    <Select value={effectiveStatus} onValueChange={setEffectiveStatus}>
                      <SelectTrigger className="font-semibold text-primary bg-muted/20 border-transparent focus:ring-primary h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOT_YET">Chưa có hiệu lực</SelectItem>
                        <SelectItem value="VALID">Còn hiệu lực toàn bộ</SelectItem>
                        <SelectItem value="PARTIAL">Còn hiệu lực một phần</SelectItem>
                        <SelectItem value="EXPIRED">Hết hiệu lực toàn bộ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Ngày có hiệu lực</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="date" 
                        className="pl-10 h-11 bg-muted/20 border-transparent focus:bg-background transition-all" 
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QUẢN TRỊ QUAN HỆ VĂN BẢN (Mock for now, UI ready) */}
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/10 border-b py-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-primary" /> Lược đồ Quan hệ Văn bản
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Văn bản này tác động pháp lý đến các văn bản nào khác?</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="h-8 text-xs font-bold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm liên kết
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-2 p-3 bg-muted/30 border rounded-lg items-center">
                  <Select defaultValue="REPLACES">
                    <SelectTrigger className="w-[180px] h-9 bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REPLACES">Thay thế cho</SelectItem>
                      <SelectItem value="MODIFIES">Sửa đổi, bổ sung cho</SelectItem>
                      <SelectItem value="GUIDES">Hướng dẫn cho</SelectItem>
                      <SelectItem value="CANCELS">Bãi bỏ một phần</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search placeholder="Nhập số ký hiệu văn bản cần liên kết..." className="w-full" />
                  </div>
                  <Button size="sm" className="h-9 font-bold px-4">Thêm</Button>
                </div>

                <div className="space-y-2 pt-2">
                   <div className="p-8 text-center text-muted-foreground italic text-xs border border-dashed rounded-lg">
                      Chưa có liên kết văn bản nào được thiết lập.
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CỘT PHẢI (1/3): Phân loại Chuyên đề hiển thị Web */}
          <div className="space-y-6">
            <Card className="border shadow-sm">
              <CardHeader className="bg-muted/10 border-b py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Vị trí hiển thị (Portal)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Loại báo cáo công khai</label>
                  <Select value={transCategory} onValueChange={setTransCategory} disabled={!isPublic}>
                    <SelectTrigger className="h-11 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESTIMATE">Dự toán thu - chi ngân sách</SelectItem>
                      <SelectItem value="SETTLEMENT">Quyết toán thu - chi ngân sách</SelectItem>
                      <SelectItem value="EXECUTION">Thực hiện dự toán ngân sách</SelectItem>
                      <SelectItem value="GENERAL">Văn bản - Thông tin chung</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground italic">Quyết định vị trí văn bản trong mục Công khai minh bạch.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Năm tài chính</label>
                  <Select value={fiscalYear} onValueChange={setFiscalYear} disabled={!isPublic}>
                    <SelectTrigger className="h-11 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026">Năm 2026</SelectItem>
                      <SelectItem value="2025">Năm 2025</SelectItem>
                      <SelectItem value="2024">Năm 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tùy chọn hiển thị Portal</label>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-primary group-data-[state=checked]:bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">Văn bản nổi bật</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-background">Trang chủ</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-primary flex items-center justify-center">
                        {/* Checked by default logic */}
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Tìm kiếm toàn văn</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-background">Elastic</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50/50 border-amber-100">
               <CardContent className="p-4">
                  <div className="flex gap-3">
                     <Layers className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <h5 className="text-xs font-bold text-amber-800 uppercase">Lưu ý xuất bản</h5>
                        <p className="text-xs text-amber-700 leading-relaxed">
                           Việc xuất bản lên Cổng thông tin yêu cầu văn bản đã được ký số hợp lệ và có đầy đủ trích yếu. Vui lòng kiểm tra lại nội dung trước khi bấm "Đăng tải".
                        </p>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
