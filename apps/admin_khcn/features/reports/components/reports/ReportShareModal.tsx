"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useDeferredValue,
  memo,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Share2,
  Building2,
  User,
  Shield,
  Link2,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  Eye,
  Edit3,
  ShieldAlert,
  Info,
  Clock,
  Search,
  Lock,
  Globe,
  UserPlus,
  X,
  CornerDownRight,
  Layers,
  Filter,
  Loader2,
} from "lucide-react";

import { ReportDefinition, ReportPermission } from "../../types";
import {
  useGetReportAssignments,
  useAssignReport,
  useRemoveReportAssignment,
} from "../../api";
import { organizationApi } from "@/features/system-admin/organization/api";
import { userApi } from "@/features/system-admin/users/api";
import { policyApi } from "@/features/system-admin/policies/api";
import { cn } from "@/lib/utils";

interface ReportShareModalProps {
  report: ReportDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Cấu trúc phân cấp đơn vị cho UI Enterprise */
export interface HierarchicalOrgUnit {
  id: string;
  numericId: number;
  name: string;
  code: string;
  shortName?: string;
  categoryCode?: string;
  parentId: number | null;
  parentName?: string;
  fullPath: string;
  level: number;
  isRoot: boolean;
  children?: HierarchicalOrgUnit[];
}

/** Chuẩn hóa xâu tiếng Việt không dấu để tìm kiếm thông minh */
const normalizeText = (s: string) =>
  (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

/** Xử lý đệ quy cây tổ chức */
function processTreeNodes(
  nodes: any[],
  parentPath = "",
  parentName = "",
  level = 0
): HierarchicalOrgUnit[] {
  const result: HierarchicalOrgUnit[] = [];
  for (const node of nodes || []) {
    if (!node || node.id == null) continue;
    const currentName = node.name || node.unitName || `Đơn vị #${node.id}`;
    const currentPath = parentPath ? `${parentPath} > ${currentName}` : currentName;
    const childrenRaw = node.children || node.subordinateUnits || [];
    const hasChildren = Array.isArray(childrenRaw) && childrenRaw.length > 0;

    const unitItem: HierarchicalOrgUnit = {
      id: String(node.id),
      numericId: Number(node.id),
      name: currentName,
      code: node.code || node.shortName || "",
      shortName: node.shortName,
      categoryCode: node.categoryCode,
      parentId: node.parentId != null ? Number(node.parentId) : null,
      parentName: parentName || undefined,
      fullPath: currentPath,
      level,
      isRoot: level === 0,
    };
    result.push(unitItem);

    if (hasChildren) {
      const childItems = processTreeNodes(childrenRaw, currentPath, currentName, level + 1);
      result.push(...childItems);
    }
  }
  return result;
}

/** Cây tổ chức chuẩn fallback cho tỉnh Đắk Lắk khi API chưa có dữ liệu cây */
const DAKLAK_GOVT_FALLBACK_TREE: HierarchicalOrgUnit[] = [
  // Ban Tổ chức Tỉnh ủy
  {
    id: "1",
    numericId: 1,
    name: "Ban Tổ chức Tỉnh ủy Đắk Lắk",
    code: "BTCTU_DAKLAK",
    fullPath: "Ban Tổ chức Tỉnh ủy Đắk Lắk",
    level: 0,
    isRoot: true,
    parentId: null,
  },
  {
    id: "101",
    numericId: 101,
    name: "Phòng Tổ chức - Cán bộ",
    code: "P_TCCB",
    parentName: "Ban Tổ chức Tỉnh ủy Đắk Lắk",
    fullPath: "Ban Tổ chức Tỉnh ủy Đắk Lắk > Phòng Tổ chức - Cán bộ",
    level: 1,
    isRoot: false,
    parentId: 1,
  },
  {
    id: "102",
    numericId: 102,
    name: "Phòng Bảo vệ Chính trị nội bộ",
    code: "P_BVCTNB",
    parentName: "Ban Tổ chức Tỉnh ủy Đắk Lắk",
    fullPath: "Ban Tổ chức Tỉnh ủy Đắk Lắk > Phòng Bảo vệ Chính trị nội bộ",
    level: 1,
    isRoot: false,
    parentId: 1,
  },
  {
    id: "103",
    numericId: 103,
    name: "Phòng Chính sách Cán bộ",
    code: "P_CSCB",
    parentName: "Ban Tổ chức Tỉnh ủy Đắk Lắk",
    fullPath: "Ban Tổ chức Tỉnh ủy Đắk Lắk > Phòng Chính sách Cán bộ",
    level: 1,
    isRoot: false,
    parentId: 1,
  },
  {
    id: "104",
    numericId: 104,
    name: "Văn phòng Cơ quan Ban Tổ chức Tỉnh ủy",
    code: "VP_BTCTU",
    parentName: "Ban Tổ chức Tỉnh ủy Đắk Lắk",
    fullPath: "Ban Tổ chức Tỉnh ủy Đắk Lắk > Văn phòng Cơ quan Ban Tổ chức Tỉnh ủy",
    level: 1,
    isRoot: false,
    parentId: 1,
  },

  // Sở Khoa học và Công nghệ
  {
    id: "2",
    numericId: 2,
    name: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
    code: "SKHCN_DAKLAK",
    fullPath: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
    level: 0,
    isRoot: true,
    parentId: null,
  },
  {
    id: "201",
    numericId: 201,
    name: "Phòng Quản lý Khoa học",
    code: "P_QLKH",
    parentName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
    fullPath: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk > Phòng Quản lý Khoa học",
    level: 1,
    isRoot: false,
    parentId: 2,
  },
  {
    id: "202",
    numericId: 202,
    name: "Phòng Quản lý Công nghệ và Chuyên ngành",
    code: "P_QLCN",
    parentName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
    fullPath: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk > Phòng Quản lý Công nghệ và Chuyên ngành",
    level: 1,
    isRoot: false,
    parentId: 2,
  },
  {
    id: "203",
    numericId: 203,
    name: "Chi cục Tiêu chuẩn Đo lường Chất lượng",
    code: "CC_TDC",
    parentName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
    fullPath: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk > Chi cục Tiêu chuẩn Đo lường Chất lượng",
    level: 1,
    isRoot: false,
    parentId: 2,
  },

  // Văn phòng Tỉnh ủy
  {
    id: "3",
    numericId: 3,
    name: "Văn phòng Tỉnh ủy Đắk Lắk",
    code: "VPTU_DAKLAK",
    fullPath: "Văn phòng Tỉnh ủy Đắk Lắk",
    level: 0,
    isRoot: true,
    parentId: null,
  },
  {
    id: "301",
    numericId: 301,
    name: "Phòng Tổng hợp",
    code: "P_TH_VPTU",
    parentName: "Văn phòng Tỉnh ủy Đắk Lắk",
    fullPath: "Văn phòng Tỉnh ủy Đắk Lắk > Phòng Tổng hợp",
    level: 1,
    isRoot: false,
    parentId: 3,
  },
  {
    id: "302",
    numericId: 302,
    name: "Phòng Cơ yếu - Công nghệ thông tin",
    code: "P_CY_CNTT",
    parentName: "Văn phòng Tỉnh ủy Đắk Lắk",
    fullPath: "Văn phòng Tỉnh ủy Đắk Lắk > Phòng Cơ yếu - Công nghệ thông tin",
    level: 1,
    isRoot: false,
    parentId: 3,
  },

  // UBND tỉnh
  {
    id: "4",
    numericId: 4,
    name: "Ủy ban Nhân dân tỉnh Đắk Lắk",
    code: "UBND_DAKLAK",
    fullPath: "Ủy ban Nhân dân tỉnh Đắk Lắk",
    level: 0,
    isRoot: true,
    parentId: null,
  },
  {
    id: "401",
    numericId: 401,
    name: "Văn phòng Ủy ban Nhân dân tỉnh",
    code: "VP_UBND",
    parentName: "Ủy ban Nhân dân tỉnh Đắk Lắk",
    fullPath: "Ủy ban Nhân dân tỉnh Đắk Lắk > Văn phòng Ủy ban Nhân dân tỉnh",
    level: 1,
    isRoot: false,
    parentId: 4,
  },
];

/* -------------------------------------------------------------------------- */
/*  MEMOIZED ROW COMPONENTS (TỐI ƯU KHÔNG RE-RENDER KHI CUỘN PHÂN TRANG)      */
/* -------------------------------------------------------------------------- */

interface OrgGroupRowProps {
  group: {
    root: HierarchicalOrgUnit;
    showRoot: boolean;
    children: HierarchicalOrgUnit[];
  };
  selectedId: string;
  onSelect: (id: string) => void;
}

const OrgGroupRow = memo(function OrgGroupRow({
  group,
  selectedId,
  onSelect,
}: OrgGroupRowProps) {
  const isRootSelected = selectedId === group.root.id;

  return (
    <div className="py-1">
      {/* Cơ quan Cấp trên (Root Unit) */}
      {group.showRoot && (
        <div
          onClick={() => onSelect(group.root.id)}
          className={cn(
            "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
            isRootSelected
              ? "bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs font-semibold"
              : "hover:bg-slate-100/80 text-slate-900"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold truncate">
                  {group.root.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 h-4 border-emerald-300 text-emerald-700 bg-emerald-50 font-normal shrink-0"
                >
                  Cơ quan cấp tỉnh
                </Badge>
              </div>
              {group.root.code && (
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  Mã: {group.root.code}
                </p>
              )}
            </div>
          </div>

          {isRootSelected && (
            <Check className="w-4 h-4 text-indigo-600 shrink-0 mr-1" />
          )}
        </div>
      )}

      {/* Các Phòng ban Trực thuộc con */}
      {group.children.length > 0 && (
        <div className="mt-0.5 space-y-0.5 pl-4 sm:pl-6 border-l-2 border-indigo-100/70 ml-3.5 my-1">
          {group.children.map((child) => {
            const isChildSelected = selectedId === child.id;

            return (
              <div
                key={child.id}
                onClick={() => onSelect(child.id)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                  isChildSelected
                    ? "bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs font-semibold"
                    : "hover:bg-slate-50 text-slate-800"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium truncate">
                        {child.name}
                      </span>
                      {child.code && (
                        <span className="text-[9px] font-mono px-1 py-0 bg-slate-100 text-slate-500 rounded shrink-0">
                          {child.code}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {child.fullPath}
                    </p>
                  </div>
                </div>

                {isChildSelected && (
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mr-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

interface UserRowProps {
  user: {
    id: string;
    name: string;
    sub: string;
    code: string;
    departmentName: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const UserRow = memo(function UserRow({ user, isSelected, onSelect }: UserRowProps) {
  return (
    <div
      onClick={() => onSelect(user.id)}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
        isSelected
          ? "bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs font-semibold"
          : "hover:bg-slate-50 text-slate-800"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">{user.name}</span>
            {user.code && (
              <span className="text-[10px] font-mono text-slate-400">
                ({user.code})
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 truncate">{user.sub}</p>
        </div>
      </div>
      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 mr-1" />}
    </div>
  );
});

interface RoleRowProps {
  role: {
    id: string;
    name: string;
    code: string;
    sub: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const RoleRow = memo(function RoleRow({ role, isSelected, onSelect }: RoleRowProps) {
  return (
    <div
      onClick={() => onSelect(role.id)}
      className={cn(
        "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
        isSelected
          ? "bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs font-semibold"
          : "hover:bg-slate-50 text-slate-800"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold truncate">{role.name}</span>
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 border-amber-200 text-amber-700 bg-amber-50"
            >
              {role.code}
            </Badge>
          </div>
          <p className="text-[10px] text-slate-400 truncate">{role.sub}</p>
        </div>
      </div>
      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 mr-1" />}
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  MAIN EXPORT COMPONENT                                                     */
/* -------------------------------------------------------------------------- */

export const ReportShareModal: React.FC<ReportShareModalProps> = ({
  report,
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState<"direct" | "link" | "audit">("direct");
  const [assigneeType, setAssigneeType] = useState<"UNIT" | "USER" | "ROLE">("UNIT");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [permissionLevel, setPermissionLevel] = useState<ReportPermission>("VIEW");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [linkAccessScope, setLinkAccessScope] = useState<"RESTRICTED" | "ORGANIZATION">("RESTRICTED");
  const [linkExpiry, setLinkExpiry] = useState<string>("NEVER");

  // State Popover chọn đối tượng
  const [isEntitySelectorOpen, setIsEntitySelectorOpen] = useState(false);
  const [orgFilterCategory, setOrgFilterCategory] = useState<"ALL" | "ROOT" | "CHILD">("ALL");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── THUẬT TOÁN CURSOR-BASED CHUNKING / INFINITE SCROLL PHÂN TRANG ──
  // Ban đầu chỉ render 4 đơn vị (nhẹ 0ms lag).
  // Khi người dùng kéo xuống dưới, tự động nạp tiếp 3-5 đơn vị mỗi đợt.
  const INITIAL_CHUNK = 4;
  const STEP_CHUNK = 4;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_CHUNK);

  // useDeferredValue để gõ tìm kiếm không bao giờ giật/đơ
  const deferredSearch = useDeferredValue(searchFilter);

  const reportId = report?.id ?? 0;

  // Lấy danh sách quyền truy cập đã cấp
  const { data: assignments = [], isLoading: isLoadingAssignments } = useGetReportAssignments(
    open && reportId ? reportId : null
  );

  const assignMutation = useAssignReport();
  const removeMutation = useRemoveReportAssignment();

  // Tải dữ liệu Cây tổ chức
  const { data: orgTreeData, isLoading: isLoadingTree } = useQuery({
    queryKey: ["share-modal-organizations-tree"],
    queryFn: () => organizationApi.getTree(),
    enabled: open,
    staleTime: 60000,
  });

  // Tải danh sách đơn vị phẳng để bổ sung đối chiếu
  const { data: orgFlatData } = useQuery({
    queryKey: ["share-modal-organizations-flat"],
    queryFn: () => organizationApi.getOrganizations(),
    enabled: open,
    staleTime: 60000,
  });

  // Tải danh sách cán bộ
  const { data: userData } = useQuery({
    queryKey: ["share-modal-users"],
    queryFn: () => userApi.list({ limit: 150 }),
    enabled: open && assigneeType === "USER",
    staleTime: 60000,
  });

  // Tải danh sách vai trò
  const { data: policyData } = useQuery({
    queryKey: ["share-modal-policies"],
    queryFn: () => policyApi.getPolicys(),
    enabled: open && assigneeType === "ROLE",
    staleTime: 60000,
  });

  // Reset cursor visibleCount khi đổi từ khóa, đổi tab hoặc đóng mở popover
  useEffect(() => {
    setVisibleCount(INITIAL_CHUNK);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [deferredSearch, assigneeType, orgFilterCategory, isEntitySelectorOpen]);

  // Focus ô tìm kiếm khi mở Popover
  useEffect(() => {
    if (isEntitySelectorOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchFilter("");
    }
  }, [isEntitySelectorOpen]);

  // Xử lý danh sách đơn vị phân cấp hoàn chỉnh
  const hierarchicalOrganizations = useMemo(() => {
    const treeList = orgTreeData?.data || orgTreeData || [];
    if (Array.isArray(treeList) && treeList.length > 0) {
      const processed = processTreeNodes(treeList);
      if (processed.length > 0) return processed;
    }

    const flatList = orgFlatData?.data || [];
    if (Array.isArray(flatList) && flatList.length > 0) {
      return flatList.map((item: any) => ({
        id: String(item.id),
        numericId: Number(item.id),
        name: item.name || item.unitName || `Đơn vị #${item.id}`,
        code: item.code || item.shortName || "",
        shortName: item.shortName,
        categoryCode: item.categoryCode,
        parentId: item.parentId != null ? Number(item.parentId) : null,
        parentName: item.parentName || undefined,
        fullPath: item.hierarchyPath || item.name || `Đơn vị #${item.id}`,
        level: item.parentId ? 1 : 0,
        isRoot: !item.parentId,
      }));
    }

    return DAKLAK_GOVT_FALLBACK_TREE;
  }, [orgTreeData, orgFlatData]);

  // Nhóm các đơn vị theo cơ quan cấp trên
  const groupedOrganizations = useMemo(() => {
    const roots = hierarchicalOrganizations.filter((o) => o.isRoot);
    const groups: Array<{
      root: HierarchicalOrgUnit;
      children: HierarchicalOrgUnit[];
    }> = [];

    roots.forEach((root) => {
      const children = hierarchicalOrganizations.filter(
        (c) => c.parentId === root.numericId
      );
      groups.push({ root, children });
    });

    const knownIds = new Set(hierarchicalOrganizations.map((o) => o.numericId));
    const orphans = hierarchicalOrganizations.filter(
      (c) => !c.isRoot && (!c.parentId || !knownIds.has(c.parentId))
    );
    if (orphans.length > 0) {
      groups.push({
        root: {
          id: "ORPHAN_GROUP",
          numericId: -1,
          name: "Các đơn vị & phòng ban khác",
          code: "OTHER",
          fullPath: "Các đơn vị & phòng ban khác",
          level: 0,
          isRoot: true,
          parentId: null,
        },
        children: orphans,
      });
    }

    return groups;
  }, [hierarchicalOrganizations]);

  // Danh sách cán bộ chuẩn hóa
  const userOptions = useMemo(() => {
    const list = userData?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((u: any) => ({
        id: String(u.id),
        name: u.fullName || u.username || `Cán bộ #${u.id}`,
        sub: u.email || (u.employeeCode ? `Mã: ${u.employeeCode}` : "") || "Cán bộ công chức",
        code: u.employeeCode || "",
        departmentName: u.department?.name || u.unitName || "",
      }));
    }
    return [
      { id: "1", name: "Nguyễn Thượng Hải", sub: "Trưởng ban BTCTU • hai.nt@daklak.gov.vn", code: "NV_001", departmentName: "Ban Tổ chức Tỉnh ủy" },
      { id: "2", name: "Lưu Vĩnh Hưng", sub: "Phó Trưởng ban Thường trực • hung.lv@daklak.gov.vn", code: "NV_002", departmentName: "Ban Tổ chức Tỉnh ủy" },
      { id: "3", name: "Trần Thanh Bình", sub: "Chuyên viên Tổng hợp • binh.tt@daklak.gov.vn", code: "NV_003", departmentName: "Phòng Tổ chức - Cán bộ" },
      { id: "4", name: "Lê Minh Tuấn", sub: "Quản trị viên Báo cáo • tuan.lm@daklak.gov.vn", code: "NV_004", departmentName: "Sở Khoa học và Công nghệ" },
    ];
  }, [userData]);

  // Danh sách vai trò chuẩn hóa
  const roleOptions = useMemo(() => {
    const list = policyData || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((p: any) => ({
        id: String(p.id || p.code),
        name: p.name || p.code,
        code: p.code || "",
        sub: p.description || "Nhóm quyền / Vai trò hệ thống",
      }));
    }
    return [
      { id: "LEADERSHIP", name: "Lãnh đạo Ban & Thường trực Tỉnh ủy", code: "ROLE_LEADERSHIP", sub: "Xem toàn bộ báo cáo lãnh đạo & chỉ đạo" },
      { id: "DEPT_HEAD", name: "Trưởng phòng / Phó trưởng phòng", code: "ROLE_DEPT_HEAD", sub: "Xem và tùy biến báo cáo thuộc phòng chuyên môn" },
      { id: "SPECIALIST", name: "Chuyên viên Nghiệp vụ", code: "ROLE_SPECIALIST", sub: "Xem số liệu phục vụ lập kế hoạch và báo cáo" },
      { id: "AUDITOR", name: "Thanh tra & Kiểm tra Giám sát", code: "ROLE_AUDITOR", sub: "Xem báo cáo phục vụ kiểm toán và giám sát quy trình" },
    ];
  }, [policyData]);

  // Đơn vị hoặc đối tượng đang chọn hiện tại
  const selectedEntityDisplay = useMemo(() => {
    if (!selectedEntityId) return null;

    if (assigneeType === "UNIT") {
      const match = hierarchicalOrganizations.find(
        (o) => o.id === selectedEntityId || o.code === selectedEntityId
      );
      if (match) {
        return {
          title: match.name,
          subtitle: match.parentName
            ? `${match.parentName} • Mã: ${match.code || match.id}`
            : match.code
            ? `Mã: ${match.code}`
            : "Cơ quan cấp tỉnh",
          badge: match.isRoot ? "Cơ quan cấp tỉnh" : "Phòng ban trực thuộc",
          isRoot: match.isRoot,
        };
      }
    } else if (assigneeType === "USER") {
      const match = userOptions.find((u) => u.id === selectedEntityId);
      if (match) {
        return {
          title: match.name,
          subtitle: match.departmentName ? `${match.departmentName} • ${match.sub}` : match.sub,
          badge: "Cán bộ",
          isRoot: false,
        };
      }
    } else {
      const match = roleOptions.find((r) => r.id === selectedEntityId || r.code === selectedEntityId);
      if (match) {
        return {
          title: match.name,
          subtitle: `Mã vai trò: ${match.code}`,
          badge: "Vai trò",
          isRoot: false,
        };
      }
    }

    return {
      title: `Đối tượng #${selectedEntityId}`,
      subtitle: "",
      badge: assigneeType,
      isRoot: false,
    };
  }, [selectedEntityId, assigneeType, hierarchicalOrganizations, userOptions, roleOptions]);

  // Lọc đơn vị theo từ khóa
  const filteredGroupedOrganizations = useMemo(() => {
    const q = normalizeText(deferredSearch);

    return groupedOrganizations
      .map((group) => {
        const rootMatches =
          !q ||
          normalizeText(group.root.name).includes(q) ||
          normalizeText(group.root.code).includes(q) ||
          normalizeText(group.root.fullPath).includes(q);

        const filteredChildren = group.children.filter((child) => {
          if (!q) return true;
          return (
            normalizeText(child.name).includes(q) ||
            normalizeText(child.code).includes(q) ||
            normalizeText(child.fullPath).includes(q)
          );
        });

        let passRoot = rootMatches;
        let finalChildren = filteredChildren;

        if (orgFilterCategory === "ROOT") {
          finalChildren = [];
        } else if (orgFilterCategory === "CHILD") {
          passRoot = false;
        }

        if (passRoot || finalChildren.length > 0) {
          return {
            root: group.root,
            showRoot: passRoot,
            children: finalChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{
      root: HierarchicalOrgUnit;
      showRoot: boolean;
      children: HierarchicalOrgUnit[];
    }>;
  }, [groupedOrganizations, deferredSearch, orgFilterCategory]);

  // Lọc cá nhân theo từ khóa
  const filteredUsers = useMemo(() => {
    const q = normalizeText(deferredSearch);
    if (!q) return userOptions;
    return userOptions.filter(
      (u) =>
        normalizeText(u.name).includes(q) ||
        normalizeText(u.sub).includes(q) ||
        normalizeText(u.code).includes(q) ||
        normalizeText(u.departmentName).includes(q)
    );
  }, [userOptions, deferredSearch]);

  // Lọc vai trò theo từ khóa
  const filteredRoles = useMemo(() => {
    const q = normalizeText(deferredSearch);
    if (!q) return roleOptions;
    return roleOptions.filter(
      (r) =>
        normalizeText(r.name).includes(q) ||
        normalizeText(r.code).includes(q) ||
        normalizeText(r.sub).includes(q)
    );
  }, [roleOptions, deferredSearch]);

  // Tổng số lượng item thỏa mãn điều kiện lọc
  const totalAvailableItems = useMemo(() => {
    if (assigneeType === "UNIT") return filteredGroupedOrganizations.length;
    if (assigneeType === "USER") return filteredUsers.length;
    return filteredRoles.length;
  }, [assigneeType, filteredGroupedOrganizations.length, filteredUsers.length, filteredRoles.length]);

  // ── THỰC THI CHUNKING SLICE (CHỈ RENDER TỪNG ĐỢT 3-5 MỤC) ──
  const slicedGroupedOrganizations = useMemo(() => {
    return filteredGroupedOrganizations.slice(0, visibleCount);
  }, [filteredGroupedOrganizations, visibleCount]);

  const slicedUsers = useMemo(() => {
    return filteredUsers.slice(0, visibleCount);
  }, [filteredUsers, visibleCount]);

  const slicedRoles = useMemo(() => {
    return filteredRoles.slice(0, visibleCount);
  }, [filteredRoles, visibleCount]);

  // Handler khi cuộn danh sách: Gần chạm đáy thì nạp thêm 3-5 đơn vị tiếp theo
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 60) {
        setVisibleCount((prev) => {
          if (prev < totalAvailableItems) {
            return Math.min(prev + STEP_CHUNK, totalAvailableItems);
          }
          return prev;
        });
      }
    },
    [totalAvailableItems]
  );

  const handleSelectEntity = useCallback((id: string) => {
    setSelectedEntityId(id);
    setIsEntitySelectorOpen(false);
  }, []);

  // Cấp quyền mới
  const handleAddAssignment = async () => {
    if (!reportId || !selectedEntityId) {
      toast.error("Vui lòng chọn đơn vị hoặc cá nhân cần phân quyền!");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        templateId: reportId,
        assigneeType,
        assigneeId: selectedEntityId,
        permissions: permissionLevel,
      });

      const name = selectedEntityDisplay?.title || selectedEntityId;
      toast.success(`Đã phân quyền thành công cho "${name}"!`);
      setSelectedEntityId("");
      setIsEntitySelectorOpen(false);
    } catch {
      toast.error("Không thể gán quyền báo cáo. Vui lòng kiểm tra lại kết nối!");
    }
  };

  // Thay đổi quyền đã gán
  const handleChangePermission = async (
    targetType: string,
    targetId: string,
    newPerm: ReportPermission
  ) => {
    try {
      await assignMutation.mutateAsync({
        templateId: reportId,
        assigneeType: targetType,
        assigneeId: targetId,
        permissions: newPerm,
      });
      toast.success("Đã cập nhật mức quyền truy cập!");
    } catch {
      toast.error("Không thể cập nhật quyền. Vui lòng thử lại!");
    }
  };

  // Thu hồi quyền
  const handleRemoveAssignment = async (targetType: string, targetId: string, name?: string) => {
    try {
      await removeMutation.mutateAsync({
        templateId: reportId,
        assigneeType: targetType,
        assigneeId: targetId,
      });
      toast.success(`Đã thu hồi quyền truy cập của ${name || targetId}!`);
    } catch {
      toast.error("Không thể thu hồi quyền. Vui lòng thử lại!");
    }
  };

  // Đường dẫn liên kết nội bộ
  const shareableUrl = useMemo(() => {
    if (typeof window === "undefined" || !reportId) return "";
    return `${window.location.origin}/services/reports/${reportId}`;
  }, [reportId]);

  const handleCopyLink = async () => {
    if (!shareableUrl) return;
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      toast.success("Đã sao chép liên kết báo cáo vào bộ nhớ tạm!");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Không thể sao chép liên kết tự động. Hãy sao chép thủ công!");
    }
  };

  // Hiển thị thông tin thực thể trong danh sách đã cấp quyền
  const getEntityDisplay = (type: string, id: string) => {
    if (type === "UNIT") {
      const match = hierarchicalOrganizations.find((o) => o.id === id || o.code === id);
      return {
        icon: <Building2 className="w-4 h-4 text-emerald-600" />,
        name: match?.name || `Đơn vị #${id}`,
        sub: match?.parentName
          ? `${match.parentName} • Mã: ${match.code || id}`
          : match?.code
          ? `Mã: ${match.code}`
          : "Cơ quan cấp tỉnh",
        badge: match?.isRoot ? "Cơ quan cấp tỉnh" : "Phòng ban",
        badgeVariant: "outline" as const,
        badgeClass: "border-emerald-200 text-emerald-700 bg-emerald-50",
      };
    }
    if (type === "USER") {
      const match = userOptions.find((u) => u.id === id);
      return {
        icon: <User className="w-4 h-4 text-indigo-600" />,
        name: match?.name || `Cán bộ #${id}`,
        sub: match?.sub || "Cán bộ công chức",
        badge: "Cán bộ",
        badgeVariant: "outline" as const,
        badgeClass: "border-indigo-200 text-indigo-700 bg-indigo-50",
      };
    }
    const match = roleOptions.find((r) => r.id === id || r.code === id);
    return {
      icon: <Shield className="w-4 h-4 text-amber-600" />,
      name: match?.name || `Vai trò: ${id}`,
      sub: match?.code ? `Mã vai trò: ${match.code}` : "Nhóm quyền hệ thống",
      badge: "Vai trò",
      badgeVariant: "outline" as const,
      badgeClass: "border-amber-200 text-amber-700 bg-amber-50",
    };
  };

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case "ADMIN":
        return {
          label: "Toàn quyền quản trị",
          desc: "Sửa cấu hình, phân quyền, xóa",
          icon: <Shield className="w-3.5 h-3.5 text-rose-500 mr-1.5" />,
        };
      case "EDIT":
        return {
          label: "Chỉnh sửa",
          desc: "Tùy biến bộ lọc, sửa biểu đồ",
          icon: <Edit3 className="w-3.5 h-3.5 text-blue-500 mr-1.5" />,
        };
      default:
        return {
          label: "Chỉ xem",
          desc: "Xem bảng biểu & kết quả snapshot",
          icon: <Eye className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />,
        };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl bg-white">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
                <Share2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Chia sẻ Báo cáo & Quản lý Truy cập</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {report?.name || "Báo cáo phân tích dữ liệu"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="secondary" className="font-mono text-[11px] bg-slate-100 text-slate-600">
                {report?.code || `REP_${report?.id}`}
              </Badge>
              <Badge variant="outline" className="text-[11px] border-indigo-200 text-indigo-700 bg-indigo-50 font-normal">
                Nội bộ Tỉnh Đắk Lắk
              </Badge>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full mt-4"
          >
            <TabsList className="grid grid-cols-3 bg-slate-200/70 p-1 rounded-xl h-9">
              <TabsTrigger
                value="direct"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-xs transition-all"
              >
                <User className="w-3.5 h-3.5 mr-1.5" /> Phân quyền trực tiếp
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-xs transition-all"
              >
                <Link2 className="w-3.5 h-3.5 mr-1.5" /> Liên kết nội bộ
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-xs transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Tuân thủ PBAC
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-6">
          {/* TAB 1: DIRECT ACCESS */}
          {activeTab === "direct" && (
            <div className="space-y-6">
              {/* Form Cấp Quyền Phân Cấp Chuẩn Enterprise */}
              <div className="p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cấp quyền truy cập mới</span>
                  </Label>
                  <span className="text-[11px] text-slate-400">Chọn đơn vị theo cây hoặc cán bộ</span>
                </div>

                {/* Hàng 1: Loại đối tượng & Mức quyền */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-6">
                    <Label className="text-[11px] text-slate-500 font-medium mb-1 block">
                      Loại đối tượng
                    </Label>
                    <Select
                      value={assigneeType}
                      onValueChange={(val: "UNIT" | "USER" | "ROLE") => {
                        setAssigneeType(val);
                        setSelectedEntityId("");
                        setSearchFilter("");
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Chọn loại đối tượng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNIT">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-medium">Đơn vị & Phòng ban (Phân cấp)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="USER">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="font-medium">Cá nhân (Cán bộ công chức)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ROLE">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-medium">Vai trò & Chức danh hệ thống</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-6">
                    <Label className="text-[11px] text-slate-500 font-medium mb-1 block">
                      Mức quyền truy cập
                    </Label>
                    <Select
                      value={permissionLevel}
                      onValueChange={(val: ReportPermission) => setPermissionLevel(val)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEW" className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-medium">Chỉ xem</span>
                            <span className="text-[10px] text-slate-400 ml-1">(Xem số liệu, snapshot)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EDIT" className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-medium">Chỉnh sửa</span>
                            <span className="text-[10px] text-slate-400 ml-1">(Tùy biến bộ lọc, biểu đồ)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN" className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-rose-600" />
                            <span className="font-medium">Toàn quyền quản trị</span>
                            <span className="text-[10px] text-slate-400 ml-1">(Cấp quyền & sửa cấu hình)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hàng 2: Bộ chọn Phân cấp Chuyên dụng với Thuật toán Cursor Phân trang */}
                <div>
                  <Label className="text-[11px] text-slate-500 font-medium mb-1 block">
                    {assigneeType === "UNIT"
                      ? "Chọn đơn vị / phòng ban trực thuộc"
                      : assigneeType === "USER"
                      ? "Chọn cán bộ chuyên viên"
                      : "Chọn vai trò"}
                  </Label>

                  <div className="flex items-center gap-2">
                    {/* Popover Trigger Selector */}
                    <Popover open={isEntitySelectorOpen} onOpenChange={setIsEntitySelectorOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isEntitySelectorOpen}
                          className={cn(
                            "flex-1 h-11 justify-between text-left bg-white border-slate-200 hover:bg-slate-50 px-3.5 rounded-xl font-normal shadow-2xs min-w-0",
                            !selectedEntityId && "text-slate-400"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {assigneeType === "UNIT" ? (
                              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : assigneeType === "USER" ? (
                              <User className="w-4 h-4 text-indigo-600 shrink-0" />
                            ) : (
                              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                            )}

                            {selectedEntityDisplay ? (
                              <div className="flex flex-col min-w-0 leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-slate-900 truncate">
                                    {selectedEntityDisplay.title}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 h-4 bg-slate-50 border-slate-200 text-slate-600 font-normal shrink-0"
                                  >
                                    {selectedEntityDisplay.badge}
                                  </Badge>
                                </div>
                                {selectedEntityDisplay.subtitle && (
                                  <span className="text-[10px] text-slate-400 truncate">
                                    {selectedEntityDisplay.subtitle}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs">
                                {assigneeType === "UNIT"
                                  ? "Nhấn để duyệt và chọn theo cây đơn vị..."
                                  : assigneeType === "USER"
                                  ? "Nhấn để tìm kiếm cán bộ theo tên, mã..."
                                  : "Nhấn để chọn vai trò..."}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {selectedEntityId && (
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEntityId("");
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                title="Xóa chọn"
                              >
                                <X className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-slate-400 opacity-60" />
                          </div>
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[520px] max-w-[92vw] p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden bg-white z-50"
                        align="start"
                        sideOffset={6}
                      >
                        {/* Search Input Box */}
                        <div className="p-3 border-b border-slate-100 bg-slate-50/80">
                          <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                              ref={searchInputRef}
                              placeholder={
                                assigneeType === "UNIT"
                                  ? "Tìm theo tên phòng, mã đơn vị, cơ quan cấp trên..."
                                  : assigneeType === "USER"
                                  ? "Tìm theo họ tên, email, mã cán bộ..."
                                  : "Tìm theo tên vai trò..."
                              }
                              value={searchFilter}
                              onChange={(e) => setSearchFilter(e.target.value)}
                              className="pl-9 pr-8 h-9 text-xs bg-white border-slate-200 rounded-lg focus-visible:ring-indigo-500"
                            />
                            {searchFilter && (
                              <button
                                type="button"
                                onClick={() => setSearchFilter("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Bộ lọc nhanh cho Đơn vị */}
                          {assigneeType === "UNIT" && (
                            <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                <Filter className="w-3 h-3" /> Lọc:
                              </span>
                              <button
                                type="button"
                                onClick={() => setOrgFilterCategory("ALL")}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                                  orgFilterCategory === "ALL"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                              >
                                Tất cả ({hierarchicalOrganizations.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setOrgFilterCategory("ROOT")}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                                  orgFilterCategory === "ROOT"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                              >
                                Cơ quan cấp Tỉnh ({groupedOrganizations.length})
                              </button>
                              <button
                                type="button"
                                onClick={() => setOrgFilterCategory("CHILD")}
                                className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                                  orgFilterCategory === "CHILD"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                              >
                                Phòng/Ban trực thuộc
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Danh Sách Lựa Chọn Cuộn Mượt (Cursor Phân Trang Incremental) */}
                        <div
                          ref={scrollContainerRef}
                          onScroll={handleScroll}
                          className="max-h-[340px] overflow-y-auto p-1.5 divide-y divide-slate-100 scroll-smooth"
                        >
                          {/* 1. KHI CHỌN ĐƠN VỊ: HIỂN THỊ CÂY PHÂN CẤP */}
                          {assigneeType === "UNIT" && (
                            isLoadingTree ? (
                              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                                <span>Đang tải cây tổ chức cơ quan...</span>
                              </div>
                            ) : filteredGroupedOrganizations.length === 0 ? (
                              <div className="p-8 text-center text-xs text-slate-400">
                                Không tìm thấy đơn vị phù hợp với từ khóa &ldquo;{searchFilter}&rdquo;
                              </div>
                            ) : (
                              slicedGroupedOrganizations.map((group) => (
                                <OrgGroupRow
                                  key={group.root.id}
                                  group={group}
                                  selectedId={selectedEntityId}
                                  onSelect={handleSelectEntity}
                                />
                              ))
                            )
                          )}

                          {/* 2. KHI CHỌN CÁ NHÂN (USER) */}
                          {assigneeType === "USER" && (
                            filteredUsers.length === 0 ? (
                              <div className="p-8 text-center text-xs text-slate-400">
                                Không tìm thấy cán bộ phù hợp
                              </div>
                            ) : (
                              slicedUsers.map((u) => (
                                <UserRow
                                  key={u.id}
                                  user={u}
                                  isSelected={selectedEntityId === u.id}
                                  onSelect={handleSelectEntity}
                                />
                              ))
                            )
                          )}

                          {/* 3. KHI CHỌN VAI TRÒ (ROLE) */}
                          {assigneeType === "ROLE" && (
                            filteredRoles.length === 0 ? (
                              <div className="p-8 text-center text-xs text-slate-400">
                                Không tìm thấy vai trò phù hợp
                              </div>
                            ) : (
                              slicedRoles.map((r) => (
                                <RoleRow
                                  key={r.id}
                                  role={r}
                                  isSelected={selectedEntityId === r.id}
                                  onSelect={handleSelectEntity}
                                />
                              ))
                            )
                          )}

                          {/* Footer phân trang cursor / infinite scroll */}
                          {visibleCount < totalAvailableItems && (
                            <div className="py-2.5 px-3 text-center bg-slate-50/70 border-t border-slate-100 rounded-lg my-1">
                              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                                <span>
                                  Đang hiển thị {visibleCount} / {totalAvailableItems} đơn vị
                                </span>
                                <span className="text-indigo-500 font-medium">
                                  • Cuộn xuống để xem tiếp...
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Nút Cấp Quyền */}
                    <Button
                      onClick={handleAddAssignment}
                      disabled={assignMutation.isPending || !selectedEntityId}
                      className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5"
                    >
                      {assignMutation.isPending ? (
                        <span>Đang lưu...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Cấp quyền</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Collaborators Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Danh sách đơn vị & cá nhân đang có quyền truy cập</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-600 font-mono">
                      {assignments.length + 1}
                    </Badge>
                  </h4>
                  <span className="text-[11px] text-slate-400">Click vào mức quyền để thay đổi</span>
                </div>

                <div className="border border-slate-200/80 rounded-2xl divide-y divide-slate-100 bg-white overflow-hidden shadow-xs">
                  {/* Chủ sở hữu báo cáo (Always present) */}
                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 font-bold text-xs shadow-2xs">
                        👑
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {report?.ownerId ? `Cán bộ khởi tạo (#${report.ownerId})` : "Ban Tổ chức Tỉnh ủy Đắk Lắk"}
                          </span>
                          <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 font-medium">
                            Chủ sở hữu
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          Đơn vị chủ quản sở hữu dữ liệu báo cáo
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-[11px] border-slate-200 text-slate-700 font-normal">
                        Toàn quyền
                      </Badge>
                    </div>
                  </div>

                  {/* Danh sách đã cấp quyền động */}
                  {isLoadingAssignments ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Đang tải danh sách phân quyền...
                    </div>
                  ) : assignments.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/40">
                      <Lock className="w-5 h-5 mx-auto mb-1.5 text-slate-300" />
                      Chưa có đơn vị hoặc cá nhân nào được gán quyền riêng. Báo cáo hiện chỉ hiển thị với Chủ sở hữu & Quản trị viên.
                    </div>
                  ) : (
                    assignments.map((item, index) => {
                      const display = getEntityDisplay(item.assigneeType, item.assigneeId);
                      const permInfo = getPermissionLabel(item.permissions);

                      return (
                        <div
                          key={`${item.assigneeType}-${item.assigneeId}-${index}`}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                              {display.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {display.name}
                                </span>
                                <Badge
                                  variant={display.badgeVariant}
                                  className={`text-[10px] font-normal ${display.badgeClass}`}
                                >
                                  {display.badge}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                {display.sub}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Permission Selector Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1 border border-slate-200/80 rounded-lg"
                                >
                                  {permInfo.icon}
                                  <span>{permInfo.label}</span>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 text-xs">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangePermission(item.assigneeType, item.assigneeId, "VIEW")
                                  }
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-600 mr-2" />
                                  <div>
                                    <div className="font-medium">Chỉ xem</div>
                                    <div className="text-[10px] text-slate-400">Xem số liệu, biểu đồ</div>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangePermission(item.assigneeType, item.assigneeId, "EDIT")
                                  }
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-600 mr-2" />
                                  <div>
                                    <div className="font-medium">Chỉnh sửa</div>
                                    <div className="text-[10px] text-slate-400">Tùy biến bộ lọc, biểu đồ</div>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleChangePermission(item.assigneeType, item.assigneeId, "ADMIN")
                                  }
                                >
                                  <Shield className="w-3.5 h-3.5 text-rose-600 mr-2" />
                                  <div>
                                    <div className="font-medium">Toàn quyền quản trị</div>
                                    <div className="text-[10px] text-slate-400">Quản lý và cấp quyền tiếp</div>
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                                  onClick={() =>
                                    handleRemoveAssignment(item.assigneeType, item.assigneeId, display.name)
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  <span>Thu hồi quyền</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Quick Revoke Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                              title="Thu hồi quyền"
                              onClick={() =>
                                handleRemoveAssignment(item.assigneeType, item.assigneeId, display.name)
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERNAL LINK SHARING */}
          {activeTab === "link" && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Quyền truy cập qua liên kết nội bộ
                  </h4>
                  <p className="text-xs text-slate-500">
                    Kiểm soát những ai trong mạng nội bộ tỉnh Đắk Lắk có thể xem báo cáo khi có đường dẫn.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLinkAccessScope("RESTRICTED")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      linkAccessScope === "RESTRICTED"
                        ? "border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Lock
                        className={`w-4 h-4 mt-0.5 ${
                          linkAccessScope === "RESTRICTED" ? "text-indigo-600" : "text-slate-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">Hạn chế (Mặc định)</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Chỉ những cán bộ và đơn vị được cấp quyền trực tiếp ở Tab 1 mới có thể mở.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setLinkAccessScope("ORGANIZATION")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      linkAccessScope === "ORGANIZATION"
                        ? "border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Globe
                        className={`w-4 h-4 mt-0.5 ${
                          linkAccessScope === "ORGANIZATION" ? "text-indigo-600" : "text-slate-400"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900">Nội bộ cơ quan</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Bất kỳ ai có tài khoản hợp lệ trong hệ thống cơ quan đều có quyền xem báo cáo.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiry selector */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thời hạn hiệu lực của liên kết:</span>
                  </div>
                  <Select value={linkExpiry} onValueChange={setLinkExpiry}>
                    <SelectTrigger className="w-40 h-8 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEVER" className="text-xs">Không hết hạn</SelectItem>
                      <SelectItem value="30D" className="text-xs">30 ngày</SelectItem>
                      <SelectItem value="90D" className="text-xs">90 ngày</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Link Input & Copy Action */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-700">Đường dẫn báo cáo</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={shareableUrl}
                      className="h-9 text-xs bg-slate-50 font-mono text-slate-600 pr-9 border-slate-200 select-all"
                    />
                    <Link2 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="h-9 px-4 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-xs"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-300" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Sao chép liên kết
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Cán bộ nhận liên kết sẽ được tự động xác thực danh tính qua hệ thống Đăng nhập một cửa (SSO) hoặc VNeID trước khi được phép xem dữ liệu.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT & PBAC COMPLIANCE */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Quy định Bảo vệ Dữ liệu & An toàn Thông tin Số liệu Công vụ</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ; cùng Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân: Mọi thao tác cấp quyền hoặc chia sẻ số liệu cán bộ, quy trình xử lý đều được ghi vết kiểm toán (Audit Trail) vĩnh viễn trên hệ thống.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-4 bg-white space-y-3">
                <h5 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  Thông tin Kiểm toán của Báo cáo này
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mã định danh báo cáo:</span>
                    <span className="font-mono font-medium text-slate-800">{report?.code || `REP_${report?.id}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phiên bản cấu hình:</span>
                    <span className="font-medium text-slate-800">Version {report?.version || 1}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phạm vi dữ liệu (Scope):</span>
                    <span className="font-medium text-slate-800">PBAC Tenant Scope (Đắk Lắk)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ngày tạo lập:</span>
                    <span className="font-medium text-slate-800">
                      {report?.createdAt ? new Date(report.createdAt).toLocaleString("vi-VN") : "Hôm nay"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-xs text-slate-600 border-slate-200 hover:bg-slate-100 h-8 rounded-lg"
          >
            <Link2 className="w-3.5 h-3.5 mr-1.5" /> Sao chép nhanh liên kết
          </Button>

          <Button
            onClick={() => onOpenChange(false)}
            className="text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white h-8 px-5 rounded-lg shadow-xs"
          >
            Hoàn tất & Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
