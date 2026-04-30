"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, XCircle, Clock, MessageSquare, 
  User, Mail, Phone, Calendar, ShieldCheck, 
  Search, Filter, MoreHorizontal, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDocuments, usePublicComments } from '../hooks/useDocuments';

interface PublicCommentModerationProps {
  consultationId: string;
}

export const PublicCommentModeration: React.FC<PublicCommentModerationProps> = ({ consultationId }) => {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const { data: comments, isLoading } = usePublicComments(consultationId, filterStatus);
  const { moderateComment } = useDocuments();

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await moderateComment({ id, status });
    } catch (error) {
      console.error("Moderation error:", error);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Đang tải danh sách góp ý...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Kiểm duyệt góp ý công chúng
          </h3>
          <p className="text-xs text-muted-foreground">Xem xét và phê duyệt các ý kiến đóng góp từ người dân.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {comments?.length || 0} Góp ý
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {comments?.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-muted/5">
            <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Chưa có góp ý nào cần kiểm duyệt.</p>
          </div>
        ) : (
          comments?.map((comment: any) => (
            <Card key={comment.id} className={`border-none shadow-sm transition-all hover:shadow-md ${
              comment.status === 'APPROVED' ? 'bg-emerald-50/30' : 
              comment.status === 'REJECTED' ? 'bg-red-50/30' : 
              'bg-background'
            }`}>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{comment.fullName}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                          {comment.email && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {comment.email}
                            </span>
                          )}
                          {comment.phoneNumber && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {comment.phoneNumber}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(comment.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed border border-muted/50 italic text-foreground/80">
                      "{comment.content}"
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Badge className={`font-black text-[9px] uppercase tracking-tighter px-2 py-0.5 ${
                        comment.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                        comment.status === 'REJECTED' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                        'bg-amber-100 text-amber-700 hover:bg-amber-100'
                      }`}>
                        {comment.status === 'APPROVED' ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" /> Đã duyệt</span>
                        ) : comment.status === 'REJECTED' ? (
                          <span className="flex items-center gap-1"><XCircle className="h-2.5 w-2.5" /> Từ chối</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> Chờ duyệt</span>
                        )}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl shadow-xl">
                          <DropdownMenuItem className="rounded-lg text-xs font-bold py-2 gap-2 cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50" onClick={() => handleModerate(comment.id, 'APPROVED')}>
                            <CheckCircle2 className="h-4 w-4" /> Chấp nhận góp ý
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg text-xs font-bold py-2 gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => handleModerate(comment.id, 'REJECTED')}>
                            <XCircle className="h-4 w-4" /> Từ chối góp ý
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg text-xs font-bold py-2 gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" /> Xem chi tiết hồ sơ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {comment.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleModerate(comment.id, 'REJECTED')}>
                          Từ chối
                        </Button>
                        <Button size="sm" className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700" onClick={() => handleModerate(comment.id, 'APPROVED')}>
                          Phê duyệt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
