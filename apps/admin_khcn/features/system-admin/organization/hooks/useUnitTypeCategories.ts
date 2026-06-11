"use client";

import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { categoryApi } from "../../categories/api";
import { useQueryClient } from "@tanstack/react-query";
import { CATEGORY_KEYS } from "../../categories/keys";
import { toast } from "sonner";
import type { CategoryItem } from "../../categories/types";

export const UNIT_TYPE_CATEGORY_GROUP = "UNIT_TYPE_CATEGORY";

// ── Types phản chiếu đúng schema JSON trong DB ────────────────────────────────

export type SigningAuthority = "FULL" | "DELEGATED" | "INTERNAL";
export type PoliticalSystem  = "HANH_CHINH" | "DANG" | "SU_NGHIEP";

export interface UnitCategoryMeta {
  /** Tên icon Lucide: "Landmark" | "Flag" | "BookOpen" | "GraduationCap" | "Users" | "ClipboardList" */
  icon: string;
  /** Màu Tailwind: "blue" | "red" | "violet" | "emerald" | "amber" | "slate" */
  color: string;
  /** Mô tả ngắn gọn — ví dụ: "Sở, Ban, UBND các cấp" */
  description: string;
  /** Ghi chú quyền ký ban hành văn bản */
  signingNote: string;
  /** Ghi chú nhiệm vụ đặc thù */
  purposeNote: string;
  /** Loại quyền ký: ký đối ngoại / ký ủy quyền / chỉ nội bộ */
  signingAuthority: SigningAuthority;
  /** Hệ thống chính trị */
  politicalSystem: PoliticalSystem;
  /** Trường bổ sung cần thu thập khi tạo/sửa đơn vị */
  requiredFields: ("domainIds" | "geographicAreaIds" | "scope")[];
  /** Từ khoá chức danh lãnh đạo (dùng filter job-title list) */
  leaderTitleKeywords: string[];
  /** Từ khoá chức danh nhân viên/viên chức */
  staffTitleKeywords: string[];
}

/** Parse description JSON của CategoryItem thành UnitCategoryMeta đầy đủ */
export function parseUnitTypeCategoryMeta(item: CategoryItem): UnitCategoryMeta {
  try {
    const m = JSON.parse(item.description ?? "{}");
    return {
      icon:                m.icon                ?? "Building2",
      color:               m.color               ?? "slate",
      description:         m.description         ?? "",
      signingNote:         m.signingNote         ?? "",
      purposeNote:         m.purposeNote         ?? "",
      signingAuthority:    m.signingAuthority    ?? "INTERNAL",
      politicalSystem:     m.politicalSystem     ?? "HANH_CHINH",
      requiredFields:      Array.isArray(m.requiredFields) ? m.requiredFields : [],
      leaderTitleKeywords: Array.isArray(m.leaderTitleKeywords) ? m.leaderTitleKeywords : [],
      staffTitleKeywords:  Array.isArray(m.staffTitleKeywords)  ? m.staffTitleKeywords  : [],
    };
  } catch {
    return {
      icon: "Building2", color: "slate", description: "",
      signingNote: "", purposeNote: "",
      signingAuthority: "INTERNAL", politicalSystem: "HANH_CHINH",
      requiredFields: [], leaderTitleKeywords: [], staffTitleKeywords: [],
    };
  }
}

/** Label hiển thị cho SigningAuthority */
export const SIGNING_AUTHORITY_LABEL: Record<SigningAuthority, { label: string; color: string }> = {
  FULL:      { label: "Ký đối ngoại",  color: "emerald" },
  DELEGATED: { label: "Ký ủy quyền",   color: "amber"   },
  INTERNAL:  { label: "Nội bộ",        color: "slate"   },
};

/** Label hiển thị cho PoliticalSystem */
export const POLITICAL_SYSTEM_LABEL: Record<PoliticalSystem, { label: string }> = {
  HANH_CHINH: { label: "Hành chính NN" },
  DANG:       { label: "Tổ chức Đảng"  },
  SU_NGHIEP:  { label: "Sự nghiệp CL" },
};

// ── Hook CRUD ─────────────────────────────────────────────────────────────────

/**
 * Hook lấy và quản lý nhóm phân loại đơn vị.
 * Tuân đúng chuẩn categories: categoryApi + useGetCategoryByGroup + CATEGORY_KEYS.
 */
export function useUnitTypeCategories() {
  const queryClient = useQueryClient();
  const query = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [CATEGORY_KEYS.all, "group", UNIT_TYPE_CATEGORY_GROUP],
    });

  const create = async (payload: {
    code: string; name: string;
    meta: Omit<UnitCategoryMeta, "icon" | "color" | "description"> & {
      icon: string; color: string; description: string;
    };
    order?: number;
  }) => {
    await categoryApi.create({
      group: UNIT_TYPE_CATEGORY_GROUP,
      code: payload.code,
      name: payload.name,
      order: payload.order ?? 0,
      active: 1,
      description: JSON.stringify(payload.meta),
    });
    await invalidate();
    toast.success("Đã thêm nhóm phân loại.");
  };

  const update = async (id: number, payload: {
    name?: string; order?: number; meta?: Partial<UnitCategoryMeta>;
  }) => {
    const current = query.data?.find((c) => c.id === id);
    const currentMeta = current ? parseUnitTypeCategoryMeta(current) : {};
    await categoryApi.update(id, {
      name: payload.name,
      order: payload.order,
      active: 1,
      description: JSON.stringify({ ...currentMeta, ...payload.meta }),
    });
    await invalidate();
    toast.success("Đã cập nhật nhóm phân loại.");
  };

  const remove = async (id: number) => {
    await categoryApi.delete(id);
    await invalidate();
    toast.success("Đã xóa nhóm phân loại.");
  };

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    create, update, remove,
  };
}
