"use client";

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileCode2,
  Download,
  Eye,
  Edit,
  Code2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Search,
  Shield,
  Layers,
  Sparkles,
  Save,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import {
  useGetKpiForms,
  useGetKpiFormDetail,
  useUpdateKpiForm,
  useSaveKpiFormXml,
  useValidateKpiXml
} from '@/features/hrm/hooks/useKpiForms';
import { kpiFormsApi, KpiFormTemplateItem, ValidateXmlResult } from '@/features/hrm/api/kpi-forms.api';

export function EvaluationFormsClient() {
  const { data: forms = [], isLoading, refetch, isRefetching } = useGetKpiForms();
  const updateFormMutation = useUpdateKpiForm();
  const saveXmlMutation = useSaveKpiFormXml();
  const validateXmlMutation = useValidateKpiXml();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Sheet states
  const [previewFormCode, setPreviewFormCode] = useState<string | null>(null);
  const [editXmlFormCode, setEditXmlFormCode] = useState<string | null>(null);
  const [editMetaForm, setEditMetaForm] = useState<KpiFormTemplateItem | null>(null);

  // XML Editor states
  const [editingXmlText, setEditingXmlText] = useState('');
  const [validationResult, setValidationResult] = useState<ValidateXmlResult | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Meta Edit states
  const [metaName, setMetaName] = useState('');
  const [metaDesc, setMetaDesc] = useState('');

  // Detail query for Preview
  const { data: previewDetail, isLoading: isLoadingPreview } = useGetKpiFormDetail(previewFormCode);

  // Lọc danh sách
  const filteredForms = forms.filter((f: KpiFormTemplateItem) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || f.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories: string[] = ['ALL', ...Array.from(new Set(forms.map((f: KpiFormTemplateItem) => f.category)))];

  // Xử lý mở preview
  const handleOpenPreview = (formCode: string) => {
    setPreviewFormCode(formCode);
  };

  // Xử lý mở XML editor
  const handleOpenEditXml = async (form: KpiFormTemplateItem) => {
    setEditXmlFormCode(form.formCode);
    setValidationResult(null);
    try {
      const res = await kpiFormsApi.getXml(form.formCode);
      const data = res.data;
      setEditingXmlText(data?.xmlContent || '');
    } catch {
      toast.error('Không thể nạp nội dung XML mẫu');
      setEditingXmlText('');
    }
  };

  // Xử lý mở sửa metadata
  const handleOpenEditMeta = (form: KpiFormTemplateItem) => {
    setEditMetaForm(form);
    setMetaName(form.name);
    setMetaDesc(form.description || '');
  };

  // Sao chép XML
  const handleCopyXml = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success('Đã sao chép nội dung XML vào bộ nhớ đệm');
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Kiểm tra cú pháp XML
  const handleValidateXml = async () => {
    if (!editingXmlText.trim()) {
      toast.error('Vui lòng nhập nội dung XML');
      return;
    }
    try {
      const res = await validateXmlMutation.mutateAsync(editingXmlText);
      setValidationResult(res);
      if (res.isValid) {
        toast.success('Cú pháp XML hợp lệ!');
      } else {
        toast.error(`XML không hợp lệ: ${res.error || res.message}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi khi kiểm tra XML');
    }
  };

  // Lưu XML
  const handleSaveXml = async () => {
    if (!editXmlFormCode) return;
    try {
      await saveXmlMutation.mutateAsync({
        formCode: editXmlFormCode,
        xmlContent: editingXmlText,
      });
      setEditXmlFormCode(null);
    } catch {
      // Error handled by mutation
    }
  };

  // Lưu Metadata
  const handleSaveMeta = async () => {
    if (!editMetaForm) return;
    try {
      await updateFormMutation.mutateAsync({
        formCode: editMetaForm.formCode,
        payload: {
          name: metaName,
          description: metaDesc,
          templateFileId: editMetaForm.templateFileId,
        },
      });
      setEditMetaForm(null);
    } catch {
      // Error handled by mutation
    }
  };

  const getFormBadgeColor = (code: string) => {
    switch (code) {
      case 'MAU_01':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MAU_02':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'MAU_03':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MAU_04':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MAU_05':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full w-full space-y-6 min-w-0">
      {/* 1. Header Banner */}
      <Card className="border shadow-sm bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white overflow-hidden relative min-w-0">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <FileCode2 className="w-64 h-64 text-white" />
        </div>
        <CardHeader className="p-6 relative z-10 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs">
                  Cơ quan: Ban Tổ chức Tỉnh ủy Đắk Lắk
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs">
                  Chuẩn hóa XML Schema v1.0
                </Badge>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs">
                  ATTT Cấp độ 3 (NĐ 85/2016)
                </Badge>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-blue-300 shrink-0" />
                Nơi Chứa Mẫu Đánh Giá & Quản Lý File Mẫu XML
              </CardTitle>
              <CardDescription className="text-slate-300 text-sm max-w-3xl leading-relaxed">
                Kho lưu trữ trung tâm các biểu mẫu đánh giá, xếp loại KPI/OKR chuẩn hóa của Ban Tổ chức Tỉnh ủy theo Hướng dẫn số 05-HD/TU và Quy định số 01-QĐ/BTCTU. Hỗ trợ xem trước, tải về, chỉnh sửa và kiểm định tính hợp lệ XML của 05 biểu mẫu hành chính (Mẫu 01 đến Mẫu 05).
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 h-10 px-4"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 2. Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card className="p-4 border shadow-xs bg-card flex items-center gap-4 min-w-0">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tổng số Biểu mẫu</p>
            <h4 className="text-2xl font-black text-foreground mt-0.5">{forms.length} Mẫu chuẩn</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Mẫu 01 - Mẫu 05 (Quy chế BTCTU)</p>
          </div>
        </Card>

        <Card className="p-4 border shadow-xs bg-card flex items-center gap-4 min-w-0">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">File XML Mẫu</p>
            <h4 className="text-2xl font-black text-emerald-700 mt-0.5">100% Sẵn sàng</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Có đầy đủ file XML trên máy chủ</p>
          </div>
        </Card>

        <Card className="p-4 border shadow-xs bg-card flex items-center gap-4 min-w-0">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đối tượng áp dụng</p>
            <h4 className="text-2xl font-black text-foreground mt-0.5">22 VTVL & 05 Phòng</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Bao phủ toàn diện cơ quan</p>
          </div>
        </Card>

        <Card className="p-4 border shadow-xs bg-card flex items-center gap-4 min-w-0">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Kiểm soát Chất lượng</p>
            <h4 className="text-2xl font-black text-amber-800 mt-0.5">Trần 20% & 3 Mức lỗi</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Trừ -5%, -15%, -35%</p>
          </div>
        </Card>
      </div>

      {/* 3. Toolbar tìm kiếm & Lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border shadow-2xs min-w-0">
        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã mẫu (MAU_01), tên biểu mẫu, đối tượng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs h-9 rounded-lg shrink-0"
            >
              {cat === 'ALL' ? 'Tất cả nhóm' : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* 4. Danh sách Biểu mẫu Đánh giá (Lưới thẻ) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-600" />
            Đang nạp danh mục biểu mẫu đánh giá...
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center p-12 bg-card border rounded-2xl">
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-bold text-lg text-foreground">Không tìm thấy biểu mẫu phù hợp</h3>
            <p className="text-sm text-muted-foreground mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn tất cả danh mục.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-w-0 pb-8">
            {filteredForms.map((item: KpiFormTemplateItem) => (
              <Card
                key={item.formCode}
                className="flex flex-col border shadow-xs hover:shadow-md transition-all duration-200 bg-card rounded-2xl overflow-hidden min-w-0"
              >
                <CardHeader className="p-5 pb-3 border-b bg-muted/20 min-w-0">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black border ${getFormBadgeColor(item.formCode)} shrink-0`}>
                        {item.formCode}
                      </span>
                      <Badge variant="secondary" className="text-xs truncate max-w-[180px]">
                        {item.category}
                      </Badge>
                    </div>

                    <span className="text-xs text-muted-foreground font-mono shrink-0">
                      v{item.schemaVersion}
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground mt-3 leading-snug break-words">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 break-words">
                    {item.description || 'Chưa có mô tả chi tiết'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4 text-xs min-w-0">
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center justify-between text-muted-foreground gap-2">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Tag className="w-3.5 h-3.5 text-blue-600" /> Đối tượng:
                      </span>
                      <span className="font-medium text-foreground text-right truncate">
                        {item.targetRole}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground gap-2">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <FileCode2 className="w-3.5 h-3.5 text-indigo-600" /> Tên file mẫu:
                      </span>
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] truncate max-w-[200px]">
                        {item.templateFileId || `${item.formCode.toLowerCase()}.xml`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground gap-2">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" /> Dung lượng file XML:
                      </span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        {(item.xmlSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground gap-2">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> Tài liệu đã tạo:
                      </span>
                      <span className="font-bold text-foreground">
                        {item.documentCount} văn bản
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground min-w-0">
                    <span className="truncate">Căn cứ: 05-HD/TU & 01-QĐ/BTCTU</span>
                    <span className="font-mono shrink-0">XML 1.0 UTF-8</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 bg-muted/10 border-t flex flex-wrap gap-2 justify-between items-center min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPreview(item.formCode)}
                      className="h-8 px-2.5 text-xs gap-1.5 hover:text-blue-600 hover:border-blue-300"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem trước
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-8 px-2.5 text-xs gap-1.5 hover:text-emerald-600 hover:border-emerald-300"
                    >
                      <a href={kpiFormsApi.getDownloadUrl(item.formCode)} download>
                        <Download className="w-3.5 h-3.5" /> Tải XML
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditXml(item)}
                      className="h-8 px-2.5 text-xs gap-1.5 hover:text-indigo-600 hover:border-indigo-300"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Sửa XML
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditMeta(item)}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Chỉnh sửa thông tin biểu mẫu"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. SHEET: XEM TRƯỚC FILE XML MẪU (Theo Rule 1: Form dài/nhiều tab) */}
      {/* ============================================================== */}
      <Sheet open={Boolean(previewFormCode)} onOpenChange={(open) => !open && setPreviewFormCode(null)}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0 gap-0 min-w-0 bg-card">
          <SheetHeader className="p-6 border-b shrink-0 bg-muted/20 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <Badge variant="outline" className={`font-mono font-bold text-xs ${getFormBadgeColor(previewFormCode || '')}`}>
                {previewFormCode}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {previewDetail?.templateFileId || ''}
              </span>
            </div>
            <SheetTitle className="text-xl font-bold mt-2 text-foreground break-words">
              {previewDetail?.name || 'Đang tải thông tin biểu mẫu...'}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1 break-words">
              {previewDetail?.description || 'Xem trước cấu trúc file XML chuẩn của Ban Tổ chức Tỉnh ủy.'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 p-6 overflow-y-auto">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                Đang nạp file XML mẫu...
              </div>
            ) : (
              <Tabs defaultValue="xml" className="w-full flex flex-col h-full">
                <TabsList className="grid grid-cols-3 mb-4 shrink-0">
                  <TabsTrigger value="xml" className="text-xs gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5" /> Mã nguồn XML
                  </TabsTrigger>
                  <TabsTrigger value="placeholders" className="text-xs gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Biến số ({previewDetail?.placeholders?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="info" className="text-xs gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Thông tin mẫu
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: XML CODE */}
                <TabsContent value="xml" className="flex-1 flex flex-col gap-3 min-h-0 m-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Định dạng: XML 1.0 (UTF-8 không BOM)</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyXml(previewDetail?.xmlContent || '')}
                      className="h-7 text-xs gap-1"
                    >
                      {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {hasCopied ? 'Đã chép' : 'Sao chép XML'}
                    </Button>
                  </div>

                  <div className="relative flex-1 min-h-[350px] max-h-[500px] overflow-auto bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 leading-relaxed shadow-inner">
                    <pre className="whitespace-pre break-words">
                      <code>{previewDetail?.xmlContent}</code>
                    </pre>
                  </div>
                </TabsContent>

                {/* TAB 2: PLACEHOLDERS */}
                <TabsContent value="placeholders" className="space-y-4 min-h-0 m-0">
                  <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs leading-relaxed">
                    Hệ thống sẽ tự động điền các thông tin thực tế của cán bộ, nhiệm vụ và điểm số vào các biến số dưới đây khi sinh tài liệu.
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto p-1">
                    {previewDetail?.placeholders?.map((p: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="font-mono text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border cursor-pointer"
                        onClick={() => handleCopyXml(`{{${p}}}`)}
                        title="Bấm để sao chép"
                      >
                        {`{{${p}}}`}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>

                {/* TAB 3: INFO */}
                <TabsContent value="info" className="space-y-4 min-h-0 m-0 text-sm">
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                    <div>
                      <p className="text-xs text-muted-foreground">Mã biểu mẫu:</p>
                      <p className="font-bold font-mono text-foreground mt-0.5">{previewDetail?.formCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phân nhóm:</p>
                      <p className="font-semibold text-foreground mt-0.5">{previewDetail?.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Đối tượng áp dụng:</p>
                      <p className="font-semibold text-foreground mt-0.5">{previewDetail?.targetRole}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phiên bản Schema:</p>
                      <p className="font-mono text-foreground mt-0.5">v{previewDetail?.schemaVersion}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kích thước file:</p>
                      <p className="font-mono text-emerald-700 font-bold mt-0.5">
                        {((previewDetail?.xmlSize || 0) / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Văn bản đã tạo:</p>
                      <p className="font-bold text-foreground mt-0.5">{previewDetail?.documentCount}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                    <p className="font-bold">Căn cứ ban hành & Thẩm quyền:</p>
                    <p>- Quy định số 01-QĐ/BTCTU của Ban Tổ chức Tỉnh ủy Đắk Lắk.</p>
                    <p>- Hướng dẫn số 05-HD/TU của Ban Thường vụ Tỉnh ủy.</p>
                    <p>- Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương.</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <SheetFooter className="p-4 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewFormCode(null)}
              className="text-xs"
            >
              Đóng
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const form = forms.find((f: KpiFormTemplateItem) => f.formCode === previewFormCode);
                  setPreviewFormCode(null);
                  if (form) handleOpenEditXml(form);
                }}
                className="text-xs gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" /> Chỉnh sửa XML
              </Button>

              {previewFormCode && (
                <Button
                  size="sm"
                  asChild
                  className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <a href={kpiFormsApi.getDownloadUrl(previewFormCode)} download>
                    <Download className="w-3.5 h-3.5" /> Tải về máy (.xml)
                  </a>
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ============================================================== */}
      {/* 6. SHEET: CHỈNH SỬA & VALIDATE XML MẪU                         */}
      {/* ============================================================== */}
      <Sheet open={Boolean(editXmlFormCode)} onOpenChange={(open) => !open && setEditXmlFormCode(null)}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col p-0 gap-0 min-w-0 bg-card">
          <SheetHeader className="p-6 border-b shrink-0 bg-muted/20 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <Badge variant="outline" className={`font-mono font-bold text-xs ${getFormBadgeColor(editXmlFormCode || '')}`}>
                {editXmlFormCode}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Chỉnh sửa file XML mẫu
              </span>
            </div>
            <SheetTitle className="text-xl font-bold mt-2 text-foreground break-words">
              Chỉnh Sửa Mã Nguồn File Mẫu XML
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Sửa đổi nội dung cấu trúc XML. Hãy bấm &quot;Kiểm tra cú pháp (Validate)&quot; trước khi bấm Lưu để đảm bảo file XML không bị lỗi đóng mở thẻ.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">
                Nội dung XML (XML 1.0, UTF-8):
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidateXml}
                disabled={validateXmlMutation.isPending}
                className="h-8 text-xs gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
              >
                {validateXmlMutation.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Kiểm tra cú pháp (Validate)
              </Button>
            </div>

            <Textarea
              value={editingXmlText}
              onChange={(e) => {
                setEditingXmlText(e.target.value);
                setValidationResult(null);
              }}
              rows={18}
              className="font-mono text-xs p-4 leading-relaxed bg-slate-950 text-slate-100 border-slate-800 rounded-xl resize-none flex-1 min-h-[350px] shadow-inner"
              placeholder="<?xml version='1.0' encoding='UTF-8'?>..."
            />

            {/* Validation Banner */}
            {validationResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                  validationResult.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{validationResult.message}</p>
                  {validationResult.placeholders && validationResult.placeholders.length > 0 && (
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Nhận diện {validationResult.placeholders.length} biến số động: {validationResult.placeholders.slice(0, 6).join(', ')}...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <SheetFooter className="p-4 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditXmlFormCode(null)}
              className="text-xs"
            >
              Hủy bỏ
            </Button>

            <Button
              size="sm"
              onClick={handleSaveXml}
              disabled={saveXmlMutation.isPending}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5"
            >
              {saveXmlMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Lưu thay đổi XML
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ============================================================== */}
      {/* 7. SHEET: CHỈNH SỬA THÔNG TIN BIỂU MẪU (METADATA)              */}
      {/* ============================================================== */}
      <Sheet open={Boolean(editMetaForm)} onOpenChange={(open) => !open && setEditMetaForm(null)}>
        <SheetContent className="sm:max-w-md w-full flex flex-col p-0 gap-0 min-w-0 bg-card">
          <SheetHeader className="p-6 border-b shrink-0 bg-muted/20 min-w-0">
            <Badge variant="outline" className={`w-fit font-mono font-bold text-xs ${getFormBadgeColor(editMetaForm?.formCode || '')}`}>
              {editMetaForm?.formCode}
            </Badge>
            <SheetTitle className="text-xl font-bold mt-2 text-foreground">
              Cập Nhật Thông Tin Biểu Mẫu
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1">
              Chỉnh sửa tên gọi và mô tả chi tiết của biểu mẫu đánh giá.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 p-6 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Tên biểu mẫu tiếng Việt:</Label>
              <Input
                value={metaName}
                onChange={(e) => setMetaName(e.target.value)}
                placeholder="Nhập tên biểu mẫu..."
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Mô tả mục đích & Căn cứ:</Label>
              <Textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                placeholder="Mô tả phạm vi áp dụng, đối tượng..."
                rows={4}
                className="text-sm leading-relaxed"
              />
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground space-y-1">
              <p><strong>Mã biểu mẫu:</strong> {editMetaForm?.formCode} (Khóa chính không sửa)</p>
              <p><strong>Tên file gốc:</strong> {editMetaForm?.templateFileId}</p>
              <p><strong>Phân nhóm:</strong> {editMetaForm?.category}</p>
            </div>
          </div>

          <SheetFooter className="p-4 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditMetaForm(null)}
              className="text-xs"
            >
              Hủy
            </Button>

            <Button
              size="sm"
              onClick={handleSaveMeta}
              disabled={updateFormMutation.isPending}
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {updateFormMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Lưu thông tin
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
