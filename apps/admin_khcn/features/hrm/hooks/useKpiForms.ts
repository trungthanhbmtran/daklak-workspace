/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  kpiFormsApi,
  KpiFormTemplateItem,
  KpiFormDetailResponse,
  KpiFormXmlResponse,
  ValidateXmlResult,
} from '../api/kpi-forms.api';
import { unwrapData } from '@/lib/api-helper';

export const KPI_FORMS_QUERY_KEYS = {
  all: ['kpi-forms'] as const,
  detail: (formCode: string) => ['kpi-forms', 'detail', formCode] as const,
  xml: (formCode: string) => ['kpi-forms', 'xml', formCode] as const,
};

export function useGetKpiForms() {
  return useQuery<KpiFormTemplateItem[]>({
    queryKey: KPI_FORMS_QUERY_KEYS.all,
    queryFn: async () => {
      const res = await kpiFormsApi.list();
      return unwrapData<KpiFormTemplateItem[]>(res, []);
    },
    staleTime: 60 * 1000,
  });
}

export function useGetKpiFormDetail(formCode: string | null) {
  return useQuery<KpiFormDetailResponse | null>({
    queryKey: KPI_FORMS_QUERY_KEYS.detail(formCode || ''),
    queryFn: async () => {
      if (!formCode) return null;
      const res: any = await kpiFormsApi.getDetail(formCode);
      if (!res) return null;
      const rawData = Array.isArray(res.data) ? res.data[0] : res.data;
      const inner = rawData && typeof rawData === 'object' ? rawData : res;
      return {
        ...inner,
        xmlContent: inner.xmlContent || res.xmlContent || '',
        placeholders: inner.placeholders || res.placeholders || [],
      };
    },
    enabled: Boolean(formCode),
    staleTime: 60 * 1000,
  });
}

export function useGetKpiFormXml(formCode: string | null) {
  return useQuery<KpiFormXmlResponse | null>({
    queryKey: KPI_FORMS_QUERY_KEYS.xml(formCode || ''),
    queryFn: async () => {
      if (!formCode) return null;
      const res: any = await kpiFormsApi.getXml(formCode);
      if (!res) return null;
      const rawData = Array.isArray(res.data) ? res.data[0] : res.data;
      const inner = rawData && typeof rawData === 'object' ? rawData : res;
      return {
        formCode: inner.formCode || res.formCode || formCode,
        xmlContent: inner.xmlContent || res.xmlContent || '',
        placeholders: inner.placeholders || res.placeholders || [],
        xmlSize: inner.xmlSize || res.xmlSize || 0,
      };
    },
    enabled: Boolean(formCode),
    staleTime: 60 * 1000,
  });
}

export function useUpdateKpiForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formCode, payload }: { formCode: string; payload: { name: string; description: string; templateFileId?: string } }) => {
      const res = await kpiFormsApi.update(formCode, payload);
      return unwrapData(res);
    },
    onSuccess: (_, variables) => {
      toast.success('Cập nhật thông tin biểu mẫu thành công!');
      queryClient.invalidateQueries({ queryKey: KPI_FORMS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: KPI_FORMS_QUERY_KEYS.detail(variables.formCode) });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật biểu mẫu');
    },
  });
}

export function useSaveKpiFormXml() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formCode, xmlContent }: { formCode: string; xmlContent: string }) => {
      const res = await kpiFormsApi.saveXml(formCode, xmlContent);
      return unwrapData(res);
    },
    onSuccess: (_, variables) => {
      toast.success(`Đã lưu file XML cho biểu mẫu ${variables.formCode} thành công!`);
      queryClient.invalidateQueries({ queryKey: KPI_FORMS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: KPI_FORMS_QUERY_KEYS.detail(variables.formCode) });
      queryClient.invalidateQueries({ queryKey: KPI_FORMS_QUERY_KEYS.xml(variables.formCode) });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Lỗi khi lưu file XML');
    },
  });
}

export function useValidateKpiXml() {
  return useMutation<ValidateXmlResult, any, string>({
    mutationFn: async (xmlContent: string) => {
      const res = await kpiFormsApi.validateXml(xmlContent);
      return unwrapData<ValidateXmlResult>(res, { isValid: false, message: '', placeholders: [] });
    },
  });
}
