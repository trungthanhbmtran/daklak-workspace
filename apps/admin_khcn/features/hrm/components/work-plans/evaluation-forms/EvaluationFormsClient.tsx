"use client";

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Tag,
  FileText,
  Printer
} from 'lucide-react';
import { GitBranch, Plus } from 'lucide-react';
import { exportKpiXmlFile, exportKpiDocxFile, printKpiXmlDocument } from '@/features/hrm/utils/kpiXmlToDocx';
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
import { organizationApi } from '@/features/system-admin/organization/api';
import type { OrganizationUnitNode } from '@/features/system-admin/organization/types';
import { workflowApi } from '@/features/workflow/api';
import { unwrapData } from '@/lib/api-helper';

function flattenUnits(nodes: OrganizationUnitNode[], parentPath = ''): Array<{ code: string; name: string }> {
  return nodes.flatMap((unit) => {
    const name = parentPath ? `${parentPath} / ${unit.name}` : unit.name;
    return [...(unit.code ? [{ code: unit.code, name }] : []), ...flattenUnits(unit.children ?? [], name)];
  });
}

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
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createCategory, setCreateCategory] = useState('');
  const [createTargetRole, setCreateTargetRole] = useState('');
  const [createXml, setCreateXml] = useState(`<?xml version="1.0" encoding="UTF-8"?>
<KpiFormDocument xmlns="http://btctu.daklak.gov.vn/kpi/v1" formCode="NEW_TEMPLATE" schemaVersion="1.0">
  <Header>
    <AgencyName>TỈNH ỦY ĐẮK LẮK</AgencyName>
    <OrganizationName>BAN TỔ CHỨC TỈNH ỦY</OrganizationName>
    <DocumentTitle>{{documentTitle}}</DocumentTitle>
    <EvaluationPeriod>{{periodName}}</EvaluationPeriod>
  </Header>

  <OfficerProfile>
    <EmployeeCode>{{employeeCode}}</EmployeeCode>
    <FullName>{{fullName}}</FullName>
    <DepartmentName>{{departmentName}}</DepartmentName>
    <JobTitle>{{jobTitle}}</JobTitle>
  </OfficerProfile>

  <RegisteredTasks>
    {{#each tasks}}
    <TaskItem orderNumber="{{@number}}">
      <TaskName>{{this.taskName}}</TaskName>
      <TargetDeadline>{{this.targetDeadline}}</TargetDeadline>
    </TaskItem>
    {{/each}}
  </RegisteredTasks>

  <WorkflowSignatures>
    <OfficerSignature>
      <SignerName>{{fullName}}</SignerName>
      <SignedAt>{{signedAt}}</SignedAt>
    </OfficerSignature>
  </WorkflowSignatures>
</KpiFormDocument>`);
  const [assignForm, setAssignForm] = useState<KpiFormTemplateItem | null>(null);
  const [assignUnitCode, setAssignUnitCode] = useState('');
  const [assignWorkflowId, setAssignWorkflowId] = useState('');
  const [assignNodeCode, setAssignNodeCode] = useState('');
  const [assignPhase, setAssignPhase] = useState('');
  const [assignFrom, setAssignFrom] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [isSavingNewTemplate, setIsSavingNewTemplate] = useState(false);
  const [isSavingBinding, setIsSavingBinding] = useState(false);
  const [exportingDocxCode, setExportingDocxCode] = useState<string | null>(null);
  const [exportingXmlCode, setExportingXmlCode] = useState<string | null>(null);

  // Tải file XML trực tiếp dưới dạng UTF-8 Blob
  const handleDownloadXml = async (item: KpiFormTemplateItem) => {
    setExportingXmlCode(item.formCode);
    try {
      const res: any = await kpiFormsApi.getXml(item.formCode);
      const rawData = Array.isArray(res?.data) ? res.data[0] : res?.data;
      const xml = rawData?.xmlContent || res?.xmlContent || '';
      if (!xml) {
        toast.error('Nội dung file XML đang trống');
        return;
      }
      const safeName = item.name.replace(/[/\\?%*:|"<>]/g, '_').trim();
      exportKpiXmlFile(xml, `${item.formCode}_${safeName}.xml`);
      toast.success(`Đã xuất file XML: ${item.formCode}.xml`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể tải file XML');
    } finally {
      setExportingXmlCode(null);
    }
  };

  // Xuất file DOCX chuẩn văn bản hành chính từ mẫu XML
  const handleExportDocx = async (item: KpiFormTemplateItem) => {
    setExportingDocxCode(item.formCode);
    try {
      const res: any = await kpiFormsApi.getXml(item.formCode);
      const rawData = Array.isArray(res?.data) ? res.data[0] : res?.data;
      const xml = rawData?.xmlContent || res?.xmlContent || '';
      if (!xml) {
        toast.error('Không tìm thấy nội dung XML của biểu mẫu này');
        return;
      }
      const safeName = item.name.replace(/[/\\?%*:|"<>]/g, '_').trim();
      await exportKpiDocxFile(xml, `${item.formCode}_${safeName}.docx`, item.name);
      toast.success(`Đã xuất văn bản DOCX (Word) chuẩn hành chính: ${item.formCode}.docx!`);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi tạo file DOCX từ mẫu XML');
    } finally {
      setExportingDocxCode(null);
    }
  };

  // Xuất DOCX từ Sheet Xem trước
  const handleExportDocxFromPreview = async () => {
    if (!previewDetail?.xmlContent) return;
    try {
      const safeName = previewDetail.name.replace(/[/\\?%*:|"<>]/g, '_').trim();
      await exportKpiDocxFile(
        previewDetail.xmlContent,
        `${previewDetail.formCode}_${safeName}.docx`,
        previewDetail.name
      );
      toast.success(`Đã xuất văn bản Word (.docx) chuẩn Nghị định 30: ${previewDetail.formCode}.docx!`);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi xuất file DOCX');
    }
  };

  // Xuất XML từ Sheet Xem trước
  const handleExportXmlFromPreview = () => {
    if (!previewDetail?.xmlContent) return;
    const safeName = previewDetail.name.replace(/[/\\?%*:|"<>]/g, '_').trim();
    exportKpiXmlFile(
      previewDetail.xmlContent,
      `${previewDetail.formCode}_${safeName}.xml`
    );
    toast.success(`Đã tải file XML: ${previewDetail.formCode}.xml!`);
  };

  // Xuất DOCX trực tiếp từ XML đang chỉnh sửa trong Sheet Sửa XML
  const handleExportDocxFromEditor = async () => {
    if (!editingXmlText.trim()) {
      toast.error('Nội dung XML đang trống');
      return;
    }
    try {
      const code = editXmlFormCode || 'CUSTOM';
      await exportKpiDocxFile(
        editingXmlText,
        `${code}_ban_chinh_sua.docx`,
        'VĂN BẢN ĐÁNH GIÁ CHUẨN HÀNH CHÍNH'
      );
      toast.success('Đã xuất file Word DOCX trực tiếp từ nội dung XML đang chỉnh sửa!');
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi tạo file Word từ XML');
    }
  };

  // In trực tiếp tài liệu từ server API printer endpoint thông qua iframe ẩn chuyên dụng
  const printViaIframeUrl = (url: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 400);
    };
  };

  // In / Xuất PDF trực tiếp sử dụng server API printer endpoint
  const handlePrintPdf = (item: KpiFormTemplateItem) => {
    const printUrl = kpiFormsApi.getPrintUrl(item.formCode);
    printViaIframeUrl(printUrl);
  };

  // In / Xuất PDF từ Sheet Xem trước thông qua server API printer endpoint
  const handlePrintPdfFromPreview = () => {
    if (!previewDetail?.formCode) return;
    const printUrl = kpiFormsApi.getPrintUrl(previewDetail.formCode);
    printViaIframeUrl(printUrl);
  };

  // In / Xuất PDF từ Sheet Sửa XML thông qua server API printer endpoint
  const handlePrintPdfFromEditor = async () => {
    if (!editingXmlText.trim()) {
      toast.error('Nội dung XML đang trống');
      return;
    }
    try {
      const html = await kpiFormsApi.printCustomXml(
        editingXmlText,
        editMetaForm?.name || 'VĂN BẢN ĐÁNH GIÁ CHUẨN HÀNH CHÍNH'
      );
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc && iframe.contentWindow) {
        iframeDoc.open();
        iframeDoc.write(typeof html === 'string' ? html : String(html));
        iframeDoc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 3000);
          }
        }, 400);
      } else {
        printKpiXmlDocument(editingXmlText, 'VĂN BẢN ĐÁNH GIÁ CHUẨN HÀNH CHÍNH');
      }
    } catch {
      // Fallback in trực tiếp nếu server bận
      printKpiXmlDocument(editingXmlText, 'VĂN BẢN ĐÁNH GIÁ CHUẨN HÀNH CHÍNH');
    }
  };

  const unitsQuery = useQuery({
    queryKey: ['organizations', 'tree'],
    queryFn: async () => {
      const result = await organizationApi.getTree();
      return Array.isArray(result?.data) ? result.data : [];
    },
  });
  const units = useMemo(() => flattenUnits(unitsQuery.data ?? []), [unitsQuery.data]);
  const workflowsQuery = useQuery({
    queryKey: ['workflow', 'definitions', 'form-template-assignment'],
    queryFn: () => workflowApi.list({ skip: 0, take: 100 }),
    enabled: Boolean(assignForm),
  });
  const assignableWorkflows = (workflowsQuery.data?.data ?? []).filter((workflow) => workflow.ownerUnitCode === assignUnitCode);
  const bindingsQuery = useQuery({
    queryKey: ['kpi-form-bindings', assignForm?.formCode],
    queryFn: async () => unwrapData<any[]>(await kpiFormsApi.listBindings(assignForm!.formCode), []),
    enabled: Boolean(assignForm),
  });

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
      const res: any = await kpiFormsApi.getXml(form.formCode);
      const rawData = Array.isArray(res?.data) ? res.data[0] : res?.data;
      const xml = rawData?.xmlContent || res?.xmlContent || '';
      setEditingXmlText(xml);
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

  const handleCreateTemplate = async () => {
    if (!createName.trim() || !createXml.trim()) {
      toast.error('Nhập tên mẫu và nội dung XML');
      return;
    }
    setIsSavingNewTemplate(true);
    try {
      await kpiFormsApi.create({
        name: createName.trim(),
        description: createDescription.trim() || undefined,
        category: createCategory.trim() || undefined,
        targetRole: createTargetRole.trim() || undefined,
        xmlContent: createXml,
      });
      toast.success('Đã tạo mẫu XML nháp');
      setCreateSheetOpen(false);
      setCreateName('');
      setCreateDescription('');
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo mẫu XML');
    } finally {
      setIsSavingNewTemplate(false);
    }
  };

  const handlePublishTemplate = async (form: KpiFormTemplateItem) => {
    try {
      await kpiFormsApi.publish(form.formCode);
      toast.success(`Đã phát hành mẫu ${form.name}`);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể phát hành mẫu');
    }
  };

  const handleCreateBinding = async () => {
    const workflow = assignableWorkflows.find((item) => item.id === assignWorkflowId);
    if (!assignForm || !assignUnitCode || !workflow) {
      toast.error('Chọn đơn vị và quy trình có cùng đơn vị sở hữu');
      return;
    }
    setIsSavingBinding(true);
    try {
      await kpiFormsApi.createBinding(assignForm.formCode, {
        unitCode: assignUnitCode,
        processDefinitionId: workflow.id,
        processCode: workflow.code,
        nodeCode: assignNodeCode.trim() || undefined,
        phase: assignPhase || undefined,
        effectiveFrom: assignFrom || undefined,
        effectiveTo: assignTo || undefined,
      });
      toast.success('Đã gán mẫu cho đơn vị và quy trình');
      setAssignNodeCode('');
      setAssignPhase('');
      await bindingsQuery.refetch();
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gán mẫu cho quy trình');
    } finally {
      setIsSavingBinding(false);
    }
  };

  const handleDeactivateBinding = async (id: number) => {
    try {
      await kpiFormsApi.deactivateBinding(id);
      toast.success('Đã gỡ gán mẫu');
      await bindingsQuery.refetch();
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể gỡ cấu hình gán mẫu');
    }
  };

  const getFormBadgeColor = (code: string) => {
    switch (code) {
      case 'MAU_01':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'MAU_02':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'MAU_03':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'MAU_04':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'MAU_05':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
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
            <div className="space-y-2.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/30 text-xs gap-1.5 font-normal py-0.5">
                  <Layers className="w-3 h-3 text-blue-300 shrink-0" />
                  Cơ quan: Ban Tổ chức Tỉnh ủy Đắk Lắk
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-xs gap-1.5 font-normal py-0.5">
                  <Code2 className="w-3 h-3 text-emerald-300 shrink-0" />
                  Chuẩn hóa XML Schema v1.0
                </Badge>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-400/30 text-xs gap-1.5 font-normal py-0.5">
                  <Shield className="w-3 h-3 text-amber-300 shrink-0" />
                  ATTT Cấp độ 3 (NĐ 85/2016)
                </Badge>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-blue-200 shrink-0 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <span>Nơi Chứa Mẫu Đánh Giá &amp; Quản Lý File Mẫu XML</span>
              </CardTitle>
              <CardDescription className="text-slate-200/90 text-sm max-w-3xl leading-relaxed font-normal">
                Kho mẫu XML động cho nhiều đơn vị và quy trình. Tạo mẫu, kiểm tra XML, phát hành và gán vào đúng bước xử lý.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 gap-2 h-9 px-3.5 font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button size="sm" onClick={() => setCreateSheetOpen(true)} className="h-9 gap-2 bg-white text-blue-900 hover:bg-blue-50 font-semibold shadow-xs">
                <Plus className="w-4 h-4" /> Tạo mẫu
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 2. Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card className="p-4 border shadow-xs bg-card flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">Tổng số biểu mẫu</p>
            <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{forms.length} Mẫu</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Danh sách mở rộng theo nhu cầu đơn vị</p>
          </div>
        </Card>

        <Card className="p-4 border shadow-xs bg-card flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">File XML mẫu</p>
            <h4 className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">100% Sẵn sàng</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Có đầy đủ file XML trên máy chủ</p>
          </div>
        </Card>

        <Card className="p-4 border shadow-xs bg-card flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">Đối tượng áp dụng</p>
            <h4 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">Theo quy trình</h4>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">Đơn vị sở hữu được cấu hình trên quy trình</p>
          </div>
        </Card>

        <Card className="p-4 border shadow-xs bg-card flex items-center gap-3.5 min-w-0">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-muted-foreground">Kiểm soát chất lượng</p>
            <h4 className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-400 mt-0.5">Trần 20% &amp; 3 Mức lỗi</h4>
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
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${getFormBadgeColor(item.formCode)} shrink-0`}>
                        {item.formCode}
                      </span>
                      <Badge variant="outline" className="text-xs font-normal truncate max-w-[150px] bg-background">
                        {item.category}
                      </Badge>
                      <Badge
                        variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className="text-[10px] px-2 py-0 h-4.5 font-normal shrink-0 gap-1.5"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400'} shrink-0`} />
                        {item.status === 'PUBLISHED' ? 'Đã phát hành' : 'Bản nháp'}
                      </Badge>
                    </div>

                    <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                      v{item.schemaVersion}
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground mt-2.5 leading-snug wrap-break-word">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed wrap-break-word">
                    {item.description || 'Chưa có mô tả chi tiết'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4 text-xs min-w-0">
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-center justify-between text-muted-foreground gap-2 text-xs">
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Tag className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-muted-foreground">Đối tượng:</span>
                      </span>
                      <span className="font-medium text-foreground text-right truncate">
                        {item.targetRole}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground gap-2 text-xs">
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <FileCode2 className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-muted-foreground">Tên file mẫu:</span>
                      </span>
                      <code className="font-mono text-foreground bg-muted px-2 py-0.5 rounded text-[11px] truncate max-w-[190px]">
                        {item.templateFileId || `${item.formCode.toLowerCase()}.xml`}
                      </code>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground gap-2 text-xs">
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-muted-foreground">Dung lượng XML:</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {(item.xmlSize / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground gap-2 text-xs">
                      <span className="flex items-center gap-2 shrink-0">
                        <span className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-muted-foreground">Tài liệu đã tạo:</span>
                      </span>
                      <span className="font-bold text-foreground">
                        {item.documentCount} văn bản
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground min-w-0">
                    <span className="truncate">Căn cứ: 05-HD/TU &amp; 01-QĐ/BTCTU</span>
                    <span className="font-mono shrink-0">XML 1.0 UTF-8</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 border-t bg-muted/10 flex flex-col gap-2 min-w-0">
                  {/* Hàng 1: Thao tác xem trước & xuất tài liệu */}
                  <div className="flex items-center gap-2 w-full min-w-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleOpenPreview(item.formCode)}
                      className="flex-1 h-8 px-3 text-xs gap-1.5 font-medium shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>Xem trước</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleExportDocx(item)}
                      disabled={exportingDocxCode === item.formCode}
                      className="h-8 px-2.5 text-xs gap-1.5 font-medium text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 min-w-0"
                      title="Xuất văn bản DOCX (Word) theo chuẩn hành chính"
                    >
                      {exportingDocxCode === item.formCode ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                      <span>Xuất DOCX</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handlePrintPdf(item)}
                      className="h-8 px-2.5 text-xs gap-1.5 font-medium text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 min-w-0"
                      title="In hoặc lưu file PDF theo thể thức văn bản hành chính chuẩn A4"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>In / PDF</span>
                    </Button>
                  </div>

                  {/* Hàng 2: Thao tác cấu hình, quy trình & quản trị */}
                  <div className="flex items-center gap-1.5 w-full justify-between min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={item.organizationId === 'DEFAULT'}
                        onClick={() => handleOpenEditXml(item)}
                        title={item.organizationId === 'DEFAULT' ? 'Mẫu dùng chung chỉ đọc; hãy tạo mẫu riêng để chỉnh sửa' : 'Sửa mã nguồn XML'}
                        className="h-7.5 px-2.5 text-xs gap-1.5 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 font-medium"
                      >
                        <Code2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>Sửa XML</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleDownloadXml(item)}
                        disabled={exportingXmlCode === item.formCode}
                        className="h-7.5 px-2.5 text-xs gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-medium min-w-0"
                        title="Xuất file XML chuẩn UTF-8"
                      >
                        {exportingXmlCode === item.formCode ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span>XML</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAssignForm(item);
                          setAssignUnitCode('');
                          setAssignWorkflowId('');
                        }}
                        className="h-7.5 px-2.5 text-xs gap-1.5 font-medium hover:bg-muted"
                        title="Gán mẫu đánh giá vào quy trình xử lý"
                      >
                        <GitBranch className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>Gán quy trình</span>
                      </Button>

                      {item.status !== 'PUBLISHED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handlePublishTemplate(item)}
                          className="h-7.5 px-2 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Phát hành</span>
                        </Button>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={item.organizationId === 'DEFAULT'}
                      onClick={() => handleOpenEditMeta(item)}
                      title={item.organizationId === 'DEFAULT' ? 'Mẫu dùng chung chỉ đọc; hãy tạo mẫu riêng để chỉnh sửa' : 'Chỉnh sửa thông tin biểu mẫu'}
                      className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
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
            <SheetTitle className="text-xl font-bold mt-2 text-foreground wrap-break-word">
              {previewDetail?.name || 'Đang tải thông tin biểu mẫu...'}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1 wrap-break-word">
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Định dạng: XML 1.0 (UTF-8)</span>
                      {previewDetail?.xmlContent && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-50 text-emerald-700 border-emerald-300 font-mono">
                          {previewDetail.xmlContent.split('\n').length} dòng • {(new Blob([previewDetail.xmlContent]).size / 1024).toFixed(1)} KB
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyXml(previewDetail?.xmlContent || '')}
                      disabled={!previewDetail?.xmlContent}
                      className="h-7 text-xs gap-1"
                    >
                      {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {hasCopied ? 'Đã chép' : 'Sao chép XML'}
                    </Button>
                  </div>

                  {previewDetail?.xmlContent ? (
                    <div className="relative flex-1 min-h-[350px] max-h-[500px] overflow-auto bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs border border-slate-800 leading-relaxed shadow-inner">
                      <pre className="whitespace-pre-wrap wrap-break-word">
                        <code>{previewDetail.xmlContent}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 border border-dashed rounded-xl bg-muted/20 text-center">
                      <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                      <p className="font-bold text-sm text-foreground">Chưa có nội dung ruột XML</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        Biểu mẫu này chưa có nội dung XML hoàn chỉnh hoặc đang được đồng bộ từ hệ thống mẫu chuẩn.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res: any = await kpiFormsApi.getXml(previewFormCode || '');
                            const raw = Array.isArray(res?.data) ? res.data[0] : res?.data;
                            const fetchedXml = raw?.xmlContent || res?.xmlContent || '';
                            if (fetchedXml) {
                              toast.success('Đã nạp thành công ruột XML chuẩn!');
                              refetch();
                            } else {
                              toast.warning('Máy chủ chưa trả về nội dung XML');
                            }
                          } catch {
                            toast.error('Không thể nạp ruột XML');
                          }
                        }}
                        className="mt-3 text-xs gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Đồng bộ lại từ máy chủ
                      </Button>
                    </div>
                  )}
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

              {previewDetail?.xmlContent && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportXmlFromPreview}
                    className="text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Download className="w-3.5 h-3.5" /> Xuất file XML
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => void handleExportDocxFromPreview()}
                    className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    <FileText className="w-3.5 h-3.5" /> Xuất văn bản DOCX (Word)
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintPdfFromPreview}
                    className="text-xs gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                    title="In hoặc lưu file PDF chuẩn thể thức văn bản hành chính A4"
                  >
                    <Printer className="w-3.5 h-3.5" /> In / PDF
                  </Button>
                </>
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
            <SheetTitle className="text-xl font-bold mt-2 text-foreground wrap-break-word">
              Chỉnh Sửa Mã Nguồn File Mẫu XML
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground mt-1 wrap-break-word">
              Sửa đổi nội dung cấu trúc XML. Hãy bấm &quot;Kiểm tra cú pháp (Validate)&quot; trước khi bấm Lưu để đảm bảo file XML không bị lỗi đóng mở thẻ.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 p-6 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground">
                Nội dung XML (XML 1.0, UTF-8):
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleExportDocxFromEditor()}
                  className="h-8 text-xs gap-1.5 bg-blue-50/80 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60 border-blue-200"
                  title="Xuất văn bản Word DOCX theo chuẩn Nghị định 30 từ nội dung XML đang chỉnh sửa"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Xuất thử DOCX
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintPdfFromEditor}
                  className="h-8 text-xs gap-1.5 bg-amber-50/80 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 border-amber-200"
                  title="In hoặc xem trước PDF chuẩn hành chính từ nội dung XML đang chỉnh sửa"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In / PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidateXml}
                  disabled={validateXmlMutation.isPending}
                  className="h-8 text-xs gap-1.5 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60 border-indigo-200"
                >
                  {validateXmlMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Kiểm tra cú pháp (Validate)
                </Button>
              </div>
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
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60'
                }`}
              >
                {validationResult.isValid ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{validationResult.message}</p>
                  {validationResult.placeholders && validationResult.placeholders.length > 0 && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1">
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

      <Sheet open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col gap-0 p-0 min-w-0">
          <SheetHeader className="border-b bg-muted/20 p-6">
            <SheetTitle>Tạo mẫu XML</SheetTitle>
            <SheetDescription>Mẫu được lưu ở trạng thái nháp. Kiểm tra nội dung trước khi phát hành và gán quy trình.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 min-h-0 space-y-4 overflow-y-auto p-6">
            <div className="space-y-2"><Label>Tên mẫu</Label><Input value={createName} onChange={(event) => setCreateName(event.target.value)} placeholder="Ví dụ: Phiếu đề xuất đánh giá chuyên đề" /></div>
            <div className="space-y-2"><Label>Phân nhóm</Label><Input value={createCategory} onChange={(event) => setCreateCategory(event.target.value)} placeholder="Ví dụ: Đánh giá định kỳ" /></div>
            <div className="space-y-2"><Label>Đối tượng sử dụng</Label><Input value={createTargetRole} onChange={(event) => setCreateTargetRole(event.target.value)} placeholder="Đơn vị hoặc vai trò áp dụng" /></div>
            <div className="space-y-2"><Label>Mô tả</Label><Textarea value={createDescription} onChange={(event) => setCreateDescription(event.target.value)} rows={2} /></div>
            <div className="space-y-2"><Label>Nội dung XML</Label><Textarea value={createXml} onChange={(event) => setCreateXml(event.target.value)} rows={18} className="min-h-[360px] resize-y font-mono text-xs" /></div>
          </div>
          <SheetFooter className="border-t bg-muted/20 p-4">
            <Button variant="outline" onClick={() => setCreateSheetOpen(false)}>Đóng</Button>
            <Button onClick={() => void handleCreateTemplate()} disabled={isSavingNewTemplate}>
              {isSavingNewTemplate ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}Tạo mẫu nháp
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={Boolean(assignForm)} onOpenChange={(open) => !open && setAssignForm(null)}>
        <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0 min-w-0">
          <SheetHeader className="border-b bg-muted/20 p-6">
            <SheetTitle>Gán mẫu vào quy trình</SheetTitle>
            <SheetDescription className="wrap-break-word">{assignForm?.name} · chọn đơn vị sở hữu và quy trình tương ứng.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto p-6">
            <div className="space-y-2"><Label>Đơn vị</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={assignUnitCode} onChange={(event) => { setAssignUnitCode(event.target.value); setAssignWorkflowId(''); }}><option value="">Chọn đơn vị</option>{units.map((unit) => <option key={unit.code} value={unit.code}>{unit.name} · {unit.code}</option>)}</select>{unitsQuery.isError && <p className="text-xs text-destructive">Không tải được danh sách đơn vị.</p>}</div>
            <div className="space-y-2"><Label>Quy trình thuộc đơn vị đã chọn</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={assignWorkflowId} onChange={(event) => setAssignWorkflowId(event.target.value)} disabled={!assignUnitCode || workflowsQuery.isPending}><option value="">Chọn quy trình</option>{assignableWorkflows.map((workflow) => <option key={workflow.id} value={workflow.id}>{workflow.name} · {workflow.code}</option>)}</select>{workflowsQuery.isError && <p className="text-xs text-destructive">Không tải được quy trình.</p>}{assignUnitCode && !workflowsQuery.isPending && assignableWorkflows.length === 0 && <p className="text-xs text-muted-foreground">Đơn vị này chưa có quy trình. Hãy gán đơn vị sở hữu ở phần thiết kế quy trình trước.</p>}</div>
            <div className="space-y-2"><Label>Mã bước xử lý (tùy chọn)</Label><Input value={assignNodeCode} onChange={(event) => setAssignNodeCode(event.target.value)} placeholder="Ví dụ: review_department" /><p className="text-xs text-muted-foreground">Để trống nếu mẫu áp dụng cho toàn bộ quy trình.</p></div>
            <div className="space-y-2"><Label>Giai đoạn KPI (tùy chọn)</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={assignPhase} onChange={(event) => setAssignPhase(event.target.value)}><option value="">Tất cả giai đoạn</option><option value="REGISTRATION">Đăng ký đầu kỳ</option><option value="SELF_EVAL">Tự đánh giá</option><option value="COLLECTIVE_EVAL">Đánh giá tập thể</option><option value="FINAL">Tổng hợp cuối kỳ</option></select></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-2"><Label>Hiệu lực từ</Label><Input type="date" value={assignFrom} onChange={(event) => setAssignFrom(event.target.value)} /></div><div className="space-y-2"><Label>Hiệu lực đến</Label><Input type="date" value={assignTo} onChange={(event) => setAssignTo(event.target.value)} /></div></div>
            <div className="space-y-2"><Label>Cấu hình đang gán</Label>{bindingsQuery.isPending ? <p className="text-sm text-muted-foreground">Đang tải…</p> : (bindingsQuery.data ?? []).filter((binding: any) => binding.isActive).length === 0 ? <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">Chưa có quy trình nào được gán mẫu.</p> : <div className="space-y-2">{(bindingsQuery.data ?? []).filter((binding: any) => binding.isActive).map((binding: any) => <div key={binding.id} className="flex min-w-0 items-center justify-between gap-3 rounded-md border p-3"><div className="min-w-0"><p className="wrap-break-word text-sm font-medium">{binding.processCode} · {binding.unitCode}</p><p className="wrap-break-word text-xs text-muted-foreground">{binding.nodeCode || 'Toàn quy trình'}{binding.phase ? ` · ${binding.phase}` : ''}</p></div><Button variant="outline" size="sm" onClick={() => void handleDeactivateBinding(binding.id)}>Gỡ</Button></div>)}</div>}</div>
          </div>
          <SheetFooter className="border-t bg-muted/20 p-4">
            <Button variant="outline" onClick={() => setAssignForm(null)}>Đóng</Button>
            <Button onClick={() => void handleCreateBinding()} disabled={isSavingBinding || !assignWorkflowId || !assignUnitCode}>
              {isSavingBinding ? <RefreshCw className="mr-2 size-4 animate-spin" /> : <GitBranch className="mr-2 size-4" />}Gán mẫu
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
