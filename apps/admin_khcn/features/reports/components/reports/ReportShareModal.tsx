"use client";

import React, { useState, useMemo } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  ExternalLink,
  Search,
  Lock,
  Globe,
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

interface ReportShareModalProps {
  report: ReportDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

  const reportId = report?.id ?? 0;

  // Assignments for this report
  const { data: assignments = [], isLoading: isLoadingAssignments } = useGetReportAssignments(
    open && reportId ? reportId : null
  );

  const assignMutation = useAssignReport();
  const removeMutation = useRemoveReportAssignment();

  // Lazy queries: only fetch when modal is open
  const { data: orgData } = useQuery({
    queryKey: ["share-modal-organizations"],
    queryFn: () => organizationApi.getOrganizations(),
    enabled: open,
    staleTime: 60000,
  });

  const { data: userData } = useQuery({
    queryKey: ["share-modal-users"],
    queryFn: () => userApi.list({ limit: 100 }),
    enabled: open && assigneeType === "USER",
    staleTime: 60000,
  });

  const { data: policyData } = useQuery({
    queryKey: ["share-modal-policies"],
    queryFn: () => policyApi.getPolicys(),
    enabled: open && assigneeType === "ROLE",
    staleTime: 60000,
  });

  // Normalize organization list
  const organizationOptions = useMemo(() => {
    const list = orgData?.data || [];
    if (list.length > 0) {
      return list.map((item: any) => ({
        id: String(item.id),
        name: item.name || item.unitName || `Đơn vị #${item.id}`,
        code: item.code || item.shortName || "",
      }));
    }
    // Standard government fallbacks
    return [
      { id: "1", name: "Ban Tổ chức Tỉnh ủy Đắk Lắk", code: "BTCTU_DAKLAK" },
      { id: "2", name: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk", code: "SKHCN" },
      { id: "3", name: "Văn phòng Tỉnh ủy Đắk Lắk", code: "VPTU" },
      { id: "4", name: "Ủy ban Nhân dân tỉnh Đắk Lắk", code: "UBND" },
      { id: "5", name: "Phòng Quản lý Khoa học", code: "P_QLKH" },
      { id: "6", name: "Phòng Tổ chức - Cán bộ", code: "P_TCCB" },
    ];
  }, [orgData]);

  // Normalize user list
  const userOptions = useMemo(() => {
    const list = userData?.data || [];
    if (list.length > 0) {
      return list.map((u: any) => ({
        id: String(u.id),
        name: u.fullName || u.username || `Cán bộ #${u.id}`,
        sub: u.email || u.employeeCode || u.username || "",
      }));
    }
    return [
      { id: "1", name: "Nguyễn Thượng Hải (Trưởng ban BTCTU)", sub: "hai.nt@daklak.gov.vn" },
      { id: "2", name: "Lưu Vĩnh Hưng (Phó Trưởng ban Thường trực)", sub: "hung.lv@daklak.gov.vn" },
      { id: "3", name: "Trần Thanh Bình (Chuyên viên Tổng hợp)", sub: "binh.tt@daklak.gov.vn" },
      { id: "4", name: "Lê Minh Tuấn (Chuyên viên Quản trị Báo cáo)", sub: "tuan.lm@daklak.gov.vn" },
    ];
  }, [userData]);

  // Normalize roles list
  const roleOptions = useMemo(() => {
    const list = policyData || [];
    if (list.length > 0) {
      return list.map((p: any) => ({
        id: String(p.id || p.code),
        name: p.name || p.code,
        code: p.code || "",
      }));
    }
    return [
      { id: "LEADERSHIP", name: "Lãnh đạo Ban & Thường trực Tỉnh ủy", code: "ROLE_LEADERSHIP" },
      { id: "DEPT_HEAD", name: "Trưởng phòng / Phó trưởng phòng", code: "ROLE_DEPT_HEAD" },
      { id: "SPECIALIST", name: "Chuyên viên Nghiệp vụ", code: "ROLE_SPECIALIST" },
      { id: "AUDITOR", name: "Thanh tra & Kiểm tra Giám sát", code: "ROLE_AUDITOR" },
    ];
  }, [policyData]);

  // Filtered target options based on active search
  const currentOptions = useMemo(() => {
    let raw: Array<{ id: string; name: string; sub?: string; code?: string }> = [];
    if (assigneeType === "UNIT") raw = organizationOptions;
    else if (assigneeType === "USER") raw = userOptions;
    else raw = roleOptions;

    if (!searchFilter.trim()) return raw;
    const q = searchFilter.toLowerCase();
    return raw.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        (opt.sub && opt.sub.toLowerCase().includes(q)) ||
        (opt.code && opt.code.toLowerCase().includes(q))
    );
  }, [assigneeType, organizationOptions, userOptions, roleOptions, searchFilter]);

  // Handle adding a new assignment
  const handleAddAssignment = async () => {
    if (!reportId || !selectedEntityId) {
      toast.error("Vui lòng chọn đối tượng cần phân quyền!");
      return;
    }

    try {
      await assignMutation.mutateAsync({
        templateId: reportId,
        assigneeType,
        assigneeId: selectedEntityId,
        permissions: permissionLevel,
      });

      const entityName =
        currentOptions.find((o) => o.id === selectedEntityId)?.name || selectedEntityId;
      toast.success(`Đã phân quyền thành công cho "${entityName}"!`);
      setSelectedEntityId("");
      setSearchFilter("");
    } catch {
      toast.error("Không thể gán quyền báo cáo. Vui lòng thử lại!");
    }
  };

