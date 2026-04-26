"use client";

import { useState } from "react";
import { Search, Plus, Filter, Eye, Download, Calendar, Users, ClipboardCheck, ArrowLeft, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MinutesForm } from "@/features/document/components/MinutesForm";

import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function MinutesPage() {
   const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
   const [searchTerm, setSearchTerm] = useState("");

   const { useListMinutes } = useDocuments();
   const { data: minutesData, isLoading } = useListMinutes({
      search: searchTerm,
   });

   const minutes = minutesData?.data || [];

   if (view === 'CREATE') {
      return (
         <div className="p-6 bg-muted/5 min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto">
               <Button variant="ghost" onClick={() => setView('LIST')} className="mb-6 hover:bg-background">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
               </Button>
               <MinutesForm onComplete={() => setView('LIST')} onCancel={() => setView('LIST')} />
            </div>
         </div>
      );
   }

   return (
      <div className="p-6 space-y-6 bg-muted/5 min-h-screen">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <ClipboardCheck className="h-7 w-7 text-primary" /> Quản lý Biên bản cuộc họp
               </h2>
               <p className="text-sm text-muted-foreground mt-1">Lưu trữ và quản lý diễn biến các cuộc họp, hội thảo tại đơn vị.</p>
            </div>
            <Button onClick={() => setView('CREATE')} className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-xl px-6 transition-all active:scale-95">
               <Plus className="h-4 w-4 mr-2" /> Tạo biên bản mới
            </Button>
         </div>

         <Card className="border-none shadow-xl shadow-foreground/5 bg-background/60 backdrop-blur-sm rounded-2xl overflow-hidden">
            <div className="p-5 border-b bg-background flex flex-wrap gap-3 items-center">
               <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                     placeholder="Tìm theo tiêu đề, địa điểm, thành phần tham dự..."
                     className="pl-10 h-11 bg-muted/20 border-none rounded-xl focus-visible:ring-primary/20"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="h-11 rounded-xl border-dashed border-2 hover:bg-muted/10 transition-colors">
                  <Filter className="h-4 w-4 mr-2" /> Bộ lọc
               </Button>
            </div>

            <CardContent className="p-0 overflow-x-auto">
               <table className="w-full text-sm text-left border-collapse">
                  <thead>
                     <tr className="bg-muted/30">
                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground w-48">Thời gian / Địa điểm</th>
                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Tiêu đề biên bản</th>
                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground w-64">Người tham dự</th>
                        <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right w-32">Thao tác</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                     {isLoading ? (
                        <tr><td colSpan={4} className="py-20 text-center text-muted-foreground italic">Đang tải danh sách biên bản...</td></tr>
                     ) : minutes.length === 0 ? (
                        <tr><td colSpan={4} className="py-20 text-center text-muted-foreground">Chưa có biên bản nào được ghi nhận.</td></tr>
                     ) : minutes.map((m: any) => (
                        <tr key={m.id} className="hover:bg-primary/[0.02] transition-all group cursor-pointer">
                           <td className="px-6 py-6">
                              <div className="flex flex-col gap-1">
                                 <span className="font-bold text-foreground">{new Date(m.startTime).toLocaleDateString('vi-VN')}</span>
                                 <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase">
                                    <Clock className="h-3 w-3" /> {new Date(m.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 <span className="text-[10px] text-primary/70 flex items-center gap-1 mt-1 font-medium italic">
                                    <MapPin className="h-3 w-3" /> {m.location || 'Chưa xác định'}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors text-base leading-snug">{m.title}</p>
                              <div className="flex items-center gap-2 mt-2">
                                 <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] shadow-none">
                                    {m.status === 'PUBLISHED' ? 'Đã ký phát hành' : 'Bản nháp'}
                                 </Badge>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex flex-col gap-1.5">
                                 <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" /> {m.participants?.split(',').length || 0} thành viên
                                 </div>
                                 <div className="flex -space-x-2">
                                    {m.participants?.split(',').slice(0, 3).map((p: string, i: number) => (
                                       <div key={i} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                                          {p.trim().charAt(0)}
                                       </div>
                                    ))}
                                    {m.participants?.split(',').length > 3 && (
                                       <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                          +{m.participants.split(',').length - 3}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Button variant="secondary" size="icon" className="rounded-full shadow-sm"><Eye className="h-4 w-4" /></Button>
                                 <Button variant="secondary" size="icon" className="rounded-full shadow-sm"><Download className="h-4 w-4" /></Button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               <div className="p-8 text-center bg-muted/5 border-t">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                     Hiển thị {minutes.length} biên bản
                  </p>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
