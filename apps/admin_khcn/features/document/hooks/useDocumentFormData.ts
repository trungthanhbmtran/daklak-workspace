/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";

const fetchList = async (group: string): Promise<any[]> => {
  const res: any = await apiClient.get("/categories", { params: { group } });
  const d = res?.data || res;
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  return [];
};

/**
 * Hook cung cấp tất cả categories cần thiết cho DocumentUploadModal.
 * Dùng Promise.all để fetch song song — loại bỏ useEffect + apiClient trực tiếp.
 * staleTime 5 phút vì categories ít thay đổi.
 */
export function useDocumentFormData() {
  return useQuery({
    queryKey: ["document-form-categories"],
    queryFn: async () => {
      const [types, fields, urgencies, securityLevels, reportTypes] = await Promise.all([
        fetchList("DOCUMENT_TYPE"),
        fetchList("DOCUMENT_DOMAIN"),
        fetchList("URGENCY_LEVEL"),
        fetchList("SECURITY_LEVEL"),
        fetchList("TRANSPARENCY_CAT").catch(() => []),
      ]);
      return { types, fields, urgencies, securityLevels, reportTypes };
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    placeholderData: { types: [], fields: [], urgencies: [], securityLevels: [], reportTypes: [] },
  });
}

/**
 * Hook fetch danh sách tài liệu từ tủ văn bản cá nhân.
 * Dùng bởi DossierDetailClient, DocumentCabinetClient.
 */
export function useCabinetFiles(enabled = true) {
  return useQuery({
    queryKey: ["document-cabinet"],
    queryFn: async (): Promise<any[]> => {
      const res: any = await apiClient.get("/documents/cabinet");
      return res?.data || [];
    },
    enabled,
    staleTime: 60_000,
  });
}

/**
 * Hook fetch components của 1 hồ sơ.
 */
export function useDossierComponents(dossierId: string) {
  return useQuery({
    queryKey: ["dossier-components", dossierId],
    queryFn: async (): Promise<any[]> => {
      const res: any = await apiClient.get(`/documents/dossiers/${dossierId}/components`);
      return res?.data || [];
    },
    enabled: !!dossierId,
    staleTime: 30_000,
  });
}

/**
 * Mutations cho dossier component — upload, liên kết từ tủ.
 */
export function useDossierComponentMutations(dossierId: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["dossier-components", dossierId] });

  const updateComponent = useMutation({
    mutationFn: (data: { id: string; status: string; fileUrl?: string; source?: string }) =>
      apiClient.put(`/documents/dossiers/components/${data.id}`, {
        status: data.status,
        fileUrl: data.fileUrl,
        source: data.source,
      }),
    onSuccess: invalidate,
  });

  const addComponent = useMutation({
    mutationFn: (data: { name: string; fileUrl: string }) =>
      apiClient.post(`/documents/dossiers/${dossierId}/components`, data),
    onSuccess: invalidate,
  });

  return { updateComponent, addComponent };
}

/**
 * Mutations cho Tủ văn bản cá nhân — thêm file, xóa file.
 * Dùng bởi DocumentCabinetClient.
 */
export function useCabinetMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["document-cabinet"] });

  const addFile = useMutation({
    mutationFn: (data: {
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }) => apiClient.post("/documents/cabinet", data),
    onSuccess: invalidate,
  });

  const deleteFile = useMutation({
    mutationFn: (fileId: string) =>
      apiClient.delete(`/documents/cabinet/${fileId}`),
    onSuccess: invalidate,
  });

  return { addFile, deleteFile };
}

/**
 * Hook fetch danh sách hồ sơ (dossiers list).
 * Dùng bởi DocumentCabinetClient.
 */
export function useDossierList() {
  return useQuery({
    queryKey: ["dossiers-list"],
    queryFn: async (): Promise<any[]> => {
      const res: any = await apiClient.get("/documents/dossiers/list");
      return res?.data || [];
    },
    staleTime: 60_000,
    placeholderData: [],
  });
}

/**
 * Mutation tạo hồ sơ trống mới.
 * Dùng bởi CreateDossierModal.
 */
export function useCreateDossier(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { procedureName: string; senderName: string }) =>
      apiClient.post("/documents/dossiers/create-blank", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dossiers-list"] });
      onSuccess?.();
    },
  });
}

/**
 * Hook fetch danh sách thủ tục hành chính.
 * Dùng bởi ProcedureConfigClient.
 */
export function useProcedureList() {
  return useQuery({
    queryKey: ["procedures-list"],
    queryFn: async (): Promise<any[]> => {
      const res: any = await apiClient.get("/documents/procedures/list");
      return res?.data || [];
    },
    staleTime: 2 * 60_000,
    placeholderData: [],
  });
}

/**
 * Mutations cho thủ tục hành chính — tạo mới, xóa.
 * Dùng bởi ProcedureConfigClient.
 */
export function useProcedureMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["procedures-list"] });

  const createProcedure = useMutation({
    mutationFn: (data: {
      name: string;
      code: string;
      category: string;
      requiredDocs: { id: string; name: string; isRequired: boolean; sampleFileUrl?: string }[];
    }) => apiClient.post("/documents/procedures", data),
    onSuccess: invalidate,
  });

  const deleteProcedure = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/documents/procedures/${id}`),
    onSuccess: invalidate,
  });

  return { createProcedure, deleteProcedure };
}