  // Handle changing permission level for existing assignment
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

  // Handle removing assignment
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

  // Report shareable URL
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

  const getEntityDisplay = (type: string, id: string) => {
    if (type === "UNIT") {
      const match = organizationOptions.find((o) => o.id === id || o.code === id);
      return {
        icon: <Building2 className="w-4 h-4 text-emerald-600" />,
        name: match?.name || `Đơn vị #${id}`,
        sub: match?.code ? `Mã: ${match.code}` : "Phòng ban / Đơn vị trực thuộc",
        badge: "Đơn vị",
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
      sub: match?.code || "Nhóm quyền / Vai trò hệ thống",
      badge: "Vai trò",
      badgeVariant: "outline" as const,
      badgeClass: "border-amber-200 text-amber-700 bg-amber-50",
    };
  };

  const getPermissionLabel = (perm: string) => {
    switch (perm) {
      case "ADMIN":
        return { label: "Toàn quyền quản trị", desc: "Sửa cấu hình, phân quyền, xóa", icon: <Shield className="w-3.5 h-3.5 text-rose-500 mr-1.5" /> };
      case "EDIT":
        return { label: "Chỉnh sửa", desc: "Tùy biến bộ lọc, sửa biểu đồ", icon: <Edit3 className="w-3.5 h-3.5 text-blue-500 mr-1.5" /> };
      default:
        return { label: "Chỉ xem", desc: "Xem bảng biểu & kết quả snapshot", icon: <Eye className="w-3.5 h-3.5 text-emerald-500 mr-1.5" /> };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl bg-white">
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
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* TAB 1: DIRECT ACCESS */}
          {activeTab === "direct" && (
            <div className="space-y-6">
              {/* Add New Collaborator Form */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Thêm đơn vị hoặc cá nhân được cấp quyền
                  </Label>
                  <span className="text-[11px] text-slate-400">Chọn loại đối tượng & mức quyền</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                  {/* Select Assignee Type */}
                  <div className="md:col-span-3">
                    <Select
                      value={assigneeType}
                      onValueChange={(val: "UNIT" | "USER" | "ROLE") => {
                        setAssigneeType(val);
                        setSelectedEntityId("");
                        setSearchFilter("");
                      }}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                        <SelectValue placeholder="Loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNIT">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đơn vị</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="USER">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Cá nhân</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ROLE">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            <span>Vai trò</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Specific Target Entity */}
                  <div className="md:col-span-5">
                    <Select
                      value={selectedEntityId}
                      onValueChange={setSelectedEntityId}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200 truncate">
                        <SelectValue
                          placeholder={
                            assigneeType === "UNIT"
                              ? "Chọn phòng ban/đơn vị..."
                              : assigneeType === "USER"
                              ? "Chọn cán bộ/chuyên viên..."
                              : "Chọn vai trò/nhóm quyền..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <div className="px-2 py-1.5 border-b border-slate-100">
                          <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-md">
                            <Search className="w-3.5 h-3.5 text-slate-400" />
                            <input
                              className="w-full text-xs bg-transparent outline-none placeholder:text-slate-400"
                              placeholder="Tìm kiếm nhanh..."
                              value={searchFilter}
                              onChange={(e) => setSearchFilter(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        {currentOptions.length === 0 ? (
                          <div className="p-3 text-xs text-center text-slate-400">
                            Không tìm thấy kết quả phù hợp
                          </div>
                        ) : (
                          currentOptions.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id} className="text-xs">
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-slate-800 truncate">{opt.name}</span>
                                {opt.sub && (
                                  <span className="text-[10px] text-slate-400 truncate">{opt.sub}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select Permission Level */}
                  <div className="md:col-span-2">
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
                            <span>Chỉ xem</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EDIT" className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Chỉnh sửa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN" className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-rose-600" />
                            <span>Quản trị</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add Button */}
                  <div className="md:col-span-2">
                    <Button
                      onClick={handleAddAssignment}
                      disabled={assignMutation.isPending || !selectedEntityId}
                      className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs"
                    >
                      {assignMutation.isPending ? "Đang lưu..." : "Cấp quyền"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Collaborators Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Người & đơn vị có quyền truy cập</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-600">
                      {assignments.length + 1}
                    </Badge>
                  </h4>
                  <span className="text-[11px] text-slate-400">Click vào quyền để thay đổi</span>
                </div>

                <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 bg-white overflow-hidden shadow-xs">
                  {/* Report Owner Record (Always present) */}
                  <div className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 font-bold text-xs">
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

                  {/* Dynamic Assigned Collaborators */}
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
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
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
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4">
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

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
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
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>Quy định Bảo vệ Dữ liệu & An toàn Thông tin Số liệu Công vụ</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Căn cứ Quy định số 348-QĐ/BTCTW của Ban Tổ chức Trung ương về quy chế kết nối, chia sẻ dữ liệu và kiểm tra nghiệp vụ; cùng Nghị định số 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân: Mọi thao tác cấp quyền hoặc chia sẻ số liệu cán bộ, quy trình xử lý đều được ghi vết kiểm toán (Audit Trail) vĩnh viễn trên hệ thống.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-xl p-4 bg-white space-y-3">
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
            className="text-xs text-slate-600 border-slate-200 hover:bg-slate-100 h-8"
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
