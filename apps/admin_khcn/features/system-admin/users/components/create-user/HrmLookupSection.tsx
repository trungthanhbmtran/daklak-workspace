import { useMemo, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Building2, UserCheck, Search, BadgeCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDescription } from "@/components/ui/form";
import { organizationApi } from "@/features/system-admin/organization/api";
import {
  useHrmEmployeesSearch,
  type HrmEmployee,
} from "@/features/hrm";

function flattenUnitNodes(nodes: any[], acc: { id: number; name: string }[] = []): { id: number; name: string }[] {
  for (const n of nodes || []) {
    acc.push({ id: n.id, name: n.name ?? "" });
    flattenUnitNodes(n.children ?? [], acc);
  }
  return acc;
}

interface Props {
  isOpen: boolean;
}

export function HrmLookupSection({ isOpen }: Props) {
  const { setValue, getValues } = useFormContext();
  const [hrmKeyword, setHrmKeyword] = useState("");
  const [selectedHrmEmp, setSelectedHrmEmp] = useState<HrmEmployee | null>(null);

  const { data: hrmEmployees = [], isLoading: hrmSearching, isFetching: hrmFetching } = useHrmEmployeesSearch(
    hrmKeyword,
    { enabled: isOpen, minChars: 2 }
  );

  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
    enabled: isOpen,
  });

  const { data: jobTitlesRes } = useQuery({
    queryKey: ["organizations", "job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
    enabled: isOpen,
  });

  const unitNameMap = useMemo(() => {
    const m = new Map<number, string>();
    if (!Array.isArray(treeNodes)) return m;
    flattenUnitNodes(treeNodes).forEach((u) => m.set(u.id, u.name));
    return m;
  }, [treeNodes]);

  const jobTitleNameMap = useMemo(() => {
    const m = new Map<number, string>();
    (jobTitlesRes?.data ?? []).forEach((j: { id: number; name: string }) => m.set(j.id, j.name));
    return m;
  }, [jobTitlesRes]);

  const getUnitName = (emp: HrmEmployee) =>
    emp.department?.name || (emp.departmentId != null ? unitNameMap.get(emp.departmentId) : null) || "";
    
  const getJobTitleName = (emp: HrmEmployee) => {
    const parts: string[] = [];

    const govt = emp.jobTitle?.name || (emp.jobTitleId != null ? jobTitleNameMap.get(emp.jobTitleId) : null);
    if (govt) parts.push(govt);

    const rank = emp.civilServantRank?.name || (emp.civilServantRankId != null ? jobTitleNameMap.get(emp.civilServantRankId) : null);
    if (rank && rank !== govt) parts.push(rank);

    const party = emp.partyTitle?.name || (emp.partyTitleId != null ? jobTitleNameMap.get(emp.partyTitleId) : null);
    if (party) parts.push(party);

    return parts.length > 0 ? parts.join(" - ") : "";
  };

  useEffect(() => {
    if (isOpen) {
      setHrmKeyword("");
      setSelectedHrmEmp(null);
    }
  }, [isOpen]);

  const fillFromHrm = (emp: HrmEmployee) => {
    const fullName = [emp.firstname, emp.lastname].filter(Boolean).join(" ").trim() || undefined;
    setValue("fullName", fullName ?? "");
    setValue("phoneNumber", emp.phone ?? "");
    setValue("email", emp.email || getValues("email"));
    setValue("cccd", emp.identityCard ?? "");
    setValue("employeeCode", emp.employeeCode ?? "");

    if (!getValues("username") && emp.employeeCode) {
      setValue("username", emp.employeeCode);
    }

    setSelectedHrmEmp(emp);
  };

  const handleClearHrmSelection = () => {
    setSelectedHrmEmp(null);
    setHrmKeyword("");
    setValue("cccd", "");
    setValue("employeeCode", "");
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">1. Liên kết hồ sơ nhân sự (HRM)</h3>
        </div>
      </div>

      {selectedHrmEmp ? (
        <div className="relative p-4 rounded-lg border-2 border-primary/40 bg-primary/5 flex items-start gap-4 transition-all">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h4 className="font-semibold text-primary truncate">
              {[selectedHrmEmp.firstname, selectedHrmEmp.lastname].filter(Boolean).join(" ")}
            </h4>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {selectedHrmEmp.identityCard && <span>CCCD: <strong className="font-mono text-foreground">{selectedHrmEmp.identityCard}</strong></span>}
              {selectedHrmEmp.employeeCode && <span>Mã NV: <strong className="font-mono text-foreground">{selectedHrmEmp.employeeCode}</strong></span>}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {getUnitName(selectedHrmEmp)} {getJobTitleName(selectedHrmEmp) && `- ${getJobTitleName(selectedHrmEmp)}`}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearHrmSelection}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 px-2"
            title="Hủy chọn nhân sự này"
          >
            <X className="h-4 w-4 mr-1" /> Bỏ chọn
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <FormDescription className="text-xs">
            Tra cứu cán bộ để tự động điền thông tin (CCCD, Mã số, Email...). Bỏ qua bước này nếu là người dùng ngoài hệ thống.
          </FormDescription>
          <div className="flex gap-2">
            <Input
              placeholder="Nhập tên, CCCD hoặc mã số điện tử..."
              value={hrmKeyword}
              onChange={(e) => setHrmKeyword(e.target.value)}
              className="flex-1 bg-muted/20"
            />
            <Button type="button" variant="secondary" disabled={hrmKeyword.trim().length < 2 || hrmFetching}>
              {(hrmSearching || hrmFetching) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 sm:mr-2" />}
              <span className="hidden sm:inline">Tìm kiếm</span>
            </Button>
          </div>

          {hrmKeyword.trim().length >= 2 && hrmEmployees.length > 0 && (
            <div className="rounded-md border bg-card max-h-[220px] overflow-y-auto shadow-md">
              {hrmEmployees.map((emp: HrmEmployee) => (
                <Button
                  key={emp.id}
                  type="button"
                  onClick={() => fillFromHrm(emp)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-primary/5 border-b last:border-b-0 transition-colors group"
                >
                  <BadgeCheck className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {[emp.firstname, emp.lastname].filter(Boolean).join(" ")}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>CCCD: <strong className="font-medium text-foreground/80">{emp.identityCard || "—"}</strong></span>
                      <span>Mã: <strong className="font-medium text-foreground/80">{emp.employeeCode || "—"}</strong></span>
                      {getUnitName(emp) && <span>Phòng ban: <strong className="font-medium text-foreground/80">{getUnitName(emp)}</strong></span>}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
