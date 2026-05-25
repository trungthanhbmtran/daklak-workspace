import React, { useState, useMemo } from 'react';
import { Plus, Target, TrendingUp, AlertTriangle, CheckCircle2, Trash2, Edit3 } from 'lucide-react';

// Giả định các thành phần Shadcn/ui đã được export từ thư mục ui
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface KPI {
  id: string;
  name: string;
  weight: number; // Phần trăm trọng số (ví dụ: 30)
  target: number; // Chỉ tiêu đặt ra
  actual: number; // Thực tế đạt được
  unit: string;   // Đơn vị tính (VND, %, Đại lý,...)
  category: 'Financial' | 'Customer' | 'Internal' | 'Growth'; // 4 khía cạnh BSC
  dueDate: string;
}

export interface KPIStats {
  totalKPIs: number;
  averageCompletion: number;
  atRiskCount: number;
  excellentCount: number;
}

const initialKPIs: KPI[] = [
  { id: '1', name: 'Doanh thu phát triển phần mềm', weight: 40, target: 1000, actual: 850, unit: 'Triệu VND', category: 'Financial', dueDate: '2026-06-30' },
  { id: '2', name: 'Tỷ lệ uptime hệ thống Microservices', weight: 30, target: 99.9, actual: 99.5, unit: '%', category: 'Internal', dueDate: '2026-12-31' },
  { id: '3', name: 'Số lượng đại lý/đối tác tích hợp LGSP mới', weight: 20, target: 10, actual: 12, unit: 'Đơn vị', category: 'Customer', dueDate: '2026-09-30' },
  { id: '4', name: 'Đào tạo chứng chỉ Kubernetes (CKA) cho team', weight: 10, target: 5, actual: 2, unit: 'Nhân sự', category: 'Growth', dueDate: '2026-11-15' },
];

