import { useDocuments } from "@/features/document/hooks/useDocuments";

export default function ProcessingDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("PROCESSING");

  const { useListDocuments } = useDocuments();
  const { data: documentsData, isLoading } = useListDocuments({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    search: searchTerm,
  });

  const docs = documentsData?.data || [];

  return (
    <div className="p-6 space-y-8 bg-muted/5 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-600 shadow-sm">
              <Clock className="h-8 w-8" />
            </div>
            Văn bản Đang xử lý
          </h2>
          <p className="text-muted-foreground font-medium pl-14">
            Theo dõi tiến độ và xử lý các văn bản trong quy trình nghiệp vụ.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl border-muted-foreground/20 font-bold bg-background/50">
            <History className="h-4 w-4 mr-2" /> Nhật ký xử lý
          </Button>
          <Button className="flex-1 md:flex-none h-12 rounded-xl shadow-xl shadow-primary/20 bg-primary font-bold px-6">
            <Plus className="h-4 w-4 mr-2" /> Tạo dự thảo mới
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-foreground/5 bg-background/60 backdrop-blur-md rounded-3xl overflow-hidden">
        <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo trích yếu, người xử lý, bước hiện tại..."
              className="pl-11 h-12 bg-muted/20 border-none rounded-2xl focus-visible:ring-primary/20 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl border-none bg-muted/20 font-bold">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
              <SelectItem value="OVERDUE">Quá hạn</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10 font-bold">
            <Filter className="h-4 w-4 mr-2" /> Lọc thêm
          </Button>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 border-b">
              <tr>
                <th className="px-8 py-5 w-48">Thông tin chung</th>
                <th className="px-8 py-5">Trích yếu nội dung</th>
                <th className="px-8 py-5 w-64">Tiến độ & Người xử lý</th>
                <th className="px-8 py-5 w-48">Hạn xử lý</th>
                <th className="px-8 py-5 text-right w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-background/40">
              {isLoading ? (
                <tr><td colSpan={5} className="py-24 text-center text-muted-foreground font-medium italic">Đang tải luồng công việc...</td></tr>
              ) : docs.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-24 text-center">
                    <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Không có văn bản đang xử lý</h3>
                    <p className="text-sm text-muted-foreground mt-1">Các văn bản mới sẽ xuất hiện ở đây khi bắt đầu quy trình.</p>
                  </td>
                </tr>
              ) : docs.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-primary/[0.02] transition-all group cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono font-black text-primary text-sm tracking-tight">{doc.documentNumber || 'DỰ THẢO'}</span>
                      <Badge variant="outline" className="w-fit bg-muted/50 text-muted-foreground border-none text-[9px] px-1.5 py-0 font-black uppercase tracking-widest">
                        {doc.type?.name || 'Văn bản'}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors leading-relaxed line-clamp-2">
                      {doc.urgency === "FLASH" && <span className="text-rose-600 font-black mr-2">HỎA TỐC</span>}
                      {doc.abstract || doc.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" /> 0 Ý kiến
                      </span>
                      {doc.status === "OVERDUE" && (
                        <Badge className="bg-rose-500 text-white border-none shadow-none text-[9px] font-black px-1.5 py-0">Quá hạn</Badge>
                      )}
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <Badge className={`w-fit text-[9px] font-black uppercase tracking-wider shadow-none px-2 py-0.5 ${
                        doc.status === 'OVERDUE' ? 'bg-rose-100 text-rose-700' :
                        doc.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {doc.status === 'PROCESSING' ? 'Đang xử lý' : 
                         doc.status === 'PENDING_APPROVAL' ? 'Chờ phê duyệt' : 
                         doc.status === 'OVERDUE' ? 'Quá hạn' : doc.status}
                      </Badge>
                      <span className="text-sm font-bold text-foreground flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                           {doc.signerName?.charAt(0) || 'U'}
                        </div>
                        {doc.signerName || 'Chưa phân công'}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`font-black text-sm flex items-center gap-2 ${doc.status === 'OVERDUE' ? 'text-rose-600' : 'text-foreground'}`}>
                        <Clock className="h-4 w-4" /> {doc.processingDeadline ? new Date(doc.processingDeadline).toLocaleDateString('vi-VN') : '---'}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Bắt đầu: {new Date(doc.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <Link href={`/services/documents/processing/${doc.id}`}>
                      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-2xl shadow-sm hover:bg-primary hover:text-white transition-all transform group-hover:scale-110 active:scale-95">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

import { Plus } from "lucide-react";
