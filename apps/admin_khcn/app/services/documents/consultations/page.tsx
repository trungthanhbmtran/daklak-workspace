"use client";

import { useState, useMemo } from "react";
import {
   Search, Filter, Plus, Clock,
   MessageSquareShare, CheckCircle2,
   Users, Download,
   ChevronRight, ArrowRight, BarChart3
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Select, SelectContent, SelectItem,
   SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function ConsultationsPage() {
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
      return new Date(date).toLocaleDateString("vi-VN");
   };

   return (
      <div className="p-6 space-y-6 bg-muted/5 min-h-screen">

         {/* HEADER */}
         <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
               <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquareShare className="h-7 w-7 text-primary" />
                  Quản lý Lấy ý kiến dự thảo
               </h2>
               <p className="text-sm text-muted-foreground mt-1">
                  Theo dõi phản hồi từ các đơn vị.
               </p>
            </div>

            <div className="flex gap-2">
               <Link href="/services/documents/consultations/manage">
                  <Button variant="outline">
                     <BarChart3 className="h-4 w-4 mr-2" />
                     Báo cáo
                  </Button>
               </Link>

               <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo mới
               </Button>
            </div>
         </div>

         {/* FILTER */}
         <Card className="p-4 flex flex-wrap gap-4 items-center">

            {/* SEARCH */}
            <div className="relative flex-1 min-w-[250px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
               <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm dự thảo..."
                  className="pl-10 h-11"
               />
            </div>

            {/* STATUS */}
            <Select
               value={statusFilter}
               onValueChange={setStatusFilter}
            >
               <SelectTrigger className="w-[180px] h-11">
                  <SelectValue />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="OPEN">Đang lấy ý kiến</SelectItem>
                  <SelectItem value="CLOSED">Đã kết thúc</SelectItem>
                  <SelectItem value="PENDING">Chờ kích hoạt</SelectItem>
               </SelectContent>
            </Select>

            <Button variant="outline">
               <Filter className="h-4 w-4 mr-2" />
               Lọc nâng cao
            </Button>
         </Card>

         {/* LIST */}
         <div className="space-y-6">
            {isLoading ? (
               <div className="text-center py-20">Đang tải...</div>
            ) : consultations.length === 0 ? (
               <div className="text-center py-20">Không có dữ liệu</div>
            ) : consultations.map((con: any) => {

               const progress =
                  con.totalUnits > 0
                     ? Math.round((con.totalResponses / con.totalUnits) * 100)
                     : 0;

               return (
                  <Card key={con.id} className="p-6">

                     {/* HEADER */}
                     <div className="flex justify-between mb-4">
                        <div>
                           <h3 className="font-bold text-lg">{con.title}</h3>
                           <p className="text-sm text-muted-foreground flex gap-2 items-center">
                              <Users className="h-4 w-4" />
                              {con.issuerName || "Sở KH&CN"}
                           </p>
                        </div>

                        <Badge>
                           {con.status === "OPEN"
                              ? "ĐANG LẤY Ý KIẾN"
                              : "ĐÃ KẾT THÚC"}
                        </Badge>
                     </div>

                     {/* PROGRESS */}
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                           <span>Tiến độ</span>
                           <span>{progress}%</span>
                        </div>

                        <Progress value={progress} />

                        <div className="flex justify-between text-xs text-muted-foreground">
                           <span>Bắt đầu: {formatDate(con.createdAt)}</span>
                           <span>Hạn: {formatDate(con.deadline)}</span>
                        </div>
                     </div>

                     {/* ACTION */}
                     <div className="flex justify-between mt-4">
                        {con.documentId && (
                           <a
                              href={`/api/v1/media/download/${con.documentId}`}
                              target="_blank"
                           >
                              <Button variant="outline" size="sm">
                                 <Download className="h-4 w-4 mr-2" />
                                 Tải file
                              </Button>
                           </a>
                        )}

                        <Link href={`/services/documents/consultations/${con.id}`}>
                           <Button size="sm">
                              Chi tiết
                              <ArrowRight className="h-4 w-4 ml-2" />
                           </Button>
                        </Link>
                     </div>
                  </Card>
               );
            })}
         </div>
      </div>
   );
}