export default function KPIDashboard() {
  const [kpis, setKPIs] = useState<KPI[]>(initialKPIs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);

  // Trạng thái Form
  const [formData, setFormData] = useState<Omit<KPI, 'id'>>({
    name: '', weight: 0, target: 0, actual: 0, unit: '', category: 'Financial', dueDate: ''
  });

  // Tự động tính toán các chỉ số tổng quan thông qua useMemo
  const stats = useMemo(() => {
    if (kpis.length === 0) return { totalKPIs: 0, averageCompletion: 0, atRiskCount: 0, excellentCount: 0 };

    let totalWeightedCompletion = 0;
    let totalWeight = 0;
    let atRisk = 0;
    let excellent = 0;

    kpis.forEach(kpi => {
      const completion = Math.min((kpi.actual / kpi.target) * 100, 150); // Giới hạn max 150% để tránh lệch phổ điểm
      totalWeightedCompletion += completion * (kpi.weight / 100);
      totalWeight += kpi.weight;

      if (completion < 80) atRisk++;
      if (completion >= 110) excellent++;
    });

    return {
      totalKPIs: kpis.length,
      // Tính toán trên tổng trọng số thực tế để tránh lỗi khi tổng weight chưa đủ 100%
      averageCompletion: totalWeight > 0 ? (totalWeightedCompletion / (totalWeight / 100)) : 0,
      atRiskCount: atRisk,
      excellentCount: excellent,
    };
  }, [kpis]);

  const totalWeightCheck = useMemo(() => kpis.reduce((acc, k) => acc + k.weight, 0), [kpis]);

  // Xử lý Thêm / Sửa
  const handleSaveKPI = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKpi) {
      setKPIs(kpis.map(k => k.id === editingKpi.id ? { ...formData, id: editingKpi.id } : k));
    } else {
      setKPIs([...kpis, { ...formData, id: crypto.randomUUID() }]);
    }
    handleCloseDialog();
  };

  const handleOpenEdit = (kpi: KPI) => {
    setEditingKpi(kpi);
    setFormData({ ...kpi });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chỉ số KPI này?')) {
      setKPIs(kpis.filter(k => k.id !== id));
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingKpi(null);
    setFormData({ name: '', weight: 0, target: 0, actual: 0, unit: '', category: 'Financial', dueDate: '' });
  };

  const getStatusBadge = (completion: number) => {
    if (completion < 80) return <Badge variant="destructive">Cần cố gắng</Badge>;
    if (completion < 100) return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Khá</Badge>;
    if (completion < 110) return <Badge className="bg-green-600 text-white hover:bg-green-700">Tốt</Badge>;
    return <Badge className="bg-purple-600 text-white hover:bg-purple-700">Xuất sắc</Badge>;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hệ thống Quản lý KPI</h1>
          <p className="text-muted-foreground">Theo dõi, phân bổ và đánh giá mục tiêu hiệu suất thời gian thực.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Thêm KPI Mục tiêu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingKpi ? 'Cập nhật chỉ số KPI' : 'Thiết lập KPI mới'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveKPI} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="name">Tên chỉ số (SMART)</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="category">Khía cạnh (BSC)</Label>
                  <Select value={formData.category} onValueChange={(val: any) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">Tài chính (Financial)</SelectItem>
                      <SelectItem value="Customer">Khách hàng (Customer)</SelectItem>
                      <SelectItem value="Internal">Quy trình nội bộ (Internal)</SelectItem>
                      <SelectItem value="Growth">Học hỏi & Phát triển (Growth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="weight">Trọng số (%)</Label>
                  <Input id="weight" type="number" min="1" max="100" required value={formData.weight || ''} onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="target">Chỉ tiêu (Target)</Label>
                  <Input id="target" type="number" step="any" required value={formData.target || ''} onChange={e => setFormData({ ...formData, target: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="actual">Thực tế (Actual)</Label>
                  <Input id="actual" type="number" step="any" required value={formData.actual ?? ''} onChange={e => setFormData({ ...formData, actual: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unit">Đơn vị tính</Label>
                  <Input id="unit" placeholder="%, VND..." required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dueDate">Hạn hoàn thành</Label>
                <Input id="dueDate" type="date" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>Hủy</Button>
                <Button type="submit">Lưu cấu hình</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cảnh báo phân bổ trọng số nếu chưa tối ưu */}
      {totalWeightCheck !== 100 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg flex items-center gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
          <span><strong>Lưu ý cấu hình:</strong> Tổng trọng số hiện tại của hệ thống đang là <strong>{totalWeightCheck}%</strong>. Hãy điều chỉnh tổng trọng số của các mục tiêu về đúng <strong>100%</strong> để đảm bảo điểm số quy đổi cuối cùng chính xác nhất.</span>
        </div>
      )}

      {/* 4 Thẻ chỉ số tổng quan */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mục tiêu đang quản lý</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalKPIs}</div>
            <p className="text-xs text-muted-foreground">Chỉ số KPI được phân rã</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hiệu suất tổng thể (Weighted)</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">{stats.averageCompletion.toFixed(1)}%</div>
            <Progress value={Math.min(stats.averageCompletion, 100)} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mục tiêu Xuất sắc</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.excellentCount}</div>
            <p className="text-xs text-muted-foreground">Đạt tiến độ từ 110% trở lên</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chỉ số cần lưu ý</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.atRiskCount}</div>
            <p className="text-xs text-muted-foreground">Hiệu suất đang dưới mức 80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng chi tiết KPI */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết phân bổ và tiến độ mục tiêu</CardTitle>
          <CardDescription>Bảng thống kê hiệu suất thực tế so với mục tiêu cam kết theo mô hình Balanced Scorecard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Tên chỉ số KPI</TableHead>
                <TableHead>Khía cạnh</TableHead>
                <TableHead className="text-center">Trọng số</TableHead>
                <TableHead className="text-right">Mục tiêu / Thực tế</TableHead>
                <TableHead className="w-[20%]">Tiến độ hoàn thành</TableHead>
                <TableHead className="text-center">Xếp loại</TableHead>
                <TableHead className="w-[80px] text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => {
                const completionRate = kpi.target > 0 ? (kpi.actual / kpi.target) * 100 : 0;
                return (
                  <TableRow key={kpi.id}>
                    <TableCell className="font-medium">
                      <div>{kpi.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Hạn: {kpi.dueDate}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{kpi.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{kpi.weight}%</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      <span className="text-muted-foreground">{kpi.target}</span>
                      <span className="mx-1">/</span>
                      <span className="font-bold text-primary">{kpi.actual}</span>
                      <span className="text-xs text-muted-foreground ml-1">{kpi.unit}</span>
                    </TableCell>
                    <TableCell className="space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span>{completionRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(completionRate, 100)} className="h-2" />
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(completionRate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(kpi)}>
                          <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(kpi.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {kpis.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Chưa có mục tiêu KPI nào được thiết lập. Ấn "Thêm KPI Mục tiêu" để bắt đầu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}