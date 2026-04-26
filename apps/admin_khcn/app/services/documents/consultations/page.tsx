"use client";

import { useState, useMemo } from "react";
import {
   Search, Filter, Plus, Clock,
   MessageSquareShare, CheckCircle2,
   Users, Download,
   ChevronRight, ArrowRight, BarChart3,
   Calendar, AlertCircle, FileText
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Select, SelectContent, SelectItem,
   SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import { useDocuments } from "@/features/document/hooks/useDocuments";
import { ConsultationCreateModal } from "@/features/document/components/ConsultationCreateModal";

export default function ConsultationsPage() {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [searchTerm, setSearchTerm] = useState("");
   const [statusFilter, setStatusFilter] = useState("OPEN");

   const { useListConsultations } = useDocuments();

   const { data, isLoading } = useListConsultations({
      status: statusFilter,
      search: searchTerm,
   });

   const consultations = useMemo(() => data?.data || [], [data]);

   const formatDate = (date?: string) => {
      if (!date) return "--";
      return new Date(date).toLocaleDateString("vi-VN", {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric'
      });
   };

   return (
      <div className="p-6 space-y-8 bg-muted/5 min-h-screen">

         {/* HEADER SECTION */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-foreground">
                  <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm">
                     <MessageSquareShare className="h-8 w-8" />
                  </div>
                  Lấy ý kiến dự thảo
               </h2>
               <p className="text-muted-foreground font-medium pl-14">
                  Theo dõi tiến độ và tổng hợp phản hồi từ các đơn vị phối hợp.
               </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <Link href="/services/documents/consultations/manage" className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full rounded-xl border-muted-foreground/20 hover:bg-muted/50 font-bold">
                     <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                     Báo cáo tổng hợp
                  </Button>
               </Link>

               <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 md:flex-none rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold px-6"
               >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo đợt lấy ý kiến
               </Button>
            </div>
         </div>

         {/* CONTROL BAR */}
         <Card className="border-none shadow-xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-2xl p-4 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex flex-col lg:flex-row gap-4 items-center">
               
               {/* SEARCH BOX */}
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder="Tìm kiếm theo tiêu đề dự thảo hoặc đơn vị..."
                     className="pl-12 h-12 bg-muted/20 border-none rounded-xl focus-visible:ring-primary/30 font-medium"
                  />
               </div>

               <div className="flex items-center gap-3 w-full lg:w-auto">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                     <SelectTrigger className="w-full lg:w-[220px] h-12 rounded-xl border-muted-foreground/10 bg-background font-bold text-sm shadow-sm">
                        <div className="flex items-center gap-2">
                           <div className={`h-2 w-2 rounded-full ${statusFilter === 'OPEN' ? 'bg-emerald-500' : statusFilter === 'CLOSED' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                           <SelectValue />
                        </div>
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        <SelectItem value="OPEN" className="font-bold py-2.5">Đang lấy ý kiến</SelectItem>
                        <SelectItem value="CLOSED" className="font-bold py-2.5">Đã kết thúc</SelectItem>
                        <SelectItem value="PENDING" className="font-bold py-2.5">Chờ kích hoạt</SelectItem>
                     </SelectContent>
                  </Select>

                  <Button variant="outline" className="h-12 w-12 rounded-xl border-muted-foreground/10 p-0 shrink-0">
                     <Filter className="h-5 w-5 text-muted-foreground" />
                  </Button>
               </div>
            </div>
         </Card>

         {/* MAIN LIST SECTION */}
         <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Đang tải dữ liệu hệ thống...</p>
               </div>
            ) : consultations.length === 0 ? (
               <Card className="border-none shadow-lg py-24 flex flex-col items-center justify-center rounded-3xl bg-background/40">
                  <div className="p-6 bg-muted/20 rounded-full mb-4">
                     <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Không tìm thấy đợt lấy ý kiến nào</h3>
                  <p className="text-muted-foreground mt-2 font-medium">Vui lòng thử lại với bộ lọc khác hoặc tạo mới đợt lấy ý kiến.</p>
               </Card>
            ) : consultations.map((con: any) => {
               const progress = con.totalUnits > 0 ? Math.round((con.totalResponses / con.totalUnits) * 100) : 0;
               const isUrgent = con.isUrgent;

               return (
                  <Card key={con.id} className="border-none shadow-2xl shadow-foreground/5 overflow-hidden group hover:shadow-primary/10 transition-all duration-500 rounded-3xl bg-background flex flex-col md:flex-row">
                     
                     {/* CARD MAIN CONTENT */}
                     <div className="flex-1 p-8 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                           <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                 {isUrgent && (
                                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 shadow-none font-black text-[10px] uppercase px-2.5 py-1 rounded-md animate-pulse">
                                       <Clock className="h-3 w-3 mr-1" /> Hỏa tốc
                                    </Badge>
                                 )}
                                 <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground border-muted-foreground/20 px-2 py-1 rounded-md">
                                    ID: {con.id.split('-')[0].toUpperCase()}
                                 </Badge>
                              </div>
                              <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                                 {con.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                                 <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary/60" />
                                    <span>Chủ trì: <strong className="text-foreground">{con.issuerName || "Sở KH&CN"}</strong></span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary/60" />
                                    <span>Bắt đầu: <strong className="text-foreground">{formatDate(con.createdAt)}</strong></span>
                                 </div>
                              </div>
                           </div>

                           <div className={`px-5 py-2 rounded-2xl font-black text-xs shadow-inner ${
                              con.status === "OPEN" ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                           }`}>
                              {con.status === "OPEN" ? "ĐANG LẤY Ý KIẾN" : "ĐÃ KẾT THÚC"}
                           </div>
                        </div>

                        {/* PROGRESS SECTION */}
                        <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-muted-foreground/5">
                           <div className="flex justify-between items-end">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tiến độ phản hồi</p>
                                 <p className="text-xl font-black text-primary">{con.totalResponses} / {con.totalUnits} <span className="text-sm font-bold text-muted-foreground uppercase ml-1">Đơn vị</span></p>
                              </div>
                              <div className="text-right">
                                 <p className="text-2xl font-black text-foreground">{progress}%</p>
                              </div>
                           </div>

                           <div className="relative">
                              <Progress value={progress} className="h-3 bg-muted/50 rounded-full" />
                              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent to-white/20 pointer-events-none" />
                           </div>

                           <div className="flex justify-between items-center pt-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                 Đã hoàn thành: {con.totalResponses}
                              </div>
                              <div className={`flex items-center gap-1.5 text-xs font-bold ${con.status === 'OPEN' ? 'text-rose-600' : 'text-muted-foreground'}`}>
                                 <Clock className="h-3.5 w-3.5" />
                                 Hạn chót: {formatDate(con.deadline)}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* CARD ACTIONS SIDEBAR */}
                     <div className="w-full md:w-80 bg-muted/20 border-l border-muted p-8 flex flex-col justify-between gap-6">
                        <div className="space-y-4">
                           <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
                              <FileText className="h-4 w-4" /> Tài liệu đính kèm
                           </div>
                           
                           {con.documentId ? (
                              <a
                                 href={`/api/v1/media/download/${con.documentId}`}
                                 target="_blank"
                                 className="block"
                              >
                                 <Button variant="outline" className="w-full justify-start h-12 rounded-xl bg-background border-muted hover:border-primary/40 hover:bg-primary/5 group/btn transition-all">
                                    <Download className="h-5 w-5 mr-3 text-primary group-hover/btn:scale-110 transition-transform" />
                                    <div className="text-left overflow-hidden">
                                       <p className="text-[11px] font-bold text-muted-foreground uppercase leading-none mb-1">Download</p>
                                       <p className="text-sm font-black text-foreground truncate">Dự thảo văn bản.pdf</p>
                                    </div>
                                 </Button>
                              </a>
                           ) : (
                              <div className="p-4 rounded-xl border border-dashed border-muted-foreground/20 text-center">
                                 <p className="text-xs font-bold text-muted-foreground">Không có tệp đính kèm</p>
                              </div>
                           )}
                        </div>

                        <div className="space-y-3">
                           <Link href={`/services/documents/consultations/${con.id}`} className="block">
                              <Button className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black shadow-xl shadow-foreground/10 text-lg group/more">
                                 Chi tiết <ArrowRight className="h-5 w-5 ml-3 group-hover/more:translate-x-1 transition-transform" />
                              </Button>
                           </Link>
                           <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-primary">
                              Tổng hợp nhanh
                           </Button>
                        </div>
                     </div>
                  </Card>
               );
            })}
         </div>
         <ConsultationCreateModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
         />
      </div>
   );
}