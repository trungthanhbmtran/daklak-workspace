import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import { useDocuments } from "@/features/document/hooks/useDocuments";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#16a34a", "#dc2626"]; // green-600, red-600

export function LgspEvaluationClient() {
  const [data, setData] = useState<any>(null);
  const { fetchLgspStatistics, isLoading } = useDocuments();

  const [form, setForm] = useState({
    from_organ_id: "H15.151",
    document_type: "8",
    trang_thai_tiep_nhan: "all",
    subject: "minh",
    start_date: "2026-07-01",
    end_date: "2026-09-30",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFetch = async () => {
    setData(null);
    try {
      const payload = {
        ...form,
        searchKeyword: [
          { filter: "document_id", value: "r", type: "like" },
          { filter: "type_edoc", value: "edoc", type: "=" }
        ]
      };
      const result = await fetchLgspStatistics(payload);
      setData(result);
    } catch (err: any) {
      // toast will be handled by the hook
    }
  };

  const chartData = data ? [
    { name: "Đúng hạn", value: data.done || 0 },
    { name: "Trễ hạn / Lỗi", value: data.failed || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tham số bộ lọc Trục LGSP</CardTitle>
          <CardDescription>Cấu hình tham số để lấy số liệu xử lý văn bản thực tế, phục vụ đánh giá và tính điểm hệ thống KPI tự động.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Mã đơn vị (from_organ_id)</Label>
              <Input name="from_organ_id" value={form.from_organ_id} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Loại văn bản (document_type)</Label>
              <Input name="document_type" value={form.document_type} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái tiếp nhận</Label>
              <select 
                name="trang_thai_tiep_nhan" 
                value={form.trang_thai_tiep_nhan} 
                onChange={handleChange}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="done">Hoàn thành đúng hạn (done)</option>
                <option value="fail">Trễ hạn / Thất bại (fail)</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Từ khóa trích yếu (subject)</Label>
              <Input name="subject" value={form.subject} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Từ ngày (start_date)</Label>
              <Input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày (end_date)</Label>
              <Input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
            </div>
          </div>
          <Button onClick={handleFetch} disabled={isLoading} className="w-full md:w-auto mt-4">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            Trích xuất Dữ liệu Đánh giá
          </Button>
        </CardContent>
      </Card>

      {data && (
        <Card className="animate-in fade-in zoom-in duration-300">
          <CardHeader>
            <CardTitle>Báo Cáo Tỷ Lệ Xử Lý Trục Liên Thông</CardTitle>
            <CardDescription>Biểu đồ trực quan và danh sách chi tiết các văn bản.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Cột Thống Kê Chữ */}
              <div className="space-y-4 flex flex-col justify-center">
                <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-100 shadow-sm transition-all hover:shadow-md">
                  <div className="text-sm text-slate-500 font-medium">Tổng số văn bản cần xử lý</div>
                  <div className="text-5xl font-extrabold mt-2 text-slate-800">{data.total}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50/50 p-4 rounded-xl text-center border border-green-100 shadow-sm transition-all hover:shadow-md hover:border-green-200">
                    <div className="text-sm text-green-700 font-medium flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Đúng hạn</div>
                    <div className="text-4xl font-bold mt-2 text-green-600">{data.done}</div>
                  </div>
                  <div className="bg-red-50/50 p-4 rounded-xl text-center border border-red-100 shadow-sm transition-all hover:shadow-md hover:border-red-200">
                    <div className="text-sm text-red-700 font-medium flex items-center justify-center gap-1.5"><XCircle className="w-4 h-4"/> Trễ hạn / Lỗi</div>
                    <div className="text-4xl font-bold mt-2 text-red-600">{data.failed}</div>
                  </div>
                </div>
              </div>

              {/* Cột Biểu Đồ Tròn */}
              <div className="h-[300px] w-full flex items-center justify-center bg-slate-50/30 rounded-xl border border-slate-100">
                {data.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} văn bản`, "Số lượng"]} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm">Không có dữ liệu biểu đồ</p>
                )}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Chi Tiết Văn Bản Liên Thông</h3>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[100px]">Mã VB</TableHead>
                    <TableHead>Trích yếu</TableHead>
                    <TableHead className="text-right">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items?.length > 0 ? (
                    data.items.map((item: any, idx: number) => (
                      <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-700">{item.id}</TableCell>
                        <TableCell className="text-slate-600">{item.subject}</TableCell>
                        <TableCell className="text-right">
                          {item.status === "fail" ? (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20 shadow-sm">
                              Thất bại / Trễ hạn
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 shadow-sm">
                              Hoàn thành
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6 text-slate-500">
                        Không có dữ liệu trong thời gian này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
