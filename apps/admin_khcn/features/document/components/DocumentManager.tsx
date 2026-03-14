"use client";

import { 
  FileText, MessageSquareShare, PieChart, Search, Plus, 
  Download, Clock, CheckCircle2, Building2, Upload, 
  ShieldCheck, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentManagerProps {
  onOpenUploadModal: () => void;
  onOpenConsultationModal: () => void;
  onOpenFinanceModal: () => void;
}

export default function DocumentManager({ onOpenUploadModal, onOpenConsultationModal, onOpenFinanceModal }: DocumentManagerProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Tổng quan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Hệ thống Quản lý Văn bản</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Điều hành, lấy ý kiến dự thảo và công khai minh bạch tài chính.
          </p>
        </div>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        {/* Thanh Navigation Tab */}
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/40 p-1">
          <TabsTrigger value="documents" className="font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4 mr-2" /> Văn bản Bộ / Ngành
          </TabsTrigger>
          <TabsTrigger value="consultation" className="font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm relative">
            <MessageSquareShare className="h-4 w-4 mr-2" /> Quản lý Lấy ý kiến
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
          </TabsTrigger>
          <TabsTrigger value="finance" className="font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <PieChart className="h-4 w-4 mr-2" /> Công khai Tài chính
          </TabsTrigger>
        </TabsList>

        {/* ========================================== */}
        {/* TAB 1: VĂN BẢN ĐI/ĐẾN BỘ NGÀNH */}
        {/* ========================================== */}
        <TabsContent value="documents" className="mt-6 space-y-4">
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Tìm số ký hiệu, trích yếu..." className="pl-8 bg-background" />
                </div>
                <Select defaultValue="INCOMING">
                  <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOMING">Văn bản Đến</SelectItem>
                    <SelectItem value="OUTGOING">Văn bản Đi</SelectItem>
                    <SelectItem value="INTERNAL">Nội bộ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Nút gọi Modal Upload */}
              <Button onClick={onOpenUploadModal} className="w-full sm:w-auto shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> Vào sổ văn bản mới
              </Button>
            </div>

            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
                     <tr>
                       <th className="px-5 py-3 font-semibold">Số / Ký hiệu</th>
                       <th className="px-5 py-3 font-semibold w-[40%]">Trích yếu nội dung</th>
                       <th className="px-5 py-3 font-semibold">Cơ quan ban hành</th>
                       <th className="px-5 py-3 font-semibold">Trạng thái tệp</th>
                       <th className="px-5 py-3 font-semibold text-right">Thao tác</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border/50 bg-background">
                     <tr className="hover:bg-muted/30 transition-colors group">
                       <td className="px-5 py-4 font-mono font-medium text-primary">125/QĐ-SKHCN</td>
                       <td className="px-5 py-4">
                         <p className="font-semibold text-foreground line-clamp-2">Quyết định về việc ban hành quy chế bảo đảm an toàn thông tin mạng trong hoạt động của cơ quan nhà nước.</p>
                         <p className="text-[11px] text-muted-foreground mt-1">Ngày ban hành: 20/02/2026</p>
                       </td>
                       <td className="px-5 py-4">Sở Khoa học và Công nghệ</td>
                       <td className="px-5 py-4">
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none flex items-center gap-1 w-fit">
                           <ShieldCheck className="h-3 w-3" /> Đã xác thực VGCA
                         </Badge>
                       </td>
                       <td className="px-5 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                       </td>
                     </tr>
                     <tr className="hover:bg-muted/30 transition-colors group">
                       <td className="px-5 py-4 font-mono font-medium text-primary">456/UBND-TH</td>
                       <td className="px-5 py-4">
                         <p className="font-semibold text-foreground line-clamp-2">Công văn đôn đốc thực hiện nhiệm vụ chuyển đổi số quý I năm 2026 trên địa bàn tỉnh.</p>
                         <p className="text-[11px] text-muted-foreground mt-1">Ngày ban hành: 18/02/2026</p>
                       </td>
                       <td className="px-5 py-4">UBND Tỉnh Đắk Lắk</td>
                       <td className="px-5 py-4">
                         <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 shadow-none flex items-center gap-1 w-fit">
                           <FileText className="h-3 w-3" /> Bản Scan (OCR)
                         </Badge>
                       </td>
                       <td className="px-5 py-4 text-right">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <Eye className="h-4 w-4" />
                          </Button>
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 2: QUẢN LÝ LẤY Ý KIẾN */}
        {/* ========================================== */}
        <TabsContent value="consultation" className="mt-6 space-y-4">
          <Card className="border shadow-sm">
            <div className="p-4 border-b flex justify-between items-center bg-muted/10">
              <div className="flex gap-2">
                <Input placeholder="Tên dự thảo..." className="w-72 bg-background" />
                <Select defaultValue="GATHERING">
                  <SelectTrigger className="w-[160px] bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GATHERING">Đang lấy ý kiến</SelectItem>
                    <SelectItem value="COMPILED">Đã tổng hợp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={onOpenConsultationModal}><Plus className="h-4 w-4 mr-2"/> Tạo luồng lấy ý kiến</Button>
            </div>
            
            <div className="divide-y bg-background">
              {/* Item Dự thảo 1 */}
              <div className="p-5 hover:bg-muted/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-primary cursor-pointer hover:underline">
                      Dự thảo Kế hoạch ứng dụng CNTT và CĐS tỉnh Đắk Lắk giai đoạn 2026-2030
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Cơ quan chủ trì soạn thảo: <strong className="text-foreground">Sở Khoa học và Công nghệ tỉnh Đắk Lắk</strong>
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 font-semibold px-3 py-1">
                    <Clock className="h-3.5 w-3.5 mr-1.5" /> Hạn chót: 28/02/2026
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="col-span-2 bg-muted/20 border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-muted-foreground">Tiến độ phản hồi</span>
                      <span className="text-xs font-bold text-primary">12 / 15 đơn vị</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Sở Tài chính (Đã gửi)</Badge>
                      <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Sở Kế hoạch & Đầu tư (Đã gửi)</Badge>
                      <Badge variant="secondary" className="text-[10px] bg-rose-100 text-rose-700 hover:bg-rose-100">UBND TP. Buôn Ma Thuột (Chưa gửi)</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 justify-center">
                    <Button variant="outline" className="w-full justify-start h-9 bg-background">
                      <Download className="h-4 w-4 mr-2 text-muted-foreground" /> Tải File Dự thảo gốc
                    </Button>
                    <Button variant="default" className="w-full justify-start h-9">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Tổng hợp giải trình
                    </Button>
                  </div>
                </div>
              </div>

              {/* Item Dự thảo 2 */}
              <div className="p-5 hover:bg-muted/30 transition-colors opacity-70">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-foreground">
                      Dự thảo Quyết định sáp nhập Sở Thông tin Truyền thông vào Sở Khoa học Công nghệ
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Cơ quan chủ trì: <strong className="text-foreground">UBND Tỉnh</strong>
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-semibold px-3 py-1">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Đã đóng góp ý kiến
                  </Badge>
                </div>
                <div className="bg-muted/50 border rounded-lg p-3 mt-2 text-sm text-muted-foreground">
                  Đã hoàn tất báo cáo tổng hợp giải trình và trình UBND tỉnh vào ngày 20/02/2026.
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================== */}
        {/* TAB 3: CÔNG KHAI TÀI CHÍNH */}
        {/* ========================================== */}
        <TabsContent value="finance" className="mt-6 space-y-4">
          <Card className="border shadow-sm">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Hồ sơ Minh bạch Ngân sách
              </CardTitle>
              <CardDescription>
                Theo quy định tại Luật Ngân sách Nhà nước và Thông tư hướng dẫn về công khai tài chính cơ quan hành chính.
              </CardDescription>
            </CardHeader>
            <div className="p-4 flex gap-4 border-b bg-background">
              <Select defaultValue="2026">
                <SelectTrigger className="w-[120px] font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">Năm 2026</SelectItem>
                  <SelectItem value="2025">Năm 2025</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="ALL">
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả danh mục</SelectItem>
                  <SelectItem value="ESTIMATE">Dự toán thu chi</SelectItem>
                  <SelectItem value="SETTLEMENT">Quyết toán ngân sách</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1" />
              <Button variant="outline" className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10" onClick={onOpenFinanceModal}>
                <Upload className="h-4 w-4 mr-2" /> Đăng tải báo cáo
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tên báo cáo công khai</th>
                    <th className="px-5 py-3 font-semibold w-32">Năm TC</th>
                    <th className="px-5 py-3 font-semibold w-40">Phân loại</th>
                    <th className="px-5 py-3 font-semibold w-40">Ngày công khai</th>
                    <th className="px-5 py-3 font-semibold text-right w-32">Tệp đính kèm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-background">
                  <tr className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-medium text-foreground">
                      Quyết định công khai dự toán thu - chi ngân sách nhà nước năm 2026 của Sở KH&CN
                    </td>
                    <td className="px-5 py-4"><Badge variant="outline" className="font-mono">2026</Badge></td>
                    <td className="px-5 py-4"><Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none">Dự toán</Badge></td>
                    <td className="px-5 py-4 text-muted-foreground">05/01/2026</td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                        <Download className="h-4 w-4 mr-1.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="px-5 py-4 font-medium text-foreground">
                      Báo cáo công khai số liệu quyết toán thu, chi ngân sách nhà nước năm 2025
                    </td>
                    <td className="px-5 py-4"><Badge variant="outline" className="font-mono">2025</Badge></td>
                    <td className="px-5 py-4"><Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none">Quyết toán</Badge></td>
                    <td className="px-5 py-4 text-muted-foreground">20/02/2026</td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                        <Download className="h-4 w-4 mr-1.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